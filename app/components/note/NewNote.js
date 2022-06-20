import React, {
  useMemo,
  useState,
  useCallback,
  createRef,
  useLayoutEffect,
} from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Image,
  Alert,
  FlatList,
  Keyboard,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { actions, RichEditor } from 'react-native-pell-rich-editor';
import { useNavigation, useTheme } from '@react-navigation/native';
import {
  MenuTrigger,
  MenuOption,
  MenuOptions,
  Menu,
} from 'react-native-popup-menu';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

import NoteHeader from '@C/note/NoteHeader';
import { getTopPadding } from '@/lib/device/common';
import { getConfig, getDic } from '@/config';
import { sendNote } from '@/lib/note/fetch';
import {
  NOTE_RECEIVER_SEPARATOR,
  parseSender,
  convertTimeFormat,
  translateName,
  emergencyMark,
  nonEmergencyMark,
} from '@/lib/note/state';
import { getInstance, convertFileSize } from '@/lib/fileUtil';
import {
  getJobInfo,
  getDictionary,
  getBackgroundColor,
  getSysMsgFormatStr,
} from '@/lib/common';

import DirectionIcon from '@/components/common/icons/DirectionIcon';
import AddChannelIcon from '@/components/common/icons/AddChannelIcon';
import NoteFile from '@/components/note/NoteFile';
import { blockUsers } from '@/lib/api/orgchart';

