import React, {FC, createContext, useMemo, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {
  useExposure,
  StatusState
} from 'react-native-exposure-notification-service';
import {pauseNotification} from '../../services/notifications/pause';
import {ReminderState, useReminder} from './reminder';

export interface PauseValue {
  paused: boolean;
  timestamp?: ReminderState['timestamp'];
  checked: boolean;
  pause: (date: Date) => Promise<void>;
  unpause: () => Promise<void>;
  clear: () => void;
}

const initialPauseValue: PauseValue = {
  paused: false,
  checked: false,
  pause: async () => {},
  unpause: async () => {},
  clear: () => {}
};

const PauseContext = createContext(initialPauseValue);

export const PauseProvider: FC<{}> = ({children}) => {
  const {t} = useTranslation();
  const exposure = useExposure();
  const {reminderState, dispatchReminder} = useReminder(pauseNotification);

  const pauseValue = useMemo(
    () =>
      ({
        paused:
          reminderState.active && exposure.status.state !== StatusState.active,
        timestamp: reminderState.timestamp,
        checked: reminderState.checked,
        pause: async (date: Date) => {
          const timestamp = date.getTime();
          dispatchReminder({type: 'set', t, timestamp});
          await exposure.pause();
        },
        unpause: async () => {
          dispatchReminder({type: 'delete'});
          await exposure.start();
        },
        clear: () => {
          dispatchReminder({type: 'delete'});
        }
      } as PauseValue),
    // No `exposure` in deps array: don't re-render listeners every time exposure changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reminderState, dispatchReminder, t, exposure.status.state]
  );

  return (
    <PauseContext.Provider value={pauseValue}>{children}</PauseContext.Provider>
  );
};

export const usePause = () => useContext(PauseContext);
