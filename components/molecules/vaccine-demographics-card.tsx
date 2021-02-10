import React, {FC} from 'react';
import {StyleSheet, Text, View, PixelRatio} from 'react-native';
import {useTranslation} from 'react-i18next';

import {StatsData} from '../../services/api';

import {Card} from '../atoms/card';

import {text} from '../../theme';
import {colors} from '../../constants/colors';
import {HoriztonalBar} from '../atoms/horizontal-bar';
import Svg, {Line} from 'react-native-svg';

interface VaccineDemographicsProps {
  vaccineStats: StatsData['vaccine'];
}

// Dotted borders on one side don't work on android until this RN PR is released:
// https://github.com/facebook/react-native/pull/29099
const DottedLine = ({height}: {height: number}) => (
  <Svg width={2} height={height}>
    <Line
      x1={1}
      y1={0}
      x2={1}
      y2={height}
      strokeDasharray={[2, 2]}
      stroke={colors.dot}
    />
  </Svg>
);

const maxFontScale = 1.5;

export const VaccineDemographicsCard: FC<VaccineDemographicsProps> = ({
  vaccineStats
}) => {
  const {t} = useTranslation();

  const {ageBreakdown} = vaccineStats || {};
  if (!ageBreakdown || !ageBreakdown.length) {
    return null;
  }

  const maxValue = ageBreakdown.reduce(
    (max, {male, female}) => Math.max(max, male || 0, female || 0),
    0
  );

  const fontScale = Math.min(maxFontScale, PixelRatio.getFontScale());
  const rowHeight = 48 * fontScale;
  const headerHeight = 24 * fontScale;
  const fontScaleCap = {maxFontSizeMultiplier: maxFontScale};

  return (
    <Card padding={{v: 24, r: 4}}>
      <View
        style={styles.row}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden>
        <View style={[styles.col, styles.labels, {height: headerHeight}]}>
          <Text style={styles.columnHeader} {...fontScaleCap}>
            {t('vaccineStats:demographics:age')}
          </Text>
        </View>
        <View style={[styles.col, styles.charts, {height: headerHeight}]}>
          <Text
            style={[styles.columnHeader, styles.leftSide]}
            {...fontScaleCap}>
            {t('vaccineStats:demographics:male')}
          </Text>
        </View>
        <DottedLine height={headerHeight} />
        <View style={[styles.col, styles.charts, {height: headerHeight}]}>
          <Text style={styles.columnHeader} {...fontScaleCap}>
            {t('vaccineStats:demographics:female')}
          </Text>
        </View>
      </View>
      {ageBreakdown.map((stats) => {
        const a11yLabel = t('vaccineStats:demographics:summary', stats);
        const {title, male, female} = stats;
        return (
          <View accessible accessibilityLabel={a11yLabel} key={title}>
            <View
              style={styles.row}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden>
              <View style={[styles.col, styles.labels, {height: rowHeight}]}>
                <Text style={styles.rowHeader} {...fontScaleCap}>
                  {title}
                </Text>
              </View>
              <View style={[styles.col, styles.charts, {height: rowHeight}]}>
                {typeof male === 'number' && (
                  <View>
                    <HoriztonalBar
                      value={male}
                      maxValue={maxValue}
                      reverse
                      color={colors.cyan}
                    />
                    <Text
                      style={[styles.stat, styles.leftSide]}
                      {...fontScaleCap}>
                      {new Intl.NumberFormat('en-IE').format(male)}
                    </Text>
                  </View>
                )}
              </View>
              <DottedLine height={rowHeight} />
              <View
                style={[styles.col, styles.charts, {height: rowHeight}]}
                {...fontScaleCap}>
                {typeof female === 'number' && (
                  <View>
                    <HoriztonalBar
                      value={female}
                      maxValue={maxValue}
                      color={colors.pink}
                    />
                    <Text style={styles.stat} {...fontScaleCap}>
                      {new Intl.NumberFormat('en-IE').format(female)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </Card>
  );
};
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  col: {
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 4
  },
  charts: {
    flex: 2
  },
  labels: {
    flex: 1
  },
  leftSide: {
    textAlign: 'right'
  },
  columnHeader: {
    ...text.smallBold,
    color: colors.lighterText
  },
  rowHeader: {
    ...text.defaultBold
  },
  stat: {
    ...text.smallBold,
    color: colors.black
  }
});
