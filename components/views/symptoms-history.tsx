import React, {FC} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  ViewStyle,
  ImageSourcePropType
} from 'react-native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {useExposure} from 'react-native-exposure-notification-service';

import {Symptoms, useApplication} from '../../providers/context';
import {useAppState} from '../../hooks/app-state';
import {getDateLocaleOptions} from '../../services/i18n/date';

import {Spacing} from '../atoms/layout';
import {Card} from '../atoms/card';
import {Heading} from '../atoms/heading';
import {Toast} from '../atoms/toast';
import {CheckInCard} from '../molecules/check-in-card';
import {CheckinReminderCard} from '../molecules/checkin-reminder-card';

import {colors} from '../../constants/colors';
import Layouts from '../../theme/layouts';
import {text} from '../../theme';

type Icons = Record<'1' | '2' | '3' | '4', ImageSourcePropType>;
type IconsKey = keyof Icons;

const symptomsHistoryIcons = {
  '1': require('../../assets/images/symptoms-history/1_temp.png'),
  '2': require('../../assets/images/symptoms-history/2_cough.png'),
  '3': require('../../assets/images/symptoms-history/3_shortness.png'),
  '4': require('../../assets/images/symptoms-history/4_nose.png')
};

interface Props {
  navigation: StackNavigationProp<any>;
}

export const SymptomsHistory: FC<Props> = ({navigation}) => {
  const {i18n, t} = useTranslation();
  const dateLocale = getDateLocaleOptions(i18n);

  const {isCheckerCompleted, checks} = useApplication();
  const [appState] = useAppState();
  const isFocused = useIsFocused();
  const {readPermissions} = useExposure();

  useFocusEffect(
    React.useCallback(() => {
      if (!isFocused || appState !== 'active') {
        return;
      }

      readPermissions();
    }, [isFocused, appState])
  );

  const completedChecker = isCheckerCompleted();

  return (
    <Layouts.Scrollable safeArea={false} backgroundColor="#FAFAFA">
      {completedChecker && (
        <>
          <Toast
            color={`${colors.success}1A`}
            message={t('symptomsHistory:completed')}
            icon={require('../../assets/images/covid-teal/covid.png')}
          />
          <Spacing s={16} />
        </>
      )}
      {!completedChecker && (
        <>
          <CheckInCard
            onPress={() =>
              navigation.navigate('symptoms', {
                screen: 'symptoms.checker',
                params: {timestamp: Date.now()}
              })
            }
          />
          <Spacing s={20} />
        </>
      )}
      <Heading
        accessibilityRefocus
        accessibilityFocus
        text={t('symptomsHistory:title')}
      />
      {completedChecker && (
        <>
          <CheckinReminderCard />
          <Spacing s={20} />
        </>
      )}
      <Card>
        {!checks.length && (
          <Text style={text.smallBold}>{t('checker:noresults')}</Text>
        )}
        {checks.map((check, index) => {
          const allSymptoms = Array.from(new Array(4), (_, i) => i + 1).map(
            (i) => ({
              index: i,
              questionId: t(`checker:question${i}id`) as keyof Symptoms,
              label: t(`checker:question${i}Label`)
            })
          );
          const symptoms = allSymptoms.filter(
            (s) => check.symptoms[s.questionId] === 1
          );
          const hasSymptoms = symptoms.length > 0;

          return (
            <View
              key={`check-${check.timestamp}`}
              style={
                checks.length > 1 && index < checks.length - 1 && styles.check
              }
              accessible
              accessibilityRole="text">
              <View style={styles.summary}>
                <View style={styles.row}>
                  <View
                    style={[
                      styles.icon,
                      styles.iconDimensions,
                      hasSymptoms && styles.iconPink
                    ]}>
                    {hasSymptoms ? (
                      <Image
                        accessibilityIgnoresInvertColors
                        style={styles.symptomsIcon}
                        width={18}
                        height={18}
                        source={require('../../assets/images/covid-red/covid.png')}
                      />
                    ) : (
                      <Image
                        accessibilityIgnoresInvertColors
                        style={styles.noSymptomsIcon}
                        width={16}
                        height={20}
                        source={require('../../assets/images/checkin-green/image.png')}
                      />
                    )}
                  </View>
                  <Text style={text.xlargeBlack}>{symptoms.length}</Text>
                  <Text>&nbsp;</Text>
                  <Text style={text.xsmallBoldOpacity70}>
                    {t(
                      `symptomsHistory:${
                        symptoms.length === 1 ? 'symptom' : 'symptoms'
                      }`
                    )}
                  </Text>
                </View>
                <Text style={text.xsmallBoldOpacity70}>
                  {format(
                    new Date(Number(check.timestamp)),
                    'do MMMM',
                    dateLocale
                  )}
                </Text>
              </View>
              {symptoms.length > 0 &&
                symptoms.map(({index: symptomsIndex, label}) => {
                  return (
                    <View key={`symptom-${symptomsIndex}`} style={styles.row}>
                      <View style={[styles.icon, styles.iconDimensions]}>
                        <Image
                          style={styles.iconDimensions}
                          width={32}
                          height={32}
                          source={
                            symptomsHistoryIcons[
                              symptomsIndex.toString() as IconsKey
                            ]
                          }
                        />
                      </View>
                      <Text style={styles.symptom}>{label}</Text>
                    </View>
                  );
                })}
            </View>
          );
        })}
      </Card>
    </Layouts.Scrollable>
  );
};

const rowStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 4,
  flexWrap: 'wrap'
};

const styles = StyleSheet.create({
  check: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dot
  },
  summary: {
    ...rowStyle,
    flex: 1,
    justifyContent: 'space-between'
  },
  row: rowStyle,
  iconDimensions: {
    width: 32,
    height: 32
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  symptomsIcon: {
    width: 18,
    height: 18
  },
  noSymptomsIcon: {
    width: 16,
    height: 20
  },
  iconPink: {
    backgroundColor: 'rgb(254, 215, 226)',
    borderRadius: 16
  },
  symptom: {
    ...text.xsmallBoldOpacity70,
    flex: 1
  }
});
