import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, ScrollView, Text, Image, Dimensions } from 'react-native'
import { bindActionCreators } from 'redux'
import { Body14, Body16, Container, KyteButton, KyteIcon, Row } from '@kyteapp/kyte-ui-components'

import { KyteToolbar, TextButton, ActionButton, KyteSafeAreaView, Selector } from '../common'
import {
	salesSetFilter,
	salesClearFilter,
	setUserCustomInfo,
	ordersSetFilter,
	ordersClearFilter,
	saleFetchById as saleFetchByIdAction,
	saleUpdate,
	syncSales,
} from '../../stores/actions'
import { scaffolding, colors, Type, colorSet } from '../../styles'
import { OrderGlobe, SalesNotFound } from '../../../assets/images'
import I18n from '../../i18n/i18n'
import { checkUserPermission, hasFilters, generateTestID, imgUrl, getNormalizedLocale } from '../../util'
import KyteSales from './KyteSales'
import KyteOrders from './KyteOrders'
import SalesTotalsBar from './auxiliary-components/SalesTotalsBar'
import SalesSearchBar from './auxiliary-components/SalesSearchBar'
import StatusListModal from './auxiliary-components/StatusListModal'
import SellersListModal from './auxiliary-components/SellersListModal'
import { checkIsOrderType, checkIsSaleType } from '../../util/util-sale'
import { SalesTypeEnum } from '../../enums/SaleSort'
import StatusSelector from './StatusSelector'
import SpinAnimation from '../common/utilities/SpinAnimation'
import { logEvent, remoteConfigGetValue } from '../../integrations/Firebase-Integration'
import OnboardingCarousel from '../common/OnboardingCarousel'
import { onboardingCarouselOrdersList, onboardingCarouselSalesList } from './onboardingSalesList'

class SalesList extends Component {
	constructor(props) {
		super(props)
		const { salesStatus, filterOrders, route, user } = this.props
		const { salesType } = route.params
		this.state = {
			salesType,
			toolBarVisible: Object.prototype.hasOwnProperty.call(props, 'toolBarVisible') ? !props.toolBarVisible : true,
			allowViewOtherSales: checkUserPermission(user.permissions).allowViewOtherSales,
			allowExportSales:
				(checkUserPermission(user.permissions).isAdmin || checkUserPermission(user.permissions).isOwner) &&
				user.authVerified,
			isStatusListVisible: false,
			isSellersListVisible: false,
			statusList: [...filterOrders.defaultStatus, ...salesStatus],
			loading: true,
			onboardingCarouselImageList: [],
			activeSlide: 0,
		}
	}

	getOnboardingCarouselData() {
		const { salesType, onboardingCarouselImageList } = this.state
		const locale = getNormalizedLocale(I18n.locale)

		const mapCarouselData = (list) =>
			list.map((item, index) => {
				const imagePath = `${imgUrl}/.kyte%2Fonboarding%2F${onboardingCarouselImageList[index]?.[locale]}.png?alt=media&token=6de6d7f6-24ae-4116-b6a8-a2e8a5d1f86c`
				const { title, paragraph } = item

				return {
					image: imagePath,
					title,
					paragraph,
				}
			})

		return checkIsOrderType(salesType)
			? mapCarouselData(onboardingCarouselOrdersList)
			: mapCarouselData(onboardingCarouselSalesList)
	}

	componentDidMount() {
		const { salesType } = this.state
		const eventName = checkIsOrderType(salesType) ? 'Order List View' : 'Sales View'
		logEvent(eventName)

		remoteConfigGetValue(
			'OnboardingCarousel',
			(key) => {
				this.setState({
					onboardingCarouselImageList: checkIsOrderType(salesType) ? key.orders : key.sales,
				})
			},
			'json'
		)
	}

	toggleStatusModal() {
		const { isStatusListVisible } = this.state
		this.setState({ isStatusListVisible: !isStatusListVisible })
	}

	toggleSellersModal() {
		const { isSellersListVisible } = this.state
		this.setState({ isSellersListVisible: !isSellersListVisible })
	}

	clearFiltersByDate() {
		const { salesType } = this.state
		if (checkIsOrderType(salesType)) {
			this.props.ordersClearFilter()
		} else {
			this.props.salesClearFilter()
		}
	}

