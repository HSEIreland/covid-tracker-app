import React, {FC} from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {TrendArrow} from '../atoms/trend-arrow';
import {text} from '../../theme';
import {colors} from '../../constants/colors';

function getArrowType(
  number: number,
  previousNumber: number | undefined
): readonly ['up' | 'down' | null, ViewStyle | null, ViewStyle | null] {
  if (typeof previousNumber !== 'number' || number === previousNumber) {
    return [null, null, null];
  }
  return number > previousNumber
    ? ['up', styles.upArrow, styles.upStat]
    : ['down', styles.downArrow, styles.downStat];
}

interface CallOutStatProps {
  number: number;
  previousNumber?: number;
  label?: string;
}

export const CallOutStat: FC<CallOutStatProps> = ({
  number,
  previousNumber,
  label
}) => {
  const [arrowType, arrowStyle, statStyle] = getArrowType(
    number,
    previousNumber
  );
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.stat, statStyle]}>
          <Text style={styles.number} maxFontSizeMultiplier={1.5}>
            {new Intl.NumberFormat('en-IE').format(number)}
          </Text>
          <TrendArrow
            type={arrowType}
            style={[styles.arrow, arrowStyle]}
            size={16}
          />
        </View>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stat: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: 4
  },
  arrow: {
    position: 'absolute',
    right: -20
  },
  upStat: {
    justifyContent: 'flex-start'
  },
  downStat: {
    justifyContent: 'flex-end'
  },
  upArrow: {
    top: 12
  },
  downArrow: {
    bottom: 12
  },
  label: {
    ...text.default,
    textAlign: 'center',
    marginHorizontal: 24
  },
  number: {
    ...text.xxxlargeBlack,
    color: colors.lighterText
  }
});
