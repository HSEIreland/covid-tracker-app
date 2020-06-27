import React, {FC} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import {AreaChart, YAxis, Grid} from 'react-native-svg-charts';
import {differenceInDays, format} from 'date-fns';
import * as shape from 'd3-shape';

import {colors} from '../../constants/colors';
import {text} from '../../theme';
import {ConfirmedCasesData} from '../../services/api';

interface TrackerAreaChartProps {
  title?: string;
  label?: string;
  hint?: string;
  yesterday?: string;
  data: ConfirmedCasesData;
  intervalsCount?: number;
  gradientStart?: string;
  gradientEnd?: string;
  lineColor?: string;
}

function formatLabel(value: number) {
  if (value > 1000000) {
    const millions = parseFloat((value / 1000000).toFixed(1));
    return `${millions}m`;
  }

  if (value > 1000) {
    const thousands = parseFloat((value / 1000).toFixed(1));
    return `${thousands}k`;
  }

  return value;
}

export const TrackerAreaChart: FC<TrackerAreaChartProps> = ({
  title,
  data,
  label,
  hint,
  yesterday,
  intervalsCount = 5,
  gradientStart = colors.orange,
  gradientEnd = colors.white,
  lineColor = colors.orange
}) => {
  const axisData: Date[] = data.map(([x, _]) => new Date(x));
  const chartData: number[] = data.map(([_, y]) => y);

  const totalDays = differenceInDays(
    axisData[axisData.length - 1],
    axisData[0]
  );
  const interval = Math.floor(totalDays / intervalsCount);

  const visibleAxisData = Array.from(new Array(6), (_, i) => i).map(
    (i) => axisData[Math.min(i * interval, axisData.length - 1)]
  );

  const ChartLine = ({line}: {line?: string}) => (
    <Path key="line" d={line} stroke={lineColor} strokeWidth={3} fill="none" />
  );

  const Gradient = () => (
    <Defs key={'gradient'}>
      <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={gradientStart} />
        <Stop offset="100%" stopColor={gradientEnd} />
      </LinearGradient>
    </Defs>
  );

  const last = data[data.length - 1];
  const labelString = `${last[1]} ${yesterday}`;

  return (
    <>
      {title && <Text style={styles.title}>{title}</Text>}
      <View
        style={styles.chartingRow}
        accessible
        accessibilityHint={hint}
        accessibilityLabel={labelString}>
        <YAxis
          style={styles.yAxis}
          data={chartData}
          numberOfTicks={3}
          contentInset={{top: 16, bottom: 4}}
          svg={{fontSize: 12, fill: colors.text}}
          formatLabel={formatLabel}
        />
        <View style={styles.chartingCol}>
          <AreaChart
            style={styles.chart}
            data={chartData}
            numberOfTicks={3}
            contentInset={{top: 16, bottom: 4}}
            curve={shape.curveNatural}
            svg={{strokeWidth: 1, stroke: colors.gray, fill: 'url(#gradient)'}}>
            <Grid
              svg={{
                strokeWidth: 1,
                stroke: colors.dot,
                strokeDasharray: [5, 3],
                strokeDashoffset: 0
              }}
            />
            <ChartLine />
            <Gradient />
          </AreaChart>
          <View style={styles.xAxis}>
            {axisData.map((date, index) => {
              const visibleIndex = visibleAxisData.indexOf(date);
              if (visibleIndex === -1) {
                return null;
              }

              const prevDate =
                visibleIndex > 0 && visibleAxisData[visibleIndex - 1];

              const month = format(new Date(date), 'MMM');
              const prevMonth = prevDate && format(new Date(prevDate), 'MMM');

              const monthText =
                prevMonth !== month || index === axisData.length - 1
                  ? `\n${month}`
                  : '';

              return (
                <Text
                  key={`axis-${visibleIndex}`}
                  style={[
                    styles.date,
                    index === 0 && styles.leftAlign,
                    index === axisData.length - 1 && styles.rightAlign
                  ]}>
                  {`${date.getDate()}${monthText}`}
                </Text>
              );
            })}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    ...text.defaultBold,
    textAlign: 'center'
  },
  chartingRow: {
    flex: 1,
    height: 188,
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
    height: 144,
    borderBottomWidth: 1,
    borderBottomColor: colors.dot
  },
  xAxis: {
    height: 36,
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  date: {
    ...text.xsmallBold,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  leftAlign: {
    textAlign: 'left'
  },
  rightAlign: {
    textAlign: 'right'
  }
});
