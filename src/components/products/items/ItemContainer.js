import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
	View,
	Alert,
	Text,
	TouchableOpacity,
	Linking,
	ScrollView,
	Image,
	Dimensions,
	RefreshControl,
	ActivityIndicator,
} from 'react-native'
import Share from 'react-native-share'

import ProductList from '@kyteapp/kyte-ui-components/src/packages/products/product-list/ProductList'
import { isSmallScreen } from '@kyteapp/kyte-ui-components/src/packages/utils/util-screen'
import I18n from '../../../i18n/i18n'
import {
	EmptyContent,
	SearchBar,
	KyteModal,
	ListOptions,
	KyteIcon,
	SwitchContainer,
	LoadingCleanScreen,
	KyteButton,
} from '../../common'
import { colors, scaffolding, Type, colorSet, modalStyles } from '../../../styles'
import { logEvent } from '../../../integrations/Firebase-Integration'
import { checkUserPermission, showOfflineAlert, kyteCatalogDomain, generateTestID } from '../../../util'
import {
	productsFetchByNameAndCode,
	productDetailCreate,
	productDetailUpdate,
	checkUserReachedLimit,
	updateshareCatalogModalVisible,
	productCategorySelectedClean,
	productSortTypeSet,
	storeAccountSave,
	productsSetSearchText,
	productsListServerFetch,
} from '../../../stores/actions'
import NavigationService from '../../../services/kyte-navigation'
import { OnlineOrderTip } from '../../../../assets/images'
import { PRODUCTS_LIST_FETCH } from '../../../stores/actions/types'
import { gridStyles, productListTileStyle } from '../../../styles/product-list-style'
import ProductImage from '../../products/image/ProductImage'
import { checkStockValueStatus, getVirtualCurrentStock } from '../../../util/util-product'
import { ProductDetailsTabKeys } from '../../../enums'
import { KyteSwitch } from '@kyteapp/kyte-ui-components'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import { productsListLocalFetch } from '../../../stores/actions/ProductActions'

const { width: SCREEN_WIDTH } = Dimensions.get('screen')

class ItemContainer extends Component {
	static navigationOptions = () => {
		return { tabBarLabel: I18n.t('productTabTitle') }
	}

	constructor(props) {
		super(props)

		this.state = {
			isSearchBarVisible: false,
			goToProductLastClick: new Date('1999'),
			isCatalogModalVisible: false,
			isTipModalVisible: false,
			fetchLimit: 40,
			isRefreshing: false,
		}
	}

	componentDidMount() {
		logEvent('Product List View')
		this.props.productsSetSearchText('')
		this.props.productSortTypeSet()
		this.props.productCategorySelectedClean()
		this.fetchItems({ reboot: true })
	}

	fetchItems({ reboot = false, search, callback: customCallback } = {}) {
		const { fetchLimit } = this.state
		const { products } = this.props

		this.props.productsListLocalFetch(
			null,
			null,
			null,
			{ limit: fetchLimit, length: reboot ? 0 : products.length },
			reboot ? 'reboot' : undefined
		)

		// this.props.productsListServerFetch({
		// 	reboot,
		// 	params: { skip: reboot ? 0 : products.length, limit: fetchLimit, search },
		// 	localFetch,
		// })
	}

	searchProductsByName(text, reboot = true) {
		// const { fetchLimit } = this.state;
		const { products } = this.props
		const length = reboot ? 0 : products.length

		this.props.productsSetSearchText(text)
		this.props.productsFetchByNameAndCode(text, null, { limit: 100, length }, reboot, PRODUCTS_LIST_FETCH)
	}

	closeSearchBar() {
		const { fetchLimit } = this.state

		this.setState({ isSearchBarVisible: false })
		this.props.productsSetSearchText('')
		this.props.productsListLocalFetch(null, null, null, { limit: fetchLimit, length: 0 }, 'reboot')
	}