	goToDetail(sale) {
		const { navigation, saleFetchByIdAction: saleFetchById } = this.props
		const { navigate } = navigation

		saleFetchById(sale.id, (fetchedSale) => {
			navigate({
				key: 'SaleDetailPage',
				name: 'SaleDetail',
				params: { sale: fetchedSale },
			})
		})
	}

	fetchOrders({ selectedStatuses, selectedSellers, isCatalogFilterActive } = {}) {
		const { salesType } = this.state
		const { props } = this
		const actionKeyMap = {
			[SalesTypeEnum.ORDER]: 'ordersSetFilter',
			[SalesTypeEnum.SALE]: 'salesSetFilter',
		}
		const setFilter = props[actionKeyMap[salesType]]
		const shouldUpdateCatalogFilter = typeof isCatalogFilterActive === 'boolean'

		if (shouldUpdateCatalogFilter) setFilter?.(isCatalogFilterActive, 'showCatalogOrdersOnly')
		if (selectedSellers) setFilter?.(selectedSellers, 'users')
		if (selectedStatuses) setFilter?.(selectedStatuses, 'status')
	}

	getFilterState() {
		const { filterOrders, filterSales } = this.props
		const { salesType } = this.state
		const filter = checkIsOrderType(salesType) ? filterOrders : filterSales

		return filter
	}

	renderSearchBar() {
		const { salesGroups, ordersGroups } = this.props
		const { salesType } = this.state
		const filter = this.getFilterState()
		const { search } = filter
		const dataSource = checkIsOrderType(salesType) ? ordersGroups : salesGroups
		return <SalesSearchBar salesType={salesType} disabled={this.showOrderHelper || (!dataSource.length && !search)} />
	}

	renderSalesList() {
		const { salesType } = this.state
		const componentProps = {
			onItemPress: (item) => this.goToDetail(item.sale),
			emptyComponent: this.renderEmptyContent(),
			isLoading: (status) => this.setState({ loading: status }),
		}
		return checkIsOrderType(salesType) ? <KyteOrders {...componentProps} /> : <KyteSales {...componentProps} />
	}

	renderEmptyContent() {
		const { salesType } = this.state
		const { openedSalesHelperText, emptyContainer, svgImage } = styles
		const { salesQuantity, user, navigation, hasFilters, hasSalesInAccount } = this.props
		const { navigate } = navigation
		const hasParcialSales = salesQuantity >= 1000
		const closedSales = checkIsSaleType(salesType)
		const emptyStateTitleOrders = hasFilters ? I18n.t('noOrdersWereFound') : I18n.t('noOpenedOrders')
		const noSales = closedSales ? I18n.t('salesEmpty') : emptyStateTitleOrders
		const noSalesFound = closedSales ? I18n.t('salesNotFound') : noSales
		const { isAdmin } = checkUserPermission(user.permissions)
		const filter = this.getFilterState()
		const hasSearch = !!filter?.search
		const hasAnyFilter = hasFilters || hasSearch
		const colorText = hasAnyFilter ? colors.actionColor : colors.white
		const addTransationText = checkIsOrderType(salesType) ? I18n.t('addOrder') : I18n.t('onboarding.buttons.addSale')
		const clearFiltersText = hasSearch ? I18n.t('clearSearch') : I18n.t('clearFilters')
		const tryAgainText = hasSearch ? I18n.t('expressions.toSearchAgain') : I18n.t('expressions.tryToFilterAgain')
		const emtpyStateText = closedSales ? I18n.t('emptyStateSalesDescription') : I18n.t('emptyStateOrdersDescription')

		const bottomContent = () => (
			<TextButton
				color={colors.actionColor}
				size={16}
				title={I18n.t('openedSalesHelper')}
				onPress={() => navigate('Helpcenter', { page: 'vendas/concluir-depois-uma-venda' })}
				style={openedSalesHelperText}
			/>
		)

		const parcialSalesMessage = () => (
			<View>
				<Text style={styles.emptyContentDescription}>
					<Text style={{ fontFamily: 'Graphik-Medium' }}>{`${I18n.t(
						closedSales ? 'partialSalesIntro' : 'partialOrdersIntro'
					)}\n`}</Text>
					<Text>{I18n.t('partialSalesDescription.partOne')}</Text>
					<Text
						style={{ fontFamily: 'Graphik-Medium', color: colors.actionColor }}
						onPress={() => navigate('Statistics')}
					>
						{I18n.t('sideMenu.statistics')}
					</Text>
					<Text>{I18n.t('partialSalesDescription.partTwo')}</Text>
				</Text>
				{isAdmin ? (
					<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
						<ActionButton buttonSmall disabledStyle onPress={() => navigate('DataExport')}>
							{I18n.t('billingFeatures.exportReports')}
						</ActionButton>
					</View>
				) : null}
			</View>
		)

		const renderImage = () => (
			<Image
				style={{
					...svgImage,
					opacity: hasAnyFilter ? 0.25 : 1,
				}}
				source={{ uri: SalesNotFound }}
			/>
		)

		return hasSalesInAccount ? (
			<ScrollView style={{ flex: 1 }} contentContainerStyle={emptyContainer}>
				{renderImage()}
				<Text style={styles.emptyContentTitle}>{hasFilters ? noSalesFound : noSales}</Text>
				<Body16 marginBottom={16}>{hasAnyFilter ? tryAgainText : emtpyStateText}</Body16>
				<KyteButton
					type={hasAnyFilter ? 'secondary' : 'primary'}
					containerStyle={{
						alignItems: 'center',
						alignSelf: 'center',
						width: 236,
						height: 36,
						marginBottom: 10,
						borderColor: colors.actionColor,
					}}
					textStyle={{ color: colorText }}
					colorText={colorText}
					onPress={() => (hasAnyFilter ? this.clearFiltersByDate() : navigation.navigate('CurrentSale'))}
				>
					<Row alignItems="center" justifyContent="center">
						<KyteIcon name={hasAnyFilter ? 'close-navigation' : 'plus-cart'} size={13} color={colorText} />
						<Body14 color={colorText} weight={600} marginLeft={hasSearch ? 12 : 8} lineHeight={17}>
							{hasAnyFilter ? clearFiltersText : addTransationText}
						</Body14>
					</Row>
				</KyteButton>

				{bottomContent()}
				{hasFilters && hasParcialSales ? parcialSalesMessage() : null}
			</ScrollView>
		) : (
			<OnboardingCarousel
				textButton={I18n.t('onboarding.buttons.addSale')}
				data={this.getOnboardingCarouselData()}
				onPress={() => navigation.navigate('CurrentSale')}
				activeSlide={this.state.activeSlide}
				handleSnapItem={(index) => this.setState({ activeSlide: index })}
			/>
		)
	}

