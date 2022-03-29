import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getJobInfo, getDictionary } from '@/lib/common';
import ShareProfileBox from '@COMMON/share/common/ShareProfileBox';
import ToggleButton from '@COMMON/buttons/ToggleButton';

const ShareUserInfoBox = ({
  userInfo,
  onPress,
  isCheckComponent,
  checked,
  onCheck,
}) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          if (onPress) onPress();
        }}
      >
        <View style={styles.container}>
          {userInfo.type === 'G' && (
            <>
              <ShareProfileBox
                type={userInfo.type}
                img={null}
                userName={null}
              />
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{getDictionary(userInfo.name)}</Text>
              </View>
            </>
          )}
          {userInfo.type === 'U' && (
            <>
              <ShareProfileBox
                type={userInfo.type}
                img={userInfo.photoPath}
                userName={getDictionary(userInfo.name)}
              />
              <View style={styles.titleContainer}>
                <View style={styles.titleView}>
                  <Text style={{ ...styles.title, fontSize: 15 }}>
                    {getJobInfo(userInfo)}
                  </Text>
                </View>
                <Text style={{ ...styles.subtitle, fontSize: 13 }}>
                  {getDictionary(userInfo.dept)}
                </Text>
              </View>
            </>
          )}

          {isCheckComponent && (
            <>
              {userInfo.type === 'U' && (
                <ToggleButton
                  data={userInfo}
                  checked={checked}
                  onPress={onPress}
                />
              )}
              {userInfo.type === 'G' && userInfo.pChat === 'Y' && (
                <ToggleButton
                  data={userInfo}
                  checked={checked}
                  onPress={onCheck}
                />
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
    marginLeft: 15,
  },
  titleView: { flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '500' },
  subtitle: {
    color: '#999',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightMessage: {
    color: '#666',
  },
  rightMessageBox: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    marginLeft: 'auto',
    borderWidth: 0.5,
    borderColor: '#BFBFBF',
    maxWidth: '50%',
    borderRadius: 15,
  },
  rightAbsenceMessage: {
    color: '#ff2000',
  },
  rightMessageAbsenceBox: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    marginLeft: 'auto',
    borderWidth: 0.5,
    borderColor: '#ff4000',
    maxWidth: '50%',
    borderRadius: 15,
  },
  absenceDot: {
    width: 10,
    height: 10,
    borderRadius: 50,
    marginLeft: 5,
    borderWidth: 1.5,
    borderColor: '#ff2000',
  },
});

export default ShareUserInfoBox;
