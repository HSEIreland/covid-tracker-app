import React, {FC} from 'react';
import {Platform, Linking} from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import {useTranslation} from 'react-i18next';
import {useExposure} from 'react-native-exposure-notification-service';

import {Spacing} from '../../atoms/layout';
import {Card} from '../../atoms/card';
import {ResponsiveImage} from '../../atoms/responsive-image';
import {Toast} from '../../atoms/toast';
import {Button} from '../../atoms/button';
import {Markdown} from '../../atoms/markdown';

import {colors} from '../../../constants/colors';
import {text} from '../../../theme';

interface NotActiveProps {
  exposureOff?: boolean;
  bluetoothOff?: boolean;
}

export const NotActive: FC<NotActiveProps> = ({
  exposureOff = false,
  bluetoothOff = false
}) => {
  const {t} = useTranslation();
  const exposure = useExposure();

  const gotoSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        if (exposureOff) {
          Linking.openURL('app-settings:');
        } else {
          Linking.openURL('App-Prefs:');
        }
      } else {
        if (exposure.supported) {
          if (exposure.enabled) {
            await IntentLauncher.startActivityAsync(
              'com.google.android.gms.settings.EXPOSURE_NOTIFICATION_SETTINGS'
            );
          } else {
            await exposure.authoriseExposure();
          }
        } else {
          await IntentLauncher.startActivityAsync(
            IntentLauncher.ACTION_APPLICATION_DETAILS_SETTINGS,
            {data: 'package:com.covidtracker.hse'}
          );
        }

        await exposure.supportsExposureApi();
      }
    } catch (e) {
      console.log("Error opening app's settings", e);
    }
  };

  const messageKey = exposureOff
    ? bluetoothOff
      ? 'message11'
      : 'message10'
    : bluetoothOff
    ? 'message01'
    : 'message00';

  return (
    <Card padding={{v: 12}}>
      <ResponsiveImage
        h={150}
        source={require('../../../assets/images/phone/not-active.png')}
      />
      <Spacing s={8} />
      <Toast
        color={colors.red}
        message={t('contactTracing:notActive:title')}
        icon={require('../../../assets/images/alert/alert.png')}
      />
      <Spacing s={16} />
      <Markdown style={text.default}>
        {Platform.OS === 'ios'
          ? t(`contactTracing:notActive:${messageKey}`)
          : t(
              `contactTracing:notActive:${
                bluetoothOff ? 'message01' : 'android:message'
              }`
            )}
      </Markdown>
      <Spacing s={12} />
      <Button onPress={gotoSettings}>
        {Platform.OS === 'ios'
          ? t('contactTracing:notActive:button')
          : t('contactTracing:notActive:android:button')}
      </Button>
    </Card>
  );
};
