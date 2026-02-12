import {
	MobileOnly,
	Container,
	ProductGrid,
	ProductList,
	Viewports,
	ProductGridItem,
} from '@kyteapp/kyte-ui-components'
import _ from 'lodash'
import React, { Component } from 'react'
import { Alert, Platform, View, Dimensions, AppState } from 'react-native'
import { Icon } from 'react-native-elements'
import { connect } from 'react-redux'
import GridItemPlaceholder from '@kyteapp/kyte-ui-components/src/packages/placeholders/GridItemPlaceholder'
import * as Animatable from 'react-native-animatable'
import { DetailOrigin, Features } from '../../../enums'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'
import NavigationService from '../../../services/kyte-navigation'
import {
	checkPlanKeys,
	helperFetch,
	checkUserReachedLimit,
	currentSaleAddProduct,
	productCategoryFetch,
	productCategorySelect,
	productDetailBySale,
	productDetailUpdate,
	productsFetch,
	productsFetchByNameAndCode,
	productSortTypeSet,
	toggleHelperVisibility,
	setCheckoutProductStyle,
	setBarcodeVisibility,
	productsSetSearchText,
	getCurrentSaleTotalItems,
} from '../../../stores/actions'
import { PRODUCTS_FETCH } from '../../../stores/actions/types'
import { colors, gridStyles, productListTileStyle, scaffolding, Type } from '../../../styles'
import {
	avoidDoubleClick,
	checkStockValueStatus,
	checkUserPermission,
	extractFileName,
	getVirtualCurrentStock,
	generateTestID,
} from '../../../util'
import { Input, KyteIcon, KyteSafeAreaView, SubHeaderButton, Tag } from '../../common'
import CheckoutButton from '../../common/CheckoutButton'
// SplitCode ProductQuickView
import ProductQuickView from '../../products/quick-view/ProductQuickView'
import CurrentSaleCategories from '../nav-options/CurrentSaleCategories'
import CurrentSaleNav from '../nav-options/CurrentSaleNav'
// SplitCode QuickSaleAnimation
import QuickSaleAnimation from '../quick-sale/animations/QuickSaleAnimation'
import ItemAnimation from './animations/ItemAnimation'
import { Breakpoints } from '../../../enums/Breakpoints'
import ProductImage from '../../products/image/ProductImage'
import { setCheckoutProductWithVariant } from '../../../stores/variants/actions/product-variant.async.actions'
import VariantSaleModal from '../variants/VariantSaleModal'

class ProductSaleContainer extends Component {
	gridItemsRefsMap = {}

	listItemsRefsMap = {}

	static navigationOptions = {
		tabBarLabel: I18n.t('productTabLabel'),
	}

	subscriptionToAppState = null

	constructor(props) {
		super(props)

		this.checkStockKey()
		this.state = {
			animatedItems: [],
			animatedQuickSale: {},
			isAnimatedQuickSaleVisible: false,
			isSearchBarVisible: false,
			hasProducts: false,
			hasOneProduct: false,
			productQuantity: 1,
			isPhotoZoom: false,
			isQuickViewVisible: false,
			product: null,
			alreadyHasSeenNoProductsHelper: false,
			alreadyHasSeenFirstProductHelper: false,
			alreadyHasSeenFirstSaleHelper: false,
			goToProductLastClick: new Date('1999'),
			fetchLimit: 30,
			searchText: '',
			placeholdersItems(amount) {
				return [...Array(amount).fill({})]
			},
			stockKeyAllowed: false,
			isVariantCheckout: false,
		}
	}

	componentDidUpdate(prevProps) {
		const { selectedCategory, sort } = this.props
		const shouldFetchProducts = prevProps.sort?.key !== sort?.key

		if (shouldFetchProducts) {
			const size = { limit: this.state.fetchLimit, length: 0 }
			const shouldReboot = true

			this.props.productsFetch(sort, null, selectedCategory, size, shouldReboot)
		}
	}

	UNSAFE_componentWillMount() {
		const { fetchLimit } = this.state
		const { sort, navigation, selectedCategory, syncDownResult } = this.props
		const { navigate } = navigation
		const syncDocuments = syncDownResult.syncDownResultDocuments
		const hasProductsToSync = syncDocuments && syncDocuments.hasProduct
		// check if user has email. Otherwise redirect to a PostEmail page.
		if (!('email' in this.props.user)) navigate('PostEmail')

		if (!hasProductsToSync) {
			this.props.productsFetch(sort, null, selectedCategory, { limit: fetchLimit, length: 0 }, true)
		}
		this.props.productSortTypeSet(sort)

		// 'cause of first access to checkout screen
		this.props.productCategoryFetch(sort)
	}

