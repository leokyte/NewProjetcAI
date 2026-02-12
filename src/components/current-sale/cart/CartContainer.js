import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, ScrollView, Text, Alert, TouchableOpacity, BackHandler, Image } from 'react-native'
import { Icon } from 'react-native-elements'
import { MobileOnly, isSmallScreen, LargeScreenOnly, Container, KyteText } from '@kyteapp/kyte-ui-components'
import CartItem from './CartItem'
import CheckoutButton from '../../common/CheckoutButton'
import { colors, colorSet, Type } from '../../../styles'
import {
	currentSaleRenew,
	currentSaleSetOptionalTax,
	currentSaleDiscount,
	checkPlanKeys,
	currentSaleAddProduct,
	checkUserReachedLimit,
	productDetailBySale,
	hasActiveShippingFees as checkActiveShippingFees,
	setBarcodeVisibility,
	getCurrentSaleTotalItems,
} from '../../../stores/actions'
import {
	KyteButton,
	KyteModal,
	KyteToolbar,
	KyteIcon,
	CurrencyText,
	Tag,
	ListOptions,
	KyteBarCode,
	BeepOnOffIcon,
	KyteSafeAreaView,
	ToolbarCustomer,
} from '../../common'
import HeaderButton from '../../common/HeaderButton'
import I18n from '../../../i18n/i18n'
import {
	checkUserPermission,
	receiptTaxesLabel,
	avoidDoubleClick,
	truncateNoRounding,
	getVirtualCurrentStock,
	generateTestID,
} from '../../../util'
import { Features, OrderStatus } from '../../../enums'
import { logEvent } from '../../../integrations'
import { getProductByCode } from '../../../repository'
import NavigationService from '../../../services/kyte-navigation'
import { EmptyCart } from '../../../../assets/images'

// SplitCode KyteBarCode
// SplitCode BeepOnOffIcon
// SplitCode KyteModal

const Strings = {
	t_shipping_fees_label: I18n.t('ShippingFees.PageTitle'),
	t_shipping_fees_add_label: I18n.t('ShippingFees.Add'),
}

const STATUS_OPENED = OrderStatus.items[OrderStatus.OPENED].status

class Cart extends Component {
	static navigationOptions = () => {
		return {
			header: null,
		}
	}

	constructor(props) {
		super(props)
		const { addObservation, addDiscount, clearCart } = I18n.t('cartOptions')
		const { params = {} } = props.route
		const isSaleClosed = params.isClosed
		const hasCustomStatus = props.salesStatus.find((s) => s.status === props.currentSale.status)
		const hasActiveShippingFees = props.checkActiveShippingFees()
		const hideShippingFeeOption = this.hideShippingFeeOption(hasActiveShippingFees)

		this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
		this.backHandlerSubscription = null

		this.state = {
			isModalVisible: false,
			isReceiptVisible: false,
			finishLater: '',
			scrollDown: false,
			options: [
				{
					title: Strings.t_shipping_fees_label,
					onPress: () => this.pickShippingFees(),
					color: colors.primaryColor,
					hideItem: hideShippingFeeOption,
				},
				{
					title: addObservation,
					onPress: () => this.observationOption(),
					color: colors.primaryColor,
				},
				{ title: addDiscount, onPress: () => this.discountOption(), color: colors.primaryColor },
				{
					title: clearCart,
					hideChevron: true,
					onPress: () => this.alertClearCart(),
					color: colors.errorColor,
					hideItem: isSaleClosed,
				},
			],
			stockKey: Features.items[Features.STOCK].key,
			isStockAllowed: false,
			productQuantity: 1,
			isCameraAvailable: false,
			selectedCartItem: '',
			showBarCode: true,
			hasCustomStatus,
			hasActiveShippingFees,
			hideShippingFeeOption,
		}

		this.scrollViewRef = React.createRef()
	}

