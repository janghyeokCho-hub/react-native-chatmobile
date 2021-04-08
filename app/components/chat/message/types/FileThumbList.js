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
  StyleSheet,
} from 'react-native';
import { getDic } from '@/config';
import * as file from '@/lib/device/file';

import { useTheme } from '@react-navigation/native';

// const useForceUpdate = () => useState()[1];

const File = ({ type, item, preview, id, isTemp, index, len }) => {
  const { sizes } = useTheme();
  const extension = getFileExtension(item.ext);
  const [progressData, setProgressData] = useState(null);

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

  if (type == 'list') {
    return (
      <>
        {progressData == null && (
          <>
            {(extension == 'img' && (
              <PrevImage
                type="thumblist"
                item={item}
                isTemp={isTemp}
                index={index}
                len={len}
              />
            )) || (
              <TouchableOpacity
                onPress={() => {
                  if (!isTemp) {
                    handleDownloadWithProgress();
                  }
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
          <PrevImage type="thumbnail" item={item} id={id} isTemp={isTemp} />
        </>
      );
    } else {
      return (
        <>
          {progressData == null && (
            <TouchableOpacity
              id={id || ''}
              onPress={() => {
                if (!isTemp) {
                  handleDownloadWithProgress();
                }
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
  saveTextContainer: {
    flexDirection: 'row',
  },
  saveTextButton: {
    paddingHorizontal: 7,
  },
  saveText: {
    color: '#999',
    fontSize: 13,
  },
});

export default React.memo(File);
