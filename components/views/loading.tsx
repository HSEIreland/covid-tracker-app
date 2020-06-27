import React, {FC} from 'react';
import {StyleSheet, Dimensions, Image, View} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Layouts from '../../theme/layouts';
import {Spacing} from '../atoms/spacing';
import {ResponsiveImage} from '../atoms/responsive-image';
import {useTranslation} from 'react-i18next';
import {useSafeArea} from 'react-native-safe-area-context';
import {colors} from '../../constants/colors';

const width = Dimensions.get('window').width;
const SPLASH_WIDTH = 375;
const SPLASH_HEIGHT = 291;

export const Loading: FC = () => {
  const {t} = useTranslation();
  const insets = useSafeArea();
  return (
    <View style={[styles.container, {paddingBottom: insets.bottom}]}>
      <View style={styles.bg} />
      <Spacing s={164}/>
      <Image
          style={{width, height: (width * SPLASH_HEIGHT) / SPLASH_WIDTH}}
          width={width}
          height={(width * SPLASH_HEIGHT) / SPLASH_WIDTH}
          resizeMode="contain"
          source={require('../../assets/age-bg.png')}
          accessible
          accessibilityRole="text"
          accessibilityHint={t('common:name')}
          accessibilityIgnoresInvertColors
        />
      <Spacing s={64}/>

      <Spinner animation="fade" visible />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'space-between'
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    height: 500,
    backgroundColor: colors.yellow
  },
  scroll: {
    flex: 1
  },
  empty: {
    flex: 1,
    backgroundColor: colors.yellow
  },
  bottom: {
    paddingHorizontal: 20
  },
  center: {
    textAlign: 'center'
  }
});
