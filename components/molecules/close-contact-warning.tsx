import React, {FC, forwardRef} from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  Image
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

import {SingleRow} from '../atoms/layout';

import {colors} from '../../constants/colors';

import {shadows, text} from '../../theme';

export const CloseContactWarning = forwardRef<TouchableWithoutFeedback>(
  (props, ref) => {
    const {t} = useTranslation();
    const navigation = useNavigation();

    return (
      <TouchableWithoutFeedback
        ref={ref}
        onPress={() => navigation.navigate('closeContact')}>
        <View style={styles.card}>
          <View style={styles.icon}>
            <Image
              accessibilityIgnoresInvertColors
              style={styles.imageSize}
              width={styles.imageSize.width}
              height={styles.imageSize.height}
              source={require('../../assets/images/exposure-alert/exposure-alert.png')}
            />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{t('closeContactWarn:title')}</Text>
            <Text style={styles.notice}>{t('closeContactWarn:notice')}</Text>
          </View>
          <SingleRow>
            <Image
              accessibilityIgnoresInvertColors
              style={styles.iconSize}
              width={styles.iconSize.width}
              height={styles.iconSize.height}
              source={require('../../assets/images/arrow-right/white.png')}
            />
          </SingleRow>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    ...shadows.default,
    borderColor: colors.red,
    backgroundColor: colors.red,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  icon: {
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  content: {
    flex: 1,
    marginLeft: 96
  },
  title: {
    ...text.largeBlack,
    color: colors.white
  },
  notice: {
    ...text.default,
    color: colors.white,
    lineHeight: 21
  },
  iconSize: {
    width: 24,
    height: 24
  },
  imageSize: {
    width: 107,
    height: 137
  }
});
