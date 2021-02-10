import React, {
  useRef,
  useEffect,
  FC,
  MutableRefObject,
  useState,
  useCallback
} from 'react';
import {
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {TFunction} from 'i18next';

import {Spacing} from '../atoms/spacing';
import {Button} from '../atoms/button';
import {Link} from '../atoms/link';

import {styles as consentStyles} from './checkin-consent';
import {useApplication} from '../../providers/context';
import {useCheckinReminder} from '../../providers/reminders/checkin-reminder';

import {text} from '../../theme';

interface Props {
  onDismissed: () => void;
  nextHandler: () => void;
  cardRef: MutableRefObject<View>;
}

const DURATION = 200;

interface PromptProps {
  complete: boolean;
  t: TFunction;
  cardRef: MutableRefObject<View>;
  handleNext: (value?: string) => void;
}

const Prompt: FC<PromptProps> = ({complete, t, cardRef, handleNext}) => {
  const [saving, setSaving] = useState(false);
  const opacity = useRef(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      setSaving(false);
    }, [])
  );

  const nextHandler = (next?: string) => {
    if (saving) {
      return;
    }
    setSaving(true);

    handleNext(next);
  };

  useEffect(() => {
    if (!complete) {
      Animated.timing(opacity.current, {
        toValue: 1,
        duration: DURATION,
        useNativeDriver: false
      }).start();
    } else {
      Animated.timing(opacity.current, {
        toValue: 0,
        duration: DURATION,
        useNativeDriver: false
      }).start(() => setSaving(false));
    }
  }, [complete]);

  return (
    <Animated.View
      style={{
        opacity: opacity.current,
        height: complete ? 0 : 'auto',
        zIndex: complete ? 1 : 0
      }}>
      <View>
        <View accessible ref={cardRef}>
          <Text style={text.largeBold}>{t('returning:title')}</Text>
          <Text style={text.largeBold}>{t('returning:subtitle')}</Text>
        </View>
        <Spacing s={12} />
        <View style={consentStyles.buttonsContainer}>
          <Button
            disabled={saving}
            width="100%"
            type="empty"
            onPress={() => nextHandler('checkIn')}>
            {t('returning:action1')}
          </Button>
          <Spacing s={16} />
          <Button
            disabled={saving}
            width="100%"
            type="empty"
            onPress={() => nextHandler()}>
            {t('returning:action2')}
          </Button>
        </View>
      </View>
    </Animated.View>
  );
};

interface ResultProps {
  complete: boolean;
  t: TFunction;
}

const Result: FC<ResultProps> = ({complete, t}) => {
  const navigation = useNavigation();

  const opacity = useRef(new Animated.Value(0));

  useEffect(() => {
    if (complete) {
      Animated.timing(opacity.current, {
        toValue: 1,
        delay: DURATION,
        duration: DURATION,
        useNativeDriver: false
      }).start();
    } else {
      Animated.timing(opacity.current, {
        toValue: 0,
        delay: DURATION,
        duration: DURATION,
        useNativeDriver: false
      }).start();
    }
  }, [complete]);

  return (
    <Animated.View
      style={{
        opacity: opacity.current,
        height: complete ? 'auto' : 0,
        zIndex: complete ? 1 : 0
      }}>
      <View>
        <Text style={text.xlargeBold}>{t('returning:completeTitle')}</Text>
        <Link
          onPress={() =>
            navigation.navigate('symptoms', {screen: 'symptoms.history'})
          }>
          {t('returning:completeLink')}
        </Link>
      </View>
    </Animated.View>
  );
};

export const QuickCheckIn: React.FC<Props> = ({
  onDismissed,
  nextHandler,
  cardRef
}) => {
  const {t} = useTranslation();
  const app = useApplication();
  const {doneCheckIn} = useCheckinReminder();

  const handleNext = async (value?: string) => {
    if (value !== 'checkIn') {
      return nextHandler && nextHandler();
    }

    await app.checkIn(
      app.user!.sex!,
      app.user!.ageRange!,
      app.user!.location!,
      {
        fever: 0,
        cough: 0,
        breath: 0,
        flu: 0
      },
      {quickCheckIn: true}
    );
    doneCheckIn();
  };

  const completedChecker = app.isCheckerCompleted();

  return (
    <Animated.View style={consentStyles.container}>
      <View style={consentStyles.dismissed}>
        <TouchableWithoutFeedback
          accessibilityRole="button"
          accessibilityHint={t('common:dismiss')}
          accessibilityLabel={t('common:dismiss')}
          onPress={onDismissed}>
          <Image
            style={consentStyles.iconSize}
            {...consentStyles.iconSize}
            source={require('../../assets/images/dismiss/dismiss.png')}
          />
        </TouchableWithoutFeedback>
      </View>
      <Prompt
        cardRef={cardRef}
        complete={completedChecker}
        t={t}
        handleNext={handleNext}
      />
      <Result complete={completedChecker} t={t} />
    </Animated.View>
  );
};
