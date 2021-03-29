import React, {FC} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useSafeArea} from 'react-native-safe-area-context';

import {SPACING_TOP, SPACING_BOTTOM, SPACING_HORIZONTAL} from './shared';

import {Heading} from '../../components/atoms/heading';
import {colors} from '../../constants/colors';

interface LayoutProps {
  accessibilityFocus?: boolean;
  accessibilityRefocus?: boolean;
  backgroundColor?: string;
  children: any;
  heading?: string;
}

export const PinnedBottom: FC<LayoutProps> = ({
  accessibilityFocus = true,
  accessibilityRefocus = false,
  children,
  heading
}) => {
  const insets = useSafeArea();
  const content = React.Children.toArray(children);
  const bottom = content.pop();

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: insets.bottom + SPACING_BOTTOM}
      ]}>
      <ScrollView keyboardShouldPersistTaps="always">
        {heading && (
          <Heading
            accessibilityFocus={accessibilityFocus}
            accessibilityRefocus={accessibilityRefocus}
            text={heading}
          />
        )}
        {content}
      </ScrollView>
      <View>{bottom}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    paddingTop: SPACING_TOP,
    paddingHorizontal: SPACING_HORIZONTAL
  }
});
