import React, {FC, createContext, useMemo, useContext, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useExposure} from 'react-native-exposure-notification-service';

import {caseReminderNotification} from '../../services/notifications/case-reminder';
import {
  getValidTimestamp,
  initialReminderState,
  ReminderState,
  useReminder
} from './reminder';
import {useExposureDates} from '../../hooks/exposure-dates';
import {useExposureReminder} from './exposure-reminder';
import {useApplication} from '../context';

export interface CaseReminderValue {
  caseReminderState: ReminderState;
  clearCaseReminders: () => void;
}

const initialCaseReminderValue: CaseReminderValue = {
  caseReminderState: {...initialReminderState},
  clearCaseReminders: () => {}
};

const CaseReminderContext = createContext(initialCaseReminderValue);

// Handles reminder notifications set by successfully uploading diagnosis keys
export const CaseReminderProvider: FC<{}> = ({children}) => {
  const {t} = useTranslation();
  const {disableExposureReminders} = useExposureReminder();

  const {
    formatted,
    dates: {caseReminder: caseReminderDate}
  } = useExposureDates();

  const {
    reminderState: caseReminderState,
    dispatchReminder: dispatchCaseReminder
  } = useReminder(caseReminderNotification);

  const {initializing} = useApplication();
  const {initialised} = useExposure();
  const isReady = !initializing && initialised;

  const expectedReminderTime = getValidTimestamp(caseReminderDate);

  useEffect(() => {
    if (!isReady || expectedReminderTime === caseReminderState.timestamp) {
      return;
    }
    if (!expectedReminderTime) {
      dispatchCaseReminder({type: 'delete'});
      return;
    }

    dispatchCaseReminder({
      type: 'set',
      timestamp: expectedReminderTime,
      t,
      interpolation: formatted
    });
    disableExposureReminders();
  }, [
    isReady,
    expectedReminderTime,
    t,
    formatted,
    caseReminderState.timestamp,
    dispatchCaseReminder,
    disableExposureReminders
  ]);

  const exposureContextValue = useMemo(
    () =>
      ({
        caseReminderState,
        clearCaseReminders: () => {
          dispatchCaseReminder({type: 'delete'});
        }
      } as CaseReminderValue),
    [caseReminderState, dispatchCaseReminder]
  );

  return (
    <CaseReminderContext.Provider value={exposureContextValue}>
      {children}
    </CaseReminderContext.Provider>
  );
};

export const useCaseReminder = () => useContext(CaseReminderContext);
