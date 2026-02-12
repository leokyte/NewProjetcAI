import React from 'react'
import Row from "@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row";
import KyteText from "@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText";
import { KyteTagNew } from "../../../../common";
import I18n from "../../../../../i18n/i18n";
import { colors } from '../../../../../styles';
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container';
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin';

interface OnlinePaymentSwitchTitleProps {
  text: string;
}

export const OnlinePaymentSwitchTitle = ({ text }: OnlinePaymentSwitchTitleProps) => (
  <Row alignItems="center" justifyContent='space-between'>
    <KyteText size={12} weight="Semibold" pallete="primaryDarker">
      {text}
    </KyteText>
    <Margin right={4} />
    <KyteTagNew
      icon="star-stroke"
      text={I18n.t("recommended").toUpperCase()}
      style={{ backgroundColor: colors.pinkLight }} 
      textProps={{ color: colors.pinkPrimary }} 
    />
  </Row>
)