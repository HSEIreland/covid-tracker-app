import React, {FC, MutableRefObject} from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {useHeaderHeight} from '@react-navigation/stack';
import {useSafeArea} from 'react-native-safe-area-context';

import {SPACING_TOP, SPACING_BOTTOM, SPACING_HORIZONTAL} from './shared';

import {Spacing} from '../../components/atoms/layout';
import {Heading} from '../../components/atoms/heading';

import {colors} from '../../constants/colors';

interface LayoutProps {
  toast?: React.ReactNode;
  heading?: string;
  backgroundColor?: string;
  refresh?: {
    refreshing: boolean;
    onRefresh: () => void;
  };
  scrollViewRef?: MutableRefObject<ScrollView | null>;
  safeArea?: boolean;
  children: React.ReactNode;
}

export const KeyboardScrollable: FC<LayoutProps> = ({
  toast,
  heading,
  backgroundColor,
  refresh,
  scrollViewRef,
  safeArea = true,
  children
}) => {
  const insets = useSafeArea();
  const headerHeight = useHeaderHeight();

  const refreshControl = refresh && <RefreshControl {...refresh} />;

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={headerHeight}
      style={[styles.container, !!backgroundColor && {backgroundColor}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled>
      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={[
          styles.scrollView,
          {paddingBottom: (safeArea ? insets.bottom : 0) + SPACING_BOTTOM}
        ]}
        refreshControl={refreshControl}>
        {toast && (
          <>
            {toast}
            <Spacing s={8} />
          </>
        )}
        {heading && <Heading accessibilityFocus text={heading} />}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  scrollView: {
    paddingTop: SPACING_TOP,
    paddingHorizontal: SPACING_HORIZONTAL
  }
});
