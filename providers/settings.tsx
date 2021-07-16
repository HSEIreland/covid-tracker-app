import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
  Reducer,
  useMemo
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import i18n, {TFunction} from 'i18next';
import {useTranslation, UseTranslationResponse} from 'react-i18next';
import {TraceConfiguration} from 'react-native-exposure-notification-service';
import * as SecureStore from 'expo-secure-store';
import {Duration} from 'date-fns';

import * as api from '../services/api';
import {requestWithCache} from '../services/api/utils';
import {fallback} from '../services/i18n/common';
import {Platform} from 'react-native';

export interface BasicItem {
  label: string;
  value: any;
}

export const reminderKeys = [
  'exposureReminder',
  'caseReminder',
  'restrictionEnd' // "restricted movement" after exposure ("isolation" is after diagnosis)
] as const;
export type ReminderKey = typeof reminderKeys[number];
type ReminderConfig = Record<ReminderKey, ReminderOption>;

export interface AppConfig {
  checkInMaxAge: number;
  riskGroupMinAge: number;
  hsePhoneNumber: string;
  latestVersion: string | null;
  dateFormat: string;
  durations: ReminderConfig;
  codeLength: number;
  deepLinkLength: number;
}

interface AgeOption extends BasicItem {
  riskGroup?: boolean;
}

export interface ReminderOption extends Duration {
  earliest?: string; // 24hr time like '08:00'
  latest?: string; // 24hr time like '21:00'
  at?: string; // 24hr time like '12:00'; overrides earliest and latest
}
// Don't turn these keys into numbers when parsing API settings:
const reminderOptionStringKeys = ['earliest', 'latest', 'at'];

interface CheckerThankYouText {
  noSymptomsWell: string;
  noSymptomsNotWell: string;
  riskGroup: string;
  recovered: string;
  virusIsolation: string;
}

interface DbTextContextValue {
  sexOptions: BasicItem[];
  ageRangeOptions: AgeOption[];
  closeContactInfo: string;
  closeContactAlert: string;
  closeContactCallBack: string;
  closeContactCallbackQueued: string;
  dpinText: string;
  tandcText: string;
  checkerThankYouText: CheckerThankYouText;
  tutorialVideoID: string | null;
}

type GetTranslatedTextFn = (
  t: TFunction,
  i18nCurrent: UseTranslationResponse['i18n']
) => DbTextContextValue;

interface SettingsContextValue {
  loaded: boolean;
  loadedTime: Date | null;
  reload: () => void;
  appConfig: AppConfig;
  traceConfiguration: TraceConfiguration;
  user: string | null;
  consent: string | null;
  completedExposureOnboarding: string | null;
  analyticsConsent: string | null;
  dpinDate: string | null;
  tandcDate: string | null;
  getTranslatedDbText: GetTranslatedTextFn;
}

interface SettingsProviderProps {
  children: ReactNode;
}

type ApiSettings = Record<string, any>;
type DeepSettings = {
  [key: string]: string | DeepSettings;
};

const defaultDbText: DbTextContextValue = {
  sexOptions: [],
  ageRangeOptions: [],
  closeContactInfo: '',
  closeContactAlert: '',
  closeContactCallBack: '',
  closeContactCallbackQueued: '',
  dpinText: '',
  tandcText: '',
  checkerThankYouText: {} as DbTextContextValue['checkerThankYouText'],
  tutorialVideoID: null
};

const daytime = {earliest: '08:00', latest: '21:00'};

const defaultSettings: SettingsContextValue = {
  loaded: false,
  loadedTime: null,
  reload: () => {},
  user: null,
  consent: null,
  analyticsConsent: null,
  completedExposureOnboarding: null,
  appConfig: {
    checkInMaxAge: 28,
    riskGroupMinAge: 60,
    hsePhoneNumber: 'XXXX-XXXXXX',
    latestVersion: null,
    dateFormat: 'do LLL yyyy',
    durations: {
      restrictionEnd: {days: 14, at: '18:00'},
      exposureReminder: {days: 2, ...daytime},
      caseReminder: {days: 2, ...daytime}
    },
    codeLength: 6, // digits,
    deepLinkLength: 16
  },
  traceConfiguration: {
    exposureCheckInterval: 180,
    storeExposuresFor: 14
  },
  dpinDate: null,
  tandcDate: null,
  getTranslatedDbText: () => defaultDbText
};

const parseReminderOption = (obj: Record<keyof ReminderOption, string>) =>
  Object.entries(obj).reduce(
    (items, [key, value]) => ({
      ...items,
      [key]: reminderOptionStringKeys.includes(key) ? value : Number(value)
    }),
    {} as ReminderOption
  );

