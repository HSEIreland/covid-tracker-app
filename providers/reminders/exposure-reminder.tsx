import React, {FC, createContext, useMemo, useContext, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {exposureReminderNotification} from '../../services/notifications/exposure-reminder';
import {restrictionEndNotification} from '../../services/notifications/restriction-end';
import {
  initialReminderState,
  ReminderState,
  useReminder,
  getValidTimestamp
} from './reminder';
import {useExposureDates} from '../../hooks/exposure-dates';
import {useApplication} from '../context';
import {useExposure} from 'react-native-exposure-notification-service';

export interface ExposureReminderValue {
  exposureReminderState: ReminderState;
  restrictionEndState: ReminderState;
  clearExposureReminders: () => void;
  disableExposureReminders: () => void;
}

const initialExposureReminderValue: ExposureReminderValue = {
  exposureReminderState: {...initialReminderState},
  restrictionEndState: {...initialReminderState},
  clearExposureReminders: () => {},
  disableExposureReminders: () => {}
};

const ExposureReminderContext = createContext(initialExposureReminderValue);

// Handles reminder notifications set and cleared by exposure changes
export const ExposureReminderProvider: FC<{}> = ({children}) => {
  const {t} = useTranslation();
  const {
    formatted,
    dates: {
      exposureReminder: exposureReminderDate,
      restrictionEnd: restrictionEndDate
    }
  } = useExposureDates();

  const {
    reminderState: exposureReminderState,
    dispatchReminder: dispatchExposureReminder
  } = useReminder(exposureReminderNotification);
  const {
    reminderState: restrictionEndState,
    dispatchReminder: dispatchRestrictionEnd
  } = useReminder(restrictionEndNotification);

  const {initializing} = useApplication();
  const {initialised} = useExposure();
  const isReady = !initializing && initialised;

  const expectedReminderTime = getValidTimestamp(exposureReminderDate);
  const expectedRestrictionEnd = getValidTimestamp(restrictionEndDate);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (expectedReminderTime !== exposureReminderState.timestamp) {
      dispatchExposureReminder(
        expectedReminderTime
          ? {
              type: 'set',
              timestamp: expectedReminderTime,
              t,
              interpolation: formatted
            }
          : {type: 'delete'}
      );
    }

    if (expectedRestrictionEnd !== restrictionEndState.timestamp) {
      dispatchRestrictionEnd(
        expectedRestrictionEnd
          ? {
              type: 'set',
              timestamp: expectedRestrictionEnd,
              t,
              interpolation: formatted
            }
          : {type: 'delete'}
      );
    }
  }, [
    isReady,
    expectedReminderTime,
    t,
    formatted,
    exposureReminderState.timestamp,
    dispatchExposureReminder,
    expectedRestrictionEnd,
    restrictionEndState.timestamp,
    dispatchRestrictionEnd
  ]);

  const exposureContextValue = useMemo(
    () =>
      ({
        exposureReminderState,
        restrictionEndState,
        clearExposureReminders: () => {
          dispatchExposureReminder({type: 'delete'});
          dispatchRestrictionEnd({type: 'delete'});
        },
        disableExposureReminders: () => {
          dispatchExposureReminder({type: 'unset'});
          dispatchRestrictionEnd({type: 'unset'});
        }
      } as ExposureReminderValue),
    [
      exposureReminderState,
      restrictionEndState,
      dispatchExposureReminder,
      dispatchRestrictionEnd
    ]
  );

  return (
    <ExposureReminderContext.Provider value={exposureContextValue}>
      {children}
    </ExposureReminderContext.Provider>
  );
};

export const useExposureReminder = () => useContext(ExposureReminderContext);
