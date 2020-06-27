import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeArea} from 'react-native-safe-area-context';

import {SPACING_TOP, SPACING_BOTTOM, SPACING_HORIZONTAL} from './shared';

import {Heading} from '../../components/atoms/heading';
import {colors} from '../../constants/colors';

interface LayoutProps {
  heading?: string;
  backgroundColor?: string;
  children: React.ReactNode;
}

export const Basic: FC<LayoutProps> = ({
  children,
  heading,
  backgroundColor
}) => {
  const insets = useSafeArea();

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: insets.bottom + SPACING_BOTTOM},
        !!backgroundColor && {backgroundColor}
      ]}>
      {heading && <Heading accessibilityFocus text={heading} />}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: SPACING_TOP,
    paddingHorizontal: SPACING_HORIZONTAL
  }
});
