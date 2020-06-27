import React, {useState, useCallback} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Heading} from '../atoms/heading';

import {useApplication} from '../../providers/context';

import {colors} from '../../constants/colors';
import {shadows, text} from '../../theme';
import Layouts from '../../theme/layouts';
import {useIsFocused, useFocusEffect} from '@react-navigation/native';

export const CountyBreakdown = () => {
  const {t} = useTranslation();
  const app = useApplication();
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const {loadAppData} = app;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAppData().then(() => setRefreshing(false));
  }, [loadAppData]);

  useFocusEffect(
    React.useCallback(() => {
      if (!isFocused) {
        return;
      }

      onRefresh();
    }, [isFocused, onRefresh])
  );

  const total = app.data
    ? app.data.counties.reduce((acc, {cases}) => acc + cases, 0)
    : 0;
  const max = app.data
    ? Math.max(...app.data.counties.map(({cases}) => cases))
    : 0;

  return (
    <Layouts.Scrollable refresh={{refreshing, onRefresh}}>
      <Heading accessibilityFocus text={t('casesByCounty:title')} />
      {app.data && app.data.counties !== null && (
        <View style={styles.card}>
          {app.data.counties.map(({county, cases}, index) => {
            const percentage = Math.round((cases * 100) / total);
            const widthPercentage = Math.round((cases * 100) / max);
            return (
              <View
                key={`county-${county}`}
                style={[
                  styles.line,
                  index === (app.data && app.data.counties.length - 1) &&
                    styles.lastLine
                ]}>
                <View style={styles.left}>
                  <Text maxFontSizeMultiplier={1.5} style={text.largeBold}>{county}</Text>
                  {cases <= 5 && <Text style={text.largeBold}>&le;5</Text>}
                  {cases > 5 && (
                    <Text maxFontSizeMultiplier={1.5} style={text.largeBold}>
                      {new Intl.NumberFormat('en-IE').format(cases)}
                    </Text>
                  )}
                </View>
                <View style={styles.right}>
                  <View style={styles.progressWrapper}>
                    <View
                      style={[styles.progress, {width: `${widthPercentage}%`}]}
                    />
                  </View>
                  <Text maxFontSizeMultiplier={1} style={[text.largeBold, styles.textPercentage]}>
                    {percentage === 0 ? '<1' : percentage}%
                  </Text>
                </View>
              </View>
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
    paddingHorizontal: 16,
    ...shadows.default
  },
  line: {
    flex: 2,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.dot
  },
  lastLine: {
    borderBottomWidth: 0
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 4
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 4
  },
  textPercentage: {
    width: 46,
    height: 32,
    lineHeight: 32,
    textAlign: 'right',
    backgroundColor: 'rgb(249, 249, 249)',
    paddingRight: 4
  },
  progressWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center'
  },
  progress: {
    width: '100%',
    minWidth: 4,
    height: 32,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    backgroundColor: colors.darkerYellow
  }
});
