import React, {FC} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {useTranslation} from 'react-i18next';

import {StatsData} from '../../services/api';

import {Card} from '../atoms/card';

import {baseStyles, text} from '../../theme';
import {colors} from '../../constants/colors';

interface UsageStatsProps {
  data: StatsData;
}

// Pin widths from either side so text flow is uniform but image scales from center
const textWidth = 134;

// Images aren't perfectly symmetrical
const offsetLeft = 39;
const offsetRight = 41;

export const UsageStatsCard: FC<UsageStatsProps> = ({data}) => {
  const {t} = useTranslation();

  const hasData =
    typeof data?.uploads === 'number' &&
    typeof data?.notifications === 'number';

  return hasData ? (
    <Card padding={{v: 24}}>
      <View style={styles.appIcon}>
        <Image
          accessibilityIgnoresInvertColors
          style={styles.appIconSize}
          {...styles.appIconSize}
          source={require('../../assets/images/contact-tracing-display/ct-app-icon.png')}
        />
      </View>
      <View style={styles.container}>
        <View style={[styles.half, styles.left]}>
          <View style={styles.phoneImage}>
            <View style={[styles.imageLeft, baseStyles.flipIfRtl]}>
              <Image
                accessibilityIgnoresInvertColors
                style={styles.uploadIconSize}
                {...styles.uploadIconSize}
                source={require('../../assets/images/contact-tracing-display/ct-uploads.png')}
              />
            </View>
          </View>
          <View
            style={[styles.statText, styles.statTextLeft]}
            accessible={true}>
            <Text style={styles.statFigure}>
              {new Intl.NumberFormat('en-IE').format(data?.uploads!)}
            </Text>
            <Text style={styles.statLabel}>
              {t('contactTracing:statsCard:uploads:text')}
            </Text>
          </View>
        </View>
        <View style={[styles.half, styles.right]}>
          <View style={styles.phoneImage}>
            <View style={[styles.imageRight, baseStyles.flipIfRtl]}>
              <Image
                accessibilityIgnoresInvertColors
                style={styles.notificationsIconSize}
                {...styles.notificationsIconSize}
                source={require('../../assets/images/contact-tracing-display/ct-alerts.png')}
              />
            </View>
          </View>
          <View
            style={[styles.statText, styles.statTextRight]}
            accessible={true}>
            <Text style={styles.statFigure}>
              {new Intl.NumberFormat('en-IE').format(data?.notifications!)}
            </Text>
            <Text style={styles.statLabel}>
              {t('contactTracing:statsCard:alerts:text')}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  ) : null;
};
const styles = StyleSheet.create({
  appIcon: {
    position: 'absolute',
    width: 59,
    height: 59,
    left: '50%',
    top: -12,
    zIndex: 10,
    marginLeft: -29
  },
  appIconSize: {
    width: 59,
    height: 59
  },
  container: {
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  half: {
    flex: 1,
    flexGrow: 1,
    overflow: 'hidden'
  },
  left: {
    alignItems: 'flex-start'
  },
  right: {
    alignItems: 'flex-end'
  },
  phoneImage: {
    height: 96
  },
  imageLeft: {
    position: 'absolute',
    left: offsetLeft
  },
  imageRight: {
    position: 'absolute',
    right: offsetRight
  },
  uploadIconSize: {
    width: 190,
    height: 96
  },
  notificationsIconSize: {
    width: 171,
    height: 96
  },
  statText: {
    maxWidth: textWidth
  },
  statTextLeft: {
    marginRight: 8
  },
  statTextRight: {
    marginLeft: 8
  },
  statFigure: {
    ...text.xxlargeBlack,
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center'
  },
  statLabel: {
    ...text.defaultBold,
    color: colors.lighterText,
    textAlign: 'center'
  }
});
