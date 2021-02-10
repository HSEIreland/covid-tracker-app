import {Locale} from 'date-fns';
import {arDZ, enUS, fr, lt, lv, pl, pt} from 'date-fns/locale';

interface I18n {
  language: string;
}

export interface DateLocaleOptions {
  locale: Locale;
}

const fallback = enUS;

export const dateFnsLocales = {
  ar: arDZ,
  en: enUS,
  fr,
  // No Gaelic option in date-fns/locale
  lt,
  lv,
  pl,
  pt
} as Record<string, any>;

export const getDateLocaleOptions = (i18n: I18n): DateLocaleOptions => {
  const locale: Locale = dateFnsLocales[i18n.language] || fallback;
  return {locale};
};
