import React, {FC, createContext, useMemo, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {checkinNotification} from '../../services/notifications/checkin';
import {initialReminderState, ReminderState, useReminder} from './reminder';

export interface CheckinReminderValue extends ReminderState {
  setReminder: (timestamp?: number) => void;
  deleteReminder: () => void;
  toggleReminder: (enabled?: boolean) => void;
  doneCheckIn: () => void;
}

const initialCheckinReminderValue: CheckinReminderValue = {
  ...initialReminderState,
  setReminder: () => {},
  toggleReminder: () => {},
  deleteReminder: () => {},
  doneCheckIn: () => {}
};

const CheckinReminderContext = createContext(initialCheckinReminderValue);

export const CheckinReminderProvider: FC<{}> = ({children}) => {
  const {t} = useTranslation();
  const {reminderState, dispatchReminder} = useReminder(checkinNotification);

  const checkinContextValue = useMemo(
    () =>
      ({
        ...reminderState,
        deleteReminder: () => dispatchReminder({type: 'delete'}),
        doneCheckIn: () => dispatchReminder({type: 'skip', t}),
        setReminder: (timestamp) =>
          dispatchReminder({type: 'set', t, timestamp}),
        toggleReminder: (active) =>
          dispatchReminder({type: active ? 'unset' : 'set', t})
      } as CheckinReminderValue),
    [reminderState, dispatchReminder, t]
  );

  return (
    <CheckinReminderContext.Provider value={checkinContextValue}>
      {children}
    </CheckinReminderContext.Provider>
  );
};

export const useCheckinReminder = () => useContext(CheckinReminderContext);
