import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback
} from 'react';
import {AccessibilityInfo} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  format,
  compareDesc,
  startOfDay,
  subDays,
  addDays,
  isBefore,
  getTime
} from 'date-fns';

import {AppConfig} from './settings';
import {loadData, StatsData} from '../services/api';
import * as api from '../services/api/';
import {requestWithCache} from '../services/api/utils';
import {Symptoms} from '../services/i18n/symptoms';
import {CertificateContent} from '../providers/vaccine-cert-config/types';

export interface UserLocation {
  county?: string;
  locality?: string;
}

export interface Accessibility {
  reduceMotionEnabled: boolean;
  screenReaderEnabled: boolean;
}

export interface User {
  valid: boolean;
  sex?: string;
  ageRange?: string;
  location: UserLocation;
  tracking?: any[];
}

export interface Check {
  timestamp: number;
  symptoms: Symptoms;
  status?: 'p' | 'c' | 'u';
}

export interface CallBackData {
  iso: string;
  code: string;
  number: string;
  mobile: string;
}

export interface VaccineCertData {
  raw: string;
  content: CertificateContent;
  error?: Error;
}

interface State {
  initializing: boolean;
  loading: boolean | string;
  user?: User;
  data?: StatsData | null;
  checkInConsent: boolean;
  analyticsConsent: boolean;
  isCheckerCompleted: () => boolean;
  completedCheckerDate: string | null;
  quickCheckIn: boolean;
  checks: Check[];
  callBackData?: CallBackData;
  accessibility: Accessibility;
  completedExposureOnboarding: boolean;
  dpinNotificationExpiryDate: Date | null;
  tandcNotificationExpiryDate: Date | null;
  chartsTabIndex: number;
  uploadDate: Date | null;
  pendingCode?: string | null;
  vaccineCert?: VaccineCertData;
}

interface ApplicationContextValue extends State {
  uploadRequired?: boolean;
  setContext: (data: any) => Promise<void>;
  clearContext: () => Promise<void>;
  showActivityIndicator: (message?: string) => void;
  hideActivityIndicator: () => void;
  loadAppData: () => Promise<void>;
  checkIn: (
    sex: string,
    ageRange: string,
    location: UserLocation,
    symptoms: Symptoms,
    params?: {quickCheckIn: boolean}
  ) => Promise<void>;
}

const initialState = {
  initializing: true,
  loading: false,
  user: undefined,
  completedExposureOnboarding: false,
  accessibility: {
    reduceMotionEnabled: false,
    screenReaderEnabled: false
  }
};

// Used internally for comparisons, not displayed to user
const checkerStateDateFormat = 'dd/MM/yyyy';

const getIsCheckerCompleted = (completedCheckerDate: string | null) => {
  return () => {
    if (!completedCheckerDate) {
      return false;
    }
    const today = format(new Date(), checkerStateDateFormat);
    return today === completedCheckerDate;
  };
};

export const ApplicationContext = createContext(
  initialState as ApplicationContextValue
);

export interface API {
  user: string | null;
  consent: string | null;
  analyticsConsent: string | null;
  completedExposureOnboarding: string | null;
  appConfig: AppConfig;
  dpinDate: string | null;
  tandcDate: string | null;
  children: any;
}

