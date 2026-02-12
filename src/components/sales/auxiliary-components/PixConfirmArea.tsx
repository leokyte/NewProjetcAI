import React, { useState } from 'react'
import { KyteIcon, Row, Margin, KyteText, colors as colorsUI, isFree } from '@kyteapp/kyte-ui-components'
import { TouchableOpacity, View } from 'react-native'
import Share from 'react-native-share'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { kyteGeneratePixQRCode } from '../../../services'
import PixConfirmOrderModal from '../../common/modals/PixConfirmOrderModal'
import { kyteCatalogDomain, statusNames } from '../../../util'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import PixAnimation from '../../common/utilities/PixAnimation'
import LoadingBarAnimation from '../../common/utilities/LoadingBarAnimation'
import { logEvent } from '../../../integrations'
import { PaymentType } from '../../../enums'
import { ISale, IStore, IBilling } from '@kyteapp/kyte-utils'
import { generateQrCode, toggleBillingMessage } from '../../../stores/actions'

interface FuncTextComponentProps {
	text: string
	weight?: number
	size?: number
	style?: any
}

interface PixConfirmAreaProps {
	sale: ISale
	billing?: IBilling
	store?: IStore
	switchOrderStatus: (status: string) => void
	setToastError: (error: string) => void
	errorToast: any
	isOnline: boolean
	onClickWhenIsOffline: () => void
	toggleBillingMessage?: (visibility: boolean, message: string, remoteKey: string) => void
	generateQrCode: any
}

const Strings = {
	t_ready_to_charge: I18n.t('pixOrderArea.readyToCharge'),
	t_qr_code_will_be_displayed: I18n.t('pixOrderArea.qRCodeWillBeDisplayed'),
	t_generating_charge: I18n.t('pixOrderArea.generatingCharge'),
	t_awaiting_payment: I18n.t('pixOrderArea.awaitingPayment'),
	t_share_the_link_with_the_customer: I18n.t('pixOrderArea.shareTheLinkWithTheCustomer'),
	t_and_check_your_banking: I18n.t('pixOrderArea.andCheckYourBanking'),
	t_confirming_payment: I18n.t('pixOrderArea.confirmingPayment'),
	t_youve_confirmed_pix: I18n.t('pixOrderArea.youveConfirmedPix'),
	t_charge: I18n.t('pixOrderArea.charge'),
	t_its_paid: I18n.t('pixOrderArea.itsPaid'),
}

