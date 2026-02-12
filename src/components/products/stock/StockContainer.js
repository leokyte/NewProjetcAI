import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Alert, Animated, Platform, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import NavigationService from '../../../services/kyte-navigation'

import I18n from '../../../i18n/i18n'
import { EmptyContent, SearchBar, KyteText, CurrencyText } from '../../common'
import { colors, scaffolding, Type, colorSet } from '../../../styles'
import { checkUserPermission } from '../../../util'
import { Features, ProductDetailsTabKeys, ProductWithVariationDetailsTabKeys } from '../../../enums'
import {
	stockFetch,
	productDetailCreate,
	productDetailUpdate,
	checkUserReachedLimit,
	updateshareCatalogModalVisible,
	checkFeatureIsAllowed,
	checkPlanKeys,
	stockSetSearchText,
	stockServerFetch,
	fetchStockTotals,
} from '../../../stores/actions'
import StockFilterModal from './StockFilterModal'
import { logEvent } from '../../../integrations/Firebase-Integration'
import { getAndUpdateDocumentsByModel } from '../../../sync'
import ProductImage from '../../products/image/ProductImage'
import { gridStyles, productListTileStyle } from '../../../styles/product-list-style'
import ProductList from '@kyteapp/kyte-ui-components/src/packages/products/product-list/ProductList'
import { isSmallScreen } from '@kyteapp/kyte-ui-components/src/packages/utils/util-screen'
import { checkStockValueStatus, getVirtualCurrentStock } from '../../../util/util-product'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import IconButton from '@kyteapp/kyte-ui-components/src/packages/buttons/icon-button/IconButton'
import { checkHasVariants } from '@kyteapp/kyte-utils'
import Body16 from '@kyteapp/kyte-ui-components/src/packages/text/typography/body16/Body16'
import Body14 from '@kyteapp/kyte-ui-components/src/packages/text/typography/body14/Body14'
import StockTotalsSheet from './StockTotalsSheet'

const snapPoints = Platform.OS === 'android' ? [90, 225] : [80, 205]

class StockContainer extends Component {
	static navigationOptions = () => {
		return { tabBarLabel: I18n.t('stockContainerTitle') }
	}

	constructor(props) {
		super(props)
		this.bottomSheetRef = React.createRef()

		this.state = {
			isSearchBarVisible: false,
			isFilterVisible: false,
			key: Features.items[Features.STOCK].key,
			remoteKey: Features.items[Features.STOCK].remoteKey,
			stockFeatureAllowed: true,
			keyChecked: false,
			fetchLimit: 40,
			bottomSheetIndex: 1,
			opacity: new Animated.Value(0),
			isRefreshing: false,
		}
	}

	componentDidMount() {
		logEvent('Product Stock List View')

		this.fetchItems('', true)
		this.props.fetchStockTotals()
		this.checkStockKey()
	}

	fetchItems(text, reboot, length = 0) {
		const { fetchLimit: limit } = this.state

		this.props.stockSetSearchText(text)
		this.props.stockFetch(text, { limit, length }, reboot)
	}

	async checkStockKey() {
		const { key } = this.state
		const stockFeatureAllowed = await this.props.checkPlanKeys(key)
		this.setState({ stockFeatureAllowed, keyChecked: true })
	}

	openProductCreate() {
		const { navigation, user, userHasReachedLimit, viewport } = this.props
		const { navigate } = navigation
		const { permissions } = user
		const isMobile = isSmallScreen(viewport)

		this.props.checkUserReachedLimit()
		if (userHasReachedLimit) {
			NavigationService.reset('Confirmation', 'SendCode', { origin: 'user-blocked', previousScreen: 'Products' })

			logEvent('UserReachedLimit', user)
			return
		}

		if (checkUserPermission(permissions).allowProductsRegister) {
			this.props.productDetailCreate()
			if (isMobile) {
				navigate('ProductDetail')
			}
			return
		}

		Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToManageProducts'))
	}

	goToStock(product) {
		const { permissions } = this.props.user
		const { viewport, navigation } = this.props
		const isMobile = isSmallScreen(viewport)

		if (checkUserPermission(permissions).allowStockManager) {
			const detailTabKey = checkHasVariants(product)
				? ProductWithVariationDetailsTabKeys.Stock
				: ProductDetailsTabKeys.Stock
			this.props.productDetailUpdate(product, detailTabKey)

			if (isMobile) {
				navigation.navigate({
					key: 'ProductDetailPage',
					name: 'ProductDetail',
					params: { index: detailTabKey },
				})
			}

			return
		}

		Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToManageStock'))
	}

