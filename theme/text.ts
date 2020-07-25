import {colors} from '../constants/colors';

export default (scale: (v: number) => number) => ({
  // lato-regular
  small: {
    fontFamily: 'lato',
    fontSize: scale(14),
    color: colors.text,
    lineHeight: 21
  },
  default: {
    fontFamily: 'lato',
    fontSize: scale(16),
    color: colors.text
  },
  large: {
    fontFamily: 'lato',
    fontSize: scale(18),
    color: colors.text
  },
  xlarge: {
    fontFamily: 'lato',
    fontSize: scale(21),
    color: colors.text
  },

  // lato-bold
  xsmallBold: {
    fontFamily: 'lato-bold',
    fontSize: scale(12),
    color: colors.text
  },
  xsmallBoldOpacity70: {
    fontFamily: 'lato-bold',
    fontSize: scale(12),
    color: `${colors.text}B3`
  },
  smallBold: {
    fontFamily: 'lato-bold',
    fontSize: scale(14),
    color: `${colors.text}B3`
  },
  defaultBold: {
    fontFamily: 'lato-bold',
    fontSize: scale(16),
    color: colors.text
  },
  defaultBoldOpacity70: {
    fontFamily: 'lato-bold',
    fontSize: scale(16),
    color: `${colors.text}B3`
  },
  largeBold: {
    fontFamily: 'lato-bold',
    fontSize: scale(18),
    color: colors.text
  },
  xlargeBold: {
    fontFamily: 'lato-bold',
    fontSize: scale(21),
    color: colors.text
  },

  // lato-black
  largeBlack: {
    fontFamily: 'lato-black',
    fontSize: scale(18),
    color: colors.text
  },
  xlargeBlack: {
    fontFamily: 'lato-black',
    fontSize: scale(21),
    color: colors.text
  },
  xxlargeBlack: {
    fontFamily: 'lato-black',
    fontSize: scale(32),
    letterSpacing: -0.65,
    color: colors.text
  },
  xxxlargeBlack: {
    fontFamily: 'lato-black',
    fontSize: scale(48),
    color: colors.text
  }
});
