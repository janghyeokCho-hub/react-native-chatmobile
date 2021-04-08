import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import LatestMessage from '@C/chat/chatroom/normal/LatestMessage';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

let useScroll = false;

const ListScrollBox = ({
  handleScrollBox,
  scrollTo,
  onScrollTop,
  onScrollBottom,
  loadingPage,
  pageInit,
  isTopEnd,
  isBottomEnd,
  onExtension,
  children,
}) => {
  let _listener = null;

  const [mounted, setMounted] = useState(false);
  // const [useScroll, setUseScroll] = useState(false);
  const [btnBottom, setBtnBottom] = useState(false);

  const [scrollY, setScrollY] = useState(null);
  const [scrollHeight, setScrollHeight] = useState(null);

  useEffect(() => {
    const keyboardListener = 'keyboardDidShow';
    // Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';

    setMounted(true);

    _listener = Keyboard.addListener(keyboardListener, keyboardShowEvt);

    return () => {
      _listener && _listener.remove();
    };
  }, []);

  const keyboardShowEvt = e => {
    if (!useScroll) scrollTo('end', true);
    onExtension('');
  };

  useEffect(() => {
    if (mounted) {
      scrollTo('end', false);
    }
  }, [mounted]);

  useEffect(() => {
    if (!useScroll) {
      // scroll 사용중이 아닌경우 항상 bottom 유지
      scrollTo('end', false);
    }
  }, [children]);

  const handleUpdate = value => {
    const nativeEvent = value.nativeEvent;
    const top =
      (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y) /
      nativeEvent.contentSize.height;

    setScrollHeight(nativeEvent.contentSize.height);
    setScrollY(nativeEvent.contentOffset.y);

    if (top < 0.5 && !loadingPage && !isTopEnd) {
      onScrollTop();
    }

    if (top > 0.8 && !loadingPage && !isBottomEnd) {
      onScrollBottom();
    }

    // TODO: 다른 사람이 보낸 메시지 도착 시 아래로 가지않도록 수정 필요
    if (isBottomEnd) {
      // 한페이지 이상 스크롤을 올렸을 경우
      if (
        top < 0.9 &&
        nativeEvent.contentSize.height -
          (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y) >
          nativeEvent.layoutMeasurement.height
      ) {
        setBtnBottom(true);
        useScroll = true;
      } else {
        setBtnBottom(false);
        useScroll = false;
      }
    }
  };

  const handleChangeSize = (contentWidth, contentHeight) => {
    if (scrollY && scrollHeight) {
      const position = scrollY + (contentHeight - scrollHeight);
      scrollTo('all', { x: 0, y: position, animated: false });
    }
    setScrollHeight(contentHeight);
  };

  return (
    <>
      <ScrollView
        style={styles.listScrollBox}
        ref={scroll => handleScrollBox(scroll)}
        keyboardShouldPersistTaps="handled"
        onScroll={handleUpdate}
        onContentSizeChange={handleChangeSize}
        scrollEventThrottle={16}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            onExtension('');
          }}
        >
          {children}
        </TouchableWithoutFeedback>
      </ScrollView>
      {btnBottom && (
        <View>
          <View>
            <TouchableOpacity
              onPress={e => {
                setBtnBottom(false);
                useScroll = false;
                pageInit();
                scrollTo('end', true);
                //e.preventDefault();
                //e.stopPropagation();
              }}
            />
          </View>
          {/*<LatestMessage />*/}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  listScrollBox: {
    flex: 1,
    flexDirection: 'column',
    padding: 15,
    marginBottom: 10,
  },
});

export default ListScrollBox;
