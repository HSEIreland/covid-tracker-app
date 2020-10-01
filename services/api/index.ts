import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {format} from 'date-fns';
// To enable certificate pinning uncomment line below, add your cert files and reference them in request method below
// import {fetch} from 'react-native-ssl-pinning';
import NetInfo from '@react-native-community/netinfo';
import {ENV, TEST_TOKEN, SAFETYNET_KEY} from '@env';
import RNGoogleSafetyNet from 'react-native-google-safetynet';
import RNIOS11DeviceCheck from 'react-native-ios11-devicecheck';
import {urls} from '../../constants/urls';
import {Check, UserLocation} from '../../providers/context';
import {isMountedRef, navigationRef} from '../../navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { getVersion } from 'react-native-exposure-notification-service';

interface CheckIn {
  sex: string;
  ageRange: string;
  location: UserLocation;
  ok: boolean;
}

interface DeviceCheckData {
  platform: string;
  deviceVerificationPayload: string;
}

export const getDeviceCheckData = async (
  nonce: string
): Promise<DeviceCheckData> => {
  if (Platform.OS === 'android') {
    return {
      platform: 'android',
      deviceVerificationPayload: await RNGoogleSafetyNet.sendAttestationRequestJWT(
        nonce,
        SAFETYNET_KEY
      )
    };
  } else {
    if (ENV !== 'production' && TEST_TOKEN) {
      return {
        platform: 'test',
        deviceVerificationPayload: TEST_TOKEN
      };
    }
    return {
      platform: 'ios',
      deviceVerificationPayload: await RNIOS11DeviceCheck.getToken()
    };
  }
};

const connected = async (retry = false): Promise<boolean> => {
  const networkState = await NetInfo.fetch();
  if (networkState.isInternetReachable && networkState.isConnected) {
    return true;
  }

  if (retry) {
    throw new Error('Network Unavailable');
  } else {
    await new Promise((r) => setTimeout(r, 1000));
    await connected(true);
    return true;
  }
};

export const request = async (url: string, cfg: any) => {
  await connected();
  const {authorizationHeaders = false, ...config} = cfg;

  if (authorizationHeaders) {
    let bearerToken = await SecureStore.getItemAsync('token');
    if (!bearerToken) {
      bearerToken = await createToken();
    }

    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${bearerToken}`;
  }

  let isUnauthorised;
  let resp;
  try {
    resp = await fetch(url, {
      ...config,
      // timeoutInterval: 30000,
      // sslPinning: {
      //  certs: ['certx', 'certy']
      //}
    });
    isUnauthorised = resp && resp.status === 401;
  } catch (e) {
    if (!authorizationHeaders || e.status !== 401) {
      throw e;
    }
    isUnauthorised = true;
  }

  if (authorizationHeaders && isUnauthorised) {
    let newBearerToken = await createToken();
    const newConfig = {
      ...config,
      headers: {...config.headers, Authorization: `Bearer ${newBearerToken}`}
    };

    return fetch(url, {
      ...newConfig,
      // timeoutInterval: 30000,
      // sslPinning: {
      //   certs: ['certx', 'certy']
      // }
    });
  }

  return resp;
};

async function createToken(): Promise<string> {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');

    const req = await request(`${urls.api}/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`
      },
      body: JSON.stringify({})
    });
    if (!req) {
      throw new Error('Invalid response');
    }
    const resp = await req.json();

    if (!resp.token) {
      throw new Error('Error getting token');
    }

    await SecureStore.setItemAsync('token', resp.token);

    saveMetric({event: METRIC_TYPES.TOKEN_RENEWAL});

    return resp.token;
  } catch (err) {
    // We get a 401 Unauthorized if the refresh token is missing, invalid or has expired
    // If this is the case, send the user back into onboarding to activate & generate a new one
    if (err.status === 401 && isMountedRef.current && navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{name: 'over16'}]
      });
    }
    return '';
  }
}

export class RegisterError extends Error {
  constructor(message: string, code: number) {
    super(message);
    this.name = 'RegisterError';
    // @ts-ignore
    this.code = code;
  }
}

export async function register(): Promise<{
  token: string;
  refreshToken: string;
}> {
  let nonce;
  try {
    const registerResponse = await request(`${urls.api}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!registerResponse) {
      throw new Error('Invalid register response');
    }
    const registerResult = await registerResponse.json();

    nonce = registerResult.nonce;
  } catch (err) {
    console.log('Register error: ', err);
    if (err.json) {
      const errBody = await err.json();
      throw new RegisterError(errBody.message, errBody.code || 1001);
    }
    throw new RegisterError(err.message, 1002);
  }

  let deviceCheckData;
  try {
    deviceCheckData = await getDeviceCheckData(nonce);
  } catch (err) {
    console.log('Device check error: ', err);
    throw new RegisterError(err.message, 1003);
  }

  try {
    const verifyResponse = await request(`${urls.api}/register`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({nonce, ...deviceCheckData})
    });

    if (!verifyResponse) {
      throw new Error('Invalid verify response');
    }
    const verifyResult = await verifyResponse.json();

    return {
      token: verifyResult.token,
      refreshToken: verifyResult.refreshToken
    };
  } catch (err) {
    console.log('Register (verify) error:', err);
    if (err.json) {
      const errBody = await err.json();
      throw new RegisterError(errBody.message, errBody.code || 1004);
    }
    throw new RegisterError(err.message, 1005);
  }
}

