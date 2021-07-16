export type RecoveryGroup = {
  /** Disease or agent from which the holder has recovered */
  tg: string;
  /** Date of the holder’s first positive NAAT test result */
  fr: string;
  /** Member State or third country in which test was carried out */
  co: string;
  /** Certificate issuer */
  is: string;
  /** Certificate valid from */
  df: string;
  /** Certificate valid until */
  du: string;
  /** Unique certificate identifier */
  ci: string;
};

export type TestGroup = {
  /** Disease or Agent Targeted */
  tg: string;
  /** The type of test */
  tt: string;
  /** Test name (nucleic acid amplification tests only) */
  nm: string;
  /** Test device identifier (rapid antigen tests only) */
  ma: string;
  /** Date and time of the test sample collection */
  sc: string;
  /** Result of the test */
  tr: string;
  /** Testing centre or facility */
  tc: string;
  /** Member State or third country in which the test was carried out */
  co: string;
  /** Certificate issuer */
  is: string;
  /** Unique certificate identifier */
  ci: string;
};

export type VaccinationGroup = {
  /** Disease or Agent Targeted */
  tg: string;
  /** Vaccine or Prophylaxis */
  vp: string;
  /** Vaccine Medicinal Product */
  mp: string;
  /** Marketing Authorization Holder */
  ma: string;
  /** Dose Number */
  dn: string;
  /** Total Series of Doses */
  sd: string;
  /** Date of Vaccination */
  dt: string;
  /** Country of Vaccination */
  co: string;
  /** Certificate Issuer */
  is: string;
  /** Unique Certificate Identifier */
  ci: string;
};

export type CertificateContent = {
  ver: string;
  nam: {
    fn: string;
    gn: string;
    fnt: string;
    gnt: string;
  };
  dob: string;
  v?: VaccinationGroup[];
  t?: TestGroup[];
  r?: RecoveryGroup[];
};

export enum CBOR_STRUCTURE {
  PROTECTED_HEADER = 0,
  UNPROTECTED_HEADER = 1,
  PAYLOAD = 2,
  SIGNATURE = 3
}

export enum ALGOS {
  ECDSA_256 = -7,
  RSA_PSS_256 = -37
}

export enum HEADER_KEYS {
  ALGORITHM = 1,
  KID = 4
}

export enum PAYLOAD_KEYS {
  ISSUER = 1,
  ISSUED_AT = 6,
  EXPIRES_AT = 4,
  CONTENT = -260
}

export type CertificateType = {
  [PAYLOAD_KEYS.ISSUER]: string;
  [PAYLOAD_KEYS.EXPIRES_AT]: number;
  [PAYLOAD_KEYS.ISSUED_AT]: number;
  [PAYLOAD_KEYS.CONTENT]: {
    1: CertificateContent;
  };
};

export type VerificationResult = {
  cert?: CertificateContent;
  ruleErrors?: string[];
  error?: Error;
};
