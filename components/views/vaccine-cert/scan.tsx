import React, {useCallback, useRef, useState} from 'react';
import {BarCodeReadEvent, RNCamera} from 'react-native-camera';
import {StyleSheet} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';

import {Permission} from './permission';
import {useApplication} from '../../../providers/context';
import {useVaccineCertConfig} from '../../../providers/vaccine-cert-config';

export const Scan: React.FC = () => {
  const navigation = useNavigation();
  const {setContext} = useApplication();
  const {verifyCert} = useVaccineCertConfig();

  const cameraRef = useRef<RNCamera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (success && !verifying) {
        navigation.navigate('main');
      }

      if (cameraRef && cameraRef.current) {
        cameraRef.current.refreshAuthorizationStatus();
      }
    }, [cameraRef, navigation, success, verifying])
  );

  const handleBarCodeRead = useCallback(
    async (event: BarCodeReadEvent) => {
      setVerifying(true);
      setScanning(false);

      const result = await verifyCert(event.data);
      const {cert, error} = result;

      if (cert) {
        await setContext({
          vaccineCert: {
            raw: event.data,
            content: cert,
            error
          }
        });

        setSuccess(true);
      }

      navigation.navigate('vaccineCert.view');

      setVerifying(false);
      setScanning(true);
    },
    [setScanning, setSuccess, setVerifying]
  );

  const checkPermissionStatus = ({cameraStatus}: any) => {
    if (cameraStatus === RNCamera.Constants.CameraStatus.NOT_AUTHORIZED) {
      setHasPermission(false);
    }
  };

  if (hasPermission === false) {
    return <Permission onHasPermission={() => setHasPermission(true)} />;
  }

  return (
    <>
      {verifying && <Spinner animation="fade" visible />}
      {scanning && (
        <RNCamera
          ref={cameraRef}
          style={styles.preview}
          captureAudio={false}
          type={RNCamera.Constants.Type.back}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
          onBarCodeRead={!verifying && scanning ? handleBarCodeRead : undefined}
          onStatusChange={checkPermissionStatus}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
});
