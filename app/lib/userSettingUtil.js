import AsyncStorage from '@react-native-community/async-storage';

export const getJobInfo = async() => {
    const jobInfo = await AsyncStorage.getItem('covi_user_jobInfo')
    
    return jobInfo == 'NN' ? '' : jobInfo; //직무없음 ->빈값으로 보내도록(사이드이팩트방지)
};