import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

import {useApplication} from '../../providers/context';
import {DataByDate} from '../../services/api';
import {useDataRefresh} from '../../hooks/data-refresh';

import {Heading} from '../atoms/heading';
import {Spacing} from '../atoms/spacing';
import {CountyBreakdownCard} from '../molecules/county-breakdown-card';
import {VaccineDemographicsCard} from '../molecules/vaccine-demographics-card';
import {VaccineHeadlineCard} from '../molecules/vaccine-headline-card';
import {VaccineVendorCard} from '../molecules/vaccine-vendor-card';
import {TrendChartCard} from '../organisms/trend-chart-card';
import {MissingData} from '../templates/missing-data';
import {Loading} from './loading';

import {colors} from '../../constants/colors';
import Layouts from '../../theme/layouts';

export const VaccineStats = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {data, loading} = useApplication();
  const refresh = useDataRefresh();

  const headlineHeading = t('vaccineStats:headline:heading');

  if (loading) {
    return <Loading />;
  }
  if (!data?.vaccine) {
    return <MissingData heading={headlineHeading} refresh={refresh} />;
  }

  const hasHeadlineData = !!data.vaccine.overallDoses;
  const hasCountyData = !!data.vaccine.countyBreakdown;
  const hasHeadlineSection = hasHeadlineData || hasCountyData;

  const hasDosesData = !!data.vaccine.dailyDoses?.length;
  const hasDosesSection = hasDosesData;
  const dosesChartData:
    | DataByDate
    | undefined = data.vaccine.dailyDoses?.reduce(
    (chartData, {date, total}) =>
      date ? [...chartData, [new Date(date), total || 0]] : chartData,
    [] as DataByDate
  );
  const dosesHeading = t('vaccineStats:doses:heading');

  const hasDemographicsData = !!data.vaccine.ageBreakdown?.length;
  const hasDemographicsSection = hasDemographicsData;
  const demographicsHeading = t('vaccineStats:demographics:heading');

  const hasVendorData = !!data.vaccine.vendorBreakdown?.length;
  const hasVendorSection = hasVendorData;
  const vendorHeading = t('vaccineStats:vendor:heading');

  return (
    <Layouts.Scrollable refresh={refresh}>
      {hasHeadlineSection && (
        <>
          <Heading
            text={headlineHeading}
            accessibilityFocus
            accessibilityRefocus
          />
        </>
      )}
      {hasHeadlineData && (
        <>
          <VaccineHeadlineCard vaccineStats={data.vaccine} />
          <Spacing s={16} />
        </>
      )}
      {hasCountyData && (
        <>
          <CountyBreakdownCard
            onPress={() => navigation.navigate('vaccineByCounty')}
            title={t('vaccineByCounty:card:title')}
            description={t('vaccineByCounty:card:description')}
          />
          <Spacing s={16} />
        </>
      )}

      {hasDosesSection && (
        <>
          <Spacing s={8} />
          <Heading
            text={dosesHeading}
            accessibilityFocus={!hasHeadlineSection}
            accessibilityRefocus={!hasHeadlineSection}
          />
        </>
      )}
      {hasDosesData && dosesChartData && (
        <>
          <TrendChartCard
            data={dosesChartData}
            primaryColor={colors.cyan}
            a11yLabelKeys={[
              'vaccineStats:doses:label:default',
              'vaccineStats:doses:label:months',
              'vaccineStats:doses:label:all'
            ]}
          />
          <Spacing s={16} />
        </>
      )}

      {hasDemographicsSection && (
        <>
          <Spacing s={8} />
          <Heading
            text={demographicsHeading}
            accessibilityFocus={!hasHeadlineSection && !hasDosesSection}
            accessibilityRefocus={!hasHeadlineSection && !hasDosesSection}
          />
        </>
      )}
      {hasDemographicsData && (
        <>
          <VaccineDemographicsCard vaccineStats={data.vaccine} />
          <Spacing s={16} />
        </>
      )}

      {hasVendorSection && (
        <>
          <Spacing s={8} />
          <Heading
            text={vendorHeading}
            accessibilityFocus={
              !hasHeadlineSection && !hasDosesSection && !hasDemographicsSection
            }
            accessibilityRefocus={
              !hasHeadlineSection && !hasDosesSection && !hasDemographicsSection
            }
          />
        </>
      )}
      {hasVendorData && (
        <>
          <VaccineVendorCard vaccineStats={data.vaccine} />
          <Spacing s={16} />
        </>
      )}
    </Layouts.Scrollable>
  );
};
