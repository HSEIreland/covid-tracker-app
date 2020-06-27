import React, {FC} from 'react';
import {StyleSheet, View, Image, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Spacing} from '../atoms/layout';
import {Heading} from '../atoms/heading';
import {Card} from '../atoms/card';
import {Progress} from '../atoms/progress';

import {colors} from '../../constants/colors';
import {text} from '../../theme';

export interface AppStats {
  totalCheckins: number;
  noSymptoms: number;
  someSymptoms: number;
}

interface AppStatsProps {
  data: AppStats;
}

export const AppStats: FC<AppStatsProps> = ({data}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <Heading text={t('appStats:title')} />
      <Card>
        <View style={styles.row} accessible accessibilityRole="text">
          <View style={[styles.icon, styles.iconBackground]}>
            <Image
              accessibilityIgnoresInvertColors
              style={styles.iconSize}
              {...styles.iconSize}
              source={require('../../assets/images/checkin-blue/checkin.png')}
            />
          </View>
          <View style={styles.col}>
            <Text style={text.xxlargeBlack}>
              {new Intl.NumberFormat('en-IE').format(data.totalCheckins)}
            </Text>
            <Text style={styles.text}>{t('appStats:totalCheckins')}</Text>
          </View>
        </View>
        <Spacing s={12} />
        <View style={styles.row} accessible accessibilityRole="text">
          <View style={styles.progress}>
            <Progress
              width={56}
              value={data.noSymptoms}
              color={colors.success}
            />
          </View>
          <View style={styles.rowPercentage}>
            <Text style={text.xxlargeBlack}>
              {new Intl.NumberFormat('en-IE').format(data.noSymptoms)}
            </Text>
            <Text style={text.xlargeBlack}>%</Text>
            <Text>&nbsp;</Text>
            <Text style={styles.text}>{t('appStats:noSymptoms')}</Text>
          </View>
        </View>
        <Spacing s={12} />
        <View style={styles.row} accessible accessibilityRole="text">
          <View style={styles.progress}>
            <Progress width={56} value={data.someSymptoms} color={colors.red} />
          </View>
          <View style={styles.rowPercentage}>
            <Text style={text.xxlargeBlack}>
              {new Intl.NumberFormat('en-IE').format(data.someSymptoms)}
            </Text>
            <Text style={text.xlargeBlack}>%</Text>
            <Text>&nbsp;</Text>
            <Text style={styles.text}>{t('appStats:someSymptoms')}</Text>
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
    ...text.defaultBoldOpacity70
  },
  rowPercentage: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20
  },
  progress: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20
  },
  iconSize: {
    width: 24,
    height: 24
  },
  iconBackground: {
    backgroundColor: 'rgb(230, 248, 255)'
  }
});
