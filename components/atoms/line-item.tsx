import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface LineItemProps {
  label: string;
  value: string;
}

export const LineItem: FC<LineItemProps> = ({label, value}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4
  }
});
