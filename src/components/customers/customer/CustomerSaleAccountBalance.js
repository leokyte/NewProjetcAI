import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, ScrollView } from 'react-native'

import {
	CenterContent,
	ActionButton,
	KyteText,
	CurrencyText,
	KyteIcon,
	LoadingCleanScreen,
	KyteToolbar,
	KyteSafeAreaView,
	PaymentSaveButton,
	InsufficientStockModal,
} from '../../common'
import CustomerImage from '../image/CustomerImage'
import {
	customerAccountEditBalance,
	customerAccountResetBalance,
	currentSaleAddPayment,
	currentSaleSetStatus,
	currentSaleSplitPayment,
	checkCurrentSaleStock,
} from '../../../stores/actions'
import NavigationService from '../../../services/kyte-navigation'
import I18n from '../../../i18n/i18n'
import { PaymentType } from '../../../enums'
import { gridStyles, colors } from '../../../styles'
import { generateTestID, trackSaleFinishOrSaveEvent } from '../../../util'
import { logEvent } from '../../../integrations'

class CustomerAccountBalance extends Component {
	constructor(props) {
		super(props)

		this.state = {
			// Insufficient stock stuff
			showConfirmInsufficientStockModal: false,
			insufficientStockConcludeStatus: null,
			customerState: !props.currentSale.customer
				? props.customer
				: props.customer.id
				? props.customer
				: props.currentSale.customer,
		}
	}

	addSplitPayment(isSplit = false) {
		const { payments, currentSale } = this.props
		const { params } = this.props.route
		let paramSplit = isSplit
		paramSplit = params && params.split
		const paramPayment = params && params.payment
		const useRemaining = params && params.useRemaining
		const payment = paramPayment || payments[0]
		const { accountBalance } = this.state.customerState
		const chargedValue = useRemaining ? currentSale.paymentRemaining : accountBalance
		const randomizePaymentId = () => Math.floor(Math.random() * 10000)

		switch (payment.type) {
			default: {
				this.props.currentSaleAddPayment(
					payment.type,
					payment.description,
					chargedValue,
					paramSplit,
					randomizePaymentId()
				)
				break
			}
			case 'mercadopago':
				return
		}
		this.props.currentSaleSplitPayment()
	}

	goToSplitAction() {
		const { navigation, loader } = this.props
		const { navigate } = navigation

		// hiding loading
		if (loader.visible) {
			this.props.stopLoading()
		}

		this.addSplitPayment()
		navigate({ key: 'SplitPaymentPage', name: 'SplitPayment' })
	}

	goToReceipt(newStatus) {
		const { currentSale } = this.props
		trackSaleFinishOrSaveEvent({ sale: currentSale, status: newStatus })
		this.props.currentSaleSetStatus(newStatus, currentSale.status)
		NavigationService.reset('Receipt', 'Receipt')
	}

	concludeTransaction(newStatus) {
		const { params } = this.props.route

		if (params.useSplit) return this.goToSplitAction()
		this.goToReceipt(newStatus)
	}

	checkCurrentSaleStock(status) {
		const stockOk = this.props.checkCurrentSaleStock(true) // true indicates to check only status = OPENED
		if (stockOk) {
			return this.concludeTransaction(status)
		}

		return this.setState({ showConfirmInsufficientStockModal: true, insufficientStockConcludeStatus: status })
	}

	renderLoading() {
		return <LoadingCleanScreen />
	}

	renderCustomerImage() {
		return <CustomerImage customer={this.state.customerState} style={gridStyles.flexImage} />
	}

	renderCustomerLabel() {
		const { name } = this.state.customerState
		const size = 28
		return (
			<KyteText color="#FFF" weight="Medium" size={size} uppercase style={{ lineHeight: size }}>
				{name?.substr(0, 2)}
			</KyteText>
		)
	}

	renderBottomContainer() {
		const { params } = this.props.route
		const { currentSale } = this.props
		const { transactionBalance } = this.props.customer.manageCustomerAccount
		const { accountBalance } = this.state.customerState
		const isCredit = accountBalance > 0
		const ctaColor = isCredit ? colors.actionColor : colors.barcodeRed
		const constinerStyle = { paddingVertical: 10 }
		const isOrder = !!currentSale.id

		const canSaveAsPayment = isOrder && !params.useSplit

		const generateCtaText = () => {
			// Order
			// if (canSaveAsPayment) return I18n.t('orderConcludeButton');

			// Sale
			if (isCredit) return I18n.t('customerAccount.creditPayConfirmation')
			return (
				<>
					{`${I18n.t('customerAccount.payLaterConfirmation')} `}
					<CurrencyText value={Math.abs(transactionBalance)} />
				</>
			)
		}

		return (
			<View style={constinerStyle}>
				{canSaveAsPayment ? (
					<PaymentSaveButton onPress={() => this.checkCurrentSaleStock(null)} style={{ marginBottom: 8 }} />
				) : null}
				<ActionButton
					alertTitle={I18n.t('words.s.attention')}
					alertDescription="alertDescription"
					onPress={() => this.checkCurrentSaleStock('closed')}
					disabled={false}
					color={ctaColor}
					testProps={generateTestID('user-credit')}
				>
					{generateCtaText()}
				</ActionButton>
			</View>
		)
	}

