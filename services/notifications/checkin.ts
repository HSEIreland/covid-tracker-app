import {NotificationSpec} from '.';
import {navigateWhenReady} from './hooks';

export const checkinNotification: NotificationSpec = {
  id: 54321,
  storageKey: 'cti.reminder.checkin',
  titleKey: 'reminder:notification:title',
  messageKey: 'reminder:notification:message',
  options: {
    repeatType: 'day',
    allowWhileIdle: true
  },
  handler: () =>
    navigateWhenReady((navigation) =>
      navigation.navigate('symptoms', {
        screen: 'symptoms.checker'
      })
    )
} as const;
