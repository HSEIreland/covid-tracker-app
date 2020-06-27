import React, {useEffect, useState, createContext, useContext} from 'react';
import {NativeEventEmitter, Alert, Platform} from 'react-native';
import ExposureNotification from 'react-native-exposure-notification-service';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-community/async-storage';
import {useApplication} from './context';
import {usePermissions, PermissionStatus} from './permissions';
import {urls} from '../constants/urls';
import {useSettings} from './settings';
import {useTranslation} from 'react-i18next';
import {BUILD_VERSION, HIDE_DEBUG} from 'react-native-dotenv';

const emitter = new NativeEventEmitter(ExposureNotification);

export enum StatusState {
  unknown = 'unknown',
  restricted = 'restricted',
  disabled = 'disabled',
  active = 'active'
}

export enum AuthorisedStatus {
  granted = 'granted',
  blocked = 'blocked',
  unknown = 'unknown'
}

export enum StatusType {
  bluetooth = 'bluetooth',
  exposure = 'exposure'
}

interface Status {
  state: StatusState;
  type?: StatusType[];
}

interface State {
  status: Status;
  supported: Boolean;
  canSupport: Boolean;
  isAuthorised: AuthorisedStatus;
  enabled: Boolean;
  contacts?: String[];
  tracingAvailable?: Boolean;
}

interface ExposureContextValue extends State {
  start: () => void;
  stop: () => void;
  configure: () => void;
  checkExposure: (readDetails: any) => void;
  getDiagnosisKeys: () => Promise<any[]>;
  exposureEnabled: () => Promise<void>;
  authoriseExposure: () => Promise<void>;
  deleteAllData: () => Promise<void>;
  supportsExposureApi: () => Promise<void>;
  getCloseContacts: () => Promise<String[]>;
  getLogData: () => Promise<{}>;
  triggerUpdate: () => Promise<void>;
  deleteExposureData: () => Promise<void>;
}

const initialState = {
  status: {
    state: StatusState.unknown
  },
  supported: false,
  canSupport: false,
  isAuthorised: AuthorisedStatus.unknown,
  enabled: false,
  contacts: []
};

export const ExposureContext = createContext<ExposureContextValue>({
  ...initialState,
  start: () => {},
  stop: () => {},
  configure: () => {},
  checkExposure: () => {},
  getDiagnosisKeys: () => Promise.resolve([]),
  exposureEnabled: () => Promise.resolve(),
  authoriseExposure: () => Promise.resolve(),
  deleteAllData: () => Promise.resolve(),
  supportsExposureApi: () => Promise.resolve(),
  getCloseContacts: () => Promise.resolve([]),
  getLogData: () => Promise.resolve({}),
  triggerUpdate: () => Promise.resolve(),
  deleteExposureData: () => Promise.resolve()
});

export interface props {
  children: any;
}

