import React, {FC} from 'react';
import {StyleSheet, View, ViewStyle, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Spacing} from '../atoms/spacing';
import {Heading} from '../atoms/heading';
import {Card} from '../atoms/card';

import {text} from '../../theme';
import {colors} from '../../constants/colors';

interface Stats {
  admissions: number;
  discharges: number;
  confirmed: number;
}

interface CovidStatsProps {
  style?: ViewStyle;
  hospital: Stats;
  icu: Stats;
  tests: {
    completed: number;
    positive: number;
  };
}

export const CovidStats: FC<CovidStatsProps> = ({
  style,
  hospital,
  icu,
  tests
}) => {
  const {t} = useTranslation();

  return (
    <View style={[styles.container, style]}>
      <Heading text={t('stats:last24Hours:title')} />
      <Card padding={{v: 8, h: 16, r: 24}}>
        <View accessible style={styles.row}>
          <Text style={styles.label}>
            {t('stats:last24Hours:hospital:admissions')}
          </Text>
          <Text style={text.largeBlack}>
            {new Intl.NumberFormat('en-IE').format(hospital?.admissions)}
          </Text>
        </View>
        <View accessible style={styles.row}>
          <Text style={styles.label}>
            {t('stats:last24Hours:hospital:discharges')}
          </Text>
          <Text style={text.largeBlack}>
            {new Intl.NumberFormat('en-IE').format(hospital?.discharges)}
          </Text>
        </View>
        <View accessible style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>
            {t('stats:last24Hours:hospital:confrmed')}
          </Text>
          <Text style={text.largeBlack}>
            {new Intl.NumberFormat('en-IE').format(hospital?.confirmed)}
          </Text>
        </View>
      </Card>
      <Spacing s={16} />
      <Card padding={{v: 8, h: 16, r: 24}}>
        <View accessible style={styles.row}>
          <Text style={styles.label}>
            {t('stats:last24Hours:icu:admissions')}
          </Text>
          <Text style={text.largeBlack}>
            {new Intl.NumberFormat('en-IE').format(icu?.admissions)}
          </Text>
        </View>
        <View accessible style={styles.row}>
          <Text style={styles.label}>
            {t('stats:last24Hours:icu:discharges')}
          </Text>
          <Text style={text.largeBlack}>
            {new Intl.NumberFormat('en-IE').format(icu?.discharges)}
          </Text>
        </View>
        <View accessible style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>
            {t('stats:last24Hours:icu:confrmed')}
          </Text>
          <Text style={text.largeBlack}>
            {new Intl.NumberFormat('en-IE').format(icu?.confirmed)}
          </Text>
        </View>
      </Card>
      <Spacing s={16} />
      <Heading text={t('stats:last7days:title')} />
      <Card padding={{v: 8, h: 16, r: 24}}>
        <View accessible style={styles.row}>
          <Text style={styles.label}>{t('stats:last7days:tests')}</Text>
          <Text style={text.largeBlack}>
            {new Intl.NumberFormat('en-IE').format(tests?.completed)}
          </Text>
        </View>
        <View accessible style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>{t('stats:last7days:rate')}</Text>
          <Text style={text.largeBlack}>{tests?.positive}%</Text>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
    flex: 1
  },
  rowLast: {
    borderBottomWidth: 0,
    flex: 1
  },
  label: {
    flex: 1,
    ...text.defaultBold
  }
});
