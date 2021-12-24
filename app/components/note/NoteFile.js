/* eslint-disable prettier/prettier */
import React, { useState, useCallback, useEffect } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import {
    getFileExtension,
    convertFileSize,
    fileTypeImage,
} from '@/lib/fileUtil';
import { getDic, getConfig } from '@/config';
import { openModal, changeModal } from '@/modules/modal';
import { downloadByTokenAlert } from '@/lib/device/file';
import Progress from '@C/common/buttons/Progress';

const NoteFile = ({ item, disableClick, disableRemove, handleRemove }) => {
    const { sizes } = useTheme();
    const dispatch = useDispatch();
    const [progressData, setProgressData] = useState(null);
    const selectDownloadOrViewer = getConfig('FileAttachViewMode')?.[1];
    const myInfo = useSelector(({ login }) => login.userInfo);

    const finishProgress = () => {
        setProgressData(null);
    };

    const handleProgress = useCallback((result) => {
        setProgressData({
            load: result?.bytesWritten,
            total: result?.contentLength
        });
    }, []);

    const onDownload = useCallback(() => {
        if (!selectDownloadOrViewer || disableClick) {
            return;
        }
        if (selectDownloadOrViewer?.Download === true) {
          downloadByTokenAlert(
            {
              token: item?.fileID,
              userId: myInfo?.id,
              ...item,
              type: 'note',
            },
            handleProgress,
          );
        } else {
          Alert.alert(
            null,
            getDic(
              'Block_FileDownload',
              '파일 다운로드가 금지되어 있습니다.',
            ),
            [{ text: getDic('Ok') }],
            {
              cancelable: true,
            },
          );
        }
    }, [selectDownloadOrViewer, disableClick, handleProgress, item, myInfo]);

    return (
        <TouchableOpacity onPress={onDownload}>
            <View style={[styles.fileMessageBox, styles.fileMessage]}>
                {progressData !== null ? (<Progress
                    load={progressData.load}
                    total={progressData.total}
                    handleFinish={finishProgress}
                />) : (
                    <>
                        <Image
                            style={styles.fileTypeIco}
                            source={fileTypeImage[getFileExtension(item.ext)]}
                        />
                        <View style={styles.fileInfoTxt}>
                            <Text
                                style={{ ...styles.fileNameBig, fontSize: sizes.default }}
                                numberOfLines={1}
                            >
                                {item.fileName}
                            </Text>
                            <Text style={{ fontSize: sizes.small }}>
                                {getDic('FileSize') + ' ' + convertFileSize(item.size)}
                            </Text>
                        </View>
                    </>
                )}
                {!disableRemove && <TouchableOpacity style={{ justifyContent: "center", marginHorizontal: '2%' }} onPress={handleRemove}>
                    <Text style={{ color: '#666' }}>X</Text>
                </TouchableOpacity>}
            </View>
        </TouchableOpacity>
    );
}


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

export default React.memo(NoteFile);