import React, { Component } from 'react'
import runes from 'runes'
import moment from 'moment'
import { connect } from 'react-redux'
import { getFormValues, change } from 'redux-form'
import { View, Text, Alert, BackHandler, Dimensions, Platform } from 'react-native'
import { TabView, SceneMap } from 'react-native-tab-view'
import { isSmallScreen } from '@kyteapp/kyte-ui-components/src/packages/utils/util-screen'

import ProductSave from './ProductSave'
import ProductStock from './ProductStock'
import { tabStyle, colors } from '../../../styles'
import { DetailPage, LoadingCleanScreen, StockCircle, KyteIcon, KyteTabBar } from '../../common'
import { DetailOrigin, ProductDetailsTabKeys, ProductWithVariationDetailsTabKeys } from '../../../enums'
import {
	productsFetch,
	stockFetch,
	productRemove,
	productSave,
	productManageStock,
	productManageStockActivity,
	productManagementReset,
	productStockHistoryClearFilter,
	productSetVirtualData,
	productDetailBySale,
	productDetailUpdate,
	productsFetchByNameAndCode,
	productsListFetch,
	productManagementSetValue,
	productDetailCreate,
	startToast,
	stockSetServerList,
	stockServerFetch,
	productCategorySelect,
	setAISuggestionsApplied,
	toggleBillingMessage,
} from '../../../stores/actions'
import { productsListServerFetch } from '../../../stores/actions/ProductActions'
import I18n from '../../../i18n/i18n'
import { checkStockValueStatus, checkUserPermission, getVirtualCurrentStock, generateTestID } from '../../../util'
import { PRODUCTS_FETCH, PRODUCTS_LIST_FETCH } from '../../../stores/actions/types'
import NavigationService from '../../../services/kyte-navigation'
import { logEvent } from '../../../integrations'
import {
	evaluateTrialMagicRegistration,
	getTrialMagicExperimentLabels,
} from '../../../util/subscription/util-trial-magic-registration'
import ProductVariants from '../variants/tab/ProductVariants'
import StockVariants from '../variants/tab/StockVariants'
import { resetVariantsState } from '../../../stores/variants/actions/product-variant.actions'
import DeleteProductModal from '../modals/DeleteProductModal'
import { checkHasVariants, checkIsParentProduct, isPrime, isTrial } from '@kyteapp/kyte-utils'
import CatalogVersionWarning from '../variants/wizard/components/CatalogVersionWarning'
import { checkShouldShowCatalogVersionWarning } from '../../../util/products/util-variants'
import { Features } from '../../../enums'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import Tooltip from '@kyteapp/kyte-ui-components/src/packages/utilities/tooltip/Tooltip'
import AIProductRegistration from '../magic-registration/AIProductRegistration'
import KyteNotifications from '../../common/KyteNotifications'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import { TouchableOpacity } from 'react-native'

const Strings = {
	t_create_with_ai: I18n.t('createWithAI'),
	t_ai_error_title: I18n.t('identifyProductErrorTitle'),
	t_ai_error_subtitle: I18n.t('identifyProductSubitleError'),
	t_analyzing_product: I18n.t('aiAnalyzingProduct'),
}

const initialLayout = { width: Dimensions.get('window').width }

const buildVariantRoutes = (allowStockManager) =>
	[
		{
			key: ProductWithVariationDetailsTabKeys.Product,
			title: I18n.t('productContainerTitle').toUpperCase(),
		},
		{
			key: ProductWithVariationDetailsTabKeys.Variants,
			title: I18n.t('variants.title').toUpperCase(),
		},
		allowStockManager && {
			key: ProductWithVariationDetailsTabKeys.Stock,
			title: I18n.t('stockContainerTitle').toUpperCase(),
		},
	].filter(Boolean)

const buildStandardRoutes = (allowStockManager) =>
	[
		{
			key: ProductDetailsTabKeys.Product,
			title: I18n.t('productContainerTitle').toUpperCase(),
		},
		allowStockManager && {
			key: ProductDetailsTabKeys.Stock,
			title: I18n.t('stockContainerTitle').toUpperCase(),
		},
	].filter(Boolean)

const areRoutesEqual = (current = [], next = []) => {
	if (current.length !== next.length) return false
	return current.every((route, index) => {
		const nextRoute = next[index]
		return route?.key === nextRoute?.key && route?.title === nextRoute?.title
	})
}