	async shareCatalog() {
		if (!this.props.store.urlFriendly) {
			Alert.alert('Atenção', 'Configure o seu catálogo antes.')
			return
		}

		Share.open({
			title: `${I18n.t('catalogShareSubject')} ${this.props.store.name}`,
			message: `${I18n.t('catalogShareSubject')} ${this.props.store.name}`,
			subject: `${I18n.t('catalogShareSubject')} ${this.props.store.name}`,
			url: `https://${this.props.store.urlFriendly}${kyteCatalogDomain}`,
		}).then(() => this.setState({ isCatalogModalVisible: false }))
	}

	openProductCreate() {
		// Check lastClick time to avoid open multiple products in quick clicks
		const { goToProductLastClick } = this.state
		if (new Date().getTime() < goToProductLastClick.getTime() + 3000) return
		this.setState({ goToProductLastClick: new Date() })

		const { userHasReachedLimit, user, navigation, viewport } = this.props
		const { navigate } = navigation
		const { permissions } = user
		this.props.checkUserReachedLimit()
		if (userHasReachedLimit) {
			logEvent('UserReachedLimit', user)
			NavigationService.reset('Confirmation', 'SendCode', {
				origin: 'user-blocked',
				previousScreen: 'Products',
			})
			return
		}

		if (checkUserPermission(permissions).allowProductsRegister) {
			this.props.productDetailCreate()
			if (isSmallScreen(viewport)) {
				logEvent('Product Add')
				navigate('ProductDetail')
			}
			return
		}

		Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToManageProducts'))
	}

	renderCatalogBar() {
		const { store, navigation, isOnline } = this.props
		const { catalog } = store
		const {
			catalogBarContainer,
			catalogBarIconContainer,
			catalogBarIconText,
			catalogBarStatusContainer,
			catalogBarSeparator,
			catalogOnlineStatusText,
		} = styles
		const isCatalogActivated = catalog && catalog.active
		const renderCatalogStatus = () => {
			if (!isCatalogActivated) {
				return (
					<Text style={[catalogOnlineStatusText, colorSet(colors.disabledIcon)]}>
						{I18n.t('catalogBarDeactivated').toUpperCase()}
					</Text>
				)
			}

			return (
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text style={catalogOnlineStatusText}>{I18n.t('catalogBarPublished').toUpperCase()}</Text>
					<View style={catalogBarSeparator} />
				</View>
			)
		}

		const renderOnlineOrderStatus = () => {
			if (!isCatalogActivated) return null
			if (!catalog.onlineOrdersAllowed) {
				return (
					<Text style={[catalogOnlineStatusText, colorSet(colors.disabledIcon)]}>
						{I18n.t('catalogBarOnlineOrderDeactivated').toUpperCase()}
					</Text>
				)
			}

			return <Text style={catalogOnlineStatusText}>{I18n.t('catalogBarOnlineOrderActivated').toUpperCase()}</Text>
		}

		const openCatalogModal = () => {
			// check network connectivity
			if (!isOnline) return showOfflineAlert()

			const existsCatalogProperty = Object.prototype.hasOwnProperty.call(store, 'catalog')
			// const existsOnlineOrdersProperty = store.catalog ? Object.prototype.hasOwnProperty.call(store.catalog, 'onlineOrdersAllowed') : false;

			// if (!user.authVerified) {
			//   Alert.alert(I18n.t('words.s.attention'), I18n.t('catalogConfirmAccountFirst'));
			//   return;
			// }

			if (!existsCatalogProperty) {
				navigation.navigate('OnlineCatalog')
				return
			}

			this.setState({ isCatalogModalVisible: true })
		}

		return (
			<TouchableOpacity onPress={() => openCatalogModal()} style={catalogBarContainer} activeOpacity={0.8}>
				<View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-start' }}>
					<View style={catalogBarIconContainer}>
						<KyteIcon name="order-book" size={20} color={colors.secondaryBg} />
					</View>
					<View style={catalogBarStatusContainer}>
						<Text style={catalogBarIconText}>{I18n.t('configMenus.onlineCatalog')}</Text>
						<View style={{ flexDirection: 'row' }}>
							{renderCatalogStatus()}
							{renderOnlineOrderStatus()}
						</View>
					</View>
				</View>
				<View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
					<KyteIcon name="nav-arrow-down" size={12} color={colors.secondaryBg} />
				</View>
			</TouchableOpacity>
		)
	}

