import { createAction, handleActions } from 'redux-actions';
import { takeLatest, throttle } from 'redux-saga/effects';
import AsyncStorage from '@react-native-community/async-storage';
import { createRequestActionTypes } from '@/modules/saga/createRequestSaga';
import { getDic } from '@/config';
import produce from 'immer';
import * as saga from '@/modules/saga/channelSaga';

const INIT = 'channel/INIT';
const SET_CHANNELS = 'channel/SET_CHANNELS';
const [
  GET_CHANNELS,
  GET_CHANNELS_SUCCESS,
  GET_CHANNELS_FAILURE,
] = createRequestActionTypes('channel/GET_CHANNELS');

const [
  UPDATE_CHANNELS,
  UPDATE_CHANNELS_SUCCESS,
  UPDATE_CHANNELS_FAILURE,
] = createRequestActionTypes('channel/UPDATE_CHANNELS');

const [
  GET_CHANNEL_CATEGORIES,
  GET_CHANNEL_CATEGORIES_SUCCESS,
  GET_CHANNEL_CATEGORIES_FAILURE,
] = createRequestActionTypes('channel/GET_CHANNEL_CATEGORIES');
const [
  GET_CHANNEL_INFO,
  GET_CHANNEL_INFO_SUCCESS,
  GET_CHANNEL_INFO_FAILURE,
] = createRequestActionTypes('channel/GET_CHANNEL_INFO');

const [
  LEAVE_CHANNEL,
  LEAVE_CHANNEL_SUCCESS,
  LEAVE_CHANNEL_FAILURE,
] = createRequestActionTypes('channel/LEAVE_CHANNEL');

const [
  INVITE_MEMBER,
  INVITE_MEMBER_SUCCESS,
  INVITE_MEMBER_FAILURE,
] = createRequestActionTypes('channel/INVITE_MEMBER');

const [
  UPLOAD_CHANNELICON,
  UPLOAD_CHANNELICON_SUCCESS,
  UPLOAD_CHANNELICON_FAILURE,
] = createRequestActionTypes('channel/UPLOAD_CHANNELICON');

const [
  GET_CHANNEL_NOTICE,
  GET_CHANNEL_NOTICE_SUCCESS,
  GET_CHANNEL_NOTICE_FAILURE,
] = createRequestActionTypes('channel/GET_CHANNEL_NOTICE');

const [
  MODIFY_CHANNELINFO,
  MODIFY_CHANNELINFO_SUCCESS,
  MODIFY_CHANNELINFO_FAILURE,
] = createRequestActionTypes('channel/MODIFY_CHANNELINFO');

const [
  MODIFY_CHANNEL_MEMBER_AUTH,
  MODIFY_CHANNEL_MEMBER_AUTH_SUCCESS,
  MODIFY_CHANNEL_MEMBER_AUTH_FAILURE,
] = createRequestActionTypes('channel/MODIFY_CHANNEL_MEMBER_AUTH');

const [
  REMOVE_CHANNEL_NOTICE,
  REMOVE_CHANNEL_NOTICE_SUCCESS,
  REMOVE_CHANNEL_NOTICE_FAILURE,
] = createRequestActionTypes('channel/REMOVE_CHANNEL_NOTICE');

const RECEIVE_MESSAGE = 'channel/RECEIVE_MESSAGE';
const OPEN_CHANNEL = 'channel/OPEN_CHANNEL';
const CHANGE_OPEN_CHANNEL = 'channel/CHANGE_OPEN_CHANNEL';

const NEW_WIN_CHANNEL = 'channel/NEW_WIN_CHANNEL';
const CLOSE_WIN_CHANNEL = 'channel/CLOSE_WIN_CHANNEL';

const RESET_UNREAD_COUNT = 'channel/RESET_UNREAD_COUNT';

const RECEIVE_NOTICE = 'channel/RECEIVE_NOTICE';

const SET_MESSAGES = 'channel/SET_MESSAGES';
const SET_MESSAGES_SYNC = 'channel/SET_MESSAGES_SYNC';
const INIT_MESSAGES = 'channel/INIT_MESSAGES';

const SET_MESSAGE_LINKINFO = 'channel/SET_MESSAGE_LINKINFO';

const CHANNEL_MESSAGE_ADD = 'channel/CHANNEL_MESSAGE_ADD';

const READ_MESSAGE = 'channel/READ_MESSAGE';
const READ_MESSAGE_FOCUS = 'channel/READ_MESSAGE_FOCUS';
const MESSAGE_READ_COUNT_CHANGED = 'channel/MESSAGE_READ_COUNT_CHANGED';

const NEW_CHANNEL = 'channel/NEW_CHANNEL';

const CHANNEL_CLOSURE = 'channle/CHANNEL_CLOSURE';

const CHANNEL_INVITE_MESSAGE_ADD = 'channel/CHANNEL_INVITE_MESSAGE_ADD';
const CHANNEL_LEAVE_MESSAGE_ADD = 'channel/CHANNEL_LEAVE_MESSAGE_ADD';
const CHANGE_VIEW_TYPE = 'channel/CHANGE_VIEW_TYPE';

