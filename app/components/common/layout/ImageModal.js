import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import ImageViewer from 'react-native-image-zoom-viewer';
import { getRoomImages, getFileInfo } from '@/lib/api/message';
import { reqImage } from '@API/api';
import {
  getTopPadding,
  getBottomPadding,
  getScreenWidth,
} from '@/lib/device/common';
import { getDic, getConfig } from '@/config';
import { downloadByTokenAlert, downloadAndShare } from '@/lib/device/file';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';

const loadingImg = require('@C/assets/loading.gif');
const cancelBtnImg = require('@C/assets/ico_message_delete.png');

const _imagePreviewLoadSize = 15;

const ImageModal = ({ type, show, image, hasDownload, onClose, onMove }) => {
  const chineseWall = useSelector(({ login }) => login.chineseWall);

  const [roomID, setRoomID] = useState(-1);
  const [sources, setSources] = useState(null);
  const [index, setIndex] = useState(0);
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [allSize, setAllSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const selectDownloadOrViewer = useMemo(
    // 다운로드 금지 설정이 없는 경우 기본값: 다운로드 허용, 뷰어 미설정
    () =>
      getConfig('FileAttachViewMode')?.[1] || {
        Download: true,
        Viewer: false,
      },
    [],
  );

  useEffect(() => {
    if (type === 'ROOM' && show) {
      getFileInfo({
        fileId: image,
      })
        .then(({ data }) => {
          const fileInfo = data.result;
          setRoomID(fileInfo.roomID);
          return getRoomImages({
            roomID: fileInfo.roomID,
            token: image,
            type: 'C',
            cnt: _imagePreviewLoadSize,
          });
        })
        .then(({ data }) => {
          const results = data.images.filter(item => {
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

          // 중간 차단된 메시지인 파일로부터 rowNum 이 꼬이기 때문에 다시 지정
          let rowNum = 1;
          const rNum = data.cntInfo.rowNum;
          const images = results.map((item, i) => {
            const newRNUM = i + 1;
            if (item.RNUM == rNum) {
              rowNum = newRNUM;
            }
            item.RNUM = newRNUM;
            return item;
          });
          let realIndex = images.findIndex(item => item.FileID == image);

          const maxCnt = images.length;

          const sourceImages = images.map(item => {
            return {
              url: reqImage(item.FileID),
              _item: item,
            };
          });

          setSources(sourceImages);
          setIndex(realIndex);
          setVirtualIndex(rowNum);
          setAllSize(maxCnt);
        });
    } else if (type === 'NORMAL' && show) {
      setSources([
        {
          url: image,
        },
      ]);

      setVirtualIndex(1);
      setAllSize(1);
    }
  }, [show, chineseWall]);

  const handleChange = changeIdx => {
    let derection = '';

    if (virtualIndex - 1 > 1 && changeIdx == 0) {
      // 데이터 로드
      derection = 'B';
    } else if (changeIdx == sources.length - 1 && virtualIndex + 1 < allSize) {
      // 데이터 로드
      derection = 'N';
    }

    if (derection != '' && type == 'ROOM') {
      const findToken = sources[changeIdx]._item.FileID;
      setLoading(true);
      getRoomImages({
        roomID: roomID,
        token: findToken,
        type: derection,
        cnt: _imagePreviewLoadSize,
      }).then(({ data }) => {
        const sourceImages = data.images.map(item => {
          return {
            url: reqImage(item.FileID),
            _item: item,
            props: {
              source: null,
            },
          };
        });

        const changeSources =
          derection == 'B'
            ? [...sourceImages, ...sources]
            : [...sources, ...sourceImages];

        const changeIndex = changeSources.findIndex(
          item => item._item.FileID == findToken,
        );

        setIndex(changeIndex);
        setSources(changeSources);
        setLoading(false);
      });
    }

    setIndex(changeIdx);
    setVirtualIndex(virtualIndex - (index - changeIdx));
  };

  const downloadCurrent = () => {
    const findItem = sources[index]._item;
    downloadByTokenAlert({
      token: findItem.FileID,
      fileName: findItem.FileName,
    });
  };

  const shareCurrent = () => {
    const findItem = sources[index]._item;
    downloadAndShare({
      token: findItem.FileID,
      fileName: findItem.FileName,
    });
  };

  const openSynapViewerCurrent = () => {
    const findItem = sources[index]._item;
    openSynapViewer({
      token: findItem?.FileID,
      fileName: findItem?.FileName,
      ext: findItem?.Extension,
      roomID: findItem.RoomID,
    });
  };

  return (
    <>
      {sources && show && (
        <Modal visible={show} transparent={true} onRequestClose={onClose}>
          <View style={styles.container}>
            <View style={styles.customHeader}>
              <TouchableOpacity
                style={styles.customHeaderBtn}
                onPress={e => {
                  onClose();
                }}
              >
                <Image
                  source={cancelBtnImg}
                  useNativeDriver={true}
                  style={{ width: 13, height: 13 }}
                />
              </TouchableOpacity>
            </View>
            {(!loading && (
              <>
                <ImageViewer
                  renderIndicator={(curr, all) => {
                    return (
                      <View style={styles.count}>
                        <Text
                          style={styles.countText}
                        >{`${virtualIndex} / ${allSize}`}</Text>
                      </View>
                    );
                  }}
                  imageUrls={sources}
                  onSwipeDown={onClose}
                  enableSwipeDown={true}
                  index={index}
                  enablePreload={true}
                  saveToLocalByLongPress={
                    selectDownloadOrViewer.Download === true
                  }
                  onChange={handleChange}
                />
                <View style={styles.bottomMenu}>
                  {hasDownload && (
                    <>
                      <TouchableOpacity
                        style={styles.bottomBtn}
                        onPress={e => {
                          shareCurrent();
                        }}
                      >
                        {selectDownloadOrViewer.Download === true && (
                          <Text style={styles.bottomBtnText}>
                            {getDic('Share')}
                          </Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.bottomBtn}
                        onPress={e => {
                          downloadCurrent();
                        }}
                      >
                        {selectDownloadOrViewer.Download === true && (
                          <Text style={styles.bottomBtnText}>
                            {getDic('Download')}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                  {selectDownloadOrViewer?.Viewer === true && (
                    <TouchableOpacity
                      style={styles.bottomBtn}
                      onPress={e => {
                        openSynapViewerCurrent();
                      }}
                    >
                      <Text style={styles.bottomBtnText}>
                        {getDic('RunViewer')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {onMove && (
                    <TouchableOpacity
                      style={styles.bottomBtn}
                      onPress={e => {
                        onMove();
                        onClose();
                      }}
                    >
                      <Text style={styles.bottomBtnText}>
                        {getDic('ShowChat')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )) || (
              <View style={styles.loadingContainer}>
                <Image
                  source={loadingImg}
                  useNativeDriver={true}
                  style={{ width: 150, height: 150 }}
                />
              </View>
            )}
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
  },
  count: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: getTopPadding(),
    height: 30,
    zIndex: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  countText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {
      width: 0,
      height: 0.5,
    },
    textShadowRadius: 0,
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customHeader: {
    position: 'absolute',
    right: 5,
    top: 0,
    zIndex: 14,
    width: 40,
    height: getTopPadding() + 30,
    paddingTop: getTopPadding(),
  },
  customHeaderBtn: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50 + getBottomPadding(),
    paddingBottom: getBottomPadding(),
    width: getScreenWidth(),
    zIndex: 13,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#111',
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
  },
  bottomBtn: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  bottomBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ImageModal;
