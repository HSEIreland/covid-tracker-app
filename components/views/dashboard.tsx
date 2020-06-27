import React, {FC, useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import {useApplication} from '../../providers/context';
import {useExposure} from '../../providers/exposure';
import {useAppState} from '../../hooks/app-state';

import {Spacing} from '../atoms/spacing';
import {Card} from '../atoms/card';

import {CheckInCard} from '../molecules/check-in-card';
import {QuickCheckIn} from '../molecules/quick-checkin';
import {TrackerAreaChart} from '../molecules/area-chart';
import {TransmissionChart} from '../molecules/transmission-chart';
import {StatsSource} from '../molecules/stats-source';
import {AppStats} from '../organisms/app-stats';
import {CovidStats} from '../organisms/covid-stats';

import Layouts from '../../theme/layouts';
import {Button} from '../../components/atoms/button';
import {Toast} from '../../components/atoms/toast';
import {CloseContactWarning} from '../molecules/close-contact-warning';
import {TracingAvailable} from '../molecules/tracing-available';
import {usePermissions} from '../../providers/permissions';

export const Dashboard: FC<any> = ({navigation}) => {
  const app = useApplication();
  const {t} = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [quickCheckInDismissed, setQuickCheckInDismissed] = useState(false);
  const [appState] = useAppState();
  const isFocused = useIsFocused();
  const exposure = useExposure();
  const {readPermissions} = usePermissions();

  const {verifyCheckerStatus} = app;
  const {checkInConsent, quickCheckIn, checks} = app;

  const displayQuickCheckIn =
    !quickCheckInDismissed &&
    (quickCheckIn ||
      (checkInConsent && checks.length > 0 && !app.completedChecker));

  useFocusEffect(
    React.useCallback(() => {
      if (!isFocused || appState !== 'active') {
        return;
      }
      readPermissions();
      verifyCheckerStatus();
    }, [isFocused, appState, verifyCheckerStatus])
  );

  const onRefresh = () => {
    setRefreshing(true);
    app.loadAppData().then(() => setRefreshing(false));
  };

  useEffect(onRefresh, []);

  const appStats = () => {
    const total = Number(app.data.checkIns.total);
    const ok = Number(app.data.checkIns.ok);
    const okPercentage = total && Math.round((ok / total) * 100);
    return {
      totalCheckins: total,
      noSymptoms: (total && okPercentage) || 0,
      someSymptoms: (total && 100 - okPercentage) || 0
    };
  };

  const errorToast = app.data === null && (
    <Toast
      type="error"
      icon={require('../../assets/images/alert/alert.png')}
      message={t('common:missingError')}
    />
  );

  return (
    <Layouts.Scrollable
      safeArea={false}
      toast={errorToast}
      backgroundColor="#FAFAFA"
      refresh={{refreshing, onRefresh}}>
      {exposure.tracingAvailable && (
        <>
          <TracingAvailable />
          <Spacing s={16} />
        </>
      )}
      {exposure.contacts && exposure.contacts.length > 0 && (
        <>
          <CloseContactWarning />
          <Spacing s={16} />
        </>
      )}
      {!checkInConsent && (
        <>
          <CheckInCard
            onPress={() =>
              navigation.navigate('symptoms', {screen: 'symptoms.checker'})
            }
          />
          <Spacing s={16} />
        </>
      )}
      {displayQuickCheckIn && (
        <QuickCheckIn
          onDismissed={() => setQuickCheckInDismissed(true)}
          nextHandler={() =>
            navigation.navigate('symptoms', {
              screen: 'symptoms.checker',
              params: {timestamp: Date.now(), skipQuickCheckIn: true}
            })
          }
        />
      )}
      {app.data === null && (
        <>
          <View style={styles.empty}>
            <Button type="empty" onPress={onRefresh}>
              {t('common:missingDataAction')}
            </Button>
          </View>
        </>
      )}
      {app.data && (
        <>
          <AppStats data={appStats()} />
          <Spacing s={16} />
          <CovidStats
            data={app.data.statistics}
            onCountyBreakdown={() => navigation.navigate('casesByCounty')}
          />
          <Spacing s={16} />
          <Card padding={{h: 12}}>
            <TrackerAreaChart
              title={t('confirmedChart:title')}
              hint={t('confirmedChart:hint')}
              yesterday={t('confirmedChart:yesterday')}
              data={app.data.chart}
            />
          </Card>
          <Spacing s={16} />
          <TransmissionChart
            title={t('transmissionChart:title')}
            data={[
              [
                t('transmissionChart:community'),
                app.data.statistics.transmission.community
              ],
              [
                t('transmissionChart:contact'),
                app.data.statistics.transmission.closeContact
              ],
              [
                t('transmissionChart:travel'),
                app.data.statistics.transmission.travelAbroad
              ]
            ]}
          />
          <Spacing s={16} />
          <StatsSource
            lastUpdated={{
              stats: new Date(app.data.statistics.lastUpdated.stats),
              profile: new Date(app.data.statistics.lastUpdated.profile)
            }}
          />
        </>
      )}
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