const RECEIVE_DELETED_NOTICE = 'channel/RECEIVE_DELETED_NOTICE';
const RECEIVE_DELETED_MESSAGE = 'channel/RECEIVE_DELETED_MESSAGE';

const SET_SEARCH_KEYWORD = 'channel/SET_SEARCH_KEYWORD';

const SET_INIT_CURRENTCHANNEL = 'channel/SET_CURRENT_INIT';
const CHANNEL_LEAVE_OTHER_DEVICE = 'channel/CHANNEL_LEAVE_OTHER_DEVICE';

const [
  MODIFY_CHANNELSETTING,
  MODIFY_CHANNELSETTING_SUCCESS,
  MODIFY_CHANNELSETTING_FAILURE,
] = createRequestActionTypes('channel/MODIFY_CHANNELSETTING');

const CHANNEL_AUTH_CHANGED = 'channel/AUTH_CHANGED';
const RECEIVE_CHANNELSETTING = 'channel/RECEIVE_CHANNELSETTING';

export const setChannels = createAction(SET_CHANNELS);
export const init = createAction(INIT);
export const getChannels = createAction(GET_CHANNELS);
export const updateChannels = createAction(UPDATE_CHANNELS);
export const getChannelCategories = createAction(GET_CHANNEL_CATEGORIES);
export const receiveMessage = createAction(RECEIVE_MESSAGE);
export const openChannel = createAction(OPEN_CHANNEL);
export const changeOpenChannel = createAction(CHANGE_OPEN_CHANNEL);
export const newWinChannel = createAction(NEW_WIN_CHANNEL);
export const closeWinChannel = createAction(CLOSE_WIN_CHANNEL);
export const setInitCurrentChannel = createAction(SET_INIT_CURRENTCHANNEL);
export const getChannelInfo = createAction(GET_CHANNEL_INFO);
export const resetUnreadCount = createAction(RESET_UNREAD_COUNT);
export const setMessages = createAction(SET_MESSAGES);
export const setMessagesForSync = createAction(SET_MESSAGES_SYNC);
export const initMessages = createAction(INIT_MESSAGES);
export const setMessageLinkInfo = createAction(SET_MESSAGE_LINKINFO);

export const channelMessageAdd = createAction(CHANNEL_MESSAGE_ADD);

export const receiveNotice = createAction(RECEIVE_NOTICE);
export const getChannelNotice = createAction(GET_CHANNEL_NOTICE);

export const readMessage = createAction(READ_MESSAGE);
export const readMessageFocus = createAction(READ_MESSAGE_FOCUS);
export const messageReadCountChanged = createAction(MESSAGE_READ_COUNT_CHANGED);

export const inviteMember = createAction(INVITE_MEMBER);
export const leaveChannel = createAction(LEAVE_CHANNEL);

export const newChannel = createAction(NEW_CHANNEL);
export const modifyChannelInfo = createAction(MODIFY_CHANNELINFO);
export const uploadChannelIcon = createAction(UPLOAD_CHANNELICON);
export const modifyChannelMemberAuth = createAction(MODIFY_CHANNEL_MEMBER_AUTH);

export const channelInviteMessageAdd = createAction(CHANNEL_INVITE_MESSAGE_ADD);
export const channelLeaveMessageAdd = createAction(CHANNEL_LEAVE_MESSAGE_ADD);

export const changeViewType = createAction(CHANGE_VIEW_TYPE);

export const channelClosure = createAction(CHANNEL_CLOSURE);

export const receiveDeletedNotice = createAction(RECEIVE_DELETED_NOTICE);
export const receiveDeletedMessage = createAction(RECEIVE_DELETED_MESSAGE);

export const removeChannelNotice = createAction(REMOVE_CHANNEL_NOTICE);

export const setSearchKeyword = createAction(SET_SEARCH_KEYWORD);
export const channelLeaveOtherDevice = createAction(CHANNEL_LEAVE_OTHER_DEVICE);

export const modifyChannelSetting = createAction(MODIFY_CHANNELSETTING);

export const changeChannelAuth = createAction(CHANNEL_AUTH_CHANGED);
export const receiveChannelSetting = createAction(RECEIVE_CHANNELSETTING);

const getChannelsSaga = saga.createGetChannelsSaga();
const updateChannelsSaga = saga.createUpdateChannelsSaga();
const getChannelCategoriesSaga = saga.createGetChannelCategoriesSaga();
const receiveMessageSaga = saga.createReceiveMessageSaga();
const openChannelSaga = saga.createOpenChannelSaga();
const getChannelInfoSaga = saga.createGetChannelInfoSaga();
const readMessageSaga = saga.createReadMessageSaga();
const readMessageFocusSaga = saga.createReadMessageSaga();
const leaveChannelSaga = saga.createLeaveChannelsSaga();
const inviteMemberSaga = saga.createInviteMemberSaga();
const modifyChannelInfoSaga = saga.createModifyChannelInfoSaga();
const uploadChannelIconSaga = saga.createUploadChannelIconSaga();
const modifyChannelMemberAuthSaga = saga.createModifyChannelMemberAuthSaga();
const getchannelNoticeSaga = saga.createGetChannelNoticeSaga();
const removeChannelNoticeSaga = saga.createRemoveChannelNoticeSaga();
const modifyChannelSettingSaga = saga.createModifyChannelSettingSaga();