class ProductDetail extends Component {
	constructor(props) {
		super(props)
		const permissions = checkUserPermission(this.props.user.permissions)
		const { allowProductsRegister, allowStockManager } = permissions
		const { params = {} } = props.route
		const { product } = props
		const {
			index: rawIndex = props.initialTabKey ?? ProductDetailsTabKeys.Product,
			barcode = null,
			fromBarcodeReader = false,
			selectedCategory = {},
		} = params
		const initialIndex =
			typeof rawIndex === 'number' && !Number.isNaN(rawIndex)
				? rawIndex
				: Number(rawIndex) || ProductDetailsTabKeys.Product
		const initialRoutes = checkHasVariants(product)
			? buildVariantRoutes(allowStockManager)
			: buildStandardRoutes(allowStockManager)

		this.state = {
			index: initialIndex,
			barcode,
			initialTabKey: initialIndex,
			fromBarcodeReader,
			selectedCategory,
			routes: initialRoutes,
			defaultColors: {
				foreground: colors.primaryBg,
				background: colors.secondaryBg,
			},
			allowProductsRegister,
			allowStockManager,
			isDeleteModalVisible: false,
			shouldStartAIFlow: false,
			notifications: [],
			isAnalyzingProduct: false,
			showAITooltip: false,
		}

		this.handleAIProcessingError = this.handleAIProcessingError.bind(this)
		this.onRequestChangeTab = this.onRequestChangeTab.bind(this)
		this.renderHeader = this.renderHeader.bind(this)
		this.renderLabel = this.renderLabel.bind(this)
		this.renderTabs = this.renderTabs.bind(this)
		this.renderTabsWithVariants = this.renderTabsWithVariants.bind(this)
		this.handleAIButtonPress = this.handleAIButtonPress.bind(this)
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		const nextIndexSource = hasNewInitialTab ? nextProps.initialTabKey : prevState.index
		const resolvedIndex =
			typeof nextIndexSource === 'number' && !Number.isNaN(nextIndexSource)
				? nextIndexSource
				: Number(nextIndexSource) || ProductDetailsTabKeys.Product

		const routes = checkHasVariants(nextProps.product)
			? buildVariantRoutes(prevState.allowStockManager)
			: buildStandardRoutes(prevState.allowStockManager)

		const routesChanged = !areRoutesEqual(prevState.routes, routes)
		const hasNewInitialTab = nextProps.initialTabKey != null && nextProps.initialTabKey !== prevState.initialTabKey

		let index = resolvedIndex

		if (index >= routes.length) index = routes.length - 1
		if (index < 0) index = 0

		const indexChanged = index !== prevState.index
		if (!routesChanged && !hasNewInitialTab && !indexChanged) {
			return null
		}

		return {
			routes,
			index,
			initialTabKey: hasNewInitialTab ? resolvedIndex : prevState.initialTabKey,
		}
	}

	componentDidMount() {
		const { origin, viewport, route, setAISuggestionsApplied, aiSuggestionsApplied } = this.props

		logEvent('New Product View')

		if (isSmallScreen(viewport)) {
			this.BackHandlerListener = BackHandler.addEventListener('hardwareBackPress', this.backPressEvent.bind(this))
		}

		if (origin === DetailOrigin.CREATE) {
			this.props.productManagementReset()
		}

		if (aiSuggestionsApplied) {
			// Reset AI suggestions applied flag when creating new product
			setAISuggestionsApplied(false)
		}

		// Apply AI suggestions if present
		const appliedAISuggestions = route?.params?.appliedAISuggestions
		if (appliedAISuggestions) {
			this.handleApplyAISuggestions(appliedAISuggestions)
			this.props.navigation.setParams({ appliedAISuggestions: null })
		}
	}

	componentDidUpdate(prevProps) {
		// Apply AI suggestions if params changed (when navigating back from AIProductSuggestions)
		const { route } = this.props
		const appliedAISuggestions = route?.params?.appliedAISuggestions
		const prevAppliedAISuggestions = prevProps.route?.params?.appliedAISuggestions

		// Only apply if suggestions are present and different from previous
		if (appliedAISuggestions && appliedAISuggestions !== prevAppliedAISuggestions) {
			this.handleApplyAISuggestions(appliedAISuggestions)
			this.props.navigation.setParams({ appliedAISuggestions: null })
		}

		// Reset tooltip state when connection is restored
		if (!prevProps.isOnline && this.props.isOnline && this.state.showAITooltip) {
			this.setState({ showAITooltip: false })
		}
	}

