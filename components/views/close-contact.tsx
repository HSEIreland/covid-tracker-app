import React, {FC} from 'react';
import {Linking, StyleSheet, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {useApplication} from '../../providers/context';

import {Spacing} from '../atoms/layout';
import {Button} from '../atoms/button';
import {Card} from '../atoms/card';
import {Markdown} from '../atoms/markdown';

import Layouts from '../../theme/layouts';
import {text} from '../../theme';
import {useSettings} from '../../providers/settings';
import PushNotification from 'react-native-push-notification';

export const CloseContact: FC<any> = ({navigation}) => {
  const {t} = useTranslation();
  const {callBackData} = useApplication();
  const {closeContactAlert, closeContactTodo} = useSettings();

  PushNotification.setApplicationIconBadgeNumber(0);

  if (callBackData) {
    return (
      <Layouts.Scrollable heading={t('closeContact:titleAlert')}>
        <Text style={text.defaultBold}>{closeContactAlert}</Text>
        <Spacing s={16} />
        <Markdown markdownStyles={{strong: {...text.default}}}>
          {t('closeContact:text1Alert')}
        </Markdown>
        <Spacing s={16} />
        <Markdown>{closeContactTodo}</Markdown>
        <Markdown>{t('closeContact:text2Alert')}</Markdown>
        <Spacing s={16} />
        <Button
          width="100%"
          onPress={() =>
            Linking.openURL(`https://www2.hse.ie/app/in-app-close-contact`)
          }>
          {t('closeContact:gotoHSE')}
        </Button>
        <Spacing s={32} />
      </Layouts.Scrollable>
    );
  }

  return (
    <Layouts.Scrollable heading={t('closeContact:title')}>
      <Text style={text.defaultBold}>{closeContactAlert}</Text>
      <Spacing s={16} />
      <Markdown>{t('closeContact:text')}</Markdown>
      <Card
        onPress={() => navigation.navigate('closeContactInfo')}
        padding={{r: 4}}
        icon={{
          w: 56,
          h: 56,
          source: require('../../assets/images/info/info.png')
        }}>
        <Text style={text.largeBlack}>
          {t('contactTracing:closeContactCard:title')}
        </Text>
        <Spacing s={8} />
        <Text style={text.default}>
          {t('contactTracing:closeContactCard:text')}
        </Text>
      </Card>
      <Spacing s={16} />
      <Card
        onPress={() => navigation.navigate('requestACallback')}
        icon={{
          w: 56,
          h: 56,
          source: require('../../assets/images/phone-call/phone-call.png')
        }}>
        <Text style={text.largeBlack}>
          {t('closeContact:requestCallback:title')}
        </Text>
        <Spacing s={8} />
        <Text style={styles.notice}>
          {t('closeContact:requestCallback:text')}
        </Text>
      </Card>
      <Spacing s={16} />
      <Spacing s={32} />
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  notice: {
    ...text.default,
    lineHeight: 21
  }
});
