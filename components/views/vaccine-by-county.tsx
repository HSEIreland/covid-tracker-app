import React, {FC} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableWithoutFeedback
} from 'react-native';
import {useTranslation} from 'react-i18next';

import {useApplication} from '../../providers/context';
import {useDataRefresh} from '../../hooks/data-refresh';
import {numberToText} from '../../services/i18n/common';

import {colors} from '../../constants/colors';
import {shadows, text} from '../../theme';
import Layouts from '../../theme/layouts';
import {MissingData} from '../templates/missing-data';
import {Loading} from './loading';

const TableRow: FC<{
  a11yLabel: string;
  isLast: boolean;
  county?: string;
  last7: string;
  total: string;
  col1Header: string;
  col2Header: string;
}> = ({a11yLabel, isLast, county, last7, total, col1Header, col2Header}) => {
  const {accessibility} = useApplication();
  const {t} = useTranslation();

  // Show untruncated summary on tap, for large text / small screens etc
  const showSummary =
    accessibility.screenReaderEnabled || !county
      ? undefined
      : () =>
          Alert.alert(
            county,
            `${t('vaccineByCounty:heading')}

${col1Header}: ${last7}

${col2Header}: ${total}`
          );

  return (
    <TouchableWithoutFeedback onPress={showSummary}>
      <View accessible accessibilityLabel={a11yLabel}>
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[styles.line, isLast && styles.lastLine]}>
          <View style={styles.textColumn}>
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.4}
              style={styles.rowHeading}>
              {county}
            </Text>
          </View>
          <View style={styles.numberColumn}>
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.4}
              style={styles.number}>
              {numberToText(last7)}
            </Text>
          </View>
          <View style={styles.numberColumn}>
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.4}
              style={styles.number}>
              {numberToText(total)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export const VaccineByCounty: FC<{}> = () => {
  const {t} = useTranslation();
  const app = useApplication();
  const refresh = useDataRefresh();

  const heading = t('vaccineByCounty:heading');

  if (app.loading) {
    return <Loading />;
  }
  const countiesData = app.data?.vaccine?.countyBreakdown;
  if (!countiesData) {
    return <MissingData heading={heading} refresh={refresh} />;
  }

  const col1Header = t('vaccineByCounty:previous');
  const col2Header = t('vaccineByCounty:total');

  return (
    <Layouts.Scrollable heading={heading} refresh={refresh}>
      <View style={styles.card}>
        <View
          style={[styles.line, styles.columnHeadingLine]}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden>
          <View style={styles.textColumn} />
          <View style={styles.numberColumn}>
            <Text
              maxFontSizeMultiplier={1.1}
              style={[styles.columnHeading, {color: colors.lighterText}]}>
              {col1Header}
            </Text>
          </View>
          <View style={styles.numberColumn}>
            <Text
              maxFontSizeMultiplier={1.1}
              style={[styles.columnHeading, {color: colors.lighterText}]}>
              {col2Header}
            </Text>
          </View>
        </View>
        {countiesData &&
          countiesData.map(({county, total, last7}, index) => {
            const a11yLabel = t('vaccineByCounty:summary', {
              county,
              total,
              last7
            });
            const isLast = countiesData && index === countiesData.length - 1;
            return (
              <TableRow
                a11yLabel={a11yLabel}
                county={county}
                last7={numberToText(last7)}
                total={numberToText(total)}
                isLast={isLast}
                col1Header={col1Header}
                col2Header={col2Header}
                key={county}
              />
            );
          })}
      </View>
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
    borderBottomColor: colors.grayBorder
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
    alignItems: 'flex-end',
    paddingHorizontal: 2
  },
  number: {
    textAlign: 'right',
    ...text.defaultBold
  },
  rowHeading: {
    ...text.defaultBold,
    lineHeight: 18
  },
  columnHeading: {
    ...text.smallBold,
    textAlign: 'right',
    textAlignVertical: 'bottom',
    marginVertical: 0,
    marginHorizontal: 4,
    lineHeight: 16,
    flex: 1
  },
  columnHeadingLine: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    paddingBottom: 12
  },
  headingSpacer: {
    flex: 4
  }
});
