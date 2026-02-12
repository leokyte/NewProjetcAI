import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { View, Keyboard, Alert, Dimensions, ScrollView, StyleSheet } from 'react-native'
import { KytePro } from '@kyteapp/kyte-ui-components'
import PaymentItem from './PaymentItem'
import {
	KyteToolbar,
	CurrencyText,
	ActionButton,
	LoadingCleanScreen,
	CustomKeyboardAvoidingView,
	KyteIcon,
	KyteSafeAreaView,
	ToolbarCustomer,
	InsufficientStockModal,
	PaymentSaveButton,
} from '../../common'
import HeaderButton from '../../common/HeaderButton'
import CustomerPayLaterDeniedAlert from './alerts/CustomerPayLaterDeniedAlert'
import CustomerPositiveBalanceAlert from './alerts/CustomerPositiveBalanceAlert'
import NoCreditAvailableAlert from './alerts/NoCreditAvailableAlert'
import PaymentLinkDeactivated from './alerts/PaymentLinkDeactivated'
import PaymentLinkNeedActivation from './alerts/PaymentLinkNeedActivation'
import { scaffolding, colors } from '../../../styles'
import {
	currentSaleAddPayment,
	currentSaleRemovePayment,
	currentSaleSetStatus,
	currentSalePaymentRenew,
	setRefreshToken,
	updateUserHasCheckedOpenedSales,
	startLoading,
	stopLoading,
	mercadoPagoPayment,
	checkFeatureIsAllowed,
	currentSaleRenew,
	customerFetchById,
	customerManageNewBalance,
	currentSaleResetPaidValues,
	checkCurrentSaleStock,
	currentSaleSetPaymentLink,
	saleSaveWithPaymentLink,
	openModalWebview,
	changeApiError,
} from '../../../stores/actions'
import { PaymentType, OrderStatus, Features, PaymentGatewayServiceType, SaleOrigin } from '../../../enums'
import I18n from '../../../i18n/i18n'
import {
	selectPayments,
	checkUserPermission,
	generateTestID,
	generateDefaultPROFeatures,
	getPROFeature,
	getIsBRAndUseBRL,
	trackSaleFinishOrSaveEvent,
} from '../../../util'
import NavigationService from '../../../services/kyte-navigation'
import { logEvent } from '../../../integrations'
import ApiGenericErrorModal from '../../common/modals/ApiGenericErrorModal'

