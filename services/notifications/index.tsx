import PushNotification, {
  PushNotification as PushNotificationType,
  PushNotificationScheduleObject
} from 'react-native-push-notification';
import {notificationHooks} from './hooks';

// import {riskyVenueNotification} from './riskyVenue';
import {checkinNotification} from './checkin';
import {pauseNotification} from './pause';
import {exposureReminderNotification} from './exposure-reminder';
import {restrictionEndNotification} from './restriction-end';
import {caseReminderNotification} from './case-reminder';

interface Token {
  os: string;
  token: string;
}

interface NotificationOptions extends PushNotificationScheduleObject {
  // Missing in library typing
  allowWhileIdle?: boolean;
}

export interface NotificationSpec {
  id: number;
  storageKey?: string;
  onLoadStorage?: (value: string, context?: any) => void;
  titleKey: string;
  messageKey: string;
  handler: () => void;
  options?: Partial<NotificationOptions>;
}

const notificationTypes = [
  pauseNotification,
  checkinNotification,
  exposureReminderNotification,
  restrictionEndNotification,
  caseReminderNotification
  //  riskyVenueNotification
];

const getId = (notification: PushNotificationType): string => {
  // @ts-ignore
  return notification.id || notification.data.id;
};

PushNotification.configure({
  onNotification: (notification: PushNotificationType) => {
    console.log(`Responding to notification ${getId(notification)}`);
    const notificationType = notificationTypes.find(
      ({id}) => String(id) === getId(notification)
    );

    if (notificationType?.handler) {
      notificationType?.handler();
    } else if (notificationHooks.handleNotification) {
      notificationHooks.handleNotification(notification);
    }
  },
  onRegister: (token: Token) => {
    if (notificationHooks.handleRegister) {
      notificationHooks.handleRegister(token);
    }
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true
  },
  popInitialNotification: true,
  requestPermissions: false
});

export {notificationHooks};
