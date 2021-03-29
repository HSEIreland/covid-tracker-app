import React, {useEffect, useState} from 'react';
import {enableScreens} from 'react-native-screens';
import {Platform, StatusBar, Image, AppState} from 'react-native';
import {
  getStateFromPath,
  LinkingOptions,
  NavigationContainer,
  NavigationContainerRef
} from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators
} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import PushNotification, {
  PushNotification as PN
} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import Spinner from 'react-native-loading-spinner-overlay';
// import NetInfo from '@react-native-community/netinfo';
import {useTranslation} from 'react-i18next';
import {
  ExposureProvider,
  TraceConfiguration,
  KeyServerType,
  useExposure,
  StatusState,
  getConfigData
} from 'react-native-exposure-notification-service';

import {Asset} from 'expo-asset';
import * as Font from 'expo-font';
import * as SecureStore from 'expo-secure-store';

import './services/i18n';
import {useRtl} from './hooks/i18n';

import {ApplicationProvider, useApplication} from './providers/context';
import {
  SettingsProvider,
  SettingsContext,
  useSettings
} from './providers/settings';

import {urls} from './constants/urls';

import {Base} from './components/templates/base';
import {NavBar} from './components/atoms/navbar';
import {TabBarBottom} from './components/organisms/tab-bar-bottom';

import {Over16} from './components/views/over-16';
import {Under16} from './components/views/under-16';
import {GetStarted} from './components/views/get-started';
import {YourData} from './components/views/your-data';
import {AppUsage} from './components/views/app-usage';
import {ContactTracingInformation} from './components/views/contact-tracing-information';
import {FollowUpCall} from './components/views/follow-up-call';

import {Sorry} from './components/views/sorry';
import {
  DataProtectionPolicy,
  TermsAndConditions
} from './components/views/data-protection-policy';

import {Dashboard} from './components/views/dashboard';
import {SymptomChecker} from './components/views/symptom-checker';
import {SymptomsHistory} from './components/views/symptoms-history';
import {ContactTracing} from './components/views/contact-tracing';
import {CountyBreakdown} from './components/views/county-breakdown';
import {CountyChart} from './components/views/chart-by-county';
import {CloseContactInfo} from './components/views/close-contact-info';
import {CloseContactAlert} from './components/views/close-contact-alert';
import {UploadKeys} from './components/views/upload-keys';
import {Reminder} from './components/views/reminder';
import {VaccineStats} from './components/views/vaccine-stats';
import {VaccineByCounty} from './components/views/vaccine-by-county';

import {Settings} from './components/views/settings';
import {ContactTracingSettings} from './components/views/settings/contact-tracing';
import {CheckInSettings} from './components/views/settings/check-in';
import {CheckInReminder} from './components/views/settings/check-in-reminder';
import {Metrics} from './components/views/settings/metrics';
import {Language} from './components/views/settings/language';
import {Leave} from './components/views/settings/leave';
import {Debug} from './components/views/settings/debug';

import {isMountedRef, navigationRef} from './navigation';
import {colors} from './constants/colors';
import {Loading} from './components/views/loading';

import {RemindersProvider} from './providers/reminders';
import {notificationHooks} from './services/notifications';
import {Pause} from './components/views/pause';
import {
  DEEP_LINK_DOMAIN,
  DEEP_LINK_PREFIX_IOS,
  DEEP_LINK_PREFIX_ANDROID
} from '@env';

const DEEP_LINK_PREFIX =
  Platform.OS === 'ios' ? DEEP_LINK_PREFIX_IOS : DEEP_LINK_PREFIX_ANDROID;

/*
import {
  VenueCodeScanner,
  CameraPermission,
  ScanResultSuccess,
  ScanResultError,
  VenueHistory,
  RiskyVenueContact
} from './venue-check-in';
*/

enableScreens();

/*try {
  NetInfo.fetch().then((state) => console.log(state));
} catch (err) {
  console.log(err);
}*/

