import React, {FC, useState} from 'react';
import {Text, View, StyleSheet, Image, Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useExposure} from 'react-native-exposure-notification-service';

import Layouts from '../../theme/layouts';
import {PhoneNumber} from '../organisms/phone-number';
import {Spacing} from '../atoms/layout';
import {text} from '../../theme';
import {Button} from '../atoms/button';
import {colors} from '../../constants/colors';
import {requestCallback} from '../../services/api';
import {Markdown} from '../atoms/markdown';
import {useSettings} from '../../providers/settings';

export const RequestACallback: FC<any> = ({navigation}) => {
  const [complete, setComplete] = useState(false);
  const {t} = useTranslation();
  const {configure, getCloseContacts} = useExposure();
  const {closeContactTodo} = useSettings();

  const triggerCallback = async (mobile: string) => {
    const contacts = await getCloseContacts();
    const lastContact = contacts && contacts[0];
    const payload = {
      matchedKeys: lastContact?.matchedKeyCount,
      attenuations: lastContact?.attenuationDurations,
      maxRiskScore: lastContact?.maxRiskScore
    };

    requestCallback(mobile, lastContact.exposureAlertDate, payload);
    configure();
    setComplete(true);
  };

  return (
    <Layouts.KeyboardScrollable heading={t('requestACallback:heading')}>
      {!complete && (
        <>
          <Text style={text.default}>{t('requestACallback:text')}</Text>
          <Spacing s={16} />
          <PhoneNumber
            buttonLabel={t('requestACallback:buttonLabel')}
            onSuccess={(value) => triggerCallback(value)}
          />
        </>
      )}
      {complete && (
        <>
          <View style={styles.row}>
            <View style={styles.traceIcon}>
              <Image
                accessibilityIgnoresInvertColors={false}
                style={styles.image}
                resizeMode="contain"
                source={require('../../assets/images/check-mark/check-mark.png')}
              />
            </View>
            <View style={styles.messageWrapper}>
              <Text style={text.defaultBold}>
                {t('requestACallback:complete:title')}
              </Text>
            </View>
          </View>
          <Spacing s={16} />
          <Markdown>{t('closeContact:text1Alert')}</Markdown>
          <Spacing s={16} />
          <Markdown>{closeContactTodo}</Markdown>
          <Markdown>{t('closeContact:text2Alert')}</Markdown>
          <Spacing s={16} />
          <Button
            width="100%"
            onPress={() =>
              Linking.openURL(`https://www2.hse.ie/app/in-app-close-contact`)
            }>
            {t('closeContact:gotoHSE')}
          </Button>
          <Spacing s={32} />
        </>
      )}
    </Layouts.KeyboardScrollable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row'
  },
  traceIcon: {
    backgroundColor: colors.green,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  messageWrapper: {
    flex: 1,
    backgroundColor: '#e4f2eb',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 12
  },
  image: {
    width: 24,
    height: 24
  }
});