export async function forget(): Promise<boolean> {
  try {
    saveMetric({event: METRIC_TYPES.FORGET});
    await request(`${urls.api}/register`, {
      authorizationHeaders: true,
      method: 'DELETE'
    });
  } catch (err) {
    console.log('Error forgetting user: ', err);
    return false;
  }

  return true;
}

export async function checkIn(checks: Check[], checkInData: CheckIn) {
  const {sex, ageRange, location, ok} = checkInData;

  try {
    const data = checks.map((c) => ({
      ...c.symptoms,
      status: c.status || 'u',
      date: format(c.timestamp, 'dd/MM/yyyy')
    }));

    const body = {
      ageRange,
      sex,
      locality: [location.county || 'u', location.locality || 'u'].join(', '),
      ok,
      data
    };

    await request(`${urls.api}/check-in`, {
      authorizationHeaders: true,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    saveMetric({event: METRIC_TYPES.CHECK_IN});
  } catch (err) {
    console.log('Error checking-in:', err);
    if (err.status !== 401) {
      saveMetric({event: METRIC_TYPES.LOG_ERROR, payload: JSON.stringify({where: 'checkIn', error: JSON.stringify(err)})});
    }
  }
}

export async function loadSettings() {
  try {
    const req = await request(`${urls.api}/settings/language`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!req) {
      throw new Error('Invalid response');
    }

    const resp = await req.json();
    return resp;
  } catch (err) {
    console.log('Error loading settings data', err);
    throw err;
  }
}

export interface CheckIns {
  total: number;
  ok: number;
}

export type DataByDate = [Date, number][];

export interface CovidStatistics {
  confirmed: number;
  deaths: number;
  recovered: number;
  hospitalised: number;
  requiredICU: number;
  transmission: {
    community: number;
    closeContact: number;
    travelAbroad: number;
  };
  lastUpdated: {
    stats: Date;
    profile: Date;
  };
}

export interface StatsData {
  generatedAt: Date;
  checkIns: CheckIns;
  statistics: CovidStatistics;
  chart: DataByDate;
  currentCases: DataByDate;
  currentDeaths: DataByDate;
  installs: [Date, number][];
  notifications: number;
  installPercentage: string;
  uploads: number;
  activeUsers: string;
  counties: {cases: number; county: string; dailyCases: DataByDate}[];
  hospital: {
    admissions: number;
    discharges: number;
    confirmed: number;
  };
  icu: {
    admissions: number;
    discharges: number;
    confirmed: number;
  };
  tests: {
    completed: number;
    positive: number;
  };
}

export async function loadData(): Promise<StatsData> {
  try {
    const req = await request(`${urls.api}/stats`, {
      authorizationHeaders: true,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!req) {
      throw new Error('Invalid response');
    }
    const res = await req.json();
    return res as StatsData;
  } catch (err) {
    console.log('Error loading stats data: ', err);
    if (err.status !== 401) {
      saveMetric({
        event: METRIC_TYPES.LOG_ERROR,
        payload: JSON.stringify({where: 'loadStats', error: JSON.stringify(err)})
      });
    }
    throw err;
  }
}

export async function uploadContacts(contacts: any) {
  try {
    const req = await request(`${urls.api}/contacts`, {
      authorizationHeaders: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contacts)
    });
    if (!req) {
      throw new Error('Invalid response');
    }
    console.log('Contacts Uploaded');
    return true;
  } catch (err) {
    console.log('Error uploading contacts', err);
    if (err.status !== 401) {
      saveMetric({
        event: METRIC_TYPES.LOG_ERROR,
        payload: JSON.stringify({where: 'uploadContacts', error: JSON.stringify(err)})
      });
    }
    throw err;
  }
}

export enum METRIC_TYPES {
  CHECK_IN = 'CHECK_IN',
  FORGET = 'FORGET',
  TOKEN_RENEWAL = 'TOKEN_RENEWAL',
  CALLBACK_OPTIN = 'CALLBACK_OPTIN',
  LOG_ERROR = 'LOG_ERROR'
}

export async function saveMetric({event = '', payload = ''}) {
  try {
    const analyticsOptinSecure = await SecureStore.getItemAsync(
      'analyticsConsent'
    );
    const analyticsOptin = await AsyncStorage.getItem('analyticsConsent');
    const consent =
      analyticsOptinSecure === 'true' || analyticsOptin === 'true';

    console.log('Request to saveMetric', consent, event, payload);
    if (!consent) {
      return false;
    }

    let bearerToken = await SecureStore.getItemAsync('token');
    if (!bearerToken) {
      return false;
    }

    const version = await getVersion();
    const os = Platform.OS;
    const req = await request(`${urls.api}/metrics`, {
      authorizationHeaders: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        os,
        version: version.display,
        event,
        payload
      })
    });

    return req && req.status === 204;
  } catch (err) {
    console.log('saveMetric Failed', err);
    return false;
  }
}

export async function requestCallback(mobile: string, exposureDate: string, payload: any) {
  try {
    const req = await request(`${urls.api}/callback`, {
      authorizationHeaders: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        closeContactDate: exposureDate,
        mobile,
        payload
      })
    });
    if (!req) {
      throw new Error('Invalid response');
    }
    console.log('Callback Requested');
    saveMetric({event: METRIC_TYPES.CALLBACK_OPTIN});
    return true;
  } catch (err) {
    console.log('Error requesting callback', err);
    if (err.status !== 401) {
      saveMetric({
        event: METRIC_TYPES.LOG_ERROR,
        payload: JSON.stringify({where: 'requestCallback', error: JSON.stringify(err)})
      });
    }
    throw err;
  }
}
