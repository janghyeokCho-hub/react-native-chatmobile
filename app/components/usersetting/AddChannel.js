import React, { useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import useSWR from 'swr';
import { managesvr } from '@API/api';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';

function Header({ title }) {
  const navigation = useNavigation();
  const handleClose = useCallback(() => {
    navigation.canGoBack() && navigation.goBack();
  }, [navigation]);

  return (
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
        <Text style={styles.modaltit}>{title}</Text>
      </View>
    </View>
  );
}

const AddChannel = ({ navigation, route }) => {
  const { headerName } = route?.params;

  const handleFinish = useCallback(() => {
    navigation.canGoBack() && navigation.goBack();
  });

  const handleChannel = channel => {
    navigation.navigate('NoticeTalk', {
      channelName: channel.subjectName,
      channelId: channel.subjectId,
      channelPhoto: channel.subjectPhoto,
    });
  };

  const { data: channelList } = useSWR(
    '/noticetalk/list',
    async () => {
      const response = await managesvr('get', '/notice/subject');
      if (response.data.status === 'SUCCESS') {
        return response.data.result;
      } else {
        return;
      }
    },
    { revalidateOnFocus: false },
  );

  const renderItem = ({ item }) => {
    return (
      <>
        <TouchableOpacity
          style={styles.channelBox}
          onPress={() => handleChannel(item)}
        >
          <View style={styles.channelImgBox}>
            <Image
              style={styles.channelImg}
              source={{
                uri: item.subjectPhoto,
              }}
            />
          </View>
          <Text style={styles.channelTxt}>{item.subjectName}</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={headerName} onFinish={handleFinish} />
      <ScrollView>
        <View style={styles.tabcontent}>
          <FlatList
            data={channelList}
            renderItem={renderItem}
            keyExtractor={item => String(item.subjectId)}
            numColumns={2}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddChannel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: 'white',
  },
  exitBtnView: { width: '20%', alignItems: 'flex-start' },
  titleView: { width: '60%', alignItems: 'center' },
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
  tabcontent: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
  },
  channelBox: {
    marginVertical: 5,
    marginHorizontal: 3,
    paddingVertical: 12,
    width: '48%',
    backgroundColor: '#FEFCFC',
    alignItems: 'center',
    borderRadius: 15,
  },
  channelImgBox: {
    width: 100,
    height: 100,
  },
  channelImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  channelTxt: {
    fontSize: 18,
    color: 'black',
    fontWeight: '600',
    textAlign: 'center',
  },
});
