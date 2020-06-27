import {Dimensions} from 'react-native';

import shadows from './shadows';
import getTextStyles from './text';
import {getBaseStyles, getInputStyle} from './base-styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const REF_HEIGHT = 667;

const text = getTextStyles(scale);

const baseStyles = getBaseStyles(text);
const inputStyle = getInputStyle(text);

function scale(value: number): number {
  const ratio = value / REF_HEIGHT;
  return Math.min(Math.round(ratio * SCREEN_HEIGHT), value);
}

export {scale, baseStyles, inputStyle, text, shadows};
