import React, {useState, FC, useEffect} from 'react';
import {
  Dimensions,
  I18nManager,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import {useTranslation} from 'react-i18next';
import Carousel from 'react-native-snap-carousel';
import Spinner from 'react-native-loading-spinner-overlay';

import {useApplication} from '../../providers/context';
import {DataByDate, LEA} from '../../services/api';
import {getSubCounties} from '../../services/api/counties';
import {alignWithLanguage} from '../../services/i18n/common';
import {useDataRefresh} from '../../hooks/data-refresh';

import {Heading} from '../atoms/heading';
import {Spacing} from '../atoms/spacing';
import {IncidenceRate} from '../molecules/incidence-rate';
import {LeaCard} from '../molecules/lea-card';
import {QuickStats} from '../organisms/quick-stats';
import {TrendChartCard} from '../organisms/trend-chart-card';
import {MissingData} from '../templates/missing-data';

import Layouts from '../../theme/layouts';
import {SPACING_HORIZONTAL} from '../../theme/layouts/shared';
import {colors} from '../../constants/colors';

const {width: screenWidth} = Dimensions.get('screen');

interface CountyChartProps {
  countyName: string;
  data: DataByDate;
  route: RouteProp<any, 'countyChart'>;
}

export const CountyChart: FC<CountyChartProps> = ({route}) => {
  const {data: appData} = useApplication();
  const {t} = useTranslation();
  const [areaSelectedMap, setAreaSelectedMap] = useState<any>(null);
  const refresh = useDataRefresh();

  useEffect(() => {
    const getAreaSelectedMap = async () => {
      const data = await AsyncStorage.getItem('cti.area_selected');
      setAreaSelectedMap(data ? JSON.parse(data) : {});
    };
    getAreaSelectedMap();
  }, []);

  if (!areaSelectedMap) {
    return (
      <Layouts.Scrollable>
        <Spinner animation="fade" visible />
      </Layouts.Scrollable>
    );
  }

  const countyName = route?.params?.countyName;
  const countyData = appData?.counties?.find(
    ({county}) => county === countyName
  );

  const dailyCases = countyData?.dailyCases;
  const areas = countyData?.areas;

  if (!dailyCases || !areas) {
    return <MissingData heading={countyName} refresh={refresh} />;
  }

  const councils = getSubCounties(countyName, areas);

  const getFirstAreaIndex = (LEAs: (LEA | undefined)[]) =>
    I18nManager.isRTL && Platform.OS !== 'ios' ? LEAs.length - 1 : 0;

  const getPreviousAreaIndex = (name: string, LEAs: (LEA | undefined)[]) => {
    const index = areaSelectedMap[name]
      ? LEAs.findIndex((a) => a?.id === areaSelectedMap[name])
      : -1;

    return index === -1 ? getFirstAreaIndex(LEAs) : index;
  };

  const getHeading = (name: string, LEAs: LEA[]) =>
    alignWithLanguage(
      t(councils.length > 1 ? 'lea:council' : 'lea:county', {
        name,
        areasCount: LEAs.length
      })
    );

  return (
    <Layouts.Scrollable refresh={refresh} backgroundColor={colors.background}>
      <Heading accessibilityFocus text={alignWithLanguage(countyName)} />
      <QuickStats cases={dailyCases} />
      <Spacing s={16} />
      <TrendChartCard
        title={t('confirmedChart:title')}
        a11yHintKey="confirmedChart:hint"
        data={dailyCases}
      />
      <Spacing s={16} />
      <IncidenceRate
        rate={appData?.incidence?.rate}
        date={
          appData?.incidence?.date
            ? new Date(appData.incidence.date)
            : new Date()
        }
      />
      <Spacing s={16} />
      {councils.map(({name, areas: LEAs}, index1) => (
        <View key={`council-${index1}`}>
          <Spacing s={16} />
          <Heading lineWidth={75} text={getHeading(name, LEAs)} />
          <Carousel
            useScrollView
            data={LEAs}
            renderItem={({item, index}: {item: LEA; index: number}) => (
              <View
                accessible
                key={`lea-card-${index}`}
                style={styles.itemWrapper}>
                <LeaCard {...item} />
              </View>
            )}
            sliderWidth={screenWidth}
            itemWidth={screenWidth - SPACING_HORIZONTAL * 2}
            activeSlideAlignment={'center'}
            loopClonesPerSide={0}
            inactiveSlideOpacity={1}
            inactiveSlideScale={1}
            containerCustomStyle={styles.carouselContainer}
            firstItem={getPreviousAreaIndex(name, LEAs)}
            onSnapToItem={(slideIndex) => {
              const selectedLEA = LEAs[slideIndex];
              if (!selectedLEA) {
                return;
              }
              const newSelectedMap = {
                ...areaSelectedMap,
                [name]: selectedLEA.id
              };
              setAreaSelectedMap(newSelectedMap);
              AsyncStorage.setItem(
                'cti.area_selected',
                JSON.stringify(newSelectedMap)
              );
            }}
          />
        </View>
      ))}
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  itemWrapper: {
    margin: 8
  },
  carouselContainer: {
    marginHorizontal: -SPACING_HORIZONTAL,
    paddingBottom: 16
  }
});
