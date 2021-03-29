import {I18nManager, TextStyle} from 'react-native';

import {colors} from '../constants/colors';

export const getBaseStyles = (text: any) =>
  ({
    label: {
      ...text.smallBold,
      color: colors.text,
      marginBottom: 4
    },
    error: {
      ...text.smallBold,
      color: colors.red
    },
    iconSize: {
      width: 24,
      height: 24
    },
    // Use for content that should be wholly LTR even when language is RTL e.g. English-only
    forceLTR: I18nManager.isRTL
      ? {
          writingDirection: 'ltr',
          textAlign: 'right'
        }
      : {},
    flipIfRtl: I18nManager.isRTL
      ? {
          transform: [{scaleX: -1}]
        }
      : {}
  } as const);

export const getInputStyle = (text: any) => (
  width: number | string = '100%'
): TextStyle => ({
  height: 48,
  width,
  justifyContent: 'flex-end',
  ...text.largeBold,
  backgroundColor: colors.gray,
  borderWidth: 1,
  borderColor: colors.dot,
  borderRadius: 3,
  paddingHorizontal: 12
});