	renderInsufficientStockModal() {
		const { showConfirmInsufficientStockModal, insufficientStockConcludeStatus } = this.state
		const { navigate } = this.props.navigation
		const goToCart = () => navigate({ name: 'Cart', key: 'CartPage' })

		return (
			<InsufficientStockModal
				isModalVisible={showConfirmInsufficientStockModal}
				hideModal={() => this.setState({ showConfirmInsufficientStockModal: false })}
				continueAnyway={() => this.concludeTransaction(insufficientStockConcludeStatus)}
				goToCart={() => goToCart()}
			/>
		)
	}

	goBackAction() {
		const { navigation, totalNet, totalPay } = this.props
		const money = PaymentType.items[PaymentType.MONEY]

		this.props.currentSaleAddPayment(money.type, money.description, totalNet, false, null, null, totalPay)
		navigation.goBack()
	}

	render() {
		const { loader } = this.props
		const { transactionBalance, paymentType, actualBalance, newBalance } = this.props.customer.manageCustomerAccount
		const { accountBalance } = this.state.customerState
		const { image, name } = this.state.customerState
		const isCredit = accountBalance > 0
		const positiveTransaction = transactionBalance > 0
		const statementColor = positiveTransaction ? 'actionColor' : 'errorColor'

		const valueColor = (value) => (value < 0 ? 'errorColor' : value > 0 ? 'actionColor' : 'primaryColor')

		return (
			<KyteSafeAreaView style={styles.outerContainer}>
				<KyteToolbar
					innerPage
					headerTitle={I18n.t('customerAccount.customerAccountBalanceTitle')}
					borderBottom={1}
					goBack={() => this.goBackAction()}
				/>
				<ScrollView>
					<CenterContent style={{ backgroundColor: colors.lightBg, paddingVertical: 55 }}>
						<View style={styles.customerCircle}>{image ? this.renderCustomerImage() : this.renderCustomerLabel()}</View>
						<KyteText
							ellipsizeMode="tail"
							numberOfLines={1}
							size={20}
							weight="Semibold"
							style={{ color: colors.primaryDarker }}
							{...generateTestID('cust-name-sctc')}
						>
							{name}
						</KyteText>
					</CenterContent>
					<View style={styles.balanceContainer}>
						<View style={styles.balanceRow}>
							<KyteText style={styles.balanceLabel} size={15} weight="Regular">
								{I18n.t('customerAccount.currentBalance')}
							</KyteText>
							<KyteText
								size={15}
								pallete={valueColor(actualBalance)}
								weight="Semibold"
								{...generateTestID('balance-sctc')}
							>
								<CurrencyText value={actualBalance} useBalanceSymbol={actualBalance !== 0 ? actualBalance : false} />
							</KyteText>
						</View>
						<View style={styles.balanceRow}>
							<View style={styles.balanceLabel}>
								<KyteIcon
									size={17}
									color={colors[statementColor]}
									style={styles.arrowStyle}
									name={positiveTransaction ? 'arrow-in' : 'arrow-out'}
								/>
								<KyteText size={15} weight="Regular">
									{isCredit ? I18n.t('customerAccount.paymentOut') : I18n.t('customerAccount.salePayLater')}
								</KyteText>
								<KyteIcon size={24} style={styles.iconStyle} color={colors.primaryColor} name={paymentType.icon} />
							</View>
							<KyteText
								size={15}
								pallete={valueColor(transactionBalance)}
								weight="Semibold"
								{...generateTestID('credit-sctc')}
							>
								<CurrencyText
									value={transactionBalance}
									useBalanceSymbol={transactionBalance < 0 ? transactionBalance : false}
								/>
							</KyteText>
						</View>
						<View style={[styles.balanceRow, { borderBottomWidth: 0 }]}>
							<KyteText style={styles.balanceLabel} size={17} weight="Medium">
								{I18n.t('customerAccount.newBalance')}
							</KyteText>
							<KyteText
								size={17}
								pallete={valueColor(newBalance)}
								weight="Semibold"
								{...generateTestID('new-bal-sctc')}
							>
								<CurrencyText value={newBalance} useBalanceSymbol={newBalance !== 0 ? newBalance : false} />
							</KyteText>
						</View>
					</View>
				</ScrollView>
				{this.renderBottomContainer()}
				{loader.visible ? this.renderLoading() : null}
				{this.renderInsufficientStockModal()}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	outerContainer: {
		flex: 1,
		backgroundColor: 'white',
	},
	balanceContainer: {
		flex: 1,
	},
	balanceRow: {
		padding: 20,
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderColor: colors.borderColor,
	},
	balanceLabel: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconStyle: { marginLeft: 15 },
	grayRow: { backgroundColor: colors.littleDarkGray },
	header: { height: 260 },
	customerCircle: {
		width: 90,
		height: 90,
		borderRadius: 75,
		backgroundColor: colors.primaryDarker,
		overflow: 'hidden',
		marginBottom: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	arrowStyle: {
		paddingRight: 15,
	},
}

const mapStateToProps = ({ customers, auth, common, currentSale, externalPayments, preference }) => ({
	customer: customers.detail,
	auth,
	loader: common.loader,
	payments: currentSale.payments,
	totalNet: currentSale.totalNet,
	totalPay: currentSale.totalPay,
	currency: preference.account.currency,
	currentSale,
})
export default connect(mapStateToProps, {
	customerAccountEditBalance,
	customerAccountResetBalance,
	currentSaleAddPayment,
	currentSaleSetStatus,
	currentSaleSplitPayment,
	checkCurrentSaleStock,
})(CustomerAccountBalance)
