import React, { FC, useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import QRCode from 'react-native-qrcode-svg';
import * as SecureStore from 'expo-secure-store';
import { Button } from '../../atoms/button';
import { LineItem } from '../../atoms/line-item';
import { Quote } from '../../molecules/quote';
import { useApplication } from '../../../providers/context';
import { useVaccineCertConfig } from '../../../providers/vaccine-cert-config';
import Layouts from '../../../theme/layouts';
import { colors } from '../../../constants/colors';

export const ViewCert: FC<{}> = () => {
  const { t } = useTranslation();
  const { vaccineCert, setContext } = useApplication();
  const { width } = useWindowDimensions();
  const { config, getValue } = useVaccineCertConfig();
  const navigation = useNavigation();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!config) {
      navigation.navigate('main');
    }
  }, [navigation, vaccineCert]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('vaccineCert:delete:confirmTitle'),
      t('vaccineCert:delete:confirmText'),
      [
        {
          text: t('vaccineCert:delete:cancel'),
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: t('vaccineCert:delete:confirm'),

          onPress: async () => {
            await SecureStore.deleteItemAsync('cti.vaccineCert');
            setContext({ vaccineCert: undefined });
            navigation.navigate('main');
          },
          style: 'destructive'
        }
      ]
    );
  }, [setContext]);

  let error = null;
  let vaccination = null;
  let test = null;
  let recovery = null;

  if (!config) {
    return null;
  }

  if (vaccineCert?.error) {
    const header = t('vaccineCert:view:error');
    const message = t(
      `vaccineCert:error:${vaccineCert.error.name}`,
      t('vaccineCert:error:unknown')
    );

    error = (
      <Quote style={styles.error} text={`${header}: ${message}`} />
    );
  }

  if (vaccineCert?.content?.v?.length) {
    const data = vaccineCert.content.v[0];

    vaccination = (
      <View>
        <LineItem
          label={t('vaccineCert:view:status')}
          value={
            data.sd === data.dn
              ? t('vaccineCert:view:fullyVaccinated')
              : t('vaccineCert:view:partiallyVaccinated')
          }
        />
        {showDetails && (
          <>
            <LineItem
              label={t('vaccineCert:view:diseaseAgentTargeted')}
              value={getValue(config.valueSets.diseaseAgentTargeted, data.tg)}
            />
            <LineItem
              label={t('vaccineCert:view:vaccineProphylaxis')}
              value={getValue(config.valueSets.vaccineProphylaxis, data.vp)}
            />
            <LineItem
              label={t('vaccineCert:view:vaccineMedicinalProduct')}
              value={getValue(
                config.valueSets.vaccineMedicinalProduct,
                data.mp
              )}
            />
            <LineItem
              label={t('vaccineCert:view:vaccineMahManf')}
              value={getValue(config.valueSets.vaccineMahManf, data.ma)}
            />
            <LineItem
              label={t('vaccineCert:view:doseNumber')}
              value={data.dn}
            />
            <LineItem
              label={t('vaccineCert:view:totalDoses')}
              value={data.sd}
            />
            <LineItem
              label={t('vaccineCert:view:vaccinationDate')}
              value={format(new Date(data.dt), 'dd-MMM-yyyy')}
            />
            <LineItem
              label={t('vaccineCert:view:country')}
              value={getValue(config.valueSets.countryCodes, data.co)}
            />
            <LineItem
              label={t('vaccineCert:view:certIssuer')}
              value={data.is}
            />
            <LineItem label={t('vaccineCert:view:certId')} value={data.ci} />
          </>
        )}
      </View>
    );
  }

  if (vaccineCert?.content?.t?.length) {
    const data = vaccineCert.content.t[0];

    test = (
      <View>
        <LineItem
          label={t('vaccineCert:view:status')}
          value={t('vaccineCert:view:tested')}
        />
        {showDetails && (
          <>
            <LineItem
              label={t('vaccineCert:view:diseaseAgentTargeted')}
              value={getValue(config.valueSets.diseaseAgentTargeted, data.tg)}
            />
            <LineItem
              label={t('vaccineCert:view:testType')}
              value={getValue(config.valueSets.testType, data.tt)}
            />
            <LineItem
              label={t('vaccineCert:view:testManf')}
              value={getValue(config.valueSets.testManf, data.ma)}
            />
            <LineItem
              label={t('vaccineCert:view:testTime')}
              value={format(new Date(data.sc), 'dd-MMM-yyyy hh:mm:ss aa')}
            />
            <LineItem
              label={t('vaccineCert:view:testResult')}
              value={getValue(config.valueSets.testResult, data.tr)}
            />
            <LineItem
              label={t('vaccineCert:view:testCenter')}
              value={data.tc}
            />
            <LineItem
              label={t('vaccineCert:view:country')}
              value={getValue(config.valueSets.countryCodes, data.co)}
            />
            <LineItem
              label={t('vaccineCert:view:certIssuer')}
              value={data.is}
            />
            <LineItem label={t('vaccineCert:view:certId')} value={data.ci} />
          </>
        )}
      </View>
    );
  }

  if (vaccineCert?.content?.r?.length) {
    const data = vaccineCert.content.r[0];

    recovery = (
      <View>
        <LineItem
          label={t('vaccineCert:view:status')}
          value={t('vaccineCert:view:recovered')}
        />
        {showDetails && (
          <>
            <LineItem
              label={t('vaccineCert:view:diseaseAgentTargeted')}
              value={getValue(config.valueSets.diseaseAgentTargeted, data.tg)}
            />
            <LineItem
              label={t('vaccineCert:view:firstPositive')}
              value={format(new Date(data.fr), 'dd-MMM-yyyy')}
            />
            <LineItem
              label={t('vaccineCert:view:country')}
              value={getValue(config.valueSets.countryCodes, data.co)}
            />
            <LineItem
              label={t('vaccineCert:view:certIssuer')}
              value={data.is}
            />
            <LineItem label={t('vaccineCert:view:certId')} value={data.ci} />
            <LineItem
              label={t('vaccineCert:view:validFrom')}
              value={format(new Date(data.df), 'dd-MMM-yyyy')}
            />
            <LineItem
              label={t('vaccineCert:view:validTo')}
              value={format(new Date(data.du), 'dd-MMM-yyyy')}
            />
          </>
        )}
      </View>
    );
  }

  return (
    <Layouts.Scrollable heading={t('vaccineCert:view:heading')}>
      {vaccineCert && (
        <View style={styles.qr}>
          <QRCode size={width * 0.7} value={vaccineCert.raw} />
        </View>
      )}
      {!vaccineCert && (
        <View style={styles.notRecognized}>
          <Text>{t('vaccineCert:view:notRecognized')}</Text>
        </View>
      )}
      <View>
        {error}
        {vaccineCert?.content?.nam?.gn && (
          <LineItem
            label={t('vaccineCert:view:name')}
            value={`${vaccineCert.content.nam.gn} ${vaccineCert.content.nam.fn}`}
          />
        )}
        {vaccineCert?.content?.dob && (
          <LineItem
            label={t('vaccineCert:view:dob')}
            value={format(new Date(vaccineCert.content.dob), 'dd-MMM-yyyy')}
          />
        )}
        {vaccination}
        {test}
        {recovery}
      </View>
      <View style={styles.buttons}>
        {!vaccineCert && (
          <Button type="empty" onPress={() => navigation.navigate('vaccineCert.scan')}>
            {t('vaccineCert:view:scanButton')}
          </Button>
        )}
        {vaccineCert && !showDetails && (
          <Button type="empty" onPress={() => setShowDetails(true)}>
            {t('vaccineCert:view:viewDetailsButton')}
          </Button>
        )}
        {vaccineCert && showDetails && (
          <Button type="danger" onPress={handleDelete}>
            {t('vaccineCert:view:deleteButton')}
          </Button>
        )}
      </View>
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  notRecognized: {
    marginBottom: 8
  },
  qr: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  buttons: {
    marginTop: 16
  },
  error: {
    borderLeftColor: colors.red,
    marginBottom: 16
  }
});
