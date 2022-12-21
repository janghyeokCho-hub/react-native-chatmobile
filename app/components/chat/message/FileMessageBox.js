import React from 'react';
import {
  getFileExtension,
  isAllImage,
  //openFilePreview,
} from '@/lib/fileUtil';
//import { openPopup } from '@/lib/common';
import { View, StyleSheet } from 'react-native';
import File from '@C/chat/message/types/File';
import FileThumbList from './types/FileThumbList';
import MessageReplyBox from '@/components/reply/MessageReplyBox';
import { useTheme } from '@react-navigation/native';

const FileMessageBox = ({
  fileObj,
  id,
  isTemp,
  longPressEvt,
  context,
  replyID = 0,
  replyInfo,
  goToOriginMsg,
  roomType = 'CHAT',
  isMine,
  style,
  styleType,
  roomInfo,
  sizes,
}) => {
  const replyView = replyID > 0 && !context;
  const { colors } = useTheme();
  const handleFileList = fileObj => {
    let isAllimg = isAllImage(fileObj);
    if (isAllimg) {
      return (
        <View style={[styles.fileThumbListMessageBox]} id={id || ''}>
          {fileObj.map((item, index) => {
            return (
              <FileThumbList
                key={`fileThumbList_${item}_${index}`}
                index={index}
                len={fileObj.length}
                type="list"
                item={item}
                preview={handlePreview}
                id={id}
                isTemp={isTemp}
                longPressEvt={longPressEvt}
              />
            );
          })}
        </View>
      );
    } else {
      return (
        <View
          style={[styles.fileMessageBox, styles.fileMessageList]}
          id={id || ''}
        >
          {fileObj.map((item, index) => {
            return (
              <File
                key={`file_${item}_${index}`}
                type="list"
                item={item}
                preview={handlePreview}
                id={id}
                isTemp={isTemp}
                longPressEvt={longPressEvt}
                replyView={replyView}
              />
            );
          })}
        </View>
      );
    }
  };

  const handlePreview = item => {
    let imageList = null;
    if (Array.isArray(fileObj)) {
      imageList = fileObj.filter(item => {
        return getFileExtension(item.ext) == 'img';
      });
    }
    const extension = getFileExtension(item.ext);

    if (extension == 'img') {
      if (imageList && imageList.length > 1) {
        //openFilePreview(item, imageList, 'L', null);
      } else {
        //openFilePreview(item, null, 'N', null);
      }
    }
  };

  let returnJSX = [];

  if (Array.isArray(fileObj) && fileObj.length > 1) {
    returnJSX.push(handleFileList(fileObj));
  } else {
    returnJSX.push(
      <File
        key={`file_${id}`}
        type="unit"
        item={fileObj}
        preview={handlePreview}
        id={id || ''}
        isTemp={isTemp}
        longPressEvt={longPressEvt}
        replyView={replyView}
      />,
    );
  }

  if (replyView) {
    returnJSX.unshift(
      <MessageReplyBox
        replyID={replyID}
        replyInfo={replyInfo}
        roomType={roomType}
        style={style}
        styleType={styleType}
        roomInfo={roomInfo}
        sizes={sizes}
        goToOriginMsg={goToOriginMsg}
      />,
    );
    colors;
    return (
      <View
        style={{
          backgroundColor: isMine === 'Y' ? colors.primary : '#efefef',
          ...styles.replyFileMessageBox,
        }}
      >
        {returnJSX}
      </View>
    );
  } else {
    return returnJSX;
  }
};

const styles = StyleSheet.create({
  replyFileMessageBox: {
    padding: 10,
    borderRadius: 5,
    maxWidth: '100%',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  fileMessageBox: {
    backgroundColor: '#fff',
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
    margin: 5,
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
    margin: 5,
  },
  fileInfoTxt: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  fileTypeIco: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    margin: 15,
  },
  fileNameBig: {
    fontSize: 14,
    fontWeight: '700',
  },
  fileThumbListMessageBox: {
    minWidth: 204,
    maxWidth: 204,
    flexWrap: 'wrap',
    flexDirection: 'row',
    // borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    // padding: 10,
    margin: 5,
  },
});

export default React.memo(FileMessageBox, (prevProps, nextProps) => {
  // true : rerender
  // false : skip
  return (
    prevProps.marking !== nextProps.marking ||
    prevProps.children === nextProps.children
  );
});
