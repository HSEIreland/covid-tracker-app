import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, Switch, View, StyleSheet} from 'react-native';
import * as SecureStore from 'expo-secure-store';

import {Markdown} from '../../atoms/markdown';

import Layouts from '../../../theme/layouts';
import {Spacing} from '../../atoms/spacing';
import {DataProtectionLink} from '../data-protection-policy';
import {text} from '../../../theme';
import {colors} from '../../../constants/colors';
import {useExposure} from '../../../providers/exposure';

export const Metrics = () => {
  const {t} = useTranslation();
  const {configure} = useExposure();
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    SecureStore.getItemAsync('analyticsConsent')
      .then((consent) => {
        if (consent) {
          setEnabled(consent === 'true');
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const toggleSwitch = async () => {
    if (enabled) {
      setEnabled(false);
      SecureStore.setItemAsync('analyticsConsent', String(false), {});
    } else {
      setEnabled(true);
      SecureStore.setItemAsync('analyticsConsent', String(true), {});
    }
    configure();
  };

  return (
    <Layouts.Scrollable heading={t('metrics:title')}>
      <Markdown style={{}}>{t('metrics:info')}</Markdown>
      <Spacing s={16} />
      <DataProtectionLink />
      <Spacing s={32} />
      <View style={styles.row}>
        <Text style={styles.label}>{t('metrics:share')}</Text>
        <Switch
          trackColor={{
            false: colors.darkGray,
            true: colors.teal
          }}
          thumbColor={colors.white}
          onValueChange={toggleSwitch}
          value={enabled}
          style={styles.switch}
        />
      </View>
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    ...text.largeBold,
    flex: 1
  },
  switch: {
    alignSelf: 'flex-end'
  }
});
