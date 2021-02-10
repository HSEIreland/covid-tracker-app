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

interface CheckInCardProps {
  onPress?: () => void;
}

export const CheckInCard = forwardRef<any, CheckInCardProps>(
  ({onPress}, ref) => {
    const {t} = useTranslation();

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
              source={require('../../assets/images/mask-wearer/image.png')}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={text.largeBlack}>{t('checker:title')}</Text>
            <Text style={[text.smallBold, {color: colors.teal}]}>
              {t('welcome:letUsKnow')}
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