	filterState() {
		const { filters } = this.props
		const { categories, stock } = filters
		const { noMinimum, aboveMinimum, withoutStockControl, noStock } = stock
		const filtersArr = [categories.length, noMinimum, aboveMinimum, withoutStockControl, noStock]

		this.hasFilters = filtersArr.some((f) => f)
	}

	toggleBottomSheet() {
		const { bottomSheetIndex } = this.state
		const nextIndex = bottomSheetIndex === 0 ? 1 : 0
		this.bottomSheetRef?.current?.snapToIndex(nextIndex)
	}

	handleBottomSheetChange = (index) => {
		const nextIndex = typeof index === 'number' && index >= 0 ? index : 1
		if (nextIndex === this.state.bottomSheetIndex) {
			return
		}

		this.setState({ bottomSheetIndex: nextIndex, opacity: new Animated.Value(0) })
	}

	checkStockStatus(product) {
		return checkStockValueStatus(getVirtualCurrentStock(product), product?.stock, product)
	}

	renderOnReachEndLoader() {
		return (
			<Container height={60} justifyContent="center" alignItems="center">
				<ActivityIndicator size={'small'} color={colors.actionColor} />
			</Container>
		)
	}

	renderContent(hasTotals) {
		const { stock, currency, fetchSize, searchText } = this.props
		const { stockFeatureAllowed, keyChecked, fetchLimit, isRefreshing } = this.state
		const shouldFetchAgain = fetchSize >= fetchLimit
		// Because it is a FlatList (reComponent that don't changes everytime)
		// It only render the list after key was checked
		const fetch = () => {
			if (shouldFetchAgain) {
				this.fetchItems(searchText, false, stock.length)
			}
			return
		}

		const onRefresh = () => {
			this.setState({ isRefreshing: true })
			getAndUpdateDocumentsByModel('Product')
				.then(() => {
					this.fetchItems(searchText, true)
					this.setState({ isRefreshing: false })
					this.props.fetchStockTotals()
				})
				.catch(
					() => Alert.alert(I18n.t('words.s.attention'), I18n.t('customersOfflineWarningContent')),
					[{ text: I18n.t('alertOk'), onPress: () => this.setState({ isRefreshing: false }) }]
				)
		}

		const refreshControl = <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />

		const renderList = () => {
			const { viewport, currentProduct } = this.props

			return (
				<View style={{ flex: 1 }}>
					<ProductList
						products={stock}
						onPressItem={(product) => this.goToStock(product)}
						onEndReached={fetch.bind(this)}
						currency={currency}
						checkStockStatus={this.checkStockStatus}
						isStockKeyAllowed={stockFeatureAllowed}
						getStockQtd={getVirtualCurrentStock}
						texts={{
							total: I18n.t('words.s.total'),
							andSeparator: ` ${I18n.t('words.s.and')} `,
							startingPrice: I18n.t('billingMessages.millennium.content.1'),
						}}
						containerProps={{
							refreshControl,
							keyExtractor: (product, index) => product?.id || index,
							refreshing: isRefreshing,
							ListFooterComponent: shouldFetchAgain ? this.renderOnReachEndLoader() : null,
						}}
						isPlaceholdersHidden
						getItemProps={(product) => {
							const isCurrentProduct = currentProduct?.id === product?.id
							const isOnLargeScreen = !isSmallScreen(viewport)
							const isProductSelected = isCurrentProduct && isOnLargeScreen

							return {
								renderImageComponent: () => <ProductImage product={product} style={gridStyles.flexImage} />,
								showTouchIndicator: true,
								isSubtitleVisible: Boolean(product.variants || product.isParent),
								isSelected: isProductSelected,
								containerProps: { style: productListTileStyle },
								renderWrapper: (content) => content,
							}
						}}
					/>
				</View>
			)
		}

		const renderEmptyContent = () => {
			return (
				<EmptyContent
					onPress={() => this.openProductCreate()}
					text={searchText ? I18n.t('emptyProductSearchHelper') : I18n.t('stockEmptyList')}
				/>
			)
		}

		return (
			<View style={{ flex: 1, marginBottom: hasTotals ? snapPoints[0] : 0 }}>
				{stock.length > 0 && keyChecked ? renderList() : renderEmptyContent()}
			</View>
		)
	}

