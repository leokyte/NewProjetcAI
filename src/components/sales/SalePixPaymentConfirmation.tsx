import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { pixDataConfigSave, saleUpdate } from '../../stores/actions'
import { ICurrency, ISale } from '@kyteapp/kyte-utils'
import { Container, KyteText, Margin } from '@kyteapp/kyte-ui-components'
import { ActionButton, KyteIcon, KyteSafeAreaView, KyteToolbar } from '../common'
import { colors, scaffolding } from '../../styles'
import { ScrollView } from 'react-native'
import NavigationService from '../../services/kyte-navigation'
import I18n from '../../i18n/i18n'
import { formatCurrencyValue, trackSalePropsEvent, trackSaleSavePropsEvent } from '../../util'
import { ORDER_STATUS_CLOSED, PaymentType } from '../../enums'
import { logEvent } from '../../integrations'
const KyteToolbarIgnoredType: any = KyteToolbar

const Strings = {
	PAGE_TITLE: I18n.t('pixPaymentConfirmationTitle'),
	CONCLUDE_BUTTON: I18n.t('concludeSaleButton'),
	CONCLUDE_LATER_BUTTON: I18n.t('saveSaleButtonAsPaid'),
}

type SaleQRCodePaymentProps = {
	currency: ICurrency
	lastSale: ISale
	saleUpdate: (sale: ISale) => void
}

const SalePixPaymentConfirmation = ({ currency, lastSale, saleUpdate }: SaleQRCodePaymentProps) => {
	const pixValueToPay = lastSale.payments.filter((payment) => payment.type === PaymentType.PIX)[0]?.total

	const handleNavigateToNewSale = () => {
		const propertiesTrack = trackSaleSavePropsEvent(lastSale)
		logEvent('Order Save', propertiesTrack)
		NavigationService.navigate('Receipt', 'Receipt', { origin: 'sale' })
	}

	const handleConcludeSale = async () => {
		const sale = JSON.parse(JSON.stringify(lastSale))
		const changedSale = {
			...sale,
			status: ORDER_STATUS_CLOSED,
			prevStatus: sale.status,
		}

		const propertiesTrack = trackSalePropsEvent(changedSale)
		logEvent('Sale Finished', propertiesTrack)
		await saleUpdate(changedSale)
		NavigationService.navigate('Receipt', 'Receipt', { origin: 'sale' })
	}

	return (
		<KyteSafeAreaView style={scaffolding.outerContainer}>
			<KyteToolbarIgnoredType
				innerPage
				style={{
					height: 0,
				}}
				borderBottom={0}
				rightButtons={null}
			/>
			<ScrollView
				contentContainerStyle={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Container flex={1} padding={16} alignItems="center" justifyContent="center">
					<KyteIcon name="pix-fill" color={colors.pixColor} size={48} />
					<Margin bottom={24} />
					<KyteText size={22} weight={500} color={colors.primaryDarker}>
						{Strings.PAGE_TITLE}
					</KyteText>
					<Margin bottom={4} />
					<KyteText size={32} lineHeight={44} weight={300} color={colors.primaryDarker}>
						{formatCurrencyValue(pixValueToPay, currency)}
					</KyteText>
				</Container>
			</ScrollView>
			<Container paddingBottom={16}>
				<ActionButton
					leftIcon={<KyteIcon name="dollar-sign" color={colors.actionColor} size={24} />}
					cancel
					onPress={handleNavigateToNewSale}
					style={{ marginBottom: 16 }}
					full={undefined}
				>
					{Strings.CONCLUDE_LATER_BUTTON}
				</ActionButton>
				<ActionButton full={undefined} onPress={handleConcludeSale}>
					{Strings.CONCLUDE_BUTTON}
				</ActionButton>
			</Container>
		</KyteSafeAreaView>
	)
}

const mapStateToProps = (state: any) => ({
	currency: state.preference.account.currency,
	lastSale: state.lastSale,
})

const mapDispatchToProps = (dispatch: any) => ({
	...bindActionCreators(
		{
			pixDataConfigSave,
			saleUpdate
		},
		dispatch
	),
})

export default connect(mapStateToProps, mapDispatchToProps)(SalePixPaymentConfirmation as any)
