import {useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {useTranslation} from 'react-i18next';
import {I18nManager} from 'react-native';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import RNRestarter from 'react-native-restart';

const languagesReset = {
  index: 1,
  routes: [
    {name: 'main', params: {screen: 'settings'}},
    {name: 'settings.language'}
  ]
};

interface RestartStatus {
  routeName: string;
  isRestarting: boolean;
}

export const useRtl = () => {
  const {i18n} = useTranslation();
  const routes = useNavigationState((state) => state.routes);
  const routeName = routes.length ? routes[routes.length - 1].name : '';

  const navigation = useNavigation();
  const screenRef = useRef<RestartStatus>({routeName, isRestarting: false});

  const langIsRtl = i18n.dir() === 'rtl';
  const appIsRtl = I18nManager.isRTL;

  // Keep the route name fresh in the useEffect, but don't re-run useEffect when it changes
  screenRef.current.routeName = routeName;
  useEffect(() => {
    if (langIsRtl !== appIsRtl && !screenRef.current.isRestarting) {
      screenRef.current.isRestarting = true;

      I18nManager.allowRTL(langIsRtl);
      I18nManager.forceRTL(langIsRtl);
      AsyncStorage.setItem(
        'cti.restartScreen',
        screenRef.current.routeName
      ).then(() => RNRestarter.Restart());
    }
  }, [langIsRtl, appIsRtl]);

  useEffect(() => {
    // After forced restart, return to language settings if that's where we were
    AsyncStorage.getItem('cti.restartScreen').then((screenName) => {
      if (screenName) {
        AsyncStorage.setItem('cti.restartScreen', '').then(() => {
          if (screenName === 'settings.language') {
            navigation.reset(languagesReset);
          }
        });
      }
    });
    // Only run on app start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
