import React, {useState, useEffect, useCallback, FC} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {useTranslation} from 'react-i18next';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useExposure} from 'react-native-exposure-notification-service';
import {add, isPast} from 'date-fns';

import {useApplication} from '../../providers/context';
import {saveMetric, METRIC_TYPES} from '../../services/api/utils';

import {
  validateCode,
  uploadExposureKeys,
  ValidationResult
} from '../../services/api/exposures';
import {usePause} from '../../providers/reminders/pause-reminder';
import {useSettings} from '../../providers/settings';
import {setAccessibilityFocusRef, useFocusRef} from '../../hooks/accessibility';

import {DataProtectionLink} from './data-protection-policy';

import {Heading} from '../atoms/heading';
import {Spacing} from '../atoms/layout';
import {Markdown} from '../atoms/markdown';
import {Button} from '../atoms/button';
import {Card} from '../atoms/card';
import {Toast} from '../atoms/toast';
import {CodeInput} from '../molecules/code-input';
import {SingleCodeInput} from '../molecules/single-code-input';

import {colors} from '../../constants/colors';
import Layouts from '../../theme/layouts';
import {text, baseStyles} from '../../theme';

type UploadStatus =
  | 'initialising'
  | 'validate'
  | 'upload'
  | 'uploadOnly'
  | 'success'
  | 'permissionError'
  | 'error';

interface Props {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any, any>;
}

const MAX_SETTINGS_AGE = 5; // hours

