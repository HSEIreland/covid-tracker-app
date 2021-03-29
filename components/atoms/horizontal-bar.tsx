import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';

import {colors} from '../../constants/colors';

interface HoriztonalBarProps {
  value: number;
  maxValue?: number;
  color?: string;
  backgroundColor?: string;
  reverse?: boolean;
  height?: number;
}

export const HoriztonalBar: React.FC<HoriztonalBarProps> = ({
  value,
  backgroundColor,
  maxValue = 100,
  color = colors.primary,
  reverse = false,
  height = 8
}) => {
  const percent = (value / maxValue) * 100;

  const justifyContent = reverse ? 'flex-end' : 'flex-start';
  const borderRadiusTop = reverse
    ? 'borderTopStartRadius'
    : 'borderTopEndRadius';
  const borderRadiusBottom = reverse
    ? 'borderBottomStartRadius'
    : 'borderBottomEndRadius';

  const containerStyles: ViewStyle = {
    justifyContent,
    height,
    backgroundColor
  };
  const barStyles: ViewStyle = {
    width: `${percent}%`,
    backgroundColor: color,
    height,
    [borderRadiusTop]: height / 2,
    [borderRadiusBottom]: height / 2
  };

  return (
    <View style={[styles.container, containerStyles]}>
      <View style={barStyles} accessibilityIgnoresInvertColors={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexGrow: 1,
    overflow: 'hidden'
  }
});
