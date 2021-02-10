import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import {useApplication} from '../../providers/context';
import {DataProtectionLink} from '../views/data-protection-policy';

import {Spacing} from '../atoms/spacing';
import {Button} from '../atoms/button';
import {Markdown} from '../atoms/markdown';

import {colors} from '../../constants/colors';
import {text} from '../../theme';

interface CheckInConsentProps {
  onConsent?: () => void;
}

export const CheckInConsent: React.FC<CheckInConsentProps> = ({onConsent}) => {
  const {t} = useTranslation();
  const app = useApplication();

  const onYes = async () => {
    await app.setContext({checkInConsent: true});
    onConsent && onConsent();
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={text.largeBold}>{t('welcome:title')}</Text>
      </View>
      <Spacing s={18} />
      <Markdown markdownStyles={markdownStyles}>{t('welcome:text')}</Markdown>
      <Spacing s={8} />
      <View style={styles.buttonsContainer}>
        <Button width={'100%'} onPress={onYes}>
          {t('welcome:action')}
        </Button>
      </View>
      <Spacing s={16} />
      <DataProtectionLink />
    </View>
  );
};

const markdownStyles = StyleSheet.create({
  block: {
    ...text.default,
    marginBottom: 18
  }
});

export const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.white,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    padding: 16,
    marginBottom: 16
  },
  buttonsContainer: {
    alignItems: 'center'
  },
  dismissed: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: 9,
    right: 9,
    zIndex: 99
  },
  iconSize: {
    width: 24,
    height: 24
  }
});
