declare module '@env' {
  export const API_HOST: string;
  export const DCC_HOST: string;
  export const KEY_DOWNLOAD_HOST: string;
  export const KEY_PUBLISH_HOST: string;
  export const ENV: 'development' | 'production';
  export const SAFETYNET_KEY: string;
  export const RECAPTCHA_KEY: string;
  export const HIDE_DEBUG: 'y' | 'n';
  export const TEST_TOKEN: string;
  export const DEEP_LINK_PREFIX_IOS: string;
  export const DEEP_LINK_PREFIX_ANDROID: string;
  export const DEEP_LINK_DOMAIN: string;
}
