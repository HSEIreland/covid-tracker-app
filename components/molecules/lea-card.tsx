import React, {FC} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {alignWithLanguage} from '../../services/i18n/common';

import {Spacing} from '../atoms/spacing';

import {colors} from '../../constants/colors';
import {shadows, text} from '../../theme';

interface CallCardProps {
  area: string;
  cases: number;
  rate: number;
  population: number;
}

export const LeaCard: FC<CallCardProps> = ({area, cases, rate, population}) => {
  const {t} = useTranslation();

  // Remove number suffix like " LEA-7"
  const areaName = area.replace(/ LEA-\d+$/, '');

  const a11yLabel = [
    area,
    `${t('lea:cases')}: ${new Intl.NumberFormat('en-IE').format(cases)}`,
    `${t('lea:rate')}: ${new Intl.NumberFormat('en-IE').format(rate)}`,
    `${t('lea:population')}: ${new Intl.NumberFormat('en-IE').format(
      population
    )}`
  ].join(',');

  return (
    <View accessibilityLabel={a11yLabel} style={styles.card}>
      <Text style={text.largeBlack}>{alignWithLanguage(areaName)}</Text>
      <Text style={text.smallBold}>{t('lea:lea')}</Text>
      <Spacing s={16} />
      <View style={styles.row}>
        <Text maxFontSizeMultiplier={2} style={styles.rowText}>
          {t('lea:cases')}
        </Text>
        <Text maxFontSizeMultiplier={2} style={text.largeBlack}>
          {new Intl.NumberFormat('en-IE').format(cases)}
        </Text>
      </View>
      <Spacing s={4} />
      <View style={styles.row}>
        <Text maxFontSizeMultiplier={2} style={styles.rowText}>
          {t('lea:rate')}
        </Text>
        <Text maxFontSizeMultiplier={2} style={text.largeBlack}>
          {new Intl.NumberFormat('en-IE').format(rate)}
        </Text>
      </View>
      <Spacing s={4} />
      <View style={[styles.row, styles.rowLast]}>
        <Text maxFontSizeMultiplier={2} style={styles.rowText}>
          {t('lea:population')}
        </Text>
        <Text maxFontSizeMultiplier={2} style={text.largeBlack}>
          {new Intl.NumberFormat('en-IE').format(population)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    ...shadows.default,
    padding: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder
  },
  rowLast: {
    borderBottomColor: 'transparent',
    paddingBottom: 6
  },
  rowText: {
    flex: 1,
    marginRight: 20,
    ...text.defaultBold
  }
});