	componentWillUnmount() {
		if (isSmallScreen(this.props.viewport)) {
			this.BackHandlerListener.remove()
			this.props.productManagementReset()
		}
		this.props.resetVariantsState?.()
		this.props.productStockHistoryClearFilter()
	}

	setTabIndex(index) {
		this.setState({ index })
	}

	onRequestChangeTab(index) {
		this.setState({ index })
	}

	offlineAlert() {
		Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
	}

	async handleAIButtonPress() {
		const { isOnline, billing, toggleBillingMessage } = this.props
		const userIsPrime = isPrime(billing)
		const userIsTrial = isTrial(billing)

		if (!isOnline) {
			this.setState({ showAITooltip: true })
			setTimeout(() => {
				this.setState({ showAITooltip: false })
			}, 3000)
			return
		}

		if (userIsPrime) {
			this.setState({ shouldStartAIFlow: true })
			return
		}

		// Check Trial Magic Registration experiment for Trial users
		if (userIsTrial) {
			try {
				const result = await evaluateTrialMagicRegistration(billing)
				const { trialMagicExperimentProp } = getTrialMagicExperimentLabels(result)

				// If TrialMagicRegistration is enabled, allow access
				if (result.isTrialMagicEnabled) {
					this.setState({ shouldStartAIFlow: true })
					return
				}
			} catch (error) {
				console.error('Error evaluating Trial Magic Registration:', error)
				// On error, fall through to show paywall (default behavior)
			}
		}

		// Show AI Product Registration Paywall
		const { remoteKey } = Features.items[Features.AI_PRODUCT_REGISTRATION_PAYWALL]

		toggleBillingMessage(true, 'Prime', remoteKey ?? '')
		logEvent('Paywall View', { feature: 'ProductAIAutofillFromImage' })
	}

	goToProductShare() {
		const { productPhoto } = this.props.productManaging
		const { search } = this.props.product

		const { name, salePrice, salePromotionalPrice, description, code, uid, showOnCatalog, id, category } =
			this.props.formValues
		const { navigate } = this.props.navigation
		const p = {
			image: productPhoto,
			name,
			salePrice,
			salePromotionalPrice,
			description,
			code,
			category,
			uid,
			showOnCatalog,
			id,
			search,
		}

		navigate('ProductShareOptions', { product: p })
	}

	handleApplyAISuggestions(suggestions) {
		const { productCategory, productManaging, change, productManagementSetValue, productCategorySelect } = this.props
		const MAX_GALLERY_PHOTOS = 6

		// Apply name
		if (suggestions.name) {
			change('ProductSave', 'name', suggestions.name)
		}

		// Apply description
		if (suggestions.description) {
			change('ProductSave', 'description', suggestions.description)
		}

		// Apply price
		if (suggestions.salePrice || suggestions.salePrice === 0) {
			change('ProductSave', 'salePrice', suggestions.salePrice)
		}

		// Apply category - find existing or mark for creation on save
		if (suggestions.category) {
			const categoryId = suggestions.category.id

			const existingCategory = productCategory.list.find((cat) => cat.id === categoryId)

			if (existingCategory) {
				// Category exists, use it
				// productCategorySelect(existingCategory)
				productManagementSetValue(existingCategory, 'category')
				change('ProductSave', 'category', existingCategory)
			} else {
				// Category doesn't exist, mark for creation on save
				// Store the category object in productManaging to be created when saving
				productManagementSetValue(suggestions.category, 'pendingCategory')
				change('ProductSave', 'category', suggestions.category)
			}
		}

		// Apply image if provided
		if (suggestions.image) {
			const { productPhoto, productOtherPhotos } = productManaging
			const gallery = productOtherPhotos.filter(Boolean)

			if (!productPhoto) {
				// No main photo yet, set AI image as main photo
				productManagementSetValue(suggestions.image, 'productPhoto')
			} else if (gallery.length < MAX_GALLERY_PHOTOS) {
				// Gallery has room, append AI image

				gallery.push({ url: suggestions.image })
				productManagementSetValue(gallery, 'productOtherPhotos')
			}
		}
	} 

