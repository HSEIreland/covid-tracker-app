import React from 'react';
import {Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-community/async-storage';

import {supportedLocales} from '../../../services/i18n/common';
import {getDeviceLanguage} from '../../../services/i18n';
import {SelectList} from '../../atoms/select-list';
import {Spacing} from '../../atoms/layout';
import Layouts from '../../../theme/layouts';
import {text} from '../../../theme';

interface LanguageType {
  value: string;
  label: string;
  a11yLabel: string;
}

export const Language = () => {
  const {t, i18n} = useTranslation();

  const languages: LanguageType[] = Object.entries(supportedLocales).map(
    ([langCode, langData]) => ({
      value: langCode,
      label: langData.display,
      a11yLabel: langData.display.replace(/\*/g, '')
    })
  );
  const currentLanguage = languages.find(({value}) => value === i18n.language);

  return (
    <Layouts.Scrollable heading={t('languageSettings:title')}>
      <View accessibilityElementsHidden>
        <Text style={text.defaultBold}>{t('languageSettings:intro')}</Text>
      </View>
      <Spacing s={20} />
      <SelectList
        title={t('languageSettings:intro')}
        items={languages}
        selectedValue={currentLanguage?.value || getDeviceLanguage()}
        markdown={true}
        onItemSelected={(lang) => {
          AsyncStorage.setItem('cti.language', lang);
          i18n.changeLanguage(lang);
        }}
      />
    </Layouts.Scrollable>
  );
};
