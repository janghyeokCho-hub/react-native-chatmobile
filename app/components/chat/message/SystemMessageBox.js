import React from 'react';
import { format, getDay } from 'date-fns';
import { View, Text, StyleSheet } from 'react-native';
import { getDictionary, isJSONStr } from '@/lib/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';

const getWeekText = dayIndex => {
  if (dayIndex == 0) {
    return getDictionary('일;Sun;Sun;Sun;;;;;;');
  } else if (dayIndex == 1) {
    return getDictionary('월;Mon;Mon;Mon;;;;;;');
  } else if (dayIndex == 2) {
    return getDictionary('화;Tue;Tue;Tue;;;;;;');
  } else if (dayIndex == 3) {
    return getDictionary('수;Wed;Wed;Wed;;;;;;');
  } else if (dayIndex == 4) {
    return getDictionary('목;Thu;Thu;Thu;;;;;;');
  } else if (dayIndex == 5) {
    return getDictionary('금;Fri;Fri;Fri;;;;;;');
  } else if (dayIndex == 6) {
    return getDictionary('토;Sat;Sat;Sat;;;;;;');
  }
};

const formatStr = (str, data) => {
  if (str) {
    return data.reduce((p, c) => {
      let replaceData = null;

      if (c.type == 'Plain') {
        replaceData = c.data;
      } else if (c.type == 'MultiPlain') {
        replaceData = getDictionary(c.data);
      } else if (c.type == 'Array') {
        const separator = c.separator || ',';
        if (typeof c.data == 'object' && typeof c.data.join == 'function') {
          replaceData = c.data.join(separator);
        } else {
          replaceData = '';
        }
      } else if (c.type == 'MultiArray') {
        const separator = c.separator || ',';
        if (typeof c.data == 'object' && typeof c.data.join == 'function') {
          const arrMulti = c.data.map(item => getDictionary(item));

          replaceData = arrMulti.join(separator);
        } else {
          replaceData = '';
        }
      }

      if (replaceData) return p.replace(/%s/, replaceData);
      else return p;
    }, str);
  } else {
    return '';
  }
};

const SystemMessageBox = ({ message, date }) => {
  const { sizes } = useTheme();
  let printMessage = '';
  if (date) {
    const msgDate = new Date(message);

    if (msgDate != 'Invalid Date') {
      const formatText = format(msgDate, `yyyy. MM. dd`);

      printMessage = `${formatText} (${getWeekText(getDay(msgDate))})`;
    } else {
      printMessage = message.context;
    }
  } else {
    if (isJSONStr(message.context)) {
      const jsonData = JSON.parse(message.context);
      printMessage = formatStr(getDic(jsonData.templateKey), jsonData.datas);
    } else {
      printMessage = message.context;
    }
  }
  return (
    <View style={styles.dateInfo}>
      <View style={styles.dateInfoTextBox}>
        <Text style={{ ...styles.dateInfoText, fontSize: sizes.chat }}>
          {printMessage}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dateInfo: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    margin: 20,
  },
  dateInfoTextBox: {
    alignItems: 'center',
    backgroundColor: '#ececec',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 15,
  },
  dateInfoText: {
    color: '#666',
    textAlign: 'center',
  },
});

export default React.memo(SystemMessageBox);
