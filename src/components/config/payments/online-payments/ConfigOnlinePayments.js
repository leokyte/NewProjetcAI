import React, { useEffect, useState } from 'react'
import { Alert, Image, Platform, ScrollView, View } from 'react-native'
import { connect } from 'react-redux'
import { startCase, remove } from 'lodash'
import { KyteSwitch } from '@kyteapp/kyte-ui-components'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import {
	ActionButton,
	CustomKeyboardAvoidingView,
	DetailPage,
	KyteIcon,
	KyteText,
	LoadingCleanScreen,
	SwitchContainer,
	TextButton,
} from '../../../common'
import { storeAccountSave, updatePaymentGateways } from '../../../../stores/actions'
import { setCheckoutGatewayServiceType } from '../../../../stores/actions/ExternalPaymentsActions'
import { colors, colorSet, colorsPierChart, scaffolding, Type } from '../../../../styles'
import { GatewayPaymentTypeEnum } from '../../../../enums'
import I18n from '../../../../i18n/i18n'
import { MercadoPagoWithName, StripeConnect } from '../../../../../assets/images'
import MessageModal from './MessageModal'
import { logEvent } from '../../../../integrations'
import { renderBoldText, toggleGateway, updateGatewaySettings } from '../../../../util'
import StripeBottomMessageModal from './StripeBottomMessageModal'

const Strings = {
	ONLINE_PAYMENTS: I18n.t('automaticPaymentsPage.title'),
	ONLINE_PAYMENTS_SUBTITLE: I18n.t('catalogConfig.onlinePayments.description'),
	LINK_PAYMENTS: I18n.t('paymentMethods.link'),
	LINK_PAYMENTS_SUBTITLE: I18n.t('integratedPayments.linkConfigSubtitle'),
	TAX: I18n.t('words.s.tax'),
	PER_TRANSACTION: I18n.t('catalogConfig.perTransaction'),
	RECEIVEMENT: I18n.t('expressions.receivement'),
	RECEIVEMENT_DAYS: I18n.t('expressions.receivementDays.p'),
	ACCEPTED_TYPES: I18n.t('expressions.acceptedTypes'),
	ACCEPTED_INSTALLMENTS: I18n.t('expressions.acceptedInstallments'),
	PAYMENT_PROCESSING: I18n.t('expressions.paymentProcessment'),
	LINKED_ACCOUNT_MESSAGE: I18n.t('integratedPayments.accountLinkedSuccesfully'),
	EXIT: I18n.t('sideMenu.exit'),
	PAYMENTS_ALERT: I18n.t('catalogConfig.noPaymentsAlert'),
	DEACTIVATE_ONLINE_PAYMENTS_MSG: I18n.t('integratedPayments.deactivateOnlinePayments'),
	ACTIVATE_ONLINE_PAYMENTS_MSG: I18n.t('integratedPayments.activateOnlinePayments'),
	UNLINK_ACCOUNT_TITLE: I18n.t('integratedPayments.unlinkAccountTitle'),
	UNLINK_ACCOUNT_MESSAGE: I18n.t('integratedPayments.unlinkAccountText'),
	UNLINK_ACCOUNT_MESSAGE_STRIPE: I18n.t('integratedPayments.unlinkAccountTextStripe'),
	CONTINUE_SALE: I18n.t('expressions.continueSale'),
	INTERNATIONAL_CREDIT_CARDS: I18n.t('expressions.internationalCreditCards'),
	CREDIT_CARD: I18n.t('paymentMethods.creditCard'),
	AUTH_TITLE: I18n.t('words.s.authentication'),
	TAX_LABEL: I18n.t('words.s.tax'),
	RECEIVEMENTS_LABEL: I18n.t('words.s.receivement'),
	PAYMENT_TYPE_LABEL: I18n.t('words.s.paymentType'),
	INSTALLMENT_LABEL: I18n.t('words.s.installment'),
	RECEIVEMENTS_MESSAGE: `$x ${I18n.t('words.p.days')}`,
	NO_CURRENCY_SELECTED: I18n.t('expressions.noCurrencySelected'),
	ATTENTION: I18n.t('words.s.attention'),
	CURRENCY_ALERT: I18n.t('sameCurrencyCatalogAlert'),
	OK: I18n.t('alertOk'),
	MP_ONLINE_PAYMENTS_SUBTITLE: I18n.t('automaticPaymentsPage.mp.subtitle')
}

const MercadoPagoStrings = {
	TAX_MESSAGE: I18n.t('mercadoPagoGateway.tax'),
	RECEIVEMENTS_MESSAGE: I18n.t('mercadoPagoGateway.receivement'),
	PAYMENT_TYPES_MESSAGE: I18n.t('mercadoPagoGateway.paymentType'),
	INSTALLMENTS_MESSAGE: I18n.t('mercadoPagoGateway.installment'),
}

