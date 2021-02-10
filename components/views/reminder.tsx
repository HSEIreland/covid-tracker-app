import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';

import {useExposureDates} from '../../hooks/exposure-dates';
import {ReminderKey} from '../../providers/settings';

import {Button} from '../atoms/button';
import {Card} from '../atoms/card';
import {Markdown} from '../atoms/markdown';
import {Spacing} from '../atoms/spacing';

import Layouts from '../../theme/layouts';

export const Reminder = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {t} = useTranslation();
  const {formatted, ready} = useExposureDates();

  const params = route?.params as {key?: ReminderKey};
  const {key} = params || {};

  const clear = () =>
    navigation.reset({
      index: 0,
      routes: [{name: 'main', params: {screen: 'tracing'}}]
    });

  if (ready && !key) {
    clear();
    return null;
  }

  return (
    <Layouts.Scrollable heading={t(`${key}:card:title`, formatted)}>
      {ready ? (
        <>
          <Card>
            <Markdown>{t(`${key}:card:description`, formatted)}</Markdown>
          </Card>
          <Spacing s={16} />
          <Button onPress={clear}>{t('common:continue')}</Button>
        </>
      ) : (
        <Spinner animation="fade" visible={!ready} />
      )}
    </Layouts.Scrollable>
  );
};
