import React, {FC} from 'react';
import {StyleSheet, View, ViewStyle, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';

import {text} from '../../theme';
import {getDateLocaleOptions} from '../../services/i18n/date';

interface StatsSourceProps {
  style?: ViewStyle;
  lastUpdated: {
    stats: Date;
    profile: Date;
  };
}

export const StatsSource: FC<StatsSourceProps> = ({style, lastUpdated}) => {
  const {i18n, t} = useTranslation();
  const dateLocale = getDateLocaleOptions(i18n);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{t('statsSource:monitor')}</Text>
      <Text style={styles.text}>
        {t('statsSource:lastUpdatedStats')}&nbsp;
        {format(lastUpdated.stats, 'dd/MM/yyyy', dateLocale)}
      </Text>
      <Text style={styles.text}>
        {t('statsSource:lastUpdatedProfile')}&nbsp;
        {format(lastUpdated.profile, 'dd/MM/yyyy', dateLocale)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  text: {
    ...text.xsmallBold,
    textAlign: 'center',
    paddingBottom: 6,
    lineHeight: 14
  }
});