	UNSAFE_componentWillMount() {
		if (this.props.customer) this.setCustomer()
		this.checkKeys()
		this.backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick)
	}

	componentDidMount() {
		const { navigation, saleItems } = this.props
		this.willFocusListener = navigation.addListener('focus', () => {
			this.setState({ isCameraAvailable: true })
			this.setState({ hasActiveShippingFees: this.props.checkActiveShippingFees() })
		})
		this.willBlurListener = navigation.addListener('blur', () => {
			this.setState({ isCameraAvailable: false })
			this.hideOptions()
		})

		this.timer = setTimeout(() => {
			this.scrollToBottom()
		})

		logEvent('Checkout Cart View')
	}

	UNSAFE_componentWillUpdate(nextProps, nextState) {
		const { selectedCartItem } = this.state
		if (selectedCartItem !== nextState.selectedCartItem) return
		this.scrollToBottom()
	}

	componentWillUnmount() {
		if (this.willFocusListener) this.willFocusListener = null
		if (this.willBlurListener) this.willBlurListener = null

		clearTimeout(this.timer)
		this.backHandlerSubscription?.remove()
	}

	isAdmin = checkUserPermission(this.props.user.permissions).isAdmin

	hideShippingFeeOption(hasActiveShippingFees) {
		const { currentSale } = this.props
		const statusOk = !currentSale.status || currentSale.status === STATUS_OPENED
		if (statusOk) {
			if (this.isAdmin) return false
			if (hasActiveShippingFees) return false
		}
		return true
	}

	handleBackButtonClick() {
		const { params = {} } = this.props.route
		const isSaleClosed = params.isClosed

		if (isSaleClosed) this.props.currentSaleRenew()
		// this.props.navigation.goBack();
	}

	setCustomer() {
		this.props.navigation.setParams({
			customer: this.props.customer,
		})
	}

	async checkKeys() {
		const { stockKey } = this.state
		this.setState({ isStockAllowed: await this.props.checkPlanKeys(stockKey) })
	}

	scrollToBottom() {
		const scrollView = this.scrollViewRef.current
		if (scrollView) {
			const scrollResponder = scrollView.getScrollResponder()
			scrollResponder.scrollToEnd({ animated: true })
		}
	}

	openOptions() {
		logEvent('Checkout Cart More Click')
		this.setState({ isModalVisible: true })
	}

	hideOptions() {
		this.setState({ isModalVisible: false })
	}

	alertClearCart() {
		Alert.alert(I18n.t('cartClearAlertTitle'), I18n.t('cartClearAlertDescription'), [
			{ text: I18n.t('alertDismiss'), onPress: () => this.hideOptions() },
			{ text: I18n.t('alertConfirm'), onPress: () => this.clearCart() },
		])
	}

	alertUpdateItem(method) {
		Alert.alert(I18n.t('cartUpdateItemAlertTitle'), I18n.t('cartUpdateItemAlertDescription'), [
			{ text: I18n.t('alertDismiss') },
			{ text: I18n.t('alertConfirm'), onPress: method },
		])
	}

	pickShippingFees() {
		// You can apply a shipping fee if you have some
		if (this.state.hasActiveShippingFees) {
			return this.goToShippingFeesApply()
		}
		// Go create some shipping fee if you dont have any
		return this.goToShippingFees()
	}

	discountOption() {
		const { currentSale, user } = this.props
		const { permissions } = user
		const { navigate } = this.props.navigation

		this.hideOptions()
		if (checkUserPermission(permissions).allowSalesDiscount) {
			this.timer = setTimeout(() => navigate('Discount', { previousCartState: currentSale }), 500)
			return
		}
		Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToGiveDiscounts'), [
			{ text: I18n.t('words.s.ok'), onPress: () => this.hideOptions() },
		])
	}

	observationOption() {
		const { navigation, observation, showObservationInReceipt } = this.props
		const { navigate } = navigation

		navigate('CartObservation', { observation, showObservationInReceipt })
	}

	clearCart() {
		const { navigate } = this.props.navigation

		this.props.currentSaleRenew()
		navigate('CurrentSale')
	}

	goToShippingFees() {
		return this.props.navigation.navigate({ key: 'ShippingFeesTipPage', name: 'ShippingFeesTip' })
	}

	goToShippingFeesApply() {
		return this.props.navigation.navigate({
			key: 'ShippingFeesApplyPage',
			name: 'ShippingFeesApply',
		})
	}

	goToPayment() {
		// const { navigate } = this.props.navigation;
		this.props.setBarcodeVisibility(false)
		NavigationService.navigate(null, 'Payment', { origin: 'sale' })
	}

	goToDiscount() {
		const { currentSale, user } = this.props
		const { permissions } = user
		const { navigate } = this.props.navigation
		if (checkUserPermission(permissions).allowSalesDiscount) {
			navigate('Discount', { previousCartState: currentSale })
			return
		}
		Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToGiveDiscounts'))
	}

	toggleOptionalTax() {
		const { useSaleTaxes } = this.props
		this.props.currentSaleSetOptionalTax(!useSaleTaxes)
	}

	doItemSelection(itemId) {
		const { selectedCartItem } = this.state
		const selected = itemId === selectedCartItem ? '' : itemId
		this.setState({ selectedCartItem: selected })
	}

	handleBarcodeRead(barcode) {
		const product = getProductByCode(barcode)

		if (product) {
			let productPayload
			try {
				productPayload = product.clone()
			} catch (ex) {
				productPayload = { ...product }
			}

			this.addProductToCart({
				...productPayload,
				virtualCurrentStock: product.stock ? product.stock.current : null,
			})
		} // Create new object to avoid redux-form error
		else this.alertProductNotFound(barcode)

		logEvent('Current Sale Barcode')
	}

	alertProductNotFound(barcode) {
		const { navigate } = this.props.navigation
		this.setState({ isCameraAvailable: false })
		Alert.alert(I18n.t('barcodeProductNotFoundAlertTitle'), I18n.t('barcodeProductNotFoundAlertText'), [
			{
				text: I18n.t('barcodeProductNotFoundAlertCreate'),
				onPress: () => {
					this.props.productDetailBySale()
					this.setState({ isCameraAvailable: true })
					navigate('CurrentSale', {
						screen: 'ProductDetail',
						initial: false,
						params: {
							screen: 'ProductDetail',
							params: { barcode, fromBarcodeReader: true },
						},
					})
				},
			},
			{
				text: I18n.t('alertOk'),
				onPress: () => this.setState({ isCameraAvailable: true }),
			},
		])
	}

	openFractionedQuantity(products) {
		const { navigate } = this.props.navigation
		navigate('QuantityFractioned', {
			products,
			SaleAddProduct: this.onClickCurrentSaleAddProduct.bind(this),
		})
	}

	onClickCurrentSaleAddProduct(product, fraction) {
		const { id, name, salePrice, saleCostPrice, salePromotionalPrice, isFractioned, stockActive, variations } = product
		const { productQuantity } = this.state
		const quantity = !isFractioned ? parseInt(productQuantity) : 1
		const hasPromotionalPrice = Number.isFinite(salePromotionalPrice)

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
			getVirtualCurrentStock(product),
			variations
		)
		this.setState({ productQuantity: 1 })

		logEvent('Checkout Product Add', { quantity: this.props.getCurrentSaleTotalItems(), where: 'barcode-search', isFractioned: isFractioned, isVariant: variations?.length > 0 })
	}

	renderCustomer() {
		return <ToolbarCustomer customer={this.props.customer} navigation={this.props.navigation} />
	}

	renderCustomerIcon() {
		const { navigate } = this.props.navigation
		return (
			<HeaderButton
				buttonKyteIcon
				size={18}
				icon="customer-plus"
				color={colors.actionColor}
				onPress={() => {
					logEvent('Checkout Customer Select Click', {
						where: 'cart',
					})

					navigate('CustomerAdd', {
						screen: 'CustomerAdd',
						params: { origin: 'cart' },
					})
				}}
				testProps={generateTestID('add-cust-ct')}
			/>
		)
	}

	renderProductQuantityIcon() {
		const { navigate } = this.props.navigation
		const { productQuantity } = this.state
		return (
			<View style={{ alignSelf: 'center' }}>
				<Tag
					style={{ marginHorizontal: 10 }}
					onPress={() => {
						this.setState({ isCameraAvailable: false })
						navigate('Quantity', {
							setQuantity: (qtd) => this.setState({ productQuantity: qtd }),
							productQuantity: this.state.productQuantity,
							onUnmount: () => this.setState({ isCameraAvailable: true }),
						})
					}}
					info={`${productQuantity} X`}
					color={productQuantity > 1 ? '#FFF' : colors.primaryColor}
					background={productQuantity > 1 ? colors.primaryColor : null}
				/>
			</View>
		)
	}

	renderSoundsOnOffIcons() {
		return <BeepOnOffIcon />
	}

	renderHeaderIcons(barcodeVisibility) {
		const { customer } = this.props
		return (
			<View style={{ flexDirection: 'row' }}>
				{barcodeVisibility ? this.renderSoundsOnOffIcons() : null}
				{barcodeVisibility ? this.renderProductQuantityIcon() : null}
				{customer ? this.renderCustomer() : this.renderCustomerIcon()}
			</View>
		)
	}

	renderOptions() {
		return <ListOptions items={this.state.options} />
	}

	renderTotalGross() {
		const { totalGross } = this.props
		const { infoItem, infoContainer } = styles

		return (
			<View style={infoContainer}>
				<Text style={[Type.Medium, colorSet(colors.primaryColor), infoItem]} {...generateTestID('subtotal-ct')}>
					{`${I18n.t('words.s.subtotal')}: `}
					<CurrencyText value={totalGross} />
				</Text>
			</View>
		)
	}

	renderDiscountInfo() {
		const { discountValue, discountPercent, currentSale } = this.props
		const { navigate } = this.props.navigation
		const { infoItem, infoContainer, removeIcon } = styles

		return (
			<View style={infoContainer} testProps={generateTestID('add-disc-ct')}>
				<KyteButton
					width={30}
					height={30}
					onPress={() => this.props.currentSaleDiscount(0, null)}
					style={removeIcon}
					testProps={generateTestID('rmv-disc-ct')}
				>
					<KyteIcon size={26} name="close-x" color={colors.errorColor} />
				</KyteButton>
				<TouchableOpacity onPress={() => navigate('Discount', { previousCartState: currentSale })} activeOpacity={0.8}>
					<Text style={[Type.Regular, colorSet(colors.errorColor), infoItem]} {...generateTestID('disc-text-ct')}>
						{`${I18n.t('words.s.discount')}: `}
						{`(${discountPercent}%) `}
						<CurrencyText value={discountValue} />
					</Text>
				</TouchableOpacity>
			</View>
		)
	}

	renderShortcut(onPress, label, testProps) {
		const { infoItem, infoContainer } = styles
		return (
			<TouchableOpacity style={infoContainer} onPress={onPress} activeOpacity={0.8} {...testProps}>
				<Text style={[Type.Regular, colorSet(colors.actionColor), infoItem]}>{label}</Text>
			</TouchableOpacity>
		)
	}

	renderObservation() {
		const { infoItem, obsIcon, infoContainer } = styles
		const { observation, navigation } = this.props
		const { navigate } = navigation

		return (
			<TouchableOpacity
				onPress={() => navigate('CartObservation', { observation: this.props.observation })}
				style={infoContainer}
				activeOpacity={0.8}
			>
				<KyteIcon name="observation" color={colors.infoColor} style={obsIcon} />
				<Text style={[Type.Regular, colorSet(colors.infoColor), infoItem]} {...generateTestID('note-ct')}>
					{observation}
				</Text>
			</TouchableOpacity>
		)
	}

	renderCartItems() {
		const { currentSale } = this.props
		const { navigate } = this.props.navigation
		const { isStockAllowed, selectedCartItem, hasCustomStatus } = this.state
		const { permissions } = this.props.user
		const { allowSalesDiscount } = checkUserPermission(permissions)
		const isConfirmed = currentSale.status === 'confirmed'

		const navigateWithAlert = (item, method) => {
			if (item.discount.discountValue) return this.alertUpdateItem(method)
			method()
		}

		return this.props.saleItems.map((item) => {
			return (
				<CartItem
					key={item.itemId}
					item={item}
					selected={selectedCartItem}
					doItemSelection={this.doItemSelection.bind(this)}
					goToDescription={() =>
						navigate('CartItemDescription', {
							item,
							doItemSelection: this.doItemSelection.bind(this),
						})
					}
					goToQuantity={
						!isConfirmed && !hasCustomStatus
							? () =>
									navigateWithAlert(item, () =>
										navigate('CartItemUpdate', {
											item,
											doItemSelection: this.doItemSelection.bind(this),
										})
									)
							: 'disabled'
					}
					goToValue={
						allowSalesDiscount
							? () => navigateWithAlert(item, () => navigate('CartItemUpdate', { item, updateUnitValue: true }))
							: null
					}
					goToDiscount={
						allowSalesDiscount
							? () =>
									navigate('CartItemDiscount', {
										itemId: item.itemId,
										previousCartState: currentSale,
									})
							: null
					}
					isStockAllowed={isStockAllowed}
					style={{ backgroundColor: 'white' }}
					{...generateTestID(`item-list-ct-${item.itemId}`)}
				/>
			)
		})
	}

	renderBottom(optionMethod) {
		const { bottomButtons, optionButton } = styles
		const { totalNet } = this.props

		return (
			<View style={bottomButtons}>
				<View style={{ width: 60 }}>
					<KyteButton
						width={50}
						height={50}
						background="#f1f1f1"
						style={optionButton}
						onPress={optionMethod}
						testProps={generateTestID('more-btn-ct')}
					>
						<Icon name="more-horiz" color={colors.pimaryLighter} />
					</KyteButton>
				</View>

				<View style={{ flex: 1 }}>
					<CheckoutButton totalValue={totalNet} buttonFlex onPress={this.goToPayment.bind(this)} />
				</View>
			</View>
		)
	}

	renderCartTitle() {
		const { totalItems } = this.props
		if (totalItems > 1) {
			return `${totalItems} ${I18n.t('words.p.item')}`
		}
		return `${totalItems} ${I18n.t('words.s.item')}`
	}

	renderSaleTax() {
		const { taxes, totalTaxes, useSaleTaxes } = this.props
		const { infoItem, infoContainer, removeIcon } = styles
		const tax = taxes[0]
		const enableRemove = tax.optional === true

		const content = () => (
			<View style={infoContainer}>
				{enableRemove ? removeTax() : null}
				<Text style={[Type.Regular, colorSet(colors.primaryColor), infoItem]} {...generateTestID('text-tax-ct')}>
					{receiptTaxesLabel(tax)}
					<CurrencyText value={truncateNoRounding(totalTaxes)} />
				</Text>
			</View>
		)

		const removeTax = () => (
			<KyteButton
				width={30}
				height={30}
				onPress={() => this.toggleOptionalTax()}
				style={removeIcon}
				testProps={generateTestID('rmv-tax-ct')}
			>
				<KyteIcon size={26} name="close-x" color={colors.primaryColor} />
			</KyteButton>
		)

		const reAddTax = () =>
			this.renderShortcut(this.toggleOptionalTax.bind(this), `${I18n.t('words.s.readd')} ${tax.name}`, {
				...generateTestID('add-tax-ct'),
			})

		return useSaleTaxes ? content() : reAddTax()
	}

	renderShippingFee() {
		const { shippingFee } = this.props
		const { hideShippingFeeOption } = this.state
		const { infoItem, infoContainer, removeIcon } = styles

		const renderEditIcon = () => (
			<KyteButton
				width={26}
				height={26}
				onPress={() => this.goToShippingFeesApply()}
				style={[removeIcon, { borderRadius: 50, borderWidth: 1.3, borderColor: colors.primaryColor }]}
				testProps={generateTestID('rmv-delivery-ct')}
			>
				<KyteIcon size={16} name="edit" color={colors.primaryColor} />
			</KyteButton>
		)

		return (
			<View style={infoContainer}>
				{hideShippingFeeOption ? null : renderEditIcon()}
				<Text style={[Type.Regular, colorSet(colors.primaryColor), infoItem]} {...generateTestID('delivery-text-ct')}>
					{`${I18n.t('words.s.delivery')} (${shippingFee.name}): `}
					<CurrencyText value={shippingFee.value} />
				</Text>
			</View>
		)
	}

	renderProductTax() {
		const { taxes, totalTaxes } = this.props
		const { infoItem, infoContainer } = styles
		const tax = taxes[0]

		const content = () => (
			<View style={infoContainer}>
				<Text style={[Type.Regular, colorSet(colors.primaryColor), infoItem]}>
					{receiptTaxesLabel(tax)}
					<CurrencyText value={totalTaxes} />
				</Text>
			</View>
		)

		return content()
	}

	renderCartInfo() {
		const { cartInfo, infoItem, infoContainer } = styles
		const { discountValue, observation, taxes, totalGross, totalNet, shippingFee } = this.props
		const { hideShippingFeeOption } = this.state
		const tax = taxes[0]
		const hasTax = taxes.length && tax.active
		const saleTax = hasTax && tax.type === 'sale-tax'
		const productTax = hasTax && tax.type === 'product-tax'
		const showTotalGross = totalGross !== totalNet

		const discountShortcut = this.renderShortcut(this.goToDiscount.bind(this), I18n.t('cartDiscountButton'), {
			...generateTestID('add-disc-ct'),
		})
		const shippingFeeShortcut =
			this.state.hasActiveShippingFees && !hideShippingFeeOption
				? this.renderShortcut(this.pickShippingFees.bind(this), Strings.t_shipping_fees_add_label, {
						...generateTestID('add-delivery-ct'),
				  })
				: null

		return (
			<View style={cartInfo}>
				{showTotalGross ? this.renderTotalGross() : null}
				{discountValue ? this.renderDiscountInfo() : discountShortcut}
				{saleTax ? this.renderSaleTax() : null}
				{shippingFee ? this.renderShippingFee() : shippingFeeShortcut}
				<View style={[infoContainer, { marginTop: 5 }]}>
					<Text style={[Type.Medium, colorSet(colors.primaryColor), infoItem]} {...generateTestID('total-ct')}>
						{`${I18n.t('words.s.total').toUpperCase()}: `}
						<CurrencyText value={this.props.totalNet} />
					</Text>
				</View>
				{productTax ? this.renderProductTax() : null}
				{observation ? this.renderObservation() : null}
			</View>
		)
	}

	renderBarcodeTip() {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
				<Text style={[Type.Regular, { color: colors.secondaryBg, fontSize: 20, textAlign: 'center', lineHeight: 35 }]}>
					{I18n.t('barcodeCartTip')}
				</Text>
			</View>
		)
	}

	addProductToCart(product) {
		// checking if user has reached their limit
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

		const { isFractioned } = product
		if (isFractioned) {
			avoidDoubleClick(() => this.openFractionedQuantity(product))
			return
		}
		this.onClickCurrentSaleAddProduct(product)
	}

	renderBarcode() {
		return <KyteBarCode height={150} onBarcodeRead={this.handleBarcodeRead.bind(this)} isVisible />
	}

	renderCart() {
		return (
			<ScrollView ref={this.scrollViewRef}>
				{this.renderCartItems()}
				{this.renderCartInfo()}
			</ScrollView>
		)
	}

	render() {
		const { outerContainer } = styles
		const { saleItems, navigation, route, viewport, barcodeVisibility } = this.props
		const { isCameraAvailable } = this.state
		const { navigate, goBack } = navigation
		const { params = {} } = route
		const haveItems = saleItems.length
		const emptyCartBarCode = !haveItems && barcodeVisibility
		const isSaleClosed = params.isClosed
		const isMobile = isSmallScreen(viewport)

		return (
			<KyteSafeAreaView style={outerContainer}>
				<KyteToolbar
					innerPage
					borderBottom={1.5}
					headerTitle={barcodeVisibility ? I18n.t('sideMenu.currentSale') : I18n.t('cartTitle')}
					rightComponent={this.renderHeaderIcons(barcodeVisibility)}
					goBack={
						isSaleClosed
							? () => {
									goBack()
									this.props.currentSaleRenew()
							  }
							: () => navigate('CurrentSale')
					}
					navigate={navigate}
					navigation={this.props.navigation}
					showCloseButton={isSaleClosed}
					hideTitle={params.hideTitle}
					hideCloseIcon={params.hideTitle}
				/>
				<Container backgroundColor={isMobile ? colors.lightBg : colors.white} flex={1}>
					{barcodeVisibility && (isCameraAvailable || !isMobile) ? this.renderBarcode() : null}
					{emptyCartBarCode ? (
						this.renderBarcodeTip()
					) : (
						<>
							<MobileOnly>{this.renderCart()}</MobileOnly>
							<LargeScreenOnly>
								{haveItems ? (
									this.renderCart()
								) : (
									<Container flex={1} padding={50} justifyContent="center">
										<Image style={styles.addProductToCartImage} source={{ uri: EmptyCart }} />
										<KyteText textAlign="center" marginTop={15} color={colors.primaryDarker} size={11} lineHeight={17}>
											{I18n.t('addProductsToCart')}
										</KyteText>
									</Container>
								)}
							</LargeScreenOnly>
						</>
					)}
					{emptyCartBarCode ? null : this.renderBottom(() => this.openOptions())}
				</Container>
				<KyteModal
					bottomPage
					height="auto"
					isModalVisible={this.state.isModalVisible}
					hideModal={() => this.hideOptions()}
					title={I18n.t('cartOptions.title')}
				>
					<View>
						{this.renderOptions()}
						<MobileOnly>{this.renderBottom(() => this.hideOptions())}</MobileOnly>
					</View>
				</KyteModal>
			</KyteSafeAreaView>
		)
	}
}

