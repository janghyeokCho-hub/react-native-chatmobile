import * as db from '@/lib/appData/connector';
import * as LoginInfo from '@/lib/class/LoginInfo';
import * as NotReadList from '@/lib/class/NotReadList';
import * as RoomList from '@/lib/class/RoomList';

import { managesvr, chatsvr } from '@API/api';
import { setPresenceTargetUser } from '@API/presence';
import { spliceInsert } from '@/lib/appData/util';
import { getContactList } from '../api/contact';
import { SEARCHVIEW_OPTIONS } from '@/components/common/search/searchView.constant';

const splitCnt = 50;

export const login = async param => {
  const where = `id = '${param.id}'`;

  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  const syncFN = new Promise((resolve, reject) => {
    dbCon.transaction(transaction => {
      db.tx(transaction, 'access')
        .select()
        .where(where)
        .execute((tx, result) => {
          if (result.rows.length == 0) {
            db.tx(tx, 'access')
              .insert({
                id: param.id,
                token: param.token,
                registDate: param.createDate,
                userinfo: JSON.stringify(param.userInfo),
              })
              .execute();
          } else {
            db.tx(tx, 'access')
              .update({
                token: param.token,
                registDate: param.createDate,
                userinfo: JSON.stringify(param.userInfo),
              })
              .where(where)
              .execute();
          }

          resolve(true);
        });
    });
  });

  await syncFN;
};

export const getLoginInfo = async id => {
  const dbCon = await db.getConnection(id);

  const loginInfo = await new Promise((resolve, reject) => {
    dbCon.transaction(tx => {
      db.tx(tx, 'access')
        .select(['*'])
        .where(`id = '${id}'`)
        .execute((tx, result) => {
          const raw = result.rows.raw();

          let returnObj = {};

          if (raw.length > 0) {
            returnObj = {
              status: 'SUCCESS',
              token: raw[0].token,
              registDate: raw[0].registDate,
              userInfo: JSON.parse(raw[0].userinfo),
            };
          } else {
            returnObj.status = 'FAIL';
          }

          resolve(returnObj);
        });
    });
  });

  return loginInfo;
};

export const initSyncAppData = async args => {
  const inistSyncFN = new Promise.all([
    login(args),
    syncMyDeptMember(), // ??? ?????? ?????? ????????? ????????????
    syncUsers(), // ????????? ?????? ????????????
  ]);
  await inistSyncFN;

  return true;
};

export const syncAppData = async param => {
  const syncFN = new Promise.all([
    syncPresence(param),
    syncRooms(), // ????????? ?????? ????????????
  ]);
  return await syncFN;
};

const syncMyDeptMember = async () => {
  const loginInfo = LoginInfo.getLoginInfo();
  const deptCode = loginInfo.getData().userInfo.DeptCode;
  const response = await managesvr(
    'get',
    `/sync/mydeptMember?DeptCode=${deptCode}`,
  );

  if (response.data.status == 'SUCCESS') {
    const result = response.data.result;
    const dbCon = await db.getConnection(loginInfo.getID());

    const syncFN = new Promise((resolve, reject) => {
      dbCon.transaction(async transaction => {
        db.tx(transaction, 'mydept_member')
          .delete()
          .execute();
        db.tx(transaction, 'mydept_member')
          .insert(result)
          .execute();
        resolve(true);
      });
    });

    await syncFN;
  }
};

const syncPresence = async param => {
  if (param && param.userList && param.userList.length > 0) {
    const response = await chatsvr('post', '/presence/sync', param);

    if (response.data.status == 'SUCCESS' && response.data.result.length > 0) {
      const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

      const presenceList = response.data.result;
      const updatedList = [];
      return new Promise((resolve, reject) => {
        dbCon.transaction(
          tx => {
            presenceList.forEach(item => {
              db.tx(tx, 'users')
                .update({
                  presence: item.state,
                })
                .where(`id = '${item.userId}' AND presence != '${item.state}'`)
                .execute((_, result) => {
                  if (result?.rowsAffected !== 0) {
                    // Actual-update??? ????????? ?????? ????????? updatedList??? ??????
                    updatedList.push(item);
                  }
                });
            });
          },
          e => {},
          tx => {
            if (updatedList.length > 0) {
              /**
               * 2021.10.27
               *
               * background > foreground ????????? presence sync ????????????
               * presence update??? ????????? ????????? ???????????? presence ????????? ????????? ???????????? ?????? ??????
               * Problem solve: ?????? ?????? ??????(updatedList)??? ?????? presence target?????? ???????????? ?????? ??????
               */
              setPresenceTargetUser(
                updatedList.map(item => ({ type: 'add', userId: item.userId })),
              );
            }
            // { userId, state, type: null }
            resolve(updatedList);
          },
        );
      });
    }
  }
};

