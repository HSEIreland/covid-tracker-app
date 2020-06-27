import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  StyleProp,
  View,
  ViewStyle,
  Text,
  Image,
  FlatList,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';
import {BUILD_VERSION, HIDE_DEBUG} from 'react-native-dotenv';

import {colors} from '../../../constants/colors';
import {text, shadows} from '../../../theme';
import Layouts from '../../../theme/layouts';

const REQUIRED_PRESS_COUNT = 3;

interface SettingLineItem {
  id: string;
  title: string;
  screen: string;
  label: string;
  hint: string;
}

export * from './check-in';
export * from './leave';
export * from './debug';

interface SettingsProps {
  navigation: StackNavigationProp<any>;
}

export const Settings: React.FC<SettingsProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [pressCount, setPressCount] = useState<number>(0);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  const versionPressHandler = async () => {
    setPressCount(pressCount + 1);
    if (!showDebug && pressCount + 1 >= REQUIRED_PRESS_COUNT) {
      await AsyncStorage.setItem('cti.showDebug', 'y');
      setShowDebug(true);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const showDebugData = await AsyncStorage.getItem('cti.showDebug');
        if (showDebugData) {
          setShowDebug(showDebugData === 'y');
        }
      } catch (err) {
        console.log('Error reading "cti.showDebug" from async storage:', err);
      }
    };
    init();
  }, []);

  const settings: SettingLineItem[] = [
    {
      id: 'contactTracing',
      title: t('settings:contactTracing'),
      label: t('settings:contactTracing'),
      hint: t('settings:contactTracingHint'),
      screen: 'settings.contactTracing'
    },
    {
      id: 'checkIn',
      title: t('settings:checkIn'),
      label: t('settings:checkIn'),
      hint: t('settings:checkinHint'),
      screen: 'settings.checkIn'
    },
    {
      id: 'privacy',
      title: t('settings:privacyPolicy'),
      label: t('settings:privacyPolicy'),
      hint: t('settings:privacyPolicyHint'),
      screen: 'settings.privacy'
    },
    {
      id: 'terms',
      title: t('settings:termsAndConditions'),
      label: t('settings:termsAndConditions'),
      hint: t('settings:termsAndConditionsHint'),
      screen: 'settings.terms'
    },    
    {
      id: 'metrics',
      title: t('settings:metrics'),
      label: t('settings:metrics'),
      hint: t('settings:metricsHint'),
      screen: 'settings.metrics'
    },
    {
      id: 'leave',
      title: t('settings:leave'),
      label: t('settings:leave'),
      hint: t('settings:leaveHint'),
      screen: 'settings.leave'
    }
  ];

  if (HIDE_DEBUG !== 'y' && showDebug) {
    settings.push({
      id: 'debug',
      label: '',
      hint: '',
      title: 'Debug',
      screen: 'settings.debug'
    });
  }

  return (
    <Layouts.Basic heading={t('settings:title')} backgroundColor="#FAFAFA">
      <FlatList
        style={styles.list}
        data={settings}
        renderItem={({item, index}) => {
          const {id, title, label, hint, screen} = item;

          const itemStyle: StyleProp<ViewStyle> = [styles.item];
          if (index === settings.length - 1) {
            itemStyle.push(styles.itemLast);
          }

          return (
            <TouchableWithoutFeedback
              key={id}
              accessibilityLabel={label}
              accessibilityRole="button"
              accessibilityHint={hint}
              onPress={() => navigation.navigate(screen)}>
              <View style={itemStyle}>
                <Text style={styles.text}>{title}</Text>
                <Image
                  accessibilityIgnoresInvertColors
                  style={styles.iconSize}
                  {...styles.iconSize}
                  source={require('../../../assets/images/arrow-right/teal.png')}
                />
              </View>
            </TouchableWithoutFeedback>
          );
        }}
        keyExtractor={({id}) => id}
      />
      <View style={styles.flex} />
      <Text style={text.default} onPress={versionPressHandler}>
        App version {Platform.OS === 'ios' ? 'iOS' : 'Android'} {BUILD_VERSION}
      </Text>
    </Layouts.Basic>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  list: {
    flexGrow: 0,
    marginTop: 0,
    ...shadows.default,
    backgroundColor: colors.white
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.dot
  },
  itemLast: {
    borderBottomWidth: 0
  },
  text: {
    flex: 1,
    ...text.defaultBold
  },
  iconSize: {
    width: 24,
    height: 24
  }
});
