import React, {FC} from 'react';
import {ViewStyle, StyleProp, StyleSheet} from 'react-native';
import {Rect, G} from 'react-native-svg';
import {BarChart, Grid} from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import {colors} from '../../constants/colors';

interface BarChartContentProps {
  chartData: number[];
  contentInset: {top: number; bottom: number};
  primaryColor?: string;
  backgroundColor?: string;
  cornerRoundness?: number;
  gapPercent?: number;
  style?: StyleProp<ViewStyle>;
  yMax?: number;
}

interface BarChildProps {
  x: (index: number) => number;
  y: (value: number) => number;
  bandwidth: number; // width of bar
  data: number[];
}

export const BarChartContent: FC<BarChartContentProps> = ({
  chartData,
  contentInset,
  primaryColor = colors.orange,
  backgroundColor = colors.white,
  cornerRoundness = 4,
  gapPercent = 25,
  style,
  yMax
}) => {
  const RoundedBarToppers: FC<BarChildProps> = (props) => {
    const {x, y, bandwidth, data} = props;
    return (
      <G>
        {data.map((value, index) => (
          <Rect
            x={x(index)}
            y={y(value) - cornerRoundness}
            rx={cornerRoundness}
            ry={cornerRoundness}
            width={bandwidth}
            height={cornerRoundness * 2} // Height of the Rect
            fill={primaryColor}
            key={`bar-${index}`}
          />
        ))}
      </G>
    );
  };

  // Covers ends of bars hanging below line due to corner roundnesss
  const XAxisTrim: FC<BarChildProps> = (props) => {
    if (!props) {
      return null;
    }
    const {x, y, bandwidth, data} = props;
    return (
      <Rect
        x={x && x(0)}
        y={y && y(0) - cornerRoundness}
        width={x(data?.length - 1) + bandwidth} // Full width of x axis
        height={cornerRoundness + 2}
        fill={backgroundColor}
      />
    );
  };

  return (
    <BarChart
      style={[style, styles.barChart]}
      data={chartData}
      gridMin={0}
      numberOfTicks={3}
      spacingInner={gapPercent / 100}
      spacingOuter={gapPercent / 100}
      contentInset={{
        top: contentInset.top + cornerRoundness,
        bottom: contentInset.bottom - cornerRoundness
      }}
      curve={shape.curveMonotoneX}
      yMax={yMax}
      svg={{
        fill: primaryColor
      }}>
      <Grid
        svg={{
          y: 0 - cornerRoundness,
          strokeWidth: 1,
          stroke: colors.dot,
          strokeDasharray: [5, 3],
          strokeDashoffset: 0
        }}
      />
      {/* @ts-ignore: gets BarChildProps from BarChart parent */}
      <RoundedBarToppers />
      {/* @ts-ignore: gets BarChildProps from BarChart parent */}
      <XAxisTrim />
    </BarChart>
  );
};

const styles = StyleSheet.create({
  barChart: {}
});
