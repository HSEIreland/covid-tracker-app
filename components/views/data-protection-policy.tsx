import React, {useState, useEffect} from 'react';
import {Image, StyleSheet} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import {useTranslation} from 'react-i18next';

import {useDbText} from '../../providers/settings';
import {Markdown} from '../atoms/markdown';
import {Link} from '../atoms/link';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../constants/colors';
import {text} from '../../theme';
import Layouts from '../../theme/layouts';

const PrivacyIcon = () => (
  <Image
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
  const {dpinText} = useDbText();
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
        <Markdown markdownStyles={markDownStyles} forceLTR>
          {dpinText}
        </Markdown>
      )}
      {loading && (
        <Spinner animation="fade" visible overlayColor={'rgba(0, 0, 0, 0.5)'} />
      )}
    </Layouts.Scrollable>
  );
};

export const TermsAndConditions = () => {
  const {tandcText} = useDbText();
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
        <Markdown markdownStyles={markDownStyles} forceLTR>
          {tandcText}
        </Markdown>
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
    ...text.default,
    flex: 1,
    paddingTop: 2,
    paddingRight: 32
  },
  listItemBullet: {
    width: 8,
    height: 8,
    backgroundColor: colors.darkGray,
    borderRadius: 4,
    marginLeft: 6,
    marginTop: 10,
    marginRight: 12
  },
  block: {
    ...text.default,
    marginBottom: 20
  },
  h1: {
    ...text.xlargeBold,
    marginVertical: 10
  },
  h2: {
    ...text.largeBold,
    marginVertical: 10
  }
});
