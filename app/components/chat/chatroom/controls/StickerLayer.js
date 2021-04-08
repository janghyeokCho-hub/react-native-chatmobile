import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as emoticonApi from '@/lib/api/emoticon';
import { getServer } from '@/config';

import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Image,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import FastImage from 'react-native-fast-image';
import { getConfig } from '@/config';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { getBottomPadding, getScreenWidth } from '@/lib/device/common';

const StickerLayer = ({ onClick }) => {
  const userInfo = useSelector(({ login }) => login.userInfo);

  const [space, setSpace] = useState(0);
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState(null);
  const [emoticons, setEmoticons] = useState(null);
  const [selectItem, setSelectItem] = useState(null);

  const storagePrefix = getConfig('storePrefix', '/storage/');
  const IsSaaSClient = getConfig('IsSaaSClient', 'N');

  useEffect(() => {
    // componentDidMount
    // groups 받아오기
    const getGroups = async () => {
      try {
        let response;
        if (IsSaaSClient == 'Y') {
          response = await emoticonApi.getGroupsWithSaaS({
            companyCode: userInfo.CompanyCode,
          });
        } else {
          response = await emoticonApi.getGroups();
        }
        if (response.data.status == 'SUCCESS') {
          const groups = response.data.result;
          if (groups) {
            setGroups(groups);
            setGroupId(groups[0].GroupID);
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    let animationConfig = defaultAnimation;
    LayoutAnimation.configureNext(animationConfig);

    setSpace(300);
    getGroups();
  }, []);

  useEffect(() => {
    // groupId 값이 있을 경우에만
    if (groupId) {
      // emoticons 받아오기
      const getEmoticons = async () => {
        try {
          let response;
          if (IsSaaSClient == 'Y') {
            response = await emoticonApi.getEmoticonsWithSaaS({
              groupId,
              companyCode: userInfo.CompanyCode,
            });
          } else {
            response = await emoticonApi.getEmoticons({ groupId });
          }
          if (response.data.status == 'SUCCESS') {
            let emoticons = response.data.result;
            if (emoticons) {
              const screenWidth = getScreenWidth() - 20; // padding
              const drawUnitCount = Math.floor(screenWidth / 90);
              const lastRowReminder = emoticons.length % drawUnitCount;

              if (lastRowReminder > 0) {
                emoticons = [
                  ...emoticons,
                  ...new Array(drawUnitCount - lastRowReminder),
                ];
              }

              setEmoticons(emoticons);
            }
          }
        } catch (e) {}
      };

      getEmoticons();
    }
  }, [groupId]);

  const handleChangeGroup = gid => {
    if (gid !== groupId) {
      setEmoticons(null);
      setGroupId(gid);
    }
  };

  const handleSend = item => {
    const sendData = `eumtalk://emoticon.${item.GroupName}.${
      item.EmoticonName
    }.${item.EmoticonType}.${item.CompanyCode}`;
    onClick(sendData);
    setSelectItem(null);
  };

  const handleSelect = item => {
    setSelectItem(item);
  };

  return (
    <>
      {selectItem && (
        <View style={styles.emoticonPreviewBox}>
          <TouchableOpacity
            onPress={e => {
              handleSend(selectItem);
            }}
          >
            <View style={styles.emoticonPreviewUnit}>
              <FastImage
                source={{
                  uri:
                    IsSaaSClient == 'Y'
                      ? `${getServer('HOST')}${storagePrefix}emoticon/${
                          selectItem.CompanyCode
                        }/${selectItem.GroupName}/${selectItem.EmoticonName}.${
                          selectItem.EmoticonType === 'A' ? 'gif' : 'png'
                        }`
                      : `${getServer('HOST')}${storagePrefix}emoticon/${
                          selectItem.GroupName
                        }/${selectItem.EmoticonName}.${
                          selectItem.EmoticonType === 'A' ? 'gif' : 'png'
                        }`,
                  priority: FastImage.priority.high,
                }}
                onError={e => {
                  // console.log('no Image');
                }}
                style={{ width: '100%', height: '100%', borderRadius: 5 }}
              />
              <View style={styles.emoticonPreviewSendBtn}>
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20.066"
                  height="25.802"
                  viewBox="0 0 20.066 25.802"
                >
                  <G transform="translate(7.704 -0.001) rotate(45)">
                    <G transform="translate(-0.001 0.002)">
                      <G transform="translate(0 0)">
                        <Path
                          d="M.337,6.861A.537.537,0,0,0,.3,7.843l6.291,3.051L17.485,0Z"
                          transform="translate(0.001 -0.002)"
                          fill="#6d6d6d"
                        />
                      </G>
                    </G>
                    <G transform="translate(7.352 0.761)">
                      <Path
                        d="M206.344,32.2l3.051,6.291a.537.537,0,0,0,.483.3h.019a.537.537,0,0,0,.479-.337l6.859-17.148Z"
                        transform="translate(-206.344 -21.306)"
                        fill="#6d6d6d"
                      />
                    </G>
                  </G>
                </Svg>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.emoticonPreviewCloseBtn}
            onPress={e => {
              setSelectItem(null);
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
      <View style={[styles.stickerContainer, { height: space }]}>
        <View style={styles.stickerGroupWrap}>
          <ScrollView style={styles.stickerGroup} horizontal={true}>
            {groups &&
              groups.map(item => {
                return (
                  <View
                    key={`s_group_${item.GroupID}`}
                    style={[
                      styles.groupTitle,
                      item.GroupID == groupId ? styles.selectGroup : {},
                    ]}
                  >
                    <TouchableOpacity
                      onPress={e => {
                        handleChangeGroup(item.GroupID);
                      }}
                    >
                      <Image
                        source={{
                          uri:
                            IsSaaSClient == 'Y'
                              ? `${getServer('HOST')}${storagePrefix}emoticon/${
                                  item.CompanyCode
                                }/${item.GroupName}/${item.GroupName}.png`
                              : `${getServer('HOST')}${storagePrefix}emoticon/${
                                  item.GroupName
                                }/${item.GroupName}.png`,
                        }}
                        style={[
                          styles.titleImage,
                          item.GroupID == groupId
                            ? { zIndex: 99 }
                            : styles.unSelImg,
                        ]}
                        onError={e => {
                          console.log('image error');
                        }}
                      />
                      {/* {item.GroupID != groupId && ( */}
                      <Image
                        source={{
                          uri:
                            IsSaaSClient == 'Y'
                              ? `${getServer('HOST')}${storagePrefix}emoticon/${
                                  item.CompanyCode
                                }/${item.GroupName}/${item.GroupName}.png`
                              : `${getServer('HOST')}${storagePrefix}emoticon/${
                                  item.GroupName
                                }/${item.GroupName}.png`,
                        }}
                        style={{
                          height: 40,
                          width: 40,
                          opacity: item.GroupID != groupId ? 0.1 : 1,
                          position: 'absolute',
                        }}
                        onError={e => {
                          console.log('image error');
                        }}
                      />
                      {/* )} */}
                    </TouchableOpacity>
                  </View>
                );
              })}
          </ScrollView>
        </View>

        <View style={styles.emoticonWrap}>
          <ScrollView
            style={styles.emoticonBox}
            contentContainerStyle={styles.emoticionScorllWrapper}
          >
            {emoticons &&
              emoticons.map((item, index) => {
                return (
                  <>
                    {(item && (
                      <TouchableOpacity
                        key={`s_emo_${index}`}
                        onPress={e => {
                          //handleClick(item);
                          handleSelect(item);
                        }}
                      >
                        <>
                          <View style={styles.emoticonUnit}>
                            <FastImage
                              source={{
                                uri:
                                  IsSaaSClient == 'Y'
                                    ? `${getServer(
                                        'HOST',
                                      )}${storagePrefix}emoticon/${
                                        item.CompanyCode
                                      }/${item.GroupName}/${
                                        item.EmoticonName
                                      }.png`
                                    : `${getServer(
                                        'HOST',
                                      )}${storagePrefix}emoticon/${
                                        item.GroupName
                                      }/${item.EmoticonName}.png`,
                                priority: FastImage.priority.high,
                              }}
                              onError={e => {
                                // console.log('no Image');
                              }}
                              style={{ width: '100%', height: '100%' }}
                            />
                          </View>
                        </>
                      </TouchableOpacity>
                    )) || <View style={styles.emoticonUnit} />}
                  </>
                );
              })}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  stickerContainer: {
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
  },
  stickerGroupWrap: {
    width: '100%',
    height: 60,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2.5,
    paddingBottom: 2.5,
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: 0.5,

    borderTopColor: '#D9D9D9',
    borderTopWidth: 0.5,
  },
  stickerGroup: {
    flex: 1,
    flexDirection: 'row',
  },
  groupTitle: {
    width: 50,
    height: 45,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectGroup: {
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
  },
  titleImage: {
    height: 40,
    width: 40,
  },
  unSelImg: {
    tintColor: 'gray',
  },
  emoticonWrap: {
    width: '100%',
    flex: 1,
    padding: 10,
    marginBottom: getBottomPadding(),
  },
  emoticonBox: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
  },
  emoticionScorllWrapper: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emoticonUnit: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  emoticonPreviewBox: {
    width: '100%',
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  emoticonPreviewUnit: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderRadius: 5,
  },
  emoticonPreviewCloseBtn: {
    width: 35,
    height: 35,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  emoticonPreviewSendBtn: {
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

const defaultAnimation = {
  duration: 500,
  create: {
    duration: 300,
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 200,
  },
};

export default StickerLayer;