function cacheImages(images: (string | number)[]) {
  return images.map((image) => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const SymptomsStack = () => {
  const app = useApplication();
  const {t} = useTranslation();

  const initialRouteName = app.checks.length
    ? 'symptoms.history'
    : 'symptoms.checker';

  return (
    <Stack.Navigator
      screenOptions={{
        animationEnabled: true
        //   header: props => <NavBar hideSettings={!app.user || !app.user.id} {...props} />
      }}
      initialRouteName={initialRouteName}
      headerMode="none">
      <Stack.Screen
        name="symptoms.history"
        component={SymptomsHistory}
        options={{title: t('viewNames:symptomchecker')}}
      />
      <Stack.Screen
        name="symptoms.checker"
        component={SymptomChecker}
        options={{title: t('viewNames:symptomchecker')}}
      />
    </Stack.Navigator>
  );
};

const MainStack = () => {
  const {t} = useTranslation();
  useRtl();

  return (
    <Tab.Navigator
      initialRouteName="dashboard"
      tabBar={(props: any) => <TabBarBottom {...props} />}>
      <Tab.Screen
        name="dashboard"
        component={Dashboard}
        options={{title: t('viewNames:updates')}}
      />
      <Tab.Screen
        name="vaccineStats"
        component={VaccineStats}
        options={{title: t('viewNames:vaccineStats')}}
      />
      <Tab.Screen
        name="symptoms"
        component={SymptomsStack}
        options={{title: t('viewNames:symptomchecker')}}
      />
      <Tab.Screen
        name="tracing"
        component={ContactTracing}
        options={{title: t('viewNames:contactTracing')}}
      />
    </Tab.Navigator>
  );
};

const RootStack = createStackNavigator();

/*
const VenueCheckInStack = createStackNavigator();

const VenueStack = () => {
  const {t} = useTranslation();
  return (
    <VenueCheckInStack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        cardStyle: {backgroundColor: colors.black},
        gestureEnabled: false,
        gestureDirection: 'horizontal',
        animationEnabled: true,
        header: () => null
      }}
      initialRouteName={'venueCheckIn.scanner'}
      mode="modal"
      headerMode="none">
      <VenueCheckInStack.Screen
        name="venueCheckIn.scanner"
        component={VenueCodeScanner}
        options={{
          title: t('viewNames:venueCheckIn')
        }}
      />
      <VenueCheckInStack.Screen
        name="venueCheckIn.scanSuccess"
        component={ScanResultSuccess}
        options={{title: t('viewNames:venueCheckIn')}}
        initialParams={{isLastCheckinValid: true}}
      />
      <VenueCheckInStack.Screen
        name="venueCheckIn.scanError"
        component={ScanResultError}
        options={{title: t('viewNames:venueCheckIn')}}
      />

      <VenueCheckInStack.Screen
        name="venueCheckIn.permission"
        component={CameraPermission}
        options={{title: t('viewNames:venueCheckIn')}}
      />
    </VenueCheckInStack.Navigator>
  );
};
*/

const AppStack: React.FC<any> = ({route}) => {
  const {t} = useTranslation();
  const {initialScreen} = route.params;
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        cardStyle: {backgroundColor: 'transparent'},
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animationEnabled: true,
        header: (props) => <NavBar {...props} />
      }}
      initialRouteName={initialScreen}
      headerMode="float">
      <Stack.Screen
        name="over16"
        component={Over16}
        options={{
          title: t('viewNames:age'),
          header: () => null,
          cardStyle: {backgroundColor: colors.yellow}
        }}
      />
      <Stack.Screen name="under16" component={Under16} />
      <Stack.Screen
        name="getStarted"
        component={GetStarted}
        options={{
          title: t('viewNames:getStarted'),
          header: () => null,
          cardStyle: {backgroundColor: colors.yellow}
        }}
      />
      <Stack.Screen
        name="yourData"
        component={YourData}
        options={{title: t('yourData:title')}}
      />
      <Stack.Screen
        name="appUsage"
        component={AppUsage}
        options={{title: t('appUsage:title')}}
      />
      <Stack.Screen
        name="contactTracingInformation"
        component={ContactTracingInformation}
        options={{title: t('tabBar:contactTracing')}}
      />
      <Stack.Screen
        name="followUpCall"
        component={FollowUpCall}
        options={{title: t('followUpCall:contactTracing')}}
      />
      <Stack.Screen
        name="main"
        component={MainStack}
        // @ts-ignore
        options={{showSettings: true}}
      />
      <Stack.Screen
        name="casesByCounty"
        component={CountyBreakdown}
        options={{title: t('viewNames:casesByCounty')}}
      />
      <Stack.Screen name="chartByCounty" component={CountyChart} />
      <Stack.Screen
        name="vaccineByCounty"
        component={VaccineByCounty}
        options={{title: t('viewNames:vaccineByCounty')}}
      />
      <Stack.Screen
        name="closeContactInfo"
        component={CloseContactInfo}
        options={{title: t('closeContactInfo:title')}}
      />
      <Stack.Screen
        name="closeContactAlert"
        component={CloseContactAlert}
        options={{title: t('closeContactAlert:title')}}
      />
      <Stack.Screen name="reminder" component={Reminder} />
      <Stack.Screen
        name="uploadKeys"
        component={UploadKeys}
        options={{title: t('viewNames:uploadKeys')}}
      />
      <Stack.Screen
        name="pause"
        component={Pause}
        options={{title: t('pause:title')}}
      />
      <Stack.Screen
        name="settings"
        component={Settings}
        options={{title: t('viewNames:settings')}}
      />
      <Stack.Screen
        name="settings.contactTracing"
        component={ContactTracingSettings}
        options={{title: t('viewNames:settingsContactTracing')}}
      />
      <Stack.Screen
        name="settings.checkIn"
        component={CheckInSettings}
        options={{title: t('viewNames:settingsCheckin')}}
      />
      <Stack.Screen
        name="settings.checkInReminder"
        component={CheckInReminder}
        options={{title: t('viewNames:settingsCheckinReminder')}}
      />
      <Stack.Screen
        name="settings.privacy"
        component={DataProtectionPolicy}
        options={{title: t('viewNames:dataPolicy')}}
      />
      <Stack.Screen
        name="settings.terms"
        component={TermsAndConditions}
        options={{title: t('viewNames:terms')}}
      />
      <Stack.Screen
        name="settings.metrics"
        component={Metrics}
        options={{title: t('viewNames:metrics')}}
      />
      <Stack.Screen
        name="settings.language"
        component={Language}
        options={{title: t('languageSettings:title')}}
      />
      <Stack.Screen
        name="settings.leave"
        component={Leave}
        options={{title: t('viewNames:leave')}}
      />
      <Stack.Screen name="settings.debug" component={Debug} />

      <Stack.Screen name="sorry" component={Sorry} />
      <Stack.Screen
        name="privacy"
        component={DataProtectionPolicy}
        options={{title: t('viewNames:dataPolicy')}}
      />
      <Stack.Screen
        name="terms"
        component={TermsAndConditions}
        options={{title: t('viewNames:terms')}}
      />
      {/*
      <Stack.Screen
        name="settings.venueHistory"
        component={VenueHistory}
        options={{title: t('viewNames:venueHistory')}}
      />
      <Stack.Screen
        name="riskyVenueContact"
        component={RiskyVenueContact}
        options={{title: t('viewNames:riskyVenueContact')}}
      />*/}
    </Stack.Navigator>
  );
};

