import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Platform,
  Alert,
  AppState,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigationState, useTheme } from '@react-navigation/native';
import { Circle } from 'react-native-progress';
import { useThrottledCallback } from 'use-debounce';
import useSWR from 'swr';
import Header from '@COMMON/Header';
import SearchBar from '@COMMON/SearchBar';
import NewNoteIcon from '@COMMON/icons/note/NewNoteIcon';
import NoteItem from '@/components/note/NoteItem';
import { useNoteList, useViewType, SORT } from '@/lib/note/state';
import { deleteNote, getNoteList } from '@/lib/note/fetch';
import { getDic } from '@/config';

import InboxIcon from '@/components/common/icons/note/box/InboxIcon';
import OutboxIcon from '@/components/common/icons/note/box/OutboxIcon';
import ArchiveIcon from '@/components/common/icons/note/box/ArchiveIcon';
import DirectionIcon from '@/components/common/icons/DirectionIcon';
import TrashIcon from '@COMMON/icons/TrashIcon';

import NoteListSkeleton from '@C/note/skeleton/NoteListSkeleton';
import { withSecurityScreen } from '@/withSecurityScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentWrap: {
    padding: 15,
    flex: 1,
  },
  contents: {
    marginTop: 5,
    flex: 8,
  },
  blankList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blankText: { color: '#999', fontSize: 15 },
  wrapButton: {
    width: wp('100%'),
    height: hp('8%'),
    paddingLeft: wp('8%'),
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  searchBarContainer: {
    marginBottom: 10,
  },
});

function NoteManager({ viewType, isLoading, onSearch }) {
  const { data: searchText, mutate: setSearchText } = useSWR(
    '/note/list/searchText',
    null,
    { initialData: '' },
  );
  const [rendered, setRendered] = useState(false);
  let placeholder = null;

  useEffect(() => {
    // 쪽지함 옮길때마다 검색 초기화 / 키보드 닫음
    setSearchText('');
    Keyboard.dismiss();
  }, [viewType]);

  const handleSearchText = useThrottledCallback(() => {
    rendered && onSearch(searchText, 'sendDate', 'D');
  }, 250);

  useEffect(handleSearchText, [searchText]);
  useEffect(() => setRendered(true), []);

  switch (viewType) {
    case 'receive':
      placeholder = getDic('Msg_Note_Search_Receive');
      break;
    case 'send':
      placeholder = getDic('Msg_Note_Search_Send');
      break;
    case 'archive':
      placeholder = getDic('Msg_Note_Search_Archive');
      break;
  }
  return (
    <SearchBar
      style={styles.searchBarContainer}
      placeholder={placeholder}
      searchText={searchText}
      onChangeText={setSearchText}
    />
  );
}

function _NoteList({ header, data, error }) {
  const renderItem = useCallback(({ item }) => {
    return <NoteItem note={item} />;
  }, []);
  const keyExtractor = useCallback(item => `Note${item?.noteId}`, []);
  if (typeof data === 'undefined' && !error) {
    return <NoteListSkeleton />;
  }

  return (
    <FlatList
      data={data}
      ListHeaderComponent={header}
      ListHeaderComponentStyle={{ marginBottom: 15 }}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
      windowSize={11}
      renderItem={renderItem}
    />
  );
}
const NoteList = React.memo(_NoteList);

function ViewTypeSelector({ onViewTypeChanged }) {
  const { colors } = useTheme();
  const [viewType, setViewType] = useViewType();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      marginBottom: 16,
    },
    button: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderWidth: 1,
      borderRadius: 3,
      borderColor: '#AAA',
    },
    activeButton: {
      backgroundColor: colors.primary,
      borderColor: '#fff',
    },
  });
  const getActiveStyle = useCallback(active => {
    if (active) {
      return {
        ...styles.button,
        ...styles.activeButton,
      };
    }
    return styles.button;
  }, []);

  const getActiveColor = useCallback(active => {
    if (active) {
      return { color: '#FFF' };
    }
    return { color: '#555' };
  }, []);

  const buttons = [
    {
      Icon: InboxIcon,
      viewType: 'receive',
      text: getDic('Note_Receive'),
    },
    {
      Icon: OutboxIcon,
      viewType: 'send',
      text: getDic('Note_Send'),
    },
    {
      Icon: ArchiveIcon,
      viewType: 'archive',
      text: getDic('Note_Archive'),
    },
  ];

  const DrawButtons = useMemo(() => {
    return buttons.map((button, idx) => {
      const active = viewType === button?.viewType;
      const buttonStyle = getActiveStyle(active);
      const textColor = getActiveColor(active);
      return (
        <TouchableOpacity
          style={buttonStyle}
          onPress={() => setViewType(button?.viewType)}
          key={idx}
        >
          <Text style={textColor}>
            <button.Icon {...textColor} /> {button.text}
          </Text>
        </TouchableOpacity>
      );
    });
  }, [viewType]);

  useLayoutEffect(() => {
    onViewTypeChanged?.(viewType);
  }, [viewType]);

  return <View style={styles.container}>{DrawButtons}</View>;
}

