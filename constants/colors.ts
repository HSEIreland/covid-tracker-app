const teal = '#3A7B7F';
const red = '#B4083A';
const white = '#FFFFFF';

export const colors = {
  yellow: '#FFEA0C', // review & remove,
  lightYellow: '#fff37a',
  mildYellow: '#fff16f',
  darkerYellow: '#FFDA1A', // review & merge to yellow
  orange: '#FF8248', // review as used only in toast
  white,
  red,
  teal,
  gray: '#F5F5F5', // review - only input
  darkGray: '#96989B', // review - only input
  dot: '#B2B2B2',
  selectedDot: '#2E2E2E',
  success: '#00CF68', // only 1 usage?
  text: '#2E2E2E',
  buttons: {
    default: {
      text: white,
      background: teal,
      shadow: '#255E62'
    },
    danger: {
      text: white,
      background: red,
      shadow: '#8B042A'
    },
    empty: {
      text: teal,
      background: white,
      shadow: '#D3D0D0'
    }
  }
};
