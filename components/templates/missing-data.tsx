import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {RefreshControlProps, StyleSheet, View} from 'react-native';
import {Button} from '../atoms/button';
import {Toast} from '../atoms/toast';

import Layouts from '../../theme/layouts';

interface MissingDataProps {
  heading: string;
  refresh?: RefreshControlProps;
}

export const MissingData: FC<MissingDataProps> = ({heading, refresh}) => {
  const {t} = useTranslation();

  return (
    <Layouts.Scrollable heading={heading} refresh={refresh}>
      <Toast
        type="error"
        icon={require('../../assets/images/alert/alert.png')}
        message={t('common:missingError')}
      />
      {!!refresh?.onRefresh && (
        <View style={styles.empty}>
          <Button type="empty" onPress={refresh.onRefresh}>
            {t('common:missingDataAction')}
          </Button>
        </View>
      )}
    </Layouts.Scrollable>
  );
};

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200
  }
});
