import React from 'react';
import {Image, ImagePropsBase} from 'react-native';
import {scale} from '../../theme';

interface ResponsiveImageProps extends ImagePropsBase {
  w?: number;
  h?: number;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  w,
  h,
  ...imageProps
}) => {
  const width = w && scale(w);
  const height = h && scale(h);

  return (
    <Image
      accessibilityIgnoresInvertColors
      style={{width, height}}
      width={width}
      height={height}
      resizeMode="contain"
      {...imageProps}
    />
  );
};
