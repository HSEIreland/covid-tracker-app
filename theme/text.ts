import {colors} from '../constants/colors';
import {I18nManager, TextStyle} from 'react-native';

const defaults: TextStyle = {
  fontFamily: 'lato',
  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr', // Required for iOS
  color: colors.text
};

export default (scale: (v: number) => number): Record<string, TextStyle> => ({
  // lato-regular
  small: {
    ...defaults,
    fontSize: scale(14),
    lineHeight: 21
  },
  default: {
    ...defaults,
    fontSize: scale(16)
  },
  large: {
    ...defaults,
    fontSize: scale(18)
  },
  xlarge: {
    ...defaults,
    fontSize: scale(21)
  },

  // lato-bold
  xsmallBold: {
    ...defaults,
    fontFamily: 'lato-bold',
    fontSize: scale(12)
  },
  xsmallBoldOpacity70: {
    ...defaults,
    fontFamily: 'lato-bold',
    fontSize: scale(12),
    color: `${colors.text}B3`
  },
  smallBold: {
    ...defaults,
    fontFamily: 'lato-bold',
    fontSize: scale(14),
    color: `${colors.text}B3`
  },
  defaultBold: {
    ...defaults,
    fontFamily: 'lato-bold',
    fontSize: scale(16)
  },
  defaultBoldOpacity70: {
    ...defaults,
    fontFamily: 'lato-bold',
    fontSize: scale(16),
    color: `${colors.text}B3`
  },
  largeBold: {
    ...defaults,
    fontFamily: 'lato-bold',
    fontSize: scale(18)
  },
  xlargeBold: {
    ...defaults,
    fontFamily: 'lato-bold',
    fontSize: scale(21)
  },

  // lato-black
  largeBlack: {
    ...defaults,
    fontFamily: 'lato-black',
    fontSize: scale(18)
  },
  xlargeBlack: {
    ...defaults,
    fontFamily: 'lato-black',
    fontSize: scale(21)
  },
  xxlargeBlack: {
    ...defaults,
    fontFamily: 'lato-black',
    fontSize: scale(32),
    letterSpacing: -0.65
  },
  xxxlargeBlack: {
    ...defaults,
    fontFamily: 'lato-black',
    fontSize: scale(48)
  }
});
