import React, {useCallback} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  useExposure,
  StatusState,
  AuthorisedStatus,
  StatusType
} from 'react-native-exposure-notification-service';

import {useApplication} from '../../../providers/context';

import {Spacing} from '../../atoms/spacing';
import {Card} from '../../atoms/card';
import {Button} from '../../atoms/button';

import {CloseContactWarning} from '../../molecules/close-contact-warning';
import {shareApp} from '../../organisms/tab-bar-bottom';
import {text} from '../../../theme';
import {colors} from '../../../constants/colors';
import Layouts from '../../../theme/layouts';

import {Active} from './active';
import {NotActive} from './not-active';
import {NoSupport} from './no-support';
import {CanSupport} from './can-support';
import {NotEnabled} from './not-enabled';

import {useAppState} from '../../../hooks/app-state';
import {Markdown} from '../../atoms/markdown';
import {formatLabel, getLabelHint} from '../../molecules/trend-chart';
import {UsageStatsCard} from '../../molecules/usage-stats-card';

export const ContactTracing = ({navigation}) => {
  const {t} = useTranslation();
  const exposure = useExposure();
  const {data, completedExposureOnboarding} = useApplication();
  const isFocused = useIsFocused();
  const [appState] = useAppState();

  const {
    supported,
    canSupport,
    status,
    enabled,
    isAuthorised,
    initialised
  } = exposure;

  useFocusEffect(
    useCallback(() => {
      if (!isFocused || appState !== 'active') {
        return;
      }

      async function onFocus() {
        await exposure.readPermissions();
        exposure.getCloseContacts();
      }

      onFocus();
    }, [isFocused, appState])
  );

  let showCards = true;
  let exposureStatusCard;
  if (!supported) {
    exposureStatusCard = !canSupport ? <NoSupport /> : <CanSupport />;
    showCards = false;
  } else {
    if (initialised) {
      if (status.state === StatusState.active && enabled) {
        exposureStatusCard = <Active />;
      } else if (
        isAuthorised === AuthorisedStatus.unknown ||
        !completedExposureOnboarding
      ) {
        exposureStatusCard = <NotEnabled />;
      } else {
        const type = status.type || [];
        exposureStatusCard = (
          <NotActive
            exposureOff={type.indexOf(StatusType.exposure) !== -1}
            bluetoothOff={type.indexOf(StatusType.bluetooth) !== -1}
          />
        );
      }
    }
  }

  let appRegistrationsCount = 0;
  if (data?.installs.length) {
    appRegistrationsCount = data.installs[data.installs.length - 1][1];
  }

  const hasCloseContacts = exposure.contacts && exposure.contacts.length > 0;

  return (
    <Layouts.Scrollable
      safeArea={false}
      heading={t('contactTracing:title')}
      backgroundColor="#FAFAFA"
      accessibilityRefocus>
      {hasCloseContacts && (
        <>
          <CloseContactWarning />
          <Spacing s={16} />
        </>
      )}
      {exposureStatusCard}
      <Spacing s={16} />
      {data && data.uploads && (
        <>
          <UsageStatsCard data={data} />
          <Spacing s={16} />
        </>
      )}
      <Card padding={{r: 12}}>
        <View style={[style.row, {alignItems: 'flex-start'}]}>
          <View
            style={[
              style.checkInsIcon,
              style.checkInsIconBackground,
              {width: 50}
            ]}>
            <Image
              accessibilityIgnoresInvertColors
              style={style.checkInsIconSize}
              {...style.checkInsIconSize}
              source={require('../../../assets/images/checkin-green/image.png')}
            />
          </View>
          <View style={{flex: 1}}>
            <View
              accessible
              accessibilityLabel={
                t('contactTracing:registrationsCard:title') +
                ': ' +
                getLabelHint(t, data ? Number(data.activeUsers) : 0)
              }
              accessibilityHint="">
              <Text style={text.xxlargeBlack}>
                {t('contactTracing:registrationsCard:registrations', {
                  registrations: data
                    ? formatLabel(Number(data.activeUsers))
                    : 0
                })}
              </Text>
              <Text style={style.lighterHeading}>
                {t('contactTracing:registrationsCard:title')}
              </Text>
            </View>
            <Spacing s={4} />
            <View style={{width: '100%', flex: 1, flexDirection: 'row'}}>
              <Markdown>
                {t('contactTracing:registrationsCard:text', {
                  percentage: (data && data.installPercentage) || 0,
                  registrations: formatLabel(appRegistrationsCount)
                })}
              </Markdown>
            </View>
          </View>
        </View>
      </Card>
      <Spacing s={16} />
      <Card
        onPress={() =>
          navigation.navigate(
            hasCloseContacts ? 'closeContact' : 'closeContactInfo'
          )
        }
        padding={{r: 12}}
        icon={{
          w: 56,
          h: 56,
          source: require('../../../assets/images/info/info.png')
        }}>
        <Text style={text.largeBlack}>
          {t('contactTracing:closeContactCard:title')}
        </Text>
        <Spacing s={4} />
        <Text style={text.default}>
          {t('contactTracing:closeContactCard:text')}
        </Text>
      </Card>
      {showCards && (
        <>
          <Spacing s={16} />
          <Card
            onPress={() => navigation.navigate('uploadKeys')}
            padding={{r: 12}}
            icon={{
              w: 56,
              h: 56,
              source: require('../../../assets/images/upload/image.png')
            }}>
            <Text style={text.largeBlack}>
              {t('contactTracing:uploadCard:title')}
            </Text>
            <Spacing s={4} />
            {data && data.uploads && (
              <Markdown>
                {t('contactTracing:uploadCard:text', {
                  uploads: new Intl.NumberFormat('en-IE').format(data.uploads)
                })}
              </Markdown>
            )}
          </Card>
        </>
      )}
    </Layouts.Scrollable>
  );
};

const style = StyleSheet.create({
  cardWidth: {
    marginHorizontal: -12
  },
  registrationsImage: {
    height: 126,
    width: '100%'
  },
  center: {
    alignItems: 'center'
  },
  lighterHeading: {
    ...text.defaultBold,
    color: colors.lighterText
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  icon: {
    marginRight: 12
  },
  rowIcon: {
    width: 56,
    height: 56
  },
  checkInsIcon: {
    width: 50,
    height: 50,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20
  },
  checkInsIconSize: {
    width: 20,
    height: 24
  },
  checkInsIconBackground: {
    backgroundColor: '#EAFBED'
  }
});
