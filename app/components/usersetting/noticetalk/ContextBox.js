import React from 'react';
import { getDic } from '@/config';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import RequiredIcon from '@/components/common/icons/RequiredIcon';

const ContextBox = props => {
  const { setChangeText, changeText, url, setUrl } = props;

  return (
    <View style={styles.Contaitner}>
      <View style={styles.LinkContainer}>
          <View style={styles.checkboxContainer}>
            <Text style={styles.label}>
              {getDic('Insert_Link', '바로가기 링크 추가')}
            </Text>
        </View>
        <TextInput
          onChangeText={text => setUrl(text)}
          style={styles.LinkInput}
          value={url}
          placeholder={getDic('Msg_Enter_Url', '바로가기 url을 입력하세요.')}
        />
      </View>
      <View style={styles.textInputBox}>
        <View style={styles.ContextTxt}>
          <Text>{getDic('Context', '내용')}</Text>
          <View style={{ height: 13, width: 8 }}>
            <RequiredIcon />
          </View>
        </View>
        <TextInput
          style={styles.textInput}
          onChangeText={text => setChangeText(text)}
          multiline
          numberOfLines={20}
          scrollEnabled
          value={changeText}
          placeholder={getDic('Msg_Note_EnterContext', '내용을 입력하세요')}
        />
      </View>
    </View>
  );
};

export default ContextBox;

const styles = StyleSheet.create({
  Contaitner: {
    flex: 1,
  },
  LinkContainer: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cecece',
  },
  checkboxContainer: {
    borderRightColor: '#cecece',
    borderRightWidth: 1,
  },
  checkbox: {
    alignSelf: 'center',
  },
  label: {
    marginHorizontal: 15,
    height: '100%',
    textAlignVertical: 'center',
  },
  LinkInput: {
    width: '100%',
  },
  ContextTxt: {
    marginTop: 10,
    flexDirection: 'row',
    marginLeft: 15,
  },
  textInputBox: {
    paddingVertical: 5,
  },
  textInput: {
    width: '95%',
    height: 400,
    paddingHorizontal: 15,
    marginTop: 3,
    textAlignVertical: 'top',
  },
});
