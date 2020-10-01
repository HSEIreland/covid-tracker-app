import React, {FC} from 'react';
import {StyleSheet, View, Image, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Card} from '../atoms/card';

import {colors} from '../../constants/colors';
import {text} from '../../theme';

interface CountyBreakdownCardProps {
  onPress: () => void;
}
export const CountyBreakdownCard: FC<CountyBreakdownCardProps> = ({
  onPress
}) => {
  const {t} = useTranslation();

  return (
    <Card padding={{r: 4}} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Image
            accessibilityIgnoresInvertColors
            style={styles.imageSize}
            {...styles.imageSize}
            resizeMode="center"
            source={require('../../assets/images/map/ireland.png')}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.title}>{t('appStats:nationalPicture')}</Text>
          <Text style={styles.subTitle}>{t('appStats:breakdown')}</Text>
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
    backgroundColor: '#EAFBED',
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
  },
  imageSize: {
    width: 40,
    height: 40
  }
});
