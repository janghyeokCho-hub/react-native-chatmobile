import React, { useEffect, useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import produce from 'immer';

import ProfileBox from '@COMMON/ProfileBox';
import { parseSender, translateName, useViewType, useNoteList, emergencyMark } from '@/lib/note/state';
import { archiveNote, deleteNote, setFavorite } from '@/lib/note/fetch';
import { makeDateTime } from '@/lib/util/dateUtil';
import { changeModal, openModal } from '@/modules/modal';

import ReadIcon from '@/components/common/icons/note/func/ReadIcon';
import FileIcon from '@/components/common/icons/note/func/FileIcon';
import FavoriteIcon from '@/components/common/icons/note/func/FavoriteIcon';
import { getDic } from '@/config';

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
        maxWidth: '85%'
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
    func: {
        color: '#AAA',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 4,
        flexDirection: 'row',
        flexWrap: 'wrap'
    }
});

export default function NoteItem({ note, hideProfile = false }) {
    const { sizes } = useTheme();
    const navigation = useNavigation();
    const [viewType, _] = useViewType();
    const dispatch = useDispatch();
    const userInfo = useMemo(() => {
        const info = parseSender(note);
        if (info.length === 1 && info[0].presence) {
            return info[0];
        }
        return info;
    }, [note]);
    const { mutate: setNoteList } = useNoteList({ viewType });

    /**
     * 2021.07.28
     * 모바일의 쪽지 context menu 종류는 데스크탑보다 간소화하여 보여주도록 함
     * 열기 / 즐겨찾기 / 삭제 / 보관
     * (나머지 기능은 쪽지 안에 들어가서 가능)
     */
    const modalButtons = useMemo(() => {
        const isFavorite = note?.favorites === '1';
        const isArchiveBox = viewType === 'archive';
        const _buttons = [
            {
                code: 'openNote',
                title: getDic('Msg_Note_Open'),
                onPress() {
                    navigation.navigate('ReadNote', { noteId: +note?.noteId, favorites: note?.favorites });
                }
            },
            {
                code: 'setFavorite',
                title: isFavorite ? getDic('Msg_Note_FavoriteDelete') : getDic('Msg_Note_FavoriteCreate'),
                async onPress() {
                    const sop = isFavorite ? 'D' : 'C';
                    const successMessage = sop === 'D' ? getDic('Msg_Note_FavoriteDeleteSuccess', '즐겨찾기에서 삭제했습니다.') : getDic('Msg_Note_FavoriteCreateSuccess', '즐겨찾기에 추가되었습니다.');
                    try {
                        const { data } = await setFavorite({ noteId: note.noteId, sop });
                        if (data && data.status === 'SUCCESS') {
                            Alert.alert(
                                getDic('Note'),
                                successMessage
                            );
                            // update state
                            setNoteList((notes) => {
                                const updated = produce(notes, draft => {
                                    const target = notes.findIndex(n => n.noteId === note.noteId);
                                    if (target !== -1) {
                                        draft[target].favorites = notes[target].favorites === '1' ? '2' : '1';
                                    } else {
                                        console.log('Not Found');
                                    }
                                });
                                return updated;
                            }, false);
                        } else {
                            throw new Error('Favorite Note Failed with response: ', data);
                        }
                    } catch (err) {
                        Alert.alert(
                            getDic('Note'),
                            getDic('Msg_Note_FavoriteFail', '즐겨찾기 처리에 실패했습니다. 다시 시도해주세요')
                        );
                    }
                }
            },
            {
                code: 'deleteNote',
                title: getDic('Delete'),
                onPress() {
                    Alert.alert(
                        getDic('Note'),
                        getDic('Msg_Note_DeleteConfirm'),
                        [
                            { text: getDic('Cancel') },
                            {
                                text: getDic('Ok'),
                                async onPress() {
                                    try {
                                        const { data } = await deleteNote({ viewType, noteId: note.noteId });
                                        if (data && data.status === 'SUCCESS') {
                                            Alert.alert(
                                                getDic('Note'),
                                                getDic('Msg_Note_DeleteSuccess', '쪽지가 삭제되었습니다.')
                                            );
                                            setNoteList((prevNoteList) => {
                                                return prevNoteList.filter(_note => _note.noteId !== note.noteId);
                                            }, false);
                                        } else {
                                            throw new Error('Delete Note Failed with response: ', data);
                                        }
                                    } catch (err) {
                                        Alert.alert(
                                            getDic('Note'),
                                            getDic('Msg_Note_DeleteFail', '쪽지를 삭제하지 못했습니다. 다시 시도해 주세요')
                                        );
                                    }
                                }
                            }
                        ]
                    )
                }
            }
        ];

        // 보관함이 아닌 경우에만 보관하기 context 보여주기
        if (isArchiveBox === false) {
            _buttons.push({
                code: 'setArchive',
                title: getDic('Msg_Note_Archive'),
                async onPress() {
                    const sop = 'C';
                    try {
                        const { data } = await archiveNote({ noteId: note.noteId, sop });
                        if (data && data.status === 'SUCCESS') {
                            Alert.alert(
                                getDic('Note'),
                                getDic('Msg_Note_ArchiveCreateSuccess', '쪽지가 보관되었습니다.')
                            );
                        } else {
                            throw new Error('Archive Note(Create) Failed with response: ', data);
                        }
                    } catch (err) {
                        // popupResult(dispatch, covi.getDic('Msg_Note_ArchiveCreateFail', '쪽지 보관에 실패했습니다. 다시 시도해주세요'));
                        Alert.alert(
                            getDic('Note'),
                            getDic('Msg_Note_ArchiveCreateFail', '쪽지 보관에 실패했습니다. 다시 시도해주세요')
                        );
                    }
                }
            });
        }
        return _buttons;
    }, [viewType, note]);

    return (
        <TouchableOpacity
            onPress={() => {
                // 실시간 쪽지수신시 noteId가 string 타입으로 옴
                navigation.navigate('ReadNote', { noteId: +note?.noteId, favorites: note?.favorites });
            }}
            onLongPress={() => {
                dispatch(
                    changeModal({
                        modalData: {
                            closeOnTouchOutside: true,
                            type: 'normal',
                            buttonList: modalButtons
                        }
                    })
                );

                dispatch(openModal());
            }}
        >
            <View style={styles.container}>
                {
                    userInfo?.presence && !hideProfile && (
                        <View style={styles.profile}>
                            <ProfileBox
                                userId={userInfo.id}
                                userName={userInfo.displayName}
                                presence={userInfo.presence}
                                img={userInfo.photoPath}
                                inInherit={true}
                            />
                        </View>
                    )
                }
                <View style={styles.content}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Text numberOfLines={1} style={styles.title}>
                            {note?.emergency === 'Y' ? emergencyMark : ''}
                            {note?.subject}
                        </Text>
                        {note.readFlag === 'N' && (<Text style={{ marginLeft: 5, color: '#F86A60', fontWeight: 'bold', fontSize: 11, flexDirection: "column" }} >N</Text>)}
                    </View>
                    <Text
                        numberOfLines={2}
                        style={{ ...styles.lastMessage, fontSize: 13 + sizes.inc }}
                    >
                        {translateName(userInfo)}
                    </Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.dateText}>
                        {makeDateTime(note?.sendDate)}
                    </Text>
                    <View style={styles.func}>
                        <FileIcon active={note?.fileFlag === 'Y'} />
                        <ReadIcon active={note?.readFlag === 'N'} style={{ marginLeft: 4 }} />
                        <FavoriteIcon active={note?.favorites === '1'} style={{ marginLeft: 4 }} />
                    </View>
                </View>
            </View>
        </TouchableOpacity >
    );
}
