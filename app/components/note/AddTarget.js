import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

import { getDic } from '@/config';
import ContactList from '@C/contact/ContactList';
import OrgChartList from '@C/orgchart/OrgChartList';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';

function Header({ title, addCount, onFinish }) {
    const navigation = useNavigation();
    const { colors, sizes } = useTheme();
    const handleClose = useCallback(() => {
        navigation.canGoBack() && navigation.goBack();
    }, [navigation]);

    return (
        <View style={styles.header}>
            <View style={styles.exitBtnView}>
                <TouchableOpacity onPress={handleClose}>
                    <View style={styles.topBtn}>
                        <Svg width="7.131" height="12.78" viewBox="0 0 7.131 12.78">
                            <Path
                                id="패스_2901"
                                data-name="패스 2901"
                                d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                                transform="translate(704.432 304.223) rotate(180)"
                                fill="#222"
                            />
                        </Svg>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.titleView}>
                <Text style={styles.modaltit}>{title}</Text>
            </View>
            <View style={styles.okbtnView}>
                <TouchableOpacity onPress={onFinish}>
                    <View style={styles.topBtn}>
                        <Text
                            style={{
                                ...styles.colortxt,
                                color: colors.primary,
                                fontSize: sizes.default,
                            }}
                        >
                            { addCount }
                        </Text>
                        <Text style={{ fontSize: sizes.default }}>{getDic('Ok')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

function Selected({ style, onChange}) {
    return (
        <View styles={style}>
        </View>
    );
}

function TabSelector({ style, tab, onChange }) {
    return (
        <View style={style}>
            {/* Contact */}
            <TouchableOpacity onPress={() => onChange?.('C')} style={[styles.tabItem, tab === 'C' && styles.tabItemActive]}>
                <Text>{getDic('Contact')}</Text>
            </TouchableOpacity>
            {/* OrgChart */}
            <TouchableOpacity onPress={() => onChange?.('O')} style={[styles.tabItem, tab === 'O' && styles.tabItemActive]}>
                <Text>{getDic('OrgChart')}</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function AddTarget({ navigation, route }) {
    const { colors, sizes } = useTheme();
    const { headerName  } = route?.params;
    const { data: targetList, mutate: setTargetList } = useSWR('/note/send/target', null);
    const [oldTargetList, setOldTargetList] = useState(targetList || []);
    const [newTargetList, setNewTargetList] = useState([]);
    const [selectTab, setSelectTab] = useState('C');
    const jobKeys = useSelector(({ absence }) => absence.jobKey);

    const handleFinish = useCallback(() => {
        setTargetList([...oldTargetList, ...newTargetList]);
        navigation.canGoBack() && navigation.goBack();
    }, [oldTargetList, newTargetList]);


    const addUser = useCallback((member) => {
        setNewTargetList(prevState => {
            // jobKey 누락시 보완 (components/contact/Contactitem에서 1차적으로 jobKey 추가함)
            if(!member.jobKey) {
                member.jobKey = jobKeys.get(member.id);
            }
            return prevState.concat(member)
        });
    }, [jobKeys]);

    const delUser = useCallback((key, value) => {
        setOldTargetList(prev => prev.filter(item => item[key] !== value));
        setNewTargetList(prev => {
            return prev.filter(item => item[key] !== value);
        });
    }, []);

    const SelectList = useMemo(() => {
        if (selectTab === 'C') {
            return ContactList;
        } else if (selectTab === 'O') {
            return OrgChartList;
        }
    }, [selectTab]);

    const checkObj = useMemo(() => {
        return {
            name: 'AddTarget_',
            onPress(checked, userInfo) {
                if (checked === true) {
                    addUser(userInfo);
                } else {
                    delUser('jobKey', userInfo.jobKey);
                }
            },
            disabledList: [],
            disabledKey: 'jobKey',
            checkedList: [...oldTargetList, ...newTargetList],
            checkedKey: 'jobKey',
            checkedSubKey: 'id'
        }
    }, [oldTargetList, newTargetList]);

    return (
        <SafeAreaView style={styles.container}>
            <Header title={headerName} addCount={newTargetList.length} onFinish={handleFinish} />
            <Selected data={oldTargetList} onChange={setNewTargetList} style={styles.selectList}/>
            <TabSelector tab={selectTab} onChange={setSelectTab} style={styles.tab}/>
            <View style={styles.tabcontent}>
                <SelectList
                    viewType="checklist"
                    checkObj={checkObj}
                    navigation={navigation}
                />
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: getTopPadding(),
        paddingBottom: getBottomPadding(),
    },
    header: {
        width: '100%',
        height: 55,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    exitBtnView: { width: '20%', alignItems: 'flex-start' },
    titleView: { width: '60%', alignItems: 'center' },
    okbtnView: { width: '20%', alignItems: 'flex-end' },
    modaltit: {
        fontSize: 18,
    },
    topBtn: {
        marginLeft: 10,
        padding: 10,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    colortxt: {
        fontWeight: '700',
        paddingRight: 5,
    },
    tab: {
        flexDirection: 'row',
        width: '100%',
    },
    tabItem: {
        width: '50%',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    tabItemActive: {
        borderBottomWidth: 2.5,
        borderBottomColor: '#333',
    },
    selectList: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    selectItem: {
        width: 70,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectTxt: {
        marginTop: 7,
        width: '100%',
        textAlign: 'center',
    },
    selectDel: {
        position: 'absolute',
        right: 3,
        top: 0,
    },
    tabcontent: {
        flex: 1,
    },
});