	renderSearchBar() {
		const { isSearchBarVisible, key, remoteKey } = this.state

		const toggleSearch = () => {
			this.setState({ isSearchBarVisible: !isSearchBarVisible })
		}
		const searchProductsByName = (text) => {
			this.fetchItems(text, true)
			this.props.fetchStockTotals({ search: text })
		}
		const closeSearch = () => {
			this.setState({ isSearchBarVisible: false })
			this.fetchItems('', true)
			this.props.fetchStockTotals()
		}
		const openFilters = () => {
			this.setState({ isFilterVisible: true })
		}

		return (
			<SearchBar
				isOpened={isSearchBarVisible}
				openedPlaceholder={I18n.t('productSearchPlaceholderActive')}
				closedPlaceholder={I18n.t('productSearchPlaceholder')}
				toggleSearch={toggleSearch.bind(this)}
				closeSearchAction={closeSearch.bind(this)}
				searchAction={searchProductsByName.bind(this)}
				filterAction={() => this.props.checkFeatureIsAllowed(key, () => openFilters(), remoteKey)}
				filterActive={this.hasFilters}
			/>
		)
	}

	renderFilter() {
		return (
			<StockFilterModal
				hideModal={() => this.setState({ isFilterVisible: false })}
				actionButton={() => {
					this.fetchItems('', true)
					this.setState({ isFilterVisible: false })
				}}
			/>
		)
	}

	renderTotals() {
		const { bottomSheetIndex } = this.state
		const { totals, isFetchingTotals } = this.props
		const { bottomSheetContent, headerBar, closedContentContainer, openedContentContainer } = bottomSheetStyle

		Animated.timing(this.state.opacity, {
			toValue: 1,
			duration: 400,
			useNativeDriver: true,
		}).start()

		const renderClosedContent = () => (
			<Animated.View style={[closedContentContainer, { opacity: this.state.opacity }]}>
				<View>
					<KyteText color={'white'} weight={'Medium'} size={16}>
						{`${I18n.t('words.s.total')}: `}
						<CurrencyText value={totals.value} />
					</KyteText>
					<KyteText color={'white'} size={13} style={{ marginTop: 5 }}>
						{`${I18n.t('stockTotalsTotalCost')}: `}
						<CurrencyText value={totals.saleCost} />
					</KyteText>
				</View>
				<View style={{ alignItems: 'flex-end' }}>
					<KyteText color={'white'} weight={'SemiBold'} size={13}>
						{totals.products}
					</KyteText>
					<KyteText color={'white'} size={13} style={{ marginTop: 3 }}>
						{I18n.t('stockTotalsInStock')}
					</KyteText>
				</View>
			</Animated.View>
		)

		const openedContentMargin = 10
		const renderOpenedContent = () => (
			<Animated.View
				style={{
					width: '100%',
					alignItems: 'center',
					marginTop: 5,
					opacity: this.state.opacity,
				}}
			>
				<KyteText color={'#808C9E'} size={14} weight={'Medium'}>
					{I18n.t('stockTotalsOpenedTitle').toUpperCase()}
				</KyteText>
				<CurrencyText
					value={totals.value}
					isSplitted
					numberColor={'white'}
					currencyColor={'white'}
					containerStyle={{ marginVertical: 10 }}
					numberStyle={{
						color: 'white',
						fontSize: 48,
						fontFamily: 'Graphik-Light',
					}}
				/>
				<View style={openedContentContainer}>
					<View>
						<KyteText color={'white'}>
							{`${I18n.t('stockTotalsTotalCost')}: `}
							<CurrencyText value={totals.saleCost} />
						</KyteText>
						<KyteText color={'white'} style={{ marginTop: openedContentMargin }}>
							{`${I18n.t('stockTotalsProfits')}: `}
							<CurrencyText value={totals.profits} />
						</KyteText>
					</View>
					<View style={{ alignItems: 'flex-end' }}>
						<KyteText color={'white'}>
							<KyteText weight={'SemiBold'} color={'white'}>
								{totals.products}
							</KyteText>
							{` ${I18n.t('stockTotalsInStock')}`}
						</KyteText>
						<KyteText pallete={'warningColor'} weight={'Medium'} style={{ marginTop: openedContentMargin }}>{`${I18n.t(
							'stockTotalsMinimum'
						)} ${totals.minimum}`}</KyteText>
						<KyteText pallete={'barcodeRed'} weight={'Medium'} style={{ marginTop: openedContentMargin }}>{`${I18n.t(
							'stockFilterNoStock'
						)} ${totals.noStock}`}</KyteText>
					</View>
				</View>
			</Animated.View>
		)

		const renderBottomSheetContent = () => {
			if (isFetchingTotals || totals === null)
				return (
					<Container
						style={{
							flexGrow: 1,
							paddingTop: 11,
							paddingLeft: 30,
							paddingRight: 30,
							paddingBottom: 11,
						}}
						justifyContent={bottomSheetIndex === 0 ? 'center' : 'flex-start'}
					>
						{totals === null ? (
							<View>
								<Body16 weight={500} lineHeight={24} color={colors.white}>
									{I18n.t('noInternetConnection')}
								</Body16>
								<Body14 lineHeight={21} color={colors.white}>
									{I18n.t('stockOfflineMessage')}
								</Body14>
								{bottomSheetIndex === 0 && (
									<Container marginTop={10} width="100%" alignItems="center">
										<IconButton
											iconProps={{ color: colors.white }}
											color={colors.white}
											onPress={() => this.props.fetchStockTotals()}
											name="refresh"
										/>
									</Container>
								)}
							</View>
						) : (
							isFetchingTotals && <ActivityIndicator size="large" color={colors.actionColor} />
						)}
					</Container>
				)
			if (bottomSheetIndex === 0) return renderOpenedContent()

			return renderClosedContent()
		}

		return (
			<StockTotalsSheet
				ref={this.bottomSheetRef}
				index={bottomSheetIndex}
				snapPoints={snapPoints}
				onChange={this.handleBottomSheetChange}
				style={{ backgroundColor: colors.primaryDarker, borderRadius: 10 }}
			>
				<SafeAreaView edges={['left', 'right']} style={bottomSheetContent}>
					<View style={headerBar} />
					{renderBottomSheetContent()}
				</SafeAreaView>
			</StockTotalsSheet>
		)
	}