	renderStatusListModal() {
		const filter = this.getFilterState()
		const { statusList } = this.state
		const defaultSelectedStatuses = filter.status ?? []
		const handleSubmit = (selectedStatuses) => {
			this.fetchOrders({ selectedStatuses })
			this.toggleStatusModal()
		}

		return (
			<KyteSafeAreaView>
				<StatusListModal
					defaultSelectedStatuses={defaultSelectedStatuses}
					statusList={statusList}
					hideModal={() => this.toggleStatusModal()}
					handleSubmit={handleSubmit}
				/>
			</KyteSafeAreaView>
		)
	}

	renderSellersListModal() {
		const { multiUsers } = this.props
		const filter = this.getFilterState()
		const defaultSelectedSellers = filter.users ?? []
		const handleSubmit = ({ selectedSellers, isCatalogFilterActive }) => {
			this.fetchOrders({ selectedSellers, isCatalogFilterActive })
			this.toggleSellersModal()
		}

		return (
			<KyteSafeAreaView>
				<SellersListModal
					isCatalogFilterActive={filter.showCatalogOrdersOnly}
					defaultSelectedSellers={defaultSelectedSellers}
					hideModal={() => this.toggleSellersModal()}
					handleSubmit={handleSubmit}
					sellers={multiUsers}
				/>
			</KyteSafeAreaView>
		)
	}

	renderSellerSelector() {
		const filter = this.getFilterState()
		const { users, showCatalogOrdersOnly } = filter
		const alignRight = { alignItems: 'flex-end', paddingRight: 15 }
		const moreThanOne = users.length > 1
		const sellerAlias = () => (moreThanOne ? I18n.t('expressions.moreThanOne') : users[0].displayName)
		const notSellerAlias = showCatalogOrdersOnly ? I18n.t('billingFeatures.catalog') : I18n.t('salesPeriodSellersTitle')

		return (
			<View style={alignRight}>
				<Selector
					icon={{ name: 'users', color: colors.primaryColor }}
					label={users.length ? sellerAlias() : notSellerAlias}
					onPress={this.toggleSellersModal.bind(this)}
				/>
			</View>
		)
	}

