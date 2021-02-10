import React, {FC} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';

import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';

import {useCheckinReminder} from '../../providers/reminders/checkin-reminder';

import {Card} from '../atoms/card';

import {text} from '../../theme';
import {colors} from '../../constants/colors';

const iconSize = 36;

export const CheckinReminderCard: FC<{}> = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {active, timestamp} = useCheckinReminder();

  const onPress = () => navigation.navigate('settings.checkInReminder');

  return (
    <Card onPress={onPress} padding={{h: 12, v: 18, r: 8}}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Image
            accessibilityIgnoresInvertColors
            width={iconSize}
            height={iconSize}
            source={require('../../assets/images/reminder/reminder.png')}
          />
        </View>
        <View style={styles.flex}>
          <Text style={styles.message}>
            {active && timestamp
              ? t('reminder:card:active', {
                  time: format(timestamp, 'p')
                })
              : t('reminder:card:inactive')}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  flex: {
    flex: 1
  },
  message: {
    ...text.defaultBold,
    color: colors.green
  },
  iconContainer: {
    width: iconSize,
    height: iconSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
    marginLeft: 6
  }
});
