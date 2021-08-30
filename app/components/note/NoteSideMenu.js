import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import useSWR from 'swr';

import { getDic } from '@/config';
import { getJobInfo, getDictionary } from '@/lib/common';
import { useNoteReadList } from '@/lib/note/state';
import NoteListSkeleton from '@C/note/skeleton/NoteListSkeleton';

function _CheckList({ data, style }) {
    const navigation = useNavigation();
    const { sizes } = useTheme();
    const renderItem = useCallback(({ item, index }) => {
        function openProfilePopup() {
            item?.userId && navigation.navigate('ProfilePopup', {
                targetID: item?.userId
            });
        }
        const checkedColor = item?.readFlag === 'Y' ? '#1976d2' : '#F86A60';
        const checkedText = item?.readFlag === 'Y' ? getDic('Check', '확인') : getDic('Uncheck', '미확인');
        const jobInfo = getJobInfo({
            name: item?.displayName,
            LN: item?.multiJobLevelName,
            PN: item?.multiJobPositionName,
            TN: item?.multiJobTitleName
        });
        return (
            <TouchableOpacity style={[{ flexDirection: "row", alignItems: "center", marginBottom: '3%', padding: '2%' }, styles.roundBorder]} onPress={openProfilePopup}>
                <View style={{ flexDirection: "row", fontSize: sizes.default  }}>
                    <Text style={{ flex: 2, fontSize: sizes.default }}>
                        {`${index + 1}. `}
                        {getDictionary(item?.deptName)}
                    </Text>
                    <Text style={{ flex: 3 }}>
                        {jobInfo}
                    </Text>
                    <Text style={{ flex: 1, color: checkedColor }}>
                        {checkedText}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }, [data]);
    const keyExtractor = useCallback((item) => item?.userId, [data]);
    return (
        <FlatList
            data={data}
            style={style}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
        />
    );
}
const CheckList = React.memo(_CheckList);

export default function NoteSideMenu({ noteId }) {
    const { sizes, colors } = useTheme();
    const { data: readListData, isValidating, error } = useNoteReadList({ noteId });
    const readCount = useMemo(() => {
        const readListLength = readListData?.length;
        if(Number.isInteger(readListLength) === false) {
            return {
                read: 0,
                unread: 0
            };
        }
        const read = readListData?.reduce((acc, cur) => {
            return cur?.readFlag === 'Y' ? acc+1 : acc;
        }, 0);
        return {
            read,
            unread: readListLength - read
        };
    }, [readListData]);

    const isLoading = useMemo(() => isValidating && !error, [isValidating, error]);
    if (isLoading) {
        // ... handle loading
        return (
            <View style={styles.container}>
                <View style={{ margin: '5%' }}>
                    <NoteListSkeleton />
                    <NoteListSkeleton />
                </View>
            </View>
        );
    }
    if (error) {
        // ... handle error
        return <Text>Error</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.titleBox, styles.bottomBorder]}>
                <Text style={{ fontSize: sizes.large }}>{getDic('Note_ReadList')}</Text>
            </View>
            <View style={styles.subTitleBox}>
                <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: sizes.default }}>{getDic('Note_Recipient')}</Text>
                    <Text style={{ color: colors.primary, marginLeft: 8 }} >{readListData?.length}</Text>
                </View>
            </View>
            <View style={[styles.subTitleBox, styles.bottomBorder]}>
                <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: sizes.default }}>{getDic('Check')}</Text>
                    <Text style={{ color: '#1976d2', marginLeft: 8 }} >{readCount.read}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: sizes.default }}>{getDic('Uncheck')}</Text>
                    <Text style={{ color: '#F86A60', marginLeft: 8 }} >{readCount.unread}</Text>
                </View>
            </View>
            <CheckList data={readListData} style={{ paddingBottom: '16%' }}/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        minHeight: '100%',
        backgroundColor: '#FFF',
        padding: '6%'
    },
    titleBox: {
        width: '100%',
        height: 40,
        marginBottom: '6%',
        justifyContent: 'center'
    },
    subTitleBox: {
        flexDirection: "row",
        width: '100%',
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: '6%',
        paddingBottom: '4%'
    },
    bottomBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#cecece'
    },
    roundBorder: {
        borderWidth: 1,
        borderColor: '#cecece',
        borderRadius: 4
    }
});