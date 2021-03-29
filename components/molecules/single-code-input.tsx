import React, {useState, createRef} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ViewStyle,
  AccessibilityProps,
  PixelRatio,
  Platform,
  LayoutChangeEvent,
  Keyboard,
  TextInputProps
} from 'react-native';

import {useApplication} from '../../providers/context';
import {useSettings} from '../../providers/settings';

import {colors} from '../../constants/colors';
import {scale, text} from '../../theme';

interface SingleCodeInputProps extends AccessibilityProps {
  error?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
  autoFocus?: boolean;
  isPreset?: boolean;
  onChange?: (value: string) => void;
  code?: string;
  onDone?: () => void;
}

export const SingleCodeInput: React.FC<SingleCodeInputProps> = ({
  style,
  disabled = false,
  onChange,
  onDone,
  error,
  accessibilityHint,
  accessibilityLabel,
  code = '',
  isPreset
}) => {
  const [value, setValue] = useState<string>(code);
  const {
    appConfig: {codeLength, deepLinkLength}
  } = useSettings();

  const inputRef = createRef<TextInput>();
  const fontScale = PixelRatio.getFontScale();
  const [containerWidth, setContainerWidth] = useState(280);

  const expectedCodeLength = isPreset ? deepLinkLength : codeLength;

  const {
    accessibility: {screenReaderEnabled}
  } = useApplication();

  const onChangeTextHandler = (v: string) => {
    const validatedValue = v.replace(/\s/g, '');

    setValue(validatedValue);

    if (!validatedValue) {
      return;
    }

    if (onChange) {
      onChange(validatedValue);
    }
  };

  const onFocusHandler = () => {
    if (error) {
      inputRef.current?.clear();
      inputRef.current?.focus();
      if (onChange) {
        onChange(value);
      }
    }
  };

  const expectsLongCode = code.length && expectedCodeLength > 10;

  const onLayoutHandler = ({
    nativeEvent: {
      layout: {width}
    }
  }: LayoutChangeEvent) => {
    setContainerWidth(width);
  };

  // Distribute characters based on approximate available horizontal space
  const textStyle = expectsLongCode ? styles.inputLong : styles.inputShort;
  const paddedLength = expectedCodeLength + 1;
  const uncappedFontSize = scale(textStyle.fontSize || 16);
  const approxFontSizeToWidth = 0.7;
  const maxCharWidth = containerWidth / paddedLength;
  const maxFontSize = maxCharWidth / approxFontSizeToWidth / fontScale;
  const fontSize = Math.min(maxFontSize, uncappedFontSize);

  const cappedSpacePerChar = fontScale * fontSize * approxFontSizeToWidth;
  const letterSpacing = Math.max(
    0,
    (containerWidth - paddedLength * cappedSpacePerChar) / paddedLength
  );

  const isIos = Platform.OS === 'ios';

  const keyboardProps: TextInputProps = isPreset
    ? {
        keyboardType: isIos ? 'ascii-capable' : 'visible-password',
        secureTextEntry: !isIos
      }
    : {
        keyboardType: 'number-pad',
        textContentType: isIos ? 'oneTimeCode' : 'none'
      };

  return (
    <View style={[styles.container, style]} onLayout={onLayoutHandler}>
      <TextInput
        ref={inputRef}
        selectTextOnFocus
        autoFocus={!screenReaderEnabled}
        style={[
          styles.input,
          textStyle,
          {height: 60 * fontScale, letterSpacing},
          error ? styles.errorBlock : styles.block,
          {fontSize}
        ]}
        onSubmitEditing={() => {
          Keyboard.dismiss();
          if (onDone) {
            onDone();
          }
        }}
        maxLength={expectedCodeLength}
        autoCompleteType="off"
        autoCorrect={false}
        returnKeyType="done"
        blurOnSubmit={true}
        editable={!disabled && !isPreset}
        value={value}
        onFocus={onFocusHandler}
        onChangeText={onChangeTextHandler}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        {...keyboardProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 0,
    borderWidth: 1,
    backgroundColor: colors.white
  },
  inputLong: {
    ...text.defaultBold
  },
  inputShort: {
    ...text.xxlargeBlack
  },
  block: {
    color: colors.teal,
    borderColor: colors.grayBorder
  },
  errorBlock: {
    color: colors.red,
    borderColor: colors.red
  }
});
