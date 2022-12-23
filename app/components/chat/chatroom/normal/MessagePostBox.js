import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeFiles } from '@/modules/message';
import Svg, { G, Path, Circle } from 'react-native-svg';
import DocumentPicker from 'react-native-document-picker';
import { useTheme } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {
  View,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  Image,
  PermissionsAndroid,
} from 'react-native';

import ChannelMentionBox from '@C/channel/channelroom/controls/ChannelMentionBox';
import KeySpacer from '@C/common/layout/KeySpacer';
import StickerLayer from '@C/chat/chatroom/controls/StickerLayer';
import ExtensionLayer from '@C/chat/chatroom/controls/ExtensionLayer';
import ShareDocLayer from '@C/chat/chatroom/controls/document/ShareDocLayer';
import { getJobInfo, getSysMsgFormatStr, isJSONStr } from '@/lib/common';
import { getBottomPadding, resetInput } from '@/lib/device/common';
import { getConfig, getDic } from '@/config';
import * as fileUtil from '@/lib/fileUtil';
import * as imageUtil from '@/lib/imagePickUtil';
import * as dbAction from '@/lib/appData/action';
import MessagePostReplyBox from '@/components/reply/MessagePostReplyBox';
import { setPostReplyMessage } from '@/modules/message';
import { openModal, changeModal } from '@/modules/modal';

const ico_plus = require('@C/assets/ico_plus.png');
const ico_send = require('@C/assets/m-send-btn.png');

