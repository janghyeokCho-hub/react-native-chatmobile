import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
const loadingImg = require('@C/assets/loading.gif');
const DialogModal = ({ data, visible }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text>{data.message}</Text>
          {data.type === 'Alert' && (
            <TouchableOpacity
              onPress={() => {
                if (typeof data.callback === 'function') data.callback();
              }}
            >
              <View style={styles.modalBtn}>
                <Text
                  style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}
                >
                  확인
                </Text>
              </View>
            </TouchableOpacity>
          )}
          {data.type === 'Progress' && (
            <View style={styles.progressImg}>
              <Image source={loadingImg} style={{ width: 40, height: 40 }} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingTop: 35,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 20,
    minWidth: 240,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  modalBtn: {
    width: 70,
    height: 30,
    marginTop: 20,
    backgroundColor: '#12cfee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },

  progressImg: {
    width: '100%',
    height: 40,
    marginTop: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DialogModal;
