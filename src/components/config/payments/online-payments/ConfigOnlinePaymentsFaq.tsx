import React from "react"
import Container from "@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container"
import Row from "@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row"
import { View } from "react-native"
import KyteText from "@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText"
import Margin from "@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin"
import I18n from "../../../../i18n/i18n"
import { colorsPierChart } from "../../../../styles"

const Strings = {
  CUSTOMER_DONT_NEED_AN_ACCOUNT: I18n.t('automaticPaymentsPage.customersDontNeedAnAccount'),
  PROCESSING_PAYOUTS_STRIPE: I18n.t('automaticPaymentsPage.processingPayoutsStripe'),
  PROCESSING_PAYOUTS_MP: I18n.t('automaticPaymentsPage.processingPayoutsMP')
}

export const ConfigOnlinePaymentsFaq = ({ data, isMP }: { data: any[], isMP: boolean }) => {
  return(
    <Container>
      {data.map((item) => (
        <View>
          <Row>
            <Container width="30%">
              <KyteText size={12} weight={500}>{item.title}</KyteText>
            </Container>
            <Container width="70%">
              <KyteText size={12} lineHeight={18}>{item.description}</KyteText>
            </Container>
          </Row>

          <Margin bottom={16} />
        </View>
      ))}

      <Container
        flex={1}
        paddingTop={4} 
        paddingBottom={4} 
        width="100%" 
        height={66} 
        backgroundColor={colorsPierChart[9]} 
        justifyContent="center" 
        alignItems="center" 
        borderRadius={4}
      >
        <KyteText size={12} weight={500} textAlign="center" lineHeight={18}>{`• ${Strings.CUSTOMER_DONT_NEED_AN_ACCOUNT}`}</KyteText>
        <Margin top={4} />
        <KyteText size={12} weight={500} textAlign="center" lineHeight={18}>{`• ${isMP ? Strings.PROCESSING_PAYOUTS_MP : Strings.PROCESSING_PAYOUTS_STRIPE}`}</KyteText>
      </Container>
    </Container>
  )
}