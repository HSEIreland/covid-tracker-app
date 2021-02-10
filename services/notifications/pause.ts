import {NotificationSpec} from '.';
import {navigateWhenReady} from './hooks';

export const pauseNotification: NotificationSpec = {
  id: 12345,
  storageKey: 'cit.reminder.pause', // key "cit" not "cti" is in live releases
  titleKey: 'pause:reminder:title',
  messageKey: 'pause:reminder:message',
  options: {
    repeatType: 'hour',
    allowWhileIdle: true
  },
  handler: () =>
    navigateWhenReady((navigation) =>
      navigation.navigate('tracing', {notification: true})
    )
} as const;