const syncRooms = async () => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  const checkFN = new Promise((resolve, reject) => {
    dbCon.transaction(transaction => {
      db.tx(transaction, 'sync_date')
        .select(['roomSyncDate'])
        .execute(
          (tx, result) => {
            if (result.rows.length > 0) {
              const temp = result.rows.item(0).roomSyncDate;
              resolve(temp ? temp : 0);
            } else {
              resolve(0);
            }
          },
          e => {
            reject();
          },
        );
    });
  });

  const syncDate = await checkFN;

  let response = await managesvr('get', `/sync/room?syncDate=${syncDate}`);

  if (response.data.status == 'SUCCESS' && response.data.result.updateDate) {
    const dbRoomIds = await new Promise((resolve, reject) => {
      dbCon.transaction(tx => {
        db.tx(tx, 'room')
          .select(['roomId'])
          .execute((tx, result) => {
            const raw = result.rows.raw();

            if (raw.length > 0) {
              let tempObj = raw.reduce((acc, curr) => {
                acc[curr.roomId] = true;
                return acc;
              }, {});

              resolve(tempObj);
            } else {
              resolve({});
            }
          });
      });
    });
    const dbMembers = await new Promise((resolve, reject) => {
      dbCon.transaction(tx => {
        db.tx(tx, 'room_member')
          .select(['*'])
          .execute((tx, result) => {
            const raw = result.rows.raw();

            if (raw.length > 0) {
              let tempObj = raw.reduce((acc, curr) => {
                if (!acc[curr.roomId]) acc[curr.roomId] = {};
                acc[curr.roomId][curr.userId] = true;
                return acc;
              }, {});

              resolve(tempObj);
            } else {
              resolve({});
            }
          });
      });
    });

    const data = response.data.result;

    const updateNameFn = [];
    const deleteR = [];
    const deleteM = [];
    const deleteRM = [];

    const insertR = [];
    const insertRM = [];

    let serverMembers = data.room_member.reduce((acc, curr) => {
      acc[curr.roomId] = JSON.parse(curr.members);
      return acc;
    }, {});

    await new Promise((resolve, reject) => {
      dbCon.transaction(tx => {
        data.room.forEach(serverRoom => {
          const roomId = serverRoom.roomId;

          if (dbRoomIds[roomId]) {
            // update name
            updateNameFn.push(
              db
                .tx(tx, 'room')
                .update({
                  roomName: serverRoom.roomName,
                  setting: serverRoom.setting,
                })
                .where(`roomId = ${roomId}`)
                .execute(),
            );

            delete dbRoomIds[roomId];

            // ?????? ?????? ??????
            serverMembers[roomId].forEach(member => {
              if (dbMembers[roomId][member.userId]) {
                delete dbMembers[roomId][member.userId];
              } else {
                insertRM.push(
                  db
                    .tx(tx, 'room_member')
                    .insert(member)
                    .execute(),
                );
              }
            });
            Object.keys(dbMembers[roomId]).forEach(userId => {
              deleteRM.push(
                db
                  .tx(tx, 'room_member')
                  .delete()
                  .where(`roomId = ${roomId} AND userId = '${userId}'`)
                  .execute(),
              );
            });
          } else {
            // insert room
            insertR.push(
              db
                .tx(tx, 'room')
                .insert(serverRoom)
                .execute(),
            );

            insertRM.push(
              db
                .tx(tx, 'room_member')
                .insert(serverMembers[roomId])
                .execute(),
            );
          }
        });

        Object.keys(dbRoomIds).forEach(roomId => {
          // delete room
          deleteR.push(
            db
              .tx(tx, 'room')
              .delete()
              .where(`roomId = ${roomId}`)
              .execute(),
          );

          // delete message
          deleteM.push(
            db
              .tx(tx, 'message')
              .delete()
              .where(`roomId = ${roomId}`)
              .execute(),
          );

          // delete room_member
          deleteRM.push(
            db
              .tx(tx, 'room_member')
              .delete()
              .where(`roomId = ${roomId}`)
              .execute(),
          );
        });

        Promise.all([
          ...updateNameFn,
          ...insertR,
          ...insertRM,
          ...deleteR,
          ...deleteRM,
          ...deleteM,
        ]).then(() => {
          resolve(true);
        });
      });
    });

    await new Promise((resolve, reject) => {
      dbCon.transaction(tx => {
        db.tx(tx, 'sync_date')
          .update({ roomSyncDate: response.data.result.updateDate })
          .execute()
          .then(() => {
            resolve(true);
          });
      });
    });
  }
};

const syncUsers = async () => {
  const response = await managesvr('get', '/sync/users');

  if (response.data.status == 'SUCCESS') {
    const data = response.data.result;

    const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
    const syncFN = new Promise((resolve, reject) => {
      dbCon.transaction(tx => {
        db.tx(tx, 'users')
          .delete()
          .execute();

        spliceInsert(data, resolve, tx, 'users');
      });
    });
    await syncFN;
  }
};

export const logout = () => {
  db.closeConnection();

  return true;
};

export const getRooms = async () => {
  let rooms = [];

  const response = await managesvr('get', '/sync/room/message');

  if (response.data.status == 'SUCCESS') {
    const data = response.data.result;

    const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
    const selectList = await new Promise((resolve, reject) => {
      dbCon.transaction(tx => {
        const selectRooms = db
          .tx(tx)
          .query(
            'SELECT r.roomId as roomID, r.roomName, r.roomType, r.ownerCode, r.targetCode, r.registDate, r.deleteDate, r.updateDate, r.setting, ' +
              '(SELECT COUNT(*) FROM room_member WHERE roomId = r.roomId) as realMemberCnt ' +
              'FROM room as r ' +
              'ORDER BY registDate DESC',
          )
          .execute();
        const selectMembers = db
          .tx(tx)
          .query(
            'SELECT A.* FROM (' +
              'SELECT rm.roomId, u.id, u.name, u.PN, u.LN, u.TN, u.dept, u.presence, u.isMobile, u.photoPath, rm.registDate ' +
              'FROM room_member as rm ' +
              'INNER JOIN room as r ON r.roomId = rm.roomId ' +
              'INNER JOIN users as u ON u.id = rm.userId ' +
              "WHERE r.roomType != 'M' " +
              'UNION ALL ' +
              'SELECT r.roomId, u.id, u.name, u.PN, u.LN, u.TN, u.dept, u.presence, u.isMobile, u.photoPath, null as registDate ' +
              'FROM room as r ' +
              'INNER JOIN users as u ON r.targetCode = u.id ' +
              "WHERE r.roomType = 'M' " +
              'UNION ALL ' +
              'SELECT r.roomId, u.id, u.name, u.PN, u.LN, u.TN, u.dept, u.presence, u.isMobile, u.photoPath, null as registDate ' +
              'FROM room as r ' +
              'INNER JOIN users as u ON r.ownerCode = u.id ' +
              "WHERE r.roomType = 'M') AS A " +
              'ORDER BY A.registDate DESC',
          )
          .execute();
        Promise.all([selectRooms, selectMembers]).then(result => {
          resolve(result);
        });
      });
    });

    let selectRooms = selectList[0][1].rows.raw();
    const selectMembers = selectList[1][1].rows.raw();
    const outdatedRooms = [];
    try {
      for await (const item of data) {
        let room = selectRooms.find(room => room.roomID == item.roomId);
        if (room) {
          room.members = selectMembers.filter(
            member => member.roomId == item.roomId,
          );
          // ????????? ???????????? ???????????? ???????????? ?????? ?????? ??????????????? ??????
          if (item.lastMessageDate === null) {
            try {
              await dbCon.transaction(async tx => {
                const lastMessage = await db
                  .tx(tx)
                  .query(
                    `SELECT m.context, m.fileInfos, m.sendDate FROM message as m WHERE m.roomId = ${
                      item?.roomId
                    } ORDER BY m.sendDate DESC LIMIT 1`,
                  )
                  .execute();
                if (lastMessage?.length > 1) {
                  const message = lastMessage[1].rows.item(0);
                  room.lastMessage = {
                    Message: message?.context || '',
                    File: message?.fileInfos || '',
                  };
                  room.lastMessageDate = message?.sendDate || null;
                  room.unreadCnt = item?.unreadCnt;
                  outdatedRooms.push(room);
                }
              });
            } catch (err) {
              console.log('Get LastMessage Error : ', err);
            }
          } else {
            room.lastMessage = JSON.parse(item.lastMessage);
            room.lastMessageDate = item.lastMessageDate;
            room.unreadCnt = item.unreadCnt;
            rooms.push(room);
          }
        } else {
          //console.log(`reqGetRoom - There is no room, '${item.roomId}'`);
        }
      }
      outdatedRooms.sort((a, b) => b.lastMessageDate - a.lastMessageDate);
      rooms.push(...outdatedRooms);
    } catch (err) {
      console.log('Get Rooms Error : ', err);
    }
  }
  return { rooms };
};

