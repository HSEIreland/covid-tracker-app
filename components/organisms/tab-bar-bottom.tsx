import React, {FC} from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Image,
  Text,
  Share,
  Platform
} from 'react-native';
import {TFunction} from 'i18next';
import {useTranslation} from 'react-i18next';
import Constants from 'expo-constants';

import {colors} from '../../constants/colors';
import {text} from '../../theme';
import {useExposure, StatusState} from '../../providers/exposure';

export const shareApp = async (t: TFunction) => {
  try {
    await Share.share(
      {
        title: t('common:message'),
        message:
          Platform.OS === 'android'
            ? t('common:url')
            : t('common:message'),
        url: t('common:url')
      },
      {
        subject: t('common:name'),
        dialogTitle: t('common:name')
      }
    );
  } catch (error) {
    console.log(t('tabBar:shareError'));
  }
};

const ctOnUnselected = require('../../assets/images/contact-tracing/ct-on-unselected.png');
const ctOffUnselected = require('../../assets/images/contact-tracing/ct-off-unselected.png');
const ctOnSelected = require('../../assets/images/contact-tracing/ct-on-selected.png');
const ctOffSelected = require('../../assets/images/contact-tracing/ct-off-selected.png');

const barChartInactive = require('../../assets/images/bar-chart/bar-chart.png');
const barChartActive = require('../../assets/images/bar-chart/bar-chart-active.png');

const checkInactive = require('../../assets/images/covid-gray/covid.png');
const checkActive = require('../../assets/images/covid-teal/covid.png');

const shareIcon = require('../../assets/images/share/share.png');

/**
 * The component assumes the order of the <Tab /> components in the BottomNavigation is correct.
 * No need for a generic approach... yet.
 */
export const TabBarBottom: FC<any> = ({navigation, state}) => {
  const {t} = useTranslation();
  const {status, enabled} = useExposure();

  const tabItems = [
    {
      label: t('tabBar:updates'),
      image: {
        inactive: barChartInactive,
        active: barChartActive
      }
    },
    {
      label: t('tabBar:symptomCheck'),
      image: {
        inactive: checkInactive,
        active: checkActive
      }
    },
    {
      label: t('tabBar:contactTracing'),
      image: {
        w: 30,
        h: 24,
        inactive:
          status.state === StatusState.active && enabled
            ? ctOnUnselected
            : ctOffUnselected,
        active:
          status.state === StatusState.active && enabled
            ? ctOnSelected
            : ctOffSelected
      }
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabItems.map((tab, index) => {
          const isActive = state.index === index;
          const routeName = state.routes[index].name;

          return (
            <TouchableWithoutFeedback
              key={`tab-bar-item-${index}`}
              onPress={() => navigation.navigate(routeName)}>
              <View style={[styles.tab]}>
                <Image
                  accessibilityIgnoresInvertColors={false}
                  style={{width: tab.image.w || 24, height: tab.image.h || 24}}
                  width={tab.image.w || 24}
                  height={tab.image.h || 24}
                  source={isActive ? tab.image.active : tab.image.inactive}
                />
                <Text
                  allowFontScaling={false}
                  style={[styles.label, isActive && styles.labelActive]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
        <TouchableWithoutFeedback onPress={() => shareApp(t)}>
          <View style={[styles.tab]}>
            <Image
              accessibilityIgnoresInvertColors
              style={styles.iconSize}
              {...styles.iconSize}
              source={shareIcon}
            />
            <Text allowFontScaling={false} style={[styles.label]}>
              {t('tabBar:shareApp')}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingBottom: Constants.statusBarHeight === 44 ? 34 : 0
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopColor: colors.gray,
    borderTopWidth: 2
  },
  tab: {
    maxWidth: '22%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 3
  },
  label: {
    ...text.smallBold,
    lineHeight: 14,
    letterSpacing: -0.35,
    paddingTop: 2,
    textAlign: 'center'
  },
  labelActive: {
    color: colors.text
  },
  iconSize: {
    width: 24,
    height: 24
  }
});
