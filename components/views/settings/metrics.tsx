import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, Switch, View, StyleSheet} from 'react-native';
import {useExposure} from 'react-native-exposure-notification-service';

import {Markdown} from '../../atoms/markdown';

import Layouts from '../../../theme/layouts';
import {Spacing} from '../../atoms/spacing';
import {DataProtectionLink} from '../data-protection-policy';
import {text} from '../../../theme';
import {colors} from '../../../constants/colors';
import {useApplication} from '../../../providers/context';

export const Metrics = () => {
  const {t} = useTranslation();
  const {configure} = useExposure();
  const {setContext, analyticsConsent} = useApplication();

  useEffect(() => {
    configure();
  }, [analyticsConsent]);

  const toggleSwitch = async () => {
    await setContext({analyticsConsent: !analyticsConsent});
  };

  return (
    <Layouts.Scrollable heading={t('metrics:title')}>
      <Markdown style={{}}>{t('metrics:info')}</Markdown>
      <Spacing s={16} />
      <DataProtectionLink />
      <Spacing s={32} />
      <View style={styles.row}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <Text style={styles.label}>{t('metrics:share')}</Text>
        </View>
        <Switch
          accessibilityRole="switch"
          accessibilityHint={t('metrics:share')}
          trackColor={{
            false: colors.darkGray,
            true: colors.teal
          }}
          thumbColor={colors.white}
          onValueChange={toggleSwitch}
          value={analyticsConsent}
          style={styles.switch}
        />
      </View>
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    ...text.largeBold,
    flex: 1
  },
  switch: {
    alignSelf: 'flex-end'
  }
});
