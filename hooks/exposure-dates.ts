import {useEffect, useMemo} from 'react';
import {add, format, set, max, min} from 'date-fns';
import {useExposure} from 'react-native-exposure-notification-service';

import {ReminderKey, ReminderOption, useSettings} from '../providers/settings';
import {useApplication} from '../providers/context';
import {useTranslation} from 'react-i18next';
import {getDateLocaleOptions} from '../services/i18n/date';

const parseTime = (timeStr: string) => timeStr.split(':').map((t) => Number(t));

type ExposureDateKey = ReminderKey | 'alert' | 'exposure' | 'upload';

const getDate = (
  time?: number | Date | null,
  {earliest, latest, at, ...addDuration}: ReminderOption = {}
): Date | null => {
  if (!time) {
    return null;
  }

  let newDate = add(new Date(time), addDuration);

  if (at) {
    const [hours, minutes] = parseTime(at);
    return set(newDate, {hours, minutes});
  }
  if (earliest) {
    const [hours, minutes] = parseTime(earliest);
    const earliestDate = set(newDate, {hours, minutes});
    newDate = max([earliestDate, newDate]);
  }
  if (latest) {
    const [hours, minutes] = parseTime(latest);
    const latestDate = set(newDate, {hours, minutes});
    newDate = min([latestDate, newDate]);
  }

  return newDate;
};

export function useExposureDates() {
  const {i18n} = useTranslation();
  const dateLocale = getDateLocaleOptions(i18n);

  const {contacts, initialised} = useExposure();
  const {
    appConfig: {dateFormat, durations},
    loaded
  } = useSettings();
  const {uploadDate, initializing} = useApplication();

  const latestContact = contacts?.length && contacts[0];

  const {exposureAlertDate, exposureDate} = latestContact || {};

  const ready = loaded && initialised && !initializing;

  const exposureDates = useMemo(() => {
    const dates: Record<ExposureDateKey, Date | null> = {
      alert: getDate(exposureAlertDate),
      exposure: getDate(exposureDate),
      upload: getDate(uploadDate),
      restrictionEnd: getDate(exposureDate, durations.restrictionEnd),
      exposureReminder: getDate(exposureAlertDate, durations.exposureReminder),
      caseReminder: getDate(uploadDate, durations.caseReminder)
    };

    const formatted = Object.entries(dates).reduce(
      (items, [key, date]) => ({
        ...items,
        [key]: date ? format(date, dateFormat, dateLocale) : ''
      }),
      {} as Record<ExposureDateKey, string>
    );

    return {dates, formatted, ready};
  }, [
    exposureAlertDate,
    exposureDate,
    uploadDate,
    dateFormat,
    durations,
    dateLocale,
    ready
  ]);

  return exposureDates;
}
