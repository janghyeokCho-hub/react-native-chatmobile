import React, { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import RoomMemberBox from '@C/chat/RoomMemberBox';
import {
  format,
  isValid,
  startOfToday,
  differenceInMilliseconds,
} from 'date-fns';
import ProfileBox from '@COMMON/ProfileBox';
//import RightConxtMenu from '../common/popup/RightConxtMenu';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getDic } from '@/config';
import { getSysMsgFormatStr } from '@/lib/common';
import * as common from '@/lib/common';
import { useTheme } from '@react-navigation/native';

const isJSONStr = str => {
  try {
    return typeof JSON.parse(str) == 'object';
  } catch (e) {
    return false;
  }
};

const getFilterMember = (members, id, roomType) => {
  if (members && roomType !== 'O') {
    const filterMember = members.filter(item => {
      if (item.id === id) return false;

      return true;
    });

    return filterMember;
  } else if (members && roomType === 'O') {
    const filterMember = members;

    return filterMember;
  }

  return [];
};

const makeMessageText = lastMessage => {
  let returnText = getDic('Msg_NoMessages');
  try {
    let msgObj = null;

    if (typeof lastMessage == 'string') {
      msgObj = JSON.parse(lastMessage);
    } else if (typeof lastMessage == 'object') {
      msgObj = lastMessage;
    }

    if (!msgObj) return returnText;

    if (msgObj.Message != '') {
      let drawText = msgObj.Message;
      if (isJSONStr(msgObj.Message)) {
        const drawData = JSON.parse(msgObj.Message);
        drawText = drawData.context;
        if(isJSONStr(drawText)){
          drawText = getSysMsgFormatStr(getDic(JSON.parse(drawText).templateKey),JSON.parse(drawText).datas)
        }

      }
      // protocol check
      if (common.eumTalkRegularExp.test(drawText)) {
        const messageObj = common.convertEumTalkProtocolPreview(drawText);
        if (messageObj.type == 'emoticon') returnText = getDic('Emoticon');
        else returnText = messageObj.message.split('\n')[0];
      } else {
        // 첫줄만 노출
        returnText = drawText.split('\n')[0];
      }
    } else if (msgObj.File) {
      let fileObj = null;

      if (typeof msgObj.File == 'string') {
        fileObj = JSON.parse(msgObj.File);
      } else if (typeof msgObj.File == 'object') {
        fileObj = msgObj.File;
      }

      if (!fileObj) return returnText;

      // files 일경우
      if (fileObj.length !== undefined && fileObj.length > 1) {
        const firstObj = fileObj[0];
        if (
          firstObj.ext == 'png' ||
          firstObj.ext == 'jpg' ||
          firstObj.ext == 'jpeg' ||
          firstObj.ext == 'bmp'
        ) {
          returnText = getSysMsgFormatStr(
            getDic('Tmp_imgExCnt'),
            [
              { type: 'Plain', data: `${fileObj.length - 1}`}
            ]
          );
        } else {
          returnText = getSysMsgFormatStr(
            getDic('Tmp_fileExCnt'),
            [
              { type: 'Plain', data: `${fileObj.length - 1}`}
            ]
          );
        }
      } else {
        if (
          fileObj.ext == 'png' ||
          fileObj.ext == 'jpg' ||
          fileObj.ext == 'jpeg' ||
          fileObj.ext == 'bmp'
        ) {
          returnText = getDic('Image');
        } else {
          returnText = getDic('File');
        }
      }
    }
  } catch (e) {
    // Error
  }

  return returnText;
};

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

const Room = ({ room, onRoomChange, isSelect, showModalMenu }) => {
  const { colors, sizes } = useTheme();
  const id = useSelector(({ login }) => login.id);
  const filterMember = useMemo(
    () => getFilterMember(room.members, id, room.roomType),
    [room.members, id],
  );

  const makeRoomName = useCallback(
    filterMember => {
      if (room.roomType === 'M' || room.roomType === 'O') {
        // M의 경우 남은 값이 1개
        const target = filterMember[0];

        return (
          <Text
            style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}
            numberOfLines={1}
          >
            {common.getJobInfo(target)}
          </Text>
        );
      } else {
        if (room.roomName !== '') {
          return (
            <View style={{ marginLeft: 5 }}>
              <Text style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}>
                {room.roomName} {room.members && `(${room.members.length})`}
              </Text>
            </View>
          );
        }

        if (filterMember.length == 0)
          return (
            <Text
              style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}
              numberOfLines={1}
            >
              {getDic('NoChatMembers')}
            </Text>
          );

        return (
          <>
            <View style={{ maxWidth: '80%' }}>
              <Text
                numberOfLines={1}
                style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}
              >
                {filterMember.map((item, index) => {
                  if (index == filterMember.length - 1)
                    return common.getJobInfo(item);
                  else return common.getJobInfo(item) + ',';
                })}
              </Text>
            </View>
            {room.roomType != 'A' && room.members && (
              <View style={{ marginLeft: 5 }}>
                <Text style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}>
                  ({room.members.length})
                </Text>
              </View>
            )}
          </>
        );
      }
    },
    [room],
  );

  const handleClick = useCallback(() => {
    onRoomChange(room);
  }, [onRoomChange, room]);

  return (
    <TouchableOpacity
      onPress={handleClick}
      onLongPress={() => showModalMenu(room)}
    >
      <View style={styles.container}>
        <View style={styles.profile}>
          {((room.roomType === 'M' || filterMember.length == 1) &&
            ((room.roomType === 'A' && (
              <ProfileBox
                userId={filterMember[0].id}
                userName={filterMember[0].name}
                presence={null}
                isInherit={false}
                img={filterMember[0].photoPath}
                handleClick={false}
              />
            )) || (
              <ProfileBox
                userId={filterMember[0].id}
                userName={filterMember[0].name}
                presence={filterMember[0].presence}
                isInherit={true}
                img={filterMember[0].photoPath}
              />
            ))) || (
            <RoomMemberBox
              type="G"
              data={filterMember}
              roomID={room.roomID}
              key={`rmb_${room.roomID}`}
            />
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.title}>{makeRoomName(filterMember)}</View>
          <Text
            numberOfLines={2}
            style={{ ...styles.lastMessage, fontSize: 13 + sizes.inc }}
          >
            {room.lastMessage && makeMessageText(room.lastMessage)}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.dateText}>
            {makeDateTime(room.lastMessageDate)}
          </Text>
          {room.unreadCnt > 0 ? (
            <View style={styles.count}>
              <Text style={styles.countTxt}>
                {room.unreadCnt > 999 ? '999+' : room.unreadCnt}
              </Text>
            </View>
          ) : (
            <Text />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
    flexDirection: 'row',
  },
  profile: {
    width: 50,
  },
  profileImage: {
    width: 50,
    height: 50,
  },
  title: {
    flexDirection: 'row',
  },
  titleTxt: {
    fontWeight: '500',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 15,
    justifyContent: 'center',
  },
  info: {
    width: 70,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  count: {
    paddingLeft: 5,
    paddingRight: 5,
    minWidth: 25,
    height: 20,
    color: 'white',
    backgroundColor: '#F86A60',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  countTxt: {
    fontSize: 12,
    color: 'white',
  },
  lastMessage: {
    color: '#888',
    marginTop: 3,
  },
  dateText: {
    color: '#AAA',
    fontSize: 12,
  },
});

export default React.memo(Room);