	renderStatusSelector() {
		const { statusList } = this.state
		const filter = this.getFilterState()
		const { status } = filter

		return <StatusSelector onPress={() => this.toggleStatusModal()} status={status ?? []} statusList={statusList} />
	}

	renderFilterBar() {
		const filter = this.getFilterState()
		const { allowViewOtherSales } = this.state
		const { type } = filter
		const rowCenterStyle = {
			height: 45,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingLeft: 15,
		}

		return (
			<View style={rowCenterStyle}>
				{checkIsOrderType(type) ? this.renderStatusSelector() : null}
				{allowViewOtherSales ? this.renderSellerSelector() : null}
			</View>
		)
	}

	renderOrderHelper() {
		const { orderGlobe } = styles
		const containerStyle = {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			overflow: 'hidden',
		}
		return (
			<View style={containerStyle}>
				<Image style={orderGlobe} source={{ uri: OrderGlobe }} />

				<View style={{ paddingTop: 30, alignItems: 'center' }}>
					<Text style={[Type.Medium, Type.fontSize(20), colorSet(colors.secondaryBg)]}>{I18n.t('ordersTipTitle')}</Text>
					<Text
						style={[
							Type.Regular,
							Type.fontSize(12),
							colorSet(colors.secondaryBg),
							{ textAlign: 'center', paddingHorizontal: 50, lineHeight: 18, paddingTop: 20 },
						]}
					>
						{I18n.t('ordersTipDescription')}
					</Text>

					<TextButton
						onPress={() => this.props.setUserCustomInfo('isOrderHelperNotVisible', true)}
						title={I18n.t('alertOk')}
						color={colors.actionColor}
						size={18}
						style={[Type.Medium, { paddingTop: 40 }]}
					/>
				</View>
			</View>
		)
	}

	renderContent() {
		const { isStatusListVisible, isSellersListVisible, salesType } = this.state
		const { hasSalesInAccount } = this.props
		if (this.showOrderHelper) {
			return this.renderOrderHelper()
		}

		return (
			<Container flex={1}>
				<Container flex={1}>{this.renderSalesList()}</Container>
				{hasSalesInAccount && (
					<SalesTotalsBar
						salesType={salesType}
						onPressClear={() => this.clearFiltersByDate()}
						loading={this.state.loading}
					/>
				)}

				{isStatusListVisible ? this.renderStatusListModal() : null}
				{isSellersListVisible ? this.renderSellersListModal() : null}
			</Container>
		)
	}