	handleAIProcessingError() {
		const notification = {
			title: Strings.t_ai_error_title,
			subtitle: Strings.t_ai_error_subtitle,
			type: NotificationType.ERROR,
			handleClose: () => this.setState({ notifications: [] }),
		}

		this.setState({ notifications: [notification] })
	}

	confirmDuplicateProduct() {
		Alert.alert(I18n.t('words.s.attention'), I18n.t('productCopyAlertMsg'), [
			{ text: I18n.t('alertDiscard') },
			{ text: I18n.t('alertConfirm'), onPress: () => this.duplicateProduct() },
		])
	}

	updateProduct(newProduct) {
		const { origin, productCategory, checkoutSort, products } = this.props
		const productsLimit = products.length + 1
		const sort = { key: checkoutSort || 'dateCreation', isDesc: false }

		if (origin === DetailOrigin.BY_SALE) {
			this.props.productDetailBySale(newProduct)
			this.props.productsFetch(sort, null, productCategory.selected, { limit: productsLimit, length: 0 }, 'reboot')
		} else {
			this.props.productDetailUpdate(newProduct)
			this.props.productsListFetch(null, null, null, { limit: 40, length: 0 }, 'reboot')
		}

		// Reset Form Values
		this.props.change('ProductSave', 'name', newProduct.name)
		this.props.change('ProductSave', 'dateCreation', newProduct.dateCreation)
		this.props.change('ProductSave', 'id', newProduct.id)
		this.props.change('ProductSave', 'code', null)
		this.props.change('ProductSave', 'stock', null)
		this.props.change('ProductSave', 'stockActive', false)
		this.props.productManagementSetValue(false, 'isStockEnabled')

		Alert.alert(I18n.t('alertSuccess'), I18n.t('productDuplicated'), [{ text: I18n.t('alertOk'), style: 'cancel' }])
		logEvent('Product Duplicate')
	}

	duplicateProduct() {
		const { product } = this.props
		const copyName = `${product.name} (${I18n.t('words.s.copy')})`
		const dataAdapter = product.category?.dateCreation?._seconds && {
			...product.category,
			dateCreation: moment.unix(product.category.dateCreation._seconds).toDate(),
		}

		const newProductDetail = {
			...product,
			name: copyName,
			stock: null,
			stockActive: false,
			id: null,
			_id: null,
			code: null,
			dateCreation: null,
			category: dataAdapter || product.category,
			variants: [],
			variations: [],
		}

		this.props.productSave(
			newProductDetail,
			(newProduct) => {
				const routes = [
					{
						key: ProductDetailsTabKeys.Product,
						title: I18n.t('productContainerTitle').toUpperCase(),
					},
					{
						key: ProductDetailsTabKeys.Stock,
						title: I18n.t('stockContainerTitle').toUpperCase(),
					},
				]
				// Dynamically update the routes to remove the Variants tab
				this.setState((prevState) => ({
					index: 0, // Reset to the first tab
					routes: routes,
				}))
				this.updateProduct(newProduct)
			},
			true
		)
	}

	alertDiscardChanges() {
		const { goBack } = this.props.navigation
		const { initialValues, aiSuggestionsApplied } = this.props

		Alert.alert(I18n.t('unsavedChangesTitle'), I18n.t('unsavedChangesDescription'), [
			{
				text: I18n.t('alertDiscard'),
				onPress: () => {
					// Track cancel only when user is cancelling a new product creation
					if (!initialValues.id) {
						logEvent('Product Create Cancel', {
							where: 'full-page',
							hasAIAutofillFromImage: !!aiSuggestionsApplied,
						})
					}

					this.props.productDetailCreate()
					goBack()
				},
			},
			{ text: I18n.t('alertDismiss'), onPress: null },
		])
	}

