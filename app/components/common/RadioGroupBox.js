import React from 'react';
import { Text, StyleSheet, View, TextInput } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ToggleButton from '@/components/common/buttons/ToggleButton';

const checkedBtn = require('@C/assets/checked.png');
const uncheckedBtn = require('@C/assets/unchecked.png');

const RadioGroupBox = ({ title, select, groupList, onChangeItem }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={{ flexDirection: 'row', marginTop: 18 }}>
        {groupList.map(data => {
          return select.id == data.id ? (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 20,
              }}
              onPress={() => {
                onChangeItem(data);
              }}
            >
              {/* <Image style={{ width: 28, height: 28 }} source={checkedBtn} /> */}
              <ToggleButton checked={true} />
              <Text style={{ marginLeft: 10, fontSize: 16 }}>{data.name}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 20,
              }}
              onPress={() => {
                onChangeItem(data);
              }}
            >
              {/* <Image style={{ width: 28, height: 28 }} source={uncheckedBtn} /> */}
              <ToggleButton checked={false} />
              <Text style={{ marginLeft: 10, fontSize: 16 }}>{data.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 21,
    marginTop: -10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RadioGroupBox;