export const getContacts = async () => {
  const loginInfo = LoginInfo.getLoginInfo();
  const DeptCode = loginInfo.getData().userInfo.DeptCode;
  const response = await getContactList({ DeptCode });
  return response.data;
};

export const updatePresence = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    param.forEach(item => {
      db.tx(tx, 'users')
        .update({ presence: item.state })
        .where(`id = '${item.userId}' AND presence != '${item.state}'`)
        .execute();
    });
  });
};

export const addContacts = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  dbCon.transaction(tx => {
    param.result.forEach(item => {
      if (item.folderType == 'F' && item.orgFolderType == 'C') {
        db.tx(tx)
          .query(
            'UPDATE contact_item SET ' +
              `folderID = (SELECT folderId FROM contact_folder WHERE FolderType='${
                item.folderType
              }') ` +
              `WHERE contactTarget='${item.targetId}'`,
          )
          .execute();
      } else if (item.folderType == 'G') {
        db.tx(tx, 'contact_folder')
          .insert({
            folderId: item.folderId,
            groupCode: item.targetId,
            folderName: item.displayName,
            folderType: item.folderType,
            folderSortKey: '0',
            pChat: item.pChat,
            registDate: item.registDate,
          })
          .execute();
      } else {
        db.tx(tx, 'contact_item')
          .insert({
            folderId: item.folderId,
            contactTarget: item.targetId,
            registDate: item.registDate,
          })
          .execute();

        //TODO: insert users table
      }
    });

    db.tx(tx, 'sync_date')
      .update({ contactSyncDate: param.updateDate })
      .execute();
  });
};

export const delContact = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  const delObj = param.result;

  dbCon.transaction(tx => {
    if (delObj.folderType == 'F') {
      db.tx(tx)
        .query(
          'UPDATE contact_item SET ' +
            "folderID = (SELECT folderId FROM contact_folder WHERE FolderType='C') " +
            `WHERE contactTarget='${delObj.contactId}' AND folderId='${
              delObj.folderId
            }' `,
        )
        .execute();
    } else {
      if (delObj.contactId) {
        db.tx(tx, 'contact_item')
          .delete()
          .where(
            `folderId = ${delObj.folderId} AND contactTarget = '${
              delObj.contactId
            }'`,
          )
          .execute();
      } else {
        db.tx(tx, 'contact_folder')
          .delete()
          .where(`folderId = ${delObj.folderId} AND folderType = 'G'`)
          .execute();
      }
    }

    db.tx(tx, 'sync_date')
      .update({ contactSyncDate: param.updateDate })
      .execute();
  });
};

export const addCustomGroup = async addObj => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  let sub = addObj.sub ? JSON.parse(addObj.sub) : [];

  dbCon.transaction(tx => {
    db.tx(tx, 'contact_folder')
      .insert({
        pChat: addObj.pChat,
        registDate: addObj.RegistDate,
        folderName: addObj.folderName,
        folderSortKey: addObj.folderSortKey,
        ownerID: addObj.ownerID,
        folderType: addObj.folderType,
        folderId: addObj.folderID,
      })
      .execute();

    sub.forEach(contact => {
      db.tx(tx, 'contact_item')
        .insert({
          folderId: addObj.folderID,
          contactTarget: contact.id,
          companyCode: contact.companyCode || '',
          contactType: contact.type,
          globalFolder: 'N',
          registDate: addObj.RegistDate,
        })
        .execute();
    });

    db.tx(tx, 'sync_date')
      .update({ contactSyncDate: addObj.RegistDate })
      .execute();
  });
};

export const modifyGroupMember = async modObj => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  let users = modObj.sub ? JSON.parse(modObj.sub) : [];
  let userIds = users.map(user => user.id).join(',');

  dbCon.transaction(tx => {
    /* ?????? ?????? ?????? ?????? ?????? ??? ????????? */
    db.tx(tx, 'contact_item')
      .delete()
      .where(`folderId = ${modObj.folderID}`)
      .execute();

    users.forEach(user => {
      db.tx(tx, 'contact_item')
        .insert({
          folderId: modObj.folderID,
          contactTarget: user.id,
          companyCode: user.companyCode || '',
          contactType: user.type,
          globalFolder: 'N',
          registDate: modObj.RegistDate,
        })
        .execute();
    });

    db.tx(tx, 'sync_date')
      .update({ contactSyncDate: modObj.RegistDate })
      .execute();
  });
};

export const removeCustomGroup = async rmvObj => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  const params = rmvObj.result;

  dbCon.transaction(tx => {
    //????????????
    if (params.contactId || params.companyCode) {
      //????????? ??????/?????? ??????
      const where =
        `folderId = ${params.folderId} ` +
        `AND contactTarget = "${params.contactId}" ` +
        (params.companyCode
          ? ` AND companyCode = "${params.companyCode}" `
          : ``);

      db.tx(tx, 'contact_item')
        .delete()
        .where(where)
        .execute();
    } else {
      db.tx(tx, 'contact_folder')
        .delete()
        .where(`folderId = ${params.folderId}`)
        .execute();
      db.tx(tx, 'contact_item')
        .delete()
        .where(`folderId = ${params.folderId}`)
        .execute();
    }
    db.tx(tx, 'sync_date')
      .update({ contactSyncDate: rmvObj.updateDate })
      .execute();
  });
};

export const modifyCustomGroupName = async modObj => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    db.tx(tx, 'contact_folder')
      .update({ folderName: modObj.displayName })
      .where(`folderId = ${modObj.folderId}`)
      .execute();

    db.tx(tx, 'sync_date')
      .update({ contactSyncDate: modObj.updateDate })
      .execute();
  });
};

