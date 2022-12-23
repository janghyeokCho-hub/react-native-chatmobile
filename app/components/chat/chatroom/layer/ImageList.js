import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import {} from 'react-redux';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { CommonActions, useTheme } from '@react-navigation/native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import * as imageUtil from '@/lib/imagePickUtil';
import * as fileUtil from '@/lib/fileUtil';
import { getSysMsgFormatStr } from '@/lib/common';
import CameraRoll from '@react-native-community/cameraroll';
// import Image from 'react-native-fast-image';

import ToggleButton from '@/components/common/buttons/ToggleButton';
import Svg, { Path } from 'react-native-svg';
import { getDic, getConfig } from '@/config';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Dimensions } from 'react-native';
import { withSecurityScreen } from '@/withSecurityScreen';

const ImageFile = forwardRef(
  ({ item, index, handleSelectList, selectedIndexes }, ref) => {
    const { image } = item.node;
    const { colors } = useTheme();
    const [check, setCheck] = useState(false);

    useEffect(() => {
      !selectedIndexes.includes(index) && setCheck(false);
    }, [selectedIndexes]);

    const handlePress = () => {
      if (check) {
        //check off
        setCheck(!check);
        handleSelectList(index, false);
      } else {
        //check on

        if (
          selectedIndexes.length <= parseInt(getConfig('File.limitFileCnt') - 1)
        ) {
          setCheck(!check);
          handleSelectList(index, true);
        } else {
          Alert.alert(
            '',
            getSysMsgFormatStr(getDic('Msg_LimitFileCnt'), [
              { type: 'Plain', data: getConfig('File.limitFileCnt') },
            ]),
            [{ text: getDic('Ok') }],
          );
        }
      }
    };

    return (
      <TouchableOpacity onPress={handlePress}>
        <View
          style={[
            styles.photoView,
            check
              ? { ...styles.chkPhotoView, borderColor: colors.primary }
              : null,
          ]}
        >
          <View style={styles.toggleBtn}>
            <ToggleButton checked={check} />
          </View>
          <Image
            style={styles.photoImg}
            source={{
              uri: image.uri,
              // , priority: Image.priority.high
            }}
            onError={e => console.log(e)}
          />
        </View>
      </TouchableOpacity>
    );
  },
);

