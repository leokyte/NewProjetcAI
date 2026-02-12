import React from 'react'
import { bindActionCreators } from 'redux'
import I18n from '../../i18n/i18n'
import { saleSave } from '../../stores/actions'
import { ActionButton } from '../common'
import { connect } from 'react-redux'
import { ICurrency, ISale } from '@kyteapp/kyte-utils'
import { OrderStatus, PaymentType } from '../../enums'
import NavigationService from '../../services/kyte-navigation'
import { Alert } from 'react-native'
import { formatCurrencyValue } from '../../util'
import { logEvent } from '../../integrations'

interface GenerateQRCodeButtonProps {
	currentSale: ISale
	isSplitCheckout?: boolean
	disabled?: boolean
	isOnline: boolean
	currency: ICurrency
	hasApiError: boolean
	saleSave: ({ currentSale, cb, isPixGenerate }: { currentSale: ISale; cb: () => void; isPixGenerate: boolean }) => void
}

const GenerateQRCodeButton = ({
	currentSale,
	disabled = false,
	isOnline,
	saleSave,
	isSplitCheckout = false,
	currency,
	hasApiError,
}: GenerateQRCodeButtonProps) => {
	const buttonText = isSplitCheckout ? I18n.t('generatePixButtonSplit') : I18n.t('confirmAndGeneratePixButton')
	const isConfirmedSale = currentSale?.timeline?.some((item) => item?.status === 'confirmed')
	const isOrder = !!currentSale?.id
	const pixValueToPay = currentSale?.payments.filter((payment) => payment.type === PaymentType.PIX)[0]?.total

	const generateQrCode = async () => {
		if (!isOnline) {
			Alert.alert(I18n.t('offlineMessage.title'), I18n.t('offlineMessage.pixGenerateAlert'), [
				{ text: I18n.t('alertOk') },
			])
			return
		}
		logEvent("Checkout QR Code Create Click")

		const timeline = isOrder
			? [
					...(isOrder && currentSale.timeline),
					{
						status: 'confirmed',
						timeStamp: new Date(),
						alias: 'confirmado',
						color: '#2dd1ac',
						active: true,
						isDefault: true,
					},
			  ]
			: [
					{
						status: 'opened',
						timeStamp: new Date(),
						alias: 'pendente',
						color: '#4d5461',
						active: true,
						isDefault: true,
					},
					{
						status: 'confirmed',
						timeStamp: new Date(),
						alias: 'confirmado',
						color: '#2dd1ac',
						active: true,
						isDefault: true,
					},
			  ]

		const sale = {
			...currentSale,
			status: OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status,
			timeline: isConfirmedSale ? currentSale?.timeline : timeline,
			generateQRCode: true,
		}

		saleSave({
			currentSale: sale as ISale,
			isPixGenerate: true,
			cb: () => {
				if(hasApiError) {
					return logEvent("QR Code Create Failure", { where: "checkout_pos", error: "API Error" })
				}
				NavigationService.navigate('SaleQRCodePayment')
				logEvent("QR Code Create", { where: "checkout_pos" })
			},
		})
	}
	return (
		<ActionButton
			full={true}
			alertTitle={I18n.t('generatePixButtonSplitAlertTitle')}
			alertDescription={I18n.t('generatePixButtonSplitAlert')}
			disabled={disabled}
			borderedDisabled={disabled}
			onPress={generateQrCode}
			cancel
			style={{
				marginBottom: 16,
				padding: 12,
				height: 'auto',
				minHeight: 48,
			}}
		>
			{isConfirmedSale ? I18n.t('generatePixButton') : buttonText}{' '}
			{isSplitCheckout ? `${I18n.t('pixPaymentFor')} ${formatCurrencyValue(pixValueToPay, currency)}` : null}
		</ActionButton>
	)
}

const mapStateToProps = ({ currentSale, offline, preference, common }: any) => ({
	currentSale: currentSale,
	isOnline: offline.online,
	currency: preference.account.currency,
	hasApiError: common.hasApiError,
})

const mapDispatchToProps = (dispatch: any) => ({
	...bindActionCreators(
		{
			saleSave,
		},
		dispatch
	),
})

export default connect(mapStateToProps, mapDispatchToProps)(GenerateQRCodeButton as any)
