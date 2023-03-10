import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoomFiles } from '@API/message';
import LoadingWrap from '@/components/common/LoadingWrap';
import { format } from 'date-fns';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { downloadByToken, downloadByTokenAlert } from '@/lib/device/file';
import { openSynapViewer } from '@/lib/device/viewer';
import ToggleButton from '@/components/common/buttons/ToggleButton';
import {
  convertFileSize,
  getFileExtension,
  fileTypeImage,
} from '@/lib/fileUtil';
import { CommonActions } from '@react-navigation/native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { changeModal, openModal } from '@/modules/modal';
import { getDic } from '@/config';
import Svg, { G, Path, Circle } from 'react-native-svg';
import SummaryBack from '@C/chat/chatroom/layer/SummaryBack';
import NetworkError from '@/components/common/NetworkError';
import { useTheme } from '@react-navigation/native';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';
import { withSecurityScreen } from '@/withSecurityScreen';

const checkBlackImg = require('@C/assets/ico_check_black.png');

const FileList = ({
  files,
  onSelect,
  selectMode,
  onMoveChat,
  filePermission,
}) => {
  return (
    <View style={styles.fileList}>
      {files &&
        files.map(item => (
          <File
            key={item.FileID}
            file={item}
            onSelect={onSelect}
            selectMode={selectMode}
            onMoveChat={onMoveChat}
            filePermission={filePermission}
          />
        ))}
    </View>
  );
};