function SortTypeSelector({ viewType }) {
  const [activeSort, setActiveSort] = useState(null);
  const [nameSort, setNameSort] = useState(SORT.DESC);
  const [dateSort, setDateSort] = useState(SORT.DESC);
  const { data: noteList, mutate: setNoteList, search } = useNoteList({
    viewType,
  });
  const { data: searchText } = useSWR('/note/list/searchText', null, {
    initialData: '',
  });
  const _styles = StyleSheet.create({
    sortContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: '4%',
    },
    sortColumn: { flexDirection: 'row', alignItems: 'center', marginLeft: 24 },
  });

  useEffect(() => {
    // 쪽지함 타입 or 검색어 바뀔경우 정렬상태 초기화
    return () => {
      setNameSort(SORT.DESC);
      setDateSort(SORT.DESC);
      setActiveSort(null);
    };
  }, [searchText, viewType]);

  const sortNoteList = useCallback(
    async (_sortName, _sort, setState) => {
      const nextSort = _sort === SORT.DESC ? SORT.ASC : SORT.DESC;
      try {
        if (!searchText) {
          const result = await getNoteList(
            `/note/list/${viewType}`,
            _sortName,
            nextSort,
          );
          Array.isArray(result) && setNoteList(result, false);
        } else {
          search(searchText, _sortName, nextSort);
        }
        setState(nextSort);
        setActiveSort(_sortName);
      } catch (err) {
        console.log(`Sort(${_sortName}) Error   `, err);
      }
    },
    [viewType],
  );

  const getActiveStyle = useCallback(
    sortName => {
      if (sortName === activeSort) {
        return {
          color: 'rgb(248, 106, 96)',
          fontWeight: 'bold',
        };
      } else {
        return {
          color: '#000',
        };
      }
    },
    [activeSort],
  );

  const deleteAllNotes = useCallback(() => {
    if (noteList?.length === 0) {
      Alert.alert(
        getDic('Note'),
        getDic('Msg_Note_DeleteEmpty', '삭제할 쪽지가 없습니다.'),
      );
      return;
    }
    Alert.alert(getDic('Note'), getDic('Msg_Note_DeleteConfirm'), [
      { text: getDic('Cancel') },
      {
        text: getDic('Ok'),
        async onPress() {
          try {
            const { data } = await deleteNote({ viewType, noteId: 'ALL' });
            if (data && data.status === 'SUCCESS') {
              setNoteList([], false);
              Alert.alert(getDic('Note'), getDic('Msg_Note_DeleteAllSuccess'));
              setNameSort(SORT.DESC);
              setDateSort(SORT.DESC);
              setActiveSort(null);
            } else {
              throw new Error('DeleteAllNote Failed with response: ', data);
            }
          } catch (err) {
            Alert.alert(getDic('Note'), getDic('Msg_Note_DeleteFail'));
          }
        },
      },
    ]);
  }, [viewType, noteList]);

  return (
    <View style={_styles.sortContainer}>
      <TouchableOpacity
        style={_styles.sortColumn}
        onPress={() => sortNoteList(SORT.DATE, dateSort, setDateSort)}
      >
        <Text style={getActiveStyle(SORT.DATE)}>{getDic('Date')}</Text>
        <DirectionIcon
          direction={dateSort === SORT.DESC ? 'down' : 'up'}
          width={10}
          height={10}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={_styles.sortColumn}
        onPress={() => sortNoteList(SORT.NAME, nameSort, setNameSort)}
      >
        <Text style={getActiveStyle(SORT.NAME)}>{getDic('Name')}</Text>
        <DirectionIcon
          direction={nameSort === SORT.DESC ? 'down' : 'up'}
          width={10}
          height={10}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>
      <TouchableOpacity style={_styles.sortColumn} onPress={deleteAllNotes}>
        <Text>{getDic('DeleteAll')}</Text>
        <TrashIcon style={{ marginHorizontal: 2 }} />
      </TouchableOpacity>
    </View>
  );
}

const Note = ({ navigation }) => {
  const [viewType] = useViewType('receive');
  const {
    data: noteList,
    initNoteList,
    isValidating,
    error,
    search,
  } = useNoteList({ viewType });
  const navigationState = useNavigationState(({ index }) => index);
  const initialRender = useRef(null);
  const { colors } = useTheme();

  const handleNavigate = useCallback(
    ({ data }) => {
      // The screen is focused
      // Call any action
      if (data?.state?.index === navigationState) {
        // 쪽지 탭 진입시 수신함 fetch 수행
        // viewType effect와의 중복요청 방지를 위해 최초 렌더링시에만 fetch 생략
        initialRender.current && initNoteList(viewType);

        if (!initialRender.current) {
          initialRender.current = true;
        }
      }
    },
    [navigationState, initialRender],
  );

  const handleAppState = useCallback(
    nextAppState => {
      if (nextAppState !== 'active') {
        return;
      }
      // Refetch NoteList on resume
      initNoteList(viewType);
    },
    [viewType],
  );

  const isLoading = useMemo(() => {
    return isValidating && !error;
  }, [isValidating, error]);

  useLayoutEffect(() => {
    const unsubscribe = navigation.addListener('state', handleNavigate);
    AppState.addEventListener('change', handleAppState);

    return () => {
      AppState.removeEventListener('change', handleAppState);
      unsubscribe();
    };
  }, []);

  useLayoutEffect(() => {
    initNoteList(viewType);
  }, [viewType]);

  return (
    <View style={styles.container}>
      <Header
        title={getDic('Note')}
        style={styles.header}
        topButton={[
          {
            code: 'NewNote',
            onPress() {
              navigation.navigate('NewNote', { type: 'Send' });
            },
            svg: <NewNoteIcon />,
          },
        ]}
      />
      <View style={styles.contentWrap}>
        <View style={styles.contents}>
          <NoteManager
            viewType={viewType}
            isLoading={isLoading}
            onSearch={search}
          />
          <ViewTypeSelector />
          <SortTypeSelector viewType={viewType} />
          <NoteList data={noteList} error={error} />
          {Platform.OS === 'android' && noteList && isLoading && (
            <Circle
              indeterminate={true}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                endAngle: 0.6,
              }}
              color={colors.primary}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default withSecurityScreen(Note);