	render() {
		const { outerContainer } = scaffolding
		const {
			isOrderHelperNotVisible,
			navigation,
			ordersQuantity,
			unsycedSales,
			saleUpdate: updateSale,
			syncingSalesMap,
			syncSales: doSyncSales,
			hasSalesInAccount,
			salesGroups,
			ordersGroups,
		} = this.props
		const { navigate } = navigation
		const { salesType, toolBarVisible, allowViewOtherSales, allowExportSales } = this.state
		const isOrder = checkIsOrderType(salesType)
		const isSale = checkIsSaleType(salesType)
		const filter = this.getFilterState()
		const isSyncing = Object.keys(syncingSalesMap).length > 0
		const hasData = isOrder ? ordersGroups.length : salesGroups.length
		const headerTitle = isOrder
			? `${I18n.t('sideMenu.orders')} ${ordersQuantity ? `(${ordersQuantity})` : ''}`
			: I18n.t('sideMenu.sales')
		let rightButtons = [
			hasData
				? {
						icon: 'export',
						onPress: () => navigate('DataExport', { selected: { sales: true } }),
						color: colors.primaryColor,
						isHidden: !allowExportSales,
						testProps: generateTestID('export-tr'),
						style: {
							width: 'auto',
							marginRight: 8,
						},
				  }
				: [],
			{
				icon: 'filter-funnel',
				onPress: () => navigate('SalesPeriod', { salesType }),
				color: this.props.hasFilters ? colors.actionColor : colors.primaryColor,
				testProps: generateTestID('filter-tr'),
			},
			{
				renderCustomButton: () => (
					<KyteButton
						type="primary"
						containerStyle={{ width: 36, height: 36, paddingHorizontal: 0, paddingLeft: 0, marginRight: 8 }}
						textStyle={{ paddingHorizontal: 0 }}
						onPress={() => navigate('CurrentSale')}
					>
						<KyteIcon name="plus-cart" size={14} color={colors.white} />
					</KyteButton>
				),
				onPress: () => {},
			},
		]

		if (unsycedSales.length) {
			rightButtons = [
				{
					icon: 'sync',
					onPress: () => {
						if (!isSyncing) {
							this.props.syncSales(unsycedSales, salesType)
						}
					},
					color: colors.primaryColor,
					renderParent: (children) =>
						isSyncing ? <SpinAnimation shouldSpin={isSyncing}>{children}</SpinAnimation> : children,
				},
				...rightButtons,
			]
		}

		this.showOrderHelper = !isOrderHelperNotVisible && filter.showCatalogOrdersOnly

		return (
			<KyteSafeAreaView style={outerContainer}>
				{toolBarVisible && (
					<KyteToolbar
						borderBottom={1.5}
						headerTitle={headerTitle}
						rightButtons={hasSalesInAccount ? rightButtons : undefined}
						navigate={navigate}
						navigation={navigation}
					/>
				)}
				{hasSalesInAccount && (
					<>
						{this.renderSearchBar()}
						{isOrder || (isSale && allowViewOtherSales) ? this.renderFilterBar() : null}
					</>
				)}

				{this.renderContent()}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	emptyContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	openedSalesHelperText: {
		fontFamily: 'Graphik-Medium',
		alignSelf: 'center',
		textAlign: 'center',
		lineHeight: 26,
	},
	svgImage: {
		resizeMode: 'contain',
		width: 210,
		height: 210,
	},
	orderGlobe: {
		resizeMode: 'contain',
		width: Dimensions.get('window').width * 0.4,
		height: Dimensions.get('window').width * 0.4,
	},
	emptyContentTitle: [
		Type.SemiBold,
		Type.fontSize(18),
		colorSet(colors.primaryBg),
		{
			paddingTop: 15,
			paddingBottom: 5,
			paddingHorizontal: 20,
			textAlign: 'center',
			lineHeight: 32,
		},
	],
	emptyContentDescription: {
		fontFamily: 'Graphik-Regular',
		fontSize: 16,
		color: colors.primaryColor,
		textAlign: 'center',
		lineHeight: 26,
		paddingHorizontal: 20,
		paddingTop: 15,
		paddingBottom: 25,
	},
}

const mapStateToProps = ({ sales, preference, auth, sync, onboarding }, ownProps) => {
	const { salesStatus } = preference.account
	const { appInfo } = auth.user
	const { params = {} } = ownProps.route
	const { salesType } = params
	const isOrder = checkIsOrderType(salesType)
	const salesFilter = isOrder ? sales.filterOrders : sales.filterSales
	const groupKey = isOrder ? 'ordersGroupsResult' : 'salesGroupsResult'
	const unsycedSales = sales[groupKey].unsycedList
	const didAccountMakeOrder = preference.account?.didAccountMakeOrder
	const salesList = sales.salesGroupsResult.list
	const orderList = sales.ordersGroupsResult.list

	return {
		salesGroups: salesList,
		ordersGroups: orderList,
		ordersQuantity: sales.openedSalesQuantity,
		expandedItemsOrders: sales.expandedItemsOrders,
		expandedItemsSales: sales.expandedItemsSales,
		salesStatus,
		multiUsers: auth.multiUsers,
		user: auth.user,
		filterSales: sales.filterSales,
		filterOrders: sales.filterOrders,
		salesQuantity: sales.salesQuantity,
		isOrderHelperNotVisible: appInfo && appInfo.isOrderHelperNotVisible ? appInfo.isOrderHelperNotVisible : false,
		hasFilters: hasFilters(salesFilter),
		unsycedSales,
		syncingSalesMap: sync.syncingSalesMap,
		hasSalesInAccount: isOrder
			? !!sales.openedSalesQuantity || !!orderList?.length || didAccountMakeOrder
			: !!sales.closedSalesQuantity || !!salesList?.length || onboarding?.helper?.steps?.[1]?.completed,
	}
}
const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators(
		{
			salesSetFilter,
			salesClearFilter,
			setUserCustomInfo,
			ordersSetFilter,
			ordersClearFilter,
			saleFetchByIdAction,
			saleUpdate,
			syncSales,
		},
		dispatch
	),
})
export default connect(mapStateToProps, mapDispatchToProps)(SalesList)
