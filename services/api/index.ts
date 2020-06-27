import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {format} from 'date-fns';
// To enable certificate pinning uncomment line below, add your cert files and reference them in request method below
// import {fetch} from 'react-native-ssl-pinning';
import NetInfo from '@react-native-community/netinfo';
import {SAFETYNET_KEY} from 'react-native-dotenv';
import {BUILD_VERSION, ENV, TEST_TOKEN} from 'react-native-dotenv';
import RNGoogleSafetyNet from 'react-native-google-safetynet';
import RNIOS11DeviceCheck from 'react-native-ios11-devicecheck';

import {urls} from '../../constants/urls';
import {Check, UserLocation} from '../../providers/context';

import {isMountedRef, navigationRef} from '../../navigation';

interface CheckIn {
  sex: string;
  ageRange: string;
  location: UserLocation;
  ok: boolean;
}

export const verify = async (nonce: string) => {
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
    if (isMountedRef.current && navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{name: 'over16'}]
      });
    }
    return '';
  }
}

export async function register(): Promise<{
  token: string;
  refreshToken: string;
}> {
  const registerResponse = await request(`${urls.api}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (!registerResponse) {
    throw new Error('Invalid response');
  }
  const {nonce} = await registerResponse.json();

  const verifyResponse = await request(`${urls.api}/register`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({nonce, ...(await verify(nonce))})
  });
  if (!verifyResponse) {
    throw new Error('Invalid response');
  }

  const resp = await verifyResponse.json();

  return resp as {
    token: string;
    refreshToken: string;
  };
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
  }
}

export async function loadSettings() {
  try {
    const req = await request(`${urls.api}/settings`, {
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
    console.log('Error loading settings data');
    console.log(err);
    throw err;
  }
}

export interface CheckIns {
  total: number;
  ok: number;
}

export type ConfirmedCasesData = [Date, number][];

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
  checkIns: CheckIns;
  statistics: CovidStatistics;
  chart: ConfirmedCasesData;
  installs: [Date, number][];
  counties: {cases: number; county: string}[];
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
    saveMetric({event: METRIC_TYPES.CONTACT_UPLOAD});
    return true;
  } catch (err) {
    console.log('Error uploading contacts');
    console.log(err);
    throw err;
  }
}

export async function loadNotifications() {
  try {
    const req = await request(`${urls.api}/register`, {
      authorizationHeaders: true,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!req) {
      throw new Error('Invalid response');
    }

    console.log('Loaded record');
    const data = await req.json();
    return data;
  } catch (err) {
    console.log('Error loading record');
    console.log(err);
    throw err;
  }
}

export enum METRIC_TYPES {
  CONTACT_UPLOAD = 'CONTACT_UPLOAD',
  CHECK_IN = 'CHECK_IN',
  FORGET = 'FORGET',
  TOKEN_RENEWAL = 'TOKEN_RENEWAL',
  CALLBACK_OPTIN = 'CALLBACK_OPTIN'
}

// 1.2 downloads, 2,7, 2.6

export async function saveMetric({event = ''}) {
  try {
    const analyticsOptin = await SecureStore.getItemAsync('analyticsConsent');
    if (!analyticsOptin || (analyticsOptin && analyticsOptin !== 'true')) {
      return false;
    }
    const os = Platform.OS;
    const version = BUILD_VERSION;
    const req = await request(`${urls.api}/metrics`, {
      authorizationHeaders: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        os,
        version,
        event
      })
    });

    return req && req.status === 204;
  } catch (err) {
    console.log(err);
    return false;
  }
}
