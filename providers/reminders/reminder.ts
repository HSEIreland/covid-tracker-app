import {useReducer, Reducer, useEffect, useCallback} from 'react';
import PushNotification from 'react-native-push-notification';
import {TFunction} from 'i18next';
import {
  add,
  format,
  getHours,
  getMinutes,
  getSeconds,
  getTime,
  isFuture,
  isToday,
  parse,
  startOfDay
} from 'date-fns';
import AsyncStorage from '@react-native-community/async-storage';
import {useTranslation} from 'react-i18next';
import {NotificationSpec} from '../../services/notifications';

export interface ReminderOptions {
  defaultTime?: string;
  onDelete?: () => void;
  onSet?: () => void;
  onUnset?: () => void;
}

export interface StoredReminderState {
  timestamp: number | null;
  active: boolean;
}

export interface ReminderState extends StoredReminderState {
  options: ReminderOptions;
  checked: boolean;
  notificationSpec: NotificationSpec | null;
}

export const initialReminderState: ReminderState = {
  timestamp: null,
  active: false,
  checked: false,
  notificationSpec: null,
  options: {}
};

interface ReminderAction {
  type: 'set' | 'unset' | 'delete' | 'translate' | 'load' | 'skip';
  timestamp?: number;
  active?: boolean;
  t?: TFunction;
  interpolation?: Record<string, string>; // For replacing placeholders in t()
}

export const getValidTimestamp = (time: Date | number | null) =>
  (time && isFuture(time) && getTime(time)) || null;

export const getDefaultTime = (defaultTime = '12:00') =>
  getTime(parse(defaultTime, 'HH:mm', new Date()));

export const applyTimeToDay = (time: Date, day: Date): Date =>
  add(startOfDay(day), {
    hours: getHours(time),
    minutes: getMinutes(time),
    seconds: getSeconds(time)
  });

const getNextTime = (timestamp: number): Date => {
  const date = new Date(timestamp);
  if (isFuture(date)) {
    return date;
  }

  const timeToday = applyTimeToDay(date, new Date());

  const nextDate = add(timeToday, {days: 1});
  return nextDate;
};

const getStorableState = (state: ReminderState) => {
  const {active, timestamp} = state;
  const storableProperties = {
    active,
    timestamp
  } as StoredReminderState;
  return JSON.stringify(storableProperties);
};

const reminderReducer: Reducer<ReminderState, ReminderAction> = (
  oldReminderState,
  {type, timestamp, t, active, interpolation}
) => {
  switch (type) {
    case 'set':
      return setReminder(t as TFunction, oldReminderState, {
        timestamp,
        interpolation
      });

    case 'unset':
      return unsetReminder(oldReminderState);

    case 'delete':
      return deleteReminder(oldReminderState);

    case 'translate': {
      if (oldReminderState.active) {
        console.log('Translating active reminder text');
        setReminder(t as TFunction, oldReminderState, {interpolation});
      }
      return oldReminderState;
    }

    case 'load': {
      if (active) {
        setReminder(
          t as TFunction,
          {...oldReminderState, active},
          {timestamp, interpolation}
        );
      }
      return {
        ...oldReminderState,
        checked: true,
        active: !!active,
        timestamp: timestamp || null
      };
    }

    case 'skip': {
      // Push the reminder back one day
      const reminderDate = oldReminderState.timestamp
        ? startOfDay(oldReminderState.timestamp)
        : null;

      if (
        oldReminderState.active &&
        oldReminderState.timestamp &&
        reminderDate &&
        !isFuture(reminderDate)
      ) {
        const todayOrTommorrow = getNextTime(oldReminderState.timestamp);
        const tommorrowTimestamp =
          todayOrTommorrow && isToday(todayOrTommorrow)
            ? getTime(add(new Date(todayOrTommorrow), {days: 1}))
            : getTime(todayOrTommorrow);

        return setReminder(t as TFunction, oldReminderState, {
          timestamp: tommorrowTimestamp,
          interpolation
        });
      }
      return oldReminderState;
    }
  }
};

