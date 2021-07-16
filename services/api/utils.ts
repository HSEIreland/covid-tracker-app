import {Platform} from 'react-native';
import {getVersion} from 'react-native-exposure-notification-service';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-community/async-storage';
import {fetch as fetchPinned} from 'react-native-ssl-pinning';
import {backOff} from 'exponential-backoff';
import {isMountedRef, navigationRef} from '../../navigation';

import {urls} from '../../constants/urls';

export const networkError = 'Network Unavailable';

export enum METRIC_TYPES {
  CHECK_IN = 'CHECK_IN',
  FORGET = 'FORGET',
  CALLBACK_OPTIN = 'CALLBACK_OPTIN',
  LOG_ERROR = 'LOG_ERROR',
  UPLOAD_AFTER_CLOSE_CONTACT = 'UPLOAD_AFTER_CONTACT'
}

export async function request(url: string, cfg: any) {
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
    resp = await fetchPinned(url, {
      ...config,
      timeoutInterval: 30000,
      sslPinning: {
        certs: ['cert1', 'cert2', 'cert3', 'cert4', 'cert5']
      }
    });
    isUnauthorised = resp && resp.status === 401;
  } catch (e) {
    if (!authorizationHeaders || e.status !== 401) {
      const issue = await identifyNetworkIssue();

      if (['1011', '1012'].includes(issue.split(':')[0])) {
        throw new Error(networkError);
      }
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

    return fetchPinned(url, {
      ...newConfig,
      timeoutInterval: 30000,
      sslPinning: {
        certs: ['cert1', 'cert2', 'cert3', 'cert4', 'cert5']
      }
    });
  }

  return resp;
}

export async function requestRetry(url: string, cfg: any, retries: number = 1) {
  return backOff(() => request(url, cfg), {
    numOfAttempts: retries,
    startingDelay: 2000,
    timeMultiple: 2
  });
}

export async function requestWithCache<T extends unknown>(
  cacheKey: string,
  loadFunc: () => Promise<T>
) {
  try {
    const data = await loadFunc();
    // try caching the data
    try {
      console.log(`Saving ${cacheKey} data in storage...`);
      AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      console.log(`Error writing "${cacheKey}" in storage:`, err);
    }

    return {data};
  } catch (error) {
    console.log(`Error loading "${cacheKey}" data: `, error);

    let data = null;

    // try loading data from cache
    try {
      console.log(`Loading "${cacheKey}" data from storage...`);
      const storageData = await AsyncStorage.getItem(cacheKey);
      if (storageData) {
        data = JSON.parse(storageData) as T;
      }
    } catch (err) {
      console.log(`Error reading "${cacheKey}" from storage:`, err);
    }

    return {
      data,
      error
    };
  }
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

async function createToken(): Promise<string> {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const version = await getVersion();
    const os = Platform.OS;

    const req = await request(`${urls.api}/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`
      },
      body: JSON.stringify({os, version: version.display})
    });
    if (!req) {
      throw new Error('Invalid response');
    }
    const resp = await req.json();

    if (!resp.token) {
      throw new Error('Error getting token');
    }

    await SecureStore.setItemAsync('token', resp.token);

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

export const randomString = (minLen: number, maxLen: number) => {
  const stringLen = Math.floor(Math.random() * (maxLen - minLen) + minLen);
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = new Array(stringLen);
  for (let i = stringLen; i > 0; --i) {
    result[i] = chars[Math.floor(Math.random() * chars.length)];
  }
  return result.join();
};

export const identifyNetworkIssue = async (): Promise<string> => {
  const headers = {};
  let resp;

  // fetch non nearform url
  try {
    resp = await fetch('https://www.google.com', {
      method: 'GET',
      headers
    });
    if (resp.status !== 200) {
      return `1007:${resp.status}`;
    }
    console.log('Google check:', resp.status, resp.statusText);
  } catch (e) {
    console.log('identifyNetworkIssue - google check', e);
    return `1011:${e.message}`;
  }

  try {
    resp = await fetch(`${urls.api}/healthcheck`, {
      method: 'GET',
      headers
    });
    if (resp.status !== 204) {
      return `1008:${resp.status}`;
    }
    console.log('NF check:', resp.status, resp.statusText);
  } catch (e) {
    console.log('identifyNetworkIssue - nf check', e);
    return `1012:${e.message}`;
  }

  try {
    resp = await fetchPinned(`${urls.api}/settings/language`, {
      timeoutInterval: 30000,
      method: 'GET',
      sslPinning: {
        certs: ['cert1', 'cert2', 'cert3', 'cert4', 'cert5']
      }
    });
    if (resp.status !== 200) {
      return `1009:${resp.status}`;
    }
    console.log('NF with pinning:', resp.status, resp.text);

    //if we get here it means we havn't discovered the error
    return '1015';
  } catch (e) {
    console.log(e);
    if (e === 'cancelled') {
      // cert pinning failed
      return '1013';
    } else {
      const errData = await e.json();
      console.log('identifyNetworkIssue - nf pinned', errData);
      return `1010:${errData.statusCode}`;
    }
  }
};
