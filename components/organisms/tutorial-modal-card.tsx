import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useDbText} from '../../providers/settings';

import {LinkCard} from '../molecules/link-card';
import {VideoModal, VideoModalProps} from '../molecules/video-modal';

export const TutorialModalCard: React.FC<Partial<VideoModalProps>> = (
  videoModalProps
) => {
  const {t} = useTranslation();
  const {tutorialVideoID} = useDbText();
  const [showTutorial, setShowTutorial] = useState(false);

  return !tutorialVideoID ? null : (
    <>
      <LinkCard
        imageSource={require('../../assets/images/video/tutorial-card.png')}
        onPress={() => setShowTutorial(true)}
        title={t('tutorial:title')}
        subtitle={t('tutorial:description')}
      />
      <VideoModal
        {...videoModalProps}
        title={t('tutorial:title')}
        videoId={tutorialVideoID}
        isVisible={showTutorial}
        onClose={() => setShowTutorial(false)}
        buttonText={t('common:dismiss')}
      />
    </>
  );
};
