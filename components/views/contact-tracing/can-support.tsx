import React, {FC} from 'react';
import {Platform, Text, Linking} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Spacing} from '../../atoms/layout';
import {Card} from '../../atoms/card';
import {ResponsiveImage} from '../../atoms/responsive-image';
import {Toast} from '../../atoms/toast';
import {Button} from '../../atoms/button';

import {colors} from '../../../constants/colors';
import {text} from '../../../theme';
import {useExposure} from '../../../providers/exposure';

export const CanSupport: FC = () => {
  const {t} = useTranslation();
  const exposure = useExposure();

  const checkForUpgradeHandler = async () => {
    try {
      if (Platform.OS === 'ios') {
        Linking.openURL('App-Prefs:');
      } else {
        await exposure.triggerUpdate();
        await exposure.supportsExposureApi();
      }
    } catch (err) {
      console.log('Error handling check for upgrade', err);
    }
  };

  return (
    <Card padding={{v: 12}}>
      <ResponsiveImage
        h={150}
        source={require('../../../assets/images/phone/not-active.png')}
      />
      <Spacing s={8} />
      <Toast
        color={colors.red}
        message={t('contactTracing:canSupport:title')}
        icon={require('../../../assets/images/alert/alert.png')}
      />
      <Spacing s={16} />
      <Text style={text.default}>
        {t(`contactTracing:canSupport:message:${Platform.OS}`)}
      </Text>
      <Spacing s={12} />
      <Button onPress={checkForUpgradeHandler}>
        {t('contactTracing:canSupport:button')}
      </Button>
    </Card>
  );
};
