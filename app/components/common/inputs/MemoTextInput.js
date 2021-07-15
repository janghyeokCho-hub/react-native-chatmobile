import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    TextInput,
    StyleSheet
} from 'react-native';
import {
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Check from './Check';
import AsyncStorage from '@react-native-community/async-storage';
import { useTheme } from '@react-navigation/native';

const MemoInput = ({
    memKey,
    changeHandler,
    placeholder,
    value,
    disabled
}) => {
    const { sizes } = useTheme();
    const prefix = 'eum:meminput';
    const [isMemoried, setIsMemoried] = useState(false);

    useEffect(() => {
      AsyncStorage.getItem(`${prefix}:${memKey}`).then((memItem)=>{
        if (memItem) {
          changeHandler(memItem);
          setIsMemoried(true);
        }
      });

    }, []);

    const changeMemValue = useCallback(val => {
      AsyncStorage.setItem(`${prefix}:${memKey}`, val);
    }, []);

    useEffect(() => {
      if (isMemoried) {
        // input 창에 있는 값 저장
        AsyncStorage.setItem(`${prefix}:${memKey}`, value);
      } else {
        // AsyncStorage에 저장되어있는 값 삭제
        AsyncStorage.removeItem(`${prefix}:${memKey}`);
      }
    }, [isMemoried]);

    return (
        <View style={styles.container}>
            <View style={{ ...styles.textForm_Wrapper}}>
              <TextInput
                  style={{ ...styles.textForm_Type1, fontSize: sizes.large }}
                  placeholder={placeholder}
                  placeholderTextColor={'#AAA'}
                  value={value}
                  onChangeText={text =>{
                    isMemoried && changeMemValue(text);
                    changeHandler(text);
                  }}
                  disabled={disabled}
              />
              <Check
                onChange={isChecked => {
                  setIsMemoried(isChecked);
                }}
                checked={isMemoried}
              ></Check>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%', 
        position: 'relative'
    },
    textForm_Wrapper: {
      display: 'flex',
      flexDirection: 'row',
      borderTopWidth: 0.5,
      borderLeftWidth: 0.5,
      borderRightWidth: 0.5,
      borderColor: '#999999',
      color: '#000',
      width: '100%',
      height: hp('6%'),
      paddingRight : 10,
      borderTopRightRadius: 2,
      borderTopLeftRadius: 2,
    },
    textForm_Type1: {
      paddingLeft: 10,
      borderColor: '#999999',
      color: '#000',
      width: '100%',
      height: hp('6%'),
    }
});

export default MemoInput;
