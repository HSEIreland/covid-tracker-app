import React, {FC} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';

import {StatsData} from '../../services/api';
import {getDateLocaleOptions} from '../../services/i18n/date';

import {Card} from '../atoms/card';

import {scale, text} from '../../theme';
import {colors} from '../../constants/colors';

interface VaccineHeadlineProps {
  vaccineStats: StatsData['vaccine'];
  onPress?: () => void;
}

const scaleCapLarge = {maxFontSizeMultiplier: 1};
const scaleCapSmall = {maxFontSizeMultiplier: 1.1};

const dateFormat = 'do MMMM';

export const VaccineHeadlineCard: FC<VaccineHeadlineProps> = ({
  vaccineStats,
  onPress
}) => {
  const {t, i18n} = useTranslation();
  const dateLocale = getDateLocaleOptions(i18n);

  const {first, second, dateUpdated} = vaccineStats?.overallDoses || {};
  const hasCompleteData = [first, second].every((n) => typeof n === 'number');
  if (!hasCompleteData) {
    return null;
  }
  const date = dateUpdated && new Date(dateUpdated);
  const hasValidDate = date && !isNaN(date.getTime());
  const formattedDate =
    hasValidDate && date ? format(date, dateFormat, dateLocale) : '';

  return (
    <Card padding={{v: 24, r: 4, h: onPress ? 8 : 4}} onPress={onPress}>
      <View style={styles.iconRow}>
        <Image
          accessibilityIgnoresInvertColors
          style={styles.iconSize}
          {...styles.iconSize}
          source={require('../../assets/images/vaccine/bubble.png')}
        />
      </View>
      <View style={styles.container}>
        <View style={[styles.half]}>
          <View style={styles.statText} accessible={!onPress}>
            <Text style={styles.statFigure} {...scaleCapLarge}>
              {new Intl.NumberFormat('en-IE').format(first!)}
            </Text>
            <Text style={styles.statLabel} {...scaleCapSmall}>
              {t('vaccineStats:headline:first')}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={[styles.half]}>
          <View style={styles.statText} accessible={!onPress}>
            <Text style={styles.statFigure} {...scaleCapLarge}>
              {new Intl.NumberFormat('en-IE').format(second!)}
            </Text>
            <Text style={styles.statLabel} {...scaleCapSmall}>
              {t('vaccineStats:headline:second')}
            </Text>
          </View>
        </View>
      </View>
      {hasValidDate && (
        <View style={styles.date}>
          <Text style={styles.dateText}>
            {t('vaccineStats:headline:lastUpdated', {
              date: formattedDate
            })}
          </Text>
        </View>
      )}
    </Card>
  );
};
const styles = StyleSheet.create({
  iconRow: {
    width: 58,
    height: 56,
    left: '50%',
    marginLeft: -29,
    marginBottom: 24
  },
  iconSize: {
    width: 59,
    height: 59
  },
  container: {
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  half: {
    flex: 1,
    flexGrow: 1
  },
  divider: {
    borderRightColor: colors.grayBorder,
    borderRightWidth: 1
  },
  statText: {
    padding: 0
  },
  statFigure: {
    ...text.xxlargeBlack,
    fontSize: scale(28),
    marginTop: -8,
    marginBottom: 4,
    textAlign: 'center'
  },
  statLabel: {
    ...text.defaultBold,
    color: colors.lighterText,
    textAlign: 'center'
  },
  date: {
    paddingHorizontal: 16,
    marginTop: 24
  },
  dateText: {
    textAlign: 'center',
    ...text.smallBold,
    color: colors.lighterText
  }
});
