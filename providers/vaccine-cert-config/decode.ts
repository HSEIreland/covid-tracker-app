import base45 from 'base45';
import pako from 'pako';
import cbor from 'cbor';

import {
  ALGOS,
  CBOR_STRUCTURE,
  HEADER_KEYS,
  PAYLOAD_KEYS,
  CertificateContent
} from './types';

import {SigningKey} from '../../services/api/vaccine-cert';
import * as errors from './errors';
import verifySignature from './verify-signature';

function mapToJSON(map: Map<any, any>) {
  if (!(map instanceof Map)) {
    return map;
  }

  const out = Object.create(null);

  map.forEach((value, key) => {
    if (value instanceof Map) {
      out[key] = mapToJSON(value);
    } else {
      out[key] = value;
    }
  });

  return out;
}

function getCountry(cert: CertificateContent, iss?: string): string | null {
  try {
    return iss || (cert.v! || cert.t! || cert.r!)[0].co;
  } catch (e) {
    return null;
  }
}

function getKid(protectedHeader: any, unprotectedHeader: any): string | null {
  try {
    if (protectedHeader) {
      return protectedHeader.get(HEADER_KEYS.KID).toString('base64');
    } else {
      return unprotectedHeader.get(HEADER_KEYS.KID).toString('base64');
    }
  } catch {
    return null;
  }
}

function getAlgo(protectedHeader: any, unprotectedHeader: any): ALGOS | null {
  try {
    if (protectedHeader) {
      return protectedHeader.get(HEADER_KEYS.ALGORITHM);
    } else {
      return unprotectedHeader.get(HEADER_KEYS.ALGORITHM);
    }
  } catch {
    return null;
  }
}

function decodeCbor(
  qrCbor: any
): {
  kid: string | null;
  country: string | null;
  issuedAt: number;
  expiresAt: number;
  cert: CertificateContent;
  algo: ALGOS | null;
} {
  const message = cbor.decodeFirstSync(Buffer.from(qrCbor)); // eslint-disable-line no-undef
  const protectedHeader = cbor.decodeFirstSync(
    message.value[CBOR_STRUCTURE.PROTECTED_HEADER]
  );
  const unprotectedHeader = message.value[CBOR_STRUCTURE.UNPROTECTED_HEADER];
  const content = cbor.decodeFirstSync(message.value[CBOR_STRUCTURE.PAYLOAD]);

  const kid = getKid(protectedHeader, unprotectedHeader);
  const algo = getAlgo(protectedHeader, unprotectedHeader);
  const cert = mapToJSON(content.get(PAYLOAD_KEYS.CONTENT).get(1));

  return {
    kid,
    country: getCountry(cert, content.get(PAYLOAD_KEYS.ISSUER)),
    issuedAt: content.get(PAYLOAD_KEYS.ISSUED_AT),
    expiresAt: content.get(PAYLOAD_KEYS.EXPIRES_AT),
    cert,
    algo
  };
}

function findKeysToValidateAgainst(
  country: string,
  kid: string,
  signingKeys: SigningKey[]
): SigningKey[] {
  const keys: SigningKey[] = [];

  if (kid) {
    keys.push(...signingKeys.filter((s) => s.kid === kid));
  }

  if (keys.length === 0 && !kid) {
    keys.push(...signingKeys.filter((s) => s.country === country));
  }

  return keys;
}

export default async function decodeQR(
  qr: string,
  signingKeys: SigningKey[]
): Promise<{cert?: CertificateContent; error?: Error}> {
  if (!qr.startsWith('HC1:')) {
    return {error: errors.invalidQR()};
  }

  try {
    const qrBase45 = qr.replace('HC1:', '');
    const qrZipped = base45.decode(qrBase45);
    const qrCbor = pako.inflate(qrZipped);

    const {kid, cert, country, expiresAt, algo} = decodeCbor(qrCbor);

    const keysToUse = findKeysToValidateAgainst(country!, kid!, signingKeys);

    console.log(kid, cert, country, new Date(expiresAt * 1000), algo, keysToUse.length)
    
    if (new Date(expiresAt * 1000) < new Date()) {
      return {cert, error: errors.certExpired()};
    }

    if (keysToUse.length === 0) {
      return {cert, error: errors.noMatchingSigKey()};
    }

    const result = await verifySignature(qrCbor, algo!, keysToUse);

    const error = result instanceof Error ? result : undefined;

    return {cert, error};
  } catch (err) {
    return {error: errors.invalidData()};
  }
}
