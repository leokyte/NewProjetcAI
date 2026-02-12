import { View, TouchableOpacity, ScrollView } from 'react-native'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import ViewShot from 'react-native-view-shot'
import Share from 'react-native-share'
import { KyteText, KyteIcon, CurrencyText, ListOptionsWide, LoadingCleanScreen, KyteSafeAreaView } from '../../common'
import {
	checkFeatureIsAllowed,
	sendCustomerAccountReceiptByEmail,
	printCustomerStatements,
} from '../../../stores/actions'
import { scaffolding, colors } from '../../../styles'
import LeftAlignedImage from '../../common/LeftAlignedImage'
// import StatementItem from '../common/StatementItem';
import { Period, Features, PaymentType, PHOTO_LIBRARY } from '../../../enums'
import { xor, formatHeaderLabel } from '../../../util'
import { requestPermission } from '../../../util/util-permissions'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'

const Strings = {
	CURRENT_BALANCE: I18n.t('customerAccount.currentBalance'),
	FOOTER_TITLE: I18n.t('customerAccount.printAccountStatementLabel'),
	CREDIT: I18n.t('customerAccount.customerDetailFilterAccountCredits'),
	DEBIT: I18n.t('customerAccount.customerDetailFilterReceivables'),
	STATEMENT_HEADER_TRANSACTION: I18n.t('words.s.activity'),
	STATEMENT_HEADER_BALANCE: I18n.t('words.s.balance'),
	OPTIONS_LABEL_COMPLETE: I18n.t('words.s.complete'),
	OPTIONS_LABEL_SUMMED: I18n.t('words.s.summary'),
	STATEMENTS_WARNING: I18n.t('customerAccount.printAccountStatementInfo'),
	COMPLETE_REPORT_LABEL: I18n.t('completeReport'),
	LAST_10_LABEL: I18n.t('filterLast10Transactions'),
}

const PADDING_HORIZONTAL = 20

class CustomerAccountReceipt extends Component {
	constructor(props) {
		super(props)

		this.viewShotRef = React.createRef()

		this.state = {
			filterLabel: '',
			storeLabel: '',
			customerLabel: '',
			dateTimeLabel: '',
			printerKey: Features.items[Features.PRINTERS].key,
			printerRemoteKey: Features.items[Features.PRINTERS].remoteKey,
			isPlanAllowed: false,
			reasonMap: {},
		}
	}

	UNSAFE_componentWillMount() {
		this.generateFilterLabel()
		this.generateFormatedInfos()
		this.checkPlanKeys()
	}

	async checkPlanKeys() {
		const { printerKey } = this.state
		this.setState({ isPlanAllowed: await this.props.checkPlanKeys(printerKey) })
	}

	takeShot() {
		const viewShot = this.viewShotRef.current
		if (!viewShot) {
			return
		}
		viewShot.capture().then((uri) => {
			Share.open({
				title: '',
				message: '',
				url: uri,
			})
		})
	}

	findPaymentType(type) {
		const item = Object.values(PaymentType.items).find((pt) => pt.type === type)
		return item ? item.description : ''
	}

	generateFormatedInfos() {
		const { store, customer } = this.props
		const stockHistoricalFilter = I18n.t('stockHistoricalFilter')

		const reasonMap = {
			IN: stockHistoricalFilter.insert,
			OUT: stockHistoricalFilter.deduct,
			SALE: stockHistoricalFilter.sale,
			SALE_CANCELLED: stockHistoricalFilter.canceledSale,
		}

		this.setState({ storeLabel: formatHeaderLabel(store.phone, store.headerExtra) })
		this.setState({
			customerLabel: formatHeaderLabel(
				customer.celPhone || customer.phone,
				`${customer.address || ''} ${customer.addressComplement || ''}`
			),
		})
		this.setState({ dateTimeLabel: moment().format('MMMM Do YYYY[\n] H:MM') })
		this.setState({ reasonMap })
	}

