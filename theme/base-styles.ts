import {TextStyle} from 'react-native';

import {colors} from '../constants/colors';

export const getBaseStyles = (text: any) => ({
  label: {
    ...text.smallBold,
    color: colors.text,
    marginBottom: 4
  },
  error: {
    ...text.smallBold,
    color: colors.red
  }
});

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
