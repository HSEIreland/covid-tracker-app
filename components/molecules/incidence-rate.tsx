import React, {FC} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import {useTranslation} from 'react-i18next';
import {format, subDays} from 'date-fns';

import {getDateLocaleOptions} from '../../services/i18n/date';
import {alignWithLanguage} from '../../services/i18n/common';

import {Card} from '../atoms/card';
import {Heading} from '../atoms/heading';

import {text} from '../../theme';
import {colors} from '../../constants/colors';

const dateFmt = 'do MMMM';

interface CovidStatsProps {
  rate?: number;
  date?: Date;
}

export const IncidenceRate: FC<CovidStatsProps> = ({
  rate = 0,
  date = new Date()
}) => {
  const {t, i18n} = useTranslation();
  const dateLocale = getDateLocaleOptions(i18n);

  const from = format(subDays(date, 14), dateFmt, dateLocale);
  const to = format(date, dateFmt, dateLocale);
  const incidenceRate = alignWithLanguage(
    new Intl.NumberFormat('en-IE').format(rate)
  );

  return (
    <>
      <Heading text={t('incidenceRate:title')} />
      <Card>
        <View
          style={styles.row}
          accessible
          accessibilityRole="text"
          accessibilityLabel={t('incidenceRate:a11yLabel', {
            from,
            to,
            rate: incidenceRate
          })}>
          <View style={styles.barChartIcon}>
            <Image
              accessibilityIgnoresInvertColors
              width={28}
              height={28}
              source={require('../../assets/images/bar-chart/analytics.png')}
            />
          </View>
          <View style={styles.col}>
            <Text style={text.xxlargeBlack}>{incidenceRate}</Text>
            <Text style={styles.text}>{t('incidenceRate:perPopulation')}</Text>
            <Text style={styles.text}>
              {t('incidenceRate:dateInterval', {from, to})}
            </Text>
          </View>
        </View>
      </Card>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  barChartIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20
  },
  col: {
    flex: 1,
    flexDirection: 'column'
  },
  text: {
    flex: 1,
    ...text.smallBold,
    color: colors.lighterText
  }
});
