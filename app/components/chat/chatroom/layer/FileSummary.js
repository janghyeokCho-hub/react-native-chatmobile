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
import { getDic, getConfig } from '@/config';
import Svg, { G, Path, Circle } from 'react-native-svg';
import SummaryBack from '@C/chat/chatroom/layer/SummaryBack';
import NetworkError from '@/components/common/NetworkError';
import { useTheme } from '@react-navigation/native';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';

const checkBlackImg = require('@C/assets/ico_check_black.png');

const FileList = ({ files, onSelect, selectMode, onMoveChat }) => {
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
          />
        ))}
    </View>
  );
};

const File = ({ file, onSelect, selectMode, onMoveChat }) => {
  const { sizes } = useTheme();
  const [check, setCheck] = useState(false);
  let selectDownloadOrViewer = getConfig('FileAttachViewMode');
  selectDownloadOrViewer = selectDownloadOrViewer[1];

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
    } else if (
      selectDownloadOrViewer &&
      selectDownloadOrViewer.Download === true
    ) {
      handleMenu();
    } else if (
      selectDownloadOrViewer &&
      selectDownloadOrViewer.Viewer === true
    ) {
      handleViewer();
    }
  };

  const handleMoreOption = () => {
    let buttons = [];
    if (
      selectDownloadOrViewer &&
      selectDownloadOrViewer.Download === true &&
      selectDownloadOrViewer.Viewer === true
    ) {
      buttons = [
        {
          code: 'showContent',
          title: getDic('ShowChat'),
          onPress: () => {
            onMoveChat(file.RoomID, file.MessageID);
          },
        },
        {
          code: 'download',
          title: getDic('Download'),
          onPress: () => {
            handleMenu();
          },
        },
        {
          code: 'viewer',
          title: getDic('RunViewer'),
          onPress: () => {
            handleViewer();
          },
        },
      ];
    } else if (
      selectDownloadOrViewer &&
      selectDownloadOrViewer.Download === true
    ) {
      buttons = [
        {
          code: 'showContent',
          title: getDic('ShowChat'),
          onPress: () => {
            onMoveChat(file.RoomID, file.MessageID);
          },
        },
        {
          code: 'download',
          title: getDic('Download'),
          onPress: () => {
            handleMenu();
          },
        },
      ];
    } else if (
      selectDownloadOrViewer &&
      selectDownloadOrViewer.Viewer === true
    ) {
      buttons = [
        {
          code: 'showContent',
          title: getDic('ShowChat'),
          onPress: () => {
            onMoveChat(file.RoomID, file.MessageID);
          },
        },
        {
          code: 'viewer',
          title: getDic('RunViewer'),
          onPress: () => {
            handleViewer();
          },
        },
      ];
    } else if (
      selectDownloadOrViewer &&
      selectDownloadOrViewer.Download === false &&
      selectDownloadOrViewer.Viewer === false
    ) {
      buttons = [
        {
          code: 'showContent',
          title: getDic('ShowChat'),
          onPress: () => {
            onMoveChat(file.RoomID, file.MessageID);
          },
        },
      ];
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
                    id="그룹_569"
                    data-name="그룹 569"
                    transform="translate(8502 -9848)"
                  >
                    <G
                      id="그룹_559"
                      data-name="그룹 559"
                      transform="translate(-8502 9848.021)"
                    >
                      <Path
                        id="패스_1721"
                        data-name="패스 1721"
                        d="M6,0A6,6,0,1,1,0,6,6,6,0,0,1,6,0Z"
                        fill="#444"
                      />
                      <Circle
                        id="타원_521"
                        data-name="타원 521"
                        cx="6"
                        cy="6"
                        r="6"
                        transform="translate(21 -0.021)"
                        fill="#444"
                      />
                      <Circle
                        id="타원_522"
                        data-name="타원 522"
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

  const { roomID, chineseWall } = route.params;
  console.log(chineseWall);

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

    if (select) setSelectItems([]);
  };

  const handleMoveChat = (roomID, messageID) => {
    navigation.navigate('MoveChat', { roomID, messageID });
  };

  const handleSelect = () => {
    handleSetSelect();

    if (select) {
      // 이전 상태가 선택모드였다면 변경시 cnt도 0으로 초기화

      if (selectItems.length > 0) {
        // [0] PC [1] MOBILE
        const downloadOption = getConfig('FileAttachViewMode') || [];
        // 다운로드가 금지되어 있는 경우
        if (
          downloadOption.length !== 0 &&
          downloadOption[1].Download === false
        ) {
          Alert.alert(
            null,
            getDic('Block_FileDownload', '파일 다운로드가 금지되어 있습니다.'),
            [{ text: getDic('Ok') }],
            {
              cancelable: true,
            },
          );
        }
        // 다운로드 가능 && 선택개수 5개 미만
        else if (selectItems.length <= 5) {
          let downloadMsgObject = null;
          let arrDownloadList = [];
          selectItems.forEach(item => {
            arrDownloadList.push(
              new Promise((resolove, reject) => {
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

          Promise.all(arrDownloadList).then(values => {
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
            '5개 이상 다운로드 할 수 없습니다.',
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
        // 추가
        setSelectItems([...selectItems, item]);
      } else {
        Alert.alert(
          null,
          '5개 이상 선택할 수 없습니다.',
          [{ text: getDic('Ok') }],
          {
            cancelable: true,
          },
        );

        return false;
      }
    } else {
      const deleteArr = selectItems.filter(
        select => select.token !== item.token,
      );
      setSelectItems(deleteArr);
    }
    return true;
  };

  useEffect(() => {
    // fileData 호출
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
          const result = data.result.filter(item => {
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
  }, []);

  const handleUpdate = value => {
    const nativeEvent = value.nativeEvent;
    const top =
      (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y) /
      nativeEvent.contentSize.height;

    if (top > 0.8 && !loading && !pageEnd) {
      // 하위 페이지 추가
      setLoading(true);
      getRoomFiles({
        roomID: roomID,
        page: pageNum + 1,
        loadCnt: loadCnt,
        isImage: 'N',
      }).then(({ data }) => {
        if (data.status == 'SUCCESS') {
          if (data.result.length > 0) {
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
        if (firstDate != compareDate) {
          if (firstDate != 0 && sameDateArr.length > 0)
            returnJSX.push(
              <FileList
                key={`flist_${firstDate}`}
                files={sameDateArr}
                selectMode={select}
                onSelect={handleSelectItem}
                onMoveChat={handleMoveChat}
              />,
            );

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

        if (index == data.length - 1 && sameDateArr.length > 0) {
          returnJSX.push(
            <FileList
              key={`flist_${firstDate}`}
              files={sameDateArr}
              selectMode={select}
              onSelect={handleSelectItem}
              onMoveChat={handleMoveChat}
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
                    id="패스_2901"
                    data-name="패스 2901"
                    d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                    transform="translate(704.432 304.223) rotate(180)"
                    fill="#222"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.titleView}>
            <Text style={styles.modaltit}>{getDic('FileSummary')}</Text>
          </View>
          {networkState && (
            <View style={styles.okbtnView}>
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
                      <Text>{getDic('chooseFile')}</Text>
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
                        {getDic('Save')}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {networkState && (
          <>
            {(files && files.length > 0 && (
              <ScrollView onScroll={handleUpdate}>{drawData(files)}</ScrollView>
            )) || (
              <View style={styles.noFiles}>
                <Text>{getDic('Msg_FileNotExist')}</Text>
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

export default FileSummary;
