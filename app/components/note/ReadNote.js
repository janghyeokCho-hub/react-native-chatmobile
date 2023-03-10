import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import {
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  View,
  TouchableOpacity,
  SafeAreaView,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  MenuTrigger,
  MenuOption,
  MenuOptions,
  Menu,
} from 'react-native-popup-menu';
import Collapsible from 'react-native-collapsible';
import { useSelector, shallowEqual } from 'react-redux';
import Drawer from 'react-native-drawer';
import produce from 'immer';
import { useTheme } from '@react-navigation/native';
import { useDebouncedCallback } from 'use-debounce';

import NoteHeader from '@C/note/NoteHeader';
import { getTopPadding } from '@/lib/device/common';
import { deleteNote, archiveNote, setFavorite } from '@/lib/note/fetch';
import {
  useNoteList,
  useNote,
  useViewType,
  parseSender,
  convertTimeFormat,
  translateName,
  emergencyMark,
} from '@/lib/note/state';
import { getDic } from '@/config';
import ProfileBox from '@/components/common/ProfileBox';
import { makeDateTime } from '@/lib/util/dateUtil';
import NoteFile from '@C/note/NoteFile';

import NoteSideMenu from '@C/note/NoteSideMenu';
import NoteViewSkeleton from '@C/note/skeleton/NoteViewSkeleton';
import FavoriteIcon from '@/components/common/icons/note/func/FavoriteIcon';
import ReplyIcon from '@/components/common/icons/ReplyIcon';
import ForwardIcon from '@/components/common/icons/ForwardIcon';
import DotIcon from '@/components/common/icons/DotIcon';
import DirectionIcon from '@/components/common/icons/DirectionIcon';
import RenderHtml from 'react-native-render-html';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';
import { withSecurityScreen } from '@/withSecurityScreen';

