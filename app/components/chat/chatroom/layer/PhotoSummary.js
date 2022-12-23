import React, { useState, useEffect } from 'react';
import { getRoomFiles } from '@API/message';
import * as file from '@/lib/device/file';
import LoadingWrap from '@/components/common/LoadingWrap';
import { format } from 'date-fns';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import ToggleButton from '@/components/common/buttons/ToggleButton';
import { ScrollView } from 'react-native-gesture-handler';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { CommonActions } from '@react-navigation/native';
import { reqThumbnail } from '@/lib/api/api';
import { useSelector } from 'react-redux';
import { getDic } from '@/config';
import SummaryBack from '@C/chat/chatroom/layer/SummaryBack';
import ImageModal from '@COMMON/layout/ImageModal';
import NetworkError from '@/components/common/NetworkError';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';
import { withSecurityScreen } from '@/withSecurityScreen';

const initNoImg = require('@C/assets/no_image.jpg');
const checkBlackImg = require('@C/assets/ico_check_black.png');

const PhotoList = ({
  photos,
  onSelect,
  selectMode,
  handleSetSelect,
  onMoveChat,
}) => {
  return (
    <View style={styles.photoList}>
      {photos &&
        photos.map(item => (
          <Photo
            key={item.FileID}
            photo={item}
            onSelect={onSelect}
            selectMode={selectMode}
            handleSetSelect={handleSetSelect}
            onMoveChat={onMoveChat}
          />
        ))}
    </View>
  );
};

const Photo = ({
  photo,
  onSelect,
  selectMode,
  handleSetSelect,
  onMoveChat,
}) => {
  const { colors } = useTheme();
  const [check, setCheck] = useState(false);
  const [thumbnailURL, setThumbnailURL] = useState(initNoImg);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setCheck(false);
  }, [selectMode]);

  useEffect(() => {
    setThumbnailURL({ uri: reqThumbnail(photo.FileID) });
  }, [photo]);

  const handleCheck = (fileID, fileName) => {
    if (onSelect({ token: fileID, name: fileName }, !check)) {
      setCheck(!check);
    }
  };

  const handlePress = () => {
    if (selectMode) {
      handleCheck(photo.FileID, photo.FileName);
    } else {
      setShowModal(true);
    }
  };

  const handleHiddenModal = () => {
    setShowModal(false);
  };

  const handleLongPress = () => {
    handleSetSelect();
    handleCheck(photo.FileID, photo.FileName);
  };

  const handleMove = () => {
    onMoveChat(photo.RoomID, photo.MessageID);
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} onLongPress={handleLongPress}>
        <View
          style={[
            styles.photoView,
            selectMode && check
              ? { ...styles.chkPhotoView, borderColor: colors.primary }
              : null,
          ]}
        >
          {selectMode && (
            <View style={styles.toggleBtn}>
              <ToggleButton
                checked={check}
                onPress={handlePress}
                style={{ width: 20, height: 20 }}
              />
            </View>
          )}
          <Image style={styles.photoImg} source={thumbnailURL} />
        </View>
      </TouchableOpacity>
      {showModal && (
        <ImageModal
          type="ROOM"
          show={showModal}
          image={photo.FileID}
          hasDownload={true}
          onClose={handleHiddenModal}
          onMove={handleMove}
        />
      )}
    </>
  );
};

const PhotoSummary = ({ route, navigation }) => {
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

  const handleMoveChat = (id, messageID) => {
    navigation.navigate('MoveChat', { roomID: id, messageID });
  };

  const handleSetSelect = () => {
    setSelect(!select);

    if (select) {
      setSelectItems([]);
    }
  };

  const handleSelect = () => {
    handleSetSelect();

    if (select) {
      // 이전 상태가 선택모드였다면 변경시 cnt도 0으로 초기화

      if (selectItems.length > 0) {
        // TODO: 차후 멀티다운로드로 수정 필요
        // 만료처리 등 처리 필요

        // 다운로드가 금지되어 있는 경우
        if (filePermission.download === 'N') {
          Alert.alert(
            null,
            getDic('Block_FileDownload', '파일 다운로드가 금지되어 있습니다.'),
            [{ text: getDic('Ok') }],
            {
              cancelable: true,
            },
          );
        }
        // 다운로드 가능 && 선택개수 15개 미만
        else if (selectItems.length <= 15) {
          let downloadMsgObject = null;
          let arrDownloadList = [];
          selectItems.forEach(item => {
            arrDownloadList.push(
              new Promise((resolove, _) => {
                file.downloadByToken(
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
            '15개 이상 다운로드 할 수 없습니다.',
            [{ text: getDic('Ok') }],
            { cancelable: true },
          );
        }
      }
      setSelectItems([]);
    }
  };

  const handleSelectItem = (item, check) => {
    if (check) {
      if (selectItems.length < 15) {
        // 추가
        setSelectItems([...selectItems, item]);
      } else {
        Alert.alert(
          null,
          '15개 이상 선택할 수 없습니다.',
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
    if (networkState) {
      setLoading(true);
      getRoomFiles({
        roomID: roomID,
        page: pageNum,
        loadCnt: loadCnt,
        isImage: 'Y',
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
        isImage: 'Y',
      }).then(({ data }) => {
        if (data.status === 'SUCCESS') {
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
          if (firstDate != 0 && sameDateArr.length > 0) {
            returnJSX.push(
              <PhotoList
                key={`plist_${firstDate}`}
                photos={sameDateArr}
                selectMode={select}
                onSelect={handleSelectItem}
                handleSetSelect={handleSetSelect}
                onMoveChat={handleMoveChat}
              />,
            );
          }

          returnJSX.push(
            <View style={styles.datetxt} key={`plist_date_${item.SendDate}`}>
              <Text style={{ fontSize: sizes.default }}>
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
            <PhotoList
              key={`plist_${firstDate}`}
              photos={sameDateArr}
              selectMode={select}
              onSelect={handleSelectItem}
              handleSetSelect={handleSetSelect}
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
            <Text style={styles.modaltit}>
              {getDic('PhotoSummary', '사진 모아보기')}
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
                        <Text>{getDic('choosePhoto', '사진 선택')}</Text>
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
                          {getDic('Save', '저장')}
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
              <View style={styles.noPhotos}>
                <Text style={{ fontSize: sizes.default }}>
                  {getDic('Msg_ImageNotExist', '사진이 없습니다.')}
                </Text>
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
  photoList: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  photoView: {
    backgroundColor: '#9d9990',
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 5,
    marginBottom: 5,
    width: 120,
    height: 110,
  },
  chkPhotoView: {
    borderWidth: 4,
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  toggleBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
  },
  noPhotos: { width: '100%', alignItems: 'center', marginTop: 30 },
});

export default withSecurityScreen(PhotoSummary);
