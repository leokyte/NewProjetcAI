import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, ScrollView, Text, Dimensions, BackHandler, Alert } from 'react-native'

import {
	KyteToolbar,
	KyteIcon,
	KyteButton,
	KyteText,
	ActionButton,
	CurrencyText,
	KyteSafeAreaView,
	PaymentMethodsModal,
	ToolbarCustomer,
	PaymentSaveButton,
	InsufficientStockModal,
	LoadingCleanScreen,
} from '../../common'
import HeaderButton from '../../common/HeaderButton'
import NoCreditAvailableAlert from '../payments/alerts/NoCreditAvailableAlert'
import { scaffolding, colors } from '../../../styles'
import {
	currentSaleSplitPayment,
	currentSaleSetStatus,
	currentSaleRemovePayment,
	currentSaleSetInSplitPayment,
	checkFeatureIsAllowed,
	customerDetailUpdate,
	customerManageNewBalance,
	customerAccountUpdateBalance,
	customerFetchById,
	currentSaleResetPaidValues,
	checkCurrentSaleStock,
	changeApiError,
} from '../../../stores/actions'
import I18n from '../../../i18n/i18n'
import {
	selectPayments,
	generateTestID,
	getIsBRAndUseBRL,
	isBetaCatalog,
	statusNames,
	trackSaleFinishOrSaveEvent,
} from '../../../util'
import { logEvent } from '../../../integrations'
import NavigationService from '../../../services/kyte-navigation'
import { PaymentType, Features } from '../../../enums'
import GenerateQrCodeButton from '../../sales/GenerateQrCodeButton'
import ApiGenericErrorModal from '../../common/modals/ApiGenericErrorModal'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

const Strings = {
	ALERT_ACCOUNT_PAY_NO_CUSTOMER_TITLE: I18n.t('customerAccount.addCustomerTitle'),
	ALERT_ACCOUNT_PAY_NO_CUSTOMER_INFO: I18n.t('customerAccount.addCustomerInfo'),
}

class SplitPayment extends Component {
	static navigationOptions = () => ({
		header: null,
	})

	constructor(props) {
		super(props)

		this.handleBackButton = this.handleBackButton.bind(this)
		this.backHandler = null

		this.state = {
			isModalVisible: false,
			paymentTypes: [],
			selectedMethod: '',
			showNoCreditAvailableAlert: false,

			// inssuficient stock stuff
			showConfirmInsufficientStockModal: false,
			insufficientStockConcludeStatus: null,
		}
	}

	componentDidMount() {
		const { customer, customerDetail } = this.props

		this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton)

