import RNPermissions, {
  NotificationsResponse,
  RESULTS
} from 'react-native-permissions';
import ExposureNotification from 'react-native-exposure-notification-service';

import {PermissionStatus, AppPermissions} from '../types';

type CheckResponse = 'unavailable' | 'denied' | 'blocked' | 'granted';

const Check2Status = {
  [RESULTS.UNAVAILABLE]: PermissionStatus.NotAvailable,
  [RESULTS.DENIED]: PermissionStatus.Unknown,
  [RESULTS.GRANTED]: PermissionStatus.Allowed,
  [RESULTS.BLOCKED]: PermissionStatus.NotAllowed
};

const getPermissions = async (): Promise<AppPermissions> => {
  const perms: [Promise<CheckResponse>, Promise<NotificationsResponse>] = [
    ExposureNotification.isAuthorised(),
    RNPermissions.checkNotifications()
  ];

  try {
    const [exposureResponse, notifsResp] = await Promise.all(perms);
    let notificationsStatus = Check2Status[notifsResp.status];

    return {
      exposure: {
        status: Check2Status[exposureResponse]
      },
      notifications: {
        status: notificationsStatus,
        internal: notifsResp
      }
    };
  } catch (e) {
    console.log('getPermissions error', e);
    return {
      exposure: {status: PermissionStatus.Unknown},
      notifications: {status: PermissionStatus.Unknown}
    };
  }
};

const requestPermissions = async () => {
  try {
    console.log('request:  exposure permissions');
    const exposureResult = await ExposureNotification.authoriseExposure();
    console.log('exposureResult', exposureResult);
  } catch (e) {
    console.log('exposureError', e);
  }

  try {
    console.log('requestNotifications');
    const notificationsResult = await RNPermissions.requestNotifications([
      'alert',
      'badge',
      'sound'
    ]);
    console.log('notificationsResult', notificationsResult);
  } catch (e) {
    console.log('notificationsError', e);
  }
};

export {getPermissions, requestPermissions};
