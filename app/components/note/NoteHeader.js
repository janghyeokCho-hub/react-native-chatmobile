import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import ProfileBox from '@/components/common/ProfileBox';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Platform
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';

import { getJobInfo } from '@/lib/common';
import { useTheme } from '@react-navigation/native';
import Icon from '@COMMON/icons';

function HeaderTitle({ title, userInfo, loading }) {




    const { sizes, colors } = useTheme();
    let _title = '';

    if (loading) {
        _title = "Loading..";
    } else if (typeof title !== 'undefined') {
        _title = title;
    } else if (userInfo) {
        try {
            const { sender } = userInfo;
            return (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ProfileBox
                        userId={sender?.id}
                        userName={sender?.name}
                        presence={sender?.presence}
                        isInherit={false}
                        img={sender?.photoPath}
                        style={styles.headerProfile}
                    />
                    <View style={{width:"50%"}}>
                        <Text style={{ fontSize: sizes.default }} numberOfLines={2}>{getJobInfo(sender)}</Text>
                    </View>
                </View>
            );
        } catch (err) {
            console.log('Get Profile Error : ', err);
        }
    }

    return (
        <View>
            <Text style={{ fontSize: sizes.default }}>
                { _title }
            </Text>
        </View>
    );
}

function GoBackIcon() {
    return (
        <Svg width="7.131" height="12.78" viewBox="0 0 7.131 12.78">
            <Path
                id="패스_2901"
                data-name="패스 2901"
                d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                transform="translate(704.432 304.223) rotate(180)"
                fill="#222"
            />
        </Svg>
    );
}

export default function NoteHeader({ title, userInfo, menus, loading, setAllCheck }) {
    const { sizes, colors } = useTheme();

    const navigation = useNavigation();
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => {
        setIsEnabled(previousState => !previousState);
        setAllCheck(previousState => !previousState)
    }

     

    return <>
        <View style={styles.top}>
            <TouchableOpacity
                style={styles.topBackBtn}
                onPress={() => navigation.canGoBack() && navigation.goBack()}>
                <GoBackIcon />
            </TouchableOpacity>

            <HeaderTitle title={title} userInfo={userInfo} loading={loading} />

            <View style={styles.leftMenuBox}>
                {menus && menus?.map((menu, idx) => {
                    return <TouchableOpacity onPress={menu?.onPress} key={idx}>
                        <View style={styles.menuBtn}>
                            {menu?.icon && <Icon name={menu.icon} focus={true} style={menu?.iconStyle} />}
                            {
                                menu?.switch &&      
                                <>
                                <View style={{flexDirection:'row'}}> 
                                {
                                    Platform.OS == 'ios'?
                                    <Text style={{ fontSize: sizes.default, marginTop:7, marginRight:3 }}>{menu.switch}</Text>
                                    :
                                    <Text style={{ fontSize: sizes.default, marginTop:3 }}>{menu.switch}</Text>
                                }
                                <Switch
                                trackColor={{ false: "#767577", true: colors.primary }}
                                thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                                nativeID={menu.switch}
                              />
                              </View>
                              </>
                            }

                        </View>
                    </TouchableOpacity>
                })}
            </View>
        </View>
    </>;
}

const styles = StyleSheet.create({
    top: {
        width: '100%',
        height: hp('9%'),
        backgroundColor: '#F6F6F6',
        borderBottomColor: '#DDDDDD',
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    topBackBtn: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    searchBtn: {
        padding: 20,
        paddingRight: 0,
        height: '100%',
        justifyContent: 'center',
    },
    menuBtn: {
        padding: 16,
        paddingLeft: 4,
        height: '100%',
        justifyContent: 'center',
    },
    leftMenuBox: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    headerProfile: {
        width: 40,
        height: 40,
        margin: 5,
    },
});