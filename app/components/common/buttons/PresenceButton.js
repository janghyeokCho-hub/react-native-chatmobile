import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import {
  addTargetUser,
  delTargetUser,
  setUsersPresence,
} from '@/modules/presence';
import { getConfig } from '@/config';

const presenceClass = code => {
  const findPr = getConfig('Presence', []).find(item => item.code == code);

  if (findPr) {
    let mStyle = {};
    if (typeof findPr.mobileStyle == 'string') {
      mStyle = JSON.parse(findPr.mobileStyle);
    } else {
      mStyle = findPr.mobileStyle;
    }

    return mStyle;
  } else {
    return styles['offline'];
  }
};

const PresenceButton = ({ userId, state, isInherit }) => {
  const presence = useSelector(
    ({ presence }) =>
      presence.fixedUsers[userId]
        ? presence.fixedUsers[userId]
        : presence.users[userId],
    shallowEqual,
  );

  const dispatch = useDispatch();

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });

    return ref.current;
  }

  const prevPresence = usePrevious(presence);

  useEffect(() => {
    try {
      if (isInherit != true && presence == undefined) {
        dispatch(
          addTargetUser({
            userId: userId,
            state: presence ? presence : state,
          }),
        );

        return () => {
          if (prevPresence != undefined) {
            dispatch(delTargetUser(userId));
          }
        };
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (isInherit != true && presence && state && presence != state) {
      dispatch(setUsersPresence({ userId, state }));
    }
  }, [state]);

  const drawPresence = useMemo(() => {
    if ((isInherit == true && presence) || (state != null && state != '')) {
      return (
        <View
          style={[styles.container, presenceClass(presence ? presence : state)]}
        />
      );
    }

    return null;
  }, [presence, state, isInherit]);

  return drawPresence;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: '40%',
    height: '40%',
    maxWidth: 40,
    maxHeight: 40,
    borderRadius: 100,
    borderColor: '#fff',
    borderWidth: 1,
  },
  offline: {
    backgroundColor: '#cacaca',
  },
});

export default React.memo(PresenceButton);
