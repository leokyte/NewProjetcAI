import React, { Component } from 'react'
import moment from 'moment'
import _ from 'lodash'
import { View, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import { Container } from '@kyteapp/kyte-ui-components'
import {
	KyteToolbar,
	Calculator,
	ActionButton,
	KyteText,
	CurrencyText,
	CenterContent,
	KyteIcon,
	LoadingCleanScreen,
	KyteSafeAreaView,
	TextCursor,
	PaymentSaveButton,
	InsufficientStockModal,
} from '../../common'
import {
	currentSaleAddPayment,
	currentSaleSetStatus,
	currentSaleSetTotalPay,
	currentSaleSetTotalPaid,
	currentSaleResetPaidValues,
	currentSaleSplitPayment,
	customerFetchById,
	customerManageNewBalance,
	mercadoPagoPayment,
	startLoading,
	stopLoading,
	checkCurrentSaleStock,
} from '../../../stores/actions'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'
import { scaffolding, colors } from '../../../styles'
import NavigationService from '../../../services/kyte-navigation'
import { generateTestID, isBetaCatalog, trackSaleFinishOrSaveEvent } from '../../../util'
import { PaymentType } from '../../../enums'
import GenerateQrCodeButton from '../../sales/GenerateQrCodeButton'

const SAFE_AREA_HEIGHT_LIMIT = 530

class PaymentEditionContainer extends Component {
	constructor(props) {
		super(props)

		const { totalNet, totalPay = '', payments, paymentRemaining } = props.currentSale
		const initialPaymentState = { ...payments[0] }

		this.state = {
			initialPayValue: totalNet,
			statePayValue: '',
			stateTotalPaid: paymentRemaining ? '' : totalPay,
			initialPaymentState,

			// inssuficient stock stuff
			showConfirmInsufficientStockModal: false,
			insufficientStockConcludeStatus: null,
			safeAreaHeight: undefined,
		}
	}

	componentDidMount() {
		logEvent('Checkout Payment Received View')
	}

	generatePageTitle() {
		return `${I18n.t('paymentPageTitle')}: ${this.payment.description}`
	}

	addMercadoPagoPayment(isSplit = false) {
		const { customer } = this.props.currentSale
		const paymentValue = parseFloat(this.currentValue || this.currentRemaining)
		const saleRandomNumber = Math.floor(Math.random() * 99999) + 1

		this.props.mercadoPagoPayment({
			amount: paymentValue,
			description: `K${saleRandomNumber}`,
			external_reference: saleRandomNumber,
			payer_email: customer ? customer.email : null,
			is_split: isSplit,
		})
	}

	addSplitPayment(isSplit = false) {
		const { statePayValue } = this.state
		const { params = {} } = this.props.route
		let paramSplit = isSplit
		paramSplit = params.split
		const randomizePaymentId = () => Math.floor(Math.random() * 10000)
		const paymentValue = parseFloat(statePayValue || this.currentRemaining)

		switch (this.payment.type) {
			default: {
				this.props.currentSaleAddPayment(
					this.payment.type,
					this.payment.description,
					paymentValue,
					paramSplit,
					randomizePaymentId()
				)
				break
			}
			case 'mercadopago':
				return this.props.currentSaleSplitPayment()
		}
		this.props.currentSaleSplitPayment()
	}

	goToReceipt() {
		NavigationService.reset('Receipt', 'Receipt', { origin: 'sale' })
	}

	goToSplitAction() {
		const { navigation, loader, route } = this.props
		const { navigate } = navigation
		const { params = {} } = route
		const { paymentCompleted } = params

		// hiding loading
		if (loader.visible) this.props.stopLoading()

		if (!paymentCompleted) this.addSplitPayment()
		this.setState({ initialPayValue: this.currentRemaining, statePayValue: '', stateTotalPaid: '' })
		navigate({ key: 'SplitPaymentPage', name: 'SplitPayment' })
	}

	concludeSale(nextStatus) {
		const { currentSale } = this.props
		const { initialPayValue } = this.state
		const isMoney = this.payment.type === 0
		const isMercadoPago = this.payment.type === 'mercadopago'
		const hasChange = isMoney && Number(this.currentValue) > Number(initialPayValue)
		const totalPaid = hasChange ? Number(this.currentValue) : Number(initialPayValue)

		this.props.currentSaleSetTotalPay(totalPaid)

		if (isMercadoPago) return this.addMercadoPagoPayment(this.useSplit)
		if (this.useSplit) return this.goToSplitAction()

		// this actions needs to be fired only if the sale has money payment
		this.props.currentSaleSetTotalPaid(totalPaid)
		const sale = this.props.currentSaleSetStatus(nextStatus, currentSale.status)

		trackSaleFinishOrSaveEvent({ sale: currentSale, status: nextStatus })
		if (sale) return this.goToReceipt(nextStatus)
	}

	backToPayments() {
		const { goBack, navigate } = this.props.navigation
		const { params = {} } = this.props.route
		const { payments } = this.props.currentSale
		const { page } = params

		const hasTransaction = _.find(payments, (item) => !!item.transaction)
		if (hasTransaction) return navigate({ key: 'SplitPaymentPage', name: 'SplitPayment' })

		if (page) return navigate({ key: page.key, name: page.name })
		goBack()
	}

	checkCurrentSaleStock(status) {
		const stockOk = this.props.checkCurrentSaleStock(true) // true indicates to check only status = OPENED
		if (stockOk) {
			return this.concludeSale(status)
		}

		return this.setState({ showConfirmInsufficientStockModal: true, insufficientStockConcludeStatus: status })
	}

	renderRemainingValue() {
		const { initialPayValue, safeAreaHeight } = this.state
		const isMoney = this.payment.type === 0
		const hasChange = isMoney && Number(this.currentValue) > initialPayValue
		// const textColor = hasChange || this.NotAllowBiggerValue ? 'primaryColor' : 'errorColor';
		const textColor = 'grayBlue'

		return (
			<KyteText
				style={styles.remaingValue(safeAreaHeight)}
				size={15}
				pallete={textColor}
				weight="Medium"
				{...generateTestID('total-bc-pmc')}
			>
				{this.NotAllowBiggerValue ? (
					I18n.t('customerAccount.notAllowBiggerValue')
				) : (
					<>
						{hasChange ? `${I18n.t('words.s.change')}: ` : `${I18n.t('paymentSplitRemainingLabel')}: `}
						<CurrencyText value={Math.abs(this.currentRemaining)} />
					</>
				)}
			</KyteText>
		)
	}

	renderOriginalValue() {
		const { totalNet } = this.props.currentSale
		return (
			<TouchableOpacity onPress={() => this.setState({ statePayValue: '' })}>
				<View style={styles.originalValueContainer}>
					<CenterContent>
						<KyteText size={16} weight="Semibold" style={{ color: colors.primaryDarker }}>
							<CurrencyText value={totalNet} />
						</KyteText>
					</CenterContent>
				</View>
			</TouchableOpacity>
		)
	}

	renderLoader() {
		return <LoadingCleanScreen />
	}

	renderActionsButtons() {
		const { currentSale, store } = this.props
		const { initialPayValue } = this.state
		const { params = {} } = this.props.route
		const paramPayment = params.payment
		const usingExternalPayments = paramPayment.type === 'mercadopago'
		const isOrder = !!currentSale.id
		const isBetaActive = isBetaCatalog(store?.catalog?.version)
		const isPaymentPix = this.payment.type === PaymentType.PIX
		const firstPaymentIsPix = currentSale?.payments?.[0]?.type === PaymentType.PIX
		const showQRCodeGenerateButton = store?.pix?.enabled && isBetaActive && isPaymentPix && firstPaymentIsPix

		const errorMessages = [
			{ condition: this.NotAllowBiggerValue, message: I18n.t('customerAccount.notAllowBiggerValue') },
			{ condition: this.emptyValue, message: I18n.t('customerAccount.emptyValue') },
		]

		const displayErrorMessage = (condition) => {
			const item = errorMessages.find((error) => error.condition === condition)
			return item.message
		}

		const isAddPayment = this.useSplit || usingExternalPayments

		const displayCtaError = () => displayErrorMessage(this.NotAllowBiggerValue || this.emptyValue)
		const disabled = this.NotAllowBiggerValue || this.emptyValue

		const renderAddPayment = () => (
			<Container>
				{showQRCodeGenerateButton && <GenerateQrCodeButton disabled />}
				<ActionButton
					alertDescription={() => displayCtaError()}
					onPress={() => this.concludeSale()}
					rightIcon={<KyteIcon name="arrow-cart" color="white" size={15} />}
					disabled={disabled}
					testProps={generateTestID('next-pmc')}
				>
					{I18n.t('words.s.proceed')}
				</ActionButton>
			</Container>
		)

		const renderConcludeButtons = () => (
			<>
				{isOrder && !isPaymentPix ? (
					<PaymentSaveButton onPress={() => this.checkCurrentSaleStock(null)} style={{ marginBottom: 8 }} />
				) : null}
				<Container>
					{showQRCodeGenerateButton && <GenerateQrCodeButton />}

					<ActionButton
						alertDescription={() => displayCtaError()}
						onPress={() => this.checkCurrentSaleStock('closed')}
						disabled={disabled}
						testProps={generateTestID('next-pmc')}
					>
						{`${I18n.t('paymentConcludeButton')} `}
						<CurrencyText value={Math.abs(initialPayValue)} />
					</ActionButton>
				</Container>
			</>
		)

		return <View style={{ paddingVertical: 10 }}>{isAddPayment ? renderAddPayment() : renderConcludeButtons()}</View>
	}

	renderInsufficientStockModal() {
		const { showConfirmInsufficientStockModal, insufficientStockConcludeStatus } = this.state
		const { navigate } = this.props.navigation
		const goToCart = () => navigate({ name: 'Cart', key: 'CartPage' })
		return (
			<InsufficientStockModal
				isModalVisible={showConfirmInsufficientStockModal}
				hideModal={() => this.setState({ showConfirmInsufficientStockModal: false })}
				continueAnyway={() => this.concludeSale(insufficientStockConcludeStatus)}
				goToCart={() => goToCart()}
			/>
		)
	}

	render() {
		const { paymentRemaining, totalNet } = this.props.currentSale
		const { params = {} } = this.props.route
		const paramPayment = params.payment
		const paramSplit = params.split
		const { paymentCompleted } = params
		const { statePayValue, initialPayValue, initialPaymentState, stateTotalPaid, safeAreaHeight } = this.state
		const { visible } = this.props.loader
		this.currentValue = statePayValue || stateTotalPaid

		this.payment = paramPayment || initialPaymentState
		const lowerPayValue = this.currentValue && Number(this.currentValue) < initialPayValue
		const isNotMoney = this.payment.type !== 0
		const useRemaining = paymentRemaining > 0 ? paymentRemaining : 0

		// Corrigir paymentRemaing!
		this.emptyValue = this.currentValue && !Number(this.currentValue)
		this.useSplit = lowerPayValue || paramSplit
		this.showTotalHelpers = this.currentValue && Number(this.currentValue) !== initialPayValue
		this.currentRemaining = (paymentRemaining || totalNet) - Number(this.currentValue)
		this.NotAllowBiggerValue = isNotMoney && Number(this.currentValue) > (useRemaining || initialPayValue)

		const totalValue = this.currentValue || useRemaining || totalNet

		return (
			<KyteSafeAreaView
				style={scaffolding.outerContainer}
				onLayout={(event) => {
					this.setState({ safeAreaHeight: event.nativeEvent.layout.height })
				}}
			>
				<KyteToolbar
					innerPage
					borderBottom={1}
					headerTitle={this.generatePageTitle()}
					goBack={() => this.backToPayments()}
				/>
				<CenterContent>
					<KyteText style={styles.numberTitle(safeAreaHeight)} uppercase size={14}>
						{I18n.t('customerAccount.receivingValue')}
					</KyteText>
					<View style={styles.valueContainer(safeAreaHeight)}>
						<CurrencyText
							value={totalValue}
							currencyColor={colors.actionColor}
							numberColor={colors.actionColor}
							isSplitted
							testProps={generateTestID('total-pmc')}
						/>
						<TextCursor cursorStyle={styles.cursorStyle} />
					</View>
					{this.showTotalHelpers ? this.renderRemainingValue() : null}
				</CenterContent>
				{this.showTotalHelpers ? this.renderOriginalValue() : null}
				<View style={{ backgroundColor: 'white', flex: 1.3 }}>
					<Calculator
						state={this}
						stateProp="statePayValue"
						stateValue={statePayValue}
						valuePrecision={2}
						valueType="decimal"
						disablePress={paymentCompleted}
						noBackpress={paymentCompleted}
						noConfirm
					/>
				</View>
				{this.renderActionsButtons()}
				{visible ? this.renderLoader() : null}
				{this.renderInsufficientStockModal()}
			</KyteSafeAreaView>
		)
	}
}

const isSmallScreen = (height) => {
  if (!height) return false; 
  return height < SAFE_AREA_HEIGHT_LIMIT;
};

const styles = StyleSheet.create({
	numberTitle: (safeAreaHeight) => ({
		marginTop: isSmallScreen(safeAreaHeight) ? 10 : 15,
		color: colors.grayBlue,
	}),
	originalValueContainer: {
		backgroundColor: colors.lightBg,
		height: 35,
	},
	remaingValue: (safeAreaHeight) => ({
		marginTop: isSmallScreen(safeAreaHeight) ? 5 : 10,
		marginBottom: 10,
		lineHeight: 25,
		textAlign: 'center',
	}),
	valueContainer: (safeAreaHeight) => ({
		borderColor: colors.actionColor,
		paddingHorizontal: 15,
		paddingVertical: isSmallScreen(safeAreaHeight) ? 5 : 10,
		flexDirection: 'row',
		alignItems: 'center',
	}),
	cursorStyle: {
		fontFamily: 'Graphik-Light',
		fontSize: 46,
		color: colors.primaryColor,
		position: 'relative',
		marginLeft: 5,
	},
})

const mapStateToProps = (state) => ({
	payments: state.currentSale.payments,
	currentSale: state.currentSale,
	user: state.auth.user,
	mercadoPago: state.externalPayments.mercadoPago,
	currency: state.preference.account.currency,
	store: state.auth.store,
	loader: state.common.loader,
})

export default connect(mapStateToProps, {
	currentSaleAddPayment,
	currentSaleSetStatus,
	currentSaleSetTotalPay,
	currentSaleSetTotalPaid,
	currentSaleResetPaidValues,
	currentSaleSplitPayment,
	customerFetchById,
	customerManageNewBalance,
	mercadoPagoPayment,
	startLoading,
	stopLoading,
	checkCurrentSaleStock,
})(PaymentEditionContainer)
