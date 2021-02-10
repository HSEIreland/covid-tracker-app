import {NotificationSpec} from '.';
import {navigateWhenReady} from './hooks';

export const riskyVenueNotification: NotificationSpec = {
  id: 11223344,
  titleKey: 'venueCheckIn:notification:title',
  messageKey: 'venueCheckIn:notification:message',
  handler: () =>
    navigateWhenReady((navigation) => navigation.navigate('riskyVenueContact'))
} as const;