const GatewayImages = {
	'mercadopago-online': {
		src: MercadoPagoWithName,
		width: 80,
		height: 20,
	},
	'stripe-connect': {
		src: StripeConnect,
		width: 48,
		height: 20,
	},
}

const ConfigOnlinePayments = (props) => {
	const { params = {} } = props.route
	const { type = 'catalog', gateway = GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE, isFromSale = false } = params
	const { countryFees, catalog } = props
	const payments = catalog ? catalog.payments : []
	const isOtherPaymentsActive = payments.find((p) => p.active)
	const isMPGateway = gateway === GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE

	const logEventProps = {
		where: type === 'catalog' ? 'online payment' : 'payment link',
		gateway: isMPGateway ? 'mercadopago' : 'stripe',
	}

	useEffect(() => {
		props.setCheckoutGatewayServiceType(type)
		logEvent('Payment Integration Config View', logEventProps)
	}, [])

	const gatewayInfo = props.gatewaysCheckoutList.find((g) => g.key === gateway)
	const pageTitle = type === 'catalog' ? Strings.ONLINE_PAYMENTS : Strings.LINK_PAYMENTS
	const checkoutGateways = props.storeConfig.checkoutGateways || []

	const hasGateway = checkoutGateways.length > 0 ? checkoutGateways.find((c) => c.key === gateway) : null
	const hasService =
		!!hasGateway && hasGateway.services.length > 0 ? hasGateway.services.find((s) => s.type === type) : null

	const selectOneAlert = () => {
		Alert.alert(I18n.t('words.s.attention'), Strings.PAYMENTS_ALERT, [{ text: I18n.t('alertOk') }])
	}

	const [isMsgModalVisible, setMsgModalVisibility] = useState(false)
	const [isBottomMessageModalVisible, setBottomMessageModalVisible] = useState(false)

	const renderSwitchSection = (sectionDetails, containerStyle, sectionStyle = null) => {
		const { switchSection, switchSectionContainer, switchTitleStyle } = styles
		const { title, titleStyle, description, descriptionStyle, onPressAction, stateListener, disableActiveBorder } =
			sectionDetails

		return (
			<View style={[switchSection(!disableActiveBorder), sectionStyle]}>
				<SwitchContainer
					title={title}
					titleStyle={[switchTitleStyle, titleStyle]}
					description={description}
					descriptionStyle={descriptionStyle}
					onPress={onPressAction}
					style={[switchSectionContainer, containerStyle]}
				>
					<KyteSwitch
						onValueChange={onPressAction}
						active={stateListener}
					/>
				</SwitchContainer>
			</View>
		)
	}

	const generateGatewayTaxes = () => {
		if (isMPGateway) {
			return MercadoPagoStrings.TAX_MESSAGE.replace('$x', countryFees.feestaxes.nationalCreditCardPercentage).replace(
				'$y',
				countryFees.feestaxes.bankTransferPercentage
			)
		}

		let taxes = `${Strings.CREDIT_CARD}: ${countryFees.feestaxes.nationalCreditCardPercentage}`
		if (countryFees.feestaxes.nationalCreditCardFee) {
			taxes += ` + ${countryFees.feestaxes.nationalCreditCardFee} ${Strings.PER_TRANSACTION}`
		}
		if (countryFees.feestaxes.internationalCreditCardPercentage) {
			taxes += ` | ${Strings.INTERNATIONAL_CREDIT_CARDS.replace(
				'$x',
				countryFees.feestaxes.internationalCreditCardPercentage
			)}`
		}
		if (countryFees.feestaxes.internationalCreditCardFee) {
			taxes += ` + ${countryFees.feestaxes.internationalCreditCardFee} ${Strings.PER_TRANSACTION}`
		}
		return taxes
	}

	const generateGatewayReceivements = () => {
		if (isMPGateway) {
			return MercadoPagoStrings.RECEIVEMENTS_MESSAGE.replace('$x', countryFees.receivementDays)
		}

		return Strings.RECEIVEMENTS_MESSAGE.replace('$x', countryFees.receivementDays)
	}

	const generateGatewayPaymentTypes = () => {
		if (isMPGateway) {
			return MercadoPagoStrings.PAYMENT_TYPES_MESSAGE
		}
		return countryFees.acceptedCards.map((ac) => startCase(ac)).join(', ')
	}

	const generateGatewayInstallments = () => {
		if (isMPGateway) {
			return MercadoPagoStrings.INSTALLMENTS_MESSAGE
		}
		return ''
	}

	const renderConfig = () => {
		const isServiceActive =
			!!hasGateway &&
			hasGateway.active &&
			hasGateway.services.length > 0 &&
			!!hasGateway.services.find((s) => s.type === type && s.active)

		const renderGatewayInfo = (title, description) => (
			<View style={styles.gatewayInfoContainer}>
				<Container width="30%" padding={16}>
					<KyteText weight={500} pallete="primaryDarker" size={12} lineHeight={18}>
						{title}
					</KyteText>
				</Container>
				<Container width="70%" padding={16}>
					<KyteText weight={400} pallete="primaryBg" size={11} lineHeight={16}>
						{description}
					</KyteText>
				</Container>
			</View>
		)

		const stripeOrMPSubtitle = isMPGateway ? renderBoldText(Strings.MP_ONLINE_PAYMENTS_SUBTITLE) : Strings.ONLINE_PAYMENTS_SUBTITLE
		const gatewaySwitch = {
			title: (
				<View style={styles.gatewaySwitchContainer}>
					<KyteIcon name={type === 'link' ? 'link' : 'cart'} color={colors.secondaryBg} size={20} />
					<KyteText size={15} weight={500} style={{ paddingLeft: 10 }}>
						{gatewayInfo.title}
					</KyteText>
					<Image
						style={[
							styles.gatewayInfoImage,
							{ height: GatewayImages[gateway].height, width: GatewayImages[gateway].width },
						]}
						source={{ uri: GatewayImages[gateway].src }}
					/>
				</View>
			),
			description: (
				<KyteText style={styles.allowOnlinePaymentDesc}>
					{type === 'link' ? Strings.LINK_PAYMENTS_SUBTITLE : stripeOrMPSubtitle}
					{!isMPGateway && <KyteText weight="Medium"> {gatewayInfo.title}</KyteText>}
				</KyteText>
			),
			onPressAction: () => {
				if (Boolean(!hasGateway) && !isServiceActive) {
					logEvent('Payment Integration Start', logEventProps)
				}

				if (gateway === GatewayPaymentTypeEnum.STRIPE_CONNECT) {
					return setBottomMessageModalVisible(true)
				}

				handleToggleGateway(gatewayInfo)
			},
			stateListener: isServiceActive,
			disableActiveBorder: true,
		}

		const gatewayProcessmentInfo = (
			<KyteText pallete="grayBlue" style={styles.gatewayProcessmentInfo}>
				{Strings.PAYMENT_PROCESSING}{' '}
				<KyteText pallete="grayBlue" weight="SemiBold">
					{gatewayInfo.title}
				</KyteText>
				.
			</KyteText>
		)

		return [
			renderSwitchSection(gatewaySwitch),
			renderGatewayInfo(Strings.TAX_LABEL, generateGatewayTaxes()),
			countryFees.receivementDays ? renderGatewayInfo(Strings.RECEIVEMENTS_LABEL, generateGatewayReceivements()) : null,
			countryFees.acceptedCards ? renderGatewayInfo(Strings.PAYMENT_TYPE_LABEL, generateGatewayPaymentTypes()) : null,
			countryFees.installments ? renderGatewayInfo(Strings.INSTALLMENT_LABEL, generateGatewayInstallments()) : null,
			gatewayProcessmentInfo,
		]
	}
	const handleToggleGateway = (gateway) => {
		const payments = props.storeConfig.catalog.payments || [];
		const hasOtherPaymentsActive = payments.some(p => p.active);

		toggleGateway({
			gatewayKey: gateway.key,
			store: props.storeConfig,
			hasOtherPaymentsActive,
			selectOneAlert,
			storeAccountSave: props.storeAccountSave,
			updatePaymentGateways: props.updatePaymentGateways,
			serviceType: type
		});
	}

	const unlinkAccount = () => {
		logEvent('Payment Integration Uninstall Click', logEventProps)

		Alert.alert(
			I18n.t('words.s.attention'), 
			isMPGateway ? Strings.UNLINK_ACCOUNT_MESSAGE : Strings.UNLINK_ACCOUNT_MESSAGE_STRIPE,
			[
				{ text: I18n.t('alertDismiss') },
				{
					text: I18n.t('alertConfirm'),
					onPress: () => {
						if (!isOtherPaymentsActive) return selectOneAlert()

						const { storeConfig } = props
						const editCheckoutGateways = checkoutGateways
						remove(editCheckoutGateways, (c) => c.key === gateway)
						updateGatewaySettings({ ...storeConfig, checkoutGateways: editCheckoutGateways }, props.storeAccountSave, props.updatePaymentGateways)
						logEvent('Payment Integration Uninstall', logEventProps)
						props.navigation.goBack()

					},
				},
		])
	}
	const renderLinkedAccountMessage = () => (
		<View style={styles.linkedAccountContainer}>
			<KyteText style={{ flex: 1 }} color="#FFF" weight="Medium">
				{Strings.LINKED_ACCOUNT_MESSAGE}
			</KyteText>
			<TextButton color={colors.actionColor} weight="Medium" onPress={() => unlinkAccount()}>
				{Strings.EXIT}
			</TextButton>
		</View>
	)

	const renderMsgModal = () => (
		<MessageModal isModalVisible={isMsgModalVisible} hideModal={() => setMsgModalVisibility(false)} />
	)

	const renderGoToSaleButton = () => (
		<View style={scaffolding.bottomContainer}>
			<ActionButton
				alertDescription={I18n.t('receiptShareFieldValidate.empty')}
				onPress={() => props.navigation.goBack()}
			>
				{Strings.CONTINUE_SALE}
			</ActionButton>
		</View>
	)

	return (
		<DetailPage pageTitle={pageTitle} goBack={() => props.navigation.goBack()}>
			<CustomKeyboardAvoidingView style={styles.container}>
				<ScrollView>
					{!!hasGateway && hasGateway.active ? renderLinkedAccountMessage() : null}
					<Container paddingBottom={24} backgroundColor={colors.white}>{renderConfig()}</Container>
				</ScrollView>
				{isFromSale && !!hasGateway && hasGateway.active && hasService && hasService.active
					? renderGoToSaleButton()
					: null}
			</CustomKeyboardAvoidingView>
			{props.isLoaderVisible ? <LoadingCleanScreen /> : null}
			{isBottomMessageModalVisible ? 
				<StripeBottomMessageModal
					isGatewayMP={isMPGateway} 
					onClose={() => setBottomMessageModalVisible(false)}
					handleToggleGateway={handleToggleGateway}
					type={type}
				/> 
			: null}
			{renderMsgModal()}
		</DetailPage>
	)
}

