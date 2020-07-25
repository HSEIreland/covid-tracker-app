import React, {FC} from 'react';
import {StyleSheet, View, ViewStyle, Text} from 'react-native';

import {colors} from '../../constants/colors';
import {shadows, text} from '../../theme';

interface TransmissionChartProps {
  style?: ViewStyle;
  title?: string;
  data: [string, number][];
}

export const TransmissionChart: FC<TransmissionChartProps> = ({
  style,
  title,
  data
}) => {
  const maxValue = Math.max(...data.map(([_, y]) => y));

  return (
    <View style={[styles.container, style]}>
      {title && (
        <Text maxFontSizeMultiplier={2} style={styles.title}>
          {title}
        </Text>
      )}
      {data.map(([label, value], idx) => (
        <View
          key={`ctx-${idx}`}
          style={styles.chart}
          accessible
          accessibilityRole="text">
          <View style={styles.leftCol}>
            <View key={`value-${idx}`} style={styles.valueWrapper}>
              <Text style={text.xxlargeBlack}>{value}</Text>
              <Text style={text.xlargeBlack}>%</Text>
            </View>
          </View>
          <View style={styles.rightCol}>
            <View key={`progress-${idx}`}>
              <View
                style={[
                  styles.progress,
                  {width: `${Math.round((value * 100) / maxValue)}%`}
                ]}
              />
              <Text style={styles.label}>{label}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...shadows.default,
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16
  },
  title: {
    ...text.defaultBold,
    textAlign: 'center'
  },
  chart: {
    flexDirection: 'row',
    marginTop: 8,
    width: '100%'
  },
  leftCol: {
    justifyContent: 'space-around',
    paddingVertical: 4,
    width: 70
  },
  rightCol: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: colors.dot
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 16,
    justifyContent: 'flex-end'
  },
  progress: {
    width: '100%',
    minHeight: 16,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: colors.darkerYellow
  },
  label: {
    ...text.smallBold,
    color: colors.text,
    paddingLeft: 4
  }
});
