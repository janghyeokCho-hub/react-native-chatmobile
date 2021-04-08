import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import ProfileBox from '@C/common/ProfileBox';
import { getJobInfo, getDictionary } from '@/lib/common';

const ChannelMentionBox = ({ members, onPress }) => {
  return (
    <View style={styles.selectList}>
      <FlatList
        data={members}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => {
                onPress(`@${getJobInfo(item, true)}`);
              }}
            >
              <View style={styles.selectItem}>
                <ProfileBox
                  userId={item.id}
                  img={item.photoPath}
                  presence={item.type == 'G' ? item.presence : null}
                  isInherit={false}
                  userName={item.name}
                  handleClick={false}
                />
                <View style={{ flexDirection: 'column', marginLeft: 7 }}>
                  <Text style={styles.selectTxt}>{getJobInfo(item)}</Text>
                  <Text style={styles.selectTxt}>
                    {getDictionary(item.dept)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  selectList: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
    borderTopColor: '#f0f0f0',
    borderTopWidth: 1.0,
    // borderRightColor: '#f0f0f0',
    // borderRightWidth: 1.0,
    // width: '65%',
  },
  selectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 12,
  },
});

export default ChannelMentionBox;
