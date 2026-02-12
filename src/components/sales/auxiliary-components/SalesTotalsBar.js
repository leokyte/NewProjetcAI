import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { Icon } from 'react-native-elements'

import { CurrencyText, KyteText } from '../../common'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { PaymentGatewayType, PaymentType, Period, toList } from '../../../enums'

const SalesTotalsBar = ({ showOffLine = true, ...props }) => {
	const { salesType, isOnline, salesTotal, salesAmount, ordersTotal, ordersAmount, filterOrders, filterSales } = props

	const isOrder = salesType === 'order'
	const filter = isOrder ? filterOrders : filterSales

	const total = salesType === 'order' ? ordersTotal : salesTotal
	const amount = salesType === 'order' ? ordersAmount : salesAmount

	const { search, period, cancelledSales, days, users, paymentMethods, gatewayMethods, showCatalogOrdersOnly } = filter

	const hasPeriod = isOrder ? !!period : period !== Period.LAST_30_DAYS
	const filtersArr = [
		search,
		hasPeriod,
		cancelledSales,
		days.start,
		users.length,
		paymentMethods.length,
		gatewayMethods.length,
		showCatalogOrdersOnly,
	]
	const hasFilters = filtersArr.some((f) => f)

	const totalText = isOrder
		? I18n.t('openedSalesTotalTitle')
		: `${I18n.t('salesTotalTitle')} ${I18n.t('periodTypes.last30Days').toLowerCase()}`

	const salesLabel = total > 1 || !total ? I18n.t('words.p.sale') : I18n.t('words.s.sale')
	const ordersLabel = total > 1 || !total ? I18n.t('openedSalesLabel.p') : I18n.t('openedSalesLabel.s')

	const renderFilterInfo = () => {
		const dateView = (date) => moment(date).format('D MMM').toUpperCase()

		const defaultPeriodDescription = isOrder ? '' : Period.items.last30days.description

		const findPeriod = toList(Period).find((p) => p.period === period)
		const usersNames = users.map((user) => `${user.displayName}`).join(', ')
		const gatewayList = gatewayMethods.map((g) => toList(PaymentGatewayType).find((gateway) => gateway.type === g))
		const catalog = showCatalogOrdersOnly ? I18n.t('billingFeatures.catalog') : ''

		const selectedDays = days.start ? `${dateView(days.start)} ${I18n.t('words.s.to')} ${dateView(days.end)}` : ''
		const selectedUsers = users.length ? usersNames : ''
		const selectedPeriod =
			!period && (!days.start || !days.end) ? defaultPeriodDescription : findPeriod ? `${findPeriod.description}` : ''
		const canceledLabel = isOrder ? I18n.t('filterCanceledOrders') : I18n.t('filterCanceled')
		const cancelled = cancelledSales ? `${canceledLabel} ` : ''
		const paymentMethodsPhrase = paymentMethods.map((p) => PaymentType.items[p].description).join(', ')
		const gatewayMethodsPhrase = gatewayList.map((g) => g.description).join(', ')

		const searchTerm = search ? `"${search}"` : ''
		const filtersArray = [
			searchTerm,
			selectedDays,
			selectedPeriod,
			cancelled,
			paymentMethodsPhrase,
			gatewayMethodsPhrase,
			selectedUsers,
			catalog,
		]

		return filtersArray.filter((el) => el.length).join(', ')
	}

	const renderClearDateInfo = () => (
		<TouchableOpacity onPress={() => props.onPressClear()} activeOpacity={0.8}>
			<View style={styles.clearButton}>
				<Icon size={26} name="close" color="#FFF" />
			</View>
		</TouchableOpacity>
	)

	return isOnline || (!isOnline && isOrder) ? (
		<View style={styles.bottomContainer}>
			<View style={styles.totalsContainer}>
				<KyteText
					ellipsizeMode="tail"
					numberOfLines={2}
					weight="Semibold"
					size={17}
					color="white"
					style={{ lineHeight: 26 }}
				>
					{hasFilters ? renderFilterInfo() : totalText}
				</KyteText>
				<View style={{ marginTop: 5 }}>
					<KyteText weight="Regular" size={16} color="white">
						<CurrencyText value={total || 0} />
						{` ${I18n.t('words.s.at')}`} {amount || 0} {isOrder ? ordersLabel : salesLabel}
					</KyteText>
				</View>
			</View>
			{period !== null && hasFilters ? renderClearDateInfo() : null}
		</View>
	) : null
}

const styles = {
	bottomContainer: {
		backgroundColor: colors.secondaryBg,
		paddingVertical: 10,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	totalsContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		paddingHorizontal: 15,
	},
	clearButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 60,
		height: 40,
	},
}

const mapStateToProps = ({ sales, common }) => ({
	salesTotal: sales.salesGroupsResult ? sales.salesGroupsResult.total : 0,
	ordersTotal: sales.ordersGroupsResult ? sales.ordersGroupsResult.total : 0,
	salesAmount: sales.salesGroupsResult ? sales.salesGroupsResult.amount : 0,
	ordersAmount: sales.ordersGroupsResult ? sales.ordersGroupsResult.amount : 0,
	filterOrders: sales.filterOrders,
	filterSales: sales.filterSales,
	isOnline: common.isOnline,
})

export default connect(mapStateToProps)(SalesTotalsBar)