	componentWillUnmount() {
		if (this.subscriptionToAppState) this.subscriptionToAppState.remove()
	}

	componentDidMount() {
		const { currentSaleStatus, EditionMode, navigation, route } = this.props
		const saleStarted = Boolean(this.props.totalItems > 0)
		const hasProducts = Boolean(this.props.products.length > 0)

		this.subscriptionToAppState = AppState.addEventListener('change', (appState) => {
			if (appState === 'active') {
				this.openHelper(route)
			}
		})

		this.openHelper(route)

		if (currentSaleStatus === 'confirmed' && EditionMode) {
			navigation.navigate('Cart', { isClosed: true })
		}

		logEvent('Checkout View', { saleStarted, hasProducts })
	}

	openHelper(route) {
		if (route.params) {
			this.props.helperFetch(() => this.props.toggleHelperVisibility(true))
		}
	}

	onClickCurrentSaleAddProduct(products, fraction) {
		const {
			id,
			name,
			salePrice,
			saleCostPrice,
			salePromotionalPrice,
			isFractioned,
			stockActive,
			image,
			code,
			description,
			variations,
			parentId,
		} = products
		const { productQuantity } = this.state
		const quantity = !isFractioned ? parseInt(productQuantity, 10) : 1
		const hasPromotionalPrice = Number.isFinite(salePromotionalPrice)
		const imageUrl = image ? extractFileName(image) : null

		this.props.currentSaleAddProduct(
			id,
			isFractioned,
			hasPromotionalPrice ? salePromotionalPrice : salePrice,
			name,
			quantity,
			parseFloat(fraction || 1),
			saleCostPrice,
			salePrice,
			stockActive,
			getVirtualCurrentStock(products),
			variations,
			imageUrl,
			null,
			description,
			code,
			parentId
		)
		this.setState({ productQuantity: 1 })

		if (this.props.totalItems === 0) logEvent('Checkout Sale Started')
		logEvent('Checkout Product Add', {
			quantity: this.props.getCurrentSaleTotalItems(),
			where: 'grid',
			isFractioned: isFractioned,
			isVariant: variations?.length > 0,
		})
	}

	setQuantity(quantity) {
		this.setState({ productQuantity: quantity })
	}

	async checkStockKey() {
		const stockKey = Features.items[Features.STOCK].key
		this.setState({ stockKeyAllowed: await this.props.checkPlanKeys(stockKey) })
	}

	openFractionedQuantity(products) {
		const { navigate } = this.props.navigation
		navigate('QuantityFractioned', {
			products,
			SaleAddProduct: this.onClickCurrentSaleAddProduct.bind(this),
		})
	}

	addProductToCart(product, ref) {
		const { isFractioned, variations } = product
		const { userHasReachedLimit, user } = this.props

		if (variations?.length > 0) {
			this.props.setCheckoutProductWithVariant(product)
			this.setState({ isVariantCheckout: true })
			return
		}

		this.animateItem(product, ref)

		// checking if user has reached their limit
		if (userHasReachedLimit) {
			NavigationService.navigate('Confirmation', 'SendCode', {
				origin: 'user-blocked',
				previousScreen: 'CurrentSale',
			})

			logEvent('UserReachedLimit', user)
			return
		}

		if (isFractioned) {
			avoidDoubleClick(() => this.openFractionedQuantity(product))
			return
		}
		this.onClickCurrentSaleAddProduct(product)
	}

	switchListView() {
		const lastStyle = this.props.checkoutProductStyle
		let newStyle = 'list'

		if (lastStyle === 'list') {
			newStyle = 'grid'
		}
		this.props.setCheckoutProductStyle(newStyle)
	}

	animateItem(product, ref) {
		const { animatedItems } = this.state
		const { checkoutProductStyle: animationType } = this.props
		const itemRefsMap = animationType === 'grid' ? this.gridItemsRefsMap : this.listItemsRefsMap
		const itemRef = itemRefsMap[product.id]

		itemRef?.pulse(320)
		ref?.current?.measure?.((x, y, width, height, pageX, pageY) => {
			const itemX = pageX
			const itemY = pageY - (animationType === 'grid' ? height : height)

			const newItem = {
				itemX,
				itemY,
				height,
				width,
				animationType,
				products: product,
			}
			const updatedAnimatedItems = animatedItems.concat(newItem)
			this.setState({ animatedItems: updatedAnimatedItems })
			this.animateItem(itemX, itemY, height, width, animationType, product)
		})
	}

