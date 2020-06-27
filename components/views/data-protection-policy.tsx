import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSettings} from '../../providers/settings';
import {Markdown} from '../atoms/markdown';
import {Link} from '../atoms/link';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../constants/colors';
import {text} from '../../theme';
import Layouts from '../../theme/layouts';

const PrivacyIcon = () => (
  <Image
    accessibilityIgnoresInvertColors
    style={styles.privacy}
    source={require('../../assets/images/privacy/privacy.png')}
  />
);

const styles = StyleSheet.create({
  privacy: {
    width: 32,
    height: 32,
    marginRight: 8
  }
});

export const DataProtectionLink = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  return (
    <Link
      Icon={PrivacyIcon}
      text={t('dataProtectionPolicy:link')}
      onPress={() => {
        navigation.navigate('privacy', {screen: 'settings.privacy'});
      }}
    />
  );
};

export const DataProtectionPolicy = () => {
  const {dpinText} = useSettings();
  const {t} = useTranslation();

  return (
    <Layouts.Scrollable heading={t('dataProtectionPolicy:title')}>
      <Markdown markdownStyles={markDownStyles}>{dpinText}</Markdown>
    </Layouts.Scrollable>
  );
};

export const TermsAndConditions = () => {
  const {tandcText} = useSettings();
  const {t} = useTranslation();

  return (
    <Layouts.Scrollable heading={t('tandcPolicy:title')}>
      <Markdown markdownStyles={markDownStyles}>{tandcText}</Markdown>
    </Layouts.Scrollable>
  );
};

const markDownStyles = StyleSheet.create({
  listItemNumber: {
    ...text.largeBold,
    color: colors.darkGray,
    paddingRight: 16    
  },
  listItemContent: {
    paddingTop: 2,
    paddingRight: 32
  }
});
