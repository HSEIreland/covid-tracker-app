import cose from 'cose-js';

import {ALGOS} from './types';
import {SigningKey} from '../../services/api/vaccine-cert';
import * as errors from './errors';

async function verifyECDSA(
  message: Buffer, // eslint-disable-line no-undef
  keys: SigningKey[]
): Promise<Uint8Array | Error> {
  for (const key of keys) {
    try {
      const verifiedBuf = await cose.sign.verify(message, {
        key: {
          kid: key.kid,
          x: Buffer.from(key.x, 'base64'), // eslint-disable-line no-undef
          y: Buffer.from(key.y, 'base64') // eslint-disable-line no-undef
        }
      });
      if (verifiedBuf) {
        return verifiedBuf;
      }
    } catch (e) {
      console.log('Sig failed', key.kid, e);
    }
  }
  return errors.invalidSignature();
}

async function verifyRSA(
  _message: Buffer, // eslint-disable-line no-undef
  _keys: SigningKey[]
): Promise<Uint8Array | Error> {
  return errors.invalidSignature();
}

export default async function verifySignature(
  message: Buffer, // eslint-disable-line no-undef
  algo: ALGOS,
  keys: SigningKey[]
): Promise<Uint8Array | Error> {
  if (algo === ALGOS.ECDSA_256) {
    return verifyECDSA(message, keys);
  } else if (algo === ALGOS.RSA_PSS_256) {
    return verifyRSA(message, keys);
  } else {
    return errors.unknownSigAlgo();
  }
}
