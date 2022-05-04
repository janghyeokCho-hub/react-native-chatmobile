import React, { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ShareRoomMemberBox from '@COMMON/share/ChatRoom/ShareRoomMemberBox';
import ShareProfileBox from '@COMMON/share/common/ShareProfileBox';
import { getJobInfo, getFilterMember } from '@/lib/common';
import { getDic } from '@/config';
import * as api from '@COMMON/share/lib/api';
import ToggleButton from '@COMMON/buttons/ToggleButton';

const ShareRoom = ({ room, checked, onCheck }) => {
  const id = api.getServerUtil().id;
  const filterMember = useMemo(
    () => getFilterMember(room.members, id, room.roomType),
    [room.members, room.roomType, id],
  );

  const makeRoomName = useCallback(
    filterMember => {
      if (room.roomType === 'M' || room.roomType === 'O') {
        // M의 경우 남은 값이 1개
        const target = filterMember[0];

        return (
          <Text style={{ ...styles.titleTxt, fontSize: 15 }} numberOfLines={1}>
            {getJobInfo(target)}
          </Text>
        );
      } else {
        if (room.roomName !== '') {
          return (
            <View style={{ marginLeft: 5 }}>
              <Text style={{ ...styles.titleTxt, fontSize: 15 }}>
                {room.roomName} {room.members && `(${room.members.length})`}
              </Text>
            </View>
          );
        }

        if (filterMember.length === 0) {
          return (
            <Text
              style={{ ...styles.titleTxt, fontSize: 15 }}
              numberOfLines={1}
            >
              {getDic('NoChatMembers', '대화상대없음')}
            </Text>
          );
        }

        return (
          <>
            <View style={{ maxWidth: '80%' }}>
              <Text
                numberOfLines={1}
                style={{ ...styles.titleTxt, fontSize: 15 }}
              >
                {filterMember.map((item, index) => {
                  if (index === filterMember.length - 1) {
                    return getJobInfo(item);
                  } else {
                    return getJobInfo(item) + ',';
                  }
                })}
              </Text>
            </View>
            {room.roomType !== 'A' && room.members && (
              <View style={{ marginLeft: 5 }}>
                <Text style={{ ...styles.titleTxt, fontSize: 15 }}>
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

  const makeRoomNamePlain = useCallback(
    filterMember => {
      if (room.roomType === 'M' || room.roomType === 'O') {
        // M의 경우 남은 값이 1개
        const target = filterMember[0];

        return getJobInfo(target);
      } else {
        if (room.roomName !== '') {
          return room.roomName;
        }

        if (filterMember.length === 0) {
          return getDic('NoChatMembers', '대화상대없음');
        }

        const memberNames = filterMember.map(item => getJobInfo(item));
        return memberNames.join(',');
      }
    },
    [room],
  );

  return (
    <TouchableOpacity
      onPress={() => {
        const sendObj = {
          ...room,
          type: 'R',
          id: room.roomID,
          name: makeRoomNamePlain(filterMember),
          filterMember: filterMember,
        };
        onCheck(!checked, sendObj);
      }}
    >
      <View style={styles.container}>
        <View style={styles.profile}>
          {((room.roomType === 'M' || filterMember.length === 1) && (
            <ShareProfileBox
              type="U"
              userName={filterMember[0].name}
              img={filterMember[0].photoPath}
            />
          )) || (
            <ShareRoomMemberBox
              type="G"
              data={filterMember}
              roomID={room.roomID}
              key={`rmb_${room.roomID}`}
            />
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.title}>{makeRoomName(filterMember)}</View>
        </View>
        <View style={styles.info}>
          {room.roomType !== 'A' && (
            <ToggleButton
              data={room}
              checked={checked}
              onPress={() => {
                const sendObj = {
                  ...room,
                  type: 'R',
                  id: room.roomID,
                  name: makeRoomNamePlain(filterMember),
                  filterMember: filterMember,
                };
                onCheck(!checked, sendObj);
              }}
            />
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

export default React.memo(ShareRoom);
