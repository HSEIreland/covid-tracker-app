import React, {FC, useCallback} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import Layouts from '../../../theme/layouts';
import {Button} from '../../atoms/button';
import {Link} from '../../atoms/link';
import {Quote} from '../../molecules/quote';
import {Spacing} from '../../atoms/layout';
import {baseStyles} from '../../../theme';

export const Register: FC<{}> = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const heading = t('vaccineCert:register:heading');

  const goBack = useCallback(() => navigation.navigate('main'), [navigation]);
  const startScan = useCallback(() => navigation.navigate('vaccineCert.scan'), [
    navigation
  ]);

  return (
    <Layouts.PinnedBottom heading={heading}>
      <View style={styles.icon}>
        <Image
          accessibilityIgnoresInvertColors
          style={[styles.imageSize, baseStyles.flipIfRtl]}
          width={styles.imageSize.width}
          height={styles.imageSize.height}
          source={require('../../../assets/images/vaccine-cert/icon.png')}
        />
      </View>
      <View style={styles.text}>
        <Text>{t('vaccineCert:register:text1')}</Text>
        <Spacing s={12} />
        <Text>{t('vaccineCert:register:text2')}</Text>
        <Spacing s={12} />
        <Quote text={t('vaccineCert:register:list1')} />
        <Spacing s={8} />
        <Quote text={t('vaccineCert:register:list2')} />
        <Spacing s={8} />
        <Quote text={t('vaccineCert:register:list3')} />
      </View>
      <View>
        <Button width={'100%'} onPress={startScan}>
          {t('vaccineCert:register:scanButton')}
        </Button>
        <Spacing s={24} />
        <Link align="center" large={true} onPress={goBack}>
          {t('vaccineCert:register:cancelButton')}
        </Link>
      </View>
    </Layouts.PinnedBottom>
  );
};

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16
  },
  text: {
    marginBottom: 24
  },
  imageSize: {
    width: 64,
    height: 64
  }
});