	renderCatalogModal() {
		const { store, navigation, user } = this.props
		const { isCatalogModalVisible } = this.state
		const { permissions, authVerified } = user

		const { isAdmin } = checkUserPermission(permissions)

		const isCatalogActivated = store.catalog && store.catalog.active
		const isOnlineOrdersAllowed = store.catalog && store.catalog.onlineOrdersAllowed
		const hasDeliverOptions = store.catalog && (store.catalog.allowLocalPickUp || store.catalog.allowDelivery)

		const existsCatalogProperty = Object.prototype.hasOwnProperty.call(store, 'catalog')
		const existsOnlineOrdersProperty = store.catalog
			? Object.prototype.hasOwnProperty.call(store.catalog, 'onlineOrdersAllowed')
			: false

		const closeShareModal = () => this.setState({ isCatalogModalVisible: !isCatalogModalVisible })
		const updateCatalogStatus = () => {
			if (!existsCatalogProperty) {
				this.setState({ isCatalogModalVisible: false })
				navigation.navigate({
					key: 'OnlineCatalogProducts',
					name: 'OnlineCatalog',
				})
				return
			}

			this.setState({ isCatalogModalVisible: !isCatalogModalVisible })
			const storeData = {
				...store,
				catalog: { ...store.catalog, active: !isCatalogActivated },
			}
			this.props.storeAccountSave(storeData, () => this.setState({ isCatalogModalVisible: true }))
		}

		const updateOnlineOrderStatus = () => {
			if (!existsCatalogProperty || (existsCatalogProperty && !existsOnlineOrdersProperty)) {
				this.setState({ isTipModalVisible: true, isCatalogModalVisible: false })
				return
			}

			this.setState({ isCatalogModalVisible: !isCatalogModalVisible })
			if (!hasDeliverOptions && !isOnlineOrdersAllowed) {
				return navigation.navigate('CatalogOnlineOrders')
			}

			const storeData = {
				...store,
				catalog: {
					...store.catalog,
					onlineOrdersAllowed: !isOnlineOrdersAllowed,
				},
			}
			this.props.storeAccountSave(storeData, () => this.setState({ isCatalogModalVisible: true }))
		}
		const renderCatalogSwitch = () => {
			return (
				<View>
					<SwitchContainer
						title={I18n.t('catalogBarPublishSelector')}
						onPress={() => updateCatalogStatus()}
						style={{
							paddingHorizontal: 15,
							paddingBottom: 19,
							borderBottomWidth: 1,
							borderBottomColor: colors.lightBg,
						}}
						titleStyle={[Type.fontSize(14), Type.SemiBold, colorSet(colors.secondaryBg), { lineHeight: 22 }]}
					>
						<KyteSwitch onValueChange={() => updateCatalogStatus()} active={isCatalogActivated} />
					</SwitchContainer>

					<SwitchContainer
						title={I18n.t('catalogOnlineOrdersAllow')}
						onPress={() => updateOnlineOrderStatus()}
						style={{
							paddingHorizontal: 15,
							paddingBottom: 19,
							borderBottomWidth: 1,
							borderBottomColor: colors.lightBg,
						}}
						titleStyle={[Type.fontSize(14), Type.SemiBold, colorSet(colors.secondaryBg), { lineHeight: 22 }]}
						disabled={!isCatalogActivated}
						tipAction={() =>
							this.setState({
								isTipModalVisible: true,
								isCatalogModalVisible: false,
							})
						}
						tipNotFilled
						rightSideExtra
					>
						<KyteSwitch
							onValueChange={() => updateOnlineOrderStatus()}
							active={isOnlineOrdersAllowed}
							disabled={!isCatalogActivated}
						/>
					</SwitchContainer>
				</View>
			)
		}
		const navigateToConfig = () => {
			// if (!authVerified) {
			//   Alert.alert(I18n.t('words.s.attention'), I18n.t('catalogConfirmAccountFirst'));
			//   return;
			// }

			closeShareModal()
			NavigationService.navigate('OnlineCatalog')
		}

		const options = []

		const textColor = !isCatalogActivated ? colors.disabledColor : colors.primaryDarker
		options.push(
			{
				title: I18n.t('catalogBarOpenInNavigator'),
				color: textColor,
				onPress: isCatalogActivated
					? () => Linking.openURL(`https://${this.props.store.urlFriendly}${kyteCatalogDomain}`)
					: null,
				leftIcon: { icon: 'eye', color: textColor },
			},
			{
				title: I18n.t('catalogModalShareOptionShare'),
				color: textColor,
				onPress: isCatalogActivated ? () => this.shareCatalog() : null,
				leftIcon: { icon: 'share', color: textColor },
			}
		)

		if (isAdmin) {
			options.push({
				title: I18n.t('sideMenu.config'),
				onPress: () => navigateToConfig(),
				leftIcon: { icon: 'cog' },
			})
		}

		return (
			<KyteModal
				bottomPage
				height="auto"
				title={I18n.t('configMenus.onlineCatalog')}
				titleStyle={{ color: colors.secondaryBg, fontSize: 18 }}
				isModalVisible
				hideModal={() => closeShareModal()}
				closeIcon={{ name: 'cross-thin', size: 20 }}
			>
				<View>
					{isAdmin ? renderCatalogSwitch() : null}
					<ListOptions
						items={options}
						hideChevron
						style={[Type.SemiBold, Type.fontSize(12)]}
						itemStyle={[Type.SemiBold, Type.fontSize(13), { lineHeight: 20 }]}
					/>
				</View>
			</KyteModal>
		)
	}

