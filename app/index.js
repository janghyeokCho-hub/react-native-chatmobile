/**
 * @format
 */

import React from 'react';
import { AppRegistry, View, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { name as appName } from '../app.json';
import { Provider } from 'react-redux';
import { Component } from 'react';
import { createStore, applyMiddleware } from 'redux';
import rootReducer, { rootSaga } from './modules';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import App from './App';
import InitApp from './InitApp';
import { initConfig, getServerConfigs, initHostInfo } from '@/config';
import { Notifications } from 'react-native-notifications';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingWrap from '@C/common/LoadingWrap';
import initQuickActions from '@/lib/quickActions';
import Share from '@C/common/share/Share';
import * as LoginInfo from '@/lib/class/LoginInfo';
import * as db from '@/lib/appData/connector';

// Share를 먼저 등록하지 않으면 stack, quickAction, store 등록하면서 등록 불가
AppRegistry.registerComponent('EumtalkShare', () => Share);

const checkAppConfigurations = () => {
  return new Promise(async (resolve, reject) => {
    const makeConfigData = async () => {
      let flag = false;
      try {
        const hostInfo = await AsyncStorage.getItem('EHINF');

        if (hostInfo) {
          let settings = await AsyncStorage.getItem('ESETINF');
          if (!settings) {
            const response = await getServerConfigs(hostInfo);
            settings = response.data.result;
            AsyncStorage.setItem('ESETINF', JSON.stringify(settings));
          }
          // config setting
          await initConfig(hostInfo, settings);
          flag = true;
        } else {
          AsyncStorage.removeItem('ESETINF');
          const result = await initHostInfo();
          flag = false;
        }
      } catch (e) {
        AsyncStorage.removeItem('ESETINF');
        const result = await initHostInfo();
        flag = false;
      }

      return flag;
    };

    // 20200428 covision 운영 배포용 ( 삭제 필요 ) ---- START

    // AsyncStorage.setItem(
    //   'EHINF',
    //   __DEV__ ? 'https://eum.covision.co.kr' : 'https://eum.covision.co.kr',
    // );
    // AsyncStorage.setItem('EHINF', 'https://otalk.ottogi.co.kr');

    // 20200428 covision 운영 배포용 ( 삭제 필요 ) ---- END

    /* 임시 배포용 추후 옵션화기능으로 구현*/
    const localStorageInit = async () =>{
      let clearLocalData = await AsyncStorage.getItem('clearLocalData')
      if(!clearLocalData)
        AsyncStorage.setItem('clearLocalData', 'Y')
  
      clearLocalData  = await AsyncStorage.getItem('clearLocalData')
      if(clearLocalData == 'Y'){        
        const dbCon = await db.getConnection(LoginInfo.getLoginInfo().getID());
        await db.deleteDabase(LoginInfo.getLoginInfo().getID());
        AsyncStorage.setItem('clearLocalData', 'N')
      }
    };

    await localStorageInit();

    const configLoadFlag = await makeConfigData();

    if (configLoadFlag) {
      resolve();
    } else {
      reject();
    }
  });
};

// quick Action 등록
initQuickActions();
const stack = createStackNavigator();
const sagaMiddleware = createSagaMiddleware();

Notifications.registerRemoteNotifications();

const store = (() => {
  if (__DEV__) {
    return createStore(
      rootReducer,
      composeWithDevTools(applyMiddleware(sagaMiddleware)),
    );
  } else {
    return createStore(rootReducer, applyMiddleware(sagaMiddleware));
  }
})();

sagaMiddleware.run(rootSaga);

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rerenderKey: 0,
      loading: false,
      configLoadFlag: null,
    };
  }

  componentDidMount() {
    if (this.props.configLoadFlag == null) {
      this.checkConfig();
    }
  }

  componentDidUpdate() {
    // configLoadFlag 가 null 로 변경된 경우 config 다시 로딩
    if (this.state.configLoadFlag == null && !this.state.loading) {
      this.checkConfig();
    }
  }

  checkConfig = () => {
    this.setState({
      loading: true,
    });
    checkAppConfigurations()
      .then(() => {
        this.setState({
          loading: false,
          configLoadFlag: true,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          configLoadFlag: false,
        });
      });
  };

  handleRerender = configLoad => {
    if (configLoad) {
      this.setState({
        rerenderKey: this.rerenderKey + 1,
        configLoadFlag: null,
      });
    } else {
      this.setState({
        rerenderKey: this.rerenderKey + 1,
      });
    }
  };

  render() {
    const { loading, configLoadFlag, rerenderKey } = this.state;
    return (
      <>
        {(loading && <LoadingWrap key={rerenderKey} />) ||
          (configLoadFlag && (
            <Provider store={store}>
              <App stack={stack} key={rerenderKey} />
            </Provider>
          )) || <InitApp key={rerenderKey} onRerender={this.handleRerender} />}
      </>
    );
  }
}

AppRegistry.registerComponent(appName, () => Index);
