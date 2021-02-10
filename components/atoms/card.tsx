import React, {FC, MutableRefObject} from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Image,
  ImageRequireSource,
  ViewStyle
} from 'react-native';

import {ArrowIcon} from './arrow-icon';

import {colors} from '../../constants/colors';
import {shadows} from '../../theme';

export type CardRef =
  | ((instance: TouchableWithoutFeedback | null) => void)
  | MutableRefObject<TouchableWithoutFeedback | null>
  | null
  | undefined;

interface CardProps {
  type?: 'warning';
  padding?: {
    h?: number;
    v?: number;
    r?: number;
  };
  style?: ViewStyle;
  icon?: {
    w: number;
    h: number;
    source: ImageRequireSource;
  };
  onPress?: () => void;
  cardRef?: CardRef;
}
export const Card: FC<CardProps> = ({
  type,
  padding: {h = 16, v = 16, r = 16} = {},
  style,
  icon,
  onPress,
  cardRef,
  children
}) => {
  if (!onPress) {
    return (
      <View
        style={[
          styles.card,
          type === 'warning' && styles.cardWarning,
          {paddingHorizontal: h, paddingVertical: v, paddingRight: r},
          style
        ]}>
        {icon && (
          <View style={styles.icon}>
            <Image
              accessibilityIgnoresInvertColors
              style={{width: icon.w, height: icon.h}}
              width={icon.w}
              height={icon.h}
              source={icon.source}
            />
          </View>
        )}
        <View style={styles.childrenView}>{children}</View>
        {onPress && (
          <View style={styles.row}>
            <ArrowIcon />
          </View>
        )}
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback
      ref={cardRef}
      accessibilityRole="button"
      onPress={onPress}>
      <View
        style={[
          styles.card,
          type === 'warning' && styles.cardWarning,
          {paddingHorizontal: h, paddingVertical: v, paddingRight: r}
        ]}>
        {icon && (
          <View style={styles.icon}>
            <Image
              accessibilityIgnoresInvertColors
              style={{width: icon.w, height: icon.h}}
              width={icon.w}
              height={icon.h}
              source={icon.source}
            />
          </View>
        )}
        <View style={styles.childrenView}>{children}</View>
        {onPress && (
          <View style={styles.row}>
            <ArrowIcon />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    ...shadows.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardWarning: {
    borderWidth: 2,
    borderColor: colors.red
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  childrenView: {
    flex: 1
  }
});
