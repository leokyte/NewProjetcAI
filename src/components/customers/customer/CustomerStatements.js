import { View, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { KyteSafeAreaView, KyteToolbar, KyteText, KyteIcon, LoadingCleanScreen } from '../../common'
import HeaderButton from '../../common/HeaderButton'
import StatementItem from '../common/StatementItem'
import {
	customerAccountGetStatements,
	customersClearAccountFilter,
	saleFetchById,
	refreshCustomerStatements,
} from '../../../stores/actions'
import { xor } from '../../../util'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { toList, Period } from '../../../enums'

const Strings = {
	HEADER_TRANSACTION: I18n.t('words.s.customerAccountTransaction'),
	HEADER_BALANCE: I18n.t('words.s.balance'),
	CUSTOMER_STATEMENTS_TITLE: I18n.t('customerAccount.customerStatementsTitle'),
}

class CustomerStatements extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			isLoading: false,
		}
	}

	componentDidMount() {
		this.callStatements()
	}

	callStatements() {
		const { customer } = this.props

		this.setState({ isLoading: true })
		this.props.customerAccountGetStatements(
			customer.id,
			null, // error
			() => this.setState({ isLoading: false })
		)
	}

	checkFiltering() {
		const { accountFilter, accountFilterInitial } = this.props
		return !(accountFilter === accountFilterInitial)
	}

	clearFilter() {
		this.props.customersClearAccountFilter()
		this.callStatements()
	}

	generateFilterString() {
		const { days, period, selectedSellers, transactionType } = this.props.accountFilter

		const dateView = (date) => moment(date).format('D MMM').toUpperCase()
		const selectedDays = days.start ? `${dateView(days.start)} ${I18n.t('words.s.to')} ${dateView(days.end)} ` : ''
		const findPeriod = period ? toList(Period).find((p) => p.period === period).description : ''
		const sellersNames = selectedSellers.map((s) => s.name).join(', ')
		const transactions = xor(transactionType.debit, transactionType.credit)
			? transactionType.debit
				? I18n.t('customerAccount.customerFilterReceivables')
				: I18n.t('customerAccount.customerFilterAccountCredits')
			: ''

		const filtersArray = [selectedDays, findPeriod, sellersNames, transactions]

		return filtersArray.filter((el) => el && el.length).join(', ')
	}

	renderHeader() {
		const renderHeaderLabel = (label) => (
			<KyteText pallete="grayBlue" weight="Semibold" size={11}>
				{label.toUpperCase()}
			</KyteText>
		)

		return (
			<View style={styles.headerContainer}>
				{renderHeaderLabel(Strings.HEADER_TRANSACTION)}
				{renderHeaderLabel(Strings.HEADER_BALANCE)}
			</View>
		)
	}

	renderStatements() {
		const { accountStatements } = this.props.customer
		const { navigate } = this.props.navigation

		const goToDetail = (statement, allowCancel) =>
			navigate({
				key: 'CustomerStatementDetailPage',
				name: 'CustomerStatementDetail',
				params: { statement, allowCancel },
			})

		const goToSaleDetail = (statement) => {
			this.setState({ isLoading: true }, () =>
				this.props.saleFetchById(statement.idRef, () => {
					this.setState({ isLoading: false }, () =>
						navigate({
							key: 'SaleDetailCustomerStatement',
							name: 'SaleDetail',
							params: {
								refreshSales: () => this.props.refreshCustomerStatements(true),
								keepReducer: true,
							},
						})
					)
				})
			)
		}

		const checkSaleReason = (reason) =>
			reason === 'SALE_CUSTOMER_ACCOUNT' || reason === 'SALE_PAY_LATER' || reason === 'SALE_CANCELLED'

		// find Allowed To Cancel statement
		const allowToCancel = accountStatements.find((s, i) => !checkSaleReason(s.reason) && !s.isCancelled)

		return (
			<ScrollView>
				{accountStatements.map((statement, index) => (
					<StatementItem
						key={index}
						statement={statement}
						onPress={
							checkSaleReason(statement.reason)
								? () => goToSaleDetail(statement)
								: () => goToDetail(statement, allowToCancel._id === statement._id)
						}
					/>
				))}
			</ScrollView>
		)
	}

	headerButtons() {
		const { navigate } = this.props.navigation
		const isFiltering = this.checkFiltering()
		return (
			<View style={{ flexDirection: 'row' }}>
				<HeaderButton
					buttonKyteIcon
					size={18}
					icon="filter"
					color={isFiltering ? colors.actionColor : null}
					onPress={() => navigate({ key: 'CustomerAccountFilterPage', name: 'CustomerAccountFilter' })}
				/>
				<HeaderButton
					buttonKyteIcon
					size={18}
					icon="share"
					onPress={() =>
						navigate({
							key: 'CustomerStatementsSharePage',
							name: 'CustomerStatementsShare',
							params: { filterString: this.generateFilterString() },
						})
					}
				/>
			</View>
		)
	}

	renderLoading() {
		return <View style={{ flex: 1 }} />
	}

	renderFilterBottom() {
		const { isLoading } = this.state
		const { customer } = this.props
		const { accountStatements } = customer

		const isFiltering = this.checkFiltering()
		const filterString = this.generateFilterString()
		const transactionString =
			accountStatements.length === 1 ? I18n.t('words.s.transaction.one') : I18n.t('words.s.transaction.other')

		return (
			<View
				style={{
					paddingVertical: 20,
					paddingHorizontal: 15,
					backgroundColor: colors.primaryDarker,
					flexDirection: 'row',
				}}
			>
				<View style={{ flex: 1 }}>
					<KyteText size={16} weight="Semibold" style={{ color: 'white' }}>
						{filterString}
					</KyteText>
					<KyteText size={14} style={{ color: 'white', marginTop: 5 }}>
						{isLoading ? I18n.t('words.s.loading') : `${accountStatements.length} ${transactionString}`}
					</KyteText>
				</View>
				{isFiltering ? (
					<View style={{ justifyContent: 'center' }}>
						<TouchableOpacity style={{ padding: 5 }} onPress={() => this.clearFilter()}>
							<KyteIcon name="cross-thin" color="white" size={18} />
						</TouchableOpacity>
					</View>
				) : null}
			</View>
		)
	}

	render() {
		const { isLoading } = this.state
		const { doRefreshStatements } = this.props

		const mainContent = () => (
			<>
				{this.renderHeader()}
				{this.renderStatements()}
				{this.renderFilterBottom()}
			</>
		)

		return (
			<KyteSafeAreaView style={{ height: '100%' }}>
				<KyteToolbar
					innerPage
					showCloseButton
					headerTitle={Strings.CUSTOMER_STATEMENTS_TITLE}
					goBack={() => this.props.navigation.goBack()}
					borderBottom={1}
					rightComponent={this.headerButtons()}
				/>
				{isLoading || doRefreshStatements ? <LoadingCleanScreen /> : mainContent()}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	headerContainer: {
		backgroundColor: colors.lightBg,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 15,
		paddingVertical: 5,
	},
}

const mapStateToProps = ({ customers, common }) => ({
	customer: customers.detail,
	accountFilter: customers.accountFilter,
	accountFilterInitial: customers.accountFilterInitial,
	doRefreshStatements: common.refreshCustomerStatements,
})

export default connect(mapStateToProps, {
	customerAccountGetStatements,
	customersClearAccountFilter,
	saleFetchById,
	refreshCustomerStatements,
})(CustomerStatements)
