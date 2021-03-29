import React, {FC, ReactNode, useEffect} from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from 'react-native';
import Modal, {ModalProps} from 'react-native-modal';
import {useSafeArea} from 'react-native-safe-area-context';

import {setAccessibilityFocusRef, useFocusRef} from '../../hooks/accessibility';

import {colors} from '../../constants/colors';
import {text} from '../../theme';

interface FullModalProps extends Partial<ModalProps> {
  title?: string;
  onClose?: () => void;
  header?: () => ReactNode;
  modalStyle?: ViewStyle;
  titleStyle?: TextStyle;
  accessibilityFocus?: boolean;
  accessibilityRefocus?: boolean;
}

export const FullModal: FC<FullModalProps> = ({
  children,
  header,
  title,
  isVisible,
  onClose,
  modalStyle,
  titleStyle,
  accessibilityLabel,
  accessibilityFocus = true,
  accessibilityRefocus = false,
  ...modalProps
}) => {
  const insets = useSafeArea();
  const [ref] = useFocusRef({
    accessibilityFocus: false,
    accessibilityRefocus,
    timeout: 300
  });

  // Default backdrop grabs accessibility focus even with no press handler
  // On iOS, it doesn't stop the heading being read, and does stop focus shifting to close button
  const customBackdrop =
    Platform.OS === 'android' ? <View style={styles.backdrop} /> : undefined;

  useEffect(() => {
    if (accessibilityFocus) {
      // Normal useFocusRef accessibilityFocus gets yoinked by the close button
      setTimeout(() => setAccessibilityFocusRef(ref), 500);
    }
  }, [accessibilityFocus, ref]);

  return (
    <Modal
      isVisible={isVisible}
      hideModalContentWhileAnimating
      customBackdrop={customBackdrop}
      style={[styles.modal, {marginTop: insets.top + 12}, modalStyle]}
      {...modalProps}>
      <View style={styles.top}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <TouchableWithoutFeedback
              accessibilityRole="button"
              accessibilityLabel={`Close ${title}`}
              onPress={onClose}>
              <Image
                style={styles.closeIcon}
                {...styles.closeIcon}
                source={require('../../assets/images/close/close.png')}
              />
            </TouchableWithoutFeedback>
          </View>
          {!!title && (
            <Text
              ref={ref}
              accessible
              importantForAccessibility="yes"
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="header"
              style={[styles.title, titleStyle]}>
              {title}
            </Text>
          )}
          <View style={styles.iconWrapper} />
        </View>
        {header ? header() : null}
      </View>
      {children}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: 0,
    marginBottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1
  },
  top: {
    paddingHorizontal: 32,
    paddingTop: 32
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative'
  },
  title: {
    ...text.small,
    lineHeight: 14
  },
  iconWrapper: {
    width: 32,
    height: 28,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  closeIcon: {
    width: 16,
    height: 16
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.black,
    opacity: 0.9
  }
});
