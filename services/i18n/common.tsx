import ar from '../../assets/lang/ar.json';
import en from '../../assets/lang/en.json';
import ga from '../../assets/lang/ga.json';
import pt from '../../assets/lang/pt.json';
import fr from '../../assets/lang/fr.json';
import pl from '../../assets/lang/pl.json';
import lt from '../../assets/lang/lt.json';
import lv from '../../assets/lang/lv.json';
import {I18nManager} from 'react-native';
import {TFunctionResult} from 'i18next';

export const fallback = 'en';
export const defaultNamespace = 'common';
export const namespaces = ['common'];

const rtlMarkerChar = '‏';
const ltrMarkerChar = '‎';
const directionChar = I18nManager.isRTL ? rtlMarkerChar : ltrMarkerChar;

// For text that, under RTL languages, may start with LTR chars (or vice versa)
export const alignWithLanguage = (content: TFunctionResult | number) =>
  `${directionChar}${content}${directionChar}`;

type Locales = Record<
  string,
  {
    name: string;
    display: string;
  }
>;

// Force display names to line up as LTR in LTR langs and RTL in RTL langs
const alignDisplay = (originalLocales: Locales) =>
  Object.entries(originalLocales).reduce(
    (locales, [langCode, {name, display, ...translations}]) => ({
      ...locales,
      [langCode]: {
        name,
        display: alignWithLanguage(display),
        ...translations
      }
    }),
    {} as Locales
  );

export const supportedLocales: Locales = alignDisplay({
  ar: {
    name: 'Arabic',
    display: '**العربية** (Arabic)',
    ...ar
  },
  en: {
    name: 'English',
    display: '**English**',
    ...en
  },
  fr: {
    name: 'French',
    display: '**Français** (French)',
    ...fr
  },
  ga: {
    name: 'Irish',
    display: '**Gaeilge** (Irish)',
    ...ga
  },
  lv: {
    name: 'Latvian',
    display: '**Latvietis** (Latvian)',
    ...lv
  },
  lt: {
    name: 'Lithuanian',
    display: '**Lietuvis** (Lithuanian)',
    ...lt
  },
  pl: {
    name: 'Polish',
    display: '**Polskie** (Polish)',
    ...pl
  },
  pt: {
    name: 'Portuguese',
    display: '**Português** (Portuguese)',
    ...pt
  }
});

export function numberToText(stat: any, locale = 'en-IE') {
  switch (typeof stat) {
    case 'number':
      return new Intl.NumberFormat(locale).format(stat);
    case 'string':
      return stat;
    default:
      return '';
  }
}
