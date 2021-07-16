import React, {useState, useEffect, Fragment} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';
import {HIDE_DEBUG} from '@env';
import {getVersion, Version} from 'react-native-exposure-notification-service';

import {ArrowIcon} from '../../atoms/arrow-icon';
import {Card} from '../../atoms/card';
import {Spacing} from '../../atoms/spacing';
import {TutorialModalCard} from '../../organisms/tutorial-modal-card';

import {colors} from '../../../constants/colors';
import {text} from '../../../theme';
import Layouts from '../../../theme/layouts';
import {useApplication} from '../../../providers/context';

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
  const {vaccineCert} = useApplication();
  const [pressCount, setPressCount] = useState<number>(0);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [version, setVersion] = useState<Version>();

  const versionPressHandler = async () => {
    setPressCount(pressCount + 1);
    if (!showDebug && pressCount + 1 >= REQUIRED_PRESS_COUNT) {
      await AsyncStorage.setItem('cti.showDebug', 'y');
      setShowDebug(true);
    }
  };

  useEffect(() => {
    const getVer = async () => {
      const ver = await getVersion();
      setVersion(ver);
    };
    getVer();
  }, []);

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

  const settings: SettingLineItem[][] = [
    [
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
      /*{
        id: 'venueHistory',
        title: t('settings:venueHistory'),
        label: t('settings:venueHistory'),
        hint: t('settings:venueHistoryHint'),
        screen: 'settings.venueHistory'
      },*/
      {
        id: 'checkInReminder',
        title: t('settings:checkInReminder'),
        label: t('settings:checkInReminder'),
        hint: t('settings:checkinReminderHint'),
        screen: 'settings.checkInReminder'
      },
      {
        id: 'vaccineCert',
        title: t('settings:vaccineCert'),
        label: t('settings:vaccineCert'),
        hint: t('settings:vaccineCertHint'),
        screen: vaccineCert ? 'vaccineCert.view' : 'vaccineCert.register'
      },
      {
        id: 'metrics',
        title: t('settings:metrics'),
        label: t('settings:metrics'),
        hint: t('settings:metricsHint'),
        screen: 'settings.metrics'
      },
      {
        id: 'language',
        title: t('settings:language'),
        label: t('settings:language'),
        hint: t('settings:language'),
        screen: 'settings.language'
      },
      {
        id: 'leave',
        title: t('settings:leave'),
        label: t('settings:leave'),
        hint: t('settings:leaveHint'),
        screen: 'settings.leave'
      }
    ],
    [
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
      }
    ]
  ];

  if (HIDE_DEBUG !== 'y' && showDebug) {
    settings.push([
      {
        id: 'debug',
        label: '',
        hint: '',
        title: 'Debug',
        screen: 'settings.debug'
      }
    ]);
  }

  return (
    <Layouts.Scrollable
      heading={t('settings:title')}
      backgroundColor={colors.background}
      scrollStyle={styles.scroll}>
      {settings.map((settingsList, listIndex) => (
        <Fragment key={`list-${listIndex}`}>
          {!!listIndex && <Spacing s={20} />}
          <Card style={styles.container} padding={{h: 0, v: 0, r: 0}}>
            {settingsList.map(({id, label, hint, screen, title}, index) => (
              <TouchableWithoutFeedback
                key={id}
                accessibilityLabel={label}
                accessibilityRole="button"
                accessibilityHint={hint}
                onPress={() => navigation.navigate(screen)}>
                <View
                  style={[
                    styles.item,
                    index === settingsList.length - 1 && styles.itemLast
                  ]}>
                  <Text style={styles.text}>{title}</Text>
                  <ArrowIcon />
                </View>
              </TouchableWithoutFeedback>
            ))}
          </Card>
        </Fragment>
      ))}
      <Spacing s={20} />
      <TutorialModalCard />
      <Spacing s={20} />
      <View style={styles.flex} />
      {version && (
        <Text style={text.default} onPress={versionPressHandler}>
          App version {Platform.OS === 'ios' ? 'iOS' : 'Android'}{' '}
          {version.display}
        </Text>
      )}
      <Spacing s={8} />
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-start'
  },
  container: {
    flex: 0,
    flexGrow: 0
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
  }
});
