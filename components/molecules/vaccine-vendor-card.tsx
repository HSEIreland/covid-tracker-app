import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {StatsData} from '../../services/api';

import {Card} from '../atoms/card';

import {text} from '../../theme';
import {colors} from '../../constants/colors';
import {HoriztonalBar} from '../atoms/horizontal-bar';

interface VaccineVendorProps {
  vaccineStats: StatsData['vaccine'];
}

const scaleCapLarge = {maxFontSizeMultiplier: 1.5};
const scaleCapSmall = {maxFontSizeMultiplier: 2};

export const VaccineVendorCard: FC<VaccineVendorProps> = ({vaccineStats}) => {
  const {t} = useTranslation();

  const {vendorBreakdown} = vaccineStats || {};
  if (!vendorBreakdown || !vendorBreakdown.length) {
    return null;
  }

  const maxValue = vendorBreakdown.reduce(
    (max, {total}) => Math.max(max, total || 0),
    0
  );

  return (
    <Card padding={{v: 4, h: 16}}>
      {vendorBreakdown.map(({name, first, second, total}, index) => {
        const a11yLabel = t('vaccineStats:vendor:summary', {
          name: name || '',
          first: first || 0,
          second: second || 0,
          total: total || 0
        });

        return (
          <View accessible accessibilityLabel={a11yLabel} key={name}>
            <View
              style={[styles.row, !!index && styles.borderRow]}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden>
              <View style={[styles.col, styles.firstCol]}>
                <Text style={styles.name} {...scaleCapLarge}>
                  {name}
                </Text>
                <View style={[styles.doseRow, styles.doseRowOuter]}>
                  {!!first && (
                    <View style={styles.doseRow}>
                      <Text style={styles.doseLabel} {...scaleCapSmall}>
                        {t('vaccineStats:vendor:first')}
                        {': '}
                      </Text>
                      <Text style={styles.doseStat} {...scaleCapSmall}>
                        {new Intl.NumberFormat('en-IE').format(first)}
                      </Text>
                    </View>
                  )}
                  {!!second && (
                    <View style={styles.doseRow}>
                      <Text style={styles.doseLabel} {...scaleCapSmall}>
                        {t('vaccineStats:vendor:second')}
                        {': '}
                      </Text>
                      <Text style={styles.doseStat} {...scaleCapSmall}>
                        {new Intl.NumberFormat('en-IE').format(second)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {typeof total === 'number' && (
                <View style={[styles.col, styles.secondCol]}>
                  <View style={styles.chart}>
                    <HoriztonalBar
                      value={total}
                      maxValue={maxValue}
                      reverse
                      color={colors.cyan}
                    />
                    <Text style={styles.totalStat} {...scaleCapLarge}>
                      {new Intl.NumberFormat('en-IE').format(total)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </Card>
  );
};
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 16
  },
  borderRow: {
    borderTopWidth: 1,
    borderTopColor: colors.grayBorder
  },
  col: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    flex: 1
  },
  firstCol: {
    flex: 3
  },
  secondCol: {
    flex: 2
  },
  name: {
    ...text.largeBold,
    flex: 1,
    marginBottom: 8
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 8
  },
  doseRowOuter: {
    flex: 1,
    flexWrap: 'wrap'
  },
  doseLabel: {
    ...text.small,
    flex: 1,
    lineHeight: 14,
    marginBottom: 4,
    justifyContent: 'flex-start',
    color: colors.lighterText
  },
  doseStat: {
    ...text.smallBold,
    color: colors.lighterText
  },
  chart: {
    paddingHorizontal: 8
  },
  totalStat: {
    textAlign: 'right',
    ...text.xlargeBlack
  }
});
