import React from 'react'
import Row from "@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row";
import Margin from "@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin";
import KyteText from "@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText";
import { colors } from '../../../../../styles';

interface OnlinePaymentPlaceholderProps {
  text: string;
  image: JSX.Element;
}

export const OnlinePaymentPlaceholder = ({ text, image }: OnlinePaymentPlaceholderProps) => (
  <Row alignItems="center">
    <Margin top={2} />
    <KyteText lineHeight={25} size={11} weight="Semibold" color={colors.actionColor}>
      {text}
    </KyteText>
    <Margin left={2} />
    {image}
  </Row>
)