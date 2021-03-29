import React, {FC, useState, useEffect, useMemo, createRef} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Platform,
  Keyboard
} from 'react-native';
import {useTranslation} from 'react-i18next';

import {colors} from '../../constants/colors';
import {scale} from '../../theme';

interface CodeInputProps {
  style?: ViewStyle;
  code: string;
  count: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  onDone?: () => void;
  error?: boolean;
}

export const CodeInput: FC<CodeInputProps> = ({
  style,
  count,
  code,
  disabled = false,
  autoFocus = false,
  onChange,
  onDone,
  error
}) => {
  const {t} = useTranslation();
  const [values, setValue] = useState<string[]>(Array(count).fill(''));
  const refs = useMemo(
    () => Array.from({length: count}).map(() => createRef<TextInput>()),
    [count]
  );

  const showErrorStyling = error && String(values.join('')) === code;

  useEffect(() => {
    if (autoFocus) {
      refs[0].current?.focus();
    }
  }, [refs, autoFocus]);

  const onKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0) {
      if (values[index] === '') {
        refs[index - 1].current?.focus();
      }
    }
  };

  const onChangeTextHandler = (index: number, value: string) => {
    let normalisedValue = value.substring(0, count);
    const newValues = [...values];

    // If the length is > 1, that means it's an OTP from the keyboard's autocomplete
    // If user manages to type a second character in one box, move it to next box
    if (
      normalisedValue.length === 2 &&
      normalisedValue.charAt(0) === values[index]
    ) {
      normalisedValue = normalisedValue.charAt(1);
      if (index < count - 1) {
        index++;
      }
    }

    // If the length is still > 1, that means it's an OTP from the keyboard's autocomplete    // Or it's been pasted from the clipboard
    if (normalisedValue.length > 1) {
      newValues.splice(0, normalisedValue.length, ...normalisedValue);
      refs[Math.min(normalisedValue.length, refs.length - 1)].current?.focus();
    } else {
      newValues.splice(index, 1, normalisedValue);
      if (normalisedValue && index < count - 1) {
        refs[index + 1].current?.focus();
      }
    }

    setValue(newValues);

    onChange && onChange(newValues.join(''));
  };

  return (
    <View style={[styles.container, style]}>
      {values.map((value, index) => {
        return (
          <TextInput
            key={`i_${index}`}
            ref={refs[index]}
            maxFontSizeMultiplier={1}
            selectTextOnFocus
            style={[
              styles.block,
              index === 0 && styles.leftMargin,
              index === count - 1 && styles.rightMargin,
              showErrorStyling && styles.errorBlock
            ]}
            onSubmitEditing={() => {
              Keyboard.dismiss();
              if (onDone) {
                onDone();
              }
            }}
            keyboardType="number-pad"
            returnKeyType="done"
            textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
            editable={!disabled}
            value={value}
            onChangeText={(txt) => onChangeTextHandler(index, txt)}
            onKeyPress={(e) => onKeyPress(index, e)}
            accessibilityLabel={t('codeInput:accessibilityLabel', {
              number: index + 1
            })}
            accessibilityHint={t('codeInput:accessibilityHint', {count})}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  block: {
    flex: 1,
    fontSize: scale(32),
    color: colors.teal,
    textAlign: 'center',
    paddingHorizontal: 0,
    paddingVertical: 12,
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.dot,
    borderRadius: 3,
    marginHorizontal: 6
  },
  leftMargin: {
    marginLeft: 0
  },
  rightMargin: {
    marginRight: 0
  },
  errorBlock: {
    color: colors.red,
    borderColor: colors.red
  }
});
