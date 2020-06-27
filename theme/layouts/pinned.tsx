import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeArea} from 'react-native-safe-area-context';

import {SPACING_TOP, SPACING_BOTTOM, SPACING_HORIZONTAL} from './shared';

import {Heading} from '../../components/atoms/heading';
import {colors} from '../../constants/colors';

interface LayoutProps {
  heading?: string;
  children: any;
}

export const PinnedBottom: FC<LayoutProps> = ({children, heading}) => {
  const insets = useSafeArea();
  const content = React.Children.toArray(children);
  const bottom = content.pop();

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: insets.bottom + SPACING_BOTTOM}
      ]}>
      <View>
        {heading && <Heading accessibilityFocus text={heading} />}
        {content}
      </View>
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
