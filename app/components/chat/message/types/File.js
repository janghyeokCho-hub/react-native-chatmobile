import React, { useState, useEffect } from 'react';
import Progress from '@C/common/buttons/Progress';
import {
  getFileExtension,
  convertFileSize,
  //resizeImage,
  fileTypeImage,
} from '@/lib/fileUtil';
import PrevImage from '@/components/chat/message/types/PrevImage';
import {
  Alert,
  TouchableOpacity,
  View,
  Image,
  Text,
  radio,
  StyleSheet,
} from 'react-native';
import { getDic, getConfig } from '@/config';
import { openModal, changeModal, closeModal } from '@/modules/modal';
import * as file from '@/lib/device/file';
import { useSelector, useDispatch } from 'react-redux';

import { useTheme } from '@react-navigation/native';

// const useForceUpdate = () => useState()[1];

const File = ({ type, item, preview, id, isTemp, longPressEvt }) => {
  const { sizes } = useTheme();
  const extension = getFileExtension(item.ext);
  const [progressData, setProgressData] = useState(null);
  let selectDownloadOrViewer = getConfig('FileAttachViewMode');
  if (selectDownloadOrViewer) {
    selectDownloadOrViewer = selectDownloadOrViewer[1];
  }

  const dispatch = useDispatch();

  const handleProgress = (load, total) => {
    setProgressData({ load, total });
  };

  const finishProgress = () => {
    setProgressData(null);
  };

  const handleDownloadWithProgress = () => {
    file.downloadByTokenAlert(item, result => {
      handleProgress(result.bytesWritten, result.contentLength);
    });
  };

  const handleRunViewer = () => {
    file.viewerByTokenAlert(item);
  };

  const showModalMenu = () => {
    const download = {
      title: getDic('Download'),
      onPress: () => {
        file.downloadByTokenAlert(item, result => {
          handleProgress(result.bytesWritten, result.contentLength);
        });
      },
    };
    const viewer = {
      title: getDic('RunViewer'),
      onPress: () => {
        file.viewerByTokenAlert(item);
      },
    };

    const modalBtn = [download, viewer];

    dispatch(
      changeModal({
        modalData: {
          closeOnTouchOutside: true,
          type: 'normal',
          buttonList: modalBtn,
        },
      }),
    );
    dispatch(openModal());
  };

  if (type == 'list') {
    return (
      <>
        {progressData == null && (
          <>
            {(extension == 'img' && (
              <PrevImage
                type="list"
                item={item}
                isTemp={isTemp}
                longPressEvt={longPressEvt}
              >
                <View style={styles.fileListItem}>
                  <Image
                    style={styles.sFileIco}
                    source={fileTypeImage[extension]}
                  />
                  <Text
                    style={{ ...styles.fileName, fontSize: 13 + sizes.inc }}
                    numberOfLines={1}
                  >
                    {isTemp ? item.fullName : item.fileName}
                  </Text>
                  <Text style={styles.fileSize}>
                    ({convertFileSize(item.size)})
                  </Text>
                </View>
              </PrevImage>
            )) || (
              <TouchableOpacity
                onPress={() => {
                  if (
                    selectDownloadOrViewer &&
                    selectDownloadOrViewer.Download === true &&
                    selectDownloadOrViewer.Viewer === true
                  ) {
                    showModalMenu();
                  } else if (
                    !isTemp &&
                    selectDownloadOrViewer &&
                    selectDownloadOrViewer.Download === true
                  ) {
                    handleDownloadWithProgress();
                  } else if (
                    selectDownloadOrViewer &&
                    selectDownloadOrViewer.Viewer === true
                  ) {
                    handleRunViewer();
                  } else if (
                    selectDownloadOrViewer &&
                    selectDownloadOrViewer.Viewer === false &&
                    selectDownloadOrViewer.Download === false
                  ) {
                    Alert.alert(
                      getDic('Eumtalk'),
                      getDic('Msg_SettingFalse'),
                      [
                        {
                          text: getDic('Ok'),
                        },
                      ],
                      { cancelable: true },
                    );
                  }
                }}
                onLongPress={() => {
                  longPressEvt && longPressEvt();
                }}
              >
                <View style={styles.fileListItem}>
                  <Image
                    style={styles.sFileIco}
                    source={fileTypeImage[extension]}
                  />
                  <Text
                    style={{ ...styles.fileName, fontSize: 13 + sizes.inc }}
                    numberOfLines={1}
                  >
                    {isTemp ? item.fullName : item.fileName}
                  </Text>
                  <Text style={styles.fileSize}>
                    ({convertFileSize(item.size)})
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </>
        )}
        {progressData && (
          <Progress
            load={progressData.load}
            total={progressData.total}
            handleFinish={finishProgress}
          />
        )}
      </>
    );
  } else {
    if (item.image || item.thumbnail) {
      return (
        <>
          <PrevImage
            type="thumbnail"
            item={item}
            id={id}
            isTemp={isTemp}
            longPressEvt={longPressEvt}
          />
        </>
      );
    } else {
      return (
        <>
          {progressData == null && (
            <TouchableOpacity
              id={id || ''}
              onPress={() => {
                if (
                  selectDownloadOrViewer &&
                  selectDownloadOrViewer.Download === true &&
                  selectDownloadOrViewer.Viewer === true
                ) {
                  showModalMenu();
                } else if (
                  !isTemp &&
                  selectDownloadOrViewer &&
                  selectDownloadOrViewer.Download === true
                ) {
                  handleDownloadWithProgress();
                } else if (
                  selectDownloadOrViewer &&
                  selectDownloadOrViewer.Viewer === true
                ) {
                  handleRunViewer();
                } else if (
                  selectDownloadOrViewer &&
                  selectDownloadOrViewer.Viewer === false &&
                  selectDownloadOrViewer.Download === false
                ) {
                  Alert.alert(
                    getDic('Eumtalk'),
                    getDic('Msg_SettingFalse'),
                    [
                      {
                        text: getDic('Ok'),
                      },
                    ],
                    { cancelable: true },
                  );
                }
              }}
              onLongPress={() => {
                longPressEvt && longPressEvt();
              }}
            >
              <View style={[styles.fileMessageBox, styles.fileMessage]}>
                <Image
                  style={styles.fileTypeIco}
                  source={fileTypeImage[getFileExtension(item.ext)]}
                />
                <View style={styles.fileInfoTxt}>
                  <Text
                    style={{ ...styles.fileNameBig, fontSize: 14 + sizes.inc }}
                    numberOfLines={1}
                  >
                    {isTemp ? item.fullName : item.fileName}
                  </Text>
                  <Text style={styles.fileSize}>
                    {getDic('FileSize') + ' ' + convertFileSize(item.size)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          {progressData && (
            <Progress
              load={progressData.load}
              total={progressData.total}
              handleFinish={finishProgress}
            />
          )}
        </>
      );
    }
  }
};

const styles = StyleSheet.create({
  fileMessageBox: {
    minWidth: '60%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  fileMessage: {
    flexDirection: 'row',
    padding: 10,
  },
  fileMessageList: {
    flexDirection: 'column',
  },
  fileListItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 8,
  },
  fileName: { flex: 1, fontSize: 13 },
  fileSize: {
    fontSize: 12,
    color: '#999',
  },
  sFileIco: {
    width: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    resizeMode: 'contain',
  },
  fileInfoTxt: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  fileTypeIco: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    margin: 15,
    resizeMode: 'contain',
  },
  fileNameBig: {
    fontSize: 14,
    fontWeight: '600',
  },
  thumbnailImg: {
    width: 230,
    height: 230,
    resizeMode: 'contain',
    aspectRatio: 1,
  },
  imageContainer: {
    borderRadius: 5,
    backgroundColor: '#F1F1F1',
    borderWidth: 0.3,
    borderColor: '#F1F1F1',
  },
});

export default React.memo(File);
