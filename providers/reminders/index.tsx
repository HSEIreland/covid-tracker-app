import React, {FC} from 'react';
import {CaseReminderProvider} from './case-reminder';
import {CheckinReminderProvider} from './checkin-reminder';
import {ExposureReminderProvider} from './exposure-reminder';
import {PauseProvider} from './pause-reminder';

export const RemindersProvider: FC = ({children}) => (
  <ExposureReminderProvider>
    <CaseReminderProvider>
      <CheckinReminderProvider>
        <PauseProvider>{children}</PauseProvider>
      </CheckinReminderProvider>
    </CaseReminderProvider>
  </ExposureReminderProvider>
);
