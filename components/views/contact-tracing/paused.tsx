import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';

import {usePause} from '../../../providers/reminders/pause-reminder';

import {Button} from '../../atoms/button';
import {Card} from '../../atoms/card';
import {ResponsiveImage} from '../../atoms/responsive-image';
import {Spacing} from '../../atoms/layout';
import {Toast} from '../../atoms/toast';

import {colors} from '../../../constants/colors';

export const PausedControls: FC = () => {
  const {t} = useTranslation();
  const {timestamp, unpause} = usePause();
  return (
    <>
      <Toast
        color={colors.red}
        message={t('contactTracing:pause:paused', {
          time: format(new Date(Number(timestamp!)), 'HH:mm')
        })}
        icon={require('../../../assets/images/alert/alert.png')}
      />
      <Spacing s={16} />
      <Button onPress={() => unpause()}>
        {t('contactTracing:pause:reactivate:label')}
      </Button>
    </>
  );
};

export const Paused: FC = () => {
  return (
    <Card padding={{v: 12}}>
      <ResponsiveImage
        h={150}
        source={require('../../../assets/images/phone/not-active.png')}
      />
      <Spacing s={8} />
      <PausedControls />
    </Card>
  );
};
