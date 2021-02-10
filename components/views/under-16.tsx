import React, {FC} from 'react';
import {Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';

import {Spacing} from '../atoms/spacing';
import {ResponsiveImage} from '../atoms/responsive-image';
import {Button} from '../atoms/button';

import {text} from '../../theme';
import Layouts from '../../theme/layouts';

const protectionAdviceUrl = 'https://www2.hse.ie/app/in-app-good';

const link = (url: string) => {
  WebBrowser.openBrowserAsync(url, {
    enableBarCollapsing: true,
    showInRecents: true
  });
};

export const Under16: FC = () => {
  const {t} = useTranslation();

  return (
    <Layouts.Scrollable heading={t('underAge:title')}>
      <ResponsiveImage
        h={150}
        source={require('../../assets/images/under16-1/image.png')}
      />
      <Spacing s={20} />
      <Text style={text.default}>{t('underAge:notice')}</Text>
      <Spacing s={12} />
      <Button
        width="100%"
        type="empty"
        onPress={() => link(protectionAdviceUrl)}>
        {t('underAge:protectionAdvice')}
      </Button>
    </Layouts.Scrollable>
  );
};