	animateQuickSale(height, salePrice) {
		this.setState({
			animatedQuickSale: { height, salePrice },
			isAnimatedQuickSaleVisible: true,
		})
	}

	hideQuickSale() {
		this.setState({ isAnimatedQuickSaleVisible: false })
	}

	searchProductsByName(text, reboot) {
		const { sort, products } = this.props
		const { fetchLimit } = this.state
		const length = reboot ? 0 : products.length

		this.setState({ searchText: text })
		this.props.productsSetSearchText(text)
		this.props.productsFetchByNameAndCode(text, sort, { limit: fetchLimit, length }, reboot, PRODUCTS_FETCH)
	}

	addMoreProducts() {
		const { sort, products, selectedCategory } = this.props
		const { fetchLimit } = this.state

		this.props.productsFetch(sort, null, selectedCategory, {
			limit: fetchLimit,
			length: products.length,
		})
	}

	closeSearchBar() {
		const { fetchLimit } = this.state
		const { sort, selectedCategory, productsSetSearchText, productsFetch } = this.props

		this.setState({ isSearchBarVisible: false, searchText: '' })
		productsSetSearchText('')
		productsFetch(sort, null, selectedCategory, { limit: fetchLimit, length: 0 }, 'reboot')
	}

	removeAnimatedItem() {
		const { animatedItems } = this.state
		if (animatedItems.length > 25) {
			const rebuild = _.last(animatedItems)
			this.setState({ animatedItems: [rebuild] })
		}
	}

	goToProduct() {
		// Check lastClick time to avoid open multiple products in quick clicks
		const { goToProductLastClick } = this.state
		if (new Date().getTime() < goToProductLastClick.getTime() + 3000) return
		this.setState({ goToProductLastClick: new Date() })

		const { navigate } = this.props.navigation
		const { userHasReachedLimit, user } = this.props
		this.props.checkUserReachedLimit()

		if (userHasReachedLimit) {
			NavigationService.navigate('Confirmation', 'SendCode', {
				origin: 'user-blocked',
				previousScreen: 'CurrentSale',
			})

			logEvent('UserReachedLimit', user)
			return
		}

		this.props.productDetailBySale()
		navigate('ProductDetail')
	}

	goToCheckout(barcodeOrigin = false, isOnTablet = false) {
		this.props.setBarcodeVisibility(barcodeOrigin)
		if (isOnTablet) return

		NavigationService.navigate('Cart')
	}

	renderAnimatedItems() {
		const { animatedItems } = this.state
		return animatedItems.map((item, i) => {
			return (
				<ItemAnimation
					key={i}
					itemHeight={item.height}
					itemWidth={item.width}
					itemX={item.itemX}
					itemY={item.itemY}
					product={item.products}
					type={item.type}
					renderGridItem={(product) => (
						<ProductGridItem
							currency={this.props.currency}
							product={product}
							isStockKeyAllowed={this.state.stockKeyAllowed}
							stockStatus={this.checkStockStatus(product)}
							renderImageComponent={() => <ProductImage product={product} style={gridStyles.flexImage} />}
						/>
					)}
					removeAnimatedItem={this.removeAnimatedItem.bind(this)}
				/>
			)
		})
	}

	renderQuickSaleAnimation() {
		const { height, salePrice } = this.state.animatedQuickSale
		return (
			<QuickSaleAnimation
				itemX={0}
				itemY={0}
				height={height}
				width="100%"
				salePrice={salePrice}
				removeAnimatedItem={this.hideQuickSale.bind(this)}
			/>
		)
	}

	renderQuickView() {
		const { isQuickViewVisible, product } = this.state

		return (
			<ProductQuickView
				isQuickViewVisible={isQuickViewVisible}
				hideQuickView={() => this.setState({ isQuickViewVisible: false })}
				product={product}
				navigation={this.props.navigation}
				origin={DetailOrigin.BY_SALE}
			/>
		)
	}

	renderlistButton() {
		if (this.props.checkoutProductStyle !== 'list') {
			return <KyteIcon name="list-view" color={colors.primaryColor} />
		}
		return <KyteIcon name="grid-view" color={colors.primaryColor} />
	}

