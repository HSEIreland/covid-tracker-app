import React, {FC, useState, useEffect, useMemo, createRef} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Platform
} from 'react-native';
import {useTranslation} from 'react-i18next';

import {colors} from '../../constants/colors';
import {text} from '../../theme';

interface CodeInputProps {
  style?: ViewStyle;
  count: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
}

export const CodeInput: FC<CodeInputProps> = ({
  style,
  count,
  disabled = false,
  autoFocus = false,
  onChange
}) => {
  const {t} = useTranslation();
  const [values, setValue] = useState<string[]>(Array(count).fill(''));
  const refs = useMemo(
    () => Array.from({length: count}).map(() => createRef<TextInput>()),
    [count]
  );

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
    const normalisedValue = value.substring(0, count);
    let newValues = [...values];

    // If the length is > 1, that means it's an OTP from the keyboard's autocomplete
    // Or it's been pasted from the clipboard
    if (normalisedValue.length > 1) {
      newValues.splice(0, normalisedValue.length, ...normalisedValue);
      refs[normalisedValue.length - 1].current?.focus();
    } else {
      newValues.splice(index, 1, normalisedValue);
      if (normalisedValue && index < count - 1) {
        refs[index + 1].current?.focus();
      }
    }

    setValue(newValues);

    if (!normalisedValue) {
      return;
    }

    if (newValues.every((v) => !!v)) {
      onChange && onChange(newValues.join(''));
    }
  };

  return (
    <View style={[styles.container, style]}>
      {values.map((value, index) => {
        return (
          <TextInput
            key={`i_${index}`}
            ref={refs[index]}
            selectTextOnFocus
            style={[
              styles.block,
              index === 0 && styles.leftMargin,
              index === count - 1 && styles.rightMargin
            ]}
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
    height: 64,
    flex: 1,
    ...text.xxlargeBlack,
    color: colors.teal,
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
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
  }
});
