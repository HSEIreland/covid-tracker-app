import React, {useEffect} from 'react';
import {Text, View, Image, StyleSheet, Platform, Linking} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import {useExposure} from 'react-native-exposure-notification-service';

import {useApplication} from '../../providers/context';

import {SingleRow, Spacing} from '../atoms/layout';
import {Button} from '../atoms/button';
import {Link} from '../atoms/link';
import {Quote} from '../molecules/quote';
import {Card} from '../atoms/card';

import {colors} from '../../constants/colors';
import Layouts from '../../theme/layouts';
import {text} from '../../theme';

const TracingImage = require('../../assets/images/information/image.png');

interface Props {
  navigation: StackNavigationProp<any>;
}

const upgradeImage: {[key: string]: any} = {
  ios: require('../../assets/images/apple/image.png'),
  android: require('../../assets/images/google/image.png')
};

export const ContactTracingInformation = ({navigation, route}: Props) => {
  const {t} = useTranslation();
  const exposure = useExposure();
  const application = useApplication();

  const checkForUpgradeHandler = async () => {
    try {
      if (Platform.OS === 'ios') {
        Linking.openURL('App-Prefs:');
      } else {
        await exposure.triggerUpdate();
        await exposure.supportsExposureApi();
      }
    } catch (err) {
      console.log('Error handling check for upgrade', err);
    }
  };

  useEffect(() => {
    if (!exposure.supported && exposure.canSupport) {
      SecureStore.setItemAsync('supportPossible', 'true');
    }
  }, []);

  const handlePermissions = async () => {
    await exposure.askPermissions();
    const opts = (route && route.params) || {};
    await application.setContext({completedExposureOnboarding: true});
    navigation.navigate('followUpCall', opts);
  };

  const handleLater = () => {
    if (route && route.params && route.params.embedded) {
      return navigation.pop();
    }

    navigation.reset({
      index: 0,
      routes: [{name: 'main'}]
    });
  };

  if (!exposure.supported && !exposure.canSupport) {
    return (
      <Layouts.PinnedBottom heading={t('onboarding:information:title')}>
        <View style={notSupportedStyles.imageWrapper}>
          <Image
            accessibilityIgnoresInvertColors
            style={notSupportedStyles.image}
            {...notSupportedStyles.image}
            source={require('../../assets/images/phone/not-active.png')}
          />
        </View>
        <Spacing s={20} />
        <Text style={text.default}>
          {t('contactTracing:noSupport:message')}
        </Text>
        <Button
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{name: 'main'}]
            });
          }}>
          {t('onboarding:information:action')}
        </Button>
      </Layouts.PinnedBottom>
    );
  }

  const permissionsInfo = (
    <>
      <Text style={text.default}>{t('onboarding:information:text1')}</Text>
      <Spacing s={20} />
      <View style={permissionsStyles.row}>
        <Image
          accessibilityIgnoresInvertColors
          style={permissionsStyles.icon}
          width={32}
          height={32}
          source={require('../../assets/images/bluetooth/image.png')}
        />
        <Text style={text.defaultBold}>
          {t('onboarding:information:bluetooth')}
        </Text>
      </View>
      {Platform.OS !== 'android' && (
        <>
          <Spacing s={20} />
          <Text style={text.default}>{t('onboarding:information:text2')}</Text>
          <Spacing s={20} />
          <View style={permissionsStyles.row}>
            <Image
              accessibilityIgnoresInvertColors
              style={permissionsStyles.icon}
              width={32}
              height={32}
              source={require('../../assets/images/notification/image.png')}
            />
            <Text style={text.defaultBold}>
              {t('onboarding:information:notifications')}
            </Text>
          </View>
        </>
      )}
      <Spacing s={20} />
      <Quote text={t('onboarding:information:quote')} />
      <Spacing s={32} />
      <Button onPress={handlePermissions}>
        {t('onboarding:information:action')}
      </Button>
      <Spacing s={28} />
      <Link align="center" onPress={handleLater}>
        {t('onboarding:information:later')}
      </Link>
    </>
  );

  const upgradeNotice = (
    <>
      <Card>
        <SingleRow>
          <View style={cardStyles.text}>
            <Text style={text.defaultBold}>
              {t(`onboarding:upgrade:${Platform.OS}:title`)}
            </Text>
            <Spacing s={12} />
            <Text style={text.default}>
              {t(`onboarding:upgrade:${Platform.OS}:text`)}
            </Text>
          </View>
          <View>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              style={cardStyles.image}
              width={88}
              height={88}
              source={upgradeImage[Platform.OS]}
            />
          </View>
        </SingleRow>
        <Spacing s={16} />
        <Button onPress={checkForUpgradeHandler}>
          {t(`onboarding:upgrade:${Platform.OS}:action`)}
        </Button>
      </Card>
      <Spacing s={28} />
      <Link
        align="center"
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{name: 'main'}]
          });
        }}>
        {t('onboarding:information:skip')}
      </Link>
    </>
  );

  return (
    <Layouts.Scrollable
      heading={t('onboarding:information:title')}
      headingShort={true}>
      <View style={headerStyles.row}>
        <View style={headerStyles.textBlock}>
          <Text style={headerStyles.text}>
            {t('onboarding:information:highlight')}
          </Text>
          <Text style={text.default}>
            {t('onboarding:information:highlight1')}
          </Text>
        </View>
        <Image
          accessibilityIgnoresInvertColors
          style={headerStyles.image}
          width={157}
          height={207}
          source={TracingImage}
        />
      </View>
      <Spacing s={16} />
      <Text style={text.default}>{t('onboarding:information:text')}</Text>
      <Spacing s={24} />
      {exposure.supported ? permissionsInfo : upgradeNotice}
    </Layouts.Scrollable>
  );
};

const notSupportedStyles = StyleSheet.create({
  imageWrapper: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  image: {
    width: 140,
    height: 140
  }
});

const headerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  textBlock: {
    flexDirection: 'column',
    flex: 1
  },
  text: {
    flex: 1,
    paddingRight: 16,
    ...text.defaultBold,
    color: colors.teal,
    paddingBottom: 16
  },
  image: {
    width: 157,
    height: 207,
    marginTop: -48,
    marginRight: -20
  }
});

const permissionsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 12
  }
});

const cardStyles = StyleSheet.create({
  text: {
    flex: 1,
    paddingRight: 12
  },
  image: {
    width: 88,
    height: 88
  }
});
