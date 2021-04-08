import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import DropDownIcon from '@COMMON/icons/DropDownIcon';

const categoryLists = [
  { categoryName: '전사공통', categoryCode: 'COMMON' },
  { categoryName: '커뮤니티', categoryCode: 'COMMUNITY' },
];

const DropDownBox = (categoryList, onChangeHandler) => {
  const [value, setValue] = useState(categoryLists[0]);
  const [viewDropDownMenu, setViewDropDownMenu] = useState(false);

  return (
    <View>
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          onPress={() => {
            setViewDropDownMenu(!viewDropDownMenu);
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {(value == null && (
            <Text style={styles.dropdownText}>select any items...</Text>
          )) || <Text style={styles.dropdownText}>{value.categoryName}</Text>}
          <View
            style={{
              marginLeft: 'auto',
              marginRight: 7,
              marginTop: 3,
            }}
          >
            <DropDownIcon />
          </View>
        </TouchableOpacity>
      </View>
      {viewDropDownMenu && (
        <ScrollView style={styles.dropdownMenuContainer}>
          {categoryLists.map(data => {
            return (
              <TouchableOpacity
                onPress={() => {
                  setValue(data);
                  onChangeHandler(data);
                  setViewDropDownMenu(false);
                }}
              >
                <Text style={styles.dropdownMenuText}>{data.categoryName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      <View />
    </View>
  );
};

const styles = StyleSheet.create({
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

export default DropDownBox;
