export function invalidSignature() {
  const error = new Error();
  error.name = 'INVALID_SIGNATURE';

  return error;
}

export function invalidData() {
  const error = new Error();
  error.name = 'INVALID_DATA';

  return error;
}

export function invalidQR() {
  const error = new Error();
  error.name = 'INVALID_QR';

  return error;
}

export function unknownSigAlgo() {
  const error = new Error();
  error.name = 'UNKNOWN_SIG_ALGO';

  return error;
}

export function noMatchingSigKey() {
  const error = new Error();
  error.name = 'NO_MATCHING_SIG_KEY';

  return error;
}

export function certExpired() {
  const error = new Error();
  error.name = 'CERT_EXPIRED';

  return error;
}
