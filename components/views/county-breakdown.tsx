import React, {useState, useCallback, FC, useEffect} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {startOfDay, sub, isBefore, format} from 'date-fns';

import {Heading} from '../atoms/heading';

import {useApplication} from '../../providers/context';

import {colors} from '../../constants/colors';
import {shadows, text} from '../../theme';
import Layouts from '../../theme/layouts';
import {DataByDate} from 'services/api';
import {StackScreenProps} from '@react-navigation/stack';

function getCountyStats(data: DataByDate): readonly [number, number] {
  const [lastTimestamp, lastStat] = data[data.length - 1];

  const lastDate = startOfDay(new Date(lastTimestamp));

  const twoWeeksAgo = sub(lastDate, {weeks: 2});
  const twoWeeksStat = data.reduce(
    (total: number, [date, stat]: [date: string, stat: any]) => {
      if (isBefore(new Date(date), twoWeeksAgo)) {
        return total;
      }
      return total + stat;
    },
    0
  );

  return [lastStat, twoWeeksStat];
}

function numberToText(stat: any) {
  switch (typeof stat) {
    case 'number':
      return new Intl.NumberFormat('en-IE').format(stat);
    case 'string':
      return stat;
    default:
      return '';
  }
}

export const CountyBreakdown: FC<StackScreenProps<any>> = ({navigation}) => {
  const {t} = useTranslation();
  const app = useApplication();
  const [refreshing, setRefreshing] = useState(false);

  const {loadAppData} = app;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAppData().then(() => setRefreshing(false));
  }, [loadAppData]);

  useEffect(onRefresh, [onRefresh]);

  const handlePress = (countyName: string) =>
    navigation.navigate('chartByCounty', {countyName});

  const sampleCountyData = app.data?.counties[0].dailyCases;
  const sourceDate = sampleCountyData
    ? format(
        new Date(sampleCountyData[sampleCountyData.length - 1][0]),
        'do MMM'
      )
    : '';

  return (
    <Layouts.Scrollable refresh={{refreshing, onRefresh}}>
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
          {app.data.counties.map(({county, dailyCases}, index) => {
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
            return (
              <TouchableOpacity
                key={`county-${county}`}
                onPress={() => handlePress(county)}
                activeOpacity={0.8}
                accessibilityRole="link"
                accessibilityLabel={a11yLabel}
                accessibilityHint={a11yHint}>
                <View
                  style={[
                    styles.line,
                    index === (app.data && app.data.counties.length - 1) &&
                      styles.lastLine
                  ]}>
                  <View style={styles.textColumn}>
                    <Text maxFontSizeMultiplier={1.4} style={styles.rowHeading}>
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
                    <Image
                      accessibilityIgnoresInvertColors
                      style={styles.arrowIcon}
                      {...styles.arrowIcon}
                      source={require('../../assets/images/arrow-right/teal.png')}
                    />
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
    backgroundColor: '#FAFAFA'
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
  arrowIcon: {
    width: 24,
    height: 24
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