	generateFilterLabel() {
		const { period, selectedSellers, transactionType, days } = this.props.filter
		let filterLabel = ''

		const findPeriodDescription = () => `${Object.values(Period.items).find((p) => p.period === period).description}. `
		const generateDateRange = () =>
			`${moment(days.start).format('MMM Do YY')} até ${moment(days.end).format('MMM Do YY')}. `
		const generateSellers = () =>
			selectedSellers.reduce(
				(final, s, i) => (final += i === selectedSellers.length - 1 ? `${s.name}. ` : `${s.name}, `),
				''
			)
		const generateTransactionTypes = `${transactionType.debit ? Strings.DEBIT : Strings.CREDIT}. `

		filterLabel += period ? findPeriodDescription() : generateDateRange()
		filterLabel += xor(transactionType.debit, transactionType.credit) ? generateTransactionTypes : ''
		filterLabel += selectedSellers.length ? generateSellers() : ''

		filterLabel = `${Strings.FOOTER_TITLE}: ${filterLabel.trim()}`

		this.setState({ filterLabel })
	}

	navigateToReceiptSendEmail() {
		const { navigate } = this.props.navigation
		const receiptPayload = this.generateAccountReceiptPayload()
		navigate({
			key: 'ReceiptSendEmailPage',
			name: 'ReceiptSendEmail',
			params: {
				origin: 'customer-account',
				receiptSender: (email, callback) => {
					this.props.sendCustomerAccountReceiptByEmail(
						{
							...receiptPayload,
							userLanguage: I18n.t('locale'),
							receiver: email,
						},
						callback
					)
				},
			},
		})
	}

	generateAccountReceiptPayload() {
		const { store, customer, currency, decimalCurrency } = this.props
		const { filterLabel, storeLabel, customerLabel, dateTimeLabel, reasonMap } = this.state

		const receipt = {
			reasonMap,
			paymentTypeItems: Object.values(PaymentType.items),
			statementHeader: {
				transaction: Strings.STATEMENT_HEADER_TRANSACTION.toUpperCase(),
				balance: Strings.STATEMENT_HEADER_BALANCE.toUpperCase(),
			},
			store: {
				imageURL: store.imageURL,
				name: store.name,
				info: storeLabel,
			},
			customer: {
				name: customer.name,
				info: customerLabel,
				balance: customer.accountBalance,
				statements: customer.accountStatements,
				balanceLabel: Strings.CURRENT_BALANCE.toUpperCase(),
			},
			footer: {
				label: filterLabel,
				datetime: {
					date: dateTimeLabel.split('\n')[0],
					time: dateTimeLabel.split('\n')[1],
				},
			},
			currency: {
				currencySymbol: currency.currencySymbol,
				decimalSeparator: currency.decimalSeparator,
				groupingSeparator: currency.groupingSeparator,
				decimalCurrency,
			},
		}
		return receipt
	}

	renderNavigationBackContainer() {
		const { goBack } = this.props.navigation
		return (
			<View style={{ padding: 20 }}>
				<TouchableOpacity onPress={() => goBack()}>
					<KyteIcon name="close-navigation" color={colors.secondaryBg} size={16} />
				</TouchableOpacity>
			</View>
		)
	}

	renderHeader() {
		const { store, customer } = this.props
		const { storeLabel, customerLabel, dateTimeLabel } = this.state

		const renderHeaderSection = (title, customerFlag, label) => (
			<View style={{ marginBottom: 20 }}>
				{title ? (
					<View style={{ flexDirection: 'row' }}>
						{customerFlag ? (
							<KyteIcon name="customer-filled" color={colors.secondaryBg} size={12} style={{ marginRight: 5 }} />
						) : null}
						<KyteText pallete="secondaryBg" size={12} weight="Semibold">
							{title}
						</KyteText>
					</View>
				) : null}
				<View style={{ marginTop: 8, flexDirection: 'row' }}>
					<KyteText style={{ lineHeight: 15 }}>{label}</KyteText>
				</View>
			</View>
		)

		return (
			<View style={{ marginTop: 10, paddingHorizontal: PADDING_HORIZONTAL }}>
				<View style={{ height: 60, flexDirection: 'row' }}>
					<View style={{ flex: 1, paddingRight: 15 }}>
						{store.imageURL ? (
							<LeftAlignedImage width={100} height={50} source={{ uri: store.imageURL }} />
						) : (
							<KyteText pallete="secondaryBg" weight="Semibold" size={18}>
								{store.name}
							</KyteText>
						)}
					</View>
					<KyteText weight="Medium" style={{ textAlign: 'right' }}>
						{dateTimeLabel}
					</KyteText>
				</View>
				{renderHeaderSection(store.imageURL ? store.name : '', false, storeLabel)}
				{renderHeaderSection(customer.name, true, customerLabel)}
			</View>
		)
	}

