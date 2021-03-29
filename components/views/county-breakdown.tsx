import React, {FC} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {startOfDay, sub, isBefore, format} from 'date-fns';

import {Heading} from '../atoms/heading';
import {ArrowIcon} from '../atoms/arrow-icon';

import {useApplication} from '../../providers/context';
import {getDateLocaleOptions} from '../../services/i18n/date';
import {numberToText} from '../../services/i18n/common';
import {useDataRefresh} from '../../hooks/data-refresh';

import {colors} from '../../constants/colors';
import {shadows, text} from '../../theme';
import Layouts from '../../theme/layouts';
import {DataByDate} from '../../services/api';
import {StackScreenProps} from '@react-navigation/stack';

function getCountyStats(data: DataByDate): readonly [number, number] {
  const [lastTimestamp, lastStat] = data[data.length - 1];

  const lastDate = startOfDay(new Date(lastTimestamp));

  const twoWeeksAgo = sub(lastDate, {weeks: 2});
  const twoWeeksStat = data.reduce(
    (total: number, [date, stat]: [date: Date | string, stat: any]) => {
      if (isBefore(new Date(date), twoWeeksAgo)) {
        return total;
      }
      return total + stat;
    },
    0
  );

  return [lastStat, twoWeeksStat];
}

export const CountyBreakdown: FC<StackScreenProps<any>> = ({navigation}) => {
  const {i18n, t} = useTranslation();
  const dateLocale = getDateLocaleOptions(i18n);
  const refresh = useDataRefresh();

  const app = useApplication();

  const handlePress = (countyName: string) =>
    navigation.navigate('chartByCounty', {countyName});

  const countiesData = app.data?.counties;
  const sampleCountyData =
    countiesData && countiesData.length > 0 && countiesData[0].dailyCases;
  const sourceDate = sampleCountyData
    ? format(
        new Date(sampleCountyData[sampleCountyData.length - 1][0]),
        'do MMM',
        dateLocale
      )
    : '';

  return (
    <Layouts.Scrollable refresh={refresh}>
      <Heading
        accessibilityFocus
        accessibilityRefocus
        text={t('casesByCounty:title')}
      />
      {app.data && app.data.counties !== null && (
        <View style={styles.card}>
          <View style={[styles.columnHeadingLine, styles.line]}>
            <View style={styles.textColumn} />
            <View accessible style={styles.numberColumn}>
              <Text
                maxFontSizeMultiplier={1.1}
                style={[styles.columnHeading, {color: colors.lighterText}]}>
                {t('casesByCounty:casesDay')}
              </Text>
              <Text
                maxFontSizeMultiplier={1.1}
                style={[styles.columnHeading, {color: colors.lighterText}]}>
                {sourceDate}
              </Text>
            </View>
            <View accessible style={styles.numberColumn}>
              <Text
                maxFontSizeMultiplier={1.1}
                style={[styles.columnHeading, {color: colors.lighterText}]}>
                {t('casesByCounty:casesWeeks:first')}
              </Text>
              <Text
                maxFontSizeMultiplier={1.1}
                style={[styles.columnHeading, {color: colors.lighterText}]}>
                {t('casesByCounty:casesWeeks:second')}
              </Text>
            </View>
            <View style={styles.iconColumn} />
          </View>
          {countiesData &&
            countiesData.map(({county, dailyCases}, index) => {
              if (!dailyCases || county === undefined) {
                return null;
              }
              const [lastStat, twoWeeksStat] = getCountyStats(dailyCases);
              const a11yLabel = t('casesByCounty:summary', {
                county,
                lastStat,
                date: sourceDate,
                twoWeeksStat
              });
              const a11yHint = t('casesByCounty:summaryHint', {
                county
              });
              const isLast = countiesData && index === countiesData.length - 1;
              return (
                <TouchableOpacity
                  key={`county-${county}`}
                  onPress={() => handlePress(county)}
                  activeOpacity={0.8}
                  accessibilityRole="link"
                  accessibilityLabel={a11yLabel}
                  accessibilityHint={a11yHint}>
                  <View style={[styles.line, isLast && styles.lastLine]}>
                    <View style={styles.textColumn}>
                      <Text
                        maxFontSizeMultiplier={1.4}
                        numberOfLines={1} // Truncate long names on small screens: tap shows full name
                        style={styles.rowHeading}>
                        {county}
                      </Text>
                    </View>
                    <View style={styles.numberColumn}>
                      <View style={styles.numberWrapper}>
                        <Text maxFontSizeMultiplier={1.4} style={styles.number}>
                          {numberToText(lastStat)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.numberColumn}>
                      <View style={styles.numberWrapper}>
                        <Text maxFontSizeMultiplier={1.4} style={styles.number}>
                          {numberToText(twoWeeksStat)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.iconColumn}>
                      <ArrowIcon />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      )}
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentContainerStyle: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48
  },
  card: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 12,
    ...shadows.default
  },
  line: {
    flex: 2,
    height: 52,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.dot
  },
  lastLine: {
    borderBottomWidth: 0
  },
  textColumn: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 4
  },
  numberColumn: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 2
  },
  numberWrapper: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  number: {
    textAlign: 'center',
    flex: 1,
    width: '100%',
    ...text.defaultBold
  },
  iconColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  columnHeading: {
    ...text.smallBold,
    textAlign: 'center',
    marginVertical: 0,
    marginHorizontal: 4,
    lineHeight: 18
  },
  rowHeading: {
    ...text.defaultBold,
    lineHeight: 18
  },
  columnHeadingLine: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headingSpacer: {
    flex: 4
  }
});