const PixConfirmArea = ({
	billing,
	sale,
	switchOrderStatus,
	setToastError,
	errorToast,
	store,
	isOnline,
	onClickWhenIsOffline,
	toggleBillingMessage,
	generateQrCode,
}: PixConfirmAreaProps) => {
	const [isConfirmingPayment, setIsConfirmingPayment] = useState(false)
	const [isGeneratingQRCode, setIsGeneratingQRCode] = useState(false)
	const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false)
	const [isToShowButton, setIsToShowButton] = useState(false)

	const isFreeAccount = billing && isFree(billing)

	const isConfirmedOrder = (status: string) => status === statusNames.CONFIRMED
	const isPixPaid = (status: string) => status === statusNames.PAID
	const isSaleAwaitingPayment = (status: string) => status === statusNames.AWAITING_PAYMENT

	const [isPaid, setIsPaid] = useState(isPixPaid(sale.status))
	const [isAwaitingPayment, setIsAwaitingPayment] = useState(isSaleAwaitingPayment(sale.status))

	const getTextComponent = ({ text, weight = 500, size = 14, style }: FuncTextComponentProps) => (
		<KyteText
			style={{ maxWidth: '100%', flexWrap: 'wrap', textAlign: 'left', lineHeight: 16, ...style }}
			size={size}
			weight={weight}
		>
			{text}
		</KyteText>
	)

	const initialDescription = getTextComponent({ text: Strings.t_qr_code_will_be_displayed, size: 11, weight: 400 })

	const shareOrderCatalog = () => {
		const orderStatusCatalogURL = `https://${store?.urlFriendly}${kyteCatalogDomain}/orders/${sale?.id}`
		const hasFractionedProduct = sale.items.some((item) => item?.product?.isFractioned)
		const lastStatus =
			sale?.timeline && sale.timeline.length > 0 ? sale.timeline[sale.timeline.length - 1].status : sale?.status

		Share.open({
			title: '',
			message: `${I18n.t('followYourStatusOrder')} ${orderStatusCatalogURL}`,
		})
		logEvent('Order Share', {
			paymentType: PaymentType.items[sale.payments[0].type].description,
			totalNet: sale.totalNet,
			hasCustomer: Boolean(sale.customer),
			hasDiscount: Boolean(sale.discountValue || sale.discountPercent),
			itemsAmount: sale.items.length,
			isOnHold: sale.status === statusNames.OPENED,
			hasObservation: Boolean(sale.observation),
			isQuickSale: sale.items.some(({ product }) => !product),
			hasFractionedProduct,
			hasTaxes: Boolean(sale.totalTaxes),
			hasSplitPayment: sale.payments.length > 1,
			hasChange: (sale.payBack ?? 0) > 0,
			status: lastStatus,
			where: 'pix_order_link',
			QRCode_create: true,
		})
	}

	const awaitingPaymentDescription = (
		<TouchableOpacity onPress={shareOrderCatalog}>
			{getTextComponent({
				text: Strings.t_share_the_link_with_the_customer,
				style: { textDecorationLine: 'underline', color: colors.actionColor },
				weight: 400,
				size: 11,
			})}
			{getTextComponent({
				text: Strings.t_and_check_your_banking,
				style: { color: colors.primaryBg, textDecoration: 'none' },
				weight: 400,
				size: 11,
			})}
		</TouchableOpacity>
	)

	const youveConfirmedPixTitle = (
		<Row alignItems="center">
			{getTextComponent({
				text: Strings.t_youve_confirmed_pix,
			})}
			<Margin right={6} />
			<KyteIcon name="check" size={14} color={colors.actionColor} />
		</Row>
	)

	const handleAwaitingClickButton = () => {
		if (isFreeAccount) return toggleBillingMessage?.(true, 'Pro', 'featureCustomStatus')
		if (!isOnline) return onClickWhenIsOffline()

		logEvent('QRCode Payment Click')
		setIsConfirmingPayment(true)
		setIsToShowButton(false)
		setTimeout(() => {
			setIsConfirmingPayment(false)
			setIsPaid(true)
			switchOrderStatus(statusNames.PAID)
		}, 3000)
	}

	const handleGeneratePixQRCode = async () => {
		logEvent('Order QRCode Create Click')
		generateQrCode({
			sale,
			callback: (error: any) => {
				setIsGeneratingQRCode(false)

				if (error) {
					logEvent('QRCode Create Failure', { where: 'order_detail', error: error.message })
					setToastError(errorToast)
					return
				}
				const lastStatus =
					sale?.timeline && sale.timeline.length > 0 ? sale.timeline[sale.timeline.length - 1].status : sale?.status
				setIsAwaitingPayment(true)
				logEvent('QRCode Create', { where: 'order_detail' })
				logEvent('Order Status Change', { status: lastStatus })
				logEvent('Order Confirmation QR Code Create Warning')
			},
		})
	}

	const handleInitialClickButton = () => {
		if (!isOnline) return onClickWhenIsOffline()

		if (isConfirmedOrder(sale.status)) {
			setIsGeneratingQRCode(true)
			return handleGeneratePixQRCode()
		}
		return setShowConfirmOrderModal(true)
	}

	const commonProps = {
		showButton: false,
		description: null,
		clickButton: () => null,
		buttonTitle: null,
		isButtonDisabled: null,
	}

	const pixAreaData = {
		awaiting: {
			title: (
				<TouchableOpacity onPress={shareOrderCatalog}>
					{getTextComponent({ text: Strings.t_awaiting_payment })}
				</TouchableOpacity>
			),
			description: awaitingPaymentDescription,
			showButton: true,
			buttonTitle: Strings.t_its_paid,
			clickButton: () => handleAwaitingClickButton(),
			isButtonDisabled: !isOnline || isFreeAccount,
		},
		paid: {
			title: youveConfirmedPixTitle,
			...commonProps,
		},
		initial: {
			title: getTextComponent({ text: Strings.t_ready_to_charge }),
			description: initialDescription,
			showButton: true,
			buttonTitle: Strings.t_charge,
			clickButton: () => handleInitialClickButton(),
			isButtonDisabled: !isOnline,
		},
		generating: {
			title: getTextComponent({ text: Strings.t_generating_charge }),
			...commonProps,
		},
		confirming: {
			title: getTextComponent({ text: Strings.t_confirming_payment }),
			...commonProps,
		},
	}

	const getPixData = (isGenerating: boolean, isConfirming: boolean, isPaidStatus: boolean, isAwaiting: boolean) => {
		switch (true) {
			case isGenerating:
				return pixAreaData.generating
			case isConfirming:
				return pixAreaData.confirming
			case isPaidStatus:
				return pixAreaData.paid
			case isAwaiting:
				return pixAreaData.awaiting
			default:
				return pixAreaData.initial
		}
	}

	const { title, description, showButton, clickButton, buttonTitle, isButtonDisabled } = getPixData(
		isGeneratingQRCode,
		isConfirmingPayment,
		isPaid,
		isAwaitingPayment
	)

	const handleConfirmOrder = () => {
		setShowConfirmOrderModal(false)
		setIsGeneratingQRCode(true)
		handleGeneratePixQRCode()
	}

	return (
		<Row style={styles.pixMainContainer(isToShowButton)}>
			{isAwaitingPayment && !isConfirmingPayment && !isPaid ? (
				<PixAnimation />
			) : (
				<KyteIcon name="pix-fill" size={20} color={colorsUI.pixColor} />
			)}

			<Margin right={12} />

			<View style={{ flexShrink: 1 }}>
				{title}
				{description}
			</View>
			{showButton && (
				<TouchableOpacity
					style={{
						height: 36,
						width: 110,
						alignSelf: 'center',
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: isButtonDisabled ? colorsUI.disable03 : colors.actionColor,
						borderRadius: 4,
					}}
					onPress={clickButton}
				>
					<KyteText weight={500} size={14} marginBottom={2} color={isButtonDisabled ? colors.disabled : colors.white}>
						{buttonTitle}
					</KyteText>
				</TouchableOpacity>
			)}
			{(isGeneratingQRCode || isConfirmingPayment) && (
				<LoadingBarAnimation isGeneratingQRCode={isGeneratingQRCode || isConfirmingPayment} />
			)}

			<PixConfirmOrderModal
				isVisible={showConfirmOrderModal}
				hideModal={() => setShowConfirmOrderModal(false)}
				onConfirm={handleConfirmOrder}
			/>
		</Row>
	)
}

const styles = {
	pixMainContainer: (isWithSpaceBetween: boolean) => ({
		width: '100%',
		minHeight: 71,
		alignItems: 'center',
		justifyContent: isWithSpaceBetween ? 'space-between' : 'flex-start',
		paddingHorizontal: 16,
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 8,
	}),
	loadingBar: {
		position: 'absolute',
		bottom: 0,
		height: 4,
		backgroundColor: colors.actionLighter,
		borderRadius: 2,
	},
}

const mapStateToProps = (state: any) => ({
	store: state.auth.store,
	billing: state.billing,
})

const mapDispatchToProps = (dispatch: any) => ({
	...bindActionCreators(
		{
			toggleBillingMessage,
			generateQrCode,
		},
		dispatch
	),
})

export default connect(mapStateToProps, mapDispatchToProps)(PixConfirmArea as any)
