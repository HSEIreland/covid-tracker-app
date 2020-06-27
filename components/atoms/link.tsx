import React from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  ViewStyle
} from 'react-native';

import {text as textStyles} from '../../theme';
import {colors} from '../../constants/colors';

interface LinkProps {
  style?: ViewStyle;
  Icon?: any;
  text?: string;
  align?: 'left' | 'right' | 'center';
  large?: boolean;
  onPress: () => void;
  ref?: any;
}

export const Link: React.FC<LinkProps> = React.forwardRef(
  (
    {style, Icon, text, align = 'left', large = false, onPress, children},
    ref: any
  ) => {
    const linkText = text || children;
    return (
      <View style={[styles.container, style]}>
        {Icon && <Icon />}
        <TouchableWithoutFeedback
          ref={ref}
          accessibilityRole="link"
          importantForAccessibility="yes"
          onPress={onPress}>
          <Text
            onPress={() => onPress}
            style={[
              styles.text,
              {textAlign: align},
              large && styles.textLarge
            ]}>
            {linkText}
          </Text>
        </TouchableWithoutFeedback>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  text: {
    flex: 1,
    ...textStyles.defaultBold,
    color: colors.teal
  },
  textLarge: {
    ...textStyles.largeBold,
    color: colors.teal
  }
});