	renderTipModal() {
		const hideModal = () => this.setState({ isTipModalVisible: false, isCatalogModalVisible: true })
		const configCatalog = () => {
			this.setState({ isTipModalVisible: false, isCatalogModalVisible: false })
			NavigationService.navigate('Config', 'OnlinePaymentsConfigOrder')
		}

		const tipImage = OnlineOrderTip
		const tipImageWidth = SCREEN_WIDTH * 0.5

		const closeNavStyle = {
			width: 25,
			height: 25,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.borderColor,
			borderRadius: 50,
		}

		return (
			<KyteModal height="auto" isModalVisible hideModal={() => hideModal()}>
				<ScrollView>
					<View style={{ alignItems: 'flex-end' }}>
						<TouchableOpacity style={closeNavStyle} onPress={() => hideModal()}>
							<KyteIcon name="close-navigation" size={8} color={colors.primaryBg} />
						</TouchableOpacity>
					</View>
					<View style={[modalStyles.imageView, { alignItems: 'center' }]}>
						<Image
							resizeMode="center"
							style={{ width: tipImageWidth, height: tipImageWidth }}
							source={{ uri: tipImage }}
						/>
					</View>
					<View style={[modalStyles.titleView, { marginTop: 40 }]}>
						<Text style={[Type.Medium, Type.fontSize(18), scaffolding.textAlignCenter, colorSet(colors.secondaryBg)]}>
							{I18n.t('catalogBarOnlineOrderTipTitle')}
						</Text>
					</View>
					<View style={[modalStyles.subtitleView]}>
						<Text
							style={[
								Type.Regular,
								Type.fontSize(14),
								scaffolding.textAlignCenter,
								colorSet(colors.secondaryBg),
								{ lineHeight: 16, paddingVertical: 25 },
							]}
						>
							{I18n.t('catalogBarOnlineOrderTipText')}
						</Text>
					</View>
				</ScrollView>
				<View>
					<KyteButton
						background={colors.actionColor}
						width="100%"
						onPress={() => configCatalog()}
						style={{ paddingVertical: 10 }}
					>
						<Text style={[Type.Medium, colorSet('white'), Type.fontSize(16)]}>
							{I18n.t('catalogBarOnlineOrderTipBtn')}
						</Text>
					</KyteButton>
				</View>
			</KyteModal>
		)
	}