	deleteProduct() {
		const { product, viewport, innerProducts } = this.props
		const shouldSelectProduct = !isSmallScreen(viewport)
		let adjacentProduct

		if (shouldSelectProduct) {
			const productIndex = innerProducts?.findIndex?.(({ id }) => id === product?.id)
			const previousProduct = innerProducts?.[productIndex - 1]
			const nextProduct = innerProducts?.[productIndex + 1]
			adjacentProduct = previousProduct ?? nextProduct
		}

		this.props.productRemove(product.id, () => {
			this.setState({ isDeleteModalVisible: false })
			logEvent('Product Delete', { where: 'detail', hasVariants: product?.variants?.length > 0 })

			this.backToList(true)

			if (shouldSelectProduct) {
				if (adjacentProduct) {
					this.props.productDetailUpdate(adjacentProduct)
				} else {
					this.props.productDetailCreate()
				}
			}
		})
	}

	backToList(removed) {
		const { origin, navigation, product, viewport } = this.props
		const isNotCheckout = origin !== DetailOrigin.BY_SALE

		this.fetchStrategy(product.id, removed, isNotCheckout)
		if (isSmallScreen(viewport) || !isNotCheckout) {
			navigation.goBack()
		} else {
			this.props.startToast(I18n.t('contentSavedSuccessfully'))
		}
	}

	fetchStrategy(productId, removed, isNotCheckout) {
		const {
			stock,
			products,
			checkoutSort,
			productCategory,
			productsSearchText,
			stockSearchText,
			stockFetch,
			productsListFetch,
			productsFetch,
		} = this.props
		const stockLimit = stock.length + 1
		const productsLimit = products.length + 1
		const sort = { key: checkoutSort || 'dateCreation', isDesc: false }

		const wasProductDeleted = !productId || removed
		const isThereASearchActive = Boolean(productsSearchText)

		if (wasProductDeleted && !isThereASearchActive) {
			if (isNotCheckout) {
				stockFetch(stockSearchText, { limit: stockLimit, length: 0 }, 'reboot')
				productsListFetch(sort, null, null, { limit: productsLimit, length: 0 }, 'reboot')
			} else {
				productsFetch(sort, null, productCategory.selected, { limit: productsLimit - 1, length: 0 }, 'reboot')
			}
		}

		if (isThereASearchActive) {
			this.refreshSearchTextResults(productsSearchText, productsLimit, isNotCheckout)
		}
	}

	refreshSearchTextResults(productsSearchText, productsLimit, isNotCheckout) {
		const { productsFetchByNameAndCode } = this.props

		productsFetchByNameAndCode(
			productsSearchText,
			null,
			{ limit: productsLimit, length: 0 },
			true,
			isNotCheckout ? PRODUCTS_LIST_FETCH : PRODUCTS_FETCH
		)
	}

	backPressEvent() {
		this.goBackAction()
		return true
	}

	formSubmit(manuallySaveStock) {
		const { formValues, productManaging, product, user } = this.props
		const { defaultColors } = this.state
		const values = formValues
		const {
			productPhoto,
			productOtherPhotos,
			productColor,
			isFractioned,
			category,
			currentStock,
			minimumStock,
			isStockEnabled,
		} = productManaging
		const stock = {
			current: Number(currentStock),
			minimum: Number(minimumStock),
		}
		const label = values.label || runes.substr(formValues.name, 0, 6)
		const foreground = values.foreground ? values.foreground : defaultColors.foreground
		const background = values.background ? values.background : defaultColors.background

		const stockIntoProduct = {
			stock,
			stockActive: isStockEnabled,
		}

		// Build missing product uid
		const uid = product.id && !product.uid ? user.uid : product.uid
		const dataAdapter = category?.dateCreation?._seconds && {
			...category,
			dateCreation: moment.unix(category.dateCreation._seconds).toDate(),
		}

		const updatedProduct = {
			...values,
			...(manuallySaveStock ? stockIntoProduct : null),
			id: product.id,
			uid,
			foreground: productColor ? productColor.foreground : foreground,
			background: productColor ? productColor.background : background,
			image: productPhoto || null,
			gallery: productOtherPhotos,
			label,
			category: dataAdapter || category,
			isFractioned,
			pin: values.pin ?? false,
		}

		return new Promise((resolve) =>
			resolve(
				this.props.productSave(updatedProduct, () => {
					this.props.stockFetch(this.props.stockFilter.searchText, { limit: 40, length: 0 }, true)
				})
			)
		)
	}

