import React, {useState, useCallback, FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RouteProp} from '@react-navigation/native';

import {useApplication} from '../../providers/context';
import Layouts from '../../theme/layouts';
import {DataByDate} from '../../services/api';

import {Toast} from '../atoms/toast';
import {Heading} from '../atoms/heading';
import {Button} from '../atoms/button';
import {TrendChartCard} from '../organisms/trend-chart-card';
import {QuickStats} from '../organisms/quick-stats';
import {Spacing} from '../atoms/spacing';

interface CountyChartProps {
  countyName: string;
  data: DataByDate;
  route: RouteProp<any, 'countyChart'>;
}

export const CountyChart: FC<CountyChartProps> = ({route}) => {
  const countyName = route?.params?.countyName;

  const {t} = useTranslation();
  const app = useApplication();
  const [refreshing, setRefreshing] = useState(false);

  const {loadAppData} = app;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAppData().then(() => setRefreshing(false));
  }, [loadAppData]);

  const data = app.data?.counties.find(({county}) => county === countyName)
    ?.dailyCases;

  if (!data) {
    return (
      <View style={styles.empty}>
        <Toast
          type="error"
          icon={require('../../assets/images/alert/alert.png')}
          message={t('common:missingError')}
        />
        <Button type="empty" onPress={onRefresh}>
          {t('common:missingDataAction')}
        </Button>
      </View>
    );
  }

  return (
    <Layouts.Scrollable refresh={{refreshing, onRefresh}}>
      <Heading accessibilityFocus text={countyName} />
      <QuickStats cases={data} />
      <Spacing s={16} />
      <TrendChartCard
        title={t('confirmedChart:title')}
        hint={t('confirmedChart:hint')}
        yesterday={t('confirmedChart:yesterday')}
        data={data}
      />
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200
  }
});
