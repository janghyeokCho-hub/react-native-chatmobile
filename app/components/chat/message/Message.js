import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { convertChildren } from '@/lib/messageUtil';

const Message = ({
  children,
  style,
  eleId,
  roomInfo,
  navigation,
  marking,
  styleType,
  longPressEvt,
}) => {
  const { colors, sizes } = useTheme();

  return (
    <>
      {(eleId && (
        <View
          style={[
            {
              backgroundColor:
                styleType === 'repliseText' ? colors.primary : '',
            },
            style,
            styles.container,
          ]}
          id={eleId}
        >
          {convertChildren({
            children,
            style,
            styleType,
            marking,
            roomInfo,
            sizes,
            longPressEvt,
            navigation,
          })}
        </View>
      )) || (
        <View
          style={[
            {
              backgroundColor:
                styleType === 'repliseText' ? colors.primary : '',
            },
            style,
            styles.container,
          ]}
        >
          {convertChildren({
            children,
            style,
            styleType,
            marking,
            roomInfo,
            sizes,
            longPressEvt,
            navigation,
          })}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  repliseText: {
    color: '#fff',
    fontSize: 13,
  },
  sentText: {
    color: '#444',
    fontSize: 13,
  },
  sentMentionText: {
    color: '#444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sendText: {
    color: '#444',
    fontSize: 13,
  },
  noticeText: {
    color: '#444',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default React.memo(Message, (prevProps, nextProps) => {
  // true : rerender
  // false : skip
  return (
    prevProps.marking !== nextProps.marking ||
    prevProps.children === nextProps.children
  );
});