const linking: LinkingOptions = {
  prefixes: [DEEP_LINK_PREFIX, DEEP_LINK_DOMAIN],
  config: {
    screens: {
      app: {
        screens: {
          uploadKeys: {
            path: '/v' // query string params are passed direct to the route as params
          }
        }
      }
    }
  },
  getStateFromPath: (path: string, config: any) => {
    const state = getStateFromPath(path, config);

    // Look for 'uploadKeys' in the inner stack nested inside rootstack
    const innerRoutes = state?.routes?.length
      ? state.routes[0].state?.routes
      : null;
    const uploadKeysRoute = innerRoutes?.find(
      (route) => route.name === 'uploadKeys'
    );

    if (uploadKeysRoute) {
      return {
        ...state,
        routes: [
          {
            name: 'app', // main is nested inside rootstack
            state: {
              routes: [
                {name: 'main', params: {screen: 'tracing'}},
                uploadKeysRoute
              ]
            }
          }
        ]
      };
    }

    return state;
  }
};

function Navigation({
  notification,
  exposureNotificationClicked,
  setAppState
}: {
  traceConfiguration: TraceConfiguration;
  notification: PN | null;
  exposureNotificationClicked: Boolean | null;
  setAppState: (value: React.SetStateAction<State>) => void;
}) {
  const app = useApplication();
  const {checkExposure, initialised, enabled, status} = useExposure();

  const initialScreen = app.user ? 'main' : 'over16';
  const {initializing} = app;

  useEffect(() => {
    if (
      !initializing &&
      initialised &&
      status.state === StatusState.active &&
      enabled
    ) {
      checkExposure(false);
    }
  }, [initializing, initialised]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    if (navigationRef.current && notification) {
      navigationRef.current.navigate('closeContactAlert');

      setAppState((s) => ({...s, notification: null}));
    }
  }, [app, notification]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    if (navigationRef.current && exposureNotificationClicked) {
      console.log('exposureNotificationClicked', exposureNotificationClicked);
      navigationRef.current.navigate('closeContactAlert');
      setAppState((s) => ({...s, exposureNotificationClicked: null}));
    }
  }, [app, exposureNotificationClicked]);

  return (
    <NavigationContainer
      linking={linking}
      ref={(e) => {
        navigationRef.current = e;
        notificationHooks.navigation = e as NavigationContainerRef;
      }}>
      <Spinner animation="fade" visible={!!app.loading} />
      <RootStack.Navigator
        screenOptions={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          cardStyle: {backgroundColor: 'transparent'},
          gestureEnabled: true,
          gestureDirection: 'horizontal'
        }}
        headerMode="none"
        mode="modal"
        initialRouteName={'app'}>
        <RootStack.Screen
          name="app"
          component={AppStack}
          initialParams={{initialScreen}}
        />
        {/*
        <RootStack.Screen name="venueCheckIn" component={VenueStack} />
        */}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const ExposureApp: React.FC = ({children}) => {
  const {t} = useTranslation();
  const [authToken, setAuthToken] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState<string>('');

  const settings = useSettings();
  const app = useApplication();

  useEffect(() => {
    async function getTokens() {
      try {
        const storedAuthToken = (await SecureStore.getItemAsync('token')) || '';
        const storedRefreshToken =
          (await SecureStore.getItemAsync('refreshToken')) || '';

        if (storedAuthToken !== authToken) {
          setAuthToken(storedAuthToken);
        }
        if (storedRefreshToken !== refreshToken) {
          setRefreshToken(storedRefreshToken);
        }
      } catch (err) {
        console.log('error getting tokens', err);
      }
      //patch to fix completedExposureOnboarding
      const config = await getConfigData();
      if (config.lastExposureIndex > 0 && !app.completedExposureOnboarding) {
        await app.setContext({completedExposureOnboarding: true});
      }
    }

    getTokens();
  }, [app.user]);

  const mobile =
    (app.callBackData && app.callBackData.mobile) ||
    (app.callBackData &&
      `${app.callBackData.code}${app.callBackData.number.replace(
        /^0+/,
        ''
      )}`) ||
    '';

  return (
    <ExposureProvider
      isReady={Boolean(
        app.user?.valid &&
          app.completedExposureOnboarding &&
          authToken &&
          refreshToken
      )}
      traceConfiguration={settings.traceConfiguration}
      serverUrl={urls.api}
      keyServerUrl={urls.api}
      keyServerType={KeyServerType.nearform}
      authToken={authToken}
      refreshToken={refreshToken}
      notificationTitle={t('closeContactNotification:title')}
      notificationDescription={t('closeContactNotification:description')}
      analyticsOptin={app.analyticsConsent}
      callbackNumber={mobile}>
      {children}
    </ExposureProvider>
  );
};