export function* channelSaga() {
  yield takeLatest(GET_CHANNEL_NOTICE, getchannelNoticeSaga);
  yield takeLatest(GET_CHANNELS, getChannelsSaga);
  yield takeLatest(UPDATE_CHANNELS, updateChannelsSaga);
  yield takeLatest(GET_CHANNEL_CATEGORIES, getChannelCategoriesSaga);
  yield takeLatest(RECEIVE_MESSAGE, receiveMessageSaga);
  yield takeLatest(OPEN_CHANNEL, openChannelSaga);
  yield takeLatest(GET_CHANNEL_INFO, getChannelInfoSaga);
  yield takeLatest(READ_MESSAGE, readMessageSaga);
  yield takeLatest(LEAVE_CHANNEL, leaveChannelSaga);
  yield takeLatest(INVITE_MEMBER, inviteMemberSaga);
  yield takeLatest(MODIFY_CHANNELINFO, modifyChannelInfoSaga);
  yield takeLatest(UPLOAD_CHANNELICON, uploadChannelIconSaga);
  yield takeLatest(MODIFY_CHANNEL_MEMBER_AUTH, modifyChannelMemberAuthSaga);
  yield takeLatest(REMOVE_CHANNEL_NOTICE, removeChannelNoticeSaga);
  yield takeLatest(MODIFY_CHANNELSETTING, modifyChannelSettingSaga);
  yield throttle(1000, READ_MESSAGE_FOCUS, readMessageFocusSaga);
}

const initialState = {
  viewType: 'S',
  selectId: -1,
  currentChannel: null,
  channels: [],
  categories: [],
  messages: [],
  makeChannel: false,
  makeInfo: null,
};