		if (customer && !customerDetail) this.props.customerFetchById(customer.id)
		this.willFocusListener = this.props.navigation.addListener('blur', () => {
			this.hideMethods()
		})
	}

	componentWillUnmount() {
		if (this.willFocusListener) this.willFocusListener = null
		this.backHandler?.remove()
		clearTimeout(this.timer)
	}

	handleBackButton() {
		const { isInSplitPayment } = this.props
		return isInSplitPayment
	}

	hideMethods() {
		this.setState({ isModalVisible: false })
	}

	showMethods() {
		this.setState({ isModalVisible: true })
	}

	openCustomerAlert(params) {
		const { navigate } = this.props.navigation

		const setParams = {
			...params,
			customerBalanceFromSplit: this.goToCustomerBalance.bind(this),
			goToAllowCustomerInDebit: this.goToAllowCustomerInDebit.bind(this),
			origin: 'split-payment',
		}

		Alert.alert(Strings.ALERT_ACCOUNT_PAY_NO_CUSTOMER_TITLE, Strings.ALERT_ACCOUNT_PAY_NO_CUSTOMER_INFO, [
			{ text: I18n.t('alertDismiss') },
			{ text: I18n.t('alertOk'), onPress: () => navigate('CustomerAdd', setParams) },
		])
	}

	showNoCreditAlert() {
		this.setState({
			isModalVisible: false,
			showNoCreditAvailableAlert: true,
		})
	}

	goToPaymentEdition(payment) {
		this.navigateToEdition(payment)
	}

	goToCustomerBalance(payment, paramCustomer) {
		const { paymentRemaining, customer, payments } = this.props
		const { navigate } = this.props.navigation
		const usedCustomer = paramCustomer || customer

		const acountPayment = PaymentType.items[PaymentType.ACCOUNT]
		// const payLaterPayment = PaymentType.items[PaymentType.PAY_LATER];

		const isAccountPayment = payment && payment.type === acountPayment.type
		const customerHasCredit = !isAccountPayment || paymentRemaining < usedCustomer.accountBalance
		const accountPaymentValue = customerHasCredit ? paymentRemaining : usedCustomer.accountBalance
		const hasAccountPayment = payments.find((p) => p.type === acountPayment.type)

		if (hasAccountPayment) this.props.customerDetailUpdate({ ...usedCustomer, accountBalance: 0 })
		if (!hasAccountPayment) this.props.customerFetchById(usedCustomer.id)
		this.props.customerManageNewBalance('remove', isAccountPayment ? accountPaymentValue : paymentRemaining)

		navigate({
			key: 'CustomerAccountBalanceSplitPage',
			name: 'CustomerSaleAccountBalance',
			params: {
				split: true,
				useSplit: true,
				payment: payment,
				useRemaining: customerHasCredit,
			},
		})
	}

	choosePayment(payment) {
		const { customer, payments } = this.props
		const accountPayment = PaymentType.items[PaymentType.ACCOUNT]
		const isAccountPayment = payment.type === accountPayment.type
		const key = Features.items[Features.CUSTOMER_ACCOUNT].key
		const remoteKey = Features.items[Features.CUSTOMER_ACCOUNT].remoteKey
		const customerWithoutCredit = () => customer && customer.accountBalance <= 0
		const hasAccountPayment = payments.find((p) => p.type === accountPayment.type)
		const insufficientCredits = customer && (hasAccountPayment || customerWithoutCredit())

		if (!customer && isAccountPayment) {
			return this.props.checkFeatureIsAllowed(
				key,
				() =>
					this.openCustomerAlert({
						useCustomerAccount: true,
						disableDebit: true,
						useSplit: true,
						split: true,
						payment,
					}),
				remoteKey
			)
		}
		if (isAccountPayment) {
			return this.props.checkFeatureIsAllowed(
				key,
				() => {
					if (insufficientCredits) return this.showNoCreditAlert()
					this.goToCustomerBalance(payment)
				},
				remoteKey
			)
		}
		this.goToPaymentEdition(payment)
	}

	navigateToEdition(payment) {
		const { navigate } = this.props.navigation

		navigate({
			key: 'PaymentEditionPageSplit',
			name: 'PaymentEdition',
			params: { payment, split: true, paymentCompleted: false },
		})
	}

	goToAllowCustomerInDebit(customer, payment) {
		const { navigate } = this.props.navigation

		navigate({ key: 'AllowPayLaterPage', name: 'AllowPayLater', params: { customer, useSplit: true, payment } })
	}

	goToReceipt(status) {
		const { isInSplitPayment, currentSale } = this.props

		trackSaleFinishOrSaveEvent({ sale: currentSale, status })

		if (isInSplitPayment) {
			this.props.currentSaleSetInSplitPayment(false)
		}
		NavigationService.reset('Receipt', 'Receipt')
	}

	checkCurrentSaleStock(status) {
		const { currentSale } = this.props
		const stockOk = this.props.checkCurrentSaleStock(true) // true indicates to check only status = OPENED
		if (stockOk) {
			const sale = this.props.currentSaleSetStatus(status, currentSale.status)
			if (sale) {
				this.goToReceipt(status)
			}
		}
		this.setState({ showConfirmInsufficientStockModal: true, insufficientStockConcludeStatus: status })
	}

	removePayment(paymentId, isAccountPayment) {
		// remove PAY_LATER payment if paymentId came from ACCOUNT payment
		const { payments, customer } = this.props
		if (isAccountPayment) {
			const payLaterPayment = payments.find((p) => p.type === PaymentType.PAY_LATER)
			if (payLaterPayment) this.props.currentSaleRemovePayment(payLaterPayment.paymentId)
			this.props.customerFetchById(customer.id)
		}

		this.props.currentSaleRemovePayment(paymentId)
		this.props.currentSaleSplitPayment()
	}

	renderCustomer() {
		return (
			<ToolbarCustomer
				customer={this.props.customer}
				params={{ clearAccountPayments: true }}
				navigation={this.props.navigation}
			/>
		)
	}

	renderCustomerIcon() {
		const { navigate } = this.props.navigation
		return (
			<HeaderButton
				buttonKyteIcon
				size={18}
				icon={'customer-plus'}
				color={colors.actionColor}
				onPress={() => {
					logEvent('Checkout Customer Select Click', {
						where: 'split-payment',
					})
					navigate('CustomerAdd', { clearAccountPayments: true })
				}}
				testProps={generateTestID('add-cus-pms')}
			/>
		)
	}

	renderEmptyPayment() {
		const { splitInfoContainer, splitInfo } = styles
		const spacing = { paddingTop: 30 }

		return (
			<View style={splitInfoContainer}>
				<Text style={splitInfo}>{I18n.t('paymentSplitHelper')}</Text>
				<KyteIcon name={'arrow-down'} size={120} color={colors.primaryColor} style={spacing} />
			</View>
		)
	}

	renderRemovePayment(item) {
		const { deleteCircle } = styles
		return (
			<KyteButton
				style={deleteCircle}
				onPress={() => this.removePayment(item.paymentId, item.type === PaymentType.ACCOUNT)}
				testProps={generateTestID(`remove-pay-pms-${item.type}`)}
			>
				<KyteIcon size={10} color={colors.primaryColor} name={'close-navigation'} />
			</KyteButton>
		)
	}

	renderSplitMethods() {
		const { splitItem, itemValue, itemMethod } = styles
		const { payments } = this.props
		const extraStyles = { height: 50 }
		const payLaterMethodStyle = [itemMethod, { justifyContent: 'flex-end' }]
		const removeBorder = { borderBottomWidth: 0 }

		const renderPaymentItem = (item, i) => {
			const isPayLater = item.type === PaymentType.PAY_LATER
			const majorColor = isPayLater ? 'errorColor' : 'primaryColor'
			return (
				<View key={i} style={[splitItem, extraStyles, isPayLater ? removeBorder : null]}>
					<View style={isPayLater ? payLaterMethodStyle : itemMethod}>
						{!item.transaction ? this.renderRemovePayment(item) : null}
						<KyteText weight={'Semibold'} size={15} pallete={majorColor} testProps={generateTestID(`pay-met-pms-${i}`)}>
							{isPayLater ? `${PaymentType.items[PaymentType.PAY_LATER].alternativeDescription}: ` : item.description}
						</KyteText>
					</View>
					<View style={itemValue}>
						<KyteText
							weight={'Semibold'}
							size={15}
							pallete={majorColor}
							testProps={generateTestID(`part-paid-pms-${i}`)}
						>
							<CurrencyText value={item.totalPaid} />
						</KyteText>
					</View>
				</View>
			)
		}

		// Sort payments to let PAY_LATER in last position
		const regularPayments = payments.filter((p) => p.type !== PaymentType.PAY_LATER)
		const payLaterPayment = payments.filter((p) => p.type === PaymentType.PAY_LATER)

		return regularPayments.concat(payLaterPayment).map(renderPaymentItem)
	}

	renderMethodsContainer() {
		const { paymentRemaining } = this.props
		return (
			<ScrollView>
				{this.renderSplitMethods()}
				{paymentRemaining !== 0 ? this.renderAmountRemaining() : null}
			</ScrollView>
		)
	}

	renderAmountRemaining() {
		const { splitItem, itemValue, itemMethod } = styles
		const { paymentRemaining, payBack } = this.props
		const hasChange = paymentRemaining < 0
		const textColor = hasChange ? 'primaryColor' : 'primaryGrey'
		const extraStyles = { borderBottomWidth: 0, backgroundColor: '#FFF' }

		return (
			<View style={[splitItem, extraStyles]}>
				<View style={itemMethod} />
				<View style={itemValue}>
					<KyteText weight={'Semibold'} size={15} pallete={textColor} testProps={generateTestID('balance-pms')}>
						{hasChange ? `${I18n.t('words.s.change')}: ` : `${I18n.t('paymentSplitRemainingLabel')}: `}
						<CurrencyText value={hasChange ? payBack : paymentRemaining} />
					</KyteText>
				</View>
			</View>
		)
	}

	renderAddPaymentButton() {
		return (
			<ActionButton
				style={styles.buttonsSpace}
				onPress={() => this.showMethods()}
				testProps={generateTestID('add-pay-pms')}
			>
				{I18n.t('paymentSplitAddButton')}
			</ActionButton>
		)
	}

	renderConcludeButton() {
		const { totalNet, currentSale, store, paymentRemaining, payments } = this.props
		const isOrder = !!currentSale.id
		const isBetaActive = isBetaCatalog(store?.catalog?.version)
		const isPaymentPix = payments.some((item) => item.type === PaymentType.PIX)
		const showQRCodeGenerateButton = store?.pix?.enabled && isBetaActive && !paymentRemaining && isPaymentPix

		return (
			<>
				{isOrder && !isPaymentPix ? (
					<PaymentSaveButton onPress={() => this.checkCurrentSaleStock(null)} style={{ marginBottom: 8 }} />
				) : null}
				{showQRCodeGenerateButton && <GenerateQrCodeButton isSplitCheckout />}
				<ActionButton
					alertTitle={''}
					alertDescription={I18n.t('paymentConcludeAlertDescription')}
					onPress={() => this.checkCurrentSaleStock(statusNames.CLOSED)}
					style={styles.buttonsSpace}
				>
					{`${I18n.t('paymentConcludeButton')} `}
					<CurrencyText value={totalNet} />
				</ActionButton>
			</>
		)
	}

	renderPayLaterButton() {
		const { customer } = this.props
		const { paymentRemaining } = this.props
		const payLaterPayment = PaymentType.items[PaymentType.PAY_LATER]
		const key = Features.items[Features.CUSTOMER_ACCOUNT].key
		const remoteKey = Features.items[Features.CUSTOMER_ACCOUNT].remoteKey

		const checkCustomerIsAllowed = () => {
			if (!customer.allowPayLater) return this.goToAllowCustomerInDebit(customer, payLaterPayment)
			this.goToCustomerBalance(payLaterPayment)
		}

		const onPressPayLater = () => {
			this.props.checkFeatureIsAllowed(
				key,
				() => {
					if (!customer) return this.openCustomerAlert({ disableCredit: true, payment: payLaterPayment })
					checkCustomerIsAllowed()
				},
				remoteKey
			)
		}

		return (
			<ActionButton
				alertTitle={''}
				cancel
				alertDescription={I18n.t('paymentConcludeAlertDescription')}
				onPress={() => onPressPayLater()}
				style={styles.buttonsSpace}
				textStyle={SMALL_SCREENS ? { fontSize: 16 } : {}}
				testProps={generateTestID('pay-later-plcc')}
			>
				{`${I18n.t('paymentSplitPayLaterButton')} `}
				<CurrencyText value={paymentRemaining} />
			</ActionButton>
		)
	}

	renderModalPayments() {
		const { mercadoPago, payments, customer, currency } = this.props
		const blackList = getIsBRAndUseBRL(currency) ? [PaymentType.LINK] : [PaymentType.LINK, PaymentType.PIX]
		const hasPixPayment = payments.some((item) => item.type === PaymentType.PIX)
		const paymentList = selectPayments(mercadoPago.isActivated, blackList)
		const accountPayment = PaymentType.items[PaymentType.ACCOUNT]
		const hasAccountPayment = payments.find((p) => p.type === accountPayment.type)
		const customerWithoutCredit = () => customer && customer.accountBalance <= 0
		const disableConditions = customer && (hasAccountPayment || customerWithoutCredit())
		const disabledListGenerate = () => {
			const disabledList = []
			if (disableConditions) disabledList.push(accountPayment.type)
			if (hasPixPayment) disabledList.push(PaymentType.PIX)
			return disabledList
		}
		const disabledList = disabledListGenerate()

		return (
			<PaymentMethodsModal
				hideModal={this.hideMethods.bind(this)}
				onPress={this.choosePayment.bind(this)}
				payments={paymentList}
				disabledList={disabledList}
			/>
		)
	}

	showNoCreditAvailableAlert() {
		const hideModal = () => this.setState({ showNoCreditAvailableAlert: false })

		return <NoCreditAvailableAlert hideModal={() => hideModal()} />
	}

	goBackAction() {
		const { navigate } = this.props.navigation

		this.props.currentSaleResetPaidValues()
		navigate({ key: 'PaymentPage', name: 'Payment' })
	}

	renderInsufficientStockModal() {
		const { showConfirmInsufficientStockModal, insufficientStockConcludeStatus } = this.state
		const { navigate } = this.props.navigation
		const goToCart = () => navigate({ name: 'Cart', key: 'CartPage' })
		return (
			<InsufficientStockModal
				isModalVisible={showConfirmInsufficientStockModal}
				hideModal={() => this.setState({ showConfirmInsufficientStockModal: false })}
				continueAnyway={() => this.goToReceipt(insufficientStockConcludeStatus)}
				goToCart={() => goToCart()}
			/>
		)
	}

	render() {
		const { changeApiError, isModalVisible, showNoCreditAvailableAlert } = this.state
		const {
			hasApiError,
			customer,
			totalNet,
			payments,
			paymentRemaining,
			isInSplitPayment,
			customerDetail,
			storeAllowPaylater,
			isLoading,
		} = this.props
		const { outerContainer } = scaffolding
		const { splitItem, itemMethod, itemValue, headerLabelText } = styles
		const { navigate } = this.props.navigation
		const acountPayment = PaymentType.items[PaymentType.ACCOUNT]
		const payLaterPayment = PaymentType.items[PaymentType.PAY_LATER]

		const hasPayLater = payments.find((p) => p.type === payLaterPayment.type)
		const hasAccountPayment = payments.find((p) => p.type === acountPayment.type)

		const showPayLaterButton = () => {
			if (!customer || !customerDetail || !storeAllowPaylater) return false

			const customerWithCredit = customerDetail.accountBalance > 0
			const customerWithoutCredit = customerDetail.accountBalance <= 0

			if (customerWithCredit) return paymentRemaining > 0 && hasAccountPayment
			if (customerWithoutCredit) return paymentRemaining > 0 && !hasPayLater
		}

		return (
			<KyteSafeAreaView style={outerContainer}>
				<KyteToolbar
					innerPage
					borderBottom={1.5}
					headerTitle={I18n.t('paymentSplitPageTitle')}
					rightComponent={customer ? this.renderCustomer() : this.renderCustomerIcon()}
					goBack={isInSplitPayment ? null : () => this.goBackAction()}
					hideClose={isInSplitPayment}
					navigate={navigate}
				/>
				<View style={styles.expand}>
					<View style={[splitItem, { backgroundColor: colors.lightBg }]}>
						<View style={itemMethod}>
							<Text style={headerLabelText}>{`${I18n.t('paymentSplitTotalLabel').toUpperCase()}:`}</Text>
						</View>
						<View style={itemValue}>
							<KyteText
								size={14}
								weight={'Semibold'}
								pallete={'secondaryBg'}
								testProps={generateTestID('total-due-pms')}
							>
								<CurrencyText value={totalNet} />
							</KyteText>
						</View>
					</View>
					{payments.length ? this.renderMethodsContainer() : this.renderEmptyPayment()}
				</View>
				{isModalVisible ? this.renderModalPayments() : null}
				<View>
					{showPayLaterButton() ? this.renderPayLaterButton() : null}
					{paymentRemaining <= 0 ? this.renderConcludeButton() : this.renderAddPaymentButton()}
				</View>
				{showNoCreditAvailableAlert ? this.showNoCreditAvailableAlert() : null}
				{this.renderInsufficientStockModal()}
				{isLoading ? <LoadingCleanScreen /> : null}
				{hasApiError && (
					<ApiGenericErrorModal
						textStyles={{ textAlign: 'center' }}
						errorTitle={I18n.t('ops.somethingWentWrong')}
						errorText={I18n.t('qrCodeGenerateError')}
						isModalVisible={hasApiError}
						hideModal={() => changeApiError(false)}
					/>
				)}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	expand: { flex: 1 },
	splitItem: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: colors.littleDarkGray,
		backgroundColor: '#FFF',
		paddingHorizontal: 18,
		paddingVertical: 8,
		height: 65,
		flex: 0.1,
	},
	itemMethod: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	itemValue: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	deleteCircle: {
		borderRadius: 40,
		width: 30,
		height: 32,
		marginRight: 15,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.littleDarkGray,
	},
	headerLabelText: {
		fontFamily: 'Graphik-Medium',
		fontSize: 14,
		color: colors.secondaryBg,
	},
	splitInfoContainer: {
		flex: 0.8,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: SMALL_SCREENS ? 30 : 70,
	},
	splitInfo: {
		lineHeight: 20,
		fontFamily: 'Graphik-Regular',
		color: colors.primaryColor,
		textAlign: 'center',
		fontSize: 16,
		// marginBottom: 40
	},
	methodsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		borderTopWidth: 0.5,
		borderBottomWidth: 0.5,
		borderColor: colors.borderColor,
	},
	methodsContainerTitle: {
		alignItems: 'center',
		paddingVertical: 25,
	},
	buttonsSpace: { marginBottom: 10 },
}

const mapStateToProps = ({ currentSale, externalPayments, common, preference, customers, auth }) => {
	const { totalNet, totalSplit, customer, payments, paymentRemaining, payBack } = currentSale
	return {
		store: auth.store,
		totalNet,
		totalSplit,
		customer,
		payments,
		paymentRemaining,
		currentSale,
		payBack,
		customerDetail: customers.detail,
		mercadoPago: externalPayments.mercadoPago,
		currency: preference.account.currency,
		isInSplitPayment: common.isInSplitPayment,
		storeAllowPaylater: preference.account.allowPayLater,
		isLoading: common.loader.visible,
		hasApiError: common.hasApiError,
	}
}

export default connect(mapStateToProps, {
	currentSaleSplitPayment,
	currentSaleSetStatus,
	currentSaleRemovePayment,
	currentSaleSetInSplitPayment,
	checkFeatureIsAllowed,
	customerDetailUpdate,
	customerManageNewBalance,
	customerAccountUpdateBalance,
	customerFetchById,
	currentSaleResetPaidValues,
	checkCurrentSaleStock,
	changeApiError,
})(SplitPayment)
