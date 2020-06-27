import en from '../../assets/lang/en.json';
import ga from '../../assets/lang/ga.json';

export const fallback = 'en';
export const defaultNamespace = 'common';
export const namespaces = ['common'];

export const supportedLocales = {
  en: {
    name: 'English',
    ...en
  },
  ga: {
    name: 'Irish',
    ...ga
  }
};
