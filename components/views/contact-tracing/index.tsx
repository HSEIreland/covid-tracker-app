import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import {useApplication} from '../../../providers/context';
import {
  useExposure,
  StatusState,
  AuthorisedStatus,
  StatusType
} from '../../../providers/exposure';

import {Spacing} from '../../atoms/spacing';
import {Card} from '../../atoms/card';
import {Button} from '../../atoms/button';

import {CloseContactWarning} from '../../molecules/close-contact-warning';
import {TrackerAreaChart} from '../../molecules/area-chart';
import {shareApp} from '../../organisms/tab-bar-bottom';
import {colors} from '../../../constants/colors';
import {text} from '../../../theme';
import Layouts from '../../../theme/layouts';

import {Active} from './active';
import {NotActive} from './not-active';
import {NoSupport} from './no-support';
import {CanSupport} from './can-support';
import {NotEnabled} from './not-enabled';

import {usePermissions} from '../../../providers/permissions';
import {useAppState} from '../../../hooks/app-state';

export const ContactTracing = ({navigation}) => {
  const {t} = useTranslation();
  const exposure = useExposure();
  const {data} = useApplication();
  const isFocused = useIsFocused();
  const {readPermissions} = usePermissions();
  const [appState] = useAppState();

  const {supported, canSupport, status, enabled, isAuthorised} = exposure;

  useFocusEffect(
    useCallback(() => {
      if (!isFocused || appState !== 'active') {
        return;
      }

      async function onFocus() {
        await readPermissions();
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
    if (status.state === StatusState.active && enabled) {
      exposureStatusCard = <Active />;
    } else if (isAuthorised === AuthorisedStatus.unknown) {
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

  return (
    <Layouts.Scrollable
      safeArea={false}
      heading={t('contactTracing:title')}
      accessibilityRefocus>
      {exposure.contacts && exposure.contacts.length > 0 && (
        <>
          <CloseContactWarning />
          <Spacing s={16} />
        </>
      )}
      {exposureStatusCard}
      {data && data.installs && (
        <>
          <Spacing s={16} />
          <Card padding={{h: 12}}>
            <TrackerAreaChart
              data={data.installs}
              title={t('contactTracing:registrationsTitle')}
              hint={t('contactTracing:registrationsHint')}
              yesterday={t('contactTracing:registrationsYesterday')}
              gradientStart={colors.yellow}
              lineColor={colors.yellow}
              intervalsCount={5}
            />
            <Spacing s={12} />
            <Text style={text.default}>{t('contactTracing:shareAppText')}</Text>
            <Spacing s={16} />
            <View style={{alignItems: 'center'}}>
              <Button width="60%" type="empty" onPress={() => shareApp(t)}>
                {t('tabBar:shareApp')}
              </Button>
            </View>
          </Card>
        </>
      )}
      {showCards && (
        <>
          <Spacing s={16} />
          <Card
            onPress={() => navigation.navigate('closeContact', {info: true})}
            padding={{r: 4}}>
            <Text style={text.defaultBold}>
              {t('contactTracing:closeContactCard:title')}
            </Text>
            <Spacing s={8} />
            <Text style={text.default}>
              {t('contactTracing:closeContactCard:text')}
            </Text>
          </Card>
          <Spacing s={16} />
          <Card
            onPress={() => navigation.navigate('uploadKeys')}
            padding={{r: 4}}>
            <Text style={text.defaultBold}>
              {t('contactTracing:uploadCard:title')}
            </Text>
            <Spacing s={8} />
            <Text style={text.default}>
              {t('contactTracing:uploadCard:text')}
            </Text>
          </Card>
        </>
      )}
    </Layouts.Scrollable>
  );
};
