import React, {FC} from 'react';
import {Svg, Polygon} from 'react-native-svg';
import {View, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {colors} from '../../constants/colors';
import {scale} from '../../theme';

interface TrendArrowProps {
  type?: 'up' | 'down' | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const TrendArrow: FC<TrendArrowProps> = ({type, size = 12, style}) => {
  const scaledSize = scale(size);
  return (
    <View
      style={[
        styles.container,
        {width: scaledSize, height: scaledSize},
        style
      ]}>
      {type && (
        <Svg width={'100%'} height={'100%'} viewBox={'0 0 12 12'}>
          {type === 'up' ? (
            <Polygon points="6 0 12 10 0 10" fill={colors.darkRed} />
          ) : (
            <Polygon points="6 12 12 2 0 2" fill={colors.green} />
          )}
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1
  }
});
