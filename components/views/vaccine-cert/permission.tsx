import React, {FC, useCallback} from 'react';
import {
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import Layouts from '../../../theme/layouts';
import {Button} from '../../atoms/button';
import {Link} from '../../atoms/link';
import {Spacing} from '../../atoms/layout';
import {baseStyles} from '../../../theme';

interface PermissionProps {
  onHasPermission: () => void;
}

export const Permission: FC<PermissionProps> = ({onHasPermission}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const goBack = useCallback(() => navigation.navigate('main'), [navigation]);

  const requestAndroidCameraPermission = async () => {
    try {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );

      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        onHasPermission();
      } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Linking.openSettings();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const openIOSAppSettings = () => {
    Linking.openSettings();
  };

  const requestCameraPermission = () => {
    Platform.OS === 'ios'
      ? openIOSAppSettings()
      : requestAndroidCameraPermission();
  };

  return (
    <Layouts.PinnedBottom heading={t('vaccineCert:permission:heading')}>
      <View style={styles.icon}>
        <Image
          accessibilityIgnoresInvertColors
          style={[styles.imageSize, baseStyles.flipIfRtl]}
          width={styles.imageSize.width}
          height={styles.imageSize.height}
          source={require('../../../assets/images/vaccine-cert/icon.png')}
        />
      </View>
      <View style={styles.text}>
        <Text>{t('vaccineCert:permission:text')}</Text>
      </View>
      <View>
        <Button width={'100%'} onPress={requestCameraPermission}>
          {t('vaccineCert:permission:allowButton')}
        </Button>
        <Spacing s={24} />
        <Link align="center" large={true} onPress={goBack}>
          {t('vaccineCert:permission:cancelButton')}
        </Link>
      </View>
    </Layouts.PinnedBottom>
  );
};

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16
  },
  text: {
    marginBottom: 24
  },
  imageSize: {
    width: 64,
    height: 64
  }
});
