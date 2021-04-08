import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

const LinkMessageBox = ({ link, linkData }) => {
  const [thumb, setThumb] = useState((linkData && linkData.image) || null);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Linking.canOpenURL(link).then(supported => {
          if (supported) {
            Linking.openURL(link);
          }
        });
      }}
    >
      <View style={[styles.container, { height: thumb ? 190 : 80 }]}>
        {thumb && (
          <View style={styles.imageBox}>
            <Image
              source={{ uri: thumb }}
              onError={e => {
                setThumb(linkData.domain + linkData.image);
              }}
              style={{
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                width: '100%',
                height: '100%',
              }}
            />
          </View>
        )}
        <View style={styles.infoBox}>
          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit={Platform.OS == 'android'}
          >
            {(linkData && linkData.title) || link}
          </Text>
          <Text
            style={styles.exInfo}
            numberOfLines={1}
            adjustsFontSizeToFit={Platform.OS == 'android'}
          >
            {(linkData && linkData.description) ||
              '여기를 눌러 링크를 확인하세요'}
          </Text>
          <Text
            style={styles.exInfo}
            numberOfLines={1}
            adjustsFontSizeToFit={Platform.OS == 'android'}
          >
            {link}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 230,
    borderRadius: 5,
    borderColor: '#E9E9E9',
    borderWidth: 0.7,
  },
  infoBox: {
    width: '100%',
    height: 70,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    padding: 10,
  },
  title: {
    color: '#000',
    fontSize: 13,
    marginBottom: 5,
  },
  exInfo: {
    color: '#888',
    fontSize: 12,
    marginBottom: 3,
  },
  imageBox: {
    width: '100%',
    height: 110,
    borderRadius: 5,
    borderBottomColor: '#E9E9E9',
    borderBottomWidth: 0.5,
  },
});

export default React.memo(LinkMessageBox);
