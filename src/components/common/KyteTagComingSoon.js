import React from 'react';
import { Container } from '@kyteapp/kyte-ui-components';
import { KyteText } from '.';
import I18n from '../../i18n/i18n';
import { colors } from '../../styles';

export const KyteTagComingSoon = ({ style = {} }) => (
    <Container borderRadius={24} borderColor={colors.actionColor} borderWidth={1} padding={6} style={{ ...style }}>
      <KyteText color={colors.actionColor} size={10} weight="Semibold">
      {I18n.t('words.s.comingSoon').toUpperCase()}
      </KyteText>
    </Container>
  );
