import React, {forwardRef} from 'react';
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

const TracingImage = require('../../assets/images/information/alt.png');

export const TracingAvailable = forwardRef<TouchableWithoutFeedback>(
  (props, ref) => {
    const {t} = useTranslation();
    const navigation = useNavigation();

    return (
      <TouchableWithoutFeedback
        ref={ref}
        onPress={() => navigation.navigate('tracing')}>
        <View style={styles.card}>
          <Image
            accessibilityIgnoresInvertColors
            width={106}
            height={100}
            resizeMode="contain"
            source={TracingImage}
          />
          <View style={styles.content}>
            <Text style={styles.title}>{t('tracingAvailable:title')}</Text>
            <Text style={[text.smallBold, {color: colors.teal}]}>
              {t('tracingAvailable:text')}
            </Text>
          </View>
          <SingleRow>
            <Image
              accessibilityIgnoresInvertColors
              style={styles.iconSize}
              {...styles.iconSize}
              source={require('../../assets/images/arrow-right/teal.png')}
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
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16
  },
  icon: {
    width: 88
  },
  content: {
    flex: 1,
    marginLeft: 8
  },
  title: {
    ...text.largeBlack,
    marginBottom: 6
  },
  iconSize: {
    width: 24,
    height: 24
  }
});
