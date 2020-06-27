import React, {useEffect, useRef} from 'react';
import {
  Text,
  StyleSheet,
  View,
  findNodeHandle,
  AccessibilityInfo
} from 'react-native';

import {Spacing} from './spacing';
import {text as textStyles} from '../../theme';
import {colors} from '../../constants/colors';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';

interface HeadingProps {
  text: string;
  lineWidth?: number;
  accessibilityFocus?: boolean;
  accessibilityRefocus?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
  text,
  lineWidth,
  accessibilityFocus = false,
  accessibilityRefocus = false
}) => {
  const ref = useRef<any>();
  const isFocused = useIsFocused();
  useEffect(() => {
    if (ref.current && accessibilityFocus) {
      const tag = findNodeHandle(ref.current);
      if (tag) {
        setTimeout(() => AccessibilityInfo.setAccessibilityFocus(tag), 200);
      }
    }
  }, []);

  useFocusEffect(() => {
    if (isFocused && accessibilityRefocus && ref.current) {
      const tag = findNodeHandle(ref.current);
      if (tag) {
        setTimeout(() => AccessibilityInfo.setAccessibilityFocus(tag), 200);
      }
    }
  });

  return (
    <>
      <Text importantForAccessibility="yes" ref={ref} style={styles.heading}>
        {text}
      </Text>
      <View style={[styles.line, !!lineWidth && {width: lineWidth}]}>
        <View style={[styles.lineThird, styles.lineOneColor]} />
        <View style={[styles.lineThird, styles.lineTwoColor]} />
        <View style={[styles.lineThird, styles.lineThreeColor]} />
      </View>
      <Spacing s={16} />
    </>
  );
};
const styles = StyleSheet.create({
  heading: {
    ...textStyles.xlargeBold,
    paddingBottom: 8
  },
  line: {
    height: 6,
    flexDirection: 'row'
  },
  lineThird: {
    flex: 1,
    height: 6
  },
  lineOneColor: {
    backgroundColor: colors.darkerYellow
  },
  lineTwoColor: {
    backgroundColor: colors.yellow
  },
  lineThreeColor: {
    backgroundColor: colors.mildYellow
  }
});