const getDbText = (
  apiSettings: ApiSettings,
  key: string,
  acceptFallbackLanguage = false
): string | DeepSettings => {
  const data =
    (apiSettings[key] &&
      (apiSettings[key]![i18n.language] ||
        (acceptFallbackLanguage && apiSettings[key][fallback]))) ||
    '';
  return getCleanedText(data);
};

const getCleanedText = (data: string | DeepSettings): string | DeepSettings => {
  if (typeof data === 'string') {
    return data.replace(/\\n/g, '\n').replace(/(^|[^\n])\n(?!\n)/g, '$1\n\n');
  } else {
    return Object.entries(data).reduce(
      (textObj, [key, value]) => ({
        ...textObj,
        [key]: getCleanedText(value)
      }),
      {} as DeepSettings
    );
  }
};

export const SettingsContext = createContext<SettingsContextValue>(
  defaultSettings
);
export const DbTextContext = createContext<DbTextContextValue>(defaultDbText);

interface SettingsReducerAction {
  type: 'set' | 'loaded' | 'reload';
  state?: SettingsContextValue;
  loaded?: boolean;
}

const settingsReducer: Reducer<SettingsContextValue, SettingsReducerAction> = (
  oldState,
  {type, state, loaded}
) => {
  switch (type) {
    case 'set':
      return state || ({} as SettingsContextValue);
    case 'loaded':
      return {...oldState, loaded} as SettingsContextValue;
    case 'reload':
      // Quietly reload settings from API in the background
      return {...oldState, loadedTime: null} as SettingsContextValue;
  }
};

export const SettingsProvider: FC<SettingsProviderProps> = ({children}) => {
  const {t, i18n: i18nCurrent} = useTranslation();
  const [state, dispatchState] = useReducer(settingsReducer, defaultSettings);

  useEffect(() => {
    const loadSettingsAsync = async () => {
      const [
        user,
        consent,
        completedExposureOnboarding,
        analyticsConsent
      ] = await AsyncStorage.multiGet([
        'cti.user',
        'cti.checkInConsent',
        'cti.completedExposureOnboarding',
        'analyticsConsent'
      ]);
      const analyticsConsentSecure = await SecureStore.getItemAsync(
        'analyticsConsent'
      );
      const {data} = await requestWithCache('cti.settings', api.loadSettings);

      const apiSettings: ApiSettings = data ?? {};

      const appConfig: AppConfig = {...defaultSettings.appConfig};
      if (apiSettings.checkInMaxAge) {
        appConfig.checkInMaxAge = Number(apiSettings.checkInMaxAge);
      }
      if (apiSettings.riskGroupMinAge) {
        appConfig.riskGroupMinAge = Number(apiSettings.riskGroupMinAge);
      }
      if (apiSettings.hsePhoneNumber) {
        appConfig.hsePhoneNumber = apiSettings.hsePhoneNumber;
      }
      if (apiSettings.latestAppVersion) {
        appConfig.latestVersion = apiSettings.latestAppVersion;
      }
      if (apiSettings.latestVersion) {
        appConfig.latestVersion = apiSettings.latestVersion[Platform.OS];
      }
      if (apiSettings.dateFormat) {
        appConfig.dateFormat = apiSettings.dateFormat;
      }
      if (apiSettings.durations?.restrictionEnd) {
        appConfig.durations.restrictionEnd = parseReminderOption(
          apiSettings.durations.restrictionEnd
        );
      }
      if (apiSettings.durations?.exposureReminder) {
        appConfig.durations.exposureReminder = parseReminderOption(
          apiSettings.durations.exposureReminder
        );
      }
      if (apiSettings.durations?.caseReminder) {
        appConfig.durations.caseReminder = parseReminderOption(
          apiSettings.durations.caseReminder
        );
      }
      if (apiSettings.codeLength) {
        appConfig.codeLength = Number(apiSettings.codeLength);
      }
      if (apiSettings.deepLinkLength) {
        appConfig.deepLinkLength = Number(apiSettings.deepLinkLength);
      }

      const tc: TraceConfiguration = {
        ...defaultSettings.traceConfiguration
      };
      if (apiSettings.exposureCheckInterval) {
        tc.exposureCheckInterval = Number(apiSettings.exposureCheckInterval);
      }
      if (apiSettings.storeExposuresFor) {
        tc.storeExposuresFor = Number(apiSettings.storeExposuresFor);
      }
      const dpinDate = apiSettings.dpinDate || null;
      const tandcDate = apiSettings.tandcDate || null;

      const getTranslatedDbText = makeGetTranslatedDbText(apiSettings);

      dispatchState({
        type: 'set',
        state: {
          loaded: true,
          loadedTime: new Date(),
          reload: () => dispatchState({type: 'reload'}),
          user: user[1],
          consent: consent[1],
          analyticsConsent:
            analyticsConsent[1] === 'true' || analyticsConsentSecure === 'true'
              ? 'true'
              : 'false',
          completedExposureOnboarding: completedExposureOnboarding[1],
          appConfig,
          traceConfiguration: tc,
          dpinDate,
          tandcDate,
          getTranslatedDbText
        }
      });
    };

    try {
      if (!state.loadedTime) {
        loadSettingsAsync();
      }
    } catch (err) {
      console.log(err, 'Error loading settings');
      dispatchState({type: 'loaded', loaded: true});
    }
  }, [state.loadedTime]); // Runs only on first mount or on `reload()`

  const translatedDbText = useMemo(
    () => state.getTranslatedDbText(t, i18nCurrent),
    // Re-apply saved db text on language change. Since getTranslatedDbText modifies i18n object contents,
    // to ensure future updates can't cause an infinite loop, exclude useTranslation returns from deps array.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [state, i18nCurrent.language]
  );
  return (
    <SettingsContext.Provider value={state}>
      <DbTextContext.Provider value={translatedDbText}>
        {children}
      </DbTextContext.Provider>
    </SettingsContext.Provider>
  );
};
export const useSettings = () => useContext(SettingsContext);
export const useDbText = () => useContext(DbTextContext);