export const addRooms = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  let totalRoomId = '';
  param.forEach(item => {
    totalRoomId += `${item.roomID},`;
  });
  totalRoomId = totalRoomId.substring(0, totalRoomId.length - 1);

  const notInRoomIds = await new Promise((resolve, reject) => {
    dbCon.transaction(tx => {
      db.tx(tx, 'room')
        .select(['roomId'])
        .where(`roomId IN (${totalRoomId})`)
        .execute((tx, result) => {
          resolve(result.rows.raw());
        });
    });
  });

  const rooms = param.filter(item => {
    if (!notInRoomIds.find(room => item.roomID == room.roomId)) {
      return item;
    }
  });

  if (rooms.length > 0) {
    let totalUserID = new Set();
    let userInfos = {};

    dbCon.transaction(tx => {
      rooms.forEach(room => {
        db.tx(tx, 'room')
          .insert({
            roomId: room.roomID,
            roomName: room.roomName,
            roomType: room.roomType,
            ownerCode: room.ownerCode,
            targetCode: room.targetCode,
            registDate: room.registDate,
            deleteDate: room.deleteDate,
            updateDate: room.updateDate,
            setting: room.setting,
          })
          .execute();

        room.members.forEach(member => {
          db.tx(tx, 'room_member')
            .insert({
              roomId: room.roomID,
              userId: member.id,
              registDate: member.registDate,
            })
            .execute();

          totalUserID.add(member.id);
          userInfos[member.id] = {
            id: member.id,
            name: member.name,
            dept: member.dept,
            PN: member.PN,
            LN: member.LN,
            TN: member.TN,
            presence: member.presence,
            isMobile: member.isMobile,
            photoPath: member.photoPath,
          };
        });

        let userIdWhere = '';
        totalUserID.forEach(item => {
          userIdWhere += `'${item}',`;
        });
        userIdWhere = userIdWhere.substring(0, userIdWhere.length - 1);

        db.tx(tx, 'users')
          .select(['id'])
          .where(`id IN (${userIdWhere})`)
          .execute((tx_2, result) => {
            const notInUserIds = result.rows.raw();

            totalUserID.forEach(id => {
              if (!notInUserIds.find(user => id == user.id)) {
                db.tx(tx_2, 'users')
                  .insert(userInfos[id])
                  .execute();
              }
            });
          });
      });
    });
  }
};

export const delRoom = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    const where = `roomId = ${param}`;

    db.tx(tx, 'room')
      .delete()
      .where(where)
      .execute();
    db.tx(tx, 'room_member')
      .delete()
      .where(where)
      .execute();
    db.tx(tx, 'message')
      .delete()
      .where(where)
      .execute();
  });
};

export const modifyRoomName = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    db.tx(tx, 'room')
      .update({
        roomName: param.roomName,
      })
      .where(`roomId = ${param.roomId}`)
      .execute();
  });
};

export const modifyRoomSetting = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    db.tx(tx, 'room')
      .update({
        setting: param.setting,
      })
      .where(`roomId = ${param.roomID}`)
      .execute();
  });
};

export const rematchMembers = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    param.members.forEach(item => {
      db.tx(tx, 'room_member')
        .select(['userId'])
        .where(`roomId = ${param.roomId} AND userId = '${item.id}'`)
        .execute((tx_2, result) => {
          if (result.rows.length == 0) {
            db.tx(tx_2, 'room_member')
              .insert({
                roomId: param.roomId,
                userId: item.id,
                registDate: item.registDate,
              })
              .execute();
          } else {
            db.tx(tx_2, 'room_member')
              .update({
                registDate: item.registDate,
              })
              .where(`roomId = ${param.roomId}`)
              .execute();
          }
        });
    });
  });
};

export const addMembers = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    db.tx(tx, 'room')
      .select(['roomId'])
      .where(`roomId = ${param.roomID}`)
      .execute((tx_2, result) => {
        if (result.rows.length > 0) {
          const inviteMember = param.inviteMember;

          inviteMember.forEach(member => {
            db.tx(tx_2, 'users')
              .select(['id'])
              .where(`id = '${member.id}'`)
              .execute((tx_3, result_2) => {
                if (result_2.rows.length == 0) {
                  db.tx(tx_3, 'users')
                    .insert({
                      id: member.id,
                      name: member.name,
                      dept: member.dept,
                      PN: member.PN,
                      LN: member.LN,
                      TN: member.TN,
                      presence: member.presence,
                      isMobile: member.isMobile,
                      photoPath: member.photoPath,
                    })
                    .execute();
                }
                db.tx(tx_3, 'room_member')
                  .insert({
                    roomId: param.roomID,
                    userId: member.id,
                    registDate: member.registDate,
                  })
                  .execute();
              });
          });
        }
      });
  });
};

export const delMember = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    db.tx(tx, 'room_member')
      .delete()
      .where(`roomId = ${param.roomID} AND userId = ${param.leaveMember}`)
      .execute();
  });
};

export const delTargetUser = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    db.tx(tx, 'room_member')
      .delete()
      .where(`roomId = ${param.roomID} AND userId = ${param.leaveMember}`)
      .execute();
  });
};

export const getRoomInfo = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  const roomId = param.roomId;
  let room = {};
  let messages = [];

  const selectList = await new Promise((resolve, reject) => {
    dbCon.transaction(tx => {
      db.tx(tx)
        .query(
          'SELECT r.roomId as roomID, r.roomName, r.roomType, r.ownerCode, r.targetCode, r.registDate, r.deleteDate, r.updateDate, r.setting, ' +
            '(SELECT COUNT(*) FROM room_member WHERE roomId = r.roomId) as realMemberCnt, r.reserved ' +
            'FROM room as r ' +
            `WHERE roomId = ${roomId}`,
        )
        .execute((tx_2, result) => {
          if (result.rows.length == 0) {
            chatsvr('get', `/room/${roomId}`).then(response => {
              room = response.data.room;
              messages = response.data.messages;

              resolve(false);
            });
          } else {
            room = result.rows.raw()[0];

            const selectMembers = db
              .tx(tx_2)
              .query(
                'SELECT A.* FROM (' +
                  'SELECT rm.roomId, u.id, u.name, u.PN, u.LN, u.TN, u.dept, u.presence, u.isMobile, u.photoPath, rm.registDate ' +
                  'FROM room_member as rm ' +
                  'INNER JOIN room as r ON r.roomId = rm.roomId ' +
                  'INNER JOIN users as u ON u.id = rm.userId ' +
                  "WHERE r.roomType != 'M' " +
                  `AND rm.roomId = ${roomId} ` +
                  'UNION ALL ' +
                  'SELECT r.roomId, u.id, u.name, u.PN, u.LN, u.TN, u.dept, u.presence, u.isMobile, u.photoPath, rm.registDate ' +
                  'FROM room as r ' +
                  'INNER JOIN users as u ON r.targetCode = u.id ' +
                  'LEFT JOIN room_member as rm ON r.targetCode = rm.userId AND r.roomId = rm.roomId ' +
                  "WHERE r.roomType = 'M' " +
                  `AND r.roomId = ${roomId} ` +
                  'UNION ALL ' +
                  'SELECT r.roomId, u.id, u.name, u.PN, u.LN, u.TN, u.dept, u.presence, u.isMobile, u.photoPath, rm.registDate ' +
                  'FROM room as r ' +
                  'INNER JOIN users as u ON r.ownerCode = u.id ' +
                  'LEFT JOIN room_member as rm ON r.ownerCode = rm.userId AND r.roomId = rm.roomId ' +
                  "WHERE r.roomType = 'M' " +
                  `AND r.roomId = ${roomId}) AS A ` +
                  'ORDER BY A.registDate DESC',
              )
              .execute();

            const maxCnt = 50;

            const selectMessages = db
              .tx(tx_2)
              .query(
                'SELECT m.messageId AS messageID, m.context, m.sender, m.sendDate, m.roomId AS roomID, m.roomType, m.receiver, m.messageType, m.unreadCnt, m.readYN, m.isMine, m.tempId, m.fileInfos, m.replyID, m.replyInfo,' +
                  (room.roomType == 'A'
                    ? `(SELECT 
                      '{"name":"' || name || '"
                      ,"PN":"' || PN || '"
                      ,"LN":"' || LN || '"
                      ,"TN":"' || TN || '"
                      ,"photoPath":"' || ifnull(photoPath, '') || '"
                      ,"presence":"' || ifnull(presence, '') || '"
                      ,"isMobile":"' || isMobile || '"}' 
                      FROM users 
                      WHERE id = m.sender) AS senderInfo`
                    : 'm.senderInfo') +
                  ', m.linkInfo ' +
                  'FROM message as m ' +
                  `WHERE roomId = ${roomId} ` +
                  'ORDER BY m.messageId ' +
                  `LIMIT ${maxCnt} ` +
                  `OFFSET (SELECT CASE WHEN A.cnt - ${maxCnt} < 0 THEN 0 ELSE A.cnt - ${maxCnt} END FROM (SELECT count(*) as cnt FROM message WHERE roomId = ${roomId}) A)`,
              )
              .execute();

            Promise.all([selectMembers, selectMessages]).then(result => {
              resolve([room, ...result]);
            });
          }
        });
    });
  });

  if (selectList) {
    room = selectList[0];
    room.members = selectList[1][1].rows.raw();
    messages = selectList[2][1].rows.raw();
  }

  return { room, messages };
};

