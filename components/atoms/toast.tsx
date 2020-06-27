import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  Text,
  TextStyle,
  Image,
  ImageRequireSource
} from 'react-native';

import {Markdown} from './markdown';

import {colors} from '../../constants/colors';
import {text} from '../../theme';

interface ToastProps {
  type?: string;
  icon?: ImageRequireSource;
  color?: string;
  message?: string;
  markdown?: boolean;
  style?: ViewStyle;
  iconStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const Toast: React.FC<ToastProps> = ({
  type,
  color,
  icon,
  message,
  style,
  children,
  iconStyle = {},
  textStyle = {}
}) => {
  let iconStyling: ViewStyle[] = [styles.icon, iconStyle];
  let textStyling: TextStyle[] = [text.defaultBold, textStyle];

  if (type === 'error') {
    iconStyling.push(styles.iconError);
    textStyling.push(styles.messageError);
  }

  if (color) {
    iconStyling.push({backgroundColor: color});
  }

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[styles.container, style]}>
      <View style={iconStyling}>
        {icon && <Image accessibilityIgnoresInvertColors source={icon} />}
      </View>
      <View style={styles.messageContainer}>
        {message && <Text style={textStyling}>{message}</Text>}
        {children && <Markdown>{children}</Markdown>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 48
  },
  icon: {
    width: 48,
    minHeight: 48,
    backgroundColor: colors.yellow,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconError: {
    backgroundColor: colors.red
  },
  messageContainer: {
    flex: 1,
    backgroundColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 12
  },
  messageError: {
    color: colors.red
  }
});

export {Toast};
