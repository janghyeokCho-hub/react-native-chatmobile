import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { Plain, Link } from '@C/chat/message/types';
import { openChannel } from '@/modules/channel';
import { useTheme } from '@react-navigation/native';
import ParamUtil, { encryptText } from '@/lib/util/paramUtil';
import { getSysMsgFormatStr, isJSONStr } from '@/lib/common';
import { moveToChannelRoom } from '@/lib/channelUtil';
import { getConfig, getDic } from '@/config';

const getAttribute = tag => {
  const attrPattern = new RegExp(
    /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/,
    'gi',
  );
  let attrs = {};
  const match = tag.match(attrPattern);

  if (match && match.length > 0) {
    match.forEach(item => {
      try {
        const key = item.split('=')[0];
        let value = decodeURIComponent(item.split('=')[1]);

        if (
          (value[0] == '"' && value[value.length - 1] == '"') ||
          (value[0] == "'" && value[value.length - 1] == "'")
        ) {
          value = value.substring(1, value.length - 1);
        }

        attrs[key] = value;
      } catch (e) {}
    });
  }

  return attrs;
};

const Notice = ({ value, title, func, style, navigation, styleType }) => {
  const { sizes, colors } = useTheme();
  const userInfo = useSelector(({ login }) => login.userInfo);
  const forbiddenUrls = getConfig('forbidden_url_mobile', []);
  const dispatch = useDispatch();

  if (isJSONStr(value)) {
    value = getSysMsgFormatStr(
      getDic(JSON.parse(value).templateKey),
      JSON.parse(value).datas,
    );
  }
  const drawText = useMemo(() => {
    const pattern = new RegExp(/[<](LINK|NEWLINE)[^>]*[/>]/, 'gi');

    let newLineJSX = [];
    let returnJSX = [];

    let beforeLastIndex = 0;
    let match = null;
    while ((match = pattern.exec(value)) != null) {
      if (match.index > 0 && match.index > beforeLastIndex) {
        returnJSX.push(
          <Plain
            key={returnJSX.length}
            text={value.substring(beforeLastIndex, match.index)}
            style={{ ...styles[styleType], fontSize: sizes.chat }}
          />,
        );
      }
      var attrs = getAttribute(match[0]);
      if (match[1] == 'LINK') {
        returnJSX.push(
          <Link
            key={returnJSX.length}
            style={{ ...styles[styleType], fontSize: sizes.chat }}
            {...attrs}
          />,
        );
      } else if (match[1] == 'NEWLINE') {
        if (returnJSX.length == 0) {
          newLineJSX.push(
            <View key={newLineJSX.length} style={styles.lineBreaker}>
              <Plain
                key="newline_0"
                text=""
                style={{ ...styles[styleType], fontSize: sizes.chat }}
              />
            </View>,
          );
        } else {
          newLineJSX.push(
            <View key={newLineJSX.length} style={styles.lineBreaker}>
              {[...returnJSX]}
            </View>,
          );

          returnJSX = [];
        }
      }

      beforeLastIndex = match.index + match[0].length;
    }

    if (beforeLastIndex < value.length)
      returnJSX.push(
        <Plain
          key={returnJSX.length}
          text={value.substr(beforeLastIndex)}
          style={{ ...styles[styleType], fontSize: sizes.chat }}
        />,
      );

    if (returnJSX.length > 0) {
      newLineJSX.push(
        <View key={newLineJSX.length} style={styles.lineBreaker}>
          {[...returnJSX]}
        </View>,
      );
    }

    return newLineJSX;
  }, [value]);

  const actionHandler = (type, data) => {
    if (type == 'link') {
      return async () => {
        let url = '';
        if (typeof data === 'string') {
          url = data;
        } else if (typeof data === 'object' && data !== null) {
          url = data.baseURL;
          let paramStr = '';

          if (data.params) {
            for (const [key, value] of Object.entries(data.params)) {
              let expressionStr = value.param;
              if (!value.plain) {
                const pUtil = new ParamUtil(value.param, userInfo);
                expressionStr = await pUtil.getURLParam();
              }

              if (value.enc) {
                const { data } = await encryptText(expressionStr);

                if (data.status === 'SUCCESS') {
                  expressionStr = data.result;
                }
              }

              paramStr += `${
                paramStr.length > 0 ? '&' : ''
              }${key}=${encodeURIComponent(expressionStr)}`;
            }
          }

          if (paramStr.length > 0) {
            if (url.indexOf('?') > -1) {
              url = `${url}&${paramStr}`;
            } else {
              url = `${url}?${paramStr}`;
            }
          }
        }

        let allowOpenUrl = true;
        // 열기가 금지된 url인지 확인
        forbiddenUrls.some((f_url) => {
          if(url.includes(f_url) === true) {
            allowOpenUrl = false;
            return true;
          }
          return false;
        });

        // 금지된 url일 경우 브라우저로 열지 않음
        if(allowOpenUrl === false) {
          Alert.alert(null, getDic('Msg_ForbiddenUrl', 'PC에서 확인해주세요.'), [
            { text: getDic('Ok') }
          ]);
          return;
        }

        Linking.canOpenURL(url).then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            // Linking.canOpenURL('http://192.168.11.80' + url).then(supported => {
            //   console.log(supported);
            //   if (supported) {
            //     Linking.openURL('http://192.168.11.80' + url);
            //   }
            // });
          }
        });
      };
    } else if (type == 'moveChannel') {
      return () => {
        console.log(data);
        dispatch(
          openChannel({
            roomId: data,
          }),
        );
        moveToChannelRoom(navigation, 'ChannelRoom', {
          roomID: data,
        });
      };
    }
  };

  const drawFunc = useMemo(() => {
    if (func) {
      const handlerFunc = actionHandler(func.type, func.data);
      return (
        <TouchableOpacity
          onPress={handlerFunc}
          style={{ ...styles.funcWrap, backgroundColor: colors.primary }}
        >
          <View style={styles.funcWrapBox}>
            <Text style={{ ...styles.funcText, fontSize: sizes.large }}>
              {func.name ? func.name : '확인하기'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return <></>;
    }
  }, [func]);

  return (
    <View style={[style, styles.container]}>
      <View style={styles.titleIco}>
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          width="33.452"
          height="36.776"
          viewBox="0 0 33.452 36.776"
        >
          <G transform="translate(0)">
            <Path
              d="M21.505,30.947a1.32,1.32,0,0,0,1.21.814H32.3a5.869,5.869,0,0,0,11.613,0H53.53a.61.61,0,0,0,.2-.022,1.339,1.339,0,0,0,1.056-.836,1.292,1.292,0,0,0-.33-1.386l-.066-.066a6.169,6.169,0,0,1-1.166-1.98,19.646,19.646,0,0,1-1.232-7.456c0-7.346-2.771-11.217-5.081-13.175A11.67,11.67,0,0,0,42.818,4.6a5.2,5.2,0,0,0-1.1-3.123A4.408,4.408,0,0,0,38.155,0a4.461,4.461,0,0,0-3.541,1.474,5.13,5.13,0,0,0-1.122,3.189,11.789,11.789,0,0,0-4.091,2.2c-4.245,3.475-5.125,9.062-5.125,13.109a19.335,19.335,0,0,1-1.254,7.39,8.081,8.081,0,0,1-1.21,2.133h0A1.321,1.321,0,0,0,21.505,30.947Zm16.628,3.189a3.279,3.279,0,0,1-3.123-2.375h6.247A3.279,3.279,0,0,1,38.133,34.136ZM26.916,19.971c0-11.833,7.742-12.955,8.05-13a1.345,1.345,0,0,0,.9-.506,1.365,1.365,0,0,0,.264-1.012,3.256,3.256,0,0,1,.484-2.331,1.782,1.782,0,0,1,1.54-.55,1.885,1.885,0,0,1,1.562.55,3.217,3.217,0,0,1,.462,2.243,1.284,1.284,0,0,0,.242,1.012,1.324,1.324,0,0,0,.9.528A8.59,8.59,0,0,1,45.26,8.842c2.749,2.309,4.135,6.071,4.135,11.173a20.738,20.738,0,0,0,1.716,9.128H25.156A21.724,21.724,0,0,0,26.916,19.971Z"
              transform="translate(-21.409)"
              fill="#373737"
            />
          </G>
        </Svg>
      </View>
      <View style={styles.titleWrap}>
        <Text style={{ fontSize: sizes.large }}>
          {title ? title : getDic('SystemAlarm')}
        </Text>
      </View>
      {drawText}
      {drawFunc}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  titleIco: {
    marginTop: 15,
  },
  titleWrap: {
    marginTop: 10,
    marginBottom: 10,
  },
  lineBreaker: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
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
  funcWrap: {
    marginTop: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    borderRadius: 5,
  },
  funcText: {
    color: '#FFF',
    fontWeight: '800',
  },
});

export default Notice;