export const getMessages = async param => {
  let messages = [];
  const returnObj = {};

  try {
    if (param.dist === 'CENTER') {
      messages = await getBetweenMessages(param);
    } else {
      messages = await getOtherMessages(param);
    }

    returnObj.status = 'SUCCESS';
    returnObj.result = messages;
  } catch (e) {
    returnObj.status = 'FAIL';
    console.log(e.stack);
  }
  return { data: returnObj };
};

export const getAllMessages = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  const messages = await new Promise((resolve, reject) => {
    const commonQuery =
      'SELECT messageId AS messageID, context, sender, sendDate, roomId AS roomID, roomType, receiver, messageType, unreadCnt, readYN, isMine, tempId, fileInfos, senderInfo, linkInfo, replyID, replyInfo, ' +
      'FROM message as m ' +
      `WHERE roomId = ${param.roomID}`;

    dbCon.transaction(tx => {
      db.tx(tx)
        .query(`SELECT * FROM (${commonQuery}) AS a ORDER BY a.messageId`)
        .execute((tx, result) => {
          resolve(result.rows.raw());
        });
    });
  });

  return messages;
};
export const selectBetweenMessagesByIDs = async params => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  const messages = await new Promise((resolve, reject) => {
    const subQuery = `
      SELECT messageId AS messageID, context, sender, sendDate, roomId AS roomID, roomType, receiver, messageType, unreadCnt, readYN, isMine, tempId, fileInfos, senderInfo, linkInfo, replyID, replyInfo
      FROM message as m 
      WHERE roomId = ${params.roomID}`;

    dbCon.transaction(tx => {
      db.tx(tx)
        .query(
          `SELECT * FROM (
          SELECT * FROM (
            SELECT * FROM (
              ${subQuery}
            ) AS a
            WHERE a.messageId <= ${params.startId}
            ORDER BY a.messageId DESC
            LIMIT ${params.count} OFFSET 0
          ) AS before
          UNION ALL
          SELECT * FROM (
            SELECT * FROM (
              ${subQuery}
            ) AS a
            WHERE a.messageId > ${params.startId}
            ORDER BY a.messageId DESC
            LIMIT ${params.count} OFFSET 0
          ) AS after
        ) A
        ORDER by A.messageId`,
        )
        .execute((tx, result) => {
          resolve(result.rows.raw());
        });
    });
  });

  return messages;
};

export const getBetweenMessages = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  const count = Math.round(param.loadCnt / 2);

  const messages = await new Promise((resolve, reject) => {
    const commonQuery =
      'SELECT messageId AS messageID, context, sender, sendDate, roomId AS roomID, roomType, receiver, messageType, unreadCnt, readYN, isMine, tempId, fileInfos, senderInfo, linkInfo, replyID, replyInfo ' +
      'FROM message as m ' +
      `WHERE roomId = ${param.roomID}`;

    dbCon.transaction(tx => {
      db.tx(tx)
        .query(
          'SELECT * FROM (' +
            'SELECT * FROM (' +
            ` SELECT * FROM (${commonQuery}) as a ` +
            ` WHERE a.messageId <= ${param.startId} ` +
            ' ORDER BY a.messageId DESC ' +
            ` LIMIT ${count} OFFSET 0 ` +
            ') as before ' +
            'UNION ALL ' +
            'SELECT * FROM (' +
            ` SELECT * FROM (${commonQuery}) as a ` +
            ` WHERE a.messageId > ${param.startId} ` +
            ' ORDER BY a.messageID ' +
            ` LIMIT ${count} OFFSET 0 ` +
            ') as after ' +
            ') A ' +
            'ORDER BY a.messageId',
        )
        .execute((tx, result) => {
          resolve(result.rows.raw());
        });
    });
  });

  return messages;
};

const getOtherMessages = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  const messages = await new Promise((resolve, reject) => {
    let andWhere = '';
    if (param.dist === 'BEFORE') {
      andWhere = param.startId
        ? `AND messageId > ${param.startId}`
        : '' + ' ORDER BY messageId ';
    } else {
      andWhere = param.startId
        ? `AND messageId < ${param.startId} ORDER BY messageId DESC`
        : '' + ' ORDER BY messageId DESC';
    }

    dbCon.transaction(tx => {
      db.tx(tx)
        .query(
          'SELECT * FROM (' +
            'SELECT * FROM (' +
            ' SELECT messageId AS messageID, context, sender, sendDate, roomId AS roomID, roomType, receiver, messageType, unreadCnt, readYN, isMine, tempId, fileInfos, replyID, replyInfo,' +
            (param.isNotice
              ? `(SELECT 
                '{"name":"' || name || '"
                ,"PN":"' || PN || '"
                ,"LN":"' || LN || '"
                ,"TN":"' || TN || '"
                ,"photoPath":"' || ifnull(photoPath, '') || '"
                ,"presence":"' || ifnull(presence, '') || '"
                ,"isMobile":"' || isMobile || '"}' 
                FROM users 
                WHERE id = m.sender) AS senderInfo`
              : 'senderInfo') +
            ', linkInfo ' +
            ' FROM message as m ' +
            ` WHERE roomId = ${param.roomID} ` +
            andWhere +
            ` LIMIT ${param.loadCnt} OFFSET 0 ` +
            ' ) A ' +
            ' ORDER BY messageId DESC' +
            ') A ' +
            'ORDER BY messageId',
        )
        .execute((tx, result) => {
          resolve(result.rows.raw());
        });
    });
  });

  return messages;
};