const Strings = {
	MODAL_ACCOUNT_PAY_TITLE: I18n.t('paymentMethods.customerAccount'),
	MODAL_ACCOUNT_PAY_INFO: I18n.t('customerAccount.payInfo'),
	ALERT_ACCOUNT_PAY_NO_CUSTOMER_TITLE: I18n.t('customerAccount.addCustomerTitle'),
	ALERT_ACCOUNT_PAY_NO_CUSTOMER_INFO: I18n.t('customerAccount.addCustomerInfo'),
	CONTINUE: I18n.t('words.s.continue'),
	NOT_ONLINE_ALERT_TEXT: I18n.t('words.m.noInternet'),
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568
const SCROLL_HEIGHT_LIMIT = 630
const PAYMENT_SCROLL_HEIGHT_RATIO = 0.36

const orderStatusNames = {
	AWAITING_PAYMENT: OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status,
}

const Payment = ({ ...props }) => {
	const { totalNet, user, payments, currentSale, changeApiError, hasApiError, customer } = props

	const { outerContainer, bottomContainer } = scaffolding
	const { navigate } = props.navigation
	const { visible } = props.loader

	const openedSalesKey = Features.items[Features.OPENED_SALES].key
	const openedSalesRemoteKey = Features.items[Features.OPENED_SALES].remoteKey
	const customerAccountKey = Features.items[Features.CUSTOMER_ACCOUNT].key
	const customerAccountRemoteKey = Features.items[Features.CUSTOMER_ACCOUNT].remoteKey
	const totalPay = totalNet
	const [selectedMethod, setSelectedMethod] = useState(payments.length ? payments[0]?.type : 0)
	const [showPaymentMethods, setShowPaymentMethods] = useState(true)
	const [paymentsState, setPaymentsState] = useState(payments || [])
	const [showCustomerPayLaterDeniedAlert, setShowCustomerPayLaterDeniedAlert] = useState(false)
	const [showCustomerPositiveBalanceAlert, setShowCustomerPositiveBalanceAlert] = useState(false)
	const [showNoCreditAvailableAlert, setShowNoCreditAvailableAlert] = useState(false)
	const [showPaymentLinkDeactivatedAlert, setShowPaymentLinkDeactivatedAlert] = useState(false)
	const [showPaymentLinkNeedActivationAlert, setShowPaymentLinkNeedActivationAlert] = useState(false)
	const { allowCustomerInDebt } = checkUserPermission(user.permissions)
	const [showConfirmInsufficientStockModal, setShowConfirmInsufficientStockModal] = useState(false) // stock check stuff,
	const [PROSaveOrder, setPROSaveOrder] = useState(generateDefaultPROFeatures('PROSaveOrder'))
	const [safeAreaHeight, setSafeAreaHeight] = useState(undefined)

	let willFocusListener
	let KeyboardShowListener
	let KeyboardHideListener
	let timer

	useEffect(() => {
		const { totalNet, payments, currentSale, route } = props
		const { params = {} } = route
		const payment = PaymentType.items[PaymentType.MONEY]
		const isFromCatalog = currentSale.origin === SaleOrigin.CATALOG

		props.stopLoading()

		KeyboardShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow)
		KeyboardHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide)

		if (!isFromCatalog && !payments.length) {
			props.currentSaleResetPaidValues()
			props.currentSaleAddPayment(payment.type, payment.description, totalNet)
		}
		setPayments()

		willFocusListener = props.navigation.addListener('focus', (payload) => {
			// const { params } = payload.state;
			// if (params && 'isFromOnlinePayments' in params) {
			//   goToPaymentLink(orderStatusNames.AWAITING_PAYMENT, true);
			// }
		})

		if (params.isFromOnlinePayments) {
			goToPaymentLink(orderStatusNames.AWAITING_PAYMENT, true)
		}

		logEvent('Checkout Payment View')
	}, [])

	useEffect(() => {
		if (willFocusListener) {
			willFocusListener = null
		}

		KeyboardShowListener.remove()
		KeyboardHideListener.remove()
		clearTimeout(timer)
	}, [])

	const setPayments = () => {
		const { mercadoPago, currency } = props
		const blackList = getIsBRAndUseBRL(currency) ? [PaymentType.PAYCHECK] : [PaymentType.PAYCHECK, PaymentType.PIX]
		const newPayments = selectPayments(mercadoPago.isActivated, blackList)
		setPaymentsState(newPayments)
	}

	const keyboardDidShow = () => {
		setShowPaymentMethods(false)
	}

	const keyboardDidHide = () => {
		setShowPaymentMethods(true)
	}

	const choosePaymentType = (paymentType) => {
		const { isOnline, totalNet, totalPay, currentSale } = props
		const { navigate } = props.navigation
		const customerAccountPayment = PaymentType.items[PaymentType.ACCOUNT]
		const payLaterPayment = PaymentType.items[PaymentType.PAY_LATER]
		const paymentLink = PaymentType.items[PaymentType.LINK]
		const isCardReaders = paymentType.type === 'mercadopago'

		const selectPaymentType = () => {
			setSelectedMethod(paymentType.type)

			if (isCardReaders) {
				props.currentSalePaymentRenew()
				return
			}

			props.currentSaleAddPayment(paymentType.type, paymentType.description, totalNet, false, undefined, null, totalPay)
		}

		// Payment with customerAccount
		const customerAccountAction = () => {
			if (!isOnline) return Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'))
			checkAccountPayCustomer(paymentType)
			selectPaymentType()
		}

		// Payment with payLater
		const payLaterAction = () => {
			selectPaymentType()
			if (currentSale.customer) return goToCustomerBalance(true)
			return navigate('CustomerAdd', {
				screen: 'CustomerAdd',
				params: { origin: 'pay-later', disableCredit: true },
			})
		}

		// Payment with link
		const linkAction = () => {
			if (isOnline) {
				const stockOk = props.checkCurrentSaleStock(false, true) // false + true, means to check only if is not order yet or OPENED
				if (!stockOk) return setShowConfirmInsufficientStockModal(true)

				setSelectedMethod(paymentType.type)
				return paymentLinkChosen()
			}
			Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
		}

		if (paymentType.type === customerAccountPayment.type) return customerAccountAction()
		if (paymentType.type === payLaterPayment.type) return payLaterAction()
		if (paymentType.type === paymentLink.type) return linkAction()

		selectPaymentType()
		goToPaymentEdition(paymentType)
	}

	const paymentLinkChosen = () => {
		props.startLoading()
		checkPaymentLink(() => goToPaymentLink(orderStatusNames.AWAITING_PAYMENT, true))
	}

	const finalizeAction = (status) => {
		const { currentSale, totalNet, totalPay, payments = [], checkoutEditionMode } = props
		const actualPayment = payments[0]
		props.currentSaleAddPayment(actualPayment.type, actualPayment.description, totalNet, false, null, null, totalPay)
		const sale = props.currentSaleSetStatus(status, currentSale.status)

		if (sale) return NavigationService.reset('Receipt', 'Receipt', { isEdition: checkoutEditionMode })
	}

	const doConcludeOpenedSale = () => {
		const payment = PaymentType.items[PaymentType.MONEY]

		if (!payments.length) props.currentSaleAddPayment(payment.type, payment.description, totalNet)
		const status = currentSale.statusInfo.status || currentSale.status

		trackSaleFinishOrSaveEvent({ sale: currentSale, status })

		if (!currentSale.id) {
			return props.checkFeatureIsAllowed(openedSalesKey, () => finalizeAction('opened', true), openedSalesRemoteKey)
		}
		finalizeAction(status, true)
	}

	const goToPaymentLink = async (status) => {
		const { currentSale, route } = props

		const goTo = () => {
			NavigationService.navigate('PaymentLink', 'PaymentLink', route.params)
		}

		props.saleSaveWithPaymentLink({ ...currentSale, status, prevStatus: currentSale.status, payments: [] }, goTo)
	}

	const goToPaymentEdition = (paymentType) => {
		const { payments, navigation } = props
		const { navigate } = navigation
		const moneyPayment = PaymentType.items[PaymentType.MONEY]
		const placeholderPayment = payments.length ? payments[0] : moneyPayment
		const payment = paymentType || placeholderPayment

		navigate({ key: 'PaymentEditionPage', name: 'PaymentEdition', params: { payment, split: false } })
	}

	const goToCustomerBalance = (isPayLater = false) => {
		const { navigate } = props.navigation
		const { totalNet, customer } = props.currentSale
		const useSplit = isPayLater ? false : totalNet > customer.accountBalance
		const chargedValue = useSplit ? customer.accountBalance : totalNet

		props.customerFetchById(customer.id)
		props.customerManageNewBalance('remove', chargedValue)

		navigate({
			key: 'CustomerAccountBalancePage',
			name: 'CustomerSaleAccountBalance',
			params: { useSplit },
		})
	}

	const checkAccountPayCustomer = () => {
		const { currentSale } = props
		const { navigate } = props.navigation

		if (currentSale.customer) goToCustomerBalance()
		else {
			Alert.alert(Strings.ALERT_ACCOUNT_PAY_NO_CUSTOMER_TITLE, Strings.ALERT_ACCOUNT_PAY_NO_CUSTOMER_INFO, [
				{ text: I18n.t('alertDismiss') },
				{
					text: I18n.t('alertOk'),
					onPress: () =>
						navigate('CustomerAdd', {
							screen: 'CustomerAdd',
							params: { origin: 'customer-account', useCustomerAccount: true, disableDebit: true },
						}),
				},
			])
		}
	}

	const checkPaymentLink = (successCallback) => {
		const { checkoutGateways, user } = props
		const { permissions } = user
		const paymentLinkType = PaymentGatewayServiceType.items[PaymentGatewayServiceType.LINK].type
		const stockOk = props.checkCurrentSaleStock(false, true)
		const hasPaymentLink = !!checkoutGateways.find((c) => {
			if (!c.active || c.services.length <= 0) return false
			const findPaymentLink = c.services.find((s) => s.active && s.type === paymentLinkType)
			return !!findPaymentLink
		})

		const noPermissionAlert = () => {
			setShowPaymentLinkDeactivatedAlert(true)
			setSelectedMethod(0)
			props.stopLoading()
		}

		const inactivePaymentLinkAlert = () => {
			setShowPaymentLinkNeedActivationAlert(true)
			setSelectedMethod(0)
			props.stopLoading()
			logEvent('Payment Link Attempt')
		}

		// On Android we need to wait for one modal close to open another otherwise it get stuck on release version.
		// Waiting for InsufficientStockModal close
		timer = setTimeout(
			() => {
				if (!hasPaymentLink) {
					if (!checkUserPermission(permissions).isAdmin) return noPermissionAlert()
					return inactivePaymentLinkAlert()
				}
				return successCallback()
			},
			stockOk ? 0 : 500
		)
	}

	const goBackAction = () => {
		const { payments } = props.currentSale
		const { goBack } = props.navigation
		const { params = {} } = props.route
		const { checkoutEditionMode } = props

		if (!checkoutEditionMode) payments.forEach((payment, index) => props.currentSaleRemovePayment(index))

		goBack()
		if (params.clearCartOnGoBack) props.currentSaleRenew()
	}

	const payLaterNotAllowedHandleClick = (payment) => {
		const { currentSale } = props
		const { navigate } = props.navigation
		const { customer } = currentSale

		// First of all -> check if customer hava positive balance
		if (customer.accountBalance > 0) return setShowCustomerPositiveBalanceAlert(true)

		// Then check if has permission
		if (!customer.allowPayLater) {
			if (allowCustomerInDebt)
				return navigate({ key: 'AllowPayLaterPage', name: 'AllowPayLater', params: { customer, payment } })
			return setShowCustomerPayLaterDeniedAlert(true)
		}
	}

	const renderCustomer = () => <ToolbarCustomer customer={customer} navigation={props.navigation} />

	const renderCustomerIcon = () => {
		const { navigate } = props.navigation
		return (
			<HeaderButton
				buttonKyteIcon
				size={18}
				icon="customer-plus"
				color={colors.actionColor}
				onPress={() => {
					logEvent('Checkout Customer Select Click', {
						where: 'finish',
					})
					navigate('CustomerAdd', {
						screen: 'CustomerAdd',
						params: { origin: 'finish' },
					})
				}}
				testProps={generateTestID('customer-pc')}
			/>
		)
	}

	const renderPaymentTypes = () => {
		const { customer } = props
		const customerWithoutCredit = customer && customer.accountBalance <= 0

		return paymentsState.map((paymentType, i) => {
			const noCreditAvailable = paymentType.type === PaymentType.ACCOUNT && customerWithoutCredit
			const setShowNoCreditAvailableAlert = () => setShowNoCreditAvailableAlert(true)

			return (
				<PaymentItem
					key={i}
					isSelected={selectedMethod === paymentType.type}
					description={paymentType.description}
					icon={paymentType.icon}
					type={paymentType.type}
					doubleSized={paymentType.doubleSized}
					noFill={paymentType.noFill}
					onPress={() => (noCreditAvailable ? setShowNoCreditAvailableAlert() : choosePaymentType(paymentType))}
					new={paymentType.new}
					disabled={noCreditAvailable}
					customer={customer}
					testProps={generateTestID(`${paymentType.description}-pc`)}
				/>
			)
		})
	}

	const renderPaymentMethods = () => {
		const { methodsContainer } = styles
		return <View style={methodsContainer}>{renderPaymentTypes()}</View>
	}

	const renderTotal = () => {
		const cs = {
			alignItems: 'center',
			justifyContent: 'center',
			height: 100,
		}

		return (
			<View style={cs}>
				<CurrencyText
					value={totalPay}
					currencyColor={colors.primaryColor}
					numberColor={colors.primaryColor}
					isSplitted
					testProps={generateTestID('total-pc')}
				/>
			</View>
		)
	}

	const renderConcludeButton = () => {
		const { customer } = props
		const paymentType = PaymentType.items[selectedMethod] || {}
		const acountPayment = PaymentType.items[PaymentType.ACCOUNT]

		const isPaymentLinkSelected = selectedMethod === PaymentType.items[PaymentType.LINK].type
		const customerWithoutCredit = customer && customer.accountBalance <= 0

		const alertTitle = () => {
			if (isPaymentLinkSelected) return I18n.t('words.s.attention')
			return I18n.t('customerAccount.customerWithoutMoneyTitle')
		}
		const alertDescription = () => {
			if (isPaymentLinkSelected) return I18n.t('paymentLinkBeingGenerated')
			return I18n.t('customerAccount.noCreditAvailableAlertText')
		}

		return (
			<ActionButton
				onPress={() => choosePaymentType(paymentType)}
				rightIcon={<KyteIcon name="arrow-cart" color="white" size={15} />}
				disabled={(customerWithoutCredit && acountPayment.type === paymentType.type) || isPaymentLinkSelected}
				alertTitle={alertTitle()}
				alertDescription={alertDescription()}
				testProps={generateTestID('next-pc')}
			>
				{I18n.t('words.s.proceed')}
			</ActionButton>
		)
	}

	const renderConcludeLaterButton = () => {
		const { storeAllowPaylater } = props
		const isGuestCustomer = customer && customer.isGuest

		const renderButton = ({ text, onPress, alertDescription = '', disabled = false, blur = false, testProps }) => (
			<ActionButton
				buttonSmall
				cancel
				onPress={onPress}
				alertTitle=""
				alertDescription={alertDescription}
				disabled={disabled}
				blur={blur}
				style={{ marginHorizontal: 5, marginVertical: 5, paddingHorizontal: SMALL_SCREENS ? 10 : 20 }}
				testProps={testProps}
			>
				{text}
			</ActionButton>
		)

		const payLaterType = PaymentType.items[PaymentType.PAY_LATER]
		const positiveBalance = currentSale.customer && currentSale.customer.accountBalance > 0
		const payLaterNotAllowed = currentSale.customer && (!currentSale.customer.allowPayLater || positiveBalance)
		const blur = allowCustomerInDebt ? positiveBalance : payLaterNotAllowed

		return (
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'center',
					flexWrap: 'wrap',
				}}
			>
				<KytePro
					billing={props.billing}
					feature={PROSaveOrder}
					component={() =>
						renderButton({
							text: I18n.t('paymentConcludeLaterButton'),
							onPress: () => doConcludeOpenedSale(),
							disabled: totalPay < currentSale.totalNet,
							alertDescription: I18n.t('paymentConcludeAlertDescription'),
							testProps: generateTestID('save-order-pc'),
						})
					}
					onPressFree={() => props.openModalWebview(PROSaveOrder.infoURL)}
					noTag
				/>

				{storeAllowPaylater && !isGuestCustomer
					? renderButton({
							text: payLaterType.description,
							onPress: () =>
								props.checkFeatureIsAllowed(
									customerAccountKey,
									() =>
										payLaterNotAllowed ? payLaterNotAllowedHandleClick(payLaterType) : choosePaymentType(payLaterType),
									customerAccountRemoteKey
								),
							blur,
							testProps: generateTestID('pay-later-pc'),
					  })
					: null}
			</View>
		)
	}

	const renderLoader = () => <LoadingCleanScreen />

	const showCustomerPayLaterDeniedAlertFunc = () => {
		const { currentSale } = props
		const hideModal = () => setShowCustomerPayLaterDeniedAlert(false)

		return <CustomerPayLaterDeniedAlert customerName={currentSale.customer.name} hideModal={() => hideModal()} />
	}

	const showCustomerPositiveBalanceAlertFunc = () => {
		const hideModal = () => setShowCustomerPositiveBalanceAlert(false)

		return <CustomerPositiveBalanceAlert hideModal={() => hideModal()} />
	}

	const showNoCreditAvailableAlertFunc = () => {
		const hideModal = () => setShowNoCreditAvailableAlert(false)

		return <NoCreditAvailableAlert hideModal={() => hideModal()} />
	}

	const showPaymentLinkDeactivated = () => {
		const hideModal = () => setShowPaymentLinkDeactivatedAlert(false)
		return <PaymentLinkDeactivated hideModal={() => hideModal()} />
	}

	const showPaymentLinkNeedActivation = () => {
		const hideModal = (callback) => {
			setShowPaymentLinkNeedActivationAlert(false)
			callback?.()
		}
		return (
			<PaymentLinkNeedActivation
				hideModal={() => hideModal()}
				action={() => hideModal(() => navigate('ConfigIntegratedPayments', { isTryingToConfigLink: true }))}
			/>
		)
	}

	const renderInsufficientStockModal = () => {
		const { navigate } = props.navigation
		const goToCart = () => navigate({ name: 'Cart', key: 'CartPage' })
		return (
			<InsufficientStockModal
				isModalVisible
				hideModal={() => setShowConfirmInsufficientStockModal(false)}
				continueAnyway={() => paymentLinkChosen()}
				goToCart={() => goToCart()}
			/>
		)
	}

	const getPROFeatures = async () => {
		const saveOrder = await getPROFeature('PROSaveOrder')
		setPROSaveOrder(saveOrder)
	}

	useEffect(() => {
		getPROFeatures()
	}, [])

	const renderBottomButtons = () => (
		<>
			<KytePro
				billing={props.billing}
				feature={PROSaveOrder}
				component={() => <PaymentSaveButton hideLeftIcon onPress={() => doConcludeOpenedSale()} />}
				onPressFree={() => props.openModalWebview(PROSaveOrder.infoURL)}
				noTag
			/>

			<View style={bottomContainer}>{renderConcludeButton()}</View>
		</>
	)

	return (
		<KyteSafeAreaView
			style={outerContainer}
			onLayout={(event) => {
				setSafeAreaHeight(event.nativeEvent.layout.height)
			}}
		>
			<KyteToolbar
				innerPage
				borderBottom={1}
				headerTitle={I18n.t('paymentPageTitle')}
				rightComponent={customer ? renderCustomer() : renderCustomerIcon()}
				goBack={() => goBackAction()}
				navigate={navigate}
				navigation={props.navigation}
			/>
			<CustomKeyboardAvoidingView style={{ flex: 1 }}>
				<View style={styles.topContent}>
					{renderTotal()}
					{renderConcludeLaterButton()}
				</View>
				{safeAreaHeight !== undefined && (
					<View style={styles.paymentMethodsContainer(safeAreaHeight)}>
						<ScrollView nestedScrollEnabled alwaysBounceVertical={false}>
							{showPaymentMethods ? renderPaymentMethods() : null}
						</ScrollView>
					</View>
				)}
				{renderBottomButtons()}
			</CustomKeyboardAvoidingView>
			{visible ? renderLoader() : null}
			{showCustomerPayLaterDeniedAlert ? showCustomerPayLaterDeniedAlertFunc() : null}
			{showCustomerPositiveBalanceAlert ? showCustomerPositiveBalanceAlertFunc() : null}
			{showNoCreditAvailableAlert ? showNoCreditAvailableAlertFunc() : null}
			{showPaymentLinkDeactivatedAlert ? showPaymentLinkDeactivated() : null}
			{showPaymentLinkNeedActivationAlert ? showPaymentLinkNeedActivation() : null}
			{showConfirmInsufficientStockModal ? renderInsufficientStockModal() : null}
			{hasApiError && (
				<ApiGenericErrorModal
					errorTitle={I18n.t('ops.somethingWentWrong')}
					textStyles={{ textAlign: 'center' }}
					errorText={I18n.t('qrCodeGenerateError')}
					isModalVisible={hasApiError}
					hideModal={() => changeApiError(false)}
				/>
			)}
		</KyteSafeAreaView>
	)
}

