import React, {forwardRef, MutableRefObject} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import {Card} from '../atoms/card';

import {colors} from '../../constants/colors';
import {baseStyles, text} from '../../theme';
import {useTranslation} from 'react-i18next';

interface VaccineCertRegisterCardProps {
  onPress?: () => void;
  registered: boolean;
}

export const VaccineCertCard = forwardRef<any, VaccineCertRegisterCardProps>(
  ({onPress, registered}, ref) => {
    const {t} = useTranslation();

    const title = registered
      ? t('vaccineCert:view:card:title')
      : t('vaccineCert:register:card:title');

    const description = registered
      ? t('vaccineCert:view:card:description')
      : t('vaccineCert:register:card:description');

    return (
      <Card
        cardRef={ref as MutableRefObject<TouchableWithoutFeedback>}
        onPress={onPress}
        padding={{r: 4}}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <Image
              accessibilityIgnoresInvertColors
              style={[styles.imageSize, baseStyles.flipIfRtl]}
              width={styles.imageSize.width}
              height={styles.imageSize.height}
              source={require('../../assets/images/vaccine-cert/icon.png')}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={text.largeBlack}>{title}</Text>
            <Text style={[text.smallBold, {color: colors.teal}]}>
              {description}
            </Text>
          </View>
        </View>
      </Card>
    );
  }
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  icon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  imageSize: {
    width: 64,
    height: 64
  },
  textContainer: {
    flex: 1
  }
});
