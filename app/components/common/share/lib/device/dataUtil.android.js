import SharedPreferences from 'react-native-shared-preferences';

export const getData = async key => {
  return await new Promise((resolve, reject) => {
    try {
      SharedPreferences.getItem(key, value => {
        resolve(value);
      });
    } catch (e) {
      reject(e);
    }
  });
};
