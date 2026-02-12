import React from 'react';
import { Container, KyteText } from '@kyteapp/kyte-ui-components';
import { colors } from '../../styles';

interface KyteTagProps { 
  text?: string;
  style?: React.CSSProperties;
}

export const KyteTag = ({ style = {}, text }: KyteTagProps) => (
    <Container borderRadius={24} borderColor={colors.green01} borderWidth={1} padding={6} style={{ ...style }}>
      <KyteText color={colors.green01} size={10} weight="Semibold">
        {text}
      </KyteText>
    </Container>
  );