const cancelReminder = (oldReminderState: ReminderState) => {
  if (oldReminderState.notificationSpec?.id) {
    PushNotification.cancelLocalNotifications({
      id: String(oldReminderState.notificationSpec.id)
    });
  }
};

const unsetReminder = (oldReminderState: ReminderState): ReminderState => {
  cancelReminder(oldReminderState);

  const newState = {
    ...oldReminderState,
    active: false,
    timestamp: oldReminderState.timestamp || initialReminderState.timestamp,
    checked: true
  };

  const reminderStorageKey = oldReminderState.notificationSpec?.storageKey;

  if (reminderStorageKey) {
    AsyncStorage.setItem(reminderStorageKey, getStorableState(newState));
  }

  if (oldReminderState.options.onUnset) {
    oldReminderState.options.onUnset();
  }

  return newState;
};

const deleteReminder = (oldReminderState: ReminderState) => {
  const {notificationSpec, options} = oldReminderState;
  cancelReminder(oldReminderState);
  if (oldReminderState.notificationSpec?.storageKey) {
    AsyncStorage.removeItem(oldReminderState.notificationSpec?.storageKey);
  }

  if (oldReminderState.options.onDelete) {
    oldReminderState.options.onDelete();
  }

  return {
    ...initialReminderState,
    notificationSpec,
    options
  };
};

const setReminder = (
  t: TFunction,
  oldReminderState: ReminderState,
  {
    timestamp,
    interpolation
  }: {
    timestamp?: number;
    interpolation?: Record<string, string>;
  }
) => {
  const {
    active,
    notificationSpec,
    timestamp: oldTimestamp,
    options
  } = oldReminderState;

  if (active) {
    cancelReminder(oldReminderState);
  }
  if (!notificationSpec) {
    return oldReminderState;
  }

  const {titleKey = '', messageKey = ''} = notificationSpec || {};
  const title = t(titleKey, interpolation);
  const message = t(messageKey, interpolation);

  const date = getNextTime(
    timestamp || oldTimestamp || getDefaultTime(options.defaultTime)
  );
  const newTimestamp = getTime(date);

  PushNotification.localNotificationSchedule({
    id: notificationSpec.id,
    title,
    message,
    date,
    ...(notificationSpec.options || {})
  });

  console.log(
    `Set reminder ${notificationSpec.id} for ${format(
      date,
      'HH:mm dd/MMM/yyyy'
    )} (time now is ${format(new Date(), 'HH:mm dd/MMM/yyyy')})`
  );

  const newState = {
    ...oldReminderState,
    active: true,
    timestamp: newTimestamp
  };

  if (notificationSpec.storageKey) {
    AsyncStorage.setItem(
      notificationSpec.storageKey,
      getStorableState(newState)
    );
  }

  if (options.onSet) {
    options.onSet();
  }

  return newState;
};

export const useReminder = (
  notificationSpec: NotificationSpec,
  options: ReminderOptions = {}
) => {
  const [reminderState, dispatchReminder] = useReducer(reminderReducer, {
    ...initialReminderState,
    options,
    notificationSpec
  });

  const {t} = useTranslation();
  const reminderStorageKey = notificationSpec.storageKey;

  const loadReminder = useCallback((tFn) => {
    if (!reminderStorageKey) {
      return;
    }
    AsyncStorage.getItem(reminderStorageKey).then((storedString) => {
      let newActive;
      let newTimestamp;

      try {
        if (storedString) {
          const {active: activeStr, timestamp: timestampStr} = JSON.parse(
            storedString
          );
          newActive = activeStr === true || activeStr === 'true';
          newTimestamp = Number(timestampStr);
        }
      } catch (err) {
        console.log(
          `Error loading and parsing reminder ${reminderStorageKey}`,
          err
        );
      } finally {
        dispatchReminder({
          type: 'load',
          t: tFn,
          active: newActive,
          timestamp: newTimestamp
        });
      }
    });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */ // Run only once, on app load
  }, []);

  useEffect(() => {
    if (!reminderState.checked) {
      loadReminder(t);
    }
  }, [reminderState.checked, loadReminder, t]);

  useEffect(() => {
    dispatchReminder({type: 'translate', t});
  }, [t]);

  return {reminderState, dispatchReminder};
};