interface State {
  loading: boolean;
  token?: {os: string; token: string};
  notification: PN | null;
  exposureNotificationClicked: Boolean | null;
}

export default function App(props: {
  exposureNotificationClicked: Boolean | null;
}) {
  const [appState, setAppState] = React.useState<State>({
    loading: false,
    notification: null,
    exposureNotificationClicked: props.exposureNotificationClicked
  });

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        const imageAssets = cacheImages([
          require('./assets/images/onboard1/image.png'),
          require('./assets/images/onboard2/image.png'),
          require('./assets/images/onboard3/image.png'),
          require('./assets/images/permissions/bluetooth.png'),
          require('./assets/images/permissions/notifications.png'),
          require('./assets/images/logo/logo.png'),
          require('./assets/images/symptoma/image.png'),
          require('./assets/images/symptomb/image.png'),
          require('./assets/images/symptomc/image.png'),
          require('./assets/images/symptomd/image.png')
        ]);

        const fonts = await Font.loadAsync({
          'lato-black': require('./assets/fonts/lato/Lato-Black.ttf'),
          'lato-bold': require('./assets/fonts/lato/Lato-Bold.ttf'),
          lato: require('./assets/fonts/lato/Lato-Regular.ttf'),
          'lato-thin': require('./assets/fonts/lato/Lato-Thin.ttf')
        });

        await Promise.all([...imageAssets, fonts]);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppState((s) => ({...s, loading: false}));
      }
    }

    loadResourcesAndDataAsync();

    notificationHooks.handleNotification = async function (notification) {
      let requiresHandling = false;
      if (Platform.OS === 'ios') {
        if (
          (notification && notification.userInteraction) ||
          (AppState.currentState === 'active' && notification)
        ) {
          PushNotification.setApplicationIconBadgeNumber(0);
          requiresHandling = true;
          setTimeout(() => {
            notification.finish(
              Platform.OS === 'ios'
                ? PushNotificationIOS.FetchResult.NoData
                : ''
            );
          }, 3000);
        }
      }
      if (requiresHandling) {
        setTimeout(() => setAppState((s) => ({...s, notification})), 500);
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <Base>
        <SettingsProvider>
          <SettingsContext.Consumer>
            {(settingsValue) => {
              if (!settingsValue.loaded) {
                return <Loading />;
              }
              return (
                <ApplicationProvider
                  appConfig={settingsValue.appConfig}
                  user={settingsValue.user}
                  consent={settingsValue.consent}
                  analyticsConsent={settingsValue.analyticsConsent}
                  completedExposureOnboarding={
                    settingsValue.completedExposureOnboarding
                  }
                  dpinDate={settingsValue.dpinDate}
                  tandcDate={settingsValue.tandcDate}>
                  <ExposureApp>
                    <RemindersProvider>
                      <StatusBar barStyle="default" />
                      <Navigation
                        traceConfiguration={settingsValue.traceConfiguration}
                        notification={appState.notification}
                        exposureNotificationClicked={
                          appState.exposureNotificationClicked
                        }
                        setAppState={setAppState}
                      />
                    </RemindersProvider>
                  </ExposureApp>
                </ApplicationProvider>
              );
            }}
          </SettingsContext.Consumer>
        </SettingsProvider>
      </Base>
    </SafeAreaProvider>
  );
}
