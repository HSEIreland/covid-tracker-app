import React, {useRef, useEffect, FC} from 'react';
import {
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {TFunction} from 'i18next';

import {Spacing} from '../atoms/spacing';
import {Button} from '../atoms/button';
import {Link} from '../atoms/link';

import {styles} from './checkin-consent';
import {useApplication} from '../../providers/context';

import {text} from '../../theme';

interface Props {
  onDismissed: () => void;
  nextHandler: () => void;
}

const DURATION = 200;

interface PromptProps {
  complete: boolean;
  t: TFunction;
  handleNext: (value?: string) => void;
}

const Prompt: FC<PromptProps> = ({complete, t, handleNext}) => {
  const height = useRef(new Animated.Value(0));
  const opacity = useRef(new Animated.Value(0));

  useEffect(() => {
    if (!complete) {
      Animated.parallel([
        Animated.timing(opacity.current, {
          toValue: 1,
          duration: DURATION,
          useNativeDriver: false
        }),
        Animated.timing(height.current, {
          toValue: 206,
          duration: DURATION,
          useNativeDriver: false
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity.current, {
          toValue: 0,
          duration: DURATION,
          useNativeDriver: false
        }),
        Animated.timing(height.current, {
          toValue: 0,
          duration: DURATION,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [complete]);

  return (
    <Animated.View
      style={{
        height: height.current,
        opacity: opacity.current,
        zIndex: complete ? 0 : 1
      }}>
      <View>
        <Text style={text.largeBold}>{t('returning:title')}</Text>
        <Text style={text.largeBold}>{t('returning:subtitle')}</Text>
        <Spacing s={12} />
        <View style={styles.buttonsContainer}>
          <Button
            width="100%"
            type="empty"
            onPress={() => handleNext('checkIn')}>
            {t('returning:action1')}
          </Button>
          <Spacing s={16} />
          <Button width="100%" type="empty" onPress={() => handleNext()}>
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
  const height = useRef(new Animated.Value(0));

  useEffect(() => {
    if (complete) {
      Animated.parallel([
        Animated.timing(opacity.current, {
          toValue: 1,
          delay: DURATION,
          duration: DURATION,
          useNativeDriver: false
        }),
        Animated.timing(height.current, {
          toValue: 80,
          delay: DURATION,
          duration: DURATION,
          useNativeDriver: false
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity.current, {
          toValue: 0,
          delay: DURATION,
          duration: DURATION,
          useNativeDriver: false
        }),
        Animated.timing(height.current, {
          toValue: 0,
          delay: DURATION,
          duration: DURATION,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [complete]);

  return (
    <Animated.View
      style={{
        opacity: opacity.current,
        height: height.current,
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

export const QuickCheckIn: React.FC<Props> = ({onDismissed, nextHandler}) => {
  const {t} = useTranslation();
  const app = useApplication();

  const height = useRef(new Animated.Value(0));

  useEffect(() => {
    if (!app.completedChecker) {
      Animated.timing(height.current, {
        toValue: 206,
        duration: DURATION,
        useNativeDriver: false
      }).start();
    } else {
      Animated.timing(height.current, {
        toValue: 80,
        duration: DURATION,
        delay: DURATION,
        useNativeDriver: false
      }).start();
    }
  }, [app.completedChecker]);

  const handleNext = async (value?: string) => {
    if (value !== 'checkIn') {
      return nextHandler && nextHandler();
    }

    app.checkIn(
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
  };

  return (
    <Animated.View
      style={{
        ...styles.container,
        height: height.current
      }}>
      <View style={styles.dismissed}>
        <TouchableWithoutFeedback
          accessibilityRole="button"
          accessibilityHint={t('common:dismiss')}
          accessibilityLabel={t('common:dismiss')}
          onPress={onDismissed}>
          <Image
            accessibilityIgnoresInvertColors
            style={{width: 24, height: 24}}
            width={24}
            height={24}
            source={require('../../assets/images/dismiss/dismiss.png')}
          />
        </TouchableWithoutFeedback>
      </View>
      <Prompt complete={app.completedChecker} t={t} handleNext={handleNext} />
      <Result complete={app.completedChecker} t={t} />
    </Animated.View>
  );
};
