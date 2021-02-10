import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';

import {colors} from '../../constants/colors';

interface ProgressProps {
  value: number;
  width?: number;
  color?: string;
  backgroundColor?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  width,
  color,
  backgroundColor
}) => {
  const barStyles: ViewStyle = {
    marginLeft: `${value - 100}%`
  };

  if (color) {
    barStyles.backgroundColor = color;
  }

  return (
    <View
      style={[
        styles.progress,
        !!backgroundColor && {backgroundColor},
        !!width && {width}
      ]}>
      <View style={[styles.progressBar, barStyles]} />
    </View>
  );
};

const styles = StyleSheet.create({
  progress: {
    height: 10,
    justifyContent: 'flex-start',
    backgroundColor: `${colors.dot}6B`,
    borderRadius: 6.5,
    overflow: 'hidden'
  },
  progressBar: {
    width: '100%',
    flex: 1,
    borderRadius: 6.5,
    backgroundColor: colors.darkerYellow
  }
});