	renderSearchBar() {
		const { searchBarContainer, searchBar, subBarDefaults } = scaffolding
		return (
			<View style={[searchBarContainer, subBarDefaults, { backgroundColor: '#FFFFFF' }]}>
				<SubHeaderButton width={40} onPress={() => this.closeSearchBar()}>
					<Icon name="close" color={colors.primaryColor} {...generateTestID('close-search-ck')} />
				</SubHeaderButton>
				<Input
					testProps={generateTestID('search-ck')}
					onChangeText={(text) => this.searchProductsByName(text, true)}
					style={[searchBar, { fontSize: 14 }, Type.Regular]}
					placeholder={I18n.t('productSearchPlaceholder')}
					flex
					noBorder
					autoFocus
					hideLabel
					returnKeyType="done"
					autoCorrect
				/>
			</View>
		)
	}

	renderSubHeaderButtons(isOnTablet) {
		const { subHeader, subBarDefaults } = scaffolding
		const { navigate } = this.props.navigation
		const { productQuantity } = this.state

		return (
			<View style={[subHeader, subBarDefaults, { paddingLeft: 2, paddingRight: 8 }]}>
				<View style={{ flex: 1 }}>
					<SubHeaderButton
						testProps={generateTestID('search-btn-ck')}
						onPress={() => this.setState({ isSearchBarVisible: true })}
					>
						<KyteIcon name="search" color={colors.primaryColor} />
					</SubHeaderButton>
				</View>
				<SubHeaderButton
					testProps={generateTestID('code-reader-ck')}
					onPress={() => {
						logEvent('Barcode Activate', {
							where: 'Checkout',
						})
						this.goToCheckout(true, isOnTablet)
					}}
				>
					<KyteIcon name="barcode" color={colors.primaryColor} />
				</SubHeaderButton>
				<SubHeaderButton
					testProps={generateTestID('fast-sell-ck')}
					onPress={() =>
						navigate({
							key: 'QuickSalePage',
							name: 'QuickSale',
							params: { animateQuickSale: this.animateQuickSale.bind(this) },
						})
					}
				>
					<KyteIcon name="bolt" color={colors.primaryColor} />
				</SubHeaderButton>
				<SubHeaderButton
					testProps={generateTestID(this.props.checkoutProductStyle === 'grid' ? 'view-grid-ck' : 'view-list-ck')}
					onPress={() => this.switchListView()}
				>
					{this.renderlistButton()}
				</SubHeaderButton>
				<SubHeaderButton
					testProps={generateTestID('qty-btn-ck')}
					width="auto"
					style={{ paddingRight: 10, paddingLeft: 15 }}
				>
					<Tag
						padding={7}
						onPress={() =>
							navigate({
								key: 'QuantityPage',
								name: 'Quantity',
								params: {
									setQuantity: this.setQuantity.bind(this),
									productQuantity: this.state.productQuantity,
								},
							})
						}
						style={{ alignSelf: 'flex-end' }}
						info={`${productQuantity} X`}
						color={productQuantity > 1 ? '#FFF' : colors.primaryColor}
						background={productQuantity > 1 ? colors.primaryColor : null}
					/>
				</SubHeaderButton>
			</View>
		)
	}

	getProductIndex(productId) {
		const { products } = this.props

		return products.findIndex((product) => productId === product.id)
	}

	placeholderLink() {
		const { navigate } = this.props.navigation
		const { user, selectedCategory, userHasReachedLimit, products } = this.props

		// Check lastClick time to avoid open multiple products in quick clicks
		const { goToProductLastClick } = this.state
		if (new Date().getTime() < goToProductLastClick.getTime() + 3000) return
		this.setState({ goToProductLastClick: new Date() })

		this.props.checkUserReachedLimit()

		if (userHasReachedLimit) {
			NavigationService.navigate('Confirmation', 'SendCode', {
				origin: 'user-blocked',
				previousScreen: 'CurrentSale',
			})

			logEvent('UserReachedLimit', user)
			return
		}

		if (!checkUserPermission(user.permissions).allowProductsRegister) {
			Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToManageProducts'))
			return
		}

		this.props.productDetailBySale()
		logEvent('Checkout New Product Click', { where: 'checkout', is_empty: Boolean(products.length === 0) })
		navigate('ProductDetail', { screen: 'ProductDetail', params: { selectedCategory } })
	}

	checkStockStatus(product) {
		return checkStockValueStatus(getVirtualCurrentStock(product), product?.stock, product)
	}

