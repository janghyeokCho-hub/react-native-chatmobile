import React, { useState, useEffect } from 'react';
import { Plain, Link, Tag, Sticker, Mention } from '@C/chat/message/types';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { getAttribute } from '@/lib/messageUtil';
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
      {convertChildren({ children, style, marking })}
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
      {convertChildren({ children, style, marking })}
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
  lineBreaker: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
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
