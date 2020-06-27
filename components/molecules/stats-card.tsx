import React, {FC} from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  Text,
  Image,
  ImageRequireSource
} from 'react-native';

import {colors} from '../../constants/colors';
import {shadows, text} from '../../theme';

interface StatsCardProps {
  style?: ViewStyle;
  image: {
    source: ImageRequireSource;
    backgroundColor: string;
  };
  figure: number;
  description: string;
}

export const StatsCard: FC<StatsCardProps> = ({
  style,
  image,
  figure,
  description
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.icon, {backgroundColor: image.backgroundColor}]}>
        <Image
          accessibilityIgnoresInvertColors
          width={36}
          height={36}
          source={image.source}
        />
      </View>
      <View style={styles.stats}>
        <Text style={text.xxlargeBlack}>
          {new Intl.NumberFormat('en-IE').format(figure)}
        </Text>
        <Text style={text.defaultBoldOpacity70}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 8,
    paddingRight: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    ...shadows.default
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24
  },
  stats: {
    alignItems: 'flex-start'
  }
});
