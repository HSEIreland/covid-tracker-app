import React, {useState} from 'react';
import {
  Text,
  Switch,
  View,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useTranslation} from 'react-i18next';
import {TFunction} from 'i18next';
import {
  getTime,
  format,
  startOfTomorrow,
  startOfToday,
  isTomorrow
} from 'date-fns';

import {useApplication} from '../../../providers/context';
import {
  getDefaultTime,
  applyTimeToDay
} from '../../../providers/reminders/reminder';
import {
  setAccessibilityFocusRef,
  useFocusRef
} from '../../../hooks/accessibility';
import {useCheckinReminder} from '../../../providers/reminders/checkin-reminder';

import {Button} from '../../atoms/button';
import {Card} from '../../atoms/card';
import {Separator} from '../../atoms/layout';
import {Toast} from '../../atoms/toast';
import {Scrollable} from '../../../theme/layouts/scrollable';

import {text} from '../../../theme';
import {colors} from '../../../constants/colors';

function getToastMessage(timestamp: number, t: TFunction) {
  const reminderIsTomorrow = isTomorrow(timestamp);
  return t(
    reminderIsTomorrow ? 'reminder:toast:tomorrow' : 'reminder:toast:today',
    {
      time: format(timestamp, 'p')
    }
  );
}

export const CheckInReminder = () => {
  const {t} = useTranslation();
  const {
    active,
    timestamp,
    setReminder,
    toggleReminder,
    doneCheckIn
  } = useCheckinReminder();
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastRef, setUpRef] = useFocusRef({
    accessibilityFocus: false,
    count: 2,
    timeout: 1000
  });

  const {isCheckerCompleted} = useApplication();

  const handleToggleReminder = (wasEnabled: boolean = false) => {
    toggleReminder(wasEnabled);
    if (!wasEnabled && isCheckerCompleted()) {
      doneCheckIn();
    }
    setShowToast(!wasEnabled);
  };

  const handleChange = (date: Date) => {
    setShowPicker(false);

    const newTimestamp = getTime(
      applyTimeToDay(
        date,
        isCheckerCompleted() ? startOfTomorrow() : startOfToday()
      )
    );
    setReminder(newTimestamp);
    setShowToast(true);
  };

  const handleCancel = () => {
    setShowPicker(false);
    setAccessibilityFocusRef(setUpRef);
  };

  const toast = showToast && timestamp && (
    <Toast
      ref={toastRef}
      color={colors.toastGreen}
      message={getToastMessage(timestamp, t)}
      icon={require('../../../assets/images/success/green.png')}
    />
  );

  const timeLabel = t('reminder:time');
  const time = timestamp ? format(timestamp, 'p') : '';
  const timeAccessibilityLabel = `${timeLabel} ${time}`;

  return (
    <Scrollable toast={toast} heading={t('reminder:title')}>
      <Card>
        <View style={styles.row}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.label}>
            <TouchableWithoutFeedback
              onPress={() => handleToggleReminder(active)}>
              <Text style={styles.label}>{t('reminder:switch')}</Text>
            </TouchableWithoutFeedback>
          </View>
          <Switch
            accessibilityRole="switch"
            accessibilityLabel={t('reminder:switch')}
            trackColor={{
              false: colors.darkGray,
              true: colors.teal
            }}
            thumbColor={colors.white}
            onValueChange={() => handleToggleReminder(active)}
            value={active}
            style={styles.switch}
          />
        </View>
        {active && (
          <>
            <Separator m={20} />
            <TouchableWithoutFeedback onPress={() => setShowPicker(true)}>
              <View
                style={styles.row}
                ref={setUpRef}
                accessibilityRole="button"
                accessibilityLabel={timeAccessibilityLabel}>
                <Text style={styles.label}>{timeLabel}</Text>
                <Button onPress={() => setShowPicker(true)} type="empty">
                  {time || '-'}
                </Button>
              </View>
            </TouchableWithoutFeedback>
            <DateTimePickerModal
              isVisible={showPicker}
              mode="time"
              date={new Date(timestamp || getDefaultTime())}
              onConfirm={handleChange}
              onCancel={handleCancel}
              headerTextIOS={t('reminder:modalHeader')}
            />
          </>
        )}
      </Card>
    </Scrollable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  button: {
    margin: 8,
    flexGrow: 1
  },
  label: {
    ...text.largeBold,
    flex: 1
  },
  switch: {
    marginLeft: 16,
    alignSelf: 'center'
  }
});