/* ????????? ????????? ????????? ????????? */
export const updateUnreadCount = async (param, callback) => {
  const messageId = param.messageId;
  const roomId = param.roomID;
  if (roomId > 0) {
    const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
    dbCon.transaction(tx => {
      db.tx(tx, 'message')
        .update({ unreadCnt: 1 })
        .where(`roomId = ${roomId} and messageId = ${messageId}`)
        .execute()
        .then(data => {})
        .catch(error => {
          console.log(error);
        });
    });
  }
};

export const unreadCountSync = async (param, callback) => {
  const roomId = param.roomID;
  const roomType = param.roomType;

  if (RoomList.isNoRoomID(roomId)) {
    if (roomType === 'M') {
      const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

      // isMine == null || isMine == 'N'
      const lastUnreadMessagesIdx = await new Promise((resolve, reject) => {
        dbCon.transaction(tx => {
          db.tx(tx, 'message')
            .select(['messageId'])
            .where(`roomId = ${roomId} AND unreadCnt = 1 AND isMine='N'`)
            .orderBy('messageId', 'DESC')
            .limit(1)
            .execute((exec, result) => {
              if (result.rows.length > 0) {
                resolve(result.rows.raw()[0].messageId);
              } else resolve(null);
            });
        });
      });

      // ??? ?????? ?????? ????????? ?????? ?????? ??????
      let lastMessagesUnreadCount = await new Promise((resolve, reject) => {
        dbCon.transaction(tx => {
          db.tx(tx, 'message')
            .select(['messageId'])
            .where(
              `roomId = ${roomId} AND unreadCnt > 0 AND messageId <= ${lastUnreadMessagesIdx} AND isMine='N'`,
            )
            .execute((exec, result) => {
              if (result.rows.length > 0) {
                resolve(result);
              } else resolve(null);
            });
        });
      });

      // ??????????????? ????????? ???????????? ?????? ????????? ????????????
      if (lastMessagesUnreadCount && lastMessagesUnreadCount.rows.length > 0) {
        lastMessagesUnreadCount.rows.raw().forEach(data => {
          dbCon.transaction(tx => {
            db.tx(tx, 'message')
              .update({ unreadCnt: 0 })
              .where(`roomId = ${roomId} AND messageId = ${data.messageId}`)
              .execute();
          });
        });
      }

      // ?????? ?????? ??????
      const unreadMessageIdx = await new Promise((resolve, reject) => {
        dbCon.transaction(tx => {
          db.tx(tx, 'message')
            .select(['messageId'])
            .where(`roomId = ${roomId} AND unreadCnt = 0`)
            .orderBy('messageId', 'DESC')
            .limit(1)
            .execute((exec, result) => {
              if (result.rows.length > 0) {
                resolve(result.rows.raw()[0].messageId);
              } else resolve(null);
            });
        });
      });

      // ?????? MessageId??? 0 ??????????????? ????????? ????????? ???????????? ??????
      let updateMesssages = null;
      if (unreadMessageIdx > 0) {
        updateMesssages = await new Promise((resolve, reject) => {
          dbCon.transaction(tx => {
            db.tx(tx, 'message')
              .select(['messageId'])
              .where(
                `roomId = ${roomId} AND unreadCnt > 0 AND messageId < ${unreadMessageIdx}`,
              )
              .execute((exec, result) => {
                if (result.rows.length > 0) {
                  resolve(result);
                } else resolve(null);
              });
          });
        });
      }

      // ??????????????? ????????? ???????????? ?????? ????????? ????????????
      if (updateMesssages && updateMesssages.rows.length > 0) {
        updateMesssages.rows.raw().forEach(data => {
          dbCon.transaction(tx => {
            db.tx(tx, 'message')
              .update({ unreadCnt: 0 })
              .where(`roomId = ${roomId} AND messageId = ${data.messageId}`)
              .execute();
          });
        });
      }
    } else if (roomType === 'G') {
      const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

      // ???????????? ?????? ????????? ???????????? ?????????
      const updateMesssages = await new Promise((resolve, reject) => {
        dbCon.transaction(tx => {
          db.tx(tx, 'message')
            .select(['messageId', 'unreadCnt'])
            .where(`roomId = ${roomId}`)
            .orderBy('messageId', 'DESC')
            .execute(async (exec, result) => {
              if (result.rows.length > 0) {
                const data = await result.rows.raw();
                resolve(data);
              } else resolve(null);
            });
        });
      });

      // ??????????????? ????????? ???????????? ?????? ????????? ????????????
      if (updateMesssages && updateMesssages.length > 0) {
        let pivotMessageUnreadCount = updateMesssages[0].unreadCnt;
        updateMesssages.forEach(data => {
          if (pivotMessageUnreadCount > data.unreadCnt) {
            pivotMessageUnreadCount = data.unreadCnt;
          } else if (pivotMessageUnreadCount < data.unreadCnt) {
            dbCon.transaction(tx => {
              db.tx(tx, 'message')
                .update({ unreadCnt: pivotMessageUnreadCount })
                .where(`roomId = ${roomId} AND messageId = ${data.messageId}`)
                .execute();
            });
          }
        });
      }
    }

    callback();
  }
};

/* ????????? ????????? */
export const syncMessages = async (param, callback) => {
  const roomId = param.roomID;
  if (RoomList.isNoRoomID(roomId)) {
    const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
    let syncDate = await new Promise((resolve, reject) => {
      dbCon.transaction(tx => {
        db.tx(tx, 'room')
          .select(['syncDate'])
          .where(`roomId = ${roomId}`)
          .execute((tx_2, result) => {
            if (result.rows.length > 0) resolve(result.rows.raw()[0].syncDate);
            else resolve(null);
          });
      });
    });

    managesvr('get', `/sync/room/message/${roomId}`)
      .then(async ({ data }) => {
        if (!data || data.status !== 'SUCCESS') {
          console.log('Sync DeletedMessages :: invalid data  ', data);
          return;
        }
        roomDeletemessage(roomId, data?.result?.deletedMessageIds);
      })
      .catch(err => {
        console.log('Sync DeletedMessages occured an error ', err);
      });

    const isNotice = Boolean(param.isNotice);

    managesvr('post', '/sync/messages', {
      roomId,
      syncDate,
      isNotice,
    }).then(response => {
      if (response.data.status == 'SUCCESS') {
        let messages = response.data.result;

        if (messages.length > 0) {
          let where = '';
          messages.forEach(item => {
            where += `${item.messageId},`;
          });
          where = where.substring(0, where.length - 1);

          dbCon.transaction(tx => {
            db.tx(tx, 'message')
              .select(['messageId'])
              .where(`messageId IN (${where})`)
              .execute((tx_2, result) => {
                syncDate = messages[messages.length - 1].sendDate;
                db.tx(tx_2, 'room')
                  .update({ syncDate })
                  .where(`roomId = ${roomId}`)
                  .execute();

                const notInMessages = result.rows.raw();

                messages = messages.filter(item => {
                  if (
                    !notInMessages.find(
                      message => item.messageId == message.messageId,
                    )
                  )
                    return item;
                });

                spliceInsert(
                  messages,
                  () => {
                    const openRoomList = RoomList.getRoomList();
                    openRoomList.push(roomId);

                    callback();
                  },
                  tx_2,
                  'message',
                );
              });
          });
        } else {
          const openRoomList = RoomList.getRoomList();
          openRoomList.push(roomId);
        }
      }
    });
  }
};

