import React, {FC} from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Image,
  Text
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  useExposure,
  StatusState
} from 'react-native-exposure-notification-service';
import {useSafeArea} from 'react-native-safe-area-context';

import {usePause} from '../../providers/reminders/pause-reminder';
import {colors} from '../../constants/colors';
import {text} from '../../theme';

const ctOnUnselected = require('../../assets/images/contact-tracing/ct-on-unselected.png');
const ctOffUnselected = require('../../assets/images/contact-tracing/ct-off-unselected.png');
const ctOnSelected = require('../../assets/images/contact-tracing/ct-on-selected.png');
const ctOffSelected = require('../../assets/images/contact-tracing/ct-off-selected.png');

const barChartInactive = require('../../assets/images/bar-chart/bar-chart.png');
const barChartActive = require('../../assets/images/bar-chart/bar-chart-active.png');

const checkInactive = require('../../assets/images/covid-gray/covid.png');
const checkActive = require('../../assets/images/covid-teal/covid.png');

const vaccineInactice = require('../../assets/images/vaccine/tab-inactive.png');
const vaccineActive = require('../../assets/images/vaccine/tab-active.png');

/**
 * The component assumes the order of the <Tab /> components in the BottomNavigation is correct.
 * No need for a generic approach... yet.
 */
export const TabBarBottom: FC<any> = ({navigation, state}) => {
  const {t} = useTranslation();
  const {initialised, status, enabled} = useExposure();
  const {paused} = usePause();
  const insets = useSafeArea();

  const tabItems = [
    {
      label: t('tabBar:updates'),
      image: {
        inactive: barChartInactive,
        active: barChartActive
      }
    },
    {
      label: t('tabBar:vaccine'),
      image: {
        inactive: vaccineInactice,
        active: vaccineActive
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
          !initialised ||
          (enabled && !paused && status.state === StatusState.active)
            ? ctOnUnselected
            : ctOffUnselected,
        active:
          !initialised ||
          (enabled && !paused && status.state === StatusState.active)
            ? ctOnSelected
            : ctOffSelected
      }
    }
  ];

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom}]}>
      <View accessibilityRole="tablist" style={styles.tabBar}>
        {tabItems.map((tab, index) => {
          const isActive = state.index === index;
          const routeName = state.routes[index].name;

          return (
            <TouchableWithoutFeedback
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{selected: isActive}}
              importantForAccessibility="yes"
              key={`tab-bar-item-${index}`}
              onPress={() => navigation.navigate(routeName)}>
              <View style={[styles.tab]}>
                <Image
                  accessibilityIgnoresInvertColors
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: colors.white,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopColor: colors.gray,
    borderTopWidth: 2
  },
  tab: {
    maxWidth: '22%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
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
