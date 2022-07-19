import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import {
  loginInit,
  authCheckComplate,
  syncTokenRequest,
  syncTokenOffline,
} from '@/modules/login';
import * as api from '@API/login';
import LoadingWrap from '@COMMON/LoadingWrap';
import * as LoginInfo from '@/lib/class/LoginInfo';

class TokenChecker extends Component {
  componentDidMount() {
    const checkToken = async () => {
      const { token } = this.props;
      const localToken = await AsyncStorage.getItem('covi_user_access_token');
      const localAccessID = await AsyncStorage.getItem('covi_user_access_id');
      let tokenCheckFlag = false;

      if (!token && localToken) {
        tokenCheckFlag = true;
      } else if (token && !localToken) {
        AsyncStorage.setItem('covi_user_access_token', token);
      } else {
        this.props.authCheckComplate();
      }

      if (tokenCheckFlag) {
        this._tokenCheck({ token: localToken, accessid: localAccessID });
      }
    };
    checkToken();
  }

  _tokenCheck = async ({ token, accessid }) => {
    const { networkState } = this.props;

    if (networkState) {
      LoginInfo.setData(accessid, token, null);
      try {
        const response = await api.tokencheckRequest();
        if (response.data) {
          //TODO: auth success 시 login 정보 맵핑 전에 data sync 수행 -- 이부분은 server 요청보다는 local db 요청으로 전환
          this.props.syncTokenRequest({
            result: response.data,
          });
        }
      } catch (err) {
        console.log('Token check occured an error : ', err);
      }
    } else {
      this.props.syncTokenOffline({ token, accessid });
    }
  };

  componentDidUpdate() {
    const { authFail } = this.props;
    if (authFail) {
      this.props.loginInit();
      AsyncStorage.removeItem('covi_user_access_token');
      AsyncStorage.removeItem('covi_user_access_id');
      LoginInfo.clearData();
    }
  }

  render() {
    return <LoadingWrap />;
  }
}

export default connect(
  ({ login, app }) => ({
    token: login.token,
    authFail: login.authFail,
    networkState: app.networkState,
  }),
  { authCheckComplate, syncTokenRequest, syncTokenOffline, loginInit },
)(TokenChecker);
