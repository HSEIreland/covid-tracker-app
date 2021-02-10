import {PushNotification as PushNotificationType} from 'react-native-push-notification';
import {NavigationContainerRef} from '@react-navigation/native';

// According to docs, PushNotification.configure() is unstable if called inside any component
// but we can hook in app state etc from components via a mutable object
export const notificationHooks: NotificationHooks = {};

interface Token {
  os: string;
  token: string;
}

export interface NotificationHooks {
  handleNotification?: (notification: PushNotificationType) => void;
  handleRegister?: (token: Token) => void;
  handleAction?: (notification: PushNotificationType) => void;
  navigation?: NavigationContainerRef;
}

const MAX_ATTEMPTS = 50;
const ATTEMPTS_DELAY = 200;

export const navigateWhenReady = (
  action: (navigation: NavigationContainerRef) => void,
  attempts: number = 0
) => {
  if (notificationHooks?.navigation?.getRootState()) {
    action(notificationHooks.navigation);
  } else if (attempts < MAX_ATTEMPTS) {
    // If app was closed, need to wait for navigation to become available
    const retry = () => navigateWhenReady(action, attempts + 1);
    setTimeout(retry, ATTEMPTS_DELAY);
  }
};