function getSexOptions(t: TFunction) {
  return [
    {label: t('sex:female'), value: 'f'},
    {label: t('sex:male'), value: 'm'},
    {label: t('common:preferNotToSay'), value: 'u'}
  ];
}

function getAgeRangeOptions(t: TFunction) {
  return [
    {label: t('common:preferNotToSay'), value: 'u'},
    {label: '16-39', value: '16-39'},
    {label: '40-59', value: '40-59'},
    {label: '60+', value: '60+', riskGroup: true}
  ];
}

function addI18nBundle(
  bundle: any,
  namespace: string,
  i18nCurrent: UseTranslationResponse['i18n']
) {
  if (bundle) {
    i18nCurrent.addResourceBundle(
      i18nCurrent.language,
      namespace,
      bundle,
      true,
      true
    );
  }
}

function makeGetTranslatedDbText(apiSettings: ApiSettings) {
  const getTranslatedText: GetTranslatedTextFn = (t, i18nCurrent) => {
    // Allow any app text to be overridden from the API
    const textOverrides =
      apiSettings.textOverrides &&
      apiSettings.textOverrides[i18nCurrent.language];

    if (textOverrides) {
      Object.entries(textOverrides).forEach(([namespace, bundle]) => {
        addI18nBundle(bundle, namespace, i18nCurrent);
      });
    }

    const closeContactInfo =
      getDbText(apiSettings, 'closeContactInfo3') ||
      t('closeContactInfo:content');
    const closeContactAlert =
      getDbText(apiSettings, 'closeContactAlert3') ||
      t('closeContactAlert:content');
    const closeContactCallBack =
      getDbText(apiSettings, 'closeContactCallBack3') ||
      t('closeContactAlert:call-back');
    const closeContactCallbackQueued =
      getDbText(apiSettings, 'closeContactCallBackQueued') ||
      t('closeContactAlert:callback-queued');

    const dpinText =
      getDbText(apiSettings, 'dpinText', true) ||
      t('dataProtectionPolicy:text');

    const tandcText =
      getDbText(apiSettings, 'tandcText', true) || t('tandcPolicy:text');

    const checkerThankYouText: CheckerThankYouText = Object.assign(
      {
        noSymptomsWell: t('checker:noSymptomsWell:message'),
        noSymptomsNotWell: t('checker:noSymptomsNotWell:message'),
        riskGroup: t('checker:riskGroup:warning'),
        recovered: t('checker:recovered'),
        virusIsolation: t('checker:virusIsolation')
      },
      getDbText(apiSettings, 'checkerThankYouText')
    );

    const tutorialVideoID = getDbText(apiSettings, 'tutorialVideoID') || null;

    // Add reminder db text as i18n resources to preserve placeholder subsitution
    const reminderDbText =
      apiSettings.reminderText &&
      apiSettings.reminderText[i18nCurrent.language];

    if (reminderDbText) {
      reminderKeys.forEach((namespace) => {
        const bundle = reminderDbText[namespace];
        addI18nBundle(bundle, namespace, i18nCurrent);
      });
    }

    return {
      sexOptions: getSexOptions(t),
      ageRangeOptions: getAgeRangeOptions(t),
      closeContactInfo,
      closeContactAlert,
      closeContactCallBack,
      closeContactCallbackQueued,
      dpinText,
      tandcText,
      checkerThankYouText,
      tutorialVideoID
    } as DbTextContextValue;
  };

  return getTranslatedText;
}
