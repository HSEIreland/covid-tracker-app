import React, {FC} from 'react';
import {View, StyleSheet} from 'react-native';

import {scale} from '../../theme';

export const Spacing: React.FC<{s: number}> = ({s}) => {
  const height = scale(s);
  return <View style={{height}} />;
};

interface RowProps {
  mb?: number;
  isLast?: boolean;
  children: any;
}

export const Row: FC<RowProps> = ({mb = 8, isLast = false, children}) => {
  const marginBottom = isLast ? 0 : scale(mb);
  return <View style={[styles.row, {marginBottom}]}>{children}</View>;
};

export const SingleRow: FC<Omit<RowProps, 'isLast'>> = ({children}) => (
  <Row isLast>{children}</Row>
);

export const Separator: React.FC<{m?: number}> = ({m = 16}) => {
  const marginVertical = scale(m);
  return <View style={[styles.separator, {marginVertical}]} />;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8
  },
  separator: {
    height: 1,
    backgroundColor: 'rgb(239, 239, 239)'
  }
});
