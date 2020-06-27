import React from 'react';
import {View} from 'react-native';
import {scale} from '../../theme';

export const Spacing: React.FC<{s: number}> = ({s}) => {
  const height = scale(s);
  return <View style={{height}} />;
};