const mapStateToProps = (state) => {
	const { currentSale, preference, auth, common } = state
	const {
		customer,
		items,
		discountValue,
		discountPercent,
		totalNet,
		totalGross,
		totalItems,
		totalTaxes,
		useSaleTaxes,
		taxes,
		shippingFee,
		observation,
		showObservationInReceipt,
	} = currentSale
	return {
		currentSale,
		customer,
		saleItems: items,
		discountValue,
		discountPercent,
		totalNet,
		totalGross,
		totalItems,
		totalTaxes,
		useSaleTaxes,
		taxes,
		shippingFee,
		observation,
		showObservationInReceipt,
		user: auth.user,
		products: state.products.list,
		salesStatus: preference.account.salesStatus,
		viewport: state.common.viewport,
		barcodeVisibility: common.barcodeVisibility,
	}
}

const styles = {
	outerContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-end',
		backgroundColor: '#FFF',
	},
	bottomButtons: {
		backgroundColor: 'white',
		marginBottom: 0,
		flexDirection: 'row',
	},
	optionButton: {
		marginTop: 10,
		marginLeft: 10,
	},
	cartInfo: {
		flex: 1,
		flexDirection: 'column',
		paddingVertical: 15,
		paddingHorizontal: 5,
	},
	infoItem: {
		flexDirection: 'column',
		textAlign: 'right',
		paddingHorizontal: 10,
		fontSize: 16,
	},
	obsIcon: {
		position: 'relative',
		top: 2,
		right: -5,
	},
	infoContainer: {
		alignSelf: 'flex-end',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	removeIcon: {
		position: 'relative',
		top: 1,
	},
	addProductToCartImage: {
		height: 100,
		resizeMode: 'contain',
	},
}

export default connect(mapStateToProps, {
	currentSaleRenew,
	currentSaleSetOptionalTax,
	currentSaleDiscount,
	checkPlanKeys,
	currentSaleAddProduct,
	checkUserReachedLimit,
	productDetailBySale,
	checkActiveShippingFees,
	setBarcodeVisibility,
	getCurrentSaleTotalItems,
})(Cart)
