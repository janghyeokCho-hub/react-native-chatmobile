import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Header from '@COMMON/Header';
import { logoutRequest } from '@/modules/login';
import Svg, { G, Path, Circle, Rect } from 'react-native-svg';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';

const UserSetting = ({ navigation, props }) => {
  const { sizes } = useTheme();
  const { id, token, userInfo, noticeTalkAuth } = useSelector(({ login }) => ({
    id: login.id,
    token: login.token,
    userInfo: login.userInfo,
  }));

  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      null,
      getDic('Msg_logout'),
      [
        { text: getDic('Cancel') },
        {
          text: getDic('Ok'),
          onPress: () => {
            const data = {
              id,
              token,
            };
            dispatch(logoutRequest(data));
          },
        },
      ],
      { cancelable: true },
    );
  };

  useEffect(() => {
    console.log(userInfo, 'noticeTalkAuth');
  }, [userInfo]);
  return (
    <View style={styles.container}>
      <Header
        title={getDic('UserSetting')}
        style={styles.header}
        searchEnable={false}
      />
      <ScrollView style={styles.contents}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('InfoSetting');
          }}
        >
          <View style={styles.wrapButton}>
            <Svg width="15" height="15" viewBox="0 0 46.098 52.509">
              <G id="messenger-user-avatar" transform="translate(3)">
                <G id="그룹_45" data-name="그룹 45" transform="translate(-3)">
                  <Path
                    id="패스_75"
                    data-name="패스 75"
                    d="M45.592,50.382a2.134,2.134,0,0,0,2.127,2.127H89.563a2.134,2.134,0,0,0,2.127-2.127c0-11.771-8.194-21.876-15.674-25.918a13.349,13.349,0,1,0-14.714,0C53.785,28.506,45.592,38.61,45.592,50.382ZM68.641,4.255a9.076,9.076,0,1,1-9.076,9.076A9.094,9.094,0,0,1,68.641,4.255Zm0,22.514c8.3,0,17.979,9.466,18.724,21.486H49.917C50.662,36.235,60.345,26.769,68.641,26.769Z"
                    transform="translate(-45.592)"
                    fill="#222"
                  />
                </G>
              </G>
            </Svg>
            <Text
              style={{ ...styles.wrapButtonTitle, fontSize: sizes.default }}
            >
              {getDic('MyInfo')}
            </Text>
          </View>
        </TouchableOpacity>
        {userInfo && userInfo.isHR === 'N' && (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('PasswordSetting');
            }}
          >
            <View style={styles.wrapButton}>
              <Svg
                id="blocked-padlock"
                width="15"
                height="15"
                viewBox="0 0 45.922 56.237"
              >
                <G id="그룹_106" data-name="그룹 106" transform="translate(0)">
                  <Path
                    id="패스_182"
                    data-name="패스 182"
                    d="M52.416,56.237H81.34a8.388,8.388,0,0,0,8.5-8.35V29.209a8.275,8.275,0,0,0-6.169-8.078v-5.9A15.154,15.154,0,0,0,68.592,0H65.165A15.426,15.426,0,0,0,49.743,15.235v5.9a8.377,8.377,0,0,0-5.826,8.078V47.887A8.388,8.388,0,0,0,52.416,56.237ZM65.164,4.09h3.427A11.042,11.042,0,0,1,79.558,15.235v5.556h-25.7V15.235A11.336,11.336,0,0,1,65.164,4.09ZM85.727,47.785a4.361,4.361,0,0,1-4.387,4.363H52.416a4.361,4.361,0,0,1-4.387-4.363V29.243a4.361,4.361,0,0,1,4.387-4.363H81.34a4.361,4.361,0,0,1,4.387,4.363V47.785Z"
                    transform="translate(-43.917)"
                    fill="#222"
                  />
                  <Path
                    id="패스_183"
                    data-name="패스 183"
                    d="M213.165,313.926a2.088,2.088,0,0,0,2.082-2.082v-6.594a2.082,2.082,0,0,0-4.165,0v6.594A2.088,2.088,0,0,0,213.165,313.926Z"
                    transform="translate(-190.889 -266.852)"
                    fill="#222"
                  />
                </G>
              </Svg>
              <Text
                style={{ ...styles.wrapButtonTitle, fontSize: sizes.default }}
              >
                {getDic('PasswordChange')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('AppLockSetting');
          }}
        >
          <View style={styles.wrapButton}>
            <Svg
              id="blocked-padlock"
              width="15"
              height="15"
              viewBox="0 0 45.922 56.237"
            >
              <G id="그룹_106" data-name="그룹 106" transform="translate(0)">
                <Path
                  id="패스_182"
                  data-name="패스 182"
                  d="M52.416,56.237H81.34a8.388,8.388,0,0,0,8.5-8.35V29.209a8.275,8.275,0,0,0-6.169-8.078v-5.9A15.154,15.154,0,0,0,68.592,0H65.165A15.426,15.426,0,0,0,49.743,15.235v5.9a8.377,8.377,0,0,0-5.826,8.078V47.887A8.388,8.388,0,0,0,52.416,56.237ZM65.164,4.09h3.427A11.042,11.042,0,0,1,79.558,15.235v5.556h-25.7V15.235A11.336,11.336,0,0,1,65.164,4.09ZM85.727,47.785a4.361,4.361,0,0,1-4.387,4.363H52.416a4.361,4.361,0,0,1-4.387-4.363V29.243a4.361,4.361,0,0,1,4.387-4.363H81.34a4.361,4.361,0,0,1,4.387,4.363V47.785Z"
                  transform="translate(-43.917)"
                  fill="#222"
                />
                <Path
                  id="패스_183"
                  data-name="패스 183"
                  d="M213.165,313.926a2.088,2.088,0,0,0,2.082-2.082v-6.594a2.082,2.082,0,0,0-4.165,0v6.594A2.088,2.088,0,0,0,213.165,313.926Z"
                  transform="translate(-190.889 -266.852)"
                  fill="#222"
                />
              </G>
            </Svg>
            <Text
              style={{ ...styles.wrapButtonTitle, fontSize: sizes.default }}
            >
              {getDic('AppLockSetting')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ChatSetting');
          }}
        >
          <View style={styles.wrapButton}>
            <Svg width="15" height="15" viewBox="0 0 72.059 68.263">
              <G
                id="그룹_566"
                data-name="그룹 566"
                transform="translate(9139 -9813.483)"
              >
                <G
                  id="chat-speech-balloon"
                  transform="translate(-9139 9813.483)"
                >
                  <G
                    id="그룹_110"
                    data-name="그룹 110"
                    transform="translate(0 0)"
                  >
                    <Path
                      id="패스_195"
                      data-name="패스 195"
                      d="M750.384,413.248c-19.88,0-36.034,12.954-36.034,28.851a26.653,26.653,0,0,0,11.809,21.376l-2.577,14.963a2.6,2.6,0,0,0,1.029,2.589,2.384,2.384,0,0,0,1.5.483,2.24,2.24,0,0,0,1.2-.305l19.021-10.453c1.374.131,2.706.177,4.037.177,19.88,0,36.034-12.954,36.034-28.851S770.257,413.248,750.384,413.248Zm0,52.389c-1.374,0-2.834-.089-4.294-.22a2.6,2.6,0,0,0-1.5.305l-15.027,8.245,1.933-11.3a2.632,2.632,0,0,0-1.16-2.678,21.784,21.784,0,0,1-10.862-17.916c0-13,13.87-23.583,30.873-23.583s30.873,10.584,30.873,23.583S767.38,465.637,750.384,465.637Z"
                      transform="translate(-714.35 -413.248)"
                      fill="#222"
                    />
                  </G>
                </G>
              </G>
            </Svg>
            <Text
              style={{ ...styles.wrapButtonTitle, fontSize: sizes.default }}
            >
              {getDic('ChatSetting')}
            </Text>
          </View>
        </TouchableOpacity>
        {userInfo && userInfo.noticeTalkAuth == 'Y' && (
          <>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('NoticeTalk');
              }}
            >
              <View style={styles.wrapButton}>
                <Svg
                  width="17px"
                  height="17px"
                  viewBox="0 0 23 23"
                  xmlns="http://www.w3.org/2000/svg"
                  {...props}
                >
                  <Path
                    fillRule="evenodd"
                    id="패스_179"
                    data-name="패스 179"
                    fill="#222"
                    d="M22 1.75a.75.75 0 00-1.161-.627c-.047.03-.094.057-.142.085a9.15 9.15 0 01-.49.262c-.441.22-1.11.519-2.002.82-1.78.6-4.45 1.21-7.955 1.21H6.5A5.5 5.5 0 005 14.293v.457c0 3.061.684 5.505 1.061 6.621.24.709.904 1.129 1.6 1.129h2.013c1.294 0 2.1-1.322 1.732-2.453-.412-1.268-.906-3.268-.906-5.547 0-.03-.002-.06-.005-.088 3.382.028 5.965.644 7.703 1.251.89.312 1.559.62 2 .849.084.043.171.096.261.15.357.214.757.455 1.142.25A.75.75 0 0022 16.25V1.75zM10.5 12.912c3.564.029 6.313.678 8.193 1.335.737.258 1.34.517 1.807.74V2.993c-.467.216-1.073.467-1.815.718-1.878.634-4.624 1.26-8.185 1.288v7.913zm-4 1.838v-.25H9c0 2.486.537 4.648.98 6.01a.398.398 0 01-.057.343c-.07.104-.162.147-.249.147H7.661c-.105 0-.161-.058-.179-.109-.344-1.018-.982-3.294-.982-6.141zM6.5 5H9v8H6.5a4 4 0 010-8z"
                  />
                </Svg>
                <Text
                  style={{ ...styles.wrapButtonTitle, fontSize: sizes.default }}
                >
                  {getDic('NoticeTalk', '알림톡')}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
        <>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('AlertSetting');
            }}
          >
            <View style={styles.wrapButton}>
              <Svg
                id="alarm-bell"
                width="15"
                height="15"
                viewBox="0 0 53.682 59.017"
              >
                <G id="그룹_102" data-name="그룹 102" transform="translate(0)">
                  <Path
                    id="패스_178"
                    data-name="패스 178"
                    d="M21.563,49.663A2.118,2.118,0,0,0,23.5,50.969H38.894a9.419,9.419,0,0,0,18.637,0H72.956a.978.978,0,0,0,.318-.035,2.148,2.148,0,0,0,1.694-1.341,2.073,2.073,0,0,0-.529-2.224l-.106-.106a9.9,9.9,0,0,1-1.871-3.177A31.528,31.528,0,0,1,70.485,32.12c0-11.789-4.447-18-8.154-21.143a18.727,18.727,0,0,0-6.565-3.6A8.341,8.341,0,0,0,54,2.365,7.074,7.074,0,0,0,48.283,0,7.159,7.159,0,0,0,42.6,2.365a8.232,8.232,0,0,0-1.8,5.118,18.919,18.919,0,0,0-6.565,3.53c-6.812,5.577-8.224,14.542-8.224,21.037A31.028,31.028,0,0,1,24,43.909a12.968,12.968,0,0,1-1.941,3.424h0A2.12,2.12,0,0,0,21.563,49.663Zm26.685,5.118a5.262,5.262,0,0,1-5.012-3.812H53.26A5.262,5.262,0,0,1,48.248,54.781Zm-18-22.731c0-18.99,12.425-20.79,12.919-20.861a2.159,2.159,0,0,0,1.447-.812,2.19,2.19,0,0,0,.424-1.624,5.225,5.225,0,0,1,.777-3.741,2.859,2.859,0,0,1,2.471-.882,3.025,3.025,0,0,1,2.506.882,5.163,5.163,0,0,1,.741,3.6,2.061,2.061,0,0,0,.388,1.624,2.124,2.124,0,0,0,1.447.847,13.786,13.786,0,0,1,6.318,3.106C64.1,17.9,66.32,23.931,66.32,32.12c0,7.2,1.377,11.825,2.753,14.648H27.423A34.861,34.861,0,0,0,30.246,32.05Z"
                    transform="translate(-21.409)"
                    fill="#222"
                  />
                </G>
              </Svg>
              <Text
                style={{ ...styles.wrapButtonTitle, fontSize: sizes.default }}
              >
                {getDic('Notification')}
              </Text>
            </View>
          </TouchableOpacity>
        </>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('VersionInfo');
          }}
        >
          <View style={styles.wrapButton}>
            <Svg width="15" height="15" viewBox="0 0 67.692 67.692">
              <G transform="translate(-151 -1127)">
                <G transform="translate(151 1127)">
                  <Path
                    d="M33.846,67.692A33.846,33.846,0,1,0,0,33.846,33.883,33.883,0,0,0,33.846,67.692Zm0-62.834A28.988,28.988,0,1,1,4.858,33.846,29.01,29.01,0,0,1,33.846,4.858Z"
                    fill="#222"
                  />
                  <Rect
                    width="6"
                    height="24"
                    rx="3"
                    transform="translate(31 28)"
                    fill="#222"
                  />
                </G>
                <Circle
                  cx="3"
                  cy="3"
                  r="3"
                  transform="translate(182 1146)"
                  fill="#222"
                />
              </G>
            </Svg>
            <Text
              style={{ ...styles.wrapButtonTitle, fontSize: sizes.default }}
            >
              {getDic('VersionInfo')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('EtcSetting');
          }}
        >
          <View style={styles.wrapButton}>
            <Svg width="15.876" height="16.236" viewBox="0 0 54 12.021">
              <G
                id="그룹_569"
                data-name="그룹 569"
                transform="translate(8502 -9848)"
              >
                <G
                  id="그룹_559"
                  data-name="그룹 559"
                  transform="translate(-8502 9848.021)"
                >
                  <Path
                    id="패스_1721"
                    data-name="패스 1721"
                    d="M6,0A6,6,0,1,1,0,6,6,6,0,0,1,6,0Z"
                    fill="#444"
                  />
                  <Circle
                    id="타원_521"
                    data-name="타원 521"
                    cx="6"
                    cy="6"
                    r="6"
                    transform="translate(21 -0.021)"
                    fill="#444"
                  />
                  <Circle
                    id="타원_522"
                    data-name="타원 522"
                    cx="6"
                    cy="6"
                    r="6"
                    transform="translate(42 -0.021)"
                    fill="#444"
                  />
                </G>
              </G>
            </Svg>
            <Text
              style={{ ...styles.wrapButtonTitle, fontSize: sizes.default }}
            >
              {getDic('Etc')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <View style={styles.wrapButton}>
            <Svg width="15" height="15" viewBox="0 0 48.788 53.306">
              <G
                id="그룹_571"
                data-name="그룹 571"
                transform="translate(-69.31 -633.595)"
              >
                <Path
                  id="패스_2898"
                  data-name="패스 2898"
                  d="M808.881,731.353v4.206a20.542,20.542,0,1,1-17.975,0v-4.206a24.394,24.394,0,1,0,17.975,0Z"
                  transform="translate(-706.19 -91.503)"
                  fill="#222"
                />
                <Path
                  id="패스_2899"
                  data-name="패스 2899"
                  d="M794.5,728"
                  transform="translate(-700.796 -94.405)"
                  fill="#222"
                />
                <Path
                  id="패스_2900"
                  data-name="패스 2900"
                  d="M793.5,730.907v20.863c0,1.329.6,2.407,1.926,2.407s1.926-1.078,1.926-2.407V730.907c0-1.329-.6-2.407-1.926-2.407S793.5,729.578,793.5,730.907Z"
                  transform="translate(-701.08 -92.313)"
                  fill="#222"
                />
              </G>
            </Svg>
            <Text
              style={{ ...styles.wrapButtonTitle, fontSize: sizes.default }}
            >
              {getDic('Logout')}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  header: {
    margin: 12,
  },
  wrapButton: {
    width: '100%',
    height: 70,
    paddingLeft: 15,
    borderBottomWidth: 0.5,
    borderColor: '#EEE',
    alignItems: 'center',
    flexDirection: 'row',
  },
  wrapButtonTitle: { marginLeft: 10 },
});

export default UserSetting;