const MessagePostBox = ({
  postAction,
  disabled,
  scrollToStart,
  onExtension,
  extension,
  isLock,
  navigation,
}) => {
  const { colors, sizes } = useTheme();
  const { currentChannel } = useSelector(({ channel }) => ({
    currentChannel: channel.currentChannel,
  }));

  const currentRoom = useSelector(({ room, channel }) => {
    if (room.currentRoom) {
      return room.currentRoom;
    } else if (channel.currentChannel) {
      return channel.currentChannel;
    } else {
      return {
        members: [],
      };
    }
  });
  const [inputLock, setInputLock] = useState(isLock);
  const [context, setContext] = useState('');
  const [suggestMember, setSuggestMember] = useState([]);
  const [openMentionList, setOpenMentionList] = useState(false);
  const [postInputBox, setPostInputBox] = useState(null);
  const [clear, setClear] = useState(false);

  const [selectImage, setSelectImage] = useState({ files: [], fileInfos: [] });

  const dispatch = useDispatch();
  const { MOBILE } = getConfig('FileAttachMode', {});

  const postReplyMessage = useSelector(
    ({ message }) => message.postReplyMessage,
  );

  const [replyID, setReplyID] = useState(null);
  const [replyInfo, setReplyInfo] = useState(null);

  useEffect(() => {
    if (postReplyMessage) {
      const senderInfo = isJSONStr(postReplyMessage.senderInfo)
        ? JSON.parse(postReplyMessage.senderInfo)
        : postReplyMessage.senderInfo;
      setReplyID(postReplyMessage.messageID);

      const replyData = {
        sender: postReplyMessage.sender,
        senderName: senderInfo?.name,
        deptCode: senderInfo?.deptCode,
        companyCode: senderInfo?.companyCode,
        context: postReplyMessage.context,
        fileInfos: postReplyMessage.fileInfos,
        isMine: postReplyMessage.isMine,
      };
      setReplyInfo(JSON.stringify(replyData));
    } else {
      setReplyID(null);
      setReplyInfo(null);
    }
  }, [postReplyMessage]);

  const handleTextChange = useCallback(
    changedText => {
      const textArr = changedText?.split(' ');
      if (Array.isArray(textArr)) {
        textArr.forEach(text => {
          if (text.search('@') === 0) {
            const target = text.substring(1, text.length);
            setOpenMentionList(false);
            setSuggestMember([]);
            let result = [];
            currentChannel.members.map(data => {
              if (data.name.search(target) == 0) {
                setOpenMentionList(true);
                result.push(data);
              }
            });
            setSuggestMember(result);
          } else if (openMentionList) {
            setOpenMentionList(false);
          }
        });
      }
    },
    [currentChannel, openMentionList],
  );

  const handleSendImage = inputImage => {
    if (inputImage.files.length > 0) {
      postAction({ message: '', filesObj: inputImage, linkObj: null });
      setSelectImage({ files: [], fileInfos: [] });
    }
  };

  const handleSendMessage = useCallback(
    (inputContext, inputImage) => {
      handleSendImage(inputImage);
      if (inputContext.replace(/\s*/, '') != '' && inputContext != '') {
        // if (scrollToStart) scrollToStart();

        // TODO: 메시지 정규식 처리 필요 시 아래 부분에서 처리
        const regExp = new RegExp('(<br>|<br/>|<br />)', 'gi');
        inputContext = inputContext.replace(regExp, '\n');
        inputContext = inputContext.replace(/\s+$/, ''); // 마지막 공백문자 전부 제거

        // 멘션
        if (currentChannel) {
          var mentionArr = [];
          inputContext = inputContext.replace(
            /@([^#\s,;]+)/gm,
            (item, plainText) => {
              // item: @서민주사원
              // plainText: 서민주사원
              if (currentChannel && currentChannel.members) {
                const memberInfo = currentChannel.members.find(
                  m => getJobInfo(m, true) === plainText,
                );
                if (memberInfo) {
                  mentionArr.push({
                    targetCode: memberInfo.id,
                    targetType: 'UR',
                  });
                  return `eumtalk://mention.user.${memberInfo.id}`;
                } else {
                  return item;
                }
              }
            },
          );
        }

        postAction({
          message: inputContext,
          filesObj: null,
          linkObj: null,
          reply: {
            replyID,
            replyInfo,
          },
        });
      }
      dispatch(setPostReplyMessage(null));
    },
    [handleSendImage, dispatch, currentChannel, postAction, replyID, replyInfo],
  );

  useEffect(() => {
    if (currentChannel) {
      handleTextChange(context);
    }
  }, [currentChannel, context, handleTextChange]);

  useEffect(() => {
    setInputLock(isLock);
  }, [isLock]);

  const handleSendFile = () => {
    if (scrollToStart) {
      scrollToStart();
    }
    const fileCtrl = fileUtil.getInstance();
    const files = fileCtrl.getFiles();
    const fileInfos = fileCtrl.getRealFileInfos();
    if (context !== '' || files.length > 0) {
      try {
        postAction({
          message: '',
          filesObj: files.length > 0 ? { files, fileInfos } : null,
          linkObj: null,
        });
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleEmoticon = emoticon => {
    if (scrollToStart) {
      scrollToStart();
    }
    // emoticon만 전송
    postAction({ message: emoticon, filesObj: null, linkObj: null });
    // emoticon은 바로 발송
    onExtension('');
  };

  /**
   * 공동 문서 공유 Layer
   */
  const handleDocumentControl = useCallback(() => {
    if (extension === 'D') {
      onExtension(''); // 창 해제 ( 열려있는 경우 )
    } else {
      onExtension('D'); // 창 설정
    }
  }, [onExtension, extension]);

  const showDocumentPicker = async () => {
    // Pick multiple files
    const { PERMISSIONS, check, request } = PermissionsAndroid;
    try {
      //check permission
      if (Platform.OS === 'android') {
        const permission = await check(PERMISSIONS.READ_EXTERNAL_STORAGE);
        if (!permission) {
          //permission "not granted" yet - request permission
          const requestPermission = await request(
            PERMISSIONS.READ_EXTERNAL_STORAGE,
          );
          if (requestPermission == 'granted') {
            //request granted
            const results = await DocumentPicker.pickMultiple({
              type: [DocumentPicker.types.allFiles],
            });
            handleFileChange(results);
          } else if (requestPermission == 'denied') {
            //request dinied
          }
        } else {
          // permission "granted" - no need to request permission
          const results = await DocumentPicker.pickMultiple({
            type: [DocumentPicker.types.allFiles],
          });
          handleFileChange(results);
        }
      } else {
        //ios
        const results = await DocumentPicker.pickMultiple({
          type: [DocumentPicker.types.allFiles],
        });
        handleFileChange(results);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  const handleImageChange = file => {
    // console.log('handleImageChange=====');
    // console.log(file);
    if (file) {
      if (Platform.OS === 'ios') {
        handleImageChangeForiOS(file);
      } else {
        handleImageChangeForAndroid(file);
      }
    }
  };

  // const handleImageChangeForiOS = async file => {
  //   // console.log(file.type);
  //   const fileCtrl = fileUtil.getInstance();
  //   const files = [];

  //   let filename = file.uri.split('/');
  //   filename = filename[filename.length - 1];
  //   files.push({
  //     name: filename,
  //     size: file.fileSize,
  //     type: file.type,
  //     uri: file.path ? file.path : file.uri,
  //   });

  //   if (files.length > 0) {
  //     const appendResult = fileCtrl.appendFiles(files);
  //     if (appendResult.result == 'SUCCESS') {
  //       await fileCtrl.setThumbDataiOSURL();
  //       dispatch(changeFiles({ files: fileCtrl.getFileInfos() }));
  //       setSelectImage({
  //         files: fileCtrl.getFiles(),
  //         fileInfos: fileCtrl.getFileInfos(),
  //       });
  //       setContext(context + ' ');
  //       // handleSendFile();
  //       fileCtrl.clear();
  //     } else {
  //       Alert.alert(
  //         null,
  //         appendResult.message,
  //         [
  //           {
  //             text: getDic('Ok'),
  //           },
  //         ],
  //         { cancelable: true },
  //       );
  //     }
  //   }
  // };
  const handleImageChangeForiOS = async file => {
    // console.log(file.type);
    const fileCtrl = fileUtil.getInstance();
    const files = [];

    // let filename = file.uri.split('/');
    // filename = filename[filename.length - 1];
    files.push(file);

    if (files.length > 0) {
      const appendResult = fileCtrl.appendFiles(files);
      if (appendResult.result === 'SUCCESS') {
        await fileCtrl.setThumbDataiOSURL();
        dispatch(changeFiles({ files: fileCtrl.getFileInfos() }));
        // setSelectImage({
        //   files: fileCtrl.getFiles(),
        //   fileInfos: fileCtrl.getFileInfos(),
        // });
        // setContext(context + ' ');
        handleSendFile();
        fileCtrl.clear();
      } else {
        Alert.alert(
          null,
          appendResult.message,
          [
            {
              text: getDic('Ok'),
            },
          ],
          { cancelable: true },
        );
      }
    }
  };

  const handleImageChangeForAndroid = async file => {
    const fileCtrl = fileUtil.getInstance();
    const files = [];
    files.push(file);
    // if (file.fileName == null) {
    //   let filename = file.uri.split('/');
    //   filename = filename[filename.length - 1];
    //   files.push({
    //     name: filename,
    //     size: file.fileSize,
    //     type: file.type,
    //     uri: file.path ? file.path : file.uri,
    //     path: file.path ? file.path : file.uri,
    //   });
    // } else {
    //   files.push({
    //     name: file.fileName,
    //     size: file.fileSize,
    //     type: file.type,
    //     uri: file.uri, //uri: file.path ? file.path : file.uri,
    //     path: file.path,
    //   });
    // }
    if (files.length > 0) {
      const appendResult = fileCtrl.appendFiles(files);
      if (appendResult.result == 'SUCCESS') {
        await fileCtrl.setThumbDataURL();
        dispatch(changeFiles({ files: fileCtrl.getFileInfos() }));
        handleSendFile();
        // setSelectImage({
        //   files: fileCtrl.getFiles(),
        //   fileInfos: fileCtrl.getFileInfos(),
        // });
        // setContext(context + ' ');
        fileCtrl.clear();
      } else {
        Alert.alert(
          null,
          appendResult.message,
          [
            {
              text: getDic('Ok'),
            },
          ],
          { cancelable: true },
        );
      }
    }
  };

  const handleFileChange = async files => {
    const fileCtrl = fileUtil.getInstance();
    if (files.length > 0) {
      const appendResult = fileCtrl.appendFiles(files);
      if (appendResult.result === 'SUCCESS') {
        await fileCtrl.setThumbDataURL();
        dispatch(changeFiles({ files: fileCtrl.getFileInfos() }));
        handleSendFile();
        fileCtrl.clear();
      } else {
        if (appendResult.message === 'LIMIT_FILE_EXTENSION') {
          Alert.alert(
            null,
            getDic('Msg_LimitFileExt'),
            [
              {
                text: getDic('Ok'),
              },
            ],
            { cancelable: true },
          );
        } else {
          const fileSizeLimit = getConfig('File.limitUnitFileSize');
          Alert.alert(
            null,
            getSysMsgFormatStr(getDic('Msg_LimitFileSize'), [
              {
                type: 'Plain',
                data: fileUtil.convertFileSize(fileSizeLimit),
              },
            ]),
            [
              {
                text: getDic('Ok'),
              },
            ],
            { cancelable: true },
          );
        }
      }
    }
  };

  const extensionCallback = type => {
    Keyboard.dismiss();
    if (type === 'file') {
      dispatch(
        changeModal({
          modalData: {
            type: 'upload',
            currentRoom,
            navigation,
            onUploadFile: () => showDocumentPicker(),
            onShareDocLayer: () => handleDocumentControl(),
          },
        }),
      );
      dispatch(openModal());
    } else if (type === 'camera') {
      imageUtil.selectImageWithCamera(
        data => {
          if (data.error) {
            console.log(data.error);
            Alert.alert(
              null,
              `오류가 발생하였습니다.\n관리자에게 문의 부탁드립니다.\n오류코드 : Native Error - ${
                data.error
              }`,
              [{ text: getDic('Ok') }],
            );
          } else {
            handleImageChange(data);
          }
        },
        () => {},
      );
    } else if (type === 'album') {
      if (Platform.OS === 'android') {
        const { PERMISSIONS, check, request } = PermissionsAndroid;
        check(PERMISSIONS.READ_EXTERNAL_STORAGE).then(result => {
          if (result) {
            // ==== PERMISSION GRANTED====
            navigation.navigate('ImageList', {
              postAction: postAction,
              handleImageChange: handleImageChange,
              handleFileChange: handleFileChange,
              assetType: 'Photos',
            });
          } else {
            // ====REQUEST PERMISSION====
            request(PERMISSIONS.READ_EXTERNAL_STORAGE).then(response => {
              if (response === 'granted') {
                //====REQUEST GRANTED====
                navigation.navigate('ImageList', {
                  postAction: postAction,
                  handleImageChange: handleImageChange,
                  handleFileChange: handleFileChange,
                  assetType: 'Photos',
                });
              } else {
                //====REQUEST DENIED====
              }
            });
          }
        });
      } else {
        // ==== IOS =====
        navigation.navigate('ImageList', {
          postAction: postAction,
          handleImageChange: handleImageChange,
          handleSendFile: handleSendFile,
          handleFileChange: handleFileChange,
          assetType: 'Photos',
        });
      }
      // ====ORIGINAL====
      // imageUtil.selectImageWithLibrary(
      //   data => {
      //     handleImageChange(data);
      //   },
      //   () => {},
      // );
    } else if (type === 'video') {
      if (Platform.OS === 'android') {
        const { PERMISSIONS, check, request } = PermissionsAndroid;
        check(PERMISSIONS.READ_EXTERNAL_STORAGE).then(result => {
          if (result) {
            // ==== PERMISSION GRANTED====
            navigation.navigate('ImageList', {
              postAction: postAction,
              handleImageChange: handleImageChange,
              handleFileChange: handleFileChange,
              assetType: 'Videos',
            });
          } else {
            // ====REQUEST PERMISSION====
            request(PERMISSIONS.READ_EXTERNAL_STORAGE).then(response => {
              if (response === 'granted') {
                //====REQUEST GRANTED====
                navigation.navigate('ImageList', {
                  postAction: postAction,
                  handleImageChange: handleImageChange,
                  handleFileChange: handleFileChange,
                  assetType: 'Videos',
                });
              } else {
                //====REQUEST DENIED====
              }
            });
          }
        });
      } else {
        // ==== IOS =====
        navigation.navigate('ImageList', {
          postAction: postAction,
          handleImageChange: handleImageChange,
          handleSendFile: handleSendFile,
          handleFileChange: handleFileChange,
          assetType: 'Videos',
        });
      }
      // ====ORIGINAL====
      // imageUtil.selectImageWithLibrary(
      //   data => {
      //     handleImageChange(data);
      //   },
      //   () => {},
      // );
    } else if (type === 'image') {
      postAction({
        message: '',
        filesObj: selectImage.files.length > 0 ? selectImage : null,
        linkObj: null,
      });
      setSelectImage({ files: [], fileInfos: [] });
    } else if (type === 'test') {
      dbAction.updateUnreadCount({
        roomID: currentRoom.roomID,
        messageId: 12589,
      });
      dbAction.updateUnreadCount({
        roomID: currentRoom.roomID,
        messageId: 12588,
      });
      dbAction.updateUnreadCount({
        roomID: currentRoom.roomID,
        messageId: 12590,
      });
    }
  };

  const getPlaceholder = useMemo(() => {
    if (disabled) {
      return getDic('Msg_ImpossibleChat', '채팅이 불가능한 공간입니다.');
    } else if (isLock || inputLock) {
      return getDic('Msg_LockInputMobile', '대화가 잠긴 방입니다.');
    } else {
      return '';
    }
  }, [isLock, inputLock, disabled]);

  return (
    <>
      {openMentionList && (
        <ChannelMentionBox
          members={suggestMember}
          onPress={user => {
            const name = `@${getJobInfo(user, true)}`;
            let tempContext = context.split(' ');
            let result = '';
            tempContext[tempContext.length - 1] = name;
            tempContext.map(t => {
              result += t + ' ';
            });
            setContext(result);
            setOpenMentionList(false);
            if (postInputBox) {
              postInputBox.focus();
            }
          }}
        />
      )}

      {!openMentionList && postReplyMessage && (
        <MessagePostReplyBox replyMessage={postReplyMessage} roomType="CHAT" />
      )}
      <View style={styles.messageInputWrap}>
        <View style={styles.buttonBox}>
          {(typeof MOBILE === 'undefined' || MOBILE.upload !== false) && (
            <TouchableOpacity
              onPress={e => {
                if (!disabled && !inputLock) {
                  if (extension === 'E') {
                    onExtension('');
                  } else {
                    onExtension('E');
                  }
                  Keyboard.dismiss();
                  e.stopPropagation();
                }
              }}
            >
              <View style={[styles.extensionBtn, { marginRight: 10 }]}>
                <View>
                  <Image source={ico_plus} />
                </View>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            disabled={disabled}
            onPress={e => {
              if (!disabled && !inputLock) {
                if (extension == 'S') {
                  onExtension('');
                } else {
                  onExtension('S');
                }
                Keyboard.dismiss();
                e.stopPropagation();
              }
            }}
          >
            <View style={styles.extensionBtn}>
              <Svg width="18.798" height="18.798" viewBox="0 0 18.798 18.798">
                <Path
                  d="M9.4,18.8A9.4,9.4,0,1,0,0,9.4,9.4,9.4,0,0,0,9.4,18.8Zm0-17.44A8.04,8.04,0,1,1,1.359,9.4,8.057,8.057,0,0,1,9.4,1.359Z"
                  fill="#999"
                />
                <Path
                  d="M138.561,144.952a1.076,1.076,0,1,0-.759-.317A1.072,1.072,0,0,0,138.561,144.952Z"
                  transform="translate(-131.993 -137.093)"
                  fill="#999"
                />
                <Path
                  d="M273.428,144.952a1.076,1.076,0,1,0-.759-.317A1.052,1.052,0,0,0,273.428,144.952Z"
                  transform="translate(-261.469 -137.093)"
                  fill="#999"
                />
                <Path
                  d="M128.641,271.19c3.5,0,4.518-2.355,4.564-2.446a.687.687,0,0,0-.362-.895.662.662,0,0,0-.883.362c-.034.068-.747,1.619-3.307,1.619-2.48,0-2.922-1.461-2.944-1.529v.011l-1.325.328C124.417,268.744,125.062,271.19,128.641,271.19Z"
                  transform="translate(-119.412 -257.091)"
                  fill="#999"
                />
              </Svg>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.messageInput,
            { backgroundColor: disabled || inputLock ? '#DDD' : '#FFF' },
          ]}
        >
          <TextInput
            editable={!disabled && !inputLock}
            autoCorrect={false}
            placeholderTextColor="#AAA"
            multiline
            numberOfLines={1}
            onChangeText={text => {
              if (!clear) {
                setContext(text);
              } else {
                resetInput(postInputBox);
              }
            }}
            onFocus={e => {
              onExtension('');
            }}
            ref={input => {
              setPostInputBox(input);
            }}
            value={context === '' ? null : context}
            style={{ ...styles.messagePostBox, fontSize: sizes.default }}
            placeholder={getPlaceholder}
          />
        </View>
        <View style={styles.sendBtnWrap}>
          {(inputLock && (
            <TouchableOpacity
              onPress={() => {
                setInputLock(false);
              }}
            >
              <View style={[styles.sendBtn, { backgroundColor: '#999' }]}>
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 16.124 16.124"
                >
                  <G transform="translate(-119 -286.5)">
                    <Circle
                      cx="8.062"
                      cy="8.062"
                      r="8.062"
                      transform="translate(119 286.5)"
                      fill="#929292"
                    />
                    <G transform="translate(124.375 291.203)">
                      <G transform="translate(0 0)">
                        <Path
                          d="M4.85,6.651H.693A.718.718,0,0,1,0,5.912V2.957a.718.718,0,0,1,.693-.74h.346V1.848A1.8,1.8,0,0,1,2.771,0,1.8,1.8,0,0,1,4.5,1.848v.369H4.85a.718.718,0,0,1,.692.74V5.912A.717.717,0,0,1,4.85,6.651ZM2.8,3.263a.56.56,0,0,0-.56.56V5.007a.56.56,0,1,0,1.12,0V3.823A.56.56,0,0,0,2.8,3.263ZM2.771.739A1.077,1.077,0,0,0,1.732,1.848v.369H3.811V1.848A1.077,1.077,0,0,0,2.771.739Z"
                          transform="translate(0 0)"
                          fill="#f5f5f5"
                        />
                      </G>
                    </G>
                  </G>
                </Svg>
              </View>
            </TouchableOpacity>
          )) || (
            <TouchableOpacity
              disabled={disabled || context === '' || clear}
              onPress={() => {
                if (!disabled && !inputLock) {
                  let inputContext = context;
                  let inputImage = selectImage;
                  setContext('');
                  if (Platform.OS === 'android') {
                    resetInput(postInputBox);
                  } else {
                    resetInput(postInputBox);

                    // ios 저성능 device에서 textinput 밀림현상 처리
                    setClear(true);
                    setTimeout(() => {
                      setClear(false);
                    }, 100);
                  }
                  handleSendMessage(inputContext, inputImage);
                }
              }}
            >
              <View
                style={[
                  styles.sendBtn,
                  // ??
                  { backgroundColor: !context == '' ? colors.primary : '#999' },
                ]}
              >
                <Image source={ico_send} style={styles.sendBtn_ico} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <KeySpacer
        spacing={extension === '' ? getBottomPadding() : 0}
        style={{ backgroundColor: '#F9F9F9' }}
      />
      {selectImage &&
        selectImage.fileInfos &&
        selectImage.fileInfos.length > 0 && (
          <View style={styles.extensionPreviewBox}>
            <TouchableOpacity
              onPress={e => {
                extensionCallback('image');
              }}
            >
              <View style={styles.extensionPreviewUnit}>
                <FastImage
                  source={{
                    uri: selectImage
                      ? selectImage.fileInfos[0].thumbDataURL
                      : '',
                    priority: FastImage.priority.high,
                  }}
                  onError={e => {
                    // console.log('no Image');
                  }}
                  style={{ width: '100%', height: '100%', borderRadius: 5 }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.extensionPreviewCloseBtn}
              onPress={e => {
                setSelectImage({ files: [], fileInfos: [] });
              }}
            >
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 16 16"
              >
                <G transform="translate(0.488)">
                  <Path
                    d="M8,0A8,8,0,1,1,0,8,8,8,0,0,1,8,0Z"
                    transform="translate(-0.488)"
                    fill="#999"
                  />
                  <G transform="translate(4.513 5.224)">
                    <Path
                      d="M128.407,133.742a.427.427,0,0,0,.294.12.414.414,0,0,0,.294-.12l2.284-2.165,2.284,2.165a.427.427,0,0,0,.294.12.414.414,0,0,0,.294-.12.39.39,0,0,0,0-.565l-2.277-2.158,2.277-2.165a.39.39,0,0,0,0-.564.437.437,0,0,0-.6,0l-2.277,2.165L129,128.3a.444.444,0,0,0-.6,0,.39.39,0,0,0,0,.564l2.284,2.158-2.277,2.165A.371.371,0,0,0,128.407,133.742Z"
                      transform="translate(-128.279 -128.173)"
                      fill="#fff"
                    />
                  </G>
                </G>
              </Svg>
            </TouchableOpacity>
          </View>
        )}
      {/* 확장 메뉴 목록 */}
      {extension === 'E' && <ExtensionLayer onClick={extensionCallback} />}
      {/* 이모티콘 목록 */}
      {extension === 'S' && <StickerLayer onClick={handleEmoticon} />}
      {/* 공유파일 목록 */}
      {extension === 'D' && (
        <ShareDocLayer
          handleDocumentControl={handleDocumentControl}
          postAction={postAction}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  messageInputWrap: {
    marginTop: 0,
    borderTopColor: '#DDDDDD',
    borderTopWidth: 0.5,
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  buttonBox: {
    /**
     * 2021.04.30
     * minWidth, maxWidth
     *
     * 버튼박스에 들어가는 레이어는 1개당 width=40
     * 1. 레이어 종류는 ExtensionLayer, EmoticonLayer 두개가 최대 (최대 width 80)
     * 2. 두 레이어 중 ExtensionLayer만 파일업로드 설정에 의해 사라질 수 있다는 전제로 결정한 width 값임
     *
     * 추후 조건이 변경될 경우 수정 필요
     * 수정 ex) 활성화된 레이어 숫자에 맞춰서 width 자동계산
     */
    minWidth: 40,
    maxWidth: 80,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  extensionBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#BBB',
  },
  messageInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    padding: 5,
    borderRadius: 15,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  messagePostBox: {
    width: '100%',
    minHeight: 20,
    maxHeight: 100,
    paddingTop: 0,
    marginLeft: 5,
    paddingBottom: 0,
  },
  sendBtnWrap: {
    width: 40,
  },
  sendBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  sendBtn_ico: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },

  extensionPreviewBox: {
    width: '100%',
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  extensionPreviewUnit: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderRadius: 5,
  },
  extensionPreviewCloseBtn: {
    width: 35,
    height: 35,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  extensionPreviewSendBtn: {
    width: 40,
    height: 40,
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(200,200,200,0.7)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessagePostBox;