	renderCheckoutEditionBlock() {
		return <View style={styles.editionBlock} /> // ana
	}

	_keyExtractor = (item) => item.id

	render() {
		const { outerContainer } = styles
		const {
			checkoutProductStyle,
			totalGross,
			products,
			fetchSize,
			navigation,
			EditionMode,
			currentSaleStatus,
			currency,
			decimalCurrency,
			currentSale,
		} = this.props
		const {
			isSearchBarVisible,
			isQuickViewVisible,
			animatedItems,
			isAnimatedQuickSaleVisible,
			fetchLimit,
			searchText,
			isVariantCheckout,
		} = this.state
		const isGrid = checkoutProductStyle === 'grid'
		const listKey = `${currency.currencySymbol}`

		const fetch = () => {
			if (!searchText) return this.addMoreProducts()
			this.searchProductsByName(searchText, false)
		}

		const isOnTablet = Dimensions.get('window').width >= Breakpoints[Viewports.Tablet]
		const blockCheckoutEdition = isOnTablet && EditionMode && currentSaleStatus === 'confirmed'

		return (
			<Container flex={1}>
				<KyteSafeAreaView style={outerContainer}>
					<CurrentSaleNav navigation={navigation} />
					{isSearchBarVisible ? this.renderSearchBar() : this.renderSubHeaderButtons(isOnTablet)}
					{!isSearchBarVisible && <CurrentSaleCategories />}
					<Container flex={1} position="relative">
						{blockCheckoutEdition ? this.renderCheckoutEditionBlock() : null}
						{isGrid ? (
							<Container flex={1} paddingTop={isOnTablet ? 10 : 0} paddingBottom={isOnTablet ? 10 : 0}>
								<ProductGrid
									key={listKey}
									currentSale={currentSale}
									products={products}
									onEndReached={fetchSize >= fetchLimit ? fetch : null}
									getStockQtd={getVirtualCurrentStock}
									currency={currency}
									containerProps={{ keyExtractor: this._keyExtractor }}
									onPressItem={(product, ref) => this.addProductToCart(product, ref)}
									{...generateTestID('product-grid-ck')}
									onPressPlaceholder={this.placeholderLink.bind(this)}
									isStockKeyAllowed={this.state.stockKeyAllowed}
									onLongPressItem={(product) => this.setState({ isQuickViewVisible: true, product })}
									checkStockStatus={this.checkStockStatus}
									renderPlaceholder={(item) =>
										item.first ? (
											<GridItemPlaceholder
												onPress={this.placeholderLink.bind(this)}
												item={item}
												hasNoProduct={!products.length}
												customIconElement={
													<KyteIcon
														size={30}
														name="plus-calculator"
														color={products.length === 0 ? '#FFF' : '#b5bfcf'}
														testProps={generateTestID('add-prod-ck')}
													/>
												}
											/>
										) : null
									}
									texts={{
										startingPrice: I18n.t('billingMessages.millennium.content.1'),
										andSeparator: I18n.t('words.s.and'),
									}}
									getItemProps={(product) => ({
                    decimalCurrency,
										renderImageComponent: () => <ProductImage product={product} style={gridStyles.flexImage} />,
										renderWrapper: (content) => (
                      <Animatable.View ref={(ref) => (this.gridItemsRefsMap[product.id] = ref)}>
												{content}
											</Animatable.View>
										),
										...generateTestID(`product-ck-${this.getProductIndex(product.id)}`),
                    testIDs: {}
									})}
								/>
							</Container>
						) : (
							<ProductList
								key={listKey}
								currentSale={currentSale}
								products={products}
								onEndReached={fetchSize >= fetchLimit ? fetch : null}
								currency={currency}
								isStockKeyAllowed={this.state.stockKeyAllowed}
								getStockQtd={getVirtualCurrentStock}
								isCheckoutInfoVisible
								{...generateTestID('product-list-ck')}
								onPressItem={(product, ref) => this.addProductToCart(product, ref)}
								containerProps={{ keyExtractor: this._keyExtractor }}
								onPressPlaceholder={this.placeholderLink.bind(this)}
								texts={{
									stockContainerTitle: I18n.t('stockContainerTitle'),
									stockFilterNoStock: I18n.t('stockFilterNoStock'),
									stockMinimum: I18n.t('stockMinimum'),
									codeAbbr: I18n.t('words.s.codeAbbr'),
									startingPrice: I18n.t('billingMessages.millennium.content.1'),
									andSeparator: ` ${I18n.t('words.s.and')} `,
								}}
								onLongPressItem={(product) => this.setState({ isQuickViewVisible: true, product })}
								checkStockStatus={this.checkStockStatus}
								getItemProps={(product) => ({
									decimalCurrency,
									renderImageComponent: () => <ProductImage product={product} style={gridStyles.flexImage} />,
									renderWrapper: (content) => (
										<Animatable.View ref={(ref) => (this.listItemsRefsMap[product.id] = ref)}>
											{content}
										</Animatable.View>
									),
									...generateTestID(`product-ck-${this.getProductIndex(product.id)}`),
									containerProps: { style: productListTileStyle },
								})}
							/>
						)}
					</Container>
					<MobileOnly>
						<CheckoutButton totalValue={totalGross} duration={0} onPress={() => this.goToCheckout()} />
					</MobileOnly>
					{isAnimatedQuickSaleVisible && this.renderQuickSaleAnimation()}
					<MobileOnly>{animatedItems.length > 0 && this.renderAnimatedItems()}</MobileOnly>
					{isQuickViewVisible && this.renderQuickView()}
				</KyteSafeAreaView>
				{isVariantCheckout && (
					<VariantSaleModal
						addProductToCart={this.onClickCurrentSaleAddProduct.bind(this)}
						onCloseModal={() => this.setState({ isVariantCheckout: false })}
					/>
				)}
			</Container>
		)
	}
}

