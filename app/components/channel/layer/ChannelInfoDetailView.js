import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import NotFoundIcon from '@/components/common/icons/NotFoundIcon';
import TitleInputBox from '@COMMON/TitleInputBox';
import { getDic, getServer } from '@/config';
import { withSecurityScreen } from '@/withSecurityScreen';

const ChannelInfoDetailView = ({ route, navigation }) => {
  const channleInfo = route.params.channelInfo;
  const [viewDropDownMenu, setViewDropDownMenu] = useState(false);

  return (
    <View style={styles.container}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 50,
          backgroundColor: 'white',
        }}
      >
        <View
          style={{
            backgroundColor: '#f0f0f0',
            marginTop: -15,
            marginBottom: 15,
            width: 180,
            borderRadius: 25,
            height: 180,
            justifyContent: 'center',
            alignItems: 'center',
            margin: 'auto',
          }}
        >
          {!channleInfo.iconPath ? (
            <>
              <NotFoundIcon color="#ccc" width="85" height="85" />
              <Text
                style={{
                  fontSize: 18,
                  color: '#777',
                  marginTop: 10,
                }}
              >
                {getDic('ChannelIconNotExist')}
              </Text>
            </>
          ) : (
            <View>
              <Image
                source={{ uri: getServer('HOST') + channleInfo.iconPath }}
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 25,
                  borderColor: '#e0e0e0',
                  borderWidth: 1.0,
                }}
              />
            </View>
          )}
        </View>
      </View>
      <View>
        {/* Input ChannelName */}
        <TitleInputBox
          editable={false}
          title={getDic('ChannelName')}
          placeholder={getDic('Msg_InputChannelName')}
          value={channleInfo.roomName}
        />
        {/* Input ChannelDescription */}
        <TitleInputBox
          editable={false}
          title={getDic('ChannelDescription')}
          placeholder={getDic('Msg_InputChannelDesc')}
          value={channleInfo.description}
        />
      </View>
      <View style={{ margin: 21 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
          {getDic('Category')}
        </Text>
        <View style={styles.dropdownContainer}>
          <View
            onPress={() => {
              setViewDropDownMenu(!viewDropDownMenu);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text style={styles.dropdownText}>{channleInfo.categoryName}</Text>
          </View>
        </View>
        <View />
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
  topRightBtn: {
    marginLeft: 'auto',
    right: -5,
  },
  tab: {
    flexDirection: 'row',
    width: '100%',
  },
  tabItem: {
    width: '50%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  tabItemActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#333',
  },
  selectList: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  selectItem: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectTxt: {
    width: '80%',
  },
  selectDel: {
    position: 'absolute',
    right: 5,
    top: 0,
  },
  tabcontent: {
    flex: 1,
    margin: 10,
  },
  dropdownContainer: {
    marginTop: 13,
    borderRadius: 3,
    borderWidth: 1,
    height: 35,
    borderColor: '#ddd',
  },
  dropdownText: {
    fontSize: 17,
    marginLeft: 9,
    marginTop: 9,
  },
  dropdownMenuText: {
    fontSize: 17,
    marginLeft: 9,
    marginTop: 9,
  },
  dropdownMenuContainer: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 100,
  },
});

export default withSecurityScreen(ChannelInfoDetailView);