	goToProduct(product) {
		// const {goToProductLastClick} = this.state;

		// Check lastClick time to avoid open multiple products in quick clicks
		// if (new Date().getTime() < goToProductLastClick.getTime() + 3000) return;
		// this.setState({goToProductLastClick: new Date()});

		const { permissions } = this.props.user
		const { navigate } = this.props.navigation
		if (checkUserPermission(permissions).allowProductsRegister) {
			this.props.productDetailUpdate(product, ProductDetailsTabKeys.Product)

			if (isSmallScreen(this.props.viewport)) {
				navigate({ key: 'ProductDetailPage', name: 'ProductDetail' })
			}

			return
		}

		Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToManageProducts'))
	}

	checkStockStatus(product) {
		return checkStockValueStatus(getVirtualCurrentStock(product), product?.stock, product)
	}

	async onRefresh() {
		// TODO: fix "pull to refresh"
		this.setState({ isRefreshing: true })
		this.fetchItems({ reboot: true })
		this.setState({ isRefreshing: false })
	}

	renderOnReachEndLoader() {
		return (
			<Container height={60} justifyContent="center" alignItems="center">
				<ActivityIndicator size={'small'} color={colors.actionColor} />
			</Container>
		)
	}

	renderContent() {
		const { products, currency, searchText, currentProduct, viewport, decimalCurrency, innerFetchSize } = this.props
		const { isRefreshing, fetchLimit } = this.state
		const shouldFetchAgain = !searchText && innerFetchSize >= fetchLimit

		const onEndReached = () => {
			if (shouldFetchAgain) return this.fetchItems({ reboot: false })
		}

		const renderList = () => (
			<>
				<Container flex={1}>
					<ProductList
						products={products}
						onPressItem={(product) => this.goToProduct(product)}
						onEndReached={onEndReached}
						currency={currency}
						checkStockStatus={this.checkStockStatus}
						isStockKeyAllowed
						getStockQtd={getVirtualCurrentStock}
						isPlaceholdersHidden
						containerProps={{
							keyExtractor: (product, index) => product?.id || product._id || index,
							refreshControl: <RefreshControl refreshing={isRefreshing} onRefresh={() => this.onRefresh()} />,
							refreshing: isRefreshing,
							ListFooterComponent: shouldFetchAgain ? this.renderOnReachEndLoader() : null,
						}}
						texts={{
							stockContainerTitle: I18n.t('stockContainerTitle'),
							stockFilterNoStock: I18n.t('stockContainerTitle'),
							stockMinimum: I18n.t('stockMinimum'),
							codeAbbr: I18n.t('words.s.codeAbbr'),
							andSeparator: ` ${I18n.t('words.s.and')} `,
							startingPrice: I18n.t('billingMessages.millennium.content.1'),
						}}
						getItemProps={(product) => {
							const isCurrentProduct = currentProduct?.id === product?.id
							const isOnLargeScreen = !isSmallScreen(viewport)
							const isProductSelected = isCurrentProduct && isOnLargeScreen

							return {
								decimalCurrency,
								renderImageComponent: () => <ProductImage product={product} style={gridStyles.flexImage} />,
								isCategoryNameVisible: true,
								showTouchIndicator: true,
								isSelected: isProductSelected,
								containerProps: { style: productListTileStyle },
								renderWrapper: (content) => content,
							}
						}}
						testID="product-ps"
						testIDs={{
							contentTitle: 'content-desc',
							productName: 'prop-name-ps',
							salePrice: 'prod-price-ps',
							category: 'prod-catego-ps',
							highlight: 'highlight-prod',
						}}
					/>
				</Container>
			</>
		)

		const renderEmptyContent = () => {
			return (
				<EmptyContent
					onPress={() => this.openProductCreate()}
					text={searchText ? I18n.t('emptyProductSearchHelper') : I18n.t('firstItemHelper')}
				/>
			)
		}

		return products.length > 0 ? renderList() : renderEmptyContent()
	}

