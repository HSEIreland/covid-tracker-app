import React, {FC} from 'react';
import {ViewStyle, StyleProp} from 'react-native';
import {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import {AreaChart, Grid} from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import {colors} from '../../constants/colors';

export interface AreaChartContentProps {
  chartData: number[];
  contentInset: {top: number; bottom: number};
  primaryColor?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  yMax?: number;
}

export const AreaChartContent: FC<AreaChartContentProps> = ({
  chartData,
  contentInset,
  primaryColor = colors.orange,
  backgroundColor = colors.white,
  style,
  yMax
}) => {
  const ChartLine = ({line}: {line?: string}) => (
    <Path
      key="line"
      d={line}
      stroke={primaryColor}
      strokeWidth={3}
      fill="none"
    />
  );

  const Gradient = () => (
    <Defs key={'gradient'}>
      <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={primaryColor} />
        <Stop offset="100%" stopColor={backgroundColor} />
      </LinearGradient>
    </Defs>
  );

  return (
    <AreaChart
      style={style}
      data={chartData}
      gridMin={0}
      numberOfTicks={3}
      contentInset={contentInset}
      curve={shape.curveMonotoneX}
      yMax={yMax}
      svg={{
        strokeWidth: 1,
        stroke: colors.gray,
        fill: 'url(#gradient)'
      }}>
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
  );
};
