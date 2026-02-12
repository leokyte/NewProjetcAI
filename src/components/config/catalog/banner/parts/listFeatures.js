import React from 'react';
import { KyteText } from '@kyteapp/kyte-ui-components';

import { colors } from '../../../../../styles';
import I18n from '../../../../../i18n/i18n';

export const listFeatures = [
  {
    title: I18n.t('catalog.banner.listFeatures.title.part1'),
    description: (
      <KyteText color={colors.secondaryBg} size={12}>
        {I18n.t('catalog.banner.listFeatures.text1.part1')}{' '}
        <KyteText color={colors.secondaryBg} size={12} weight={500}>
          {I18n.t('catalog.banner.listFeatures.text1.part2')}
        </KyteText>
        .
      </KyteText>
    ),
  },
  {
    title: I18n.t('catalog.banner.listFeatures.title.part2'),
    description: (
      <KyteText color={colors.secondaryBg} size={12}>
        {I18n.t('catalog.banner.listFeatures.text2.part1')}{' '}
        <KyteText color={colors.secondaryBg} size={12} weight={500}>
          {I18n.t('catalog.banner.listFeatures.text2.part2')}{' '}
        </KyteText>
        {I18n.t('catalog.banner.listFeatures.text2.part3')}{' '}
        <KyteText color={colors.secondaryBg} size={12} weight={500}>
          {I18n.t('catalog.banner.listFeatures.text2.part4')}
        </KyteText>
        .
      </KyteText>
    ),
  },
  {
    title: I18n.t('catalog.banner.listFeatures.title.part3'),
    description: (
      <KyteText color={colors.secondaryBg} size={12}>
        {I18n.t('catalog.banner.listFeatures.text3.part1')}{' '}
        <KyteText color={colors.secondaryBg} size={12} weight={500}>
          {I18n.t('catalog.banner.listFeatures.text3.part2')}{' '}
        </KyteText>
        {I18n.t('catalog.banner.listFeatures.text3.part3')}{' '}
        <KyteText color={colors.secondaryBg} size={12} weight={500}>
          {I18n.t('catalog.banner.listFeatures.text3.part4')}
        </KyteText>
        .
      </KyteText>
    ),
  },
];
