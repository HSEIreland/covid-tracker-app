import {NotificationSpec} from '.';
import {navigateWhenReady} from './hooks';

export const exposureReminderNotification: NotificationSpec = {
  id: 7500,
  storageKey: 'cti.exposure-reminder',
  titleKey: 'exposureReminder:notification:title',
  messageKey: 'exposureReminder:notification:description',
  options: {
    allowWhileIdle: true
  },
  handler: () =>
    navigateWhenReady((navigation) =>
      navigation.reset({
        index: 1,
        routes: [
          {name: 'main', params: {screen: 'tracing'}},
          {name: 'reminder', params: {key: 'exposureReminder'}}
        ]
      })
    )
} as const;
