import React, {FC} from 'react';
import {Image, ImageSourcePropType, ImageStyle} from 'react-native';
import {baseStyles} from '../../theme';

interface ArrowIconProps {
  source?: ImageSourcePropType;
  style?: ImageStyle;
}

const defaultSource = require('../../assets/images/arrow-right/teal.png');

export const ArrowIcon: FC<ArrowIconProps> = ({
  source = defaultSource,
  style,
  ...imageProps
}) => (
  <Image
    accessibilityIgnoresInvertColors
    style={[baseStyles.iconSize, baseStyles.flipIfRtl, style]}
    source={source}
    {...baseStyles.iconSize}
    {...imageProps}
  />
);
