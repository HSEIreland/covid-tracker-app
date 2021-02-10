import React, {FC} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  ImageStyle
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigationState, useRoute} from '@react-navigation/native';

import {ArrowIcon} from './arrow-icon';

import {baseStyles, text} from '../../theme';

interface NavBarProps {
  navigation: any;
  scene: any;
  placeholder?: boolean;
}

export const NavBar: FC<NavBarProps> = ({navigation, scene, placeholder}) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {key: routeKey} = useRoute();
  const routes = useNavigationState((state) => state.routes);

  const index = routes.findIndex((route) => route.key === routeKey);
  const hasHistory = !placeholder && index > 0;

  const showSettings = scene.descriptor.options.showSettings === true;

  return (
    <View style={[styles.wrapper, {paddingTop: insets.top + 2}]}>
      <Image
        style={[
          styles.background,
          {
            maxHeight: styles.background.maxHeight + insets.top
          }
        ]}
        resizeMode="cover"
        source={require('../../assets/headerbg.png')}
      />
      <View style={styles.container}>
        <View style={[styles.col, styles.left]}>
          {hasHistory && (
            <TouchableWithoutFeedback
              accessibilityRole="button"
              accessibilityHint={t('navbar:backHint')}
              onPress={() => navigation.goBack()}>
              <View style={styles.back}>
                <ArrowIcon
                  source={require('../../assets/images/back/back.png')}
                />
                <Text allowFontScaling={false} style={styles.backText}>
                  {t('navbar:back')}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
        <View
          accessible
          accessibilityLabel={t('common:name')}
          accessibilityHint={t('common:name')}
          accessibilityRole="text"
          style={[styles.col, styles.center]}>
          <Image
            style={styles.logoSize}
            {...styles.logoSize}
            source={require('../../assets/images/logo/logo.png')}
          />
        </View>
        <View style={[styles.col, styles.right]}>
          {showSettings && (
            <TouchableWithoutFeedback
              accessibilityHint={t('navbar:settingsHint')}
              onPress={() => navigation.navigate('settings')}>
              <View style={styles.settings}>
                <Image
                  style={baseStyles.iconSize as ImageStyle}
                  source={require('../../assets/images/settings/settings.png')}
                />
                <Text allowFontScaling={false} style={text.xsmallBold}>
                  {t('navbar:settings')}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center'
  },
  background: {
    flex: 1,
    resizeMode: 'stretch',
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    maxHeight: 62
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  col: {
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  left: {
    width: '25%',
    alignItems: 'flex-start',
    paddingLeft: 4
  },
  center: {
    width: '50%',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  right: {
    width: '25%',
    alignItems: 'flex-end',
    paddingRight: 12
  },
  back: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  backText: {
    ...text.largeBold,
    textAlign: 'left',
    marginLeft: -4
  },
  settings: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  logoSize: {
    width: 92,
    height: 36
  }
});
