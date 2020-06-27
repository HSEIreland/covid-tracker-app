import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import i18n, {TFunction} from 'i18next';
import {useTranslation} from 'react-i18next';

import * as api from '../services/api';
import { isObject } from 'formik';
import { fallback } from '../services/i18n/common';

export interface BasicItem {
  label: string;
  value: any;
}

export interface AppConfig {
  checkInMaxAge: number;
  riskGroupMinAge: number;
  hsePhoneNumber: string;
}

export interface TraceConfiguration {
  exposureCheckInterval: number;
  storeExposuresFor: number;
  fileLimit: number;
  fileLimitiOS: number;
}

interface AgeOption extends BasicItem {
  riskGroup?: boolean;
}

interface CheckerThankYouText {
  noSymptomsWell?: string;
  noSymptomsNotWell?: string;
  riskGroup?: string;
  recovered?: string;
  virusIsolation?: string;
}

interface SettingsContextValue {
  loaded: boolean;
  appConfig: AppConfig;
  traceConfiguration: TraceConfiguration;
  user: string | null;
  consent: string | null;
  sexOptions: BasicItem[];
  ageRangeOptions: AgeOption[];
  exposedTodo: string;
  dpinText: string;
  tandcText: string;
  checkerThankYouText: CheckerThankYouText;
}

const defaultValue: SettingsContextValue = {
  loaded: false,
  user: null,
  consent: null,
  appConfig: {
    checkInMaxAge: 28,
    riskGroupMinAge: 60,
    hsePhoneNumber: 'XXXX-XXXXXX'
  },
  traceConfiguration: {
    exposureCheckInterval: 120,
    storeExposuresFor: 14,
    fileLimit: 1,
    fileLimitiOS: 2
  },
  sexOptions: [],
  ageRangeOptions: [],
  exposedTodo: '',
  dpinText: '',
  tandcText: '',
  checkerThankYouText: {}
};

export const SettingsContext = createContext<SettingsContextValue>(
  defaultValue
);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: FC<SettingsProviderProps> = ({children}) => {
  const {t} = useTranslation();
  const [state, setState] = useState<SettingsContextValue>(defaultValue);

  useEffect(() => {
    const loadSettingsAsync = async () => {
      const [user, consent] = await AsyncStorage.multiGet([
        'cti.user',
        'cti.checkInConsent'
      ]);

      let apiSettings;
      try {
        apiSettings = await api.loadSettings();
      } catch (e) {
        console.log('Error loading settings: ', e);
        apiSettings = {};
      }

      const appConfig = Object.assign({}, defaultValue.appConfig, {
        checkInMaxAge: Number(apiSettings.checkInMaxAge),
        riskGroupMinAge: Number(apiSettings.riskGroupMinAge),
        hsePhoneNumber: apiSettings.hsePhoneNumber
      });

      const traceConfiguration = Object.assign(
        {},
        defaultValue.traceConfiguration,
        {
          exposureCheckInterval: Number(apiSettings.exposureCheckInterval),
          storeExposuresFor: Number(apiSettings.storeExposuresFor),
          fileLimit: Number(apiSettings.fileLimit),
          fileLimitiOS: Number(apiSettings.fileLimitiOS)
        }
      );
      const getDbText = (apiSettings: any, key: string):any => {
        let data = apiSettings[key] && (apiSettings[key][i18n.language] || apiSettings[key][fallback]) || '';

        if (isObject(data)) {
          const item: any = {}
          Object.keys(data).forEach((key: string) => {
            item[key] = data[key].replace(/\\n/g, '\n').replace(/(^|[^\n])\n(?!\n)/g, '$1\n\n');
          });
          return item;
        } else {
          return data.replace(/\\n/g, '\n').replace(/(^|[^\n])\n(?!\n)/g, '$1\n\n');
        }
      }

      const exposedTodo = getDbText(apiSettings, 'exposedTodoList') ||
         t('closeContact:todo:list');

      const dpinText = getDbText(apiSettings, 'dpinText') ||
        t('dataProtectionPolicy:text');

      const tandcText = getDbText(apiSettings, 'tandcText') ||
        t('tandcPolicy:text');

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

      setState({
        loaded: true,
        user: user[1],
        consent: consent[1],
        appConfig,
        traceConfiguration,
        sexOptions: getSexOptions(t),
        ageRangeOptions: getAgeRangeOptions(t),
        exposedTodo,
        dpinText,
        tandcText,
        checkerThankYouText
      });
    };

    try {
      loadSettingsAsync();
    } catch (err) {
      console.log(err, 'Error loading settings');
      setState({...state, loaded: true});
    }
  }, []);

  return (
    <SettingsContext.Provider value={state}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

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
