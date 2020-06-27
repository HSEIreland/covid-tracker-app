import {
  digestStringAsync,
  CryptoDigestAlgorithm,
  CryptoEncoding
} from 'expo-crypto';

import {request, verify} from '.';

import {urls} from '../../constants/urls';

export enum ValidationResult {
  NetworkError,
  Error,
  Invalid,
  Expired,
  Valid
}

interface ValidateCodeResponse {
  token?: string;
  result: ValidationResult;
}

export const validateCode = async (
  code: string
): Promise<ValidateCodeResponse> => {
  const controlHash = await digestStringAsync(
    CryptoDigestAlgorithm.SHA512,
    code.substr(0, 3),
    {encoding: CryptoEncoding.HEX}
  );
  const codeHash = await digestStringAsync(CryptoDigestAlgorithm.SHA512, code, {
    encoding: CryptoEncoding.HEX
  });

  const hash = `${controlHash}${codeHash}`;

  try {
    const resp = await request(`${urls.api}/exposures/verify`, {
      authorizationHeaders: true,
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({hash})
    });

    if (!resp) {
      throw new Error('Invalid response');
    }
    const responseData = await resp.json();

    return {
      result: ValidationResult.Valid,
      token: responseData.token
    };
  } catch (err) {
    console.log('Code validation error: ', err, err.message);

    if (err.message && err.message === 'Network Unavailable') {
      return {result: ValidationResult.NetworkError};
    }

    if (err.status === 410) {
      return {result: ValidationResult.Expired};
    } else if (err.status >= 400 && err.status <= 499) {
      return {result: ValidationResult.Invalid};
    }

    return {
      result: ValidationResult.Error
    };
  }
};

export const uploadExposureKeys = async (
  uploadToken: string,
  exposures: any[]
): Promise<void> => {
  const resp = await request(`${urls.api}/exposures`, {
    authorizationHeaders: true,
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: uploadToken,
      exposures,
      ...(await verify(uploadToken))
    })
  });

  if (!resp || resp.status !== 204) {
    throw new Error('Upload failed');
  }
};