// ?????? ????????? ?????????
export const syncUnreadCount = async (param, callback) => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  const roomId = param.roomId;
  let unreadCnts = [];

  // unreadCnt != 0??? ????????? id??? ????????? ???????????? ?????????
  let messageIds = await new Promise((resolve, reject) => {
    dbCon.transaction(tx => {
      db.tx(tx, 'message')
        .select(['messageId'])
        .where(
          `roomId = ${roomId} AND messageId BETWEEN ${param.startId} AND ${
            param.endId
          } AND isSyncUnread IS NULL AND unreadCnt != 0`,
        )
        .execute((tx, result) => {
          resolve(result.rows.raw());
        });
    });
  });

  if (messageIds.length > 0) {
    messageIds = messageIds.map(item => item.messageId);

    const isNotice = Boolean(param.isNotice);
    const response = await managesvr('post', '/sync/message/unreadcount', {
      roomId: roomId,
      messageIds: messageIds,
      isNotice: isNotice,
    });

    if (response.data.status == 'SUCCESS') {
      unreadCnts = response.data.result;

      dbCon.transaction(tx => {
        const updatedMessageIds = [];

        // ??? ???????????? unread count ????????? ????????????
        unreadCnts.forEach(item => {
          let updateParam = {
            unreadCnt: item.unreadCnt,
          };

          if (item.unreadCnt === 0) {
            updateParam.isSyncUnread = 'Y';
          }

          db.tx(tx, 'message')
            .update(updateParam)
            .where(`messageId IN (${item.messageId})`)
            .execute();

          updatedMessageIds.push(...item.messageId.split(','));
        });

        /**
         * 2021.08.31 ??????????????? ????????? ????????????
         * 
         * ????????? ??????(local unreadCnt != 0) ????????? ?????????, ?????? db??? unreadCnt??? 0??? ???????????? sync response??? ???????????? ?????? ??????.
         * => response ???????????? local db??? ???????????? ?????????, response?????? ????????? ???????????? unreadCnt ???????????? ??????
         * 
         * unreadCnt??? ???????????? ?????????
         * 1. Websocket ?????? ????????? ?????? local unreadCnt ??????????????? ?????? ????????? ??????, ?????? db??? unreadCnt=0??? ???????????? ????????? ??????
         * 2. ???????????? ????????? ?????????

         * problem solve 1???
         * - ???????????? ???????????? ????????? ??? server response??? ???????????? ?????? ???????????? unreadCnt = 0?????? ?????? ????????????
         */
        const nonUpdatedMessageIds = messageIds.filter(m => {
          return updatedMessageIds.includes(`${m}`) === false;
        });
        if (nonUpdatedMessageIds.length > 0) {
          const _nonUpdated = nonUpdatedMessageIds.join(',');
          db.tx(tx, 'message')
            .update({ unreadCnt: 0 })
            .where(`messageId IN (${_nonUpdated})`)
            .execute();

          unreadCnts.push({ messageId: _nonUpdated, unreadCnt: 0 });
        }
      });
    }
  }
  return unreadCnts;
};

export const setUnreadCnt = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    param.messageIDs.forEach(id => {
      db.tx(tx)
        .query(
          'UPDATE message SET ' +
            'unreadCnt = (CASE WHEN unreadCnt > 0 THEN unreadCnt - 1 ELSE 0 END) ' +
            `WHERE messageId = ${id}`,
        )
        .execute(
          (tx, result) => {
            if (result.rowsAffected == 0) {
              const notReadList = NotReadList.getNotReadList();
              notReadList.push(id);
            }
          },
          e => {
            console.log(e);
            console.log(`reqSetUnreadCnt error - messageID : ${id}`);
          },
        );
    });
  });
};

export const saveMessage = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    db.tx(tx, 'message')
      .insert({
        messageId: param.messageID,
        context: param.context,
        sender: param.sender,
        sendDate: param.sendDate,
        roomId: param.roomID,
        roomType: param.roomType,
        receiver: param.receiver,
        messageType: param.messageType,
        unreadCnt: param.unreadCnt,
        isSyncUnRead: param.isSyncUnRead,
        readYN: param.readYN,
        isMine: param.isMine ? param.isMine : 'N',
        tempId: param.tempId,
        fileInfos: param.fileInfos,
        linkInfo: param.linkInfo,
        replyID: param.replyID,
        replyInfo: param.replyInfo,
      })
      .execute();

    if (param.senderInfo) {
      if (!param.senderInfo.Presence || param.senderInfo.Presence == '')
        param.senderInfo.Presence = 'offline';

      const senderInfo = JSON.stringify(param.senderInfo);
      db.tx(tx, 'message')
        .update({ senderInfo: senderInfo })
        .where(`messageId = ${param.messageID}`)
        .execute();
    }
  });

  // ?????? ?????? ??????
  const notReadList = NotReadList.getNotReadList();
  let notReadArr = notReadList.getData();

  if (notReadArr.length > 0) {
    const preReadCnt = notReadArr.reduce((acc, current) => {
      if (acc[current]) {
        acc[current] = acc[current] + 1;
      } else {
        acc[current] = 1;
      }
      return acc;
    }, {});

    let filterArray = [];
    const preReadCntKeys = Object.keys(preReadCnt);

    let where = '';
    preReadCntKeys.forEach(item => {
      where += `${item},`;
    });
    where = where.substring(0, where.length - 1);

    dbCon.transaction(tx => {
      db.tx(tx, 'message')
        .select(['messageId'])
        .where(`messageId IN (${where})`)
        .execute((tx_2, result) => {
          const messageIds = result.rows.raw();

          preReadCntKeys.forEach(key => {
            const messageId = messageIds.find(item => {
              if (item.messageId == key) return item.messageId;
            });
            if (messageId) {
              db.tx(tx_2)
                .query(
                  'UPDATE message SET ' +
                    `unreadCnt = (CASE WHEN unreadCnt > 0 THEN unreadCnt - ${
                      preReadCnt[key]
                    } ELSE 0 END) ` +
                    `WHERE messageId = ${messageId}`,
                )
                .execute(
                  () => {},
                  e => {
                    console.log(
                      'update notReadCount - messageId : ',
                      messageId,
                    );
                    console.log(e.stack);
                  },
                );
            } else {
              for (let i = 0; i < preReadCnt[key]; i++) {
                filterArray.push(key);
              }
            }
          });
          NotReadList.setData(filterArray);
        });
    });
  }
};

export const updateLinkInfo = async (messageId, linkInfo) => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  dbCon.transaction(tx => {
    db.tx(tx, 'message')
      .update({ linkInfo: JSON.stringify(linkInfo) })
      .where(`messageId = ${messageId}`)
      .execute();
  });
};

export const refreshAppData = async () => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  return new Promise((resolve, reject) => {
    dbCon.transaction(
      tx => {
        db.tx(tx, 'sync_date')
          .delete()
          .execute();
      },
      e => {},
      () => {
        dbCon.transaction(
          tx => {
            db.tx(tx, 'contact_folder')
              .delete()
              .execute();

            db.tx(tx, 'contact_item')
              .delete()
              .execute();
          },
          e => {},
          () => {
            dbCon.transaction(
              tx => {
                db.tx(tx, 'room')
                  .delete()
                  .execute();

                db.tx(tx, 'room_member')
                  .delete()
                  .execute();
              },
              e => {},
              () => {
                resolve(true);
              },
            );
          },
        );
      },
    );
  });
};

export const reqGetSearchMessages = async (param, { searchOption }) => {
  const returnObj = {
    status: 'FAIL',
    search: null,
    firstPage: null,
  };
  let search = [];
  switch (searchOption) {
    case SEARCHVIEW_OPTIONS.CONTEXT:
      search = await searchMessages(param);
      break;
    case SEARCHVIEW_OPTIONS.DATE:
      search = await searchMessagesByDate(param);
      break;
    case SEARCHVIEW_OPTIONS.SENDER:
      search = await searchMessagesByName(param);
      break;
  }

  if (search.length > 0) {
    search = search.map(item => item.messageId);
    param.startId = search[0];
    const messages = await getBetweenMessages(param);
    returnObj.status = 'SUCCESS';
    returnObj.search = search;
    returnObj.firstPage = messages;
  }

  return returnObj;
};

const searchMessages = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  const search = await new Promise((resolve, reject) => {
    dbCon.transaction(tx => {
      db.tx(tx)
        .query(
          `SELECT messageId FROM message WHERE roomId = ${
            param.roomID
          } AND context like '%${
            param.search
          }%' AND context not like '%eumtalk://emoticon.%' AND messageType = 'N' ORDER BY messageId DESC`,
        )
        .execute((tx, result) => {
          resolve(result.rows.raw());
        });
    });
  });

  return search;
};

const searchMessagesByDate = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  const query = `SELECT messageId FROM message WHERE roomId = ${
    param.roomID
  } AND DATE(sendDate/1000, 'unixepoch') = '${
    param.search
  }' AND context not like '%eumtalk://emoticon.%' AND messageType = 'N' ORDER BY messageId DESC LIMIT ${param?.loadCnt ||
    100}`;
  const search = await new Promise((resolve, reject) => {
    dbCon.transaction(tx => {
      db.tx(tx)
        .query(query)
        .execute((tx, result) => {
          resolve(result.rows.raw());
        });
    });
  });
  return search;
};

const searchMessagesByName = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  const search = await new Promise((resolve, reject) => {
    dbCon.transaction(tx => {
      db.tx(tx)
        .query(
          `SELECT messageId FROM message WHERE roomId = ${
            param.roomID
          } AND sender = '${param.search}' AND messageId <= ${
            param?.messageId
          } AND messageType = 'N' ORDER BY messageId DESC LIMIT ${param?.loadCnt ||
            100}`,
        )
        .execute((tx, result) => {
          resolve(result.rows.raw());
        });
    });
  });
  return search;
};

export const saveFailMessages = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  const where = `roomId = ${param.roomId}`;

  dbCon.transaction(tx => {
    db.tx(tx, 'room')
      .select(['reserved'])
      .where(where)
      .execute((tx_2, result) => {
        let reserved = {};
        const raw = result.rows.raw();

        if (raw.length > 0 && raw[0].reserved)
          reserved = JSON.parse(raw[0].reserved);

        if (
          !(
            reserved.failMsg &&
            reserved.failMsg.length == 0 &&
            param.failMsg.length == 0
          )
        ) {
          reserved.failMsg = param.failMsg;
          db.tx(tx_2, 'room')
            .update({ reserved: JSON.stringify(reserved) })
            .where(where)
            .execute();
        }
      });
  });
};

export const updateSecondPassword = async param => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  await dbCon.transaction(tx => {
    if (param == null) {
      db.tx(tx, 'access')
        .update({
          reserved: null,
        })
        .where(`id = '${LoginInfo.getLoginInfo().getID()}'`)
        .execute();
    } else {
      db.tx(tx, 'access')
        .update({
          reserved: JSON.stringify({
            secondPass: param.secondAuth,
            useBioAuth: param.useBioAuth,
          }),
        })
        .where(`id = '${LoginInfo.getLoginInfo().getID()}'`)
        .execute();
    }
  });
};

export const getSecondPasswordInfo = async () => {
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());

  const secondPasswordInfo = await new Promise((resolve, reject) => {
    dbCon.transaction(tx => {
      db.tx(tx, 'access')
        .select(['reserved'])
        .where(`id = '${LoginInfo.getLoginInfo().getID()}'`)
        .execute(
          (tx, result) => {
            const raw = result.rows.raw();
            resolve(JSON.parse(raw[0].reserved));
          },
          error => {
            reject(error);
          },
        );
    });
  });

  return secondPasswordInfo;
};

export const roomDeletemessage = async (roomId, deletedMessageIds) => {
  if (!roomId || Array.isArray(deletedMessageIds) === false) {
    console.log(
      'Room DeleteMessage :: invalid data : ',
      roomId,
      deletedMessageIds,
    );
    return;
  }
  // ????????? ???????????? ???????????? (deletedMessageIds = []) delete ??????
  if (!deletedMessageIds?.length) {
    return;
  }
  const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
  dbCon.transaction(tx => {
    db.tx(tx, 'message')
      .delete()
      .where(`roomId = ${roomId}`)
      .whereIn('messageId', deletedMessageIds)
      .execute()
      .then((_, result) => {
        console.log(
          `Sync DeletedMessages in room ${roomId} with ${
            deletedMessageIds?.length
          } data`,
        );
      });
  });
};
