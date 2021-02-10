import React, {FC} from 'react';
import {Alert, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {StackNavigationProp} from '@react-navigation/stack';
import {useExposure} from 'react-native-exposure-notification-service';

import {Button} from '../../atoms/button';
import {Markdown} from '../../atoms/markdown';

import {useApplication} from '../../../providers/context';
import {usePause} from '../../../providers/reminders/pause-reminder';
import {useCheckinReminder} from '../../../providers/reminders/checkin-reminder';
import {useExposureReminder} from '../../../providers/reminders/exposure-reminder';
import {forget} from '../../../services/api';
import {getDeviceLanguage} from '../../../services/i18n';

import Layouts from '../../../theme/layouts';
import {DataProtectionLink} from '../data-protection-policy';
import {Spacing} from '../../atoms/spacing';
import PushNotification from 'react-native-push-notification';

interface Props {
  navigation: StackNavigationProp<any>;
}

export const Leave: FC<Props> = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const app = useApplication();
  const exposure = useExposure();

  const {clear} = usePause();
  const {deleteReminder} = useCheckinReminder();
  const {clearExposureReminders} = useExposureReminder();

  const confirmed = async () => {
    app.showActivityIndicator();
    try {
      try {
        clear();
        deleteReminder();
        clearExposureReminders();

        await exposure.stop();
        await exposure.deleteAllData();
      } catch (err) {
        console.log(err);
      }
      PushNotification.setApplicationIconBadgeNumber(0);
      const deviceLanguage = getDeviceLanguage();
      const willRestart = i18n.dir(i18n.language) !== i18n.dir(deviceLanguage);

      await forget();
      await app.clearContext();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // If language reset changes RTL/LTR, app will restart, no need to navigate
      await i18n.changeLanguage(getDeviceLanguage());
      if (!willRestart) {
        app.hideActivityIndicator();
        navigation.reset({
          index: 0,
          routes: [{name: 'over16'}]
        });
      }
    } catch (e) {
      app.hideActivityIndicator();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        e.message && e.message === 'Network Unavailable'
          ? t('common:networkError')
          : t('leave:error')
      );
    }
  };

  const confirm = () => {
    Alert.alert(t('leave:confirmTitle'), t('leave:confirmText'), [
      {
        text: t('leave:cancel'),
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel'
      },
      {
        text: t('leave:confirm'),
        onPress: () => confirmed(),
        style: 'destructive'
      }
    ]);
  };

  return (
    <Layouts.PinnedBottom heading={t('leave:title')}>
      <Markdown style={{}}>{t('leave:info')}</Markdown>
      <Spacing s={32} />
      <DataProtectionLink />
      <Spacing s={32} />
      <View>
        <Spacing s={12} />
        <Button type="danger" onPress={confirm}>
          {t('leave:button')}
        </Button>
      </View>
    </Layouts.PinnedBottom>
  );
};
