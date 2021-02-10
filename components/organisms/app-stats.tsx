import React, {FC} from 'react';
import {StyleSheet, View, Image, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Card} from '../atoms/card';

import {text} from '../../theme';
import {colors} from '../../constants/colors';
import {alignWithLanguage} from '../../services/i18n/common';

interface AppStatsProps {
  appUsers: number;
  dailyCheckIns: number;
}

export const AppStats: FC<AppStatsProps> = ({dailyCheckIns}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.row} accessible accessibilityRole="text">
          <View style={[styles.checkInsIcon, styles.checkInsIconBackground]}>
            <Image
              accessibilityIgnoresInvertColors
              style={styles.checkInsIconSize}
              {...styles.checkInsIconSize}
              source={require('../../assets/images/checkin-green/image.png')}
            />
          </View>
          <View style={styles.col}>
            <Text style={text.xxlargeBlack}>
              {alignWithLanguage(
                new Intl.NumberFormat('en-IE').format(dailyCheckIns)
              )}
            </Text>
            <Text style={styles.text}>{t('appStats:dailyCheckIns')}</Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  col: {
    flex: 1,
    flexDirection: 'column'
  },
  text: {
    flex: 1,
    ...text.defaultBold,
    color: colors.lighterText
  },
  appUsersIcon: {
    marginRight: 20
  },
  checkInsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20
  },
  appUsersIconSize: {
    width: 56,
    height: 56
  },
  checkInsIconSize: {
    width: 20,
    height: 24
  },
  checkInsIconBackground: {
    backgroundColor: colors.lightGreen
  }
});
