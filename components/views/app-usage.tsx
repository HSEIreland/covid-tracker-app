import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import {DataProtectionLink} from './data-protection-policy';

import {Spacing} from '../atoms/spacing';
import {Button} from '../atoms/button';
import {Link} from '../atoms/link';
import {Markdown} from '../atoms/markdown';
import {Quote} from '../molecules/quote';

import {useApplication} from '../../providers/context';

import Layouts from '../../theme/layouts';

interface AppUsageProps {
  navigation: any;
}

export const AppUsage: FC<AppUsageProps> = ({navigation}) => {
  const {t} = useTranslation();
  const {setContext} = useApplication();

  const handleNext = async (consent: boolean) => {
    try {
      await setContext({analyticsConsent: consent});
    } catch (e) {
      console.log('Error storing "analyticsConsent" securely', e);
    }

    navigation.navigate('contactTracingInformation');
  };

  return (
    <Layouts.Scrollable heading={t('appUsage:title')}>
      <Markdown markdownStyles={{block: {marginBottom: 16}}}>
        {t('appUsage:info')}
      </Markdown>
      <Spacing s={24} />
      <DataProtectionLink />
      <Spacing s={48} />
      <Quote text={t('appUsage:settingsInfo')} />
      <Spacing s={24} />
      <Button onPress={() => handleNext(true)}>
        {t('appUsage:yesButton')}
      </Button>
      <Spacing s={24} />
      <Link align="center" onPress={() => handleNext(false)}>
        {t('appUsage:noThanks')}
      </Link>
    </Layouts.Scrollable>
  );
};
