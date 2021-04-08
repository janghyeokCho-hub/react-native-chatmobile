import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getDic } from '@/config';

const NetworkError = ({ handleRefresh }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{getDic('Msg_NetworkCannotConnect')}</Text>
      <Text style={styles.text}>{getDic('Msg_WaitingForConnection')}</Text>
      {handleRefresh && (
        <TouchableOpacity onPress={handleRefresh}>
          <View style={styles.refreshBtn}>
            <Text style={styles.refreshTxt}>{getDic('Refresh')}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: '#999',
  },
  refreshBtn: {
    marginTop: 30,
    padding: 10,
    borderWidth: 1,
    borderColor: '#999',
  },
  refreshTxt: {
    fontWeight: '700',
    color: '#999',
  },
});

export default NetworkError;
