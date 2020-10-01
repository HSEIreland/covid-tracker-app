import React, {FC, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import {useTranslation} from 'react-i18next';

import {useApplication} from '../../providers/context';
import {register} from '../../services/api';

import {DataProtectionLink} from './data-protection-policy';

import {Spacing} from '../atoms/layout';
import {Markdown} from '../atoms/markdown';
import {Button} from '../atoms/button';
import {Quote} from '../molecules/quote';
import {Toast} from '../atoms/toast';

import Layouts from '../../theme/layouts';

interface YourDataProps {
  navigation: StackNavigationProp<any>;
}

export const YourData: FC<YourDataProps> = ({navigation}) => {
  const {t} = useTranslation();
  const app = useApplication();
  const [registerError, setRegisterError] = useState<string | null>(null);

  const onContinue = async () => {
    try {
      app.showActivityIndicator();
      await app.clearContext();
      const {token, refreshToken} = await register();

      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('refreshToken', refreshToken, {});

      await app.setContext({
        user: {
          new: true,
          valid: true
        }
      });

      app.hideActivityIndicator();
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
      } else {
        setRegisterError(
          err.code === 108
            ? t('common:registerTimestampError')
            : t('common:registerError', {code: err.code})
        );
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
      <Markdown markdownStyles={{block: {marginBottom: 16}}}>
        {t('yourData:info')}
      </Markdown>
      <Spacing s={8} />
      <DataProtectionLink />
      <Spacing s={12} />
      <Quote text={t('yourData:viewInSettings')} />
      <Spacing s={36} />
      <Button onPress={onContinue}>{t('yourData:continue')}</Button>
    </Layouts.Scrollable>
  );
};
