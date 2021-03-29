import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  AccessibilityRole,
  Text,
  ActivityIndicator
} from 'react-native';
import {ModalProps} from 'react-native-modal';
import {useSafeArea} from 'react-native-safe-area-context';
import {API_HOST, RECAPTCHA_KEY} from '@env';

import {colors} from '../../constants/colors';
import {ReCaptcha, ReCaptchaResult} from '../molecules/recaptcha';
import {Spacing} from '../atoms/spacing';
import {Button} from '../atoms/button';
import {FullModal} from '../atoms/full-modal';

export interface Props extends Partial<ModalProps> {
  status?: 'success' | 'error';
  buttonText: string;
  title?: string;
  showImage?: boolean;
  hasBackdrop?: boolean;
  buttonAccessibilityRole?: AccessibilityRole;
  onSuccess: (token: string) => void;
  onClose: () => void;
}

const statusBorderColorMap = {
  success: colors.green,
  error: colors.orange
};

export const ReCaptchaModal: React.FC<Props> = ({
  status = 'error',
  isVisible,
  title,
  buttonText,
  accessibilityLabel,
  onSuccess,
  onClose,
  ...modalProps
}) => {
  const insets = useSafeArea();
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  const renderContent = () => (
    <View
      style={[
        styles.container,
        {paddingBottom: 32 + insets.bottom},
        {borderTopColor: status ? statusBorderColorMap[status] : colors.white}
      ]}>
      {!recaptchaLoaded && (
        <View style={styles.spinner}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      )}
      <ReCaptcha
        sitekey={RECAPTCHA_KEY}
        baseUrl={API_HOST}
        onMessage={(result: ReCaptchaResult) => {
          if (result.type === 'success') {
            setRecaptchaLoaded(false);
            return onSuccess(result.token);
          } else if (result.type === 'loaded') {
            return setRecaptchaLoaded(true);
          }
        }}
      />
      <Spacing s={16} />
      <Button
        width="100%"
        onPress={() => {
          setRecaptchaLoaded(false);
          onClose();
        }}>
        <Text>{buttonText}</Text>
      </Button>
    </View>
  );

  return isVisible ? (
    <FullModal
      title={title}
      accessibilityLabel={accessibilityLabel}
      isVisible={isVisible}
      onClose={onClose}
      {...modalProps}>
      {renderContent()}
    </FullModal>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    justifyContent: 'flex-start',
    padding: 12,
    flex: 1
  },
  spinner: {
    flex: 5,
    justifyContent: 'space-around'
  }
});
