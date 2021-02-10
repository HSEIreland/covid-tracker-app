import {ENV, TEST_TOKEN, SAFETYNET_KEY} from '@env';
import {Platform} from 'react-native';
import RNGoogleSafetyNet from 'react-native-google-safetynet';
import RNIOS11DeviceCheck from 'react-native-ios11-devicecheck';
import {format} from 'date-fns';
import {Check, UserLocation} from '../../providers/context';
import {urls} from '../../constants/urls';

import {
  identifyNetworkIssue,
  request,
  requestRetry,
  saveMetric,
  METRIC_TYPES
} from './utils';

export type ApiSettings = Record<
  string,
  string | number | Record<string, string | Record<string, string>>
>;

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

export class RegisterError extends Error {
  constructor(message: string, code: string) {
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
    const codeVal = err.cancelled ? '1006' : await identifyNetworkIssue();
    console.log('Register error code is ', codeVal);
    throw new RegisterError(err.message, codeVal);
  }

  let deviceCheckData;
  try {
    deviceCheckData = await getDeviceCheckData(nonce);
  } catch (err) {
    console.log('Device check error: ', err);
    throw new RegisterError(err.message, `1003:${err.message}`);
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
      throw new RegisterError(
        errBody.message,
        errBody.code || `1004:${err.message}:${errBody.message}`
      );
    }
    throw new RegisterError(err.message, '1005');
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
      saveMetric({
        event: METRIC_TYPES.LOG_ERROR,
        payload: JSON.stringify({where: 'checkIn', error: JSON.stringify(err)})
      });
    }
  }
}

export async function loadSettings() {
  try {
    const req = await requestRetry(
      `${urls.api}/settings/language`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      3
    );
    if (!req) {
      throw new Error('Invalid response');
    }

    const resp = await req.json();
    return resp as ApiSettings;
  } catch (err) {
    console.log('Error loading settings data', err);
    throw err;
  }
}

export interface CheckIns {
  total: number;
  ok: number;
}

export type DataByDate = [Date | string, number][];

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

export interface LEA {
  id: string;
  area: string;
  population: number;
  cases: number;
  rate: number;
}

// All fields _should_ be present, but data comes from 3rd parties so any could be missing
export type StatsData = Partial<{
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
  counties: Partial<{
    cases: number;
    county: string;
    dailyCases: DataByDate;
    areas: LEA[];
  }>[];
  vaccine: Partial<{
    overallDoses: Partial<{
      first: number;
      second: number;
      total: number;
      dateUpdated: number | string;
    }>;
    vendorBreakdown: Partial<{
      name: string;
      first: number;
      second: number;
      total: number;
    }>[];
    ageBreakdown: Partial<{
      title: string;
      male: number;
      female: number;
    }>[];
    dailyDoses: Partial<{
      date: string;
      first: number;
      second: number;
      total: number;
    }>[];
    countyBreakdown: Partial<{
      county: string;
      last7: number;
      total: number;
    }>[];
  }>;
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
  incidence: {
    rate: number;
    date: Date;
  };
}>;

export async function loadData(): Promise<StatsData> {
  try {
    const req = await requestRetry(
      `${urls.api}/stats`,
      {
        authorizationHeaders: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      3
    );
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
        payload: JSON.stringify({
          where: 'loadStats',
          error: JSON.stringify(err)
        })
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
        payload: JSON.stringify({
          where: 'uploadContacts',
          error: JSON.stringify(err)
        })
      });
    }
    throw err;
  }
}

export async function requestCallback(
  mobile: string,
  exposureDate: string,
  payload: any
) {
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
        payload: JSON.stringify({
          where: 'requestCallback',
          error: JSON.stringify(err)
        })
      });
    }
    throw err;
  }
}
