import React, {FC, useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  useExposure,
  StatusState,
  getVersion,
  Version
} from 'react-native-exposure-notification-service';

import {useSettings} from '../../providers/settings';
import {useApplication} from '../../providers/context';
import {useAppState} from '../../hooks/app-state';
import {useFocusRef} from '../../hooks/accessibility';
import {useDataRefresh} from '../../hooks/data-refresh';

import {Spacing} from '../atoms/spacing';

import {CheckInCard} from '../molecules/check-in-card';
import {QuickCheckIn} from '../molecules/quick-checkin';
import {CountyBreakdownCard} from '../molecules/county-breakdown-card';
import {StatsSource} from '../molecules/stats-source';
import {AppStats} from '../organisms/app-stats';
import {CovidStats} from '../organisms/covid-stats';

import Layouts from '../../theme/layouts';
import {Button} from '../../components/atoms/button';
import {Toast} from '../../components/atoms/toast';
import {CloseContactWarning} from '../molecules/close-contact-warning';
import {TracingAvailable} from '../molecules/tracing-available';
import {VaccineHeadlineCard} from '../molecules/vaccine-headline-card';
import {TrendChartCard} from '../organisms/trend-chart-card';
import {PolicyUpdateCard} from '../molecules/policy-updates-card';
import {NewAppVersionCard} from '../molecules/new-app-version-card';
import {QuickStats} from '../organisms/quick-stats';
// import {VenueCheckInCard} from '../../venue-check-in';

import {colors} from '../../constants/colors';

// const showVenue = true;

// "Now Available" card is hangover from when ENS support was new
// There are reports of it showing seemingly randomly incorrectly
const allowNowAvailableCard = false;