	stockSave() {
		const { product, productManaging, user } = this.props
		const { currentStock, initialStock, minimumStock, isStockEnabled } = productManaging
		const { aid, uid, displayName } = user

		const stockDiff = Math.abs(Number(initialStock - currentStock))
		const stockType = Number(currentStock) > Number(initialStock) ? 'IN' : 'OUT'

		const updatedStock = {
			aid,
			uid,
			userName: displayName,
			productId: product.id,
			quantity: stockDiff,
			minimum: Number(minimumStock),
			type: stockType,
		}

		const stockActivity = {
			aid,
			uid,
			userName: displayName,
			productId: product.id,
		}

		if (!isStockEnabled) {
			return new Promise((resolve) => {
				this.props.productManageStockActivity(stockActivity, this.props.productSetVirtualData(product.id, 0))
				resolve()
			})
		}
		return new Promise((resolve) => {
			this.props.productManageStock(
				updatedStock,
				this.props.productSetVirtualData(product.id, Number(currentStock - initialStock))
			)
			resolve()
		})
	}

	goBackAction() {
		const { navigation, productsSearchText, products, origin } = this.props
		const isNotCheckout = origin !== DetailOrigin.BY_SALE
		const { contentHasChanged } = this.state

		// If any form field or managed product data changed, confirm before leaving
		if (contentHasChanged) {
			this.alertDiscardChanges()
			return
		}

		if (productsSearchText) {
			this.refreshSearchTextResults(productsSearchText, products.length, isNotCheckout)
		}

		if (origin === 'helper') return NavigationService.resetNavigation('CurrentSale')

		navigation.goBack()
	}

	renderTabs({ route }) {
		switch (route.key) {
			case ProductDetailsTabKeys.Stock:
				return this.renderStock()
			case ProductDetailsTabKeys.Product:
			default:
				return this.renderProduct()
		}
	}

	renderTabsWithVariants({ route, jumpTo }) {
		switch (route?.key) {
			case ProductWithVariationDetailsTabKeys.Variants:
				return this.renderVariants()
			case ProductWithVariationDetailsTabKeys.Stock:
				return this.renderStock()
			case ProductWithVariationDetailsTabKeys.Product:
			default:
				return this.renderProduct()
		}
	}

	renderLabel = ({ route, labelText, focused, color }) => {
		const { actionColor, primaryColor } = colors
		const { product } = this.props
		const finalColor = color || (focused ? actionColor : primaryColor)
		const title = route?.title || labelText
		const fontSize = 13

		return (
			<View style={[tabStyle.labelContainer]}>
				<Text
					numberOfLines={1}
					ellipsizeMode="clip"
					allowFontScaling={false}
					style={[tabStyle.customLabel(finalColor, fontSize), { flexShrink: 1 }]}
				>
					{title}
				</Text>
				{product?.stockActive ? this.renderStockCircle(route?.key) : null}
			</View>
		)
	}

	renderHeader(props) {
		return (
			<KyteTabBar
				tabStyle={tabStyle.tab}
				indicatorStyle={tabStyle.indicator}
				style={tabStyle.base}
				renderLabel={this.renderLabel}
				{...props}
			/>
		)
	}

	renderLoader() {
		const { isAnalyzingProduct } = this.state
		const text = isAnalyzingProduct ? Strings.t_analyzing_product : undefined
		return <LoadingCleanScreen text={text} />
	}

	renderStockCircle(key) {
		const { product } = this.props
		const stockStatus = checkStockValueStatus(getVirtualCurrentStock(product), product.stock, product)
		const stockKey = product.variants?.length ? ProductWithVariationDetailsTabKeys.Stock : ProductDetailsTabKeys.Stock
		const isStockTabSelected = key === stockKey
		const shouldRenderCircle = Boolean(isStockTabSelected && stockStatus)

		if (shouldRenderCircle) {
			return <StockCircle status={stockStatus} coreStyle="tabCircle" />
		}
	}

