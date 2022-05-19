import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  format,
  isValid,
  startOfToday,
  differenceInMilliseconds,
} from 'date-fns';
import { useSelector } from 'react-redux';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Plain, Link } from '@C/chat/message/types';
import ChannelNoticeIcon from '@/components/common/icons/ChannelNoticeIcon';
import { getDic } from '@/config';
import {
  getJobInfo,
  eumTalkRegularExp,
  convertEumTalkProtocol,
  convertURLMessage,
} from '@/lib/common';
import useMemberInfo from '@/lib/hooks/useMemberInfo';
import { getAttribute } from '@/lib/messageUtil';

const upBtnIcon = require('@C/assets/group_button_up.png');
const downBtnIcon = require('@C/assets/group_button_down.png');

const ChannelNoticeView = ({
  noticeInfo,
  open,
  flip,
  onPress,
  onFlipHandler,
  onDisableHandler,
  onNoticeRemoveHandler,
}) => {
  const userInfo = useSelector(({ login }) => login.userInfo);
  const [noticeTitleMinimumSize, setNoticeTitleMinimumSize] = useState(false);
  const makeDateTime = timestamp => {
    if (isValid(new Date(timestamp))) {
      const toDay = startOfToday();
      const procTime = new Date(timestamp);
      let dateText = '';

      if (differenceInMilliseconds(procTime, toDay) >= 0) {
        // 오늘보다 큰 경우 시간 표시
        dateText = format(procTime, 'HH:mm');
      } else {
        // 오늘과 이틀이상 차이나는 경우 날짜로 표시
        dateText = format(procTime, 'yyyy.MM.dd');
      }

      // 오늘과 하루 차이인 경우 어제로 표시 -- 차후에 추가 ( 다국어처리 )

      return dateText;
    } else {
      return '';
    }
  };

  const context = useMemo(() => {
    return convertURLMessage(noticeInfo.context);
  }, [noticeInfo.context]);

  const { findMemberInfo } = useMemberInfo('channel');
  const [processedContext, setProcessedContext] = useState([]);

  const generateJSX = async () => {
    const pattern = new RegExp(/[<](MENTION|LINK)[^>]*[/>]/, 'gi');
    const returnJSX = [];
    let match = null;
    let beforeLastIndex = 0;
    if (eumTalkRegularExp.test(context) || /[<](LINK)[^>]*[/>]/.test(context)) {
      const { message, mentionInfo } = convertEumTalkProtocol(context, {
        messageType: 'channel',
      });
      while ((match = pattern.exec(message)) !== null) {
        if (match.index > 0 && match.index > beforeLastIndex) {
          const txt = message.substring(beforeLastIndex, match.index);
          returnJSX.push(<Plain key={returnJSX.length} text={txt} />);
        }

        const attrs = getAttribute(match[0]);
        if (match[1] === 'MENTION') {
          const memberInfo = await findMemberInfo(mentionInfo, attrs.targetId);
          let mention = '@Unknown';
          if (memberInfo.name) {
            mention = `@${getJobInfo(memberInfo)}`;
          } else if (memberInfo.id) {
            mention = `@${memberInfo.id}`;
          }
          returnJSX.push(
            <Text key={returnJSX.length} style={{ fontWeight: 'bold' }}>
              {mention}
            </Text>,
          );
        } else if (match[1] === 'LINK') {
          returnJSX.push(<Link key={returnJSX.length} {...attrs} />);
        }
        beforeLastIndex = match.index + match[0].length;
      }

      if (beforeLastIndex < message.length) {
        const txt = message.substring(beforeLastIndex);
        returnJSX.push(<Plain key={returnJSX.length} text={txt} />);
      }
    }
    if (beforeLastIndex === 0 && returnJSX.length === 0) {
      returnJSX.push(<Plain key={returnJSX.length} text={context} />);
    }
    return returnJSX;
  };

  useEffect(() => {
    generateJSX().then(jsx => {
      setProcessedContext(jsx);
    });
  }, [context]);

  useEffect(() => {
    return () => setNoticeTitleMinimumSize(false);
  }, []);

  const createName = useMemo(() => {
    let senderInfo = noticeInfo.senderInfo;
    if (typeof senderInfo == 'string') senderInfo = JSON.parse(senderInfo);

    return getJobInfo(senderInfo);
  }, [noticeInfo]);

  /**
   * 2021.01.11
   * 공지컴포넌트 펼쳐보기 최대 height -> 전체높이의 40% + 30(버튼높이)
   */
  const { height } = useWindowDimensions();
  const maxHeight = useMemo(() => {
    return Math.round(height * 0.4);
  }, [height]);

  const [paddingBottom, setPaddingBottom] = useState(0);
  const handleLayout = useCallback(
    event => {
      const { height } = event.nativeEvent.layout;
      /**
       * =공지 컴포넌트를 펼쳤을 경우=
       * 접어두기/공지내리기 버튼이 메시지에 덮여 가려지는 현상 방지를 위해 가려지는 만큼의 paddingBottom을 붙여주는 로직 구현
       */
      if (height > maxHeight - 30) {
        setPaddingBottom(height - maxHeight + 30);
      } else {
        setPaddingBottom(0);
      }
    },
    [height],
  );

  return (
    <View
      style={{
        maxHeight: noticeTitleMinimumSize && flip ? maxHeight : '100%',
        paddingBottom: noticeTitleMinimumSize && flip ? paddingBottom : 0,
      }}
      onLayout={handleLayout}
    >
      <View
        style={{
          borderBottomColor: '#e0e0e0',
          borderBottomWidth: 0.8,
        }}
      >
        {open && (
          <View style={{ flexDirection: 'row', margin: 15 }}>
            <View
              style={{
                width: 45,
                height: 45,
                borderRadius: 25,
                borderWidth: 0.8,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: '#e0e0e0',
              }}
            >
              <ChannelNoticeIcon color="black" width="24" height="24" />
            </View>
            <ScrollView>
              <View
                style={{ marginLeft: 12 }}
                onLayout={event => {
                  if (event.nativeEvent.layout.height > 60)
                    setNoticeTitleMinimumSize(true);
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: 'black',
                    marginBottom: 4,
                  }}
                  // 공지가 접혀있을 때 => 4줄을 넘는 내용은 '...' 노출
                  // 공지를 펼쳤을 때 => numberOfLines 제한을 없애고 ScrollView 노출
                  numberOfLines={noticeTitleMinimumSize && flip ? 0 : 3}
                >
                  {processedContext}
                </Text>
                <Text style={{ fontSize: 14, color: '#777' }}>
                  {makeDateTime(noticeInfo.sendDate) + ' ' + createName}
                </Text>
              </View>
            </ScrollView>
            <TouchableOpacity
              style={{
                marginLeft: 'auto',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={onPress}
            >
              {flip ? (
                <Image source={upBtnIcon} style={{ width: 24, height: 24 }} />
              ) : (
                <Image
                  source={downBtnIcon}
                  style={{ width: 24, height: 24 }}
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      {flip && (
        <View
          style={{
            height: 30,
            flexDirection: 'row',
            borderBottomWidth: 0.8,
            borderBottomColor: '#e0e0e0',
            backgroundColor: 'inherit',
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              borderRightColor: '#e0e0e0',
              borderRightWidth: 1.0,
            }}
            onPress={onFlipHandler}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
              }}
            >
              {getDic('FlipNotice')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              borderRightColor: '#e0e0e0',
              borderRightWidth: 1.0,
            }}
            onPress={onDisableHandler}
          >
            <Text style={{ textAlign: 'center', fontSize: 14 }}>
              {getDic('CloseNotice')}
            </Text>
          </TouchableOpacity>
          {userInfo && userInfo.id === noticeInfo.sender && (
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: 'center',
                borderRightColor: '#e0e0e0',
                borderRightWidth: 1.0,
              }}
              onPress={onNoticeRemoveHandler}
            >
              <Text style={{ textAlign: 'center', fontSize: 14 }}>
                {getDic('RemoveNotice')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default ChannelNoticeView;
