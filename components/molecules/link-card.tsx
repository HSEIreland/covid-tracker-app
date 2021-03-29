import React, {FC} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  ImageProps,
  ImageSourcePropType,
  ViewStyle
} from 'react-native';

import {Card} from '../atoms/card';

import {colors} from '../../constants/colors';
import {text} from '../../theme';

interface LinkCardProps {
  title: string;
  onPress: () => void;
  imageSource: ImageSourcePropType;
  subtitle?: string;
  imageProps?: Partial<ImageProps>;
  imageSize?: {width: number; height: number};
  iconStyle?: ViewStyle;
}

export const LinkCard: FC<LinkCardProps> = ({
  onPress,
  title,
  subtitle,
  imageSource,
  imageProps = {},
  imageSize = {width: 56, height: 56},
  iconStyle
}) => {
  const defaultImageProps: Partial<ImageProps> = {
    accessibilityIgnoresInvertColors: true,
    style: imageSize,
    resizeMode: 'center',
    ...imageSize
  };

  const mergedImageProps = {
    ...defaultImageProps,
    imageProps
  };
  return (
    <Card padding={{r: 4}} onPress={onPress}>
      <View style={styles.row}>
        <View style={[styles.icon, iconStyle]}>
          <Image {...mergedImageProps} source={imageSource} />
        </View>
        <View style={styles.col}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subTitle}>{subtitle}</Text>}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  col: {
    flexDirection: 'column',
    flex: 1
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20
  },
  title: {
    ...text.largeBlack,
    marginBottom: 4
  },
  subTitle: {
    ...text.smallBold,
    color: colors.teal
  }
});
