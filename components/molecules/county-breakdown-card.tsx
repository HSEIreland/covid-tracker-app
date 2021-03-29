import React, {FC} from 'react';
import {StyleSheet} from 'react-native';

import {LinkCard} from './link-card';

import {colors} from '../../constants/colors';

interface CountyBreakdownCardProps {
  title: string;
  description: string;
  onPress: () => void;
}
export const CountyBreakdownCard: FC<CountyBreakdownCardProps> = ({
  onPress,
  title,
  description
}) => (
  <LinkCard
    title={title}
    subtitle={description}
    onPress={onPress}
    imageSource={require('../../assets/images/map/ireland.png')}
    imageSize={{width: 40, height: 40}}
    iconStyle={styles.icon}
  />
);

const styles = StyleSheet.create({
  icon: {
    backgroundColor: colors.lightGreen
  }
});
