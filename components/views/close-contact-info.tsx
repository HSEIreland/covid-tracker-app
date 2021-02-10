import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';

import {useDbText} from '../../providers/settings';

import {Spacing} from '../atoms/layout';
import {Markdown, closeContactMarkdownStyles} from '../atoms/markdown';

import Layouts from '../../theme/layouts';

export const CloseContactInfo: FC<any> = () => {
  const {t} = useTranslation();
  const {closeContactInfo} = useDbText();

  return (
    <Layouts.Scrollable heading={t('closeContactInfo:title')}>
      <Markdown markdownStyles={closeContactMarkdownStyles}>
        {closeContactInfo}
      </Markdown>
      <Spacing s={32} />
    </Layouts.Scrollable>
  );
};