	render() {
		const { outerContainer } = scaffolding
		const { listContainer } = styles
		const { isFilterVisible, stockFeatureAllowed } = this.state
		const { permissions: p } = this.props.user
		const isAdmin = p.isOwner || p.isAdmin
		this.allowTotals = isAdmin && stockFeatureAllowed

		this.filterState()

		return (
			<View style={outerContainer}>
				<View style={listContainer}>
					{this.renderSearchBar()}
					{this.renderContent(this.allowTotals)}
					{this.allowTotals ? this.renderTotals() : null}
				</View>
				{isFilterVisible ? this.renderFilter() : null}
			</View>
		)
	}
}

const styles = {
	listContainer: {
		flex: 1,
	},
	inputStyle: [Type.Regular, colorSet(colors.secondaryBg)],
}

const bottomSheetStyle = {
	bottomSheetContent: {
		backgroundColor: colors.primaryDarker,
    height: '100%',
		alignItems: 'center',
	},
	headerBar: {
		marginVertical: 10,
		backgroundColor: colors.primaryBg,
		width: 65,
		height: 6,
		borderRadius: 15,
	},
	closedContentContainer: {
		width: '100%',
		paddingHorizontal: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	openedContentContainer: {
		width: '100%',
		paddingHorizontal: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
}

const mapStateToProps = (state) => ({
	searchText: state.stock.searchText,
	stock: state.stock.list,
	totals: state.stock.totals,
	isFetchingTotals: state.stock.isFetchingTotals,
	user: state.auth.user,
	filters: state.stock.filters,
	fetchSize: state.stock.fetchSize,
	currency: state.preference.account.currency,
	currentProduct: state.products.detail,
	viewport: state.common.viewport,
})

export default connect(mapStateToProps, {
	stockFetch,
	productDetailCreate,
	productDetailUpdate,
	checkUserReachedLimit,
	updateshareCatalogModalVisible,
	checkFeatureIsAllowed,
	checkPlanKeys,
	stockSetSearchText,
	stockServerFetch,
	fetchStockTotals,
})(StockContainer)
