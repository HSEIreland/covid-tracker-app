import React, {FC, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  findNodeHandle,
  AccessibilityInfo
} from 'react-native';
import {Card} from '../atoms/card';

import {colors} from '../../constants/colors';
import {text} from '../../theme';
import {useTranslation} from 'react-i18next';
import {useIsFocused, useFocusEffect} from '@react-navigation/native';

interface CheckInCardProps {
  onPress?: () => void;
  accessibilityFocus?: boolean;
  accessibilityRefocus?: boolean;
}

export const CheckInCard: FC<CheckInCardProps> = ({
  onPress,
  accessibilityFocus = false,
  accessibilityRefocus = false
}) => {
  const {t} = useTranslation();
  const ref = useRef<any>();
  const isFocused = useIsFocused();
  useEffect(() => {
    if (ref.current && accessibilityFocus) {
      const tag = findNodeHandle(ref.current);
      if (tag) {
        setTimeout(() => AccessibilityInfo.setAccessibilityFocus(tag), 250);
      }
    }
  }, []);

  useFocusEffect(() => {
    if (isFocused && accessibilityRefocus && ref.current) {
      const tag = findNodeHandle(ref.current);
      if (tag) {
        setTimeout(() => AccessibilityInfo.setAccessibilityFocus(tag), 250);
      }
    }
  });

  return (
    <Card onPress={onPress} padding={{r: 4}}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Image
            accessibilityIgnoresInvertColors
            style={styles.imageSize}
            width={styles.imageSize.width}
            height={styles.imageSize.height}
            source={require('../../assets/images/handkerchief/handkerchief.png')}
          />
        </View>
        <View>
          <Text style={text.largeBlack}>{t('checker:title')}</Text>
          <Text style={[text.smallBold, {color: colors.teal}]}>
            {t('welcome:letUsKnow')}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  icon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  imageSize: {
    width: 64,
    height: 64
  }
});
