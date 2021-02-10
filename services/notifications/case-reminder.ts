import {NotificationSpec} from '.';
import {navigateWhenReady} from './hooks';

export const caseReminderNotification: NotificationSpec = {
  id: 7600,
  storageKey: 'cti.case-reminder',
  titleKey: 'caseReminder:notification:title',
  messageKey: 'caseReminder:notification:description',
  options: {
    allowWhileIdle: true
  },
  handler: () =>
    navigateWhenReady((navigation) =>
      navigation.reset({
        index: 1,
        routes: [
          {name: 'main', params: {screen: 'tracing'}},
          {name: 'reminder', params: {key: 'caseReminder'}}
        ]
      })
    )
} as const;
