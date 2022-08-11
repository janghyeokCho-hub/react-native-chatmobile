import React, { useState, useEffect } from 'react';
import { Plain, Link, Tag, Sticker, Mention } from '@C/chat/message/types';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import MessageReplyBox from '@/components/reply/MessageReplyBox';
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
  replyID,
  replyInfo,
  goToOriginMsg,
  roomType,
}) => {
  const { colors, sizes } = useTheme();
  const replyView = replyID > 0;

  return (
    <>
      <View
        style={[
          {
            backgroundColor: styleType === 'repliseText' ? colors.primary : '',
          },
          style,
          styles.container,
        ]}
        id={eleId ? eleId : undefined}
      >
        {replyView && (
          <MessageReplyBox
            replyID={replyID}
            replyInfo={replyInfo}
            roomType={roomType}
            style={style}
            styleType={styleType}
            roomInfo={roomInfo}
            sizes={sizes}
            marking={marking}
            goToOriginMsg={goToOriginMsg}
          />
        )}
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
