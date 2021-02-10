import React, {forwardRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import {useApplication} from '../../providers/context';

import {Card} from '../atoms/card';
import {Link} from '../atoms/link';
import {Spacing} from '../atoms/spacing';

import {baseStyles, text} from '../../theme';

interface PolicyUpdateCardProps {
  tandc: boolean;
  dpin: boolean;
}

export const PolicyUpdateCard = forwardRef<
  TouchableWithoutFeedback,
  PolicyUpdateCardProps
>(({tandc, dpin}, ref) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const app = useApplication();

  const onDismiss = async () => {
    await SecureStore.deleteItemAsync('cti.tandcDateUpdate');
    await SecureStore.deleteItemAsync('cti.dpinDateUpdate');
    app.setContext({
      dpinNotificationExpiryDate: null,
      tandcNotificationExpiryDate: null
    });
  };

  const notice =
    tandc && dpin
      ? t('policyUpdates:info')
      : tandc
      ? t('policyUpdates:tandcOnly')
      : t('policyUpdates:dpinOnly');

  return (
    <Card cardRef={ref}>
      <View style={styles.dismissed}>
        <TouchableWithoutFeedback
          accessibilityRole="button"
          accessibilityHint={t('common:dismiss')}
          accessibilityLabel={t('common:dismiss')}
          onPress={onDismiss}>
          <Image
            style={baseStyles.iconSize}
            width={24}
            height={24}
            source={require('../../assets/images/dismiss/dismiss.png')}
          />
        </TouchableWithoutFeedback>
      </View>

      <Text style={text.largeBold}>{t('policyUpdates:title')}</Text>
      <Spacing s={8} />
      <Text style={text.default}>{notice}</Text>
      {dpin && (
        <>
          <Spacing s={16} />
          <Link
            align="left"
            onPress={() => navigation.navigate('settings.privacy')}>
            {t('policyUpdates:dpinLink')}
          </Link>
        </>
      )}
      {tandc && (
        <>
          <Spacing s={16} />
          <Link
            align="left"
            onPress={() => navigation.navigate('settings.terms')}>
            {t('policyUpdates:tandcLink')}
          </Link>
        </>
      )}
    </Card>
  );
});

export const styles = StyleSheet.create({
  dismissed: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 99,
    ...baseStyles.iconSize
  }
});