export const Dashboard: FC<any> = ({navigation}) => {
  const app = useApplication();
  const {
    appConfig: {latestVersion: appLatestVersion}
  } = useSettings();
  const {t} = useTranslation();
  const {refreshing, onRefresh} = useDataRefresh();
  const [version, setVersion] = useState<Version>();
  const [quickCheckInDismissed, setQuickCheckInDismissed] = useState(false);
  const [tracingNowAvailable, setTracingNowAvailable] = useState(false);
  const [appState] = useAppState();
  const isFocused = useIsFocused();
  const exposure = useExposure();
  const [ref1, ref2, ref3, ref4, ref5, /* ref6, */ ref7] = useFocusRef({
    accessibilityFocus: true,
    accessibilityRefocus: true,
    count: 6,
    timeout: 1000
  });

  const {checkInConsent, quickCheckIn, checks} = app;

  const displayQuickCheckIn =
    !quickCheckInDismissed &&
    (quickCheckIn ||
      (checkInConsent && checks.length > 0 && !app.isCheckerCompleted()));

  let appUsers = 0;
  if (app.data?.installs?.length) {
    appUsers = Number(app.data.installs[app.data.installs.length - 1][1]);
  }

  useFocusEffect(
    React.useCallback(() => {
      if (!isFocused || appState !== 'active') {
        return;
      }
      exposure.readPermissions();

      // Exclude exposure from deps, don't re-run each time it is recreated
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [isFocused, appState])
  );

  useEffect(() => {
    const getVer = async () => {
      const ver = await getVersion();
      setVersion(ver);
    };
    getVer();
  }, []);

  useEffect(() => {
    // If user used deep link on unregistered app, can now apply and clear it
    if (app.pendingCode) {
      app.setContext({pendingCode: null, loading: false});
      navigation.reset({
        index: 1,
        routes: [
          {name: 'main', params: {screen: 'tracing'}},
          {name: 'uploadKeys', params: {c: app.pendingCode}}
        ]
      });
    }
    // Only run this once
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    const checkTracingNowAvailable = async () => {
      if (
        allowNowAvailableCard &&
        exposure.canSupport &&
        exposure.supported &&
        exposure.status.state !== StatusState.active &&
        exposure.status.state !== StatusState.restricted
      ) {
        setTracingNowAvailable(true);
      }
    };
    checkTracingNowAvailable();
  }, [exposure.canSupport, exposure.supported, exposure.status.state]);

  const errorToast = app.data === null && (
    <Toast
      type="error"
      icon={require('../../assets/images/alert/alert.png')}
      message={t('common:missingError')}
    />
  );

  const tandcUpdate =
    (app.tandcNotificationExpiryDate &&
      new Date() < app.tandcNotificationExpiryDate) ||
    false;

  const dpinUpdate =
    (app.dpinNotificationExpiryDate &&
      new Date() < app.dpinNotificationExpiryDate) ||
    false;

  const hasAppStats = !!app?.data?.checkIns;
  const hasVaccineStats = !!app?.data?.vaccine;
  const hasQuickStats =
    app?.data?.currentCases?.length && app?.data?.currentDeaths?.length;
  const hasChartData = !!app?.data?.chart?.length;
  const hasCovidStats =
    app?.data?.hospital && app?.data?.icu && app?.data?.tests;
  const hasStatsSource =
    app?.data?.statistics?.lastUpdated.profile &&
    app?.data?.statistics?.lastUpdated.stats;

  return (
    <Layouts.Scrollable
      safeArea={false}
      toast={errorToast}
      backgroundColor={colors.background}
      refresh={{refreshing, onRefresh}}>
      {tracingNowAvailable && (
        <>
          <TracingAvailable ref={ref1} />
          <Spacing s={16} />
        </>
      )}
      {exposure.contacts && exposure.contacts.length > 0 && (
        <>
          <CloseContactWarning ref={ref2} />
          <Spacing s={16} />
        </>
      )}
      {appLatestVersion && version && appLatestVersion !== version?.display && (
        <>
          <NewAppVersionCard ref={ref3} />
          <Spacing s={16} />
        </>
      )}
      {(tandcUpdate || dpinUpdate) && (
        <>
          <PolicyUpdateCard ref={ref4} tandc={tandcUpdate} dpin={dpinUpdate} />
          <Spacing s={16} />
        </>
      )}
      {!checkInConsent && (
        <>
          <CheckInCard
            ref={ref5}
            onPress={() =>
              navigation.navigate('symptoms', {screen: 'symptoms.checker'})
            }
          />
          <Spacing s={16} />
        </>
      )}
      {/*showVenue && (
        <>
          <VenueCheckInCard
            onPress={() => navigation.navigate('venueCheckIn')}
            ref={ref6}
          />
          <Spacing s={16} />
        </>
      )*/}
      {displayQuickCheckIn && (
        <QuickCheckIn
          cardRef={ref7}
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
          {hasAppStats && (
            <>
              <AppStats
                appUsers={appUsers}
                dailyCheckIns={Number(app.data.checkIns!.total)}
              />
              <Spacing s={16} />
            </>
          )}
          {hasVaccineStats && (
            <>
              <VaccineHeadlineCard
                vaccineStats={app.data.vaccine}
                onPress={() => navigation.navigate('vaccineStats')}
              />
              <Spacing s={16} />
            </>
          )}
          {hasQuickStats && (
            <>
              <QuickStats
                cases={app.data.currentCases!}
                deaths={app.data.currentDeaths!}
              />
              <Spacing s={16} />
            </>
          )}
          {hasChartData && (
            <>
              <TrendChartCard
                title={t('confirmedChart:title')}
                a11yHintKey="confirmedChart:hint"
                data={app.data.chart!}
              />
              <Spacing s={16} />
            </>
          )}
          <CountyBreakdownCard
            onPress={() => navigation.navigate('casesByCounty')}
            title={t('appStats:nationalPicture')}
            description={t('appStats:breakdown')}
          />
          <Spacing s={16} />
          {hasCovidStats && (
            <>
              <CovidStats
                hospital={app.data.hospital!}
                icu={app.data.icu!}
                tests={app.data.tests!}
              />
              <Spacing s={16} />
            </>
          )}
          {hasStatsSource && (
            <>
              <StatsSource
                lastUpdated={{
                  stats: new Date(app.data.statistics!.lastUpdated.stats!),
                  profile: new Date(app.data.statistics!.lastUpdated.profile!)
                }}
              />
            </>
          )}
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
