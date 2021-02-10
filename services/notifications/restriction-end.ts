import {NotificationSpec} from '.';
import {navigateWhenReady} from './hooks';

export const restrictionEndNotification: NotificationSpec = {
  id: 7510,
  storageKey: 'cti.restriction-end',
  titleKey: 'restrictionEnd:notification:title',
  messageKey: 'restrictionEnd:notification:description',
  options: {
    allowWhileIdle: true
  },
  handler: () =>
    navigateWhenReady((navigation) =>
      navigation.reset({
        index: 1,
        routes: [
          {name: 'main', params: {screen: 'tracing'}},
          {name: 'reminder', params: {key: 'restrictionEnd'}}
        ]
      })
    )
} as const;
