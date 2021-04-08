import userDefaults from 'react-native-user-defaults';

export const getData = async key => {
  return await userDefaults.get(key, 'group.eumtalk');
};
