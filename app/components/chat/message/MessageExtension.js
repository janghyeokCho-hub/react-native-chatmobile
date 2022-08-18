import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { getDic, getConfig } from '@/config';
import * as messageApi from '@API/message';
import * as channelApi from '@API/channel';
import { convertEumTalkProtocol, getPlainText, isJSONStr } from '@/lib/common';
import Share from 'react-native-share';
import * as RootNavigation from '@/components/RootNavigation';
import Clipboard from '@react-native-clipboard/clipboard';
import { isBlockCheck } from '@/lib/api/orgchart';
import useSWR from 'swr';
import { getBookmarkList, deleteBookmark } from '@API/message';
import { setPostReplyMessage } from '@/modules/message';

const MessageExtension = ({ messageData, onClose, btnStyle }) => {
  const dispatch = useDispatch();
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const currentRoom = useSelector(({ room }) => room.currentRoom);
  const isChannel = useSelector(({ channel }) => !!channel.currentChannel);
  const useMessageDelete = getConfig('UseChatroomDeleteMessage', 'N') === 'Y';
  const useForwardFile = getConfig('UseForwardFile', 'N') === 'Y';
  const useReply = getConfig('UseReply', 'N') === 'Y';
  const { currentChannel } = useSelector(({ channel }) => ({
    currentChannel: channel.currentChannel,
  }));
  const useBookmark = getConfig('UseBookmark', 'N') === 'Y';

  const roomId = isChannel ? currentChannel.roomId : currentRoom.roomID;

  //책갈피 불러오기
  const { data: bookmarkList, mutate: setBookmarkList } = useSWR(
    `bookmark/${roomId}`,
    async () => {
      if (useBookmark === false) {
        return;
      }
      const response = await getBookmarkList(roomId.toString());
      if (response.data.status === 'SUCCESS') {
        return response.data.list;
      }
      return [];
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      initialData: [],
    },
  );

  //책갈피 등록
  const handleAddBookmark = messageData => {
    const sendData = {
      roomId: roomId.toString(),
      messageId: messageData.messageID.toString(),
    };

    messageApi
      .createBookmark(sendData)
      .then(async ({ data }) => {
        let popupMsg;

        if (data?.status == 'SUCCESS') {
          const response = await getBookmarkList(roomId.toString());
          let list = [];

          if (response.data.status === 'SUCCESS') {
            list = response.data.list;
          }
          setBookmarkList(list);
          popupMsg = getDic(
            'Msg_Bookmark_Registeration',
            '책갈피가 등록되었습니다.',
          );
        } else {
          popupMsg = getDic(
            'Msg_Bookmark_Registeration_fail',
            '책갈피가 등록에 실패했습니다.',
          );
        }
        Alert.alert('', popupMsg);
      })
      .catch(error => console.log('Send Error   ', error));
  };

  //책갈피 삭제

  const handleDeleteBookmark = bookmark => {
    const param = {
      roomId: roomId.toString(),
      bookmarkId: bookmark.bookmarkId,
    };
    deleteBookmark(param)
      .then(({ data }) => {
        let popupMsg = '';

        if (data?.status == 'SUCCESS') {
          setBookmarkList(
            bookmarkList?.filter(
              bookmarkOrigin =>
                bookmarkOrigin.bookmarkId !== bookmark.bookmarkId,
            ),
          );
          popupMsg = getDic('Msg_Bookmark_Delete', '책갈피가 삭제되었습니다.');
        } else {
          popupMsg = getDic(
            'Msg_Bookmark_Delete_fail',
            '책갈피 삭제에 실패했습니다.',
          );
        }
        Alert.alert('', popupMsg);
      })
      .catch(error => console.log('Send Error   ', error));
  };

  const buttons = useMemo(() => {
    let modalBtn = [];
    let isBlock = false;
    const message = messageData;
    const { type } = convertEumTalkProtocol(message?.context, {
      messageType: message.messageType === 'C' ? 'channel' : '',
    });
    if (message?.isMine === 'N' && chineseWall.length) {
      const senderInfo = isJSONStr(message?.senderInfo)
        ? JSON.parse(message.senderInfo)
        : message.senderInfo;
      const { blockChat, blockFile } = isBlockCheck({
        targetInfo: {
          ...senderInfo,
          id: message.sender,
        },
        chineseWall,
      });
      const isFile = !!message.fileInfos;
      isBlock = isFile ? blockFile : blockChat;
    }

    if (!isBlock && useReply) {
      modalBtn.push({
        type: 'reply',
        title: getDic('Reply', '답장'),
        onPress: () => {
          dispatch(setPostReplyMessage(message));
        },
      });
    }
    if (type !== 'emoticon') {
      if (!messageData.fileInfos) {
        // copy
        !isBlock &&
          modalBtn.push({
            type: 'copy',
            title: getDic('Copy'),
            onPress: () => {
              Clipboard.setString(getPlainText(messageData.context));
            },
          });
      }

      const isExistOnBookmark = Boolean(
        bookmarkList?.find(
          bookmark => bookmark.messageId === messageData.messageID,
        ),
      );

      const bookmark = bookmarkList?.find((bookmark = {}) => {
        if (bookmark.messageId === messageData.messageID) return bookmark;
      });

      // bookmark
      if (useBookmark && !isBlock) {
        if (isExistOnBookmark === true) {
          modalBtn.push({
            type: 'deleteBookmark',
            title: getDic('DeleteBookmark', '책갈피삭제'),
            onPress: () => {
              handleDeleteBookmark(bookmark);
            },
          });
        } else {
          modalBtn.push({
            type: 'AddBookmark',
            title: getDic('AddBookmark', '책갈피등록'),
            onPress: () => {
              handleAddBookmark(messageData);
            },
          });
        }
      }

      // share
      if (!messageData.fileInfos) {
        !isBlock &&
          modalBtn.push({
            type: 'share',
            title: getDic('Share', '공유하기'),
            onPress: () => {
              const plainText = getPlainText(messageData.context);
              // plainText 와 images 공유?
              Share.open({
                message: plainText,
                title: plainText,
                subject: plainText,
              }).catch(err => {
                err && console.log(err);
              });
            },
          });
      }

      //Forward
      if (!messageData.fileInfos) {
        !isBlock &&
          modalBtn.push({
            type: 'share',
            title: getDic('Msg_Note_Forward', '전달하기'),
            onPress: async () => {
              RootNavigation.navigate('Share', {
                messageData,
                messageType: 'message',
              });
            },
          });
      } else if (useForwardFile) {
        !isBlock &&
          modalBtn.push({
            type: 'share',
            title: getDic('Msg_Note_Forward', '전달하기'),
            onPress: async () => {
              // 파일 토큰 유효검사 로직 추가해야함
              let files = JSON.parse(messageData.fileInfos);
              if (!Array.isArray(files) && files) {
                files = Array(files);
              }
              files = files.map(item => item.token);
              const result = await messageApi.checkFileTokenValidation({
                token: files,
                serviceType: 'CHAT',
              });

              if (result.status === 204) {
                Alert.alert(getDic('Msg_FileExpired', '만료된 파일입니다.'));
                return;
              } else if (result.status === 403) {
                Alert.alert(
                  getDic('Msg_FilePermission', '권한이 없는 파일입니다.'),
                );
                return;
              } else {
                RootNavigation.navigate('Share', {
                  messageData,
                  messageType: 'file',
                });
              }
            },
          });
      }

      // notice
      isChannel &&
        !isBlock &&
        modalBtn.push({
          type: 'notice',
          title: getDic('Notice'),
          onPress: () => {
            if (isBlock) {
              Alert.alert(getDic('BlockChat', '차단된 메시지 입니다.'));
            } else {
              channelApi.setChannelNotice({
                messageID: messageData.messageID,
              });
            }
          },
        });
    } //emoticion end

    // delete
    useMessageDelete &&
      messageData.isMine === 'Y' &&
      modalBtn.push({
        type: 'delete',
        title: getDic('MessageDelete'),
        onPress: () => {
          let token = [];
          if (messageData.fileInfos) {
            if (Array.isArray(JSON.parse(messageData.fileInfos))) {
              token = JSON.parse(messageData.fileInfos).map(f => f.token);
            } else {
              token.push(JSON.parse(messageData.fileInfos).token);
            }
          }
          if (isChannel) {
            // 채널 대화삭제
            messageApi.deleteChannelMessage({
              token,
              messageId: messageData.messageID,
            });
          } else {
            // 대화방 대화삭제
            if (!currentRoom.roomID || !messageData.messageID) {
              return;
            }
            messageApi.delChatroomMessage({
              token,
              roomID: currentRoom.roomID,
              messageIds: [messageData.messageID],
            });
          }
        },
      });

    if (!modalBtn?.length) {
      modalBtn.push({
        type: 'close',
        title: getDic('Close'),
        onPress() {
          return;
        },
      });
    }
    return modalBtn;
  }, [currentRoom, isChannel, messageData, useMessageDelete, chineseWall]);

  return (
    <View>
      {buttons &&
        buttons.map(modalInfo => {
          return (
            <View key={`msgext_${modalInfo.type}`}>
              <TouchableOpacity
                onPress={() => {
                  modalInfo.onPress();
                  onClose();
                }}
              >
                <Text style={btnStyle}>{modalInfo.title}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
    </View>
  );
};

export default MessageExtension;
