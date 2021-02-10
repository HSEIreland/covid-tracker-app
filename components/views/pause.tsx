import React, {useRef, useState} from 'react';
import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableWithoutFeedback
} from 'react-native';
import {useTranslation} from 'react-i18next';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {addHours, format} from 'date-fns';

import {setAccessibilityFocusRef} from '../../hooks/accessibility';

import {Button} from '../atoms/button';
import {Markdown} from '../atoms/markdown';
import {Spacing} from '../atoms/spacing';
import Layouts from '../../theme/layouts';

import {colors} from '../../constants/colors';
import {text} from '../../theme';
import {usePause} from '../../providers/reminders/pause-reminder';

const getClosestInterval = (interval: number, date = new Date()) => {
  const ms = 1000 * 60 * interval;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
};

const createInterval = (interval: number) => {
  const date = addHours(getClosestInterval(15, new Date()), interval);
  const label = format(date, 'HH:mm');
  return {
    label,
    date
  };
};

export const Pause = ({navigation}: any) => {
  const {t} = useTranslation();
  const {pause} = usePause();
  const [show, setShow] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<Date | null>(null);
  const [selectedIntervalOption, setSelectedIntervalOption] = useState<
    number | null
  >(null);
  const setUpRef = useRef<View>(null);

  return (
    <Layouts.Scrollable safeArea={false} heading={t('pause:title')}>
      <Markdown>{t('pause:introduction')}</Markdown>
      <Spacing s={30} />
      <TouchableWithoutFeedback
        onPress={() => {
          setSelectedIntervalOption(null);
          setShow(true);
        }}>
        <View
          ref={setUpRef}
          accessibilityRole="button"
          accessibilityLabel={`${t('pause:dropdown:label')} ${
            selectedInterval ? format(selectedInterval, 'HH:mm') : ''
          }`}
          accessibilityState={{selected: !!selectedInterval}}>
          <Text style={text.defaultBold}>{t('pause:dropdown:label')}</Text>
          <Spacing s={8} />
          <View
            style={[
              styles.card,
              styles.dropdown,
              selectedInterval ? styles.selected : null
            ]}>
            <Text style={styles.intervalLabel}>
              {selectedInterval
                ? format(selectedInterval, 'HH:mm')
                : t('pause:dropdown:placeholder')}
            </Text>
            <Image
              source={require('../../assets/images/arrow-down/arrow-down.png')}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Spacing s={12} />
      <Text accessible={false} style={text.defaultBold}>
        {t('pause:alternativeTime')}
      </Text>
      <Spacing s={8} />
      <View style={styles.row}>
        <TouchableWithoutFeedback
          accessibilityRole="radio"
          accessibilityLabel={t('pause:intervals:label', {
            hours: 4,
            time: createInterval(4).label
          })}
          accessibilityState={{selected: selectedIntervalOption === 1}}
          onPress={() => {
            setSelectedInterval(null);
            setSelectedIntervalOption(1);
          }}>
          <View
            style={[
              styles.card,
              styles.intervals,
              selectedIntervalOption === 1 ? styles.selected : null
            ]}>
            <Text style={text.defaultBold}>{t('pause:intervals:4:label')}</Text>
            <Text style={text.defaultBold}>{createInterval(4).label}</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          accessibilityRole="radio"
          accessibilityLabel={t('pause:intervals:label', {
            hours: 8,
            time: createInterval(8).label
          })}
          accessibilityState={{selected: selectedIntervalOption === 2}}
          onPress={() => {
            setSelectedInterval(null);
            setSelectedIntervalOption(2);
          }}>
          <View
            style={[
              styles.card,
              styles.intervals,
              selectedIntervalOption === 2 ? styles.selected : null
            ]}>
            <Text style={text.defaultBold}>{t('pause:intervals:8:label')}</Text>
            <Text style={text.defaultBold}>{createInterval(8).label}</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          accessibilityRole="radio"
          accessibilityLabel={t('pause:intervals:label', {
            hours: 12,
            time: createInterval(12).label
          })}
          accessibilityState={{selected: selectedIntervalOption === 3}}
          onPress={() => {
            setSelectedInterval(null);
            setSelectedIntervalOption(3);
          }}>
          <View
            style={[
              styles.card,
              styles.intervals,
              styles.lastInterval,
              selectedIntervalOption === 3 ? styles.selected : null
            ]}>
            <Text style={text.defaultBold}>
              {t('pause:intervals:12:label')}
            </Text>
            <Text style={[text.defaultBold, styles.lightGray]}>
              {createInterval(12).label}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <Spacing s={30} />
      <Button
        disabled={!selectedIntervalOption && !selectedInterval}
        onPress={() => {
          if (selectedInterval) {
            pause(selectedInterval);
          } else if (selectedIntervalOption) {
            pause(createInterval(selectedIntervalOption * 4).date);
          }
          navigation.reset({
            index: 0,
            routes: [{name: 'main', params: {screen: 'tracing'}}]
          });
        }}>
        {t('pause:button:label')}
      </Button>
      <Spacing s={30} />
      <DateTimePickerModal
        isVisible={show}
        mode="time"
        date={selectedInterval || getClosestInterval(15)}
        onConfirm={(e) => {
          setShow(false);
          setSelectedInterval(e);
          setAccessibilityFocusRef(setUpRef);
        }}
        onCancel={() => {
          setShow(false);
          setAccessibilityFocusRef(setUpRef);
        }}
        headerTextIOS={t('pause:modalHeader')}
      />
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row'
  },
  card: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    borderColor: colors.darkGray,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4
  },
  dropdown: {
    flexDirection: 'row',
    maxWidth: 120,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  intervalLabel: {
    ...text.defaultBold,
    flex: 1
  },
  intervals: {
    flex: 1,
    marginRight: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  lastInterval: {
    marginRight: 0
  },
  lightGray: {
    color: colors.lighterText
  },
  selected: {
    backgroundColor: '#E6EBEC',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.teal
  }
});
