import React, {FC, useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TextInput,
  ViewStyle,
  Keyboard,
  Platform
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import phone from 'phone';
import * as Haptics from 'expo-haptics';

import countryCodes from '../../assets/country-codes';
import {setAccessibilityFocusRef} from '../../hooks/accessibility';
import {useApplication} from '../../providers/context';

import {Spacing, Separator} from '../atoms/layout';
import {Button} from '../atoms/button';
import {CountryCodeDropdown} from '../molecules/country-code-dropdown';

import {colors} from '../../constants/colors';
import {baseStyles, inputStyle} from '../../theme';

interface PhoneNumberValues {
  iso: string;
  number: string;
}

const callBackDefaultValues: PhoneNumberValues = {
  iso: 'IE',
  number: ''
};

function isValidPhoneNumber(value: string | null = ''): boolean {
  // @ts-ignore: adding `this` to function args as per TS docs breaks args
  const iso: string = this?.parent?.iso;

  if (!value) {
    return true;
  }

  const country = countryCodes.find((cc) => cc.iso === iso);
  if (!country) {
    return false;
  }

  const number = value.replace(/^0+/, '');
  const result = phone(`${country.code}${number}`, country.iso);
  return result && result.length > 0;
}

const callBackSchema = Yup.object().shape({
  iso: Yup.string(),
  number: Yup.string()
    .matches(/^[\d\s-]+$/, 'invalid')
    .test('is-valid', 'invalid', isValidPhoneNumber)
});

const phoneStyle = inputStyle();

interface PhoneNumberProps {
  style?: ViewStyle;
  buttonLabel: string;
  onSuccess?: (value: string) => void;
}

export const PhoneNumber: FC<PhoneNumberProps> = ({
  style,
  buttonLabel,
  onSuccess
}) => {
  const {t} = useTranslation();
  const app = useApplication();

  const [initialValues, setInitialValues] = useState<PhoneNumberValues>(
    callBackDefaultValues
  );
  const numberInputRef = useRef<TextInput | null>(null);
  const numberErrorRef = useRef<Text | null>(null);

  const {iso: callBackIso, number: callBackNumber} = app.callBackData || {};
  useEffect(() => {
    setInitialValues({
      iso: callBackIso || callBackDefaultValues.iso,
      number: callBackNumber || callBackDefaultValues.number
    });
  }, [callBackIso, callBackNumber]);

  const callBackForm = useFormik({
    initialValues,
    validationSchema: callBackSchema,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: async ({iso, number}) => {
      const country = countryCodes.find((cc) => cc.iso === iso);
      const [mobile] = phone(
        `${country?.code}${number.replace(/^0+/, '')}`,
        iso
      );
      app.setContext({
        callBackData: {
          iso,
          code: country?.code,
          number,
          mobile
        }
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess && onSuccess(mobile);
    }
  });

  const hasIsoError = !!(callBackForm.errors.iso && callBackForm.touched.iso);
  const hasNumError = !!(
    callBackForm.errors.number && callBackForm.touched.number
  );

  const handleTextDone = () => Keyboard.dismiss();
  const handleBlur = () => {
    callBackForm.setFieldTouched('number', true);
    setTimeout(
      () =>
        setAccessibilityFocusRef(
          numberErrorRef.current ? numberErrorRef : numberInputRef
        ),
      Platform.OS === 'ios' ? 0 : 500
    );
  };

  return (
    <View style={style}>
      <CountryCodeDropdown
        value={callBackForm.values.iso}
        onValueChange={(value) => {
          callBackForm.setFieldValue('iso', value || '');
        }}
      />
      <Separator />
      <Text style={baseStyles.label}>{t('phoneNumber:number:label')}</Text>
      <Spacing s={4} />
      <TextInput
        ref={(e) => {
          numberInputRef.current = e;
        }}
        style={phoneStyle}
        onSubmitEditing={handleTextDone}
        placeholderTextColor={colors.teal}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={14}
        placeholder={t('phoneNumber:number:placeholder')}
        onChangeText={(value) => {
          if (value.length === 0 || /^\d+$/.test(value)) {
            callBackForm.setFieldValue('number', value || '');
          }
        }}
        onBlur={handleBlur}
        value={callBackForm.values.number}
      />
      {hasIsoError && (
        <>
          <Spacing s={8} />
          <Text style={baseStyles.error}>
            {t(`phoneNumber:code:error:${callBackForm.errors.iso}`)}
          </Text>
        </>
      )}
      {hasNumError && (
        <>
          <Spacing s={8} />
          <Text style={baseStyles.error} ref={numberErrorRef}>
            {t(`phoneNumber:number:error:${callBackForm.errors.number}`)}
          </Text>
        </>
      )}
      <Spacing s={32} />
      <Button
        disabled={
          !callBackForm.isValid ||
          !callBackForm.dirty ||
          (callBackForm.dirty &&
            callBackIso === callBackForm.values.iso &&
            callBackNumber === callBackForm.values.number)
        }
        onPress={async () => {
          callBackForm.handleSubmit();
          const errors = await callBackForm.validateForm(callBackForm.values);
          if (!callBackForm.isValid || errors.number || errors.iso) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }}>
        {buttonLabel}
      </Button>
    </View>
  );
};