	renderBalance() {
		const { customer } = this.props
		const isDebit = customer.accountBalance < 0
		return (
			<View
				style={{
					paddingVertical: 20,
					paddingHorizontal: PADDING_HORIZONTAL,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					backgroundColor: colors.lightBg,
				}}
			>
				<KyteText weight="Medium">{Strings.CURRENT_BALANCE.toUpperCase()}</KyteText>
				<KyteText pallete={isDebit ? 'errorColor' : 'actionColor'} size={24}>
					<CurrencyText value={customer.accountBalance} />
				</KyteText>
			</View>
		)
	}

	renderReceiptLabel() {
		const { filterLabel } = this.state
		return (
			<View
				style={{
					alignItems: 'center',
					marginHorizontal: PADDING_HORIZONTAL,
					paddingVertical: 20,
					borderBottomWidth: 1,
					borderColor: colors.littleDarkGray,
				}}
			>
				<KyteText weight="Semibold">{filterLabel}</KyteText>
			</View>
		)
	}

	renderCustomerStatements() {
		const { accountStatements } = this.props.customer
		const { reasonMap } = this.state

		const headerTd = (text) => (
			<KyteText weight="Medium" size={14}>
				{text}
			</KyteText>
		)

		return (
			<View style={{ paddingHorizontal: PADDING_HORIZONTAL }}>
				<View style={styles.statementHeader}>
					{headerTd(Strings.STATEMENT_HEADER_TRANSACTION.toUpperCase())}
					{headerTd(Strings.STATEMENT_HEADER_BALANCE.toUpperCase())}
				</View>
				{accountStatements.slice(0, 10).map((item, i) => {
					const color = item.type === 'OUT' ? colors.errorColor : colors.actionColor
					const newCurrentColor = item.newCurrent < 0 ? colors.errorColor : colors.actionColor
					const dateCreation = moment(item.dateCreation).format('L')
					const reasonLabel = item.reason === 'IN' ? this.findPaymentType(item.paymentType) : reasonMap[item.reason]
					return (
						<View key={i} style={styles.statementContainer}>
							<View style={{ width: 25 }}>
								<KyteText weight="Medium" style={{ lineHeight: 12 }}>
									{`#${item.movementNumber}`}
								</KyteText>
							</View>
							<View>
								<KyteIcon name={`arrow-${item.type.toLowerCase()}`} size={14} color={color} />
							</View>
							<View style={{ flex: 1, paddingHorizontal: 5 }}>
								<KyteText weight="Medium">
									<CurrencyText value={item.value} />
								</KyteText>
								<KyteText pallete="grayBlue" style={{ marginTop: 2 }}>
									{`${reasonLabel} (${dateCreation})`}
								</KyteText>
							</View>
							<View>
								<KyteText color={newCurrentColor}>
									<CurrencyText value={item.newCurrent} />
								</KyteText>
							</View>
						</View>
					)
				})}
			</View>
		)
	}

	renderStatementsWarning(total) {
		return (
			<View style={{ marginHorizontal: PADDING_HORIZONTAL, padding: 20, backgroundColor: colors.littleDarkGray }}>
				<KyteText style={{ textAlign: 'center', lineHeight: 15 }} size={11}>
					{Strings.STATEMENTS_WARNING.replace('$movementCount', total > 10 ? 10 : total).replace(
						'$totalMovement',
						total
					)}
				</KyteText>
			</View>
		)
	}

