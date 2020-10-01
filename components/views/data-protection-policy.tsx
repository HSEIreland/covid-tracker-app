import React, {useState, useEffect} from 'react';
import {Image, StyleSheet} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
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

  const [initialRender, setInitialRender] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInitialRender(false);
  }, []);

  useEffect(() => {
    if (!initialRender) {
      setLoading(false);
    }
  }, [initialRender]);

  return (
    <Layouts.Scrollable heading={t('dataProtectionPolicy:title')}>
      {!loading && (
        <Markdown markdownStyles={markDownStyles}>{dpinText}</Markdown>
      )}
      {loading && (
        <Spinner animation="fade" visible overlayColor={'rgba(0, 0, 0, 0.5)'} />
      )}
    </Layouts.Scrollable>
  );
};

export const TermsAndConditions = () => {
  const {tandcText} = useSettings();
  const {t} = useTranslation();

  const [initialRender, setInitialRender] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInitialRender(false);
  }, []);

  useEffect(() => {
    if (!initialRender) {
      setLoading(false);
    }
  }, [initialRender]);

  return (
    <Layouts.Scrollable heading={t('tandcPolicy:title')}>
      {!loading && (
        <Markdown markdownStyles={markDownStyles}>{tandcText}</Markdown>
      )}
      {loading && (
        <Spinner animation="fade" visible overlayColor={'rgba(0, 0, 0, 0.5)'} />
      )}
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
