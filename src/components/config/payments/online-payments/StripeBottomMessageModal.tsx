import React from 'react'
import Container from "@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container"
import I18n from "../../../../i18n/i18n"
import KyteText from "@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText"
import { AlertImage } from "../../../../../assets/images"
import { logEvent } from "../../../../integrations"
import BottomMessageModal from "../../../common/BottomMessageModal"
import { connect } from "react-redux"

interface StripeBottomMessageModalProps {
  handleToggleGateway: () => void
  type: string
  isGatewayMP: boolean
  onClose: () => void
  currencyConfig?: { currencySymbol?: string; currencyCode?: string }
}

const StripeBottomMessageModal = ({ handleToggleGateway, type, isGatewayMP, onClose, currencyConfig }: StripeBottomMessageModalProps) => {
  const currencyWarning = {
    title: I18n.t('words.s.attention'),
    actionText: (
      <Container alignItems='center' justifyContent='center' paddingTop={15} paddingBottom={15} paddingLeft={16} paddingRight={16}>
        <KyteText size={15} lineHeight={22.5} textAlign="center">
          {I18n.t('sameCurrencyCatalogAlert')}
        </KyteText>
        <KyteText size={11} lineHeight={17.6} textAlign="center">
          {!currencyConfig
            ? I18n.t('expressions.noCurrencySelected')
            : `${currencyConfig.currencySymbol} (${currencyConfig.currencyCode})`}
        </KyteText>
      </Container>
    ),
    actionButtonText: I18n.t('alertOk'),
    image: AlertImage,
  }

  logEvent('Payment Integration Warning', {
    where: type === 'catalog' ? 'online payment' : 'payment link',
    gateway: isGatewayMP ? 'mercadopago' : 'stripe',
  })

  return (
    <BottomMessageModal
      image={currencyWarning.image || null}
      title={currencyWarning.title}
      modalHeight="50%"
      actionText={currencyWarning.actionText || null}
      actionButtonText={currencyWarning.actionButtonText}
      actionOnClose={() => onClose()}
      actionButtonOnPress={() => {
        onClose()
        handleToggleGateway()
      }}
      onSwipeComplete={() => {
        onClose()
      }}
      nextArrow
      hideSeePlansButton
    />
  )
}

const mapStateToProps = ({ preference }) => ({
  currencyConfig: preference.account.currency || {},
})

export default connect(mapStateToProps)(StripeBottomMessageModal)