	// Tabs de Produto e Estoque
	renderViewTabs() {
		const { product, initialTabKey } = this.props
		const hasVariants = checkHasVariants(product)
		const renderScene = hasVariants ? this.renderTabsWithVariants : this.renderTabs
		const { index, routes } = this.state
		const shouldNotRender =
			!routes ||
			!Array.isArray(routes) ||
			routes.length === 0 ||
			typeof index !== 'number' ||
			index < 0 ||
			index >= routes.length

		if (shouldNotRender) return null

		const navigationState = { index, routes }
		const routesSignature = routes.map((route) => route.key).join('-')

		return (
			<TabView
				key={routesSignature}
				initialLayout={initialLayout}
				navigationState={navigationState}
				renderScene={renderScene}
				renderTabBar={this.renderHeader}
				onIndexChange={this.onRequestChangeTab}
			/>
		)
	}

	renderProduct() {
		const { selectedCategory } = this.state
		return (
			<ProductSave
				formSubmit={this.formSubmit.bind(this)}
				stockSave={this.stockSave.bind(this)}
				backToList={this.backToList.bind(this)}
				setTabIndex={this.setTabIndex.bind(this)}
				route={this.props.route}
				navigation={this.props.navigation}
				barcode={this.state.barcode}
				selectedPin={selectedCategory.id === 'pin'}
			/>
		)
	}

	renderStock() {
		const { navigation, product } = this.props
		const { goBack } = navigation
		const isFocused = this.state.index === ProductWithVariationDetailsTabKeys.Stock

		if (checkIsParentProduct(product))
			return <StockVariants handleGoBack={goBack} product={product} isFocused={isFocused} />

		return (
			<ProductStock
				formSubmit={this.formSubmit.bind(this)}
				stockSave={this.stockSave.bind(this)}
				backToList={this.backToList.bind(this)}
				navigation={this.props.navigation}
				allowProductsRegister={this.state.allowProductsRegister}
				fromBarcodeReader={this.state.fromBarcodeReader}
				origin={this.props.origin}
			/>
		)
	}

	renderVariants() {
		const { product } = this.props
		const isFocused = this.state.index === ProductWithVariationDetailsTabKeys.Variants

		return <ProductVariants navigation={this.props.navigation} isFocused={isFocused} product={product} />
	}

