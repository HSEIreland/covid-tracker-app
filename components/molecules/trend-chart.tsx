import React, {FC} from 'react';
import {
  StyleSheet,
  View,
  Text,
  StyleProp,
  TextStyle,
  I18nManager
} from 'react-native';
import {differenceInDays, format, sub, startOfDay} from 'date-fns';
import {TFunction} from 'i18next';
import {YAxis} from 'react-native-svg-charts';
import {useTranslation} from 'react-i18next';

import {colors} from '../../constants/colors';
import {text} from '../../theme';
import {DataByDate} from '../../services/api';
import {numberToText} from '../../services/i18n/common';
import {getDateLocaleOptions} from '../../services/i18n/date';

import {AreaChartContent} from '../atoms/area-chart-content';
import {BarChartContent} from '../atoms/bar-chart-content';

export interface TrendChartProps {
  a11yLabelKey?: string;
  a11yHintKey?: string;
  data: DataByDate;
  intervalsCount?: number;
  primaryColor?: string;
  backgroundColor?: string;
  chartType?: 'area' | 'bar';
}

const rtlReverse = (data: any[]) =>
  I18nManager.isRTL ? [...data].reverse() : data;

export function formatLabel(value: number) {
  if (value > 1000000) {
    const millions = parseFloat((value / 1000000).toFixed(2));
    return `${millions}m`;
  }

  if (value > 1000) {
    const thousands = parseFloat((value / 1000).toFixed(2));
    return `${thousands}k`;
  }

  return value;
}

export function getLabelHint(t: TFunction, value: number): string {
  if (value > 1000000) {
    const millions = parseFloat((value / 1000000).toFixed(2));
    return `${millions} ${t('common:millions')}`;
  }

  if (value > 1000) {
    const thousands = parseFloat((value / 1000).toFixed(2));
    return `${thousands} ${t('common:thousands')}`;
  }

  return value.toString();
}

function getXAxisDates(axisData: Date[], intervalsCount: number) {
  const lastDay = axisData[axisData.length - 1];
  const totalDays =
    differenceInDays(startOfDay(lastDay), startOfDay(axisData[0])) + 1;

  const interval = Math.ceil(totalDays / intervalsCount);
  const axisDates = Array(intervalsCount)
    .fill('')
    .map((_, index) => {
      const daysBeforeLast = interval * (intervalsCount - index - 1);
      const date = sub(lastDay, {
        days: daysBeforeLast
      });
      return date;
    });
  return axisDates;
}

export const TrendChart: FC<TrendChartProps> = ({
  data,
  a11yLabelKey,
  a11yHintKey,
  intervalsCount = 5,
  primaryColor = colors.orange,
  backgroundColor = colors.white,
  chartType = 'area'
}) => {
  const {i18n, t} = useTranslation();
  const dateLocale = getDateLocaleOptions(i18n);

  const axisData: Date[] = data.map(([x, _]) => new Date(x));
  const chartData: number[] = data.map(([_, y]) => y);
  const xAxisDates = getXAxisDates(axisData, intervalsCount);

  // Give y axis label text enough space to not get cropped
  const contentInset = {top: 6, bottom: 6};

  const yesterday = chartData[chartData.length - 1];
  const maxValue = chartData.reduce((max, value) => Math.max(max, value), 0);
  const totalValue = chartData.reduce((total, value) => total + value, 0);
  const yMax = maxValue < 5 ? 5 : undefined;

  const total = numberToText(totalValue);
  const max = numberToText(maxValue);

  const label =
    a11yLabelKey &&
    t(a11yLabelKey, {
      yesterday,
      total,
      max
    });
  const hint =
    a11yHintKey &&
    t(a11yHintKey, {
      yesterday,
      total,
      max
    });

  const displayData = rtlReverse(chartData);

  return (
    <>
      <View
        style={styles.chartingRow}
        accessible
        accessibilityLabel={label}
        accessibilityHint={hint}>
        <YAxis
          style={styles.yAxis}
          data={chartData}
          numberOfTicks={3}
          contentInset={contentInset}
          svg={{fontSize: 12, fill: colors.text}}
          formatLabel={formatLabel}
          max={yMax}
          min={0}
        />
        <View accessibilityIgnoresInvertColors style={styles.chartingCol}>
          {(chartType === 'area' && (
            <AreaChartContent
              chartData={displayData}
              contentInset={contentInset}
              style={styles.chart}
              primaryColor={primaryColor}
              backgroundColor={backgroundColor}
              yMax={yMax}
            />
          )) ||
            (chartType === 'bar' && (
              <BarChartContent
                chartData={displayData}
                contentInset={contentInset}
                style={styles.chart}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
                yMax={yMax}
              />
            ))}
          <View style={styles.xAxis}>
            {xAxisDates.map((date, index) => {
              const dayNum = format(date, 'd', dateLocale);
              const month = format(date, 'MMM', dateLocale);

              const previousDate = index
                ? xAxisDates[index - 1]
                : sub(new Date(data[0][0]), {days: 1});

              const daysWidth = differenceInDays(
                startOfDay(date),
                startOfDay(previousDate)
              );

              const dateStyles = [
                styles.date,
                {textAlign: chartType === 'area' ? 'right' : 'center'}
              ] as StyleProp<TextStyle>;

              return (
                <View
                  key={`axis-${dayNum}-${month}`}
                  style={[styles.xAxisPositioner, {flex: daysWidth}]}>
                  <View style={styles.xAxisLabel}>
                    <Text
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.5}
                      style={dateStyles}>
                      {dayNum}
                    </Text>
                    <Text
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.5}
                      style={dateStyles}>
                      {month}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  chartingRow: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.white
  },
  yAxis: {
    height: 144,
    paddingRight: 4
  },
  chartingCol: {
    flex: 1,
    flexDirection: 'column'
  },
  chart: {
    flex: 1,
    height: 144
  },
  xAxis: {
    height: 36,
    marginTop: -6,
    paddingTop: 4,
    paddingHorizontal: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: colors.dot
  },
  xAxisPositioner: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  xAxisLabel: {},
  date: {
    ...text.xsmallBold
  },
  leftAlign: {
    textAlign: 'left'
  },
  rightAlign: {
    textAlign: 'right'
  }
});
