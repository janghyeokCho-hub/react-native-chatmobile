import React from 'react';
import { View, Text } from 'react-native';

const UnreadCntButton = ({ children }) => {
  return (
    <>
      {children > 0 && (
        <View
          style={{
            position: 'absolute',
            marginTop: 2,
            paddingTop: 2,
            paddingBottom: 2,
            paddingLeft: 6,
            paddingRight: 6,
            borderRadius: 25,
            right: '18%',
            top: '8%',
            backgroundColor: '#F86A60',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
            {children > 99 ? '99+' : children}
          </Text>
        </View>
      )}
    </>
  );
};

export default UnreadCntButton;