	render() {
		const { navigate } = this.props.navigation
		const { initialValues, isOnline, product, catalog, billing } = this.props
		const { visible } = this.props.loader
		const { allowStockManager, allowProductsRegister, isDeleteModalVisible, shouldStartAIFlow, showAITooltip } =
			this.state
		const hasVariants = checkHasVariants(product)
		const shouldRenderCatalogVersionWarning =
			checkShouldShowCatalogVersionWarning(catalog) &&
			checkIsParentProduct(product) &&
			this.state.index === ProductWithVariationDetailsTabKeys.Variants
		const isNewProduct = !initialValues.id
		const userIsPrime = isPrime(billing)
		const userIsTrial = isTrial(billing)

		const renderContent = () => {
			if ((allowStockManager && allowProductsRegister) || (hasVariants && allowProductsRegister))
				return (
					<>
						{shouldRenderCatalogVersionWarning && <CatalogVersionWarning />}
						{this.renderViewTabs()}
					</>
				)
			if (allowProductsRegister) return this.renderProduct()
			if (allowStockManager) return this.renderStock()
		}

		const aiButton =
			isNewProduct && !this.props.aiSuggestionsApplied ? (
				<Tooltip
					text={I18n.t('reconnectToCreateWithAI')}
					positionY="bottom"
					isVisible={showAITooltip}
					showArrow
					arrowPosition="top"
					arrowAlign="right"
					containerProps={{ style: { width: 200, right: 10, top: 32 } }}
					textProps={{ style: { textAlign: 'center' } }}
				>
					<TouchableOpacity
						onPress={this.handleAIButtonPress}
						{...generateTestID('ai-create-btn')}
						style={{
							height: 28,
							marginRight: 8,
							borderColor: isOnline ? colors.successTextColor : colors.black24,
							borderWidth: 1.2,
							borderRadius: 4,
							paddingHorizontal: 8,
							paddingVertical: 5,
						}}
					>
						<Row alignItems="center">
							<Margin right={4}>
								<KyteIcon name="ai" size={17} color={isOnline ? colors.successTextColor : colors.black24} />
							</Margin>
							<KyteText size={12} weight={500} color={isOnline ? colors.successTextColor : colors.black24}>
								{Strings.t_create_with_ai}
							</KyteText>
						</Row>
					</TouchableOpacity>
				</Tooltip>
			) : null

		const rightButtons = [
			{
				icon: 'no-internet',
				color: colors.grayBlue,
				onPress: () => this.offlineAlert(),
				iconSize: 20,
				isHidden: isOnline,
				testProps: generateTestID('offline-pes'),
			},
			{
				icon: 'share',
				color: colors.primaryColor,
				onPress: () => this.goToProductShare(),
				iconSize: 20,
				testProps: generateTestID('share-pes'),
			},
			{
				icon: 'copy',
				color: colors.primaryColor,
				onPress: () => this.confirmDuplicateProduct(),
				iconSize: 20,
				testProps: generateTestID('duplicate-pes'),
			},
			{
				icon: 'trash',
				color: colors.primaryColor,
				onPress: () =>
					isOnline
						? this.setState({ isDeleteModalVisible: true })
						: Alert.alert(I18n.t('offlineMessage.title'), I18n.t('offlineMessage.message'), [
								{ text: I18n.t('alertOk') },
						  ]),
				iconSize: 20,
				testProps: generateTestID('delete-pes'),
			},
		]

		return (
			<DetailPage
				key={product.id}
				goBack={() => this.goBackAction()}
				navigate={navigate}
				navigation={this.props.navigation}
				noHeaderBorder
				pageTitle={initialValues.id ? product.name : I18n.t('productCreatePageTitle')}
				rightButtons={initialValues.id ? rightButtons : null}
				rightComponent={!initialValues.id ? aiButton : null}
				toolbarProps={this.props.route?.params?.isBackButtonInvisible && { hideClose: true }}
			>
				{renderContent()}
				{!!visible && this.renderLoader()}
				{isDeleteModalVisible && (
					<DeleteProductModal
						isVisible={isDeleteModalVisible}
						handleDelete={() => this.deleteProduct()}
						onClose={() => this.setState({ isDeleteModalVisible: false })}
						totalVariantProducts={product?.variants?.length}
					/>
				)}
				{isNewProduct && (userIsPrime || (userIsTrial && shouldStartAIFlow)) && (
					<AIProductRegistration
						shouldShowModal={shouldStartAIFlow}
						closeModal={() => this.setState({ shouldStartAIFlow: false })}
						navigation={this.props.navigation}
						onError={this.handleAIProcessingError}
						onStartProcessing={() => this.setState({ isAnalyzingProduct: true })}
						onFinishProcessing={() => this.setState({ isAnalyzingProduct: false })}
            parentRouteKey={this.props.route?.key}
					/>
				)}
				{this.state.notifications.length > 0 && (
					<KyteNotifications
						notifications={this.state.notifications}
						containerProps={{ bottom: Platform.OS === 'ios' ? 0 : 35 }}
					/>
				)}
			</DetailPage>
		)
	}
}

const mapStateToProps = (state) => {
	const { products, productCategory, common, auth, stock, preference, billing } = state
	const { searchText } = stock

	return {
		catalog: auth.store.catalog,
		user: auth.user,
		loader: common.loader,
		isOnline: common.isOnline,
		origin: products.detailOrigin,
		product: products.detail,
		products: products.list,
		innerProducts: products.innerList,
		checkoutSort: preference.account.checkoutSort,
		stock: stock.list,
		stockFilter: { searchText },
		productManaging: products.productManaging,
		productsSearchText: products.searchText,
		stockSearchText: stock.searchText,
		initialValues: products.detail,
		formValues: getFormValues('ProductSave')(state),
		productCategory,
		viewport: common.viewport,
		initialTabKey: products.detailTabKey,
		stockServerList: stock.serverList,
		aiSuggestionsApplied: products.aiSuggestionsApplied,
		billing,
	}
}

export default connect(mapStateToProps, {
	productsFetch,
	productsListFetch,
	stockFetch,
	productRemove,
	productSave,
	productManageStock,
	productManageStockActivity,
	productManagementReset,
	productStockHistoryClearFilter,
	productSetVirtualData,
	productDetailBySale,
	productDetailUpdate,
	productsFetchByNameAndCode,
	productManagementSetValue,
	productDetailCreate,
	change,
	startToast,
	resetVariantsState,
	productsListServerFetch,
	stockServerFetch,
	stockSetServerList,
	productCategorySelect,
	setAISuggestionsApplied,
	toggleBillingMessage,
})(ProductDetail)
