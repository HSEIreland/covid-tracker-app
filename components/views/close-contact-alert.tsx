import React, {FC} from 'react';
import {useExposure} from 'react-native-exposure-notification-service';
import PushNotification from 'react-native-push-notification';
import {useTranslation} from 'react-i18next';

import {useApplication} from '../../providers/context';
import {useDbText} from '../../providers/settings';
import {useExposureDates} from '../../hooks/exposure-dates';

import {Spacing} from '../atoms/layout';
import {Markdown, closeContactMarkdownStyles} from '../atoms/markdown';
import {PhoneNumber} from '../organisms/phone-number';

import Layouts from '../../theme/layouts';

const CALL_BACK_MD = '<<CALL-BACK>>';
const PHONE_NUMBER_MD = '<<PHONE-NUMBER>>';

export const CloseContactAlert: FC<any> = () => {
  const {t} = useTranslation();
  const {
    formatted: {exposure: closeContactDate}
  } = useExposureDates();
  const {callBackData} = useApplication();

  const {
    closeContactAlert,
    closeContactCallBack,
    closeContactCallbackQueued
  } = useDbText();
  const {configure} = useExposure();

  PushNotification.setApplicationIconBadgeNumber(0);

  const content = closeContactAlert
    .replace(/\[\[closeContactDate\]\]/g, closeContactDate)
    .split(CALL_BACK_MD)
    .map((c) => c.trim());

  const callBackContent = closeContactCallBack
    .replace(/\[\[closeContactDate\]\]/g, closeContactDate)
    .split(PHONE_NUMBER_MD)
    .map((c) => c.trim());

  const queuedForCallback = closeContactCallbackQueued.replace(
    /\[\[phone_number\]\]/g,
    callBackData ? callBackData.mobile : ''
  );

  return (
    <Layouts.KeyboardScrollable heading={t('closeContactAlert:title')}>
      <Markdown markdownStyles={closeContactMarkdownStyles}>
        {content[0]}
      </Markdown>
      {callBackData && callBackData.mobile ? (
        <Markdown markdownStyles={closeContactMarkdownStyles}>
          {queuedForCallback}
        </Markdown>
      ) : (
        <>
          <Spacing s={16} />
          <Markdown markdownStyles={closeContactMarkdownStyles}>
            {callBackContent[0]}
          </Markdown>
          <PhoneNumber
            buttonLabel={t('requestACallback:buttonLabel')}
            onSuccess={() => configure()}
          />
          <Spacing s={16} />
          {!!callBackContent[1] && (
            <Markdown markdownStyles={closeContactMarkdownStyles}>
              {callBackContent[1]}
            </Markdown>
          )}
          {!!content[1] && (
            <Markdown markdownStyles={closeContactMarkdownStyles}>
              {content[1]}
            </Markdown>
          )}
          <Spacing s={32} />
        </>
      )}
    </Layouts.KeyboardScrollable>
  );
};