const styles = StyleSheet.create({
  contanier: {
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  statusBar: {
    height: getTopPadding(),
    width: '100%',
    backgroundColor: '#F6F6F6',
  },
  button: {
    color: '#444',
    width: 22,
    height: 22,
  },
  rowContainer: {
    flexDirection: 'row',
    paddingHorizontal: '4%',
    alignItems: 'center',
    borderBottomColor: '#cecece',
    borderBottomWidth: 1,
    paddingVertical: '2%',
  },
  colContainer: {
    flexDirection: 'column',
    marginTop: '2%',
    paddingHorizontal: '4%',
    // 뷰 최하단의 첨부파일 잘림방지
    paddingBottom: '20%',
  },
  profileBoxContainer: {
    borderColor: '#cecece',
    borderWidth: 1,
    padding: 4,
    alignSelf: 'center',
    borderRadius: 50,
    marginHorizontal: 4,
    marginTop: 4,
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
  popupOption: {
    margin: 8,
  },
});

function _smallProfileBox({ name, photoPath }) {
  const [imgVisible, setImgVisible] = useState(true);
  const nameColor = useMemo(() => getBackgroundColor(name), [name]);
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

function RecipientItem({ user, onDelete }) {
  const userName = useMemo(() => getJobInfo(user), [user]);
  const navigation = useNavigation();
  const { sizes } = useTheme();

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
        {/* { profileBox } */}
        <Text
          numberOfLines={1}
          style={{ fontSize: sizes?.default, paddingRight: '1%' }}
        >
          {userName}
        </Text>
      </MenuTrigger>
      <MenuOptions>
        {menuOptions.map((opt, idx) => (
          <MenuOption key={idx} {...opt} style={styles.popupOption} />
        ))}
      </MenuOptions>
    </Menu>
  );
}

function RecipientList({ ...rest }) {
  const navigation = useNavigation();
  const { data: targetList, mutate: setTargetList } = useSWR(
    '/note/send/target',
    null,
  );
  const [collapsed, setCollapsed] = useState(true);
  const collapseThreshold = 4;

  useLayoutEffect(() => {
    const fileCtrl = getInstance();
    fileCtrl.clear();
  }, []);

  const handleAddTarget = useCallback(
    (prev, added) => {
      navigation.navigate('AddNoteTarget', {
        headerName: getDic('Note_AddNoteTarget'),
      });
    },
    [navigation],
  );

  const onDelete = useCallback(
    item => {
      setTargetList(prev => prev.filter(p => p.id !== item.id));
    },
    [targetList],
  );

  const renderItem = useCallback(
    ({ item }) => <RecipientItem user={item} onDelete={onDelete} />,
    [targetList],
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
    <View {...rest}>
      <Text style={{ flex: 1 }}>{getDic('Note_Recipient')}</Text>
      <View style={{ flex: 4, flexDirection: 'row' }}>
        {/* {
                    targetList?.map((item, idx) => {
                        return (
                            <RecipientItem user={item} key={idx} onDelete={onDelete} />
                        );
                    })
                } */}
        <FlatList
          data={_targetList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
          // initialNumToRender={2}
          // maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={150}
          removeClippedSubviews={true}
          ListFooterComponent={collapseCount && collapsedFooter}
          numColumns={2}
          // contentContainerStyle={{ alignItems: "center", flexDirection: "row", flexWrap: 'wrap' }}
          columnWrapperStyle={{
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}
        />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          style={{ marginHorizontal: 8 }}
          onPress={handleAddTarget}
        >
          <AddChannelIcon
            width={20}
            height={20}
            style={{ borderRadius: 10, borderWidth: 1, borderColor: '#ababab' }}
            color="#666"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginHorizontal: 2, padding: 6 }}
          onPress={() => setCollapsed(prev => !prev)}
        >
          <DirectionIcon
            width={12}
            height={12}
            direction={collapsed ? 'down' : 'up'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const _AttachFileList = ({ style, files, handleRemove }) => {
  if (!files?.length) {
    return <View />;
  }
  return (
    <View style={style}>
      <Text>{files?.length ? getDic('AttachFile') : ''}</Text>
      {files?.map((file, idx) => (
        <NoteFile
          key={idx}
          item={{
            ...file,
          }}
          disableClick={true}
          handleRemove={() => handleRemove?.(file?.tempId)}
        />
      ))}
    </View>
  );
};

const AttachFileList = React.memo(_AttachFileList);

/* 에디터 Toolbar 사용기능 목록 */
const _actions = [
  actions.undo,
  actions.redo,
  actions.setStrikethrough,
  actions.insertOrderedList,
  actions.blockquote,
  actions.alignLeft,
  actions.alignCenter,
  actions.alignRight,
  actions.line,
];

function NewNote({ navigation, route }) {
  const myInfo = useSelector(({ login }) => login.userInfo);
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const { MOBILE } = getConfig('FileAttachMode', {});
  const { emergency: useEmergencyNote } = getConfig('UseNote', {});
  const [tempFile, setTempFile] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const editorRef = createRef();

  const { type, noteInfo } = route?.params;
  const [isEmergency, setIsEmergency] = useState(false);
  const note = useMemo(() => {
    if (type === 'Send' || !noteInfo) {
      return {
        title: '',
        targets: [],
        context: '',
      };
    }
    const { sender, receivers } = parseSender(noteInfo, {
      useOrgChartFormat: true,
    });

    /* 제목 자동입력 */
    let titlePrefix = null;
    switch (type) {
      case 'Reply':
      case 'ReplyAll':
        titlePrefix = `RE: ${noteInfo?.subject}`;
        break;
      case 'Forward':
        titlePrefix = `FW: ${noteInfo?.subject}`;
    }

    /* */

    let targets = [];
    /* 받는사람 자동입력 */
    if (type === 'Reply') {
      targets.push(sender);
    } else if (type === 'ReplyAll') {
      const filteredReceivers = receivers.filter(r => r.id !== sender.id);
      // 받는대상 목록에 sender가 중복 포함되어 있다면 제외 후 push
      targets.push(sender, ...filteredReceivers);
    }

    /* 답장 자동입력 */
    const sendDate = convertTimeFormat(noteInfo.sendDate);
    const targetName = getDictionary(noteInfo.senderDisplayName);
    const originalReceivers = translateName(receivers);
    const replyFormat = [
      '<br/>',
      '<hr/>',
      `Sent: ${sendDate}`,
      `From: ${targetName}`,
      `To: ${originalReceivers}`,
      `Subject: ${noteInfo.subject}`,
      '<br/>',
      noteInfo.context,
    ]
      .map(txt => `<p>${txt}</p>`)
      .join('');

    return {
      title: titlePrefix,
      targets,
      context: replyFormat,
    };
  }, [route, noteInfo]);

  const { data: targetList, mutate: setTargetList } = useSWR(
    '/note/send/target',
    null,
    { initialData: note.targets },
  );
  const [subject, setSubject] = useState(note.title);

  function cleanup() {
    setTempFile([]);
    setTargetList([]);
    setSubject(null);
    editorRef.current = null;
    Keyboard.dismiss();
  }

  useLayoutEffect(() => {
    setTargetList(note.targets || []);
    return cleanup;
  }, []);

  const requestReadPermissionAndroid = useCallback(async () => {
    const { PERMISSIONS, check, request } = PermissionsAndroid;
    // 파일 읽기 권한 검사
    let hasReadPermission = await check(PERMISSIONS.READ_EXTERNAL_STORAGE);
    if (hasReadPermission === false) {
      // 읽기 권한이 없다면 요청
      hasReadPermission = await request(PERMISSIONS.READ_EXTERNAL_STORAGE);
    }
    return hasReadPermission === 'granted';
  }, [PermissionsAndroid]);

  const handleRemove = useCallback(
    tempId => {
      const fileCtrl = getInstance();
      fileCtrl.delFile(tempId);
      setTempFile(prev => prev.filter(file => file.tempId !== tempId));
    },
    [tempFile],
  );

  const handleAttach = async () => {
    if (Platform.OS === 'android') {
      const hasReadPermission = await requestReadPermissionAndroid();
      // 읽기 권한을 받지 못하면 파일선택 생략
      if (hasReadPermission !== false) {
        // Alert need permission
        return;
      }
    }
    const results = await DocumentPicker.pickMultiple({
      type: [DocumentPicker.types.allFiles],
    });
    const fileCtrl = getInstance();
    const appendResult = fileCtrl.appendFiles(results);
    if (appendResult.message === 'LIMIT_FILE_EXTENSION') {
      Alert.alert(null, getDic('Msg_LimitFileExt'));
      return;
    } else if (appendResult.message === 'LIMIT_FILE_SIZE') {
      const fileSizeLimit = getConfig('File.limitUnitFileSize');
      Alert.alert(
        null,
        getSysMsgFormatStr(getDic('Msg_LimitFileSize'), [
          {
            type: 'Plain',
            data: convertFileSize(fileSizeLimit),
          },
        ]),
        [
          {
            text: getDic('Ok'),
          },
        ],
        { cancelable: true },
      );
      return;
    } else {
    }
    setTempFile(fileCtrl.getFileInfos());
  };

  async function handleSend() {
    if (isSending === true) {
      return;
    }
    setIsSending(true);
    const receiveUser = [];
    const receiveGroup = [];
    targetList.forEach(target => {
      if (target?.type === 'U') {
        // 유저: '{id}|{kobKey}'
        receiveUser.push(
          `${target.id}${NOTE_RECEIVER_SEPARATOR}${target.jobKey}`,
        );
      } else if (target?.type === 'G') {
        // 그룹: '{id}|{companyCode}'
        receiveGroup.push(
          `${target.id}${NOTE_RECEIVER_SEPARATOR}${target.companyCode}`,
        );
      }
    });
    targetList?.filter(target => target?.type === 'G');
    const context = await editorRef?.current.getContentHtml();

    if (!targetList?.length) {
      // 대상 선택 경고
      setIsSending(false);
      Alert.alert(getDic('Note'), getDic('Msg_Note_EnterRecipient'));
      return;
    }

    if (!subject?.length) {
      // 제목 입력 경고
      setIsSending(false);
      Alert.alert(getDic('Note'), getDic('Msg_Note_EnterTitle'));
      return;
    } else if (subject?.length > 1900) {
      // 제목 길이초과 경고
      setIsSending(false);
      Alert.alert(getDic('Note'), getDic('Msg_Note_TitleExceeded'));
      return;
    }

    if (!context?.length) {
      // 내용 입력 경고
      setIsSending(false);
      Alert.alert(getDic('Note'), getDic('Msg_Note_EnterContext'));
      return;
    }

    const fileCtrl = getInstance();

    let blockList = [];
    if (chineseWall?.length) {
      blockList = await blockUsers(chineseWall);
    }

    const sendData = {
      sender: myInfo.id,
      receiveUser,
      receiveGroup,
      subject,
      context,
      isEmergency: isEmergency ? 'Y' : 'N',
      files: fileCtrl.getFiles() || [],
      fileInfos: fileCtrl.getFileInfos() || [],
      blockList,
    };
    try {
      const { data } = await sendNote(sendData);

      if (typeof data?.result !== 'undefined') {
        Alert.alert(getDic('Note'), getDic('Msg_Note_SendSuccess'), [
          {
            text: 'OK',
            onPress: () => {
              cleanup();
              navigation.canGoBack() && navigation.goBack();
            },
          },
        ]);
      } else {
        console.log('FAIL  ', data);
      }
    } catch (err) {
      console.log('Send Note Error:   ', err);
    } finally {
      setIsSending(false);
    }
  }

  const customMenus = [
    MOBILE?.upload !== false && {
      icon: 'File',
      iconStyle: styles.button,
      onPress: handleAttach,
    },
    {
      icon: 'Send',
      iconStyle: styles.button,
      onPress: handleSend,
    },
  ];

  return (
    <SafeAreaView style={{ flexDirection: 'column' }}>
      <NoteHeader
        title={getDic(`Msg_Note_${route?.params?.type}`, 'Msg_Note_Send')}
        menus={customMenus}
      />
      <ScrollView style={styles.contanier} nestedScrollEnabled>
        <RecipientList style={styles.rowContainer} />
        <View
          style={[
            styles.rowContainer,
            { paddingVertical: '2%', alignItems: 'center' },
          ]}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            {useEmergencyNote === 'Y' && (
              <TouchableOpacity
                style={{ paddingHorizontal: 2, paddingVertical: 6 }}
                onPress={() => setIsEmergency(prev => !prev)}
              >
                <Text>{isEmergency ? emergencyMark : nonEmergencyMark}</Text>
              </TouchableOpacity>
            )}
            <Text style={{ fontSize: 14 }}>{getDic('Title')}</Text>
          </View>
          <View style={{ flex: 5, justifyContent: 'center' }}>
            <TextInput
              style={{
                paddingVertical: Platform.OS === 'ios' ? '3%' : 0,
                fontSize: 14,
              }}
              placeholder={getDic('Title')}
              value={subject}
              onChangeText={text => setSubject(text)}
            />
          </View>
        </View>
        {/* Context */}
        <View>
          <RichEditor
            ref={editorRef}
            placeholder={'Content'}
            pasteAsPlainText={true}
            initialContentHTML={note.context}
            useContainer={false}
            containerStyle={{ width: '100%', height: 600 }}
          />
        </View>
        <AttachFileList
          style={styles.colContainer}
          files={tempFile}
          handleRemove={handleRemove}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default React.memo(NewNote);