const styles = {
	container: {
		flex: 1,
		backgroundColor: colorsPierChart[9],
	},
	switchSection: (withBorder = true) => ({
		backgroundColor: '#FFFFFF',
		marginTop: 5,
		marginBottom: 10,
		paddingHorizontal: 15,
		borderBottomColor: colors.borderlight,
		borderBottomWidth: withBorder ? 1 : 0,
	}),
	switchSectionContainer: {
		paddingHorizontal: 0,
		borderBottomWidth: 0,
		borderColor: '#FFFFFF',
	},
	switchTitleStyle: [Type.fontSize(14), Type.SemiBold, colorSet(colors.secondaryBg)],
	onlineOrderDescription: (color) => [
		Type.fontSize(12),
		Type.Regular,
		colorSet(color || colors.grayBlue),
		{ lineHeight: Platform.OS === 'ios' ? 16 : 20, paddingRight: 90 },
	],
	sectionFieldContainer: {
		paddingHorizontal: 20,
		paddingBottom: 10,
		paddingTop: 20,
	},
	section: {
		backgroundColor: '#FFFFFF',
		marginBottom: 10,
		flex: 1,
	},
	allowOnlinePaymentDesc: {
		color: colors.primaryBg,
		width: '80%',
		fontSize: 12,
		lineHeight: Platform.select({ ios: 15, android: 20 }),
	},
	gatewaySwitchContainer: {
		flexDirection: 'row',
		paddingBottom: 10,
		alignItems: 'center',
	},
	gatewayInfoContainer: {
		backgroundColor: colors.borderlight,
		borderRadius: 10,
		marginHorizontal: 10,
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15,
	},
	gatewayInfoImage: {
		marginLeft: 10,
	},
	gatewayProcessmentInfo: {
		paddingHorizontal: 50,
		paddingTop: 10,
		textAlign: 'center',
		lineHeight: 16,
	},
	linkedAccountContainer: {
		height: 40,
		flexDirection: 'row',
		backgroundColor: colors.primaryDarker,
		alignItems: 'center',
		paddingHorizontal: 15,
	},
	actionTextContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		paddingVertical: 15,
		paddingHorizontal: 16,
	},
}

export default connect(
	(state) => ({
		storeConfig: state.auth.store,
		catalog: state.auth.store.catalog,
		gatewaysCheckoutList: state.internal.global.gateway_checkout || [], // global informations with all gateways that Kyte supports
		isLoaderVisible: state.common.loader.visible,
		currencyConfig: state.preference.account.currency || {},
		countryFees: state.externalPayments.countryFees,
	}),
	{ storeAccountSave, updatePaymentGateways, setCheckoutGatewayServiceType }
)(ConfigOnlinePayments)
