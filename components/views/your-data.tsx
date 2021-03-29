import React, {FC, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import {useTranslation} from 'react-i18next';
import PushNotification from 'react-native-push-notification';

import {useApplication} from '../../providers/context';
import {register} from '../../services/api';

import {DataProtectionLink} from './data-protection-policy';

import {Spacing} from '../atoms/layout';
import {Markdown} from '../atoms/markdown';
import {Button} from '../atoms/button';
import {Toast} from '../atoms/toast';
import {Quote} from '../molecules/quote';
import {ReCaptchaModal} from '../organisms/recaptcha-modal';

import Layouts from '../../theme/layouts';
import {text} from '../../theme';
import {Platform} from 'react-native';

interface YourDataProps {
  navigation: StackNavigationProp<any>;
}

export const YourData: FC<YourDataProps> = ({navigation}) => {
  const {t} = useTranslation();
  const app = useApplication();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [askForReCaptcha, setAskForReCaptcha] = useState<boolean>(false);

  const showRecaptchaModal = () =>
    // on IOS, must show after spinner hide animation completes
    Platform.OS === 'ios'
      ? setTimeout(() => setAskForReCaptcha(true), 600)
      : setAskForReCaptcha(true);

  const onContinue = async (recaptchaToken?: string) => {
    try {
      app.showActivityIndicator();
      await app.clearContext();
      const {token, refreshToken} = await register(recaptchaToken);

      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('refreshToken', refreshToken, {});

      await app.setContext({
        user: {
          new: true,
          valid: true
        }
      });

      app.hideActivityIndicator();

      // If app is uninstalled with an active notification, on iOS can stay and be hard to clear
      // Any notifications on register will be from a previous registration and therefore obsolete
      PushNotification.setApplicationIconBadgeNumber(0);

      navigation.reset({
        index: 0,
        routes: [{name: 'appUsage'}]
      });
    } catch (err) {
      console.log('Error registering device: ', err);
      console.log('Error code:', err.code);
      app.hideActivityIndicator();

      if (err.message === 'Network Unavailable') {
        setRegisterError(t('common:networkError'));
        return;
      }

      let codeNumber = err.code;
      if (typeof codeNumber === 'string') {
        const match = err.code.match(/^\d+/);
        codeNumber = match ? Number(match[0]) : 0;
      } else {
        codeNumber = Number(codeNumber);
      }

      switch (codeNumber) {
        case 108: {
          setRegisterError(t('common:registerTimestampError'));
          return;
        }
        case 1003:
        case 109: {
          if (!recaptchaToken) {
            showRecaptchaModal();
          }
          return;
        }
        default: {
          setRegisterError(t('common:registerError', {code: err.code}));
          return;
        }
      }
    }
  };

  const errorToast = !!registerError && (
    <Toast
      type="error"
      icon={require('../../assets/images/alert/alert.png')}
      message={registerError}
    />
  );

  return (
    <Layouts.Scrollable toast={errorToast} heading={t('yourData:title')}>
      <Markdown markdownStyles={{block: {...text.default, marginBottom: 16}}}>
        {t('yourData:info')}
      </Markdown>
      <Spacing s={8} />
      <DataProtectionLink />
      <Spacing s={12} />
      <Quote text={t('yourData:viewInSettings')} />
      <Spacing s={36} />
      <Button onPress={() => onContinue()}>{t('yourData:continue')}</Button>
      <ReCaptchaModal
        isVisible={askForReCaptcha}
        title={`${t('yourData:title')}: ${t('yourData:recaptcha:name')}`}
        accessibilityLabel={t('yourData:recaptcha:accessibilityLabel')}
        buttonText={t('common:dismiss')}
        onSuccess={(token) => {
          setAskForReCaptcha(false);
          onContinue(token);
        }}
        onClose={() => setAskForReCaptcha(false)}
      />
    </Layouts.Scrollable>
  );
};