const File = ({ file, onSelect, selectMode, onMoveChat, filePermission }) => {
  const { sizes } = useTheme();
  const [check, setCheck] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    setCheck(false);
  }, [selectMode]);

  const handleCheck = () => {
    if (onSelect({ token: file.FileID, name: file.FileName }, !check)) {
      setCheck(!check);
    }
  };

  const handleMenu = () => {
    downloadByTokenAlert({ token: file.FileID, fileName: file.FileName });
  };

  const handleViewer = () => {
    openSynapViewer({
      token: file.FileID,
      fileName: file.FileName,
      ext: file.Extension,
      roomID: file.RoomID,
    });
  };

  const handlePress = () => {
    if (selectMode) {
      handleCheck();
    } else if (filePermission.download === 'Y') {
      handleMenu();
    } else if (filePermission.viewer === 'Y') {
      handleViewer();
    }
  };

  const handleMoreOption = () => {
    let buttons = [
      {
        code: 'showContent',
        title: getDic('ShowChat'),
        onPress: () => {
          onMoveChat(file.RoomID, file.MessageID);
        },
      },
    ];

    if (filePermission.download === 'Y') {
      buttons.push({
        code: 'download',
        title: getDic('Download'),
        onPress: () => {
          handleMenu();
        },
      });
    }

    if (filePermission.viewer === 'Y') {
      buttons.push({
        code: 'viewer',
        title: getDic('RunViewer'),
        onPress: () => {
          handleViewer();
        },
      });
    }

    dispatch(
      changeModal({
        modalData: {
          closeOnTouchOutside: true,
          type: 'normal',
          buttonList: buttons,
        },
      }),
    );
    dispatch(openModal());
  };

  return (
    <TouchableOpacity onPress={handlePress} onLongPress={handleMoreOption}>
      <View style={styles.fileBox}>
        <Image
          style={styles.fileTypeImg}
          source={fileTypeImage[getFileExtension(file.Extension)]}
        />
        <View style={styles.fileInfo}>
          <Text style={{ ...styles.fileName, fontSize: sizes.default }}>
            {file.FileName}
          </Text>
          <Text style={styles.fileSize}>
            {getDic('FileSize') + ' ' + convertFileSize(file.FileSize)}
          </Text>
        </View>
        <View style={styles.optionBtn}>
          {(selectMode && (
            <ToggleButton checked={check} onPress={handlePress} />
          )) || (
            <TouchableOpacity onPress={handleMoreOption}>
              <View style={styles.moreOption}>
                <Svg width="15.876" height="16.236" viewBox="0 0 54 12.021">
                  <G
                    id="??????_569"
                    data-name="?????? 569"
                    transform="translate(8502 -9848)"
                  >
                    <G
                      id="??????_559"
                      data-name="?????? 559"
                      transform="translate(-8502 9848.021)"
                    >
                      <Path
                        id="??????_1721"
                        data-name="?????? 1721"
                        d="M6,0A6,6,0,1,1,0,6,6,6,0,0,1,6,0Z"
                        fill="#444"
                      />
                      <Circle
                        id="??????_521"
                        data-name="?????? 521"
                        cx="6"
                        cy="6"
                        r="6"
                        transform="translate(21 -0.021)"
                        fill="#444"
                      />
                      <Circle
                        id="??????_522"
                        data-name="?????? 522"
                        cx="6"
                        cy="6"
                        r="6"
                        transform="translate(42 -0.021)"
                        fill="#444"
                      />
                    </G>
                  </G>
                </Svg>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FileSummary = ({ route, navigation }) => {
  const { sizes, colors } = useTheme();
  const networkState = useSelector(({ app }) => app.networkState);

  const { roomID } = route.params;
  const chineseWall = useSelector(({ login }) => login.chineseWall);

  const filePermission = useSelector(({ login }) => login.filePermission);

  const loadCnt = 30;
  const [select, setSelect] = useState(false);
  const [selectItems, setSelectItems] = useState([]);
  const [files, setFiles] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageEnd, setPageEnd] = useState(false);

  const handleClose = () => {
    navigation.dispatch(CommonActions.goBack());
  };

  const handleSetSelect = () => {
    setSelect(!select);

    if (select) {
      setSelectItems([]);
    }
  };

  const handleMoveChat = (id, messageID) => {
    navigation.navigate('MoveChat', { roomID: id, messageID });
  };

  const handleSelect = () => {
    handleSetSelect();

    if (select) {
      // ?????? ????????? ????????????????????? ????????? cnt??? 0?????? ?????????

      if (selectItems.length) {
        if (filePermission.download !== 'Y') {
          // ??????????????? ???????????? ?????? ??????
          Alert.alert(
            null,
            getDic('Block_FileDownload', '?????? ??????????????? ???????????? ????????????.'),
            [{ text: getDic('Ok') }],
            {
              cancelable: true,
            },
          );
        } else if (selectItems.length <= 5) {
          // ???????????? ?????? && ???????????? 5??? ??????
          let downloadMsgObject = null;
          let arrDownloadList = [];
          selectItems.forEach(item => {
            arrDownloadList.push(
              new Promise((resolove, _) => {
                downloadByToken(
                  { token: item.token, fileName: item.name },
                  data => {
                    downloadMsgObject = data;
                    resolove();
                  },
                );
              }),
            );
          });

          Promise.all(arrDownloadList).then(() => {
            if (downloadMsgObject) {
              Alert.alert(
                null,
                downloadMsgObject.message,
                [{ text: getDic('Ok') }],
                {
                  cancelable: true,
                },
              );
            }
          });
        } else {
          Alert.alert(
            null,
            '5??? ?????? ???????????? ??? ??? ????????????.',
            [{ text: getDic('Ok') }],
            {
              cancelable: true,
            },
          );
        }
      }

      setSelectItems([]);
    }
  };

  const handleSelectItem = (item, check) => {
    if (check) {
      if (selectItems.length < 5) {
        // ??????
        setSelectItems([...selectItems, item]);
      } else {
        Alert.alert(
          null,
          '5??? ?????? ????????? ??? ????????????.',
          [{ text: getDic('Ok') }],
          {
            cancelable: true,
          },
        );

        return false;
      }
    } else {
      const deleteArr = selectItems.filter(
        selectItem => selectItem.token !== item.token,
      );
      setSelectItems(deleteArr);
    }
    return true;
  };

  useEffect(() => {
    // fileData ??????
    // initialData
    if (networkState) {
      setLoading(true);
      getRoomFiles({
        roomID: roomID,
        page: pageNum,
        loadCnt: loadCnt,
        isImage: 'N',
      }).then(({ data }) => {
        if (data.status === 'SUCCESS') {
          const result = data.result?.filter(item => {
            let isBlock = false;
            if (item?.FileID && chineseWall?.length) {
              const senderInfo = isJSONStr(item.SenderInfo)
                ? JSON.parse(item.SenderInfo)
                : item.SenderInfo;
              const { blockFile } = isBlockCheck({
                targetInfo: {
                  ...senderInfo,
                  id: item.sender || senderInfo.sender,
                },
                chineseWall,
              });
              isBlock = blockFile;
            }
            return !isBlock && item;
          });
          setFiles(result);
        } else {
          setFiles([]);
        }
        setLoading(false);
      });
    }
  }, [networkState, chineseWall, roomID, pageNum, loadCnt]);

  const handleUpdate = value => {
    const nativeEvent = value.nativeEvent;
    const top =
      (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y) /
      nativeEvent.contentSize.height;

    if (top > 0.8 && !loading && !pageEnd) {
      // ?????? ????????? ??????
      setLoading(true);
      getRoomFiles({
        roomID: roomID,
        page: pageNum + 1,
        loadCnt: loadCnt,
        isImage: 'N',
      }).then(({ data }) => {
        if (data.status === 'SUCCESS') {
          if (data.result?.length) {
            setFiles([...files, ...data.result]);
            if (data.result.length < loadCnt) {
              setPageEnd(true);
            }
          } else {
            setPageEnd(true);
          }
        } else {
          setPageEnd(true);
        }
        setPageNum(pageNum + 1);
        setLoading(false);
      });
    }
  };

  const drawData = data => {
    let returnJSX = [];
    if (data) {
      let firstDate = 0;
      let sameDateArr = [];
      data.forEach((item, index) => {
        // 86400000 = 1000 * 60 * 60 * 24 (1day)
        const compareDate = Math.floor(item.SendDate / 86400000);
        if (firstDate !== compareDate) {
          if (firstDate !== 0 && sameDateArr.length) {
            returnJSX.push(
              <FileList
                key={`flist_${firstDate}`}
                files={sameDateArr}
                selectMode={select}
                onSelect={handleSelectItem}
                onMoveChat={handleMoveChat}
                filePermission={filePermission}
              />,
            );
          }

          returnJSX.push(
            <View style={styles.datetxt} key={`flist_${firstDate}_txt`}>
              <Text styles={{ fontSize: sizes.default }}>
                {format(new Date(item.SendDate), 'yyyy.MM.dd')}
              </Text>
            </View>,
          );

          firstDate = compareDate;
          sameDateArr = [];
        }

        sameDateArr.push(item);

        if (index === data.length - 1 && sameDateArr.length) {
          returnJSX.push(
            <FileList
              key={`flist_${firstDate}`}
              files={sameDateArr}
              selectMode={select}
              onSelect={handleSelectItem}
              onMoveChat={handleMoveChat}
              filePermission={filePermission}
            />,
          );
        }
      });
    }

    return returnJSX;
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.exitBtnView}>
            <TouchableOpacity onPress={handleClose}>
              <View style={styles.topBtn}>
                <Svg width="7.131" height="12.78" viewBox="0 0 7.131 12.78">
                  <Path
                    id="??????_2901"
                    data-name="?????? 2901"
                    d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                    transform="translate(704.432 304.223) rotate(180)"
                    fill="#222"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.titleView}>
            <Text style={styles.modaltit}>
              {getDic('FileSummary', '?????? ????????????')}
            </Text>
          </View>
          {networkState && (
            <View style={styles.okbtnView}>
              {filePermission.download === 'Y' && (
                <TouchableOpacity onPress={handleSelect}>
                  <View style={{ ...styles.topBtn }}>
                    {!select ? (
                      <View
                        style={{
                          width: '100%',
                          height: '100%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 20,
                        }}
                      >
                        <Text>{getDic('chooseFile', '?????? ??????')}</Text>
                        <Image
                          style={{ marginLeft: 10 }}
                          source={checkBlackImg}
                        />
                      </View>
                    ) : (
                      <>
                        <Text
                          style={{
                            ...styles.colortxt,
                            fontSize: sizes.default,
                            color: colors.primary,
                          }}
                        >
                          {selectItems.length}
                        </Text>
                        <Text style={{ fontSize: sizes.default }}>
                          {getDic('Save', '??????')}
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        {networkState && (
          <>
            {(files && files.length > 0 && (
              <ScrollView onScroll={handleUpdate}>{drawData(files)}</ScrollView>
            )) || (
              <View style={styles.noFiles}>
                <Text>{getDic('Msg_FileNotExist', '????????? ????????????.')}</Text>
              </View>
            )}
          </>
        )}
        {!networkState && <NetworkError />}
      </View>
      {select && <SummaryBack handleSetSelect={handleSetSelect} />}
      {loading && <LoadingWrap isOver={true} />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: getTopPadding(),
    paddingBottom: getBottomPadding(),
  },
  header: {
    width: '100%',
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  exitBtnView: { width: '20%', alignItems: 'flex-start' },
  titleView: { width: '60%', alignItems: 'center' },
  okbtnView: { width: '20%', alignItems: 'flex-end' },
  modaltit: {
    fontSize: 18,
  },
  topBtn: {
    marginLeft: 10,
    padding: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  colortxt: { fontWeight: '700', paddingRight: 5 },
  datetxt: { padding: 10, paddingLeft: 20 },
  fileList: {
    marginBottom: 30,
  },
  fileBox: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileTypeImg: {
    width: 30,
    resizeMode: 'contain',
  },
  fileInfo: {
    marginLeft: 10,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
  },
  moreOption: {
    width: 40,
    height: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  optionBtn: {
    flex: 1,
    alignItems: 'flex-end',
    width: 40,
    height: 50,
    justifyContent: 'center',
  },
  noFiles: { width: '100%', alignItems: 'center', marginTop: 30 },
});

export default withSecurityScreen(FileSummary);
