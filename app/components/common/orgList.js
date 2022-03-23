import React, { useMemo, useState, useCallback, useLayoutEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import {
  MenuTrigger,
  MenuOption,
  MenuOptions,
  Menu,
} from 'react-native-popup-menu';

import { useNavigation, useTheme } from '@react-navigation/native';
import { getInstance } from '@/lib/fileUtil';
import { getDic } from '@/config';
import AddChannelIcon from '@/components/common/icons/AddChannelIcon';
import DirectionIcon from '@/components/common/icons/DirectionIcon';
import { getJobInfo, getBackgroundColor } from '@/lib/common';

import useSWR from 'swr';
import { absoluteFillObject } from 'react-native-extended-stylesheet';

function _smallProfileBox({ name, photoPath }) {
  const [imgVisible, setImgVisible] = useState(true);
  const nameColor = useMemo(() => getBackgroundColor(name));
  const { sizes } = useTheme();

  if (imgVisible) {
    return (
      <Image
        style={[styles.profileBox, styles.profileImage]}
        source={{ uri: photoPath || '.' }}
        onError={e => setImgVisible(false)}
      />
    );
  } else {
    return (
      <View
        style={[
          styles.profileBox,
          styles.profileTextContainer,
          { backgroundColor: nameColor },
        ]}
      >
        <Text style={[styles.profileText, { fontSize: sizes?.default }]}>
          {name?.[0] || ''}
        </Text>
      </View>
    );
  }
}

const SmallProfileBox = React.memo(_smallProfileBox);

function RecipientItem({ user, onDelete, allCheck }) {
  const userName = useMemo(() => getJobInfo(user));
  const navigation = useNavigation();
  const { sizes } = useTheme();
  useLayoutEffect(() => {
    console.log('dd', allCheck);
  }, [allCheck]);

  const optionSelected = useCallback(
    value => {
      switch (value) {
        case 'Detail':
          user?.id &&
            navigation.navigate('ProfilePopup', {
              targetID: user.id,
            });
          break;
        case 'Delete':
          onDelete?.(user);
      }
    },
    [user],
  );

  const profileBox = (
    <SmallProfileBox name={userName} photoPath={user?.photoPath} />
  );

  const menuOptions = [
    {
      value: 'Detail',
      children: (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {profileBox}
          <View style={{ flexDirection: 'column' }}>
            <Text>{userName}</Text>
          </View>
        </View>
      ),
    },
    {
      value: 'Delete',
      text: getDic('Delete'),
    },
  ];

  return (
    <Menu onSelect={optionSelected}>
      <MenuTrigger style={styles.profileBoxContainer}>
        <Text
          numberOfLines={1}
          style={{ fontSize: sizes?.default, paddingRight: '1%' }}
        >
          {userName}
        </Text>
      </MenuTrigger>

      <MenuOptions>
        {!allCheck && (
          <>
            {menuOptions.map((opt, idx) => (
              <MenuOption key={idx} {...opt} style={styles.popupOption} />
            ))}
          </>
        )}
      </MenuOptions>
    </Menu>
  );
}

const OrgList = ({ route, setRecipient, allCheck }) => {
  const navigation = useNavigation();

  const { data: targetList, mutate: setTargetList } = useSWR(
    '/note/send/target',
    null,
  );

  const [collapsed, setCollapsed] = useState(true);
  const collapseThreshold = 4;

  const handleAddTarget = useCallback(
    (prev, added) => {
      navigation.navigate('AddNoteTarget', {
        headerName: getDic('Note_AddNoteTarget'),
      });
    },
    [navigation],
  );

  const disableAddTarget = () => {
    Alert.alert(getDic('NoticeTalk', '알림톡'), getDic('Msg_DisableButton', '전체공지를 해제해주세요'));
  };

  const onDelete = useCallback(
    item => {
      setTargetList(prev => prev.filter(p => p.id !== item.id));
    },
    [targetList],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <RecipientItem user={item} onDelete={onDelete} allCheck={allCheck} />
    ),
    [targetList, allCheck],
  );
  const keyExtractor = useCallback(
    item => `${item?.id}_${item?.jobKey}_${item?.type}`,
    [targetList],
  );
  const _targetList = useMemo(() => {
    if (collapsed === true) {
      return targetList?.slice(0, collapseThreshold);
    }
    return targetList;
  }, [targetList, collapsed]);

  const collapseCount = useMemo(() => {
    if (collapsed === false) {
      return 0;
    }
    return Math.max(targetList?.length - collapseThreshold, 0);
  }, [targetList, collapsed]);

  useLayoutEffect(() => {
    const fileCtrl = getInstance();
    fileCtrl.clear();
  }, []);

  useLayoutEffect(() => {
    setTargetList([]);
  }, []);

  useLayoutEffect(() => {
    setRecipient(targetList);
  }, [targetList]);

  const collapsedFooter = (
    <TouchableOpacity
      style={[styles.profileBoxContainer, { alignSelf: 'baseline' }]}
      onPress={() => setCollapsed(prev => !prev)}
    >
      <Text style={{ color: '#3f51b5' }}>
        {'+'}
        {collapseCount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={allCheck ? styles.orgList_disable : styles.orgList}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.Recipient}>{getDic('Note_Recipient')}</Text>
      </View>
      <View style={{ flex: 4 }}>
        <FlatList
          data={_targetList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          extraData={allCheck}
          scrollEnabled={false}
          updateCellsBatchingPeriod={150}
          removeClippedSubviews={true}
          ListFooterComponent={collapseCount && collapsedFooter}
          numColumns={2}
          columnWrapperStyle={{
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}
        />
      </View>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={allCheck ? disableAddTarget : handleAddTarget}
        >
          <AddChannelIcon
            width={20}
            height={20}
            style={{ borderRadius: 10, borderWidth: 1, borderColor: '#ababab' }}
            color="#666"
          />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.directionIcon}  onPress={() => setCollapsed(prev => !prev)}>
          <DirectionIcon
            width={12}
            height={12}
            direction={collapsed ? 'down' : 'up'}
          />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default OrgList;

const styles = StyleSheet.create({
  profileBoxContainer: {
    borderColor: '#cecece',
    borderWidth: 1,
    padding: 4,
    alignSelf: 'center',
    borderRadius: 50,
    alignItems: 'center',
    flexDirection: 'row',
  },
  profileBox: {
    marginLeft: '2%',
    marginRight: '4%',
  },
  profileImage: {
    width: 24,
    height: 24,
  },
  profileTextContainer: {
    borderRadius: 50,
  },
  profileText: {
    paddingHorizontal: '2%',
    paddingVertical: '1%',
  },
  orgList: {
    flex: 1,
    flexDirection: 'row',
    padding: '2%',
    justifyContent: 'center',
    borderBottomColor: '#cecece',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  orgList_disable: {
    backgroundColor: 'rgba(200, 200, 200, 0.6);',
    flex: 1,
    flexDirection: 'row',
    padding: '2%',
    borderBottomColor: '#cecece',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  directionIcon:{
    marginLeft:10,
    justifyContent:'center',
  }
});