const styles = StyleSheet.create({
	topContent: {
		flex: 1,
		paddingHorizontal: 10,
		justifyContent: 'center',
		paddingTop: 10,
		paddingBottom: 40,
	},
	paymentMethodsContainer: (safeAreaHeight) => ({
		...(safeAreaHeight < SCROLL_HEIGHT_LIMIT ? { maxHeight: safeAreaHeight * PAYMENT_SCROLL_HEIGHT_RATIO } : {}),
		flexShrink: 1,
	}),
	methodsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 0,
		borderTopWidth: 0.5,
		borderBottomWidth: 0.5,
		borderColor: colors.borderColor,
	},
})

const mapStateToProps = ({ currentSale, externalPayments, preference, common, auth, billing }) => {
	const { currency, decimalCurrency } = preference.account
	const { totalNet, totalPay, finish, customer, payBack, payments } = currentSale
	return {
		currentSale,
		totalNet,
		totalPay,
		finish,
		customer,
		payBack,
		payments,
		mercadoPago: externalPayments.mercadoPago,
		currency,
		decimalCurrency,
		loader: common.loader,
		user: auth.user,
		storeAllowPaylater: preference.account.allowPayLater,
		isOnline: common.isOnline,
		hasApiError: common.hasApiError,
		checkoutEditionMode: common.checkoutEditionMode,
		checkoutGateways: auth.store.checkoutGateways || [],
		billing,
	}
}

export default connect(mapStateToProps, {
	currentSaleAddPayment,
	currentSaleRemovePayment,
	currentSaleSetStatus,
	currentSalePaymentRenew,
	setRefreshToken,
	updateUserHasCheckedOpenedSales,
	startLoading,
	stopLoading,
	mercadoPagoPayment,
	checkFeatureIsAllowed,
	currentSaleRenew,
	customerFetchById,
	customerManageNewBalance,
	currentSaleResetPaidValues,
	checkCurrentSaleStock,
	currentSaleSetPaymentLink,
	saleSaveWithPaymentLink,
	changeApiError,
	openModalWebview,
})(Payment)
