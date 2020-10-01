import en from '../../assets/lang/en.json';
import ga from '../../assets/lang/ga.json';
import pt from '../../assets/lang/pt.json';
import fr from '../../assets/lang/fr.json';
import pl from '../../assets/lang/pl.json';
import lt from '../../assets/lang/lt.json';
import lv from '../../assets/lang/lv.json';

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
  },
  pt: {
    name: 'Portuguese',
    ...pt
  },
  fr: {
    name: 'French',
    ...fr
  },
  pl: {
    name: 'Polish',
    ...pl
  },
  lv: {
    name: 'Latvian',
    ...lv
  },  
  lt: {
    name: 'Lithuanian',
    ...lt
  } 
};