	renderFooter() {
		const { filterLabel, dateTimeLabel } = this.state
		return (
			<View style={{ alignItems: 'center', paddingVertical: 20 }}>
				<KyteText weight="Semibold">{filterLabel}</KyteText>
				<KyteText style={{ marginTop: 5 }}>{dateTimeLabel}</KyteText>
			</View>
		)
	}

	renderOptions() {
		const { printerKey, printerRemoteKey, isPlanAllowed } = this.state
		const { customer } = this.props
		const { email, share, print } = I18n.t('words.s')

		const options = [
			{
				title: email,
				subtitle: Strings.COMPLETE_REPORT_LABEL,
				icon: { icon: 'send', color: '#FFF' },
				onPress: () => this.navigateToReceiptSendEmail(),
				// badge: {
				//   label: Strings.OPTIONS_LABEL_COMPLETE.toUpperCase(),
				//   color: 'white'
				// }
			},
			{
				title: print,
				subtitle: Strings.LAST_10_LABEL,
				icon: { icon: 'printer', color: '#FFF' },
				onPress: () =>
					this.props.checkFeatureIsAllowed(
						printerKey,
						() => this.props.printCustomerStatements(customer),
						printerRemoteKey
					),
				shareOptionsProLabel: !isPlanAllowed,
				// badge: {
				//   label: Strings.OPTIONS_LABEL_SUMMED.toUpperCase(),
				//   color: colors.grayBlue
				// }
			},
			{
				title: share,
				subtitle: Strings.LAST_10_LABEL,
				icon: { icon: 'share', color: '#FFF' },
				onPress: async () => {
					const hasPermission = await requestPermission(PHOTO_LIBRARY)
					if (hasPermission) {
						this.takeShot()
						logEvent('CustomerAccountReceiptShared')
					}
				},
				// badge: {
				//   label: Strings.OPTIONS_LABEL_SUMMED.toUpperCase(),
				//   color: colors.grayBlue
				// }
			},
		]

		return <ListOptionsWide reverseColor items={options} titleStyle={{ fontSize: 12 }} />
	}

	renderReceipt() {
		const { accountStatements } = this.props.customer
		const showWarning = accountStatements.length > 10
		return (
			<View style={{ paddingBottom: 10 }}>
				{this.renderHeader()}
				{this.renderBalance()}
				{this.renderReceiptLabel()}
				{this.renderCustomerStatements()}
				{showWarning ? this.renderStatementsWarning(accountStatements.length) : null}
			</View>
		)
	}

	renderLoader() {
		return <LoadingCleanScreen />
	}

	render() {
		return (
			<KyteSafeAreaView style={scaffolding.outerContainer}>
				<ScrollView>
					{this.renderNavigationBackContainer()}
					<ViewShot
						ref={this.viewShotRef}
						options={{ format: 'png', quality: 0.9, result: 'tmpfile' }}
						style={{ backgroundColor: 'white' }}
					>
						{this.renderReceipt()}
					</ViewShot>
				</ScrollView>
				{this.renderOptions()}
				{this.props.isLoaderVisible ? this.renderLoader() : null}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	statementContainer: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderColor: colors.littleDarkGray,
		paddingVertical: 7,
		// justifyContent: 'center',
		alignItems: 'center',
	},
	statementHeader: {
		paddingVertical: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
}

const mapStateToProps = ({ auth, customers, preference, common }) => ({
	store: auth.store,
	customer: customers.detail,
	filter: customers.accountFilter,
	currency: preference.account.currency,
	decimalCurrency: preference.account.decimalCurrency,
	isLoaderVisible: common.loader.visible,
})

export default connect(mapStateToProps, {
	checkFeatureIsAllowed,
	sendCustomerAccountReceiptByEmail,
	printCustomerStatements,
})(CustomerAccountReceipt)
