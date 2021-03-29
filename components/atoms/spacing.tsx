import React from 'react';
import {View} from 'react-native';
import {scale} from '../../theme';

interface Props {
  s: number;
}

export const Spacing: React.FC<Props> = ({s}) => {
  const height = scale(s);

  return <View style={{height}} />;
};
