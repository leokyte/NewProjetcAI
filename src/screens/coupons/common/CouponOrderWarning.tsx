import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import React from 'react'
import AlertBox from '../../../components/common/content/AlertBox'
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row'
import { KyteIcon } from '../../../components/common'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import I18n from '../../../i18n/i18n'

export const CouponOrderWarning = () => (
  <Container width='100%'>
    <AlertBox type='info'>
      <Row alignItems='center'>
        <KyteIcon name="warning" size={18} />
        <Margin left={12} />
        <Container style={{ flex: 1, minWidth: 0 }}>
          <KyteText size={13} weight={500} lineHeight={19.5}>
            {I18n.t("words.s.attention")}
          </KyteText>
          <KyteText 
            size={11} 
            lineHeight={19.5}
            style={{
              flexWrap: 'wrap',
              flexShrink: 1,   
            }}>
            {I18n.t("coupons.orderWarning")}
          </KyteText>
        </Container>
      </Row>
    </AlertBox>
  </Container>
)