const styles = {
	outerContainer: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
		position: 'relative',
	},
	flexContainer: {
		flex: 1,
	},
	gridSpace: {
		paddingHorizontal: 5,
	},
	emptyListHelper: {
		position: 'absolute',
		zIndex: 10,
		top: 60,
		bottom: 70,
		left: '34%',
		right: 0,
		flexDirection: 'column',
	},
	emptyListArrow: (marginLeft, marginTop) => {
		return {
			marginLeft,
			marginTop,
		}
	},
	emptyListTextContainer: {
		width: '60%',
		alignSelf: 'center',
	},
	emptyListText: {
		fontFamily: 'Graphik-Semibold',
		fontSize: 16,
		lineHeight: 32,
		textAlign: 'center',
		color: colors.primaryColor,
	},
	gridStyle: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		...Platform.select({
			ios: {
				paddingHorizontal: 8,
			},
			android: {
				paddingHorizontal: 5,
				paddingBottom: 5,
			},
		}),
	},
	listStyle: {
		top: -6,
	},
	circle: {
		position: 'absolute',
		zIndex: 10,
		width: 100,
		height: 110,
		borderRadius: 4,
		backgroundColor: '#000000',
	},
	editionBlock: {
		position: 'absolute',
		top: 0,
		right: 0,
		left: 0,
		bottom: 0,
		backgroundColor: 'white',
		opacity: 0.8,
		zIndex: 500,
	},
}

const mapStateToProps = (state) => ({
	products: state.products.list,
	productCategory: state.productCategory.list,
	selectedCategory: state.productCategory.selected,
	fetchSize: state.products.fetchSize,
	categoriesGroupResult: state.productCategory.categoriesGroupResult,
	totalNet: state.currentSale.totalNet,
	totalGross: state.currentSale.totalGross,
	totalItems: state.currentSale.totalItems,
	user: state.auth.user,
	userHasReachedLimit: state.common.userHasReachedLimit,
	checkoutProductStyle: state.common.checkoutProductStyle,
	salesQuantity: state.sales.salesQuantity,
	syncDownResult: state.sync.syncDownResult,
	currency: state.preference.account.currency,
	EditionMode: state.common.checkoutEditionMode,
	currentSaleStatus: state.currentSale.status,
	currentSale: state.currentSale,
	helper: state.onboarding.helper,
	decimalCurrency: state.preference.account.decimalCurrency,
	sort: { key: state.preference.account.checkoutSort || 'dateCreation', isDesc: false },
})

export default connect(mapStateToProps, {
	currentSaleAddProduct,
	productsFetch,
	helperFetch,
	toggleHelperVisibility,
	productsFetchByNameAndCode,
	productDetailBySale,
	checkUserReachedLimit,
	productCategoryFetch,
	productCategorySelect,
	productDetailUpdate,
	setCheckoutProductStyle,
	productSortTypeSet,
	checkPlanKeys,
	setBarcodeVisibility,
	productsSetSearchText,
	getCurrentSaleTotalItems,
	setCheckoutProductWithVariant,
})(ProductSaleContainer)