const ImageList = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { handleImageChange, assetType, handleFileChange } = route.params;
  const [images, setImages] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [lastCursor, setLastCursor] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const handleClose = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, []);
  useEffect(() => {
    imageUtil.getImagesFromLibrary(assetType).then(res => {
      const { edges } = res;
      setImages(edges);
      setLastCursor(res.page_info.end_cursor);
      setHasNext(res.page_info.has_next_page);
    });
  }, []);

  const renderItem = ({ item, index }) => {
    return (
      <ImageFile
        item={item}
        index={index}
        selectedIndexes={selectedIndexes}
        handleSelectList={handleSelectList}
      />
    );
  };

  const onEndReached = ({ info }) => {
    console.log('onEndReached');
    if (hasNext) {
      const fetchParams = {
        first: 20,
        after: lastCursor,
        assetType: assetType,
      };
      CameraRoll.getPhotos(fetchParams).then(res => {
        setImages([...images, ...res.edges]);
        setLastCursor(res.page_info.end_cursor);
        if (!res.page_info.has_next_page) {
          setHasNext(false);
        }
      });
    }
  };

  const ImageListItem = ({ item, index }) => {
    const { image } = item.node;
    return (
      <TouchableOpacity
        onPress={() => handleSelectList(item.originIdex, false)}
      >
        <View style={styles.imageStateItem}>
          <Image style={styles.imageStateImg} source={{ uri: image.uri }} />
        </View>
      </TouchableOpacity>
    );
  };

  const iosFormatToGeneral = filename => {
    const ext = filename.split('.')[1];
    if (ext == 'heic' || ext == 'HEIC') {
      return filename.replace('heic', 'png').replace('HEIC', 'png');
    } else {
      return filename.toLowerCase();
    }
  };

  const handleSendImages = () => {
    const files = selectedList.map((file, index) => {
      return {
        name: file.node.image.filename,
        size: file.node.image.fileSize,
        type: 'image/jpeg',
        uri: file.node.image.uri,
      };
    });

    const cnFiles = selectedList.map(file => {
      return {
        ...file,
        node: {
          ...file.node,
          image: {
            ...file.node.image,
            filename: iosFormatToGeneral(file.node.image.filename),
          },
        },
      };
    });

    const cnFilesInfos = cnFiles.map(cnf => {
      return {
        name: cnf.node.image.filename,
        size: cnf.node.image.fileSize,
        type: 'image/jpeg',
        uri: cnf.node.image.uri,
      };
    });
    console.log(cnFiles);
    // selectedList.map(file => {
    //   RNHeicConverter.convert({
    //     path: file.node.image.uri,
    //   }).then(res => console.log(res));
    // });
    handleFileChange(cnFilesInfos);
    handleClose();
  };

  const handleSelectList = (index, onOff) => {
    if (selectedList.length > getConfig('File.limitFileCnt') - 1) {
      //check files count
      Alert.alert(
        '',
        getSysMsgFormatStr(getDic('Msg_LimitFileCnt'), [
          { type: 'Plain', data: getConfig('File.limitFileCnt') },
        ]),
        [{ text: getDic('Ok') }],
      );
    } else {
      if (onOff) {
        setSelectedList([
          ...selectedList,
          { ...images[index], originIdex: index },
        ]);
        setSelectedIndexes([...selectedIndexes, index]);
      } else {
        setSelectedList(selectedList.filter(item => item.originIdex !== index));
        setSelectedIndexes(selectedIndexes.filter(idx => idx != index));
      }
    }
  };

  return (
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
        <TouchableWithoutFeedback
          onPress={() => {
            Alert.alert('파일전송', '파일들을 전송하시겠습니까?', [
              {
                text: getDic('Ok'),
                onPress: () => {
                  handleSendImages();
                },
              },
              { text: getDic('Cancel'), onPress: () => {} },
            ]);
          }}
        >
          <View style={styles.headerRightView}>
            <Text
              style={{ ...styles.headerListCountText, color: colors.primary }}
            >
              {selectedList.length}
            </Text>
            <Text>전송</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View
        style={{
          ...styles.imageStateView,
          height: selectedList.length !== 0 ? 80 : 30,
        }}
      >
        <FlatList horizontal data={selectedList} renderItem={ImageListItem} />
      </View>
      <View style={styles.noPhoto}>
        <FlatList
          // keyExtractor={(item, index) => index + index + Math.random(10)}
          keyExtractor={item => item.node.timestamp}
          style={{
            marginLeft: (Dimensions.get('window').width - 370) / 2,
            marginTop: 10,
            marginBottom: 100,
          }}
          contentContainerStyle={{ justifyContent: 'center' }}
          horizontal={false}
          numColumns={Platform.isPad ? 6 : 3}
          onEndReached={onEndReached}
          data={images}
          renderItem={renderItem}
          onEndReachedThreshold={0.2}
          extraData={hasNext}
          ListFooterComponent={() =>
            hasNext ? (
              <View style={styles.loadingFooter}>
                <Image
                  style={styles.loadingImage}
                  source={require('@/components/assets/loading.gif')}
                />
              </View>
            ) : null
          }
        />
      </View>
    </View>
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
  headerRightView: {
    position: 'absolute',
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerListCountText: {
    marginRight: 5,
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
  photoView: {
    backgroundColor: '#9d9990',
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 5,
    marginBottom: 5,
    width: 120,
    height: 110,
  },
  photoImg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
  },
  chkPhotoView: {
    borderWidth: 4,
  },
  imageStateView: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
  },
  noPhotos: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  imageStateItem: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
  },
  imageStateImg: {
    width: '100%',
    height: '100%',
  },
  loadingFooter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingImage: {
    width: 50,
    height: 50,
  },
});

export default withSecurityScreen(ImageList);
