import React, {FC, useState, useEffect, useRef, useCallback} from 'react';
import {
  Animated,
  Image,
  Text,
  StyleSheet,
  View,
  Dimensions,
  ImageSourcePropType,
  AppState
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';

import {useApplication, Symptoms, UserLocation} from '../../providers/context';
import {useDbText} from '../../providers/settings';
import {useCheckinReminder} from '../../providers/reminders/checkin-reminder';
import {setAccessibilityFocusRef, useFocusRef} from '../../hooks/accessibility';

import {Spacing, Separator} from '../atoms/layout';
import {Heading} from '../atoms/heading';
import {Button} from '../atoms/button';
import {Markdown} from '../atoms/markdown';
import {Dropdown} from '../atoms/dropdown';
import {SelectList} from '../atoms/select-list';
import {CheckInConsent} from '../molecules/checkin-consent';
import {CheckinReminderCard} from '../molecules/checkin-reminder-card';
import {LocationDropdown} from '../molecules/locality-dropdown';
import {Result, ResultType} from '../molecules/result-card';

import {colors} from '../../constants/colors';
import Layouts from '../../theme/layouts';
import {text, shadows, baseStyles} from '../../theme';

const width = Dimensions.get('window').width;
const ANIMATION_DURATION = 300;

type Icons = Record<'1' | '2' | '3' | '4', ImageSourcePropType>;
type IconsKey = keyof Icons;

const icons: Icons = {
  '1': require('../../assets/images/symptoma/image.png'),
  '2': require('../../assets/images/symptomc/image.png'),
  '3': require('../../assets/images/symptomb/image.png'),
  '4': require('../../assets/images/symptomd/image.png')
};

function countSymptoms(symptoms: Symptoms) {
  return Object.values(symptoms).reduce((t: number, r: number) => t + r, 0);
}

type ParamList = {
  'symptom.checker': {
    timestamp: number;
    skipQuickCheckIn: boolean;
  };
};

interface SymptomCheckerProps {
  route: RouteProp<ParamList, 'symptom.checker'>;
}

const markdownStyles = {
  text: {
    ...text.large,
    flexWrap: 'wrap'
  },
  strong: {
    ...text.largeBold
  },
  block: {
    ...text.default,
    marginBottom: 16
  }
};

const getDefaultAnswers = () =>
  ({
    fever: 0,
    cough: 0,
    breath: 0,
    flu: 0
  } as Symptoms);

export const SymptomChecker: FC<SymptomCheckerProps> = ({route}) => {
  const skipQuickCheckIn = route.params && route.params.skipQuickCheckIn;
  const timestamp = route.params && route.params.timestamp;

  const {sexOptions, ageRangeOptions} = useDbText();
  const {t} = useTranslation();
  const app = useApplication();
  const {isCheckerCompleted} = app;
  const headingRef = useRef<Text>(null);
  const [ref1, ref2, ref3] = useFocusRef({
    accessibilityFocus: false,
    count: 3,
    timeout: 1000
  });
  const navigation = useNavigation();
  const {doneCheckIn} = useCheckinReminder();

  const isDemographicsToDo =
    app.user &&
    (!app.user.sex ||
      !app.user.ageRange ||
      !app.user.location.county ||
      !app.user.location.locality);

  const [state, setState] = useState({
    saving: false,
    question: (isDemographicsToDo && -1) || (skipQuickCheckIn && 1) || 0,
    result: null as ResultType | null,
    sex: (app.user && app.user.sex) || '',
    ageRange: (app.user && app.user.ageRange) || '',
    location: Object.assign(
      {county: '', locality: ''},
      app.user && app.user.location
    ) as UserLocation,
    feelingWell: true,
    answers: getDefaultAnswers(),
    slideInX: new Animated.Value(width)
  });

  const isDonePreviously = isCheckerCompleted() && !state.result;
  const isShowingThankYou =
    state.question === 5 && !!state.result && !state.saving;
  const showSpinner = app.initializing || isDonePreviously;

  const restartIfNeeded = useCallback(() => {
    if (isShowingThankYou && !isCheckerCompleted()) {
      navigation.setParams({skipQuickCheckIn: false});
      setState((s) => ({
        ...s,
        question: isDemographicsToDo ? -1 : 0,
        result: null,
        answers: getDefaultAnswers()
      }));
    }
  }, [isCheckerCompleted, isDemographicsToDo, isShowingThankYou, navigation]);

  useEffect(() => {
    restartIfNeeded();
    AppState.addEventListener('change', restartIfNeeded);
    return () => AppState.removeEventListener('change', restartIfNeeded);
  }, [restartIfNeeded]);

  useFocusEffect(
    React.useCallback(() => {
      restartIfNeeded();
      setState((s) => ({
        ...s,
        sex: (app.user && app.user.sex) || '',
        ageRange: (app.user && app.user.ageRange) || '',
        location: Object.assign(
          {county: '', locality: ''},
          app.user && app.user.location
        )
      }));
    }, [app.user, restartIfNeeded])
  );

  useEffect(() => {
    if (timestamp || skipQuickCheckIn) {
      setState((s) => ({
        ...s,
        result: null,
        feelingWell: !skipQuickCheckIn,
        answers: {
          fever: 0,
          cough: 0,
          breath: 0,
          flu: 0
        },
        question:
          app.user &&
          (!app.user.sex ||
            !app.user.ageRange ||
            !app.user.location.county ||
            !app.user.location.locality)
            ? -1
            : skipQuickCheckIn
            ? 1
            : 0
      }));
    }
  }, [timestamp, skipQuickCheckIn]);

  useEffect(() => {
    if (state.question === -1) {
      if (app.checkInConsent) {
        setAccessibilityFocusRef(headingRef);
      }
      return;
    }

    Animated.timing(state.slideInX, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true
    }).start(() => setAccessibilityFocusRef(headingRef));
  }, [state.question, app.checkInConsent]);

  useEffect(() => {
    const completeCheckIn = async () => {
      const {sex, ageRange, location, answers, feelingWell} = state;
      const symptomsCount = countSymptoms(answers);

      let result: ResultType | null = null;
      if (!symptomsCount) {
        if (ageRangeOptions.find((g) => g.value === ageRange && g.riskGroup)) {
          result = 'riskGroup';
        } else {
          const {checks} = app;
          result =
            checks[0] && countSymptoms(checks[0].symptoms) > 0
              ? 'recovered'
              : feelingWell
              ? 'noSymptomsWell'
              : 'noSymptomsNotWell';
        }
      } else {
        result = 'virusIsolation';
      }

      setState((s) => ({...s, result, saving: true}));

      try {
        if (!app.isCheckerCompleted()) {
          await app.checkIn(sex, ageRange, location, answers as Symptoms);
          doneCheckIn();
          setState((s) => ({...s, saving: false}));
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (state.question === 5 && !state.saving) {
      completeCheckIn();
    }
  }, [state.question]);

  const handleAnswer = async (question: string, currentAnswer: number) => {
    const answers = {
      ...state.answers,
      [question]: currentAnswer
    };

    setState((s) => ({
      ...s,
      answers,
      question: state.question + 1,
      slideInX: new Animated.Value(width)
    }));
  };

  const introContinue = async () => {
    app.setContext({
      user: {
        ...app.user,
        sex: state.sex || 'u',
        ageRange: state.ageRange || 'u',
        location: {
          county: state.location.county || 'u',
          locality: state.location.locality || 'u'
        }
      }
    });

    setState({
      ...state,
      question: route.params && route.params.skipQuickCheckIn ? 1 : 0
    });
  };

  if (isDonePreviously) {
    navigation.navigate('symptoms.history');
  }

  if (!app.checkInConsent || showSpinner) {
    return (
      <Layouts.Scrollable safeArea={false} backgroundColor="#FAFAFA">
        <Heading
          accessibilityRefocus
          accessibilityFocus
          text={t('checker:title')}
        />
        {showSpinner ? <Spinner /> : <CheckInConsent />}
      </Layouts.Scrollable>
    );
  }

  const renderIntro = () => (
    <>
      <View style={styles.card}>
        <Text style={text.largeBold}>{t('checker:introWelcome')}</Text>
        <Spacing s={16} />
        <Text style={baseStyles.label}>{t('sex:label')}</Text>
        <Spacing s={8} />
        <SelectList
          items={sexOptions}
          selectedValue={state.sex}
          onItemSelected={(sex) => setState((s) => ({...s, sex}))}
        />
        <Separator />
        <Dropdown
          ref={ref1}
          label={t('ageRange:label')}
          placeholder={t('ageRange:placeholder')}
          items={ageRangeOptions}
          value={state.ageRange}
          onValueChange={(ageRange) => {
            setState((s) => ({...s, ageRange}));
            setAccessibilityFocusRef(ref1);
          }}
          onClose={() => setAccessibilityFocusRef(ref1)}
        />
        <Separator />
        <LocationDropdown
          countyRef={ref2}
          localityRef={ref3}
          value={state.location}
          onValueChange={(location) => {
            setState((s) => ({...s, location}));
            setAccessibilityFocusRef(location.locality ? ref3 : ref2);
          }}
        />
      </View>
      <Spacing s={16} />
      <Button width="100%" onPress={introContinue}>
        {t('checker:introButton')}
      </Button>
    </>
  );

  const renderQuickCheckIn = () => (
    <Animated.View style={{transform: [{translateX: state.slideInX}]}}>
      <View style={styles.card}>
        <Text style={text.largeBold}>{t('returning:subtitle')}</Text>
        <Spacing s={12} />
        <Button
          width="100%"
          type="empty"
          onPress={() =>
            setState({
              ...state,
              feelingWell: true,
              question: 5,
              slideInX: new Animated.Value(width)
            })
          }>
          {t('returning:action1')}
        </Button>
        <Spacing s={12} />
        <Button
          width="100%"
          type="empty"
          onPress={() =>
            setState({
              ...state,
              feelingWell: false,
              question: 1,
              slideInX: new Animated.Value(width)
            })
          }>
          {t('returning:action2')}
        </Button>
      </View>
    </Animated.View>
  );

  const renderResults = () => (
    <Animated.View style={{transform: [{translateX: state.slideInX}]}}>
      <Result result={state.result || ''} />
      <Spacing s={20} />
      <CheckinReminderCard />
    </Animated.View>
  );

  const headingTranslationKey = state.result
    ? 'resultTitle'
    : state.question === -1
    ? 'introTitle'
    : 'title';

  return (
    <Layouts.Scrollable safeArea={false} backgroundColor="#FAFAFA">
      <Heading
        accessibilityFocus
        headingRef={headingRef}
        text={t(`checker:${headingTranslationKey}`)}
      />
      {state.question === -1 && renderIntro()}
      {state.question === 0 && renderQuickCheckIn()}
      {state.result && renderResults()}

      {state.question > 0 && state.question < 5 && (
        <Animated.View
          style={{transform: [{translateX: state.slideInX}]}}
          accessibilityLiveRegion="polite">
          <View style={styles.card}>
            <View style={styles.row}>
              <Image
                style={styles.icon}
                source={icons[String(state.question) as IconsKey]}
              />
              <View style={styles.question}>
                <Markdown markdownStyles={markdownStyles}>
                  {t(`checker:question${state.question}`)}
                </Markdown>
                <Spacing s={8} />
              </View>
            </View>
            <View style={styles.buttonsContainer}>
              <Button
                style={styles.buttonLeft}
                type="empty"
                onPress={() =>
                  handleAnswer(t(`checker:question${state.question}id`), 0)
                }>
                {t('checker:no')}
              </Button>
              <Button
                style={styles.buttonRight}
                type="empty"
                onPress={() =>
                  handleAnswer(t(`checker:question${state.question}id`), 1)
                }>
                {t('checker:yes')}
              </Button>
            </View>
          </View>
        </Animated.View>
      )}
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.default,
    backgroundColor: colors.white,
    padding: 12
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around'
  },
  icon: {
    width: 54,
    height: 54,
    marginRight: 8,
    marginBottom: 12
  },
  question: {
    flex: 1,
    flexWrap: 'wrap'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  buttonLeft: {
    flexGrow: 1,
    marginRight: 8
  },
  buttonRight: {
    flexGrow: 1,
    marginLeft: 8
  }
});
