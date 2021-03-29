import React, {useState, useRef, useEffect} from 'react';
import {
  Animated,
  Text,
  Dimensions,
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  AccessibilityInfo,
  findNodeHandle
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';

import {useApplication} from '../../providers/context';
import {useDbText} from '../../providers/settings';

import {Button} from '../atoms/button';
import {NavBar} from '../atoms/navbar';
import {Spacing} from '../atoms/spacing';
import {TutorialModalCard} from '../organisms/tutorial-modal-card';

import {colors} from '../../constants/colors';
import Layouts from '../../theme/layouts';
import {baseStyles, text} from '../../theme';

const OnboardingImage = require('../../assets/images/onboarding-bg/bg.png');
const Logo = require('../../assets/images/logo/logo.png');
const OnboardImage = require('../../assets/images/onboard4/image.png');

interface GetStartedProps {
  navigation: StackNavigationProp<any>;
}

const {width, height, scale} = Dimensions.get('screen');
const DURATION = 250;

export const GetStarted = ({navigation}: GetStartedProps) => {
  const {
    accessibility: {screenReaderEnabled}
  } = useApplication();
  const firstEl = useRef<Image | null>();
  const {t} = useTranslation();
  const [move, setMove] = useState(false);
  const viewOpacity = useRef(new Animated.Value(1));
  const navOpacity = useRef(new Animated.Value(0));
  const {tutorialVideoID} = useDbText();

  const hasVideoForLanguage = !!tutorialVideoID;

  useEffect(() => {
    if (firstEl.current) {
      const tag = findNodeHandle(firstEl.current);
      if (tag) {
        setTimeout(
          () => firstEl.current && AccessibilityInfo.setAccessibilityFocus(tag),
          250
        );
      }
    }
  }, []);

  const handleNext = () => {
    if (move) {
      return false;
    }
    setMove(true);
    out();
  };

  const out = () => {
    Animated.sequence([
      Animated.timing(viewOpacity.current, {
        toValue: 0,
        duration: DURATION,
        useNativeDriver: true
      }),
      Animated.timing(navOpacity.current, {
        toValue: 1,
        duration: DURATION,
        useNativeDriver: true
      })
    ]).start(() => {
      navigation.replace('yourData');
    });
  };

  return (
    <Layouts.Basic>
      <Animated.View
        style={[styles.animatedView, {opacity: navOpacity.current}]}>
        <NavBar
          placeholder
          navigation={navigation}
          scene={{descriptor: {options: {}}}}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.scrollViewContainer,
          {
            opacity: viewOpacity.current
          }
        ]}>
        <Image
          resizeMode="stretch"
          source={OnboardingImage}
          style={styles.background}
        />
        <ScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={styles.scrollView}
          automaticallyAdjustContentInsets
          importantForAccessibility="yes">
          <View style={styles.container}>
            <View style={styles.row}>
              <View style={[styles.image, baseStyles.flipIfRtl]}>
                <Image
                  resizeMode="contain"
                  source={OnboardImage}
                  style={styles.flexEnd}
                  accessibilityIgnoresInvertColors
                />
              </View>
              <View style={[styles.intro]}>
                <Image
                  source={Logo}
                  style={styles.logo}
                  ref={(r) => (firstEl.current = r)}
                  accessible
                  importantForAccessibility="yes"
                  accessibilityRole="text"
                  accessibilityHint={t('common:name')}
                />
                <Text style={styles.introHeading}>
                  {t('onboarding:intro:title')}
                </Text>
                <View style={styles.divider} />
              </View>
            </View>
            <Text style={styles.heading}>
              {t('onboarding:intro:view1:title')}
            </Text>
            <Text style={styles.viewText}>
              {t('onboarding:intro:view1:text')}
            </Text>
            <Spacing s={21} />
            <Text style={styles.heading}>
              {t('onboarding:intro:view2:title')}
            </Text>
            <Text style={styles.viewText}>
              {t('onboarding:intro:view2:text')}
            </Text>
            <Spacing s={21} />
            <Text style={styles.heading}>
              {t('onboarding:intro:view3:title')}
            </Text>
            <Text style={styles.viewText}>
              {t('onboarding:intro:view3:text')}
            </Text>
            <Spacing s={21} />
            {hasVideoForLanguage && (
              <>
                <TutorialModalCard />
                <Spacing s={21} />
              </>
            )}
            {screenReaderEnabled && (
              <>
                <Text style={styles.viewText}>
                  {t('onboarding:intro:view4:text')}
                </Text>
                <TouchableWithoutFeedback
                  importantForAccessibility="yes"
                  accessibilityRole="link"
                  onPress={() => {
                    navigation.navigate('terms', {screen: 'settings.terms'});
                  }}>
                  <Text style={[styles.link, styles.linkColor]}>
                    {t('onboarding:intro:view4:link')}
                  </Text>
                </TouchableWithoutFeedback>
              </>
            )}
            {!screenReaderEnabled && (
              <Text>
                <Text style={styles.viewText}>
                  {t('onboarding:intro:view4:text') + ' '}
                  <TouchableWithoutFeedback
                    onPress={() => {
                      navigation.navigate('terms', {screen: 'settings.terms'});
                    }}>
                    <Text style={[styles.link, styles.linkColor]}>
                      {t('onboarding:intro:view4:link')}
                    </Text>
                  </TouchableWithoutFeedback>
                </Text>
              </Text>
            )}
            <View style={styles.buttonContainer}>
              <Button disabled={move} onPress={handleNext}>
                {t('onboarding:intro:action')}
              </Button>
            </View>
            <View style={styles.spacer} />
          </View>
        </ScrollView>
      </Animated.View>
    </Layouts.Basic>
  );
};

export const styles = StyleSheet.create({
  linkColor: {
    color: '#20585B'
  },
  background: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    width,
    height
  },
  scrollView: {
    margin: 0
  },
  scrollViewContainer: {
    padding: 0,
    margin: 0,
    flex: 1,
    width,
    height,
    ...StyleSheet.absoluteFillObject
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    zIndex: 2,
    minHeight: height,
    backgroundColor: 'transparent',
    paddingStart: 12 * scale,
    paddingEnd: 12 * scale,
    paddingTop: scale > 2 ? 64 : 32
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 6,
    minHeight: 120
  },
  image: {
    flex: 1,
    marginBottom: 12,
    marginEnd: -12
  },
  intro: {
    flex: 1,
    paddingTop: 66
  },
  introHeading: {
    ...text.defaultBold,
    flex: 1
  },
  highlight: {
    color: colors.teal
  },
  divider: {
    backgroundColor: colors.lightYellow,
    height: 6,
    width: 70,
    marginBottom: 1
  },
  heading: {
    ...text.largeBold,
    marginBottom: 2
  },
  buttonContainer: {
    marginTop: 20 * scale,
    flexDirection: 'column'
  },
  viewText: {
    ...text.default,
    lineHeight: 23
  },
  link: {
    ...text.defaultBold,
    color: colors.teal
  },
  animatedView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  spacer: {
    height: 100
  },
  logo: {
    width: 127,
    height: 48,
    marginBottom: 12
  },
  flexEnd: {
    alignSelf: 'flex-end'
  }
});