const channelActionHandlers = handleActions(
  {
    [INIT]: (state, action) => ({
      ...initialState,
    }),
    [CHANNEL_CLOSURE]: (state, action) => {
      return produce(state, draft => {
        const channel = draft.channels.find(
          c => c.roomId === action.payload.roomID,
        );
        if (channel) channel.disabled = true;
      });
    },
    [RECEIVE_NOTICE]: (state, action) => {
      return produce(state, draft => {
        if (action.payload) {
          const noticeMessage = {
            ...action.payload,
            isNew: true,
          };

          const channelIdx = draft.channels.findIndex(
            c => c.roomId == noticeMessage.roomID,
          );

          const senderInfo = JSON.parse(noticeMessage.senderInfo);

          if (channelIdx > -1) {
            noticeMessage.createName =
              senderInfo.Name + ' ' + senderInfo.JobPosition;
            draft.channels[channelIdx].notice = noticeMessage;
            const param = {
              noticeFlip: false,
              noticeDisable: false,
            };
            draft.channels[channelIdx].notice = {
              ...draft.channels[channelIdx].notice,
              createName: senderInfo.Name + ' ' + senderInfo.JobPosition,
            };
            AsyncStorage.setItem(
              ':channel_notice_' + noticeMessage.roomID,
              JSON.stringify(param),
            );
          }
          if (
            draft.currentChannel &&
            draft.currentChannel.roomId == noticeMessage.roomID
          ) {
            noticeMessage.createName =
              senderInfo.Name + ' ' + senderInfo.JobPosition;
            draft.currentChannel.notice = noticeMessage;

            if (noticeMessage.isMine == null) noticeMessage.isMine = 'Y';

            const param = {
              noticeFlip: false,
              noticeDisable: false,
            };
            AsyncStorage.setItem(
              ':channel_notice_' + noticeMessage.roomID,
              JSON.stringify(param),
            );
          }
        }
      });
    },
    [REMOVE_CHANNEL_NOTICE_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (draft.currentChannel.notice) {
          delete draft.currentChannel.notice;
        }
      });
    },
    [SET_SEARCH_KEYWORD]: (state, action) => {
      return produce(state, draft => {
        if (action.payload) {
          draft.currentChannel.searchKeyword = action.payload.keyword;
        }
      });
    },
    [SET_CHANNELS]: (state, action) => {
      return produce(state, draft => {
        // login 시에만 사용
        draft.channels = action.payload.result.filter(
          channel => channel.lastMessageDate,
        );
        draft.channels.map(item => {
          item.disabled = false;
        });
      });
    },
    [GET_CHANNEL_NOTICE_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (action.payload && action.payload.status == 'SUCCESS') {
          const { notice } = action.payload;
          const channelIdx = draft.channels.findIndex(
            c => c.roomId == notice.roomID,
          );
          if (channelIdx > -1) {
            draft.channels[channelIdx].notice = notice;
          }
          if (
            draft.currentChannel &&
            draft.currentChannel.roomId == notice.roomID
          ) {
            draft.currentChannel.notice = notice;
          }
        }
      });
    },
    [SET_INIT_CURRENTCHANNEL]: (state, action) => ({
      ...state,
      selectId: initialState.selectId,
      currentChannel: initialState.currentChannel,
    }),
    [GET_CHANNELS_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (draft.channels.length > 0) {
          // 기존 새창과 같은 action에 따라 변동된 값을 유지하기 위해 update형식으로 적용
          action.payload.result.forEach(item => {
            const channel = draft.channels.find(c => c.roomId === item.roomId);

            // 기존 channel 내용 복사
            if (channel) {
              item.newWin = channel.newWin;
              item.winObj = channel.winObj;
              item.winName = channel.winName;
              item.disabled = false;
              // 채널 아이콘
              if (channel.iconPath && !item.iconPath) {
                item.iconPath = channel.iconPath;
              }
            }
          });
        }

        draft.channels = action.payload.result;
      });
    },
    [RECEIVE_DELETED_MESSAGE]: (state, action) => {
      return produce(state, draft => {
        if (action.payload) {
          if (draft.currentChannel.roomId == action.payload.roomID) {
            draft.messages.splice(
              draft.messages.findIndex(
                m => m.messageID == action.payload.deleteMessage.messageID,
              ),
              1,
            );
          }
        }
      });
    },
    [UPDATE_CHANNELS_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (draft.channels.length > 0) {
          // 기존 새창과 같은 action에 따라 변동된 값을 유지하기 위해 update형식으로 적용
          action.payload.rooms.forEach(item => {
            if (item.roomID && !item.roomId) {
              item.roomId = item.roomID;
            }

            const channelIdx = draft.channels.findIndex(
              c => c.roomId === item.roomId,
            );

            const channel = channelIdx > -1 ? draft.channels[channelIdx] : null;

            // 기존 channel 내용 복사
            if (channel) {
              item.newWin = channel.newWin;
              item.winObj = channel.winObj;
              item.winName = channel.winName;
              // 채널 아이콘
              if (channel.iconPath && !item.iconPath) {
                item.iconPath = channel.iconPath;
              }

              draft.channels[channelIdx] = item;
            } else {
              draft.channels.unshift(item);
            }
          });
        }
      });
    },
    [GET_CHANNEL_CATEGORIES_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.status == 'SUCCESS') {
          draft.categories = action.payload.result;
        }
      });
    },
    [CHANNEL_MESSAGE_ADD]: (state, action) => {
      // roomID
      return produce(state, draft => {
        const channel = draft.channels.find(
          c => c.roomId === action.payload.roomID,
        );
        // channel 순서 변경
        const lastMessageData = {
          Message:
            action.payload.messageType === 'I'
              ? getDic('NewNotice')
              : action.payload.context,
          File: action.payload.fileInfos,
        };

        if (channel) {
          channel.lastMessage = lastMessageData;
          channel.lastMessageDate = action.payload.sendDate;
          
          if (action.payload?.messageType) {
            channel.lastMessageType = action.payload.messageType;
          }

          draft.channels.splice(
            draft.channels.findIndex(c => c.roomId === action.payload.roomID),
            1,
          );
          draft.channels.unshift(channel);

          if (
            draft.currentChannel &&
            channel.roomId === draft.currentChannel.roomId
          ) {
            // 이미 존재하는 메시지인지 한번 체크 후 입력
            // 메시지 순서에 대한 보장도 확인해봐야함.
            const idx = draft.messages.findIndex(
              m => m.messageID == action.payload.messageID,
            );

            const lastMessageID =
              draft.messages.length > 0
                ? draft.messages[draft.messages.length - 1].messageID
                : 0;

            if (idx < 0) {
              // push 하기전 sendTime을 비교해서 YYYYMMDDHHmm 같은애들은 한꺼번에 update
              const size = draft.messages.length;
              const checkTimeStamp = Math.floor(
                action.payload.sendDate / 60000,
              );

              for (let i = size - 1; i >= 0; i--) {
                const compMessage = draft.messages[i];
                const compTimeStamp = Math.floor(compMessage.sendDate / 60000);
                // 시간이 같은 메시지까지 update 대상으로 포함
                if (compTimeStamp == checkTimeStamp) {
                  // 해당 state에 강제로 추가 props를 추가해 업데이트 유도
                  compMessage.updateIndex = action.payload.messageID;
                } else {
                  break;
                }
              }

              // 메시지 읽음 카운트 확인
              let notReadArr = draft.currentChannel.notReadArr;
              if (notReadArr) {
                const preReadCnt = notReadArr.reduce((acc, current) => {
                  if (acc[current]) {
                    acc[current] = acc[current] + 1;
                  } else {
                    acc[current] = 1;
                  }
                  return acc;
                }, {});

                let filterArray = [];

                Object.keys(preReadCnt).forEach(key => {
                  const message = draft.messages.find(
                    item => item.messageID == key,
                  );

                  if (message) {
                    message.unreadCnt = message.unreadCnt - preReadCnt[key];
                  } else {
                    for (let i = 0; i < preReadCnt[key]; i++) {
                      filterArray.push(key);
                    }
                  }
                });

                draft.currentChannel.notReadArr = filterArray;
              }

              if (action.payload.messageID > lastMessageID) {
                draft.messages.push(action.payload);
              } else {
                const afterMessageIdx = draft.messages.findIndex(
                  item => item > action.payload.messageID,
                );

                let beforeMessages = [];
                let afterMessages = [];
                draft.messages.forEach((item, i) => {
                  if (i < afterMessageIdx) {
                    beforeMessages.push(item);
                  } else {
                    afterMessages.push(item);
                  }
                });
                draft.messages = [
                  ...beforeMessages,
                  action.payload,
                  ...afterMessages,
                ];
              }
            }

            // 활성창이지만 새창인경우 --- 본창도 focus가 있을때만 unreadCnt를 증가시키지 않음
            if (
              action.payload.isMine != 'Y'
              // channel.newWin &&
            ) {
              // 추후 삭제 필요 ( 현재 api에서 unreadCnt 값을 안 넘겨주는 상태이기 때문에)
              if (!channel.unreadCnt) channel.unreadCnt = 0;
              channel.unreadCnt = channel.unreadCnt + 1;
            }

            action.payload.isCurrentChannel = true;
          } else {
            if (action.payload.isMine != 'Y') {
              // 추후 삭제 필요 ( 현재 api에서 unreadCnt 값을 안 넘겨주는 상태이기 때문에)
              if (!channel.unreadCnt) channel.unreadCnt = 0;
              channel.unreadCnt = channel.unreadCnt + 1;
            }
          }
        } else {
          // channel 정보를 받아와야하는 channel 추가
          draft.channels.unshift({
            roomId: action.payload.roomID,
            updateDate: null,
            lastMessage: lastMessageData,
            lastMessageDate: action.payload.sendDate,
            unreadCnt: action.payload.isMine != 'Y' ? 1 : 0,
          });
        }
      });
    },
    [CHANGE_OPEN_CHANNEL]: (state, action) => {
      return produce(state, draft => {
        if (!action.payload.newChannel) {
          const channel = draft.channels.find(
            c => c.roomId === action.payload.roomId,
          );

          if (channel) {
            draft.currentChannel = channel;

            // currentRoom 의 경우 setting 정보가 object로 변환되도록 작업
            try {
              draft.currentChannel.setting = JSON.parse(channel.setting);
            } catch (e) {
              draft.currentChannel.setting = null;
            }
          } else {
            draft.currentChannel = {
              roomId: action.payload.roomId,
            };
            draft.messages = [];
          }

          draft.makeInfo = null;
        } else {
          draft.currentChannel = {
            newChannel: action.payload.newChannel,
          };

          draft.makeInfo = action.payload.makeInfo;
        }

        if (action.payload.newChatRoom) {
          // 채널 값 초기화
          draft.currentChannel = null;
          draft.makeInfo = null;
          draft.messages = [];
          draft.selectId = -1;
        }
        draft.makeChannel = false;
      });
    },
    [GET_CHANNEL_INFO_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        let newChannel = action.payload.room;
        const channelIdx = draft.channels.findIndex(
          c => c.roomId === action.payload.room.roomId,
        );

        const channel = channelIdx > -1 ? draft.channels[channelIdx] : null;

        if (channel) {
          // update 필요내용만 변경 - channel member 변경시에도 update date 처리
          if (channel.updateDate != newChannel.updateDate) {
            /*
            newChannel.newWin = channel.newWin;
            newChannel.winObj = channel.winObj;
            newChannel.winName = channel.winName; 
            
            draft.channels[channelIdx] = newChannel; 
            
            // 나머지 속성 매핑필요
            draft.currentChannel = newChannel;
            */
            const updateChannel = {
              ...channel,
              roomName: newChannel.roomName,
              roomType: newChannel.roomType,
              ownerCode: newChannel.ownerCode,
              updateDate: newChannel.updateDate,
              lastMessage: newChannel.lastMessage,
              lastMessageDate:
                newChannel.lastMessageDate == null
                  ? ' '
                  : newChannel.lastMessageDate,
              unreadCnt: newChannel.unreadCnt,
              members: newChannel.members,
              realMemberCnt: newChannel.realMemberCnt,
              categoryCode: newChannel.categoryCode,
              categoryName: newChannel.categoryName,
              description: newChannel.description,
              iconPath: newChannel.iconPath || newChannel.iConPath,
              lastViewedAt: newChannel.lastViewedAt,
            };
            draft.channels[channelIdx] = updateChannel;
            draft.currentChannel = updateChannel;
          } else {
            draft.currentChannel = channel;
          }
        } else {
          draft.channels.push(newChannel);
          draft.currentChannel = newChannel;
        }

        draft.messages = action.payload.messages;

        // current room 내의 setting 은 Object type으로 처리
        try {
          draft.currentChannel.setting = JSON.parse(newChannel.setting);
        } catch (e) {
          draft.currentChannel.setting = null;
        }
      });
    },
    [MODIFY_CHANNEL_MEMBER_AUTH_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.status === 'SUCCESS') {
          const channel = draft.channels.find(
            c => c.roomId === action.payload.roomId,
          );
          if (channel) {
            channel.members.map(cm => {
              const memberIdx = action.payload.members.findIndex(
                memberId => memberId === cm.id,
              );
              if (memberIdx > -1) {
                cm.channelAuth = action.payload.auth;
              }
            });
          }

          if (draft.currentChannel.roomId === action.payload.roomId) {
            draft.currentChannel.members.map(cm => {
              const memberIdx = action.payload.members.findIndex(
                memberId => memberId === cm.id,
              );
              if (memberIdx > -1) {
                cm.channelAuth = action.payload.auth;
              }
            });
          }
        }
      });
    },
    [NEW_WIN_CHANNEL]: (state, action) => {
      return produce(state, draft => {
        const channel = draft.channels.find(c => c.roomId == action.payload.id);
        const currentChannel = draft.currentChannel;

        if (currentChannel) {
          if (currentChannel.roomId == action.payload.id) {
            currentChannel.newWin = true;
            currentChannel.winObj = action.payload.obj;
            currentChannel.winName = action.payload.name;
          }
        }

        if (channel) {
          channel.newWin = true;
          channel.winObj = action.payload.obj;
          channel.winName = action.payload.name;
        } else {
          draft.channels.push({
            roomId: action.payload.id,
            newWin: true,
            winObj: action.payload.obj,
            winName: action.payload.name,
            updateDate: null,
          });
        }
      });
    },
    [CLOSE_WIN_CHANNEL]: (state, action) => {
      return produce(state, draft => {
        const channel = draft.channels.find(c => c.roomId === action.payload);

        const currentChannel = draft.currentChannel;

        if (currentChannel) {
          if (currentChannel.roomId === action.payload) {
            currentChannel.newWin = false;
            currentChannel.winObj = null;
            currentChannel.winName = '';
          }
        }

        if (channel) {
          channel.newWin = false;
          channel.winObj = null;
          channel.winName = '';
        } else {
          draft.channels.push({
            roomId: action.payload,
            newWin: false,
            winObj: null,
            winName: '',
            updateDate: null,
          });
        }
      });
    },
    [CHANGE_VIEW_TYPE]: (state, action) => {
      return produce(state, draft => {
        draft.viewType = action.payload ? 'M' : 'S';

        // single view로 변경된경우 기존의 갖고있던 currentChannel 삭제
        if (!action.payload) {
          draft.selectId = -1;
          draft.currentChannel = null;
          draft.messages = [];
          draft.makeInfo = null;
        }
      });
    },
    [RESET_UNREAD_COUNT]: (state, action) => {
      return produce(state, draft => {
        const channel = draft.channels.find(c => c.roomId == action.payload);
        if (channel) channel.unreadCnt = 0;
      });
    },
    [SET_MESSAGES]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.dist == 'BEFORE') {
          draft.messages = [...draft.messages, ...action.payload.messages];
        } else {
          draft.messages = [...action.payload.messages, ...draft.messages];
        }
      });
    },
    [SET_MESSAGES_SYNC]: (state, action) => {
      return produce(state, draft => {
        draft.messages = action.payload;
      });
    },
    [INIT_MESSAGES]: (state, action) => {
      return produce(state, draft => {
        const startIdx =
          draft.messages.length - 100 >= 0 ? draft.messages.length - 100 : 0;
        // 최근 100개의 메시지만 남김
        draft.messages = draft.messages.splice(startIdx, 100);
      });
    },
    [SET_MESSAGE_LINKINFO]: (state, action) => {
      return produce(state, draft => {
        if (
          draft.currentChannel &&
          draft.currentChannel.roomId == action.payload.roomId
        ) {
          const message = draft.messages.find(
            m => m.messageID == action.payload.messageId,
          );
          if (message) {
            message.linkInfo = action.payload.linkInfo;
          }
        }
      });
    },
    [MESSAGE_READ_COUNT_CHANGED]: (state, action) => {
      // action.payload.roomID 만 존재
      return produce(state, draft => {
        if (
          draft.currentChannel &&
          draft.currentChannel.roomId == action.payload.roomID
        ) {
          action.payload.messageIDs.forEach(id => {
            const message = draft.messages.find(m => m.messageID == id);
            if (message) {
              message.unreadCnt = message.unreadCnt - 1;
            } else {
              if (!draft.currentChannel.notReadArr)
                draft.currentChannel.notReadArr = [];
              draft.currentChannel.notReadArr = [
                ...draft.currentChannel.notReadArr,
                id,
              ];
            }
          });
        }
      });
    },
    [RECEIVE_DELETED_NOTICE]: (state, action) => {
      return produce(state, draft => {
        if (action.payload) {
          if (draft.currentChannel) {
            // 채널을 보고 있는 경우
            if (draft.currentChannel.roomId == action.payload.roomID) {
              delete draft.currentChannel.notice;
            }
          } else {
            // 채널을 보지않고 있는 경우
            if (draft.channels.length > 0) {
              let removeIndex = -1;
              draft.channels.map((data, index) => {
                if (data.roomId == action.payload.roomID) {
                  if (data.notice) {
                    removeIndex = index;
                  }
                }
              });
              if (removeIndex > -1) {
                delete draft.channels[removeIndex].notice;
              }
            }
          }
        }
      });
    },
    [CHANNEL_INVITE_MESSAGE_ADD]: (state, action) => {
      return produce(state, draft => {
        const channel = draft.channels.find(
          c => c.roomId === action.payload.roomID,
        );
        if (channel) {
          // 활성화된 채팅방의 경우 메시지 적용
          if (
            draft.currentChannel &&
            action.payload.roomID === draft.currentChannel.roomId
          ) {
            // 이미 존재하는 메시지인지 확인
            const idx = draft.messages.findIndex(
              m => m.messageID == action.payload.messageID,
            );

            // 메시지 순서확인용
            const lastMessageID =
              draft.messages.length > 0
                ? draft.messages[draft.messages.length - 1].messageID
                : 0;

            if (idx < 0 && action.payload.messageID > lastMessageID)
              draft.messages.push(action.payload);

            const members = channel.members;
            draft.currentChannel.members = members;
          }
        } else {
          // channel 정보를 받아와야하는 channel 추가
          draft.channels.unshift({
            roomId: action.payload.roomID,
            updateDate: null,
            unreadCnt: 0,
          });
        }
      });
    },
    [CHANNEL_LEAVE_MESSAGE_ADD]: (state, action) => {
      return produce(state, draft => {
        const channel = draft.channels.find(
          c => c.roomId === action.payload.roomID,
        );

        if (channel && channel.members.length > 0) {
          // 사용자 제거
          channel.members.splice(
            channel.members.findIndex(m => m.id === action.payload.leaveMember),
            1,
          );

          // 활성화된 채널의 경우만 바로 적용
          if (
            draft.currentChannel &&
            action.payload.roomID === draft.currentChannel.roomId
          ) {
            // 이미 존재하는 메시지인지 확인
            const idx = draft.messages.findIndex(
              m => m.messageID == action.payload.messageID,
            );

            // 메시지 순서확인용
            const lastMessageID =
              draft.messages.length > 0
                ? draft.messages[draft.messages.length - 1].messageID
                : 0;

            if (idx < 0 && action.payload.messageID > lastMessageID)
              draft.messages.push(action.payload);

            const members = channel.members;
            draft.currentChannel.members = members;
          }
        } else {
          // channel 정보를 받아와야하는 channel 추가
          draft.channels.unshift({
            roomId: action.payload.roomID,
            updateDate: null,
            unreadCnt: 0,
          });
        }
      });
    },
    [LEAVE_CHANNEL_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (action.payload) {
          if (!action.payload.leave || action.payload.leave != 'Y') {
            let roomInd = draft.channels.findIndex(
              c => c.roomId == action.payload.roomID,
            );
            if (roomInd != -1) {
              // findIndex에 성공할경우.
              draft.channels.splice(roomInd, 1);
            }
            if (
              action.payload.leave == null ||
              action.payload.leave == undefined ||
              !action.payload.leave
            ) {
              if (
                draft.currentChannel &&
                draft.currentChannel.roomId == action.payload.roomID
              ) {
                draft.currentChannel = null;
                draft.selectId = -1;
              }
            }
          }
        }
      });
    },
    [INVITE_MEMBER_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        // channel의 member정보 update
        const channel = draft.channels.find(
          c => c.roomId == action.payload.roomId,
        );
        if (channel) {
          action.payload.members.forEach(i => {
            const idx = channel.members.findIndex(m => m.id == i.id);
            if (idx == -1) channel.members.push({ ...i, channelAuth: 'N' });
          });

          // currentChannel의 member정보 update
          if (
            draft.currentChannel &&
            draft.currentChannel.roomId == channel.roomId
          ) {
            draft.currentChannel = channel;
          }
        }
      });
    },
    [NEW_CHANNEL]: (state, action) => {
      // 채널 아이콘 즉시 변경
      return produce(state, draft => {
        const { roomId, iconPath } = action.payload;
        if (roomId) {
          const channelIdx = draft.channels.findIndex(c => c.roomId === roomId);

          const channel = channelIdx > -1 ? draft.channels[channelIdx] : null;

          if (!channel) {
            const data = {
              roomId,
              updateDate: null,
            };
            if (iconPath) {
              data.iconPath = iconPath;
            }
            draft.channels.unshift(data);
          } else {
            if (!channel.iconPath && iconPath) {
              const updateChannel = {
                ...channel,
                unreadCnt: 0,
                iconPath,
              };
              draft.channels[channelIdx] = updateChannel;
              draft.currentChannel = updateChannel;
            }
          }
        }
      });
    },
    [MODIFY_CHANNELINFO_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        const roomId = parseInt(action.payload.result.roomID);
        const channelIdx = draft.channels.findIndex(c => c.roomId === roomId);
        if (channelIdx > -1) {
          const { result } = action.payload;
          const categoryIdx = draft.categories.findIndex(
            c => c.categoryCode === result.categoryCode,
          );

          let categoryCode = result.categoryCode;
          let categoryName = '';
          if (categoryIdx > -1) {
            categoryName = draft.categories[categoryIdx].categoryName;
          } else {
            // invalid
            categoryCode = '';
          }

          const newChannel = {
            ...draft.channels[channelIdx],
            roomName: result.roomName,
            description: result.description,
            categoryCode,
            categoryName,
            iconPath: action.payload.iconPath,
          };

          draft.channels[channelIdx] = newChannel;

          if (draft.currentChannel && draft.currentChannel.roomId == roomId) {
            // draft.currentChannel.roomName = action.payload.result.roomName;
            draft.currentChannel = newChannel;
          }
        }
      });
    },
    [UPLOAD_CHANNELICON_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.flag) {
          const roomId = parseInt(action.payload.roomId);
          const channelIdx = draft.channels.findIndex(c => c.roomId === roomId);
          if (channelIdx > -1) {
            draft.channels[channelIdx].iconPath = action.payload.photoPath;
          }

          if (draft.currentChannel.roomId === roomId) {
            draft.currentChannel.iconPath = action.payload.photoPath;
          }
        }
      });
    },
    [READ_MESSAGE]: (state, action) => {
      return produce(state, draft => {
        if (!action.payload.messageID) {
          action.payload.messageID =
            draft.messages.length > 0
              ? draft.messages[draft.messages.length - 1].messageID
              : 0;
        }
      });
    },
    [CHANNEL_LEAVE_OTHER_DEVICE]: (state, action) => {
      return produce(state, draft => {
        let roomInd = draft.channels.findIndex(
          c => c.roomId == action.payload.roomID,
        );
        if (roomInd != -1) {
          // findIndex에 성공할경우.
          draft.channels.splice(roomInd, 1);
        }

        if (
          draft.currentChannel &&
          draft.currentChannel.roomId == action.payload.roomID
        ) {
          draft.currentChannel = null;
          draft.selectId = -1;
        }
      });
    },
    [MODIFY_CHANNELSETTING_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.roomID) {
          const channel = draft.channels.find(
            item => item.roomId === action.payload.roomID,
          );
          channel.settingJSON = action.payload.setting;
          if (
            draft.currentChannel &&
            draft.currentChannel.roomId === action.payload.roomID
          ) {
            // currentRoom 의 경우 setting 정보가 object로 변환되도록 작업
            try {
              draft.currentChannel.settingJSON = JSON.parse(
                action.payload.setting,
              );
            } catch (e) {
              draft.currentChannel.settingJSON = null;
            }
          }
        }
      });
    },
    [CHANNEL_AUTH_CHANGED]: (state, action) => {
      return produce(state, draft => {
        const channel = draft.channels.find(
          c => c.roomId == action.payload.roomId,
        );
        if (channel) {
          channel.members.map(cm => {
            const memberIdx = action.payload.members.findIndex(
              memberId => memberId == cm.id,
            );
            if (memberIdx > -1) {
              cm.channelAuth = action.payload.auth;
            }
          });
        }

        if (draft.currentChannel.roomId == action.payload.roomId) {
          draft.currentChannel.members.map(cm => {
            const memberIdx = action.payload.members.findIndex(
              memberId => memberId == cm.id,
            );
            if (memberIdx > -1) {
              cm.channelAuth = action.payload.auth;
            }
          });
        }
      });
    },
    [RECEIVE_CHANNELSETTING]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.roomID) {
          const getSetting = item => {
            if (!item) {
              return {};
            } else {
              if (typeof item === 'object') {
                return item;
              } else {
                return JSON.parse(item);
              }
            }
          };
          const roomID = Number(action.payload.roomID);
          const channel = draft.channels.find(c => c.roomId == roomID);
          let originSetting = getSetting(channel.settingJSON);
          let setting = getSetting(action.payload.setting);

          for (const [_, key] of Object.keys(setting).entries()) {
            originSetting[key] = setting[key];
          }
          channel.settingJSON = originSetting;

          if (
            !!draft.currentChannel &&
            draft.currentChannel.roomId === roomID
          ) {
            try {
              for (const [_, key] of Object.keys(setting).entries()) {
                draft.currentChannel.settingJSON[key] = setting[key];
              }
            } catch (e) {
              draft.currentChannel.settingJSON = null;
            }
          }
        }
      });
    },
  },
  initialState,
);

export default channelActionHandlers;
