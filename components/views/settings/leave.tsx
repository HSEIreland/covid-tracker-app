import React from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {useExposure} from 'react-native-exposure-notification-service';

import {Button} from '../../atoms/button';
import {Markdown} from '../../atoms/markdown';

import {useApplication} from '../../../providers/context';
import {forget} from '../../../services/api';

import Layouts from '../../../theme/layouts';
import {DataProtectionLink} from '../data-protection-policy';
import {Spacing} from '../../atoms/spacing';
import {ScrollView} from 'react-native-gesture-handler';

export const Leave = ({navigation}) => {
  const {t} = useTranslation();
  const app = useApplication();
  const exposure = useExposure();

  const confirmed = async () => {
    app.showActivityIndicator();
    try {
      try {
        await exposure.deleteAllData();
        exposure.stop();
      } catch (err) {
        console.log(err);
      }
      await forget();
      await app.clearContext();

      app.hideActivityIndicator();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      navigation.reset({
        index: 0,
        routes: [{name: 'over16'}]
      });
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
    <Layouts.Basic heading={t('leave:title')}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <View>
          <Markdown style={{}}>{t('leave:info')}</Markdown>
          <Spacing s={32} />
          <DataProtectionLink />
          <Spacing s={32} />
        </View>
      </ScrollView>
      <Button type="danger" onPress={confirm}>
        {t('leave:button')}
      </Button>
    </Layouts.Basic>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  contentContainer: {
    flex: 1
  }
});
