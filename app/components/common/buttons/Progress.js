import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

const getPercent = (load, total) => {
  return Math.floor((load / total) * 100);
};

const Progress = ({ load, total, handleFinish }) => {
  const { colors } = useTheme();
  const percent = useMemo(() => getPercent(load, total), [load, total]);

  useEffect(() => {
    if (load == total) {
      handleFinish();
    }
  }, [load]);

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressBox}>
        <View
          style={{
            ...styles.progress,
            width: load == total ? '100%' : `${percent}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressWrap: { flex: 1 },
  progressBox: {
    flex: 1,
    height: 5,
    borderColor: '#d9d9d9',
    borderWidth: 1,
    borderRadius: 3,
  },
  progress: {
    height: '100%',
  },
});

export default React.memo(Progress);
