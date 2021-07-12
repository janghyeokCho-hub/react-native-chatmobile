import { addContacts, deleteContacts } from '@/modules/contact';
import { addFixedUsers } from '@/modules/presence';
import { getAesUtil } from '@/lib/AesUtil';

export const addFavorite = (dispatch, userInfo, orgFolderType) => {
  dispatch(
    addContacts([
      {
        targetId: userInfo.id,
        targetType: userInfo.type,
        companyCode: null,
        folderType: 'F',
        orgFolderType: orgFolderType,
        userInfo: userInfo,
      },
    ]),
  );

  if (orgFolderType != 'C' && userInfo.type == 'U')
    dispatch(addFixedUsers([{ id: userInfo.id, presence: userInfo.presence }]));
};

export const addContact = (dispatch, userInfo) => {
  dispatch(
    addContacts([
      {
        targetId: userInfo.id,
        targetType: userInfo.type,
        companyCode: userInfo.companyCode,
        folderType: userInfo.type == 'G' ? 'G' : 'C',
        userInfo: userInfo,
      },
    ]),
  );

  if (userInfo.type == 'U')
    dispatch(addFixedUsers([{ id: userInfo.id, presence: userInfo.presence }]));
};

export const addContactList = (dispatch, list) => {
  dispatch(addContacts(list));

  const presenceList = list.filter(item => {
    if (item.targetType == 'U')
      return { id: item.targetId, presence: item.presence };
  });

  dispatch(addFixedUsers(presenceList));
};

export const editGroupContactList = (dispatch, action, groupInfo, addMemberList) => {
  dispatch(action(groupInfo));

  const presenceList = addMemberList.filter(item => {
    if (item.targetType == 'U')
      return { id: item.targetId, presence: item.presence };
  });

  dispatch(addFixedUsers(presenceList));
};

export const deleteContact = (dispatch, id, folderID, folderType) => {
  let params = {
    folderType: folderType,
  };

  if (id != null) params.contactId = id;
  if (folderID != null) params.folderId = folderID;

  dispatch(deleteContacts(params));
};

/* 
  그룹멤버 기준으로 client단에서 검색 filter
  @param
    data: server에서 검색된 data
    group: 변경중인 group 정보
    userId: 접속 userId
*/
export const filterSearchGroupMember = (data, group, userID) =>{
  return data.filter((contact)=>{
    let flag = true;
    if(group.sub){
      group.sub.forEach(groupUser =>{
        if(groupUser.id === contact.id)
          flag = false;
      });
    }
    return flag && contact.id != userID;
  })
}

/* 
  사용자 그룹생성 및 멤버 추가/제거 
  @param
    members: 추가/제거되는 멤버
    name: 사용자 그룹명
    group: 변경되는 그룹정보
    reserved: 추가/제거 flag(A:추가, D:제거)
*/
export const getApplyGroupInfo = (members, name, group, reserved) => {
  const AESUtil = getAesUtil();
  let modifyInfo ={};
  if((group && group.folderID) && reserved){
    modifyInfo = {
      folderId: group ? group.folderID : null,
      reserved : reserved || null
    }
  }
  /* 신청 param  
    folderId: 변경되는 그룹 id
    reserved: 추가/제거 flag
    displayName: 그룹 명
    arrGroup: 추가/제거되는 조직 리스트(암호화)
    arrMember: 추가/제거되는 사용자 리스트(암호화)
  */
  return [{
    ...modifyInfo,
    displayName: ";;;;;;;;;".replace(/[\;]/g, name+";"),
    folderType: 'R',
    arrGroup: AESUtil.encrypt(members.filter((item)=> item.type == 'G').map((item)=>{
      return item.id+"|"+item.companyCode;
    }).join(",")),
    arrMember: AESUtil.encrypt(members.filter((item)=> item.type == 'U').map((item)=>{
      return item.id;
    }).join(","))
  }];
}