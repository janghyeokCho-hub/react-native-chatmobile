import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
import {
  makeMessageText,
  getJobInfo,
  getFilterMember,
  isJSONStr,
} from '@/lib/common';
import { useTheme } from '@react-navigation/native';
import { isBlockCheck } from '@/lib/api/orgchart';

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

const Room = ({
  room,
  onRoomChange,
  showModalMenu,
  getRoomSettings,
  isEmptyObj,
}) => {
  const { sizes } = useTheme();
  const id = useSelector(({ login }) => login.id);
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const filterMember = useMemo(
    () => getFilterMember(room.members, id, room.roomType),
    [room.members, id, room.roomType],
  );
  const [pinnedTop, setPinnedTop] = useState(false);
  const setting = useMemo(() => getRoomSettings(room), [room]);
  const [lastMessageText, setLastMessageText] = useState('');

  useEffect(() => {
    if (room?.lastMessage && chineseWall?.length) {
      const lastMessageInfo = isJSONStr(room.lastMessage)
        ? JSON.parse(room.lastMessage)
        : room.lastMessage;
      const targetInfo = {
        id: lastMessageInfo.sender,
        companyCode: lastMessageInfo.companyCode,
        deptCode: lastMessageInfo.deptCode,
      };
      const { blockChat, blockFile } = isBlockCheck({
        targetInfo,
        chineseWall,
      });
      const isFile = !!lastMessageInfo?.File;
      const result = isFile ? blockFile : blockChat;

      if (result) {
        setLastMessageText(getDic('BlockChat', '차단된 메시지 입니다.'));
      } else {
        setLastMessageText(makeMessageText(room.lastMessage));
      }
    } else {
      setLastMessageText(makeMessageText(room.lastMessage));
    }
  }, [room.lastMessage, chineseWall]);

  useEffect(() => {
    if (setting && !isEmptyObj(setting) && !!setting.pinTop) {
      setPinnedTop(true);
    } else {
      setPinnedTop(false);
    }
  }, [setting]);

  const makeRoomName = useCallback(
    member => {
      if (room.roomType === 'M' || room.roomType === 'O') {
        // M의 경우 남은 값이 1개
        const target = member[0];

        return (
          <Text
            style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}
            numberOfLines={1}
          >
            {getJobInfo(target)}
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

        if (!member.length) {
          return (
            <Text
              style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}
              numberOfLines={1}
            >
              {getDic('NoChatMembers')}
            </Text>
          );
        }

        return (
          <>
            <View style={{ maxWidth: '80%' }}>
              <Text
                numberOfLines={1}
                style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}
              >
                {member.map((item, index) => {
                  if (index === member.length - 1) {
                    return getJobInfo(item);
                  } else {
                    return getJobInfo(item) + ',';
                  }
                })}
              </Text>
            </View>
            {room.roomType !== 'A' && room.members && (
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
    [room, sizes.inc],
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
          <View style={styles.title}>
            {makeRoomName(filterMember)}
            <Text>{pinnedTop && '📌'}</Text>
          </View>
          <Text
            numberOfLines={2}
            style={{ ...styles.lastMessage, fontSize: 13 + sizes.inc }}
          >
            {lastMessageText}
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
