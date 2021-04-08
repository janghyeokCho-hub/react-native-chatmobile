import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getScreenWidth, getScreenHeight } from '@/lib/device/common';
import ChannelCategoryItemIcon from '@COMMON/icons/ChannelCategoryItemIcon';

const CategoryBox = ({ title, icon, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        height: getScreenHeight() / 5.5,
        width: getScreenWidth() / 2.5,
        flexDirection: 'row',
        borderWidth: 0.8,
        borderColor: '#e0e0e0',
        alignSelf: 'stretch',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        marginLeft: getScreenWidth() / 15,
      }}
    >
      {icon.categoryCode === 'ALL' ? (
        <View stlye={styles.iconContainer}>
          <View style={styles.allIcon}>
            <Text style={styles.allIconTitle}>ALL</Text>
          </View>
          <Text style={styles.title}>
            {title.length >= 6 ? title.substring(0, 5) + '...' : title}
          </Text>
        </View>
      ) : (
        <View style={styles.iconContainer}>
          <ChannelCategoryItemIcon
            color={icon.categoryColor}
            width="65"
            height="65"
          />
          <Text style={styles.title}>
            {title.length >= 6 ? title.substring(0, 5) + '...' : title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  allIcon: {
    backgroundColor: '#e0e0e0',
    width: 48,
    height: 48,
    justifyContent: 'center',
    borderRadius: 55,
    margin: 12,
  },
  allIconTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 24,
  },
  title: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 15,
  },
});
export default CategoryBox;