export const UploadKeys: FC<Props> = ({navigation, route}) => {
  const {t} = useTranslation();
  const exposure = useExposure();
  const {paused} = usePause();
  const {
    showActivityIndicator,
    hideActivityIndicator,
    pendingCode,
    setContext,
    user
  } = useApplication();
  const {
    appConfig: {codeLength, deepLinkLength},
    loaded,
    loadedTime,
    reload
  } = useSettings();

  const [status, setStatus] = useState<UploadStatus>('initialising');

  const [presetCode, setPresetCode] = useState(pendingCode || '');
  const codeInParams: string | undefined = route.params?.c;
  const hasPresetCode = !!(presetCode || codeInParams);
  const show6DigitInput = !hasPresetCode && codeLength === 6;
  const expectedCodeLength = hasPresetCode ? deepLinkLength : codeLength;

  const [code, setCode] = useState(presetCode);
  const [validationError, setValidationError] = useState<string>('');
  const [uploadToken, setUploadToken] = useState('');

  const [headingRef, toastRef, successRef, uploadRef, errorRef] = useFocusRef({
    count: 5
  });

  const isRegistered = !!user;
  const isPresetCode = presetCode.length > 0 && code === presetCode;

  const updateCode = useCallback((input: string) => {
    setValidationError('');
    setCode(input);
  }, []);
  const clearPresetCode = () => {
    setPresetCode('');
    updateCode('');
    setAccessibilityFocusRef(headingRef);
  };

  useEffect(() => {
    // Handle code set in params by deep link
    if (!codeInParams) {
      return;
    }
    if (!isRegistered) {
      // Store code so we can bring new user back with it when they onboard
      setContext({pendingCode: codeInParams});
      navigation.reset({
        index: 0,
        routes: [{name: 'over16'}]
      });
      return;
    }

    if (status === 'validate' && typeof codeInParams === 'string') {
      // Move the code out of params and clear any current code so that
      // re-trying a deep link re-applies it (e.g. if user had been offline)
      navigation.setParams({c: ''});
      updateCode('');
      setPresetCode('');

      // Apply deep link params code in next render after clearing
      setTimeout(() => {
        updateCode(codeInParams);
        setPresetCode(codeInParams);
      });
    }
  }, [codeInParams, navigation, updateCode, status, isRegistered, setContext]);

  useEffect(() => {
    if (
      loaded &&
      loadedTime &&
      isPast(add(loadedTime, {hours: MAX_SETTINGS_AGE}))
    ) {
      console.log(
        `Settings are older than ${MAX_SETTINGS_AGE} hours, reloading in background`
      );
      reload();
    }
  }, [loaded, loadedTime, reload]);

  useEffect(() => {
    const readUploadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('uploadToken');
        if (token) {
          setUploadToken(token);
          setStatus('uploadOnly');
          return;
        }
      } catch (e) {}

      setStatus('validate');
    };
    readUploadToken();
  }, []);

  const codeValidationHandler = useCallback(async () => {
    showActivityIndicator();

    console.log(`Validating ${code.length} character code...`);
    const {result, token} = await validateCode(code);

    hideActivityIndicator();

    if (result !== ValidationResult.Valid) {
      let errorMessage;
      if (result === ValidationResult.NetworkError) {
        errorMessage = t('common:networkError');
      } else if (result === ValidationResult.Expired) {
        errorMessage = t('uploadKeys:code:expiredError');
      } else if (result === ValidationResult.Invalid) {
        errorMessage = t('uploadKeys:code:invalidError');
      } else {
        errorMessage = t('uploadKeys:code:error');
      }

      console.log(
        `${code.length}-character code validation ${
          errorMessage ? `failed with error "${errorMessage}"` : 'passed'
        }`
      );

      setValidationError(errorMessage);
      setTimeout(() => {
        setAccessibilityFocusRef(isPresetCode ? headingRef : errorRef);
      }, 350);
      return;
    }

    try {
      await SecureStore.setItemAsync('uploadToken', token!);
    } catch (e) {
      console.log('Error (secure) storing upload token', e);
    }
    setValidationError('');

    setUploadToken(token!);
    setStatus('upload');
    setTimeout(() => {
      setAccessibilityFocusRef(isPresetCode ? headingRef : uploadRef);
    }, 350);
  }, [
    code,
    isPresetCode,
    showActivityIndicator,
    hideActivityIndicator,
    t,
    errorRef,
    uploadRef,
    headingRef
  ]);

  const shouldValidate =
    code.length && (code.length === expectedCodeLength || isPresetCode);

  useEffect(() => {
    if (isRegistered) {
      if (shouldValidate) {
        codeValidationHandler();
      } else {
        setValidationError('');
      }
    }
  }, [codeValidationHandler, isRegistered, shouldValidate]);

  const uploadDataHandler = async () => {
    let exposureKeys;
    try {
      if (paused) {
        try {
          await exposure.start();
        } catch (e) {
          console.log(e);
        }
      }

      exposureKeys = await exposure.getDiagnosisKeys();
    } catch (err) {
      console.log('getDiagnosisKeys error:', err);
      if (paused) {
        try {
          await exposure.pause();
        } catch (e) {
          console.log(e);
        }
      }
      setStatus('permissionError');
      setTimeout(() => {
        setAccessibilityFocusRef(toastRef);
      }, 350);
      return;
    }

    try {
      showActivityIndicator();
      await uploadExposureKeys(uploadToken, exposureKeys);
      hideActivityIndicator();

      setContext({uploadDate: Date.now()});

      setStatus('success');
      setTimeout(() => {
        setAccessibilityFocusRef(successRef);
      }, 350);
    } catch (err) {
      console.log('error uploading exposure keys:', err);
      saveMetric({
        event: METRIC_TYPES.LOG_ERROR,
        payload: JSON.stringify({
          where: 'uploadExposureKeys',
          error: JSON.stringify(err)
        })
      });
      hideActivityIndicator();

      setStatus('error');
      setTimeout(() => {
        setAccessibilityFocusRef(toastRef);
      }, 350);
    } finally {
      if (paused) {
        try {
          await exposure.pause();
        } catch (e) {
          console.log(e);
        }
      }
    }

    try {
      await SecureStore.deleteItemAsync('uploadToken');
    } catch (e) {}
  };

  const renderValidation = () => {
    // Remount and clear input if a new presetCode is provided
    const inputKey = `code-input-${presetCode}`;

    const validationDone = status !== 'validate';
    const showValidationError =
      !!validationError &&
      !validationDone &&
      (code.length === codeLength || !!presetCode);

    const onDoneHandler = () =>
      validationError && setAccessibilityFocusRef(errorRef);

    return (
      <View key={inputKey}>
        <Markdown markdownStyles={{block: {...text.default, marginBottom: 16}}}>
          {isPresetCode
            ? t('uploadKeys:code:deepLink', {deepLinkLength})
            : t('uploadKeys:code:intro', {codeLength})}
        </Markdown>
        <Spacing s={16} />
        {show6DigitInput ? (
          <CodeInput
            error={showValidationError}
            onChange={updateCode}
            disabled={validationDone}
            code={code}
            onDone={onDoneHandler}
            count={codeLength}
          />
        ) : (
          <SingleCodeInput
            error={showValidationError}
            onChange={updateCode}
            disabled={validationDone}
            code={code}
            onDone={onDoneHandler}
            isPreset={!!presetCode}
          />
        )}
        {showValidationError && (
          <>
            <Spacing s={8} />
            <Text ref={errorRef} style={baseStyles.error}>
              {validationError}
            </Text>
            {isPresetCode && (
              <>
                <Spacing s={40} />
                <Button type="default" onPress={clearPresetCode}>
                  {t('codeInput:accessibilityHint', {count: codeLength})}
                </Button>
              </>
            )}
          </>
        )}
        <Spacing s={24} />
      </View>
    );
  };

  const renderUpload = () => {
    return (
      <>
        <View accessible ref={uploadRef}>
          <Markdown>{t('uploadKeys:upload:intro', {codeLength})}</Markdown>
        </View>
        <Spacing s={8} />
        <Button type="default" onPress={uploadDataHandler}>
          {t('uploadKeys:upload:button')}
        </Button>
        <Spacing s={16} />
        <DataProtectionLink />
      </>
    );
  };

  const renderErrorToast = () => {
    return (
      <>
        <Toast
          ref={toastRef}
          color={colors.red}
          message={
            status === 'permissionError'
              ? t('uploadKeys:permissionError')
              : t('uploadKeys:uploadError')
          }
          icon={require('../../assets/images/alert/alert.png')}
        />
        <Spacing s={8} />
      </>
    );
  };

  const renderUploadSuccess = () => {
    return (
      <Card padding={{v: 4}} cardRef={successRef}>
        <Spacing s={16} />
        <Toast
          color="rgba(0, 207, 104, 0.16)"
          message={t('uploadKeys:uploadSuccess:toast')}
          icon={require('../../assets/images/success/green.png')}
        />
        <Text style={[text.default, styles.successText]}>
          {t('uploadKeys:uploadSuccess:thanks')}
        </Text>
        <Button
          type="empty"
          onPress={() => navigation.navigate('main', {screen: 'dashboard'})}>
          {t('uploadKeys:uploadSuccess:updates')}
        </Button>
        <Spacing s={16} />
      </Card>
    );
  };

  if (!isRegistered) {
    return null;
  }

  const showErrorToast = status === 'permissionError' || status === 'error';
  const showValidation = status === 'validate' || status === 'upload';
  const showUpload =
    status === 'upload' ||
    status === 'uploadOnly' ||
    status === 'error' ||
    status === 'permissionError';
  const showUploadSuccess = status === 'success';

  return (
    <Layouts.KeyboardScrollable>
      <Heading
        accessibilityFocus
        text={t('uploadKeys:title')}
        headingRef={headingRef}
      />
      {showValidation && renderValidation()}
      {showErrorToast && renderErrorToast()}
      {showUpload && renderUpload()}
      {showUploadSuccess && renderUploadSuccess()}
    </Layouts.KeyboardScrollable>
  );
};

const styles = StyleSheet.create({
  markdownStyle: {
    backgroundColor: colors.background
  },
  successText: {
    marginTop: 16,
    marginBottom: 16
  },
  codeInput: {
    marginTop: -12
  }
});
