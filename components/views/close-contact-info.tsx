import React, {FC} from 'react';
import {Text, Linking} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Spacing} from '../atoms/layout';
import {Markdown} from '../atoms/markdown';
import {Button} from '../atoms/button';

import Layouts from '../../theme/layouts';
import {text} from '../../theme';
import {useSettings} from '../../providers/settings';

export const CloseContactInfo: FC<any> = () => {
  const {t} = useTranslation();
  const {closeContactInfo, closeContactTodo} = useSettings();

  return (
    <Layouts.Scrollable heading={t('closeContact:titleInfo')}>
      <Text style={text.defaultBold}>{closeContactInfo}</Text>
      <Spacing s={16} />
      <Markdown>{t('closeContact:text1Info')}</Markdown>
      <Spacing s={16} />
      <Markdown>{closeContactTodo}</Markdown>
      <Markdown>{t('closeContact:text2Info')}</Markdown>
      <Spacing s={16} />
      <Button
        width="100%"
        onPress={() =>
          Linking.openURL(`https://www2.hse.ie/app/in-app-close-contact`)
        }>
        {t('closeContact:gotoHSE')}
      </Button>
      <Spacing s={32} />
    </Layouts.Scrollable>
  );
};