export function ExposureProvider({children}: props) {
  const [state, setState] = useState(initialState);
  const app = useApplication();
  const {permissions} = usePermissions();
  const {traceConfiguration} = useSettings();
  const {t} = useTranslation();

  useEffect(() => {
    function handleEvent(
      ev: {onStatusChanged?: Status; status?: any; scheduledTask?: any} = {}
    ) {
      console.log(`exposureEvent: ${JSON.stringify(ev)}`);
      if (ev.onStatusChanged) {
        return validateStatus(ev.onStatusChanged);
      }
    }

    let subscription = emitter.addListener('exposureEvent', handleEvent);

    return () => {
      subscription.remove();
      emitter.removeListener('exposureEvent', handleEvent);
    };
  }, []);

  useEffect(() => {
    async function checkSupportAndStart() {
      await supportsExposureApi();
      if (app.user) {
        if (permissions.exposure.status === PermissionStatus.Allowed) {
          configure().then(() => start());
        }
      }
    }

    checkSupportAndStart();
  }, [permissions]);

  const supportsExposureApi = async function () {
    const can = await ExposureNotification.canSupport();
    const is = await ExposureNotification.isSupported();
    const status = (await ExposureNotification.status()) as Status;
    const enabled = await ExposureNotification.exposureEnabled();
    const isAuthorised = await ExposureNotification.isAuthorised();

    setState((s) => ({
      ...s,
      status,
      enabled,
      canSupport: can,
      supported: is,
      isAuthorised
    }));

    if (enabled) {
      await configure();
      getCloseContacts();
    }

    checkForUpgradedPrompt(can, is, status);
  };

  const validateStatus = async (status?: Status) => {
    let newStatus = status || ((await ExposureNotification.status()) as Status);
    const enabled = await ExposureNotification.exposureEnabled();
    setState((s) => ({...s, status: newStatus, enabled}));
  };

  const start = async () => {
    try {
      await ExposureNotification.start();
      await validateStatus();
      await getCloseContacts();
    } catch (err) {
      console.log('start err', err);
    }
  };

  const stop = async () => {
    try {
      await ExposureNotification.stop();
      await validateStatus();
    } catch (err) {
      console.log('stop err', err);
    }
  };

  const configure = async () => {
    try {
      const authToken = await SecureStore.getItemAsync('token');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const analyticsOptin = await SecureStore.getItemAsync('analyticsConsent');
      let mobile = ''
      const ctiCallBack = await SecureStore.getItemAsync('cti.callBack');
      if (ctiCallBack) {
        const callBackData = JSON.parse(ctiCallBack)
        mobile = (callBackData && callBackData.mobile) || '';
      }

      const iosLimit =  traceConfiguration.fileLimitiOS > 0 ? traceConfiguration.fileLimitiOS : traceConfiguration.fileLimit
      const config = {
        exposureCheckFrequency: traceConfiguration.exposureCheckInterval,
        serverURL: urls.api,
        authToken,
        refreshToken,
        storeExposuresFor: traceConfiguration.storeExposuresFor,
        fileLimit: Platform.OS === 'ios' ? iosLimit : traceConfiguration.fileLimit,
        version: BUILD_VERSION,
        notificationTitle: t('closeContactNotification:title'),
        notificationDesc: t('closeContactNotification:description'),
        callbackNumber: mobile,
        analyticsOptin: analyticsOptin && analyticsOptin === 'true',
        debug: HIDE_DEBUG !== 'y'
      };

      await ExposureNotification.configure(config);

      return true;
    } catch (err) {
      console.log('configure err', err);
      return false;
    }
  };

  const checkExposure = (readDetails: any) => {
    ExposureNotification.checkExposure(readDetails);
  };

  const getDiagnosisKeys = () => {
    return ExposureNotification.getDiagnosisKeys();
  };

  const exposureEnabled = async () => {
    return ExposureNotification.exposureEnabled();
  };

  const authoriseExposure = async () => {
    return ExposureNotification.authoriseExposure();
  };

  const deleteAllData = async () => {
    await ExposureNotification.deleteAllData();
    await validateStatus();
  };

  const getCloseContacts = async () => {
    try {
      if (permissions.exposure.status === PermissionStatus.Allowed) {
        await configure();
        const contacts = await ExposureNotification.getCloseContacts();
        setState((s) => ({...s, contacts}));
        return contacts;
      }
      return [];
    } catch (err) {
      console.log('getCloseContacts err', err);
      return null;
    }
  };

  const getLogData = async () => {
    try {
      const data = await ExposureNotification.getLogData();
      return data;
    } catch (err) {
      console.log('getLogData err', err);
      return null;
    }
  };

  const triggerUpdate = async () => {
    try {
      const result = await ExposureNotification.triggerUpdate();
      console.log('trigger update: ', result);
      // this will not occur after play services update available to public
      if (result === 'api_not_available') {
        Alert.alert(
          'API Not Available',
          'Google Exposure Notifications API not available on this device yet'
        );
      }
      return result;
    } catch (e) {
      console.log('trigger update error', e);
    }
  };

  const checkForUpgradedPrompt = async (
    canSupport: Boolean,
    isSupported: Boolean,
    status: Status
  ) => {
    const value = await SecureStore.getItemAsync('supportPossible');
    if (value && value === 'true') {
      if (
        canSupport &&
        isSupported &&
        status.state !== StatusState.active &&
        status.state !== StatusState.restricted
      ) {
        setState((s) => ({...s, tracingAvailable: true}));
      } else if (isSupported) {
        try {
          SecureStore.deleteItemAsync('supportPossible');
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  const deleteExposureData = async () => {
    try {
      await ExposureNotification.deleteExposureData();
    } catch (e) {
      console.log('delete exposure data error', e);
    }
  };

  const value: ExposureContextValue = {
    ...state,
    start,
    stop,
    configure,
    checkExposure,
    getDiagnosisKeys,
    exposureEnabled,
    authoriseExposure,
    deleteAllData,
    supportsExposureApi,
    getCloseContacts,
    getLogData,
    triggerUpdate,
    deleteExposureData
  };

  return (
    <ExposureContext.Provider value={value}>
      {children}
    </ExposureContext.Provider>
  );
}

export const useExposure = () => useContext(ExposureContext);
