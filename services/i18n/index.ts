import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as Localization from 'expo-localization';
import {
  fallback,
  defaultNamespace,
  namespaces,
  supportedLocales
} from './common';
import {format as F} from 'date-fns';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lang: string) => void) => {
    console.log(Localization.locale);
    callback(Localization.locale.split('-')[0].replace('-', ''));
  },
  init: () => {},
  cacheUserLanguage: () => {}
};

i18n
  // @ts-ignore
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: fallback,
    resources: supportedLocales,
    ns: namespaces,
    defaultNS: defaultNamespace,
    debug: false,
    interpolation: {
      escapeValue: false,
      format: (value, format) => {
        if (value instanceof Date) {
          return F(value, format);
        }
        return value;
      }
    }
  });

export default i18n;
