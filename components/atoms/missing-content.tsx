import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Spacing} from './layout';

import {text} from '../../theme';

interface MissingContentProps {
  title: string;
  description: string;
}

export const MissingContent: FC<MissingContentProps> = ({
  title,
  description
}) => (
  <View style={styles.container} accessible>
    <Spacing s={32} />
    <Text style={styles.title}>{title}</Text>
    <Spacing s={16} />
    <Text style={styles.description}>{description}</Text>
    <Spacing s={32} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16
  },
  title: {
    textAlign: 'center',
    ...text.defaultBold
  },
  description: {
    textAlign: 'center',
    ...text.default
  }
});