const styles = StyleSheet.create({
  contanier: {
    flex: 1,
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
  title: {
    margin: '4%',
    justifyContent: 'flex-start',
    maxWidth: '85%',
  },
  funcBtn: {
    width: '28%',
    borderColor: '#ababab',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  funcIcon: {
    marginRight: 4,
  },
  popupOption: {
    margin: 8,
  },
  detailInfo: {
    marginVertical: 2,
  },
});

const ReadNote = ({ route }) => {
  const navigation = useNavigation();
  const noteId = route?.params?.noteId;
  const [viewType] = useViewType();
  const [collapsed, setCollapsed] = useState(false);
  const [rendered, setRendered] = useState(false);
  const myInfo = useSelector(({ login }) => login.userInfo);
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const { mutate: setNoteList, removeNote } = useNoteList({ viewType });
  const handleFetchError = useCallback(
    err => {
      console.log('FetchNote Error  ::  ', err);
      Alert.alert(getDic('Note'), getDic('Msg_Error'));
      navigation.canGoBack() && navigation.goBack();
    },
    [navigation],
  );
  const { data, isValidating, error } = useNote({ viewType, noteId });
  const drawer = useRef(null);
  const [favorites, setFavorites] = useState(route?.params?.favorites === '1');
  const openSideMenu = () => {
    Keyboard.dismiss();
    drawer?.current?.open();
  };
  const { sizes } = useTheme();
  const { width } = useWindowDimensions();
  const [isBlockChat, setIsBlockChat] = useState(false);
  const [isBlockFile, setIsBlockFile] = useState(false);

  useEffect(() => {
    if (data && chineseWall?.length) {
      console.log(data);

      const senderInfo = isJSONStr(data.senderInfo)
        ? JSON.parse(data.senderInfo)
        : data.senderInfo;
      const targetInfo = {
        ...senderInfo,
        id: senderInfo.sender,
      };
      console.log(targetInfo, chineseWall);
      const { blockChat, blockFile } = isBlockCheck({
        targetInfo,
        chineseWall,
      });
      setIsBlockChat(blockChat);
      setIsBlockFile(blockFile);
    }
  }, [data, chineseWall]);

  useLayoutEffect(() => {
    // ...
    return () => {
      setRendered(false);
      setCollapsed(false);
    };
  }, []);

  useEffect(() => {
    setRendered(true);
  }, []);

  useEffect(() => {
    if (!isValidating && error) {
      handleFetchError();
    }
  }, [isValidating, error]);

  const isLoading = useMemo(() => {
    return isValidating && !error;
  }, [isValidating, error]);

  const userInfo = useMemo(() => {
    if (!data) {
      return;
    }
    return parseSender(data);
  }, [data]);

  const presence = useSelector(
    ({ presence }) =>
      presence.fixedUsers?.[userInfo?.sender?.id]
        ? presence.fixedUsers[(userInfo?.sender?.id)]
        : presence.users[(userInfo?.sender?.id)],
    shallowEqual,
  );

  const _deleteNote = useCallback(
    ({ viewType, noteId }) => {
      Alert.alert(getDic('Note'), getDic('Msg_Note_DeleteConfirm'), [
        { text: getDic('Cancel') },
        {
          text: getDic('Ok'),
          async onPress() {
            try {
              const { data } = await deleteNote({ viewType, noteId });
              if (data?.status === 'SUCCESS') {
                removeNote(viewType, noteId);
                Alert.alert(getDic('Note'), getDic('Msg_Note_DeleteSuccess'));
                navigation.canGoBack() && navigation.goBack();
              }
            } catch (err) {
              console.log('Delete Note Error ', err);
              Alert.alert(getDic('Note'), getDic('Msg_Note_DeleteFail'));
            }
          },
        },
      ]);
    },
    [viewType, noteId],
  );

  const handleNavigate = useDebouncedCallback(navigation.navigate, 200);

  const customMenus = useMemo(() => {
    const menus = [
      {
        icon: 'Trash',
        async onPress() {
          _deleteNote({ viewType, noteId });
        },
      },
      {
        icon: 'Reply',
        iconStyle: styles.button,
        onPress() {
          handleNavigate('NewNote', { type: 'Reply', noteId, noteInfo: data });
        },
      },
      {
        icon: 'ReplyAll',
        iconStyle: styles.button,
        onPress() {
          handleNavigate('NewNote', { type: 'ReplyAll', noteInfo: data });
        },
      },
      {
        icon: 'Forward',
        iconStyle: styles.button,
        onPress() {
          handleNavigate('NewNote', { type: 'Forward', noteInfo: data });
        },
      },
      {
        icon: 'Menu',
        iconStyle: styles.button,
        onPress: openSideMenu,
      },
    ];
    const blockMenus = ['Reply', 'ReplyAll', 'Forward'];
    return isBlockChat || isBlockFile
      ? menus.filter(item => !blockMenus.includes(item.icon))
      : menus;
  }, [data, isBlockChat, isBlockFile]);

  const noteOptionSelected = useCallback(
    async value => {
      switch (value) {
        case 'Reply':
        case 'ReplyAll':
        case 'Forward':
          handleNavigate('NewNote', { type: value, noteId, noteInfo: data });
          break;
        case 'Archive':
          try {
            const { data } = await archiveNote({ noteId, sop: 'C' });
            if (data?.status === 'SUCCESS') {
              Alert.alert(
                getDic('Note'),
                getDic(
                  'Msg_Note_ArchiveCreateSuccess',
                  '????????? ?????????????????????.',
                ),
              );
            } else {
              throw new Error(
                'Archive Note(Create) Failed with response: ',
                data,
              );
            }
          } catch (err) {
            Alert.alert(
              getDic('Note'),
              getDic(
                'Msg_Note_ArchiveCreateFail',
                '?????? ????????? ??????????????????. ?????? ??????????????????',
              ),
            );
          }
          break;
        case 'Delete':
          _deleteNote({ viewType, noteId });
          break;
      }
    },
    [navigation, data],
  );

  const noteOptions = useMemo(() => {
    const options = [
      {
        value: 'Reply',
        text: getDic('Msg_Note_Reply'),
      },
      {
        value: 'ReplyAll',
        text: getDic('Msg_Note_ReplyAll'),
      },
      {
        value: 'Forward',
        text: getDic('Msg_Note_Forward'),
      },
      {
        value: 'Archive',
        text: getDic('Msg_Note_Archive'),
      },
      {
        value: 'Delete',
        text: getDic('Delete'),
      },
    ];
    const blockOptions = ['Reply', 'ReplyAll', 'Forward'];
    const returnOptions =
      isBlockChat || isBlockFile
        ? options.filter(item => !blockOptions.includes(item.value))
        : options;
    return returnOptions;
  }, [isBlockChat, isBlockFile]);

  const userNames = useMemo(() => {
    return {
      sender: translateName(userInfo?.sender),
      receiver: translateName(userInfo?.receivers, myInfo?.id),
    };
  }, [userInfo]);

  const attachFiles = useMemo(() => {
    if (!data?.files?.length) {
      return [];
    }
    return data.files.map(item => {
      return {
        ...item,
        size: item?.fileSize,
        ext: item?.extension,
      };
    });
  }, [data]);

  const handleFavorite = useCallback(async () => {
    const sop = favorites ? 'D' : 'C';
    const successMessage =
      sop === 'D'
        ? getDic('Msg_Note_FavoriteDeleteSuccess', '?????????????????? ??????????????????.')
        : getDic(
            'Msg_Note_FavoriteCreateSuccess',
            '??????????????? ?????????????????????.',
          );

    try {
      const { data: result } = await setFavorite({ noteId, sop });
      if (result?.status === 'SUCCESS') {
        Alert.alert(getDic('Note'), successMessage);
        // update state
        setNoteList(notes => {
          const updated = produce(notes, draft => {
            const target = notes.findIndex(n => n.noteId === noteId);
            if (target !== -1) {
              draft[target].favorites =
                notes[target].favorites === '1' ? '2' : '1';
            } else {
              console.log('Not Found');
            }
          });
          return updated;
        }, false);
        setFavorites(state => !state);
      } else {
        throw new Error('Favorite Note Failed with response: ', result);
      }
    } catch (err) {
      Alert.alert(
        getDic('Note'),
        getDic(
          'Msg_Note_FavoriteFail',
          '???????????? ????????? ??????????????????. ?????? ??????????????????',
        ),
      );
    }
  }, [noteId, data, favorites]);

  return (
    <SafeAreaView style={{ minHeight: '100%' }}>
      <Drawer
        ref={drawer}
        type="overlay"
        content={<NoteSideMenu noteId={noteId} />}
        tapToClose={true}
        openDrawerOffset={0.2}
        panCloseMask={0.2}
        closedDrawerOffset={-3}
        side="right"
        tweenHandler={ratio => ({
          main: { opacity: (2 - ratio) / 2 },
        })}
        tweenDuration={200}
      >
        <NoteHeader
          title={getDic('Note')}
          menus={!isLoading && customMenus}
          loading={isLoading}
        />
        {isLoading ? (
          <NoteViewSkeleton />
        ) : (
          <ScrollView>
            <View
              style={{
                marginBottom: '10%',
                paddingBottom: 20 + (attachFiles?.length * 12 || 0),
                flexDirection: 'column',
              }}
            >
              <View
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              >
                <Text
                  style={[styles.title, { fontSize: sizes.large }]}
                  numberOfLines={6}
                >
                  {data?.emergency === 'Y' ? emergencyMark : ''}
                  {isBlockChat
                    ? getDic('BlockChat', '????????? ????????? ?????????.')
                    : data?.subject}
                </Text>
                <TouchableOpacity
                  style={{ marginLeft: 'auto', margin: '3%' }}
                  onPress={handleFavorite}
                >
                  <FavoriteIcon width={20} height={20} active={favorites} />
                </TouchableOpacity>
              </View>
              {/**
               * ?????? ??????(?????????/??????)
               * ??? ?????????????????? ???????????? ???????????? margin  ??????
               **/}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: '3%',
                  marginBottom: '3%',
                }}
              >
                <TouchableOpacity
                  style={{ marginRight: 12 }}
                  onPress={() =>
                    userInfo?.sender?.id &&
                    navigation.navigate('ProfilePopup', {
                      targetID: userInfo.sender.id,
                    })
                  }
                >
                  <ProfileBox
                    userId={userInfo?.sender?.id}
                    userName={userInfo?.sender?.displayName}
                    presence={presence}
                    isInherit={false}
                    img={userInfo?.sender?.photoPath}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ width: '60%' }}
                  onPress={() => setCollapsed(c => !c)}
                >
                  <Text
                    numberOfLines={2}
                    style={{ marginBottom: 3, fontSize: sizes.small }}
                  >
                    {userNames.sender}
                    {'   '}
                    <Text
                      style={{
                        paddingLeft: 4,
                        color: '#888',
                        fontSize: sizes.small,
                      }}
                    >
                      {makeDateTime(data?.sendDate)}
                    </Text>
                  </Text>
                  {/* <Text numberOfLines={1}>{convertTimeFormat(data?.sendDate)}</Text> */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text numberOfLines={1} style={{ fontSize: sizes.default }}>
                      {getDic('Note_Recipient')}
                      {': '}
                      {userNames.receiver}
                    </Text>
                    <DirectionIcon
                      width={12}
                      height={12}
                      direction={collapsed ? 'up' : 'down'}
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 'auto',
                    marginRight: '2%',
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      handleNavigate('NewNote', {
                        type: 'Reply',
                        noteId,
                        noteInfo: data,
                      })
                    }
                  >
                    {!isBlockChat || (!isBlockFile && <ReplyIcon />)}
                  </TouchableOpacity>
                  <View style={{ marginHorizontal: 4 }} />
                  <Menu onSelect={noteOptionSelected}>
                    <MenuTrigger>
                      <View
                        style={{ paddingHorizontal: 4, paddingVertical: 8 }}
                      >
                        <DotIcon />
                      </View>
                    </MenuTrigger>
                    <MenuOptions customStyles={{ width: 13 }}>
                      {noteOptions.map((opt, idx) => (
                        <MenuOption
                          key={idx}
                          {...opt}
                          style={styles.popupOption}
                        />
                      ))}
                    </MenuOptions>
                  </Menu>
                  {/* <TouchableOpacity>
                            <DotIcon />
                        </TouchableOpacity> */}
                </View>
              </View>

              {/* ???????????? ?????? */}
              <Collapsible
                collapsed={!collapsed}
                style={{
                  marginHorizontal: '3%',
                  borderColor: '#cacaca',
                  borderWidth: 1,
                  borderRadius: 4,
                }}
              >
                <View style={{ padding: '2%' }}>
                  <Text style={styles.detailInfo}>
                    {getDic('Date')}: {convertTimeFormat(data?.sendDate)}
                  </Text>
                  <Text style={styles.detailInfo}>
                    {getDic('Note_Sender')}: {userNames.sender}
                  </Text>
                  <Text style={styles.detailInfo}>
                    {getDic('Note_Recipient')}: {userNames.receiver}
                  </Text>
                </View>
              </Collapsible>

              {/* ???????????? */}
              <View
                style={{
                  width: '100%',
                  marginHorizontal: '1%',
                  wordBreak: 'break-word',
                }}
              >
                {/* { rendered && <RichEditor
                            initialContentHTML={data?.context}
                            editorStyle={{
                                contentCSSText: 'word-break: break-word;'
                            }}
                            // useContainer={false}
                            disabled={true}
                        /> } */}
                {rendered && (
                  <RenderHtml
                    contentWidth={width}
                    source={{
                      html: isBlockChat
                        ? getDic('BlockChat', '????????? ????????? ?????????.')
                        : data?.context,
                    }}
                    tagsStyles={{
                      table: {
                        maxWidth: '96%',
                        color: '#222',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                      },
                      th: {
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#555',
                        color: '#fff',
                        height: 32,
                      },
                      td: {
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 32,
                      },
                      blockquote: {
                        marginLeft: 14,
                        paddingLeft: 8,
                        borderStyle: 'solid',
                        borderLeftWidth: 4,
                        borderLeftColor: '#e5e5e5',
                      },
                      pre: {
                        padding: 10,
                        backgroundColor: '#f4f7f8',
                      },
                      code: {
                        padding: 0,
                        whiteSpace: 'pre',
                      },
                    }}
                    baseStyle={{ marginHorizontal: '2%' }}
                  />
                )}
              </View>

              {/* ?????? ?????? */}
              {!isBlockFile && (
                <View style={{ marginHorizontal: '4%' }}>
                  {attachFiles.map((file, idx) => (
                    <NoteFile
                      key={idx}
                      type="unit"
                      item={file}
                      disableRemove={true}
                    />
                  ))}
                </View>
              )}

              {/* ?????? */}

              {(!isBlockChat || !isBlockFile) && (
                <View
                  style={{
                    paddingVertical: '4%',
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    marginBottom: 12,
                  }}
                >
                  <TouchableOpacity
                    style={styles.funcBtn}
                    onPress={() =>
                      handleNavigate('NewNote', {
                        type: 'Reply',
                        noteId,
                        noteInfo: data,
                      })
                    }
                  >
                    <ReplyIcon replyAll={false} style={styles.funcIcon} />
                    <Text>{getDic('Msg_Note_Reply')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.funcBtn}
                    onPress={() =>
                      handleNavigate('NewNote', {
                        type: 'ReplyAll',
                        noteId,
                        noteInfo: data,
                      })
                    }
                  >
                    <ReplyIcon replyAll={true} style={styles.funcIcon} />
                    <Text style={{ justifyContent: 'center' }}>
                      {getDic('Msg_Note_ReplyAll')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.funcBtn}
                    onPress={() =>
                      handleNavigate('NewNote', {
                        type: 'Forward',
                        noteId,
                        noteInfo: data,
                      })
                    }
                  >
                    <ForwardIcon style={styles.funcIcon} />
                    <Text>{getDic('Msg_Note_Forward')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </Drawer>
    </SafeAreaView>
  );
};

export default withSecurityScreen(ReadNote);