	renderSearchBar() {
		const { products, searchText } = this.props
		const { isSearchBarVisible } = this.state

		if (products.length <= 0 && !searchText.length) {
			return null
		}

		const toggleSearch = () => {
			logEvent('Product Search')
			this.setState({ isSearchBarVisible: !isSearchBarVisible })
		}

		return (
			<SearchBar
				isOpened={isSearchBarVisible}
				openedPlaceholder={I18n.t('productSearchPlaceholderActive')}
				closedPlaceholder={I18n.t('productSearchPlaceholder')}
				toggleSearch={toggleSearch.bind(this)}
				closeSearchAction={this.closeSearchBar.bind(this)}
				searchAction={this.searchProductsByName.bind(this)}
				plusAction={() => this.openProductCreate()}
				plusBtnProps={{ testProps: generateTestID('add-prod-ps') }}
				testID="search-bar"
			/>
		)
	}

	renderLoader() {
		return <LoadingCleanScreen />
	}

	render() {
		const { outerContainer } = scaffolding
		const { listContainer } = styles
		const { isCatalogModalVisible, isTipModalVisible } = this.state
		const { visible } = this.props.loader
		const { currentProduct } = this.props

		return (
			<Container style={outerContainer}> 
				<View style={listContainer}>
					{this.renderSearchBar()}
					{this.renderContent()}
				</View>
				{this.renderCatalogBar()}
				{isCatalogModalVisible && this.renderCatalogModal()}
				{isTipModalVisible && this.renderTipModal()}
				{visible && !currentProduct && this.renderLoader()}
			</Container>
		)
	}
}

const styles = {
	listContainer: {
		flex: 1,
	},
	inputStyle: [Type.Regular, colorSet(colors.secondaryBg)],
	catalogBarContainer: {
		backgroundColor: '#FFFFFF',
		borderTopWidth: 1,
		borderTopColor: colors.borderlight,
		height: 55,
		flexDirection: 'row',
		paddingHorizontal: 20,
	},
	catalogBarIconContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingRight: 10,
	},
	catalogBarIconText: [Type.Medium, Type.fontSize(15), colorSet(colors.secondaryBg), { paddingVertical: 2 }],
	catalogBarStatusContainer: {
		justifyContent: 'center',
	},
	catalogBarSeparator: {
		backgroundColor: colors.disabledIcon,
		width: 3,
		height: 3,
		borderRadius: 3,
		marginHorizontal: 5,
	},
	catalogOnlineStatusText: [Type.Medium, Type.fontSize(10), colorSet(colors.actionColor)],
}

const mapStateToProps = (state) => ({
	searchText: state.products.searchText,
	products: state.products.innerList,
	innerFetchSize: state.products.innerFetchSize,
	productCategory: state.productCategory.list,
	innerListSize: state.products.innerListSize,
	user: state.auth.user,
	userHasReachedLimit: state.common.userHasReachedLimit,
	shareCatalogModalVisible: state.products.shareCatalogModalVisible,
	store: state.auth.store,
	currency: state.preference.account.currency,
	loader: state.common.loader,
	isOnline: state.offline.online,
	currentProduct: state.products.detail,
	viewport: state.common.viewport,
	decimalCurrency: state.preference.account.decimalCurrency,
})

export default connect(mapStateToProps, {
	productsListLocalFetch,
	productsFetchByNameAndCode,
	productDetailCreate,
	productDetailUpdate,
	checkUserReachedLimit,
	updateshareCatalogModalVisible,
	productCategorySelectedClean,
	productSortTypeSet,
	storeAccountSave,
	productsSetSearchText,
	productsListServerFetch,
})(ItemContainer)