export const AP = ({
  appConfig,
  user,
  consent,
  analyticsConsent,
  completedExposureOnboarding,
  dpinDate: currentDpinDate,
  tandcDate: currentTandcDate,
  children
}: API) => {
  const [state, setState] = useState<State>({
    initializing: true,
    loading: false,
    checkInConsent: consent === 'y',
    analyticsConsent: analyticsConsent === 'true',
    isCheckerCompleted: () => false,
    completedCheckerDate: null,
    quickCheckIn: false,
    checks: [],
    user: (user && JSON.parse(user as string)) || null,
    completedExposureOnboarding: completedExposureOnboarding === 'y',
    accessibility: {
      reduceMotionEnabled: false,
      screenReaderEnabled: false
    },
    dpinNotificationExpiryDate: null,
    tandcNotificationExpiryDate: null,
    chartsTabIndex: 0,
    uploadDate: null
  });

  const handleReduceMotionChange = (reduceMotionEnabled: boolean): void => {
    setState((s) => ({
      ...s,
      accessibility: {
        ...s.accessibility,
        reduceMotionEnabled: reduceMotionEnabled
      }
    }));
  };

  const handleScreenReaderChange = (screenReaderEnabled: boolean): void => {
    setState((s) => ({
      ...s,
      accessibility: {
        ...s.accessibility,
        screenReaderEnabled
      }
    }));
  };

  useEffect(() => {
    AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      handleReduceMotionChange
    );
    AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      handleScreenReaderChange
    );

    AccessibilityInfo.isReduceMotionEnabled().then(handleReduceMotionChange);
    AccessibilityInfo.isScreenReaderEnabled().then(handleScreenReaderChange);

    return () => {
      AccessibilityInfo.removeEventListener(
        'reduceMotionChanged',
        handleReduceMotionChange
      );
      AccessibilityInfo.removeEventListener(
        'screenReaderChanged',
        handleScreenReaderChange
      );
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      let callBackData: CallBackData;
      let checks: Check[] = [];
      let completedCheckerDate: string | null = null;
      let chartsTabIndex = 0;

      if (state.user) {
        const checksData = await SecureStore.getItemAsync('cti.checks');
        checks = checksData ? JSON.parse(checksData) : [];
        checks.sort((a, b) => compareDesc(a.timestamp, b.timestamp));

        if (checks.length) {
          completedCheckerDate = format(checks[0].timestamp, 'dd/MM/yyy');
        }

        chartsTabIndex = Number(
          await AsyncStorage.getItem('cti.chartsTabIndex')
        );
      }

      try {
        const ctiCallBack = await SecureStore.getItemAsync('cti.callBack');
        if (ctiCallBack) {
          callBackData = JSON.parse(ctiCallBack) as CallBackData;
        }
      } catch (err) {
        console.log('Error reading "cti.callBack" from SecureStore:', err);
      }

      try {
        const oldDpinDate = await SecureStore.getItemAsync('cti.dpinDate');
        if (currentDpinDate && oldDpinDate !== currentDpinDate) {
          await SecureStore.setItemAsync('cti.dpinDate', currentDpinDate);
          if (oldDpinDate) {
            await SecureStore.setItemAsync(
              'cti.dpinDateUpdate',
              addDays(new Date(), 2).toISOString()
            );
          }
        }
      } catch (err) {
        console.log('Error processing "cti.dpinDate"', err);
      }

      try {
        const oldTandcDate = await SecureStore.getItemAsync('cti.tandcDate');
        if (currentTandcDate && oldTandcDate !== currentTandcDate) {
          await SecureStore.setItemAsync('cti.tandcDate', currentTandcDate);
          if (oldTandcDate) {
            await SecureStore.setItemAsync(
              'cti.tandcDateUpdate',
              addDays(new Date(), 2).toISOString()
            );
          }
        }
      } catch (err) {
        console.log('Error processing "cti.tandcDate"', err);
      }

      let dpinNotificationExpiryDate: Date | null = null;
      try {
        const dpinUpdate = await SecureStore.getItemAsync('cti.dpinDateUpdate');
        dpinNotificationExpiryDate =
          (dpinUpdate && new Date(dpinUpdate)) || null;
      } catch (err) {
        console.log('Error processing "cti.dpinDateUpdate"', err);
      }

      let tandcNotificationExpiryDate: Date | null = null;
      try {
        const tandcUpdate = await SecureStore.getItemAsync(
          'cti.tandcDateUpdate'
        );
        tandcNotificationExpiryDate =
          (tandcUpdate && new Date(tandcUpdate)) || null;
      } catch (err) {
        console.log('Error processing "cti.tandcDateUpdate"', err);
      }

      let uploadDate: Date | null = null;
      try {
        const updateTime = await SecureStore.getItemAsync('cti.uploadDate');
        uploadDate = updateTime ? new Date(Number(updateTime)) : null;
      } catch (err) {
        console.log('Error processing "cti.uploadDate"', err);
      }

      let vaccineCert: CertificateContent | undefined;
      try {
        const data = await SecureStore.getItemAsync('cti.vaccineCert');
        vaccineCert = JSON.parse(data);
      } catch (err) {
        console.log('Error processing "cti.vaccineCert"', err);
      }

      const isCheckerCompleted = getIsCheckerCompleted(completedCheckerDate);

      setState((s) => ({
        ...s,
        initializing: false,
        isCheckerCompleted,
        completedCheckerDate,
        chartsTabIndex,
        checks,
        callBackData: callBackData,
        dpinNotificationExpiryDate,
        tandcNotificationExpiryDate,
        uploadDate,
        vaccineCert
      }));
    };

    try {
      load();
    } catch (err) {
      console.log('App init error:', err);
      setState((s) => ({...s, initializing: false}));
    }
  }, []);

  const loadAppDataRef = useCallback(async () => {
    const {data} = await requestWithCache('cti.statsData', loadData);
    return setState((s) => ({...s, loading: false, data}));
  }, []);

  const setContext = async (data: Partial<State>) => {
    setState((s) => ({...s, ...data}));
    if (data.user) {
      await AsyncStorage.setItem('cti.user', JSON.stringify(data.user));
    }
    if (data.checkInConsent) {
      await AsyncStorage.setItem('cti.checkInConsent', 'y');
    }
    if (data.analyticsConsent !== undefined) {
      await AsyncStorage.setItem(
        'analyticsConsent',
        String(data.analyticsConsent)
      );
      await SecureStore.setItemAsync(
        'analyticsConsent',
        String(data.analyticsConsent)
      );
    }
    if (data.callBackData) {
      await SecureStore.setItemAsync(
        'cti.callBack',
        JSON.stringify(data.callBackData)
      );
    }
    if (data.completedExposureOnboarding) {
      await AsyncStorage.setItem('cti.completedExposureOnboarding', 'y');
    }
    if (data.chartsTabIndex !== undefined) {
      await AsyncStorage.setItem(
        'cti.chartsTabIndex',
        `${data.chartsTabIndex}`
      );
    }
    if (data.uploadDate !== undefined) {
      await SecureStore.setItemAsync(
        'cti.uploadDate',
        data.uploadDate ? String(getTime(data.uploadDate)) : ''
      );
    }
    if (data.vaccineCert !== undefined) {
      await SecureStore.setItemAsync(
        'cti.vaccineCert',
        JSON.stringify(data.vaccineCert)
      );
    }
  };

  const clearContext = async (): Promise<void> => {
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('cti.checks');
    await SecureStore.deleteItemAsync('uploadToken');
    await SecureStore.deleteItemAsync('cti.callBack');
    await SecureStore.deleteItemAsync('cti.tandcDateUpdate');
    await SecureStore.deleteItemAsync('cti.dpinDateUpdate');
    await SecureStore.deleteItemAsync('analyticsConsent');
    await SecureStore.deleteItemAsync('cti.uploadDate');
    await SecureStore.deleteItemAsync('cti.vaccineCert');
    await AsyncStorage.removeItem('cti.language');
    await AsyncStorage.removeItem('cti.user');
    await AsyncStorage.removeItem('cti.checkInConsent');
    await AsyncStorage.removeItem('cti.showDebug');
    await AsyncStorage.removeItem('analyticsConsent');
    await AsyncStorage.removeItem('cti.completedExposureOnboarding');
    await AsyncStorage.removeItem('cti.statsData');
    await AsyncStorage.removeItem('cti.settings');
    await AsyncStorage.removeItem('cti.chartsTabIndex');
    await AsyncStorage.removeItem('cti.restartScreen');

    setState((s) => ({
      ...s,
      data: undefined,
      analyticsConsent: false,
      checkInConsent: false,
      completedChecker: false,
      completedCheckerDate: null,
      isCheckerCompleted: getIsCheckerCompleted(null),
      quickCheckIn: false,
      checks: [],
      user: undefined,
      callBackData: undefined,
      completedExposureOnboarding: false,
      paused: null,
      vaccineCert: undefined
    }));
  };

  const showActivityIndicator = (message?: string) => {
    setState((s) => ({...s, loading: message || true}));
  };
  const showActivityIndicatorRef = useCallback(showActivityIndicator, []);

  const hideActivityIndicator = () => setState((s) => ({...s, loading: false}));
  const hideActivityIndicatorRef = useCallback(hideActivityIndicator, []);

  const checkIn = async (
    sex: string,
    ageRange: string,
    location: UserLocation,
    symptoms: any,
    {quickCheckIn = false} = {}
  ) => {
    const timestamp = Date.now();

    const currentCheck: Check = {
      timestamp,
      symptoms
    };

    const checks = [currentCheck, ...state.checks];

    try {
      const lastAllowedDate = startOfDay(
        subDays(new Date(), appConfig.checkInMaxAge)
      );

      // remove checks that are old before storing them on the device
      let check = checks.length > 0;
      while (check) {
        const lastItem = checks[checks.length - 1];
        check = isBefore(lastItem.timestamp, lastAllowedDate);
        if (check) {
          checks.pop();
        }
      }

      const completedCheckerDate = format(timestamp, checkerStateDateFormat);
      const isCheckerCompleted = getIsCheckerCompleted(completedCheckerDate);

      await setContext({
        checks,
        isCheckerCompleted,
        completedCheckerDate,
        quickCheckIn,
        user: {
          ...state.user,
          sex,
          ageRange,
          location
        } as User
      });

      SecureStore.setItemAsync('cti.checks', JSON.stringify(checks));

      api.checkIn(checks, {
        sex: state.user!.sex!,
        ageRange: state.user!.ageRange!,
        location: state.user!.location!,
        ok: Object.values(checks[0].symptoms).every((r) => r === 0)
      });
    } catch (err) {
      console.log('Context checkIn error: ', err);
    }
  };

  const value: ApplicationContextValue = {
    ...state,
    setContext,
    clearContext,
    showActivityIndicator: showActivityIndicatorRef,
    hideActivityIndicator: hideActivityIndicatorRef,
    loadAppData: loadAppDataRef,
    checkIn
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const ApplicationProvider = AP;

export const useApplication = () => useContext(ApplicationContext);
