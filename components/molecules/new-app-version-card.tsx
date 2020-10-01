import React, {FC, forwardRef} from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  Image,
  Platform,
  Linking
} from 'react-native';
import {useTranslation} from 'react-i18next';

import {SingleRow, Spacing} from '../atoms/layout';

import {colors} from '../../constants/colors';
import {shadows, text} from '../../theme';

const InformationAltImage = require('../../assets/images/information/alt.png');

export const NewAppVersionCard = forwardRef<TouchableWithoutFeedback>(
  (props, ref) => {
    const {t} = useTranslation();

    const onUpdate = () => {
      Linking.openURL(
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/ie/app/covid-tracker-ireland/id1505596721'
          : Platform.OS === 'android'
          ? 'https://play.google.com/store/apps/details?id=com.covidtracker.hse'
          : t('common:url')
      );
    };

    return (
      <TouchableWithoutFeedback ref={ref} onPress={onUpdate}>
        <View style={styles.card}>
          <Image
            accessibilityIgnoresInvertColors
            width={106}
            height={100}
            resizeMode="contain"
            source={InformationAltImage}
          />
          <View style={styles.content}>
            <Text style={text.largeBlack}>
              {t(`newVersionAvailable:title_${Platform.OS}`)}
            </Text>
            <Spacing s={8} />
            <Text style={[text.defaultBold, {color: colors.teal}]}>
              {t('newVersionAvailable:text')}
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
    paddingVertical: 16,
    paddingRight: 4
  },
  content: {
    flex: 1,
    marginLeft: 10
  },
  iconSize: {
    width: 24,
    height: 24
  }
});
