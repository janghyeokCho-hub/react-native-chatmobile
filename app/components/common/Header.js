import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProfileBox from '@/components/common/ProfileBox';
import { useSelector } from 'react-redux';

const Header = ({ title, topButton }) => {
  const { userId, userInfo } = useSelector(({ login }) => ({
    userId: login.id,
    userInfo: login.userInfo,
  }));

  return userInfo ? (
    <View style={styles.headerContainer}>
      <ProfileBox
        userId={userId}
        userName={userInfo.name}
        presence={userInfo.presence}
        isInherit={false}
        img={userInfo.photoPath}
      />
      <Text style={styles.titleBox}>{title}</Text>
      {topButton && (
        <View style={styles.headerView}>
          {topButton.map(item => (
            <TouchableOpacity key={item.code} onPress={item.onPress}>
              <View style={styles.headerBtn}>{item.svg}</View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  ) : (
    <></>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 5,
  },
  titleBox: {
    fontSize: 26,
    color: '#000',
    paddingLeft: 15,
  },
  headerView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#efefef',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default Header;
