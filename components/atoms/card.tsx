import React, {FC, MutableRefObject} from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Image,
  ImageRequireSource
} from 'react-native';

import {colors} from '../../constants/colors';
import {shadows} from '../../theme';

interface CountyBreakdownCardProps {
  type?: 'warning';
  padding?: {
    h?: number;
    v?: number;
    r?: number;
  };
  icon?: {
    w: number;
    h: number;
    source: ImageRequireSource;
  };
  onPress?: () => void;
  cardRef?: MutableRefObject<TouchableWithoutFeedback>;
}
export const Card: FC<CountyBreakdownCardProps> = ({
  type,
  padding: {h = 16, v = 16, r = 16} = {},
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
            <Image
              accessibilityIgnoresInvertColors
              style={styles.arrowIcon}
              {...styles.arrowIcon}
              source={require('../../assets/images/arrow-right/teal.png')}
            />
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
            <Image
              accessibilityIgnoresInvertColors
              style={styles.arrowIcon}
              {...styles.arrowIcon}
              source={require('../../assets/images/arrow-right/teal.png')}
            />
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
  arrowIcon: {
    width: 24,
    height: 24
  },
  childrenView: {
    flex: 1
  }
});
