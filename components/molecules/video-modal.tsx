import React, {useState} from 'react';
import {View, StyleSheet, Text, ActivityIndicator} from 'react-native';
import {ModalProps} from 'react-native-modal';
import {useSafeArea} from 'react-native-safe-area-context';

import {Spacing} from '../atoms/spacing';
import {Button} from '../atoms/button';
import {FullModal} from '../atoms/full-modal';
import {Video} from '../atoms/video';

import {colors} from '../../constants/colors';

export interface VideoModalProps extends Partial<ModalProps> {
  videoId: string;
  buttonText: string;
  title?: string;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isVisible,
  title,
  videoId,
  buttonText,
  onClose,
  ...modalProps
}) => {
  const insets = useSafeArea();
  const [ready, setReady] = useState(false);

  const handleLoaded = () => setReady(true);

  const handleClose = () => {
    setReady(false);
    onClose();
  };

  const renderContent = () => (
    <View style={[styles.container, {paddingBottom: 32 + insets.bottom}]}>
      <View style={styles.centered} accessibilityIgnoresInvertColors={true}>
        {!ready && (
          <View style={styles.spinner}>
            <ActivityIndicator size="large" color={colors.teal} />
          </View>
        )}
        <Video videoId={videoId} onReady={handleLoaded} hidden={!ready} />
      </View>
      <Spacing s={16} />
      <Button onPress={handleClose}>
        <Text>{buttonText}</Text>
      </Button>
    </View>
  );

  return isVisible ? (
    <FullModal
      title={title}
      isVisible={isVisible}
      onClose={handleClose}
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
  centered: {
    flex: 1,
    justifyContent: 'space-around',
    flexDirection: 'column'
  },
  spinner: {
    flex: 5,
    justifyContent: 'space-around'
  }
});
