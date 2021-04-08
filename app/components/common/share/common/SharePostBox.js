import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, FlatList, Image } from 'react-native';
const SharePostBox = ({ context, shareData, onChangeText }) => {
  // send message view
  const postBox = useRef(null);
  const [type, setType] = useState('text');
  useEffect(() => {
    if (Array.isArray(shareData)) {
      const shareType = shareData[0].type;
      if (shareType === 'text') {
        onChangeText(shareData[0].value);
      }

      setType(shareType);
    }

    postBox && postBox.current && postBox.current.focus();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        multiline
        onChangeText={onChangeText}
        ref={postBox}
        value={context}
        placeholderTextColor="#AAA"
        placeholder="메시지 내용을 입력해주세요"
        style={{
          minHeight: 100,
          width: '100%',
          padding: 0,
        }}
      />
      {type === 'media' && (
        <View
          style={{
            height: 140,
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: '#d9d9d9',
          }}
        >
          <FlatList
            data={shareData}
            keyExtractor={(item, index) => index}
            renderItem={({ item }) => {
              return (
                <Image
                  style={{ width: 120, height: 120, marginRight: 5 }}
                  source={{ uri: item.value }}
                  resizeMode="contain"
                  onError={e => {
                    console.log(e);
                  }}
                />
              );
            }}
            horizontal
          />
        </View>
      )}
    </View>
  );
};

export default SharePostBox;
