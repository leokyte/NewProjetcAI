import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { pixDataConfigSave, saleUpdate } from '../../stores/actions'
import { IBilling, ICurrency, ISale, IStore } from '@kyteapp/kyte-utils'
import { Container, KyteText, Row, Margin, InfoBox, isFree } from '@kyteapp/kyte-ui-components'
import { ActionButton, KyteButton, KyteIcon, KyteSafeAreaView, KyteToolbar } from '../common'
import { colors, scaffolding } from '../../styles'
import {
	formatCurrencyValue,
	kyteCatalogDomain,
	maskValues,
	renderBoldText,
	trackSalePropsEvent,
	trackSaleSavePropsEvent,
} from '../../util'
import QRCode from 'react-qr-code'
import { ScrollView } from 'react-native'
import NavigationService from '../../services/kyte-navigation'
import Share from 'react-native-share'
import I18n from '../../i18n/i18n'
import { ORDER_STATUS_CLOSED, OrderStatus, PaymentType } from '../../enums'
import { logEvent } from '../../integrations'
const KyteToolbarIgnoredType: any = KyteToolbar

const Strings = {
	PAGE_TITLE: I18n.t('paymentQRCodeTitle'),
	PAGE_SUBTITLE: I18n.t('paymentQRCodeSubtitle'),
	ALERT: I18n.t('paymentQRCodeAlert'),
	CONFIRM_BUTTON: I18n.t('confirmPaymentButton'),
	CONCLUDE_BUTTON: I18n.t('concludeSaleButton'),
	SHARE_TITLE: I18n.t('sharePaymentTitle'),
	NAME_PLACEHOLDER: I18n.t('namePlaceholder'),
	KEY_PLACEHOLDER: I18n.t('keyPlaceholder'),
	SHARE_BUTTON: I18n.t('words.s.share'),
	CONCLUDE_LATER_BUTTON: I18n.t('paymentConcludeLaterButton'),
}

type SaleQRCodePaymentProps = {
	currency: ICurrency
	store: IStore
	lastSale: ISale
	billing: IBilling
	saleUpdate: (sale: ISale) => void
}

const SaleQRCodePayment = ({ billing, currency, store, lastSale, saleUpdate }: SaleQRCodePaymentProps) => {
	const isUserFree = isFree(billing)
	const { accountName, key } = store?.pix
	const { value, type } = key
	const pixValueToPay = lastSale.payments.filter((payment) => payment.type === PaymentType.PIX)[0]?.total

	const actionButtonText = !isUserFree
		? `${Strings.CONFIRM_BUTTON} ${formatCurrencyValue(pixValueToPay, currency)}`
		: Strings.CONCLUDE_BUTTON

	const handleShare = () => {
		const orderStatusCatalogURL = `https://${store?.urlFriendly}${kyteCatalogDomain}/orders/${lastSale?.id}`
		logEvent('Order Share', { where: 'pix_checkout_pos', QRCode_create: Boolean(lastSale.qrCode) })
		Share.open({
			title: Strings.SHARE_TITLE,
			message: `${Strings.SHARE_TITLE} ${orderStatusCatalogURL}`,
		})
	}

	const handleNavigateToNewSale = () => {
		const propertiesTrack = trackSaleSavePropsEvent(lastSale)
		logEvent('Order Save', propertiesTrack)
		NavigationService.reset('Receipt', 'Receipt', { origin: 'sale' })
	}

	const handleConfirmPaymentOrConcludeSale = async () => {
		const sale = JSON.parse(JSON.stringify(lastSale))
		const changedSale = {
			...sale,
			status: isUserFree ? ORDER_STATUS_CLOSED : OrderStatus.items[OrderStatus.PAID].status,
			prevStatus: sale.status,
		}

		if (isUserFree) {
			const propertiesTrack = trackSalePropsEvent(changedSale)
			logEvent('Sale Finished', propertiesTrack)
		}

		await saleUpdate(changedSale)
		const navigateTo = isUserFree ? 'Receipt' : 'SalePixPaymentConfirmation'

		NavigationService.navigate(navigateTo, navigateTo === 'Receipt' ? { origin: 'sale' } : undefined)
	}

	useEffect(() => {
		logEvent('Checkout Pix QR Code View')
	}, [])

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
			<ScrollView>
				<Container flex={1} padding={16}>
					<Margin bottom={32} />
					<Container alignItems="center">
						<KyteText weight={500} color={colors.primaryDarker} size={18} textAlign="center">
							{Strings.PAGE_TITLE}
						</KyteText>
						<Margin bottom={8} />
						<KyteText color={colors.primaryDarker} size={14} textAlign="center">
							{Strings.PAGE_SUBTITLE}
						</KyteText>
					</Container>
					<Margin bottom={48} />
					<Container alignItems="center">
						<Row alignItems="center">
							<KyteIcon size={25} name="pix-fill" color={colors.pixColor} />
							<KyteText marginLeft={8} weight={500} color={colors.primaryDarker} size={36}>
								{formatCurrencyValue(pixValueToPay, currency)}
							</KyteText>
						</Row>
						<Margin bottom={16} />
						<KyteText color={colors.primaryDarker} size={16}>
							<KyteText color={colors.primaryDarker} size={16} weight={500}>
								{Strings.NAME_PLACEHOLDER}:{' '}
							</KyteText>
							{accountName}
						</KyteText>
						<Margin bottom={8} />
						<KyteText color={colors.primaryDarker} size={16}>
							<KyteText color={colors.primaryDarker} size={16} weight={500}>
								{Strings.KEY_PLACEHOLDER}:{' '}
							</KyteText>
							{maskValues({ value, pixType: type })}
						</KyteText>
						<Margin bottom={20} />
						<QRCode value={lastSale?.qrCode ?? ''} size={176} />
						<Margin bottom={20} />
						<KyteButton background={colors.actionColor} onPress={handleShare} height={36} width={139}>
							<KyteText
								lineHeight={14}
								allowFontScaling={false}
								weight={500}
								color={colors.white}
								size={14}
								marginRight={6}
							>
								{Strings.SHARE_BUTTON}
							</KyteText>
							<KyteIcon size={20} name="share" color={colors.white} />
						</KyteButton>
					</Container>
					<Margin bottom={40} />
					<InfoBox>
						<KyteText>
							{renderBoldText(Strings.ALERT, { size: 12, color: colors.primaryDarker, lineHeight: 18 })}
						</KyteText>
					</InfoBox>
				</Container>
			</ScrollView>
			<Container paddingBottom={16}>
				<ActionButton cancel onPress={handleNavigateToNewSale} style={{ marginBottom: 16 }} full={undefined}>
					{Strings.CONCLUDE_LATER_BUTTON}
				</ActionButton>
				<ActionButton full={undefined} onPress={handleConfirmPaymentOrConcludeSale}>
					{actionButtonText}
				</ActionButton>
			</Container>
		</KyteSafeAreaView>
	)
}

const mapStateToProps = (state: any) => ({
	store: state.auth.store,
	currency: state.preference.account.currency,
	isOnline: state.offline.online,
	lastSale: state.lastSale,
	billing: state.billing,
	saleUpdate
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

export default connect(mapStateToProps, mapDispatchToProps)(SaleQRCodePayment as any)
