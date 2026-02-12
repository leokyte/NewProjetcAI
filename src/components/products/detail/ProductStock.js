import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getFormValues } from 'redux-form'
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native'

import { KyteSwitch } from '@kyteapp/kyte-ui-components'
import { isSmallScreen } from '@kyteapp/kyte-ui-components/src/packages/utils/util-screen'
import { checkIsChildProduct } from '@kyteapp/kyte-utils'
import { SwitchContainer, ActionButton, ListOptions, KyteModal } from '../../common'
import {
	productManagementSetValue,
	productSave,
	productSetVirtualData,
	checkFeatureIsAllowed,
	checkPlanKeys,
	productManageStock,
	productManageStockActivity,
	startToast,
	fetchStockTotals,
	stockFetch,
} from '../../../stores/actions'
import { scaffolding, colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { DottedArrowDown } from '../../../../assets/images'
import { formatStockFractioned, checkStockValueStatus, generateTestID, checkUserPermission } from '../../../util'
import { Features } from '../../../enums'
import { logEvent } from '../../../integrations'
import { variantManagementSetValue } from '../../../stores/variants/actions/product-variant.actions'
import { checkIsVariant } from '../../../util/products/util-variants'
import { DetailOrigin } from '../../../enums/DetailOrigin'
import { getProductVariants } from '../../../stores/variants/actions/product-variant.async.actions'

// Codesplit declaration
let CurrentStockManager = null
let MinimumStockManager = null

const styles = StyleSheet.create({
	stockContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	stockNumber: (color) => ({
		color,
		fontFamily: 'Graphik-Light',
		fontSize: 70,
	}),
	stockTitle: {
		fontFamily: 'Graphik-Light',
		fontSize: 26,
		color: colors.primaryColor,
	},
	numberContainer: (opacity) => ({
		opacity,
		flexDirection: 'column',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: colors.primaryColor,
	}),
	tipContainer: {
		flex: 1,
		marginTop: '-10%',
		alignItems: 'center',
	},
	stockTip: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		width: '60%',
	},
	tipText: {
		fontFamily: 'Graphik-Medium',
		fontSize: 18,
		lineHeight: 32,
		color: colors.primaryColor,
		textAlign: 'center',
		marginBottom: 10,
	},
	tipArrow: {
		marginBottom: 5,
		transform: [{ rotate: '180deg' }],
	},
})

class ProductStock extends Component {
	constructor(props) {
		super(props)
		const { key, remoteKey } = Features.items[Features.STOCK]

		this.state = {
			key,
			remoteKey,
			isBillingAllowed: false,
			isConnected: props.isOnline,
			productHasChanged: false,
			lastGoToCurrentStockManager: new Date('1999'),
			isModalStockManagerVisible: false,
			isModalMinimumManagerVisible: false,
			lastClickProductSave: new Date('1999'),
		}
	}

	UNSAFE_componentWillMount() {
		this.checkPlanKeys()
	}

	// componentWillReceiveProps(nextProps) {
	//   const { form, productManaging } = nextProps;
	//   console.log('form', form);
	//   const values = form ? form.values : {};
	//
	//   const contentHasChanged = productManaging.contentHasChanged;
	//   const formIsEqual = _.isEqual(this.state.initialValues, _.omit(values, ['fractioned']));
	//
	//   this.doSaveProduct = !formIsEqual || contentHasChanged;
	// }

	async checkPlanKeys() {
		this.setState({ isBillingAllowed: await this.props.checkPlanKeys() })
	}

	handleConnectivity(isConnected) {
		this.setState({ isConnected })
	}

	offlineAlert() {
		Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
	}

	checkBillingAllowed(callback) {
		const { key, remoteKey } = this.state
		this.props.checkFeatureIsAllowed(key, () => callback(), remoteKey)
	}

	backToList(removed) {
		const { origin, navigation, product, viewport, stockSearchText } = this.props
		const isNotCheckout = origin !== DetailOrigin.BY_SALE

		this.props.fetchStockTotals({ search: stockSearchText })

		this.fetchStrategy(product.id, removed, isNotCheckout)

		if (isSmallScreen(viewport) || !isNotCheckout) {
			navigation.goBack()
		} else {
			this.props.startToast(I18n.t('contentSavedSuccessfully'))
		}
	}

	fetchStrategy(_productId, _removed, _isNotCheckout) {
		const { stockSearchText } = this.props

		this.props.stockFetch(stockSearchText, { limit: 40, length: 0 }, 'reboot')
	}

	finishManaging() {
		const { product, formSubmit, allowProductsRegister } = this.props
		const { lastClickProductSave } = this.state

		const manuallySaveStock = !product.id
		if (new Date().getTime() < lastClickProductSave.getTime() + 3000) return
		this.setState({ lastClickProductSave: new Date() })

		if (!allowProductsRegister || checkIsVariant(product)) {
			return this.stockSave().then(() => {
				this.trackStockSave()
				if (checkIsVariant(product)) {
					setTimeout(() => {
						this.props?.getProductVariants(this.props.parentProduct)
					}, 1000) // awaiting for product stock to be updated
				}
				this.backToList()
			})
		}

		formSubmit(manuallySaveStock).then(() => {
			if (!manuallySaveStock) {
				this.stockSave().then(() => {
					this.trackStockSave()
				})
			}
			this.backToList()
		})
	}

	trackStockSave() {
		const { product, productManaging } = this.props
		const { isStockEnabled } = productManaging

		if (!product.stock && isStockEnabled) {
			logEvent('Product Stock Enabled', {
				hasVariants: Boolean(product?.variants?.length),
			})
		}
		if (product?.variations?.length) {
			logEvent('Product Variant Stock Save')
		} else {
			logEvent('Product Stock Save')
		}
	}

	goToCurrentStockManager() {
		const { lastGoToCurrentStockManager } = this.state
		const { navigation, productManaging, product, fromBarcodeReader, isOnline } = this.props
		const { currentStock } = productManaging
		const { navigate } = navigation
		const isVariant = checkIsVariant(product)

		if (new Date().getTime() < lastGoToCurrentStockManager.getTime() + 1000) return
		this.setState({ lastGoToCurrentStockManager: new Date() })

		if (!isOnline) return this.offlineAlert()
		if (!product.stock) this.productManagementSetValue(true, 'isStockEnabled')
		this.productManagementSetValue(currentStock, 'currentStock')
		if (fromBarcodeReader) {
			// Codesplit require
			if (!CurrentStockManager) CurrentStockManager = require('./CurrentStockManager')
			this.setState({ isModalStockManagerVisible: true })
			return
		}
		navigate('CurrentStockManager', isVariant ? { product } : undefined)
	}

	goToMinStockManager() {
		const { isConnected } = this.state
		const { fromBarcodeReader, navigation } = this.props
		const { navigate } = navigation

		if (!isConnected) return this.offlineAlert()
		if (fromBarcodeReader) {
			// Codesplit require
			if (!MinimumStockManager) MinimumStockManager = require('./MinimumStockManager')
			this.setState({ isModalMinimumManagerVisible: true })
			return
		}
		navigate('MinimumStockManager')
	}

	goToStockHistory() {
		const { navigation, product } = this.props
		const { navigate } = navigation
		const params = checkIsVariant(product) ? { product } : undefined

		navigate('StockHistory', params)
	}

	manageOptions() {
		const { productManaging, product } = this.props
		const { minimumStock, isStockEnabled } = productManaging
		const { isBillingAllowed } = this.state

		const options = [
			{
				title: I18n.t('stockHistoricalLabel'),
				onPress: () => this.goToStockHistory(),
				disabled: !product.stock || !isBillingAllowed,
				testProps: generateTestID('stock-movement-pes'),
			},
			{
				title: `${I18n.t('stockMinimum')}: ${minimumStock ? this.renderValue(minimumStock) : 0}`,
				onPress: () => this.goToMinStockManager(),
				disabled: !isStockEnabled || !isBillingAllowed,
				testProps: generateTestID('stock-minimum-pes'),
			},
		]

		return <ListOptions items={options} />
	}

	stockUnmanged() {
		const { stockTip, tipText, tipContainer } = styles

		return (
			<TouchableOpacity style={tipContainer} onPress={() => this.goToCurrentStockManager()}>
				<View style={stockTip}>
					<View style={{ flex: 1 }}>
						<Image
							style={{ resizeMode: 'contain', width: 50, height: '100%', transform: [{ rotate: '180deg' }] }}
							source={{ uri: DottedArrowDown }}
						/>
					</View>
					<Text style={tipText}>{I18n.t('stockFirstAddTip')}</Text>
				</View>
			</TouchableOpacity>
		)
	}

	renderCurrentStockManagerModal() {
		const { product } = this.props
		const isVariant = checkIsVariant(product)
		const props = isVariant ? { product } : undefined

		return (
			<KyteModal
				fullPage
				height="100%"
				isModalVisible
				hideFullPage={() => this.setState({ isModalStockManagerVisible: false })}
			>
				<CurrentStockManager
					fromBarcodeReader
					callback={() => this.setState({ isModalStockManagerVisible: false })}
					{...props}
				/>
			</KyteModal>
		)
	}

	renderMinimumStockManagerModal() {
		return (
			<KyteModal
				fullPage
				height="100%"
				isModalVisible
				hideFullPage={() => this.setState({ isModalMinimumManagerVisible: false })}
			>
				<MinimumStockManager
					fromBarcodeReader
					callback={() => this.setState({ isModalMinimumManagerVisible: false })}
				/>
			</KyteModal>
		)
	}

	productManagementSetValue(...params) {
		const { product } = this.props ?? {}
		const isVariant = checkIsVariant(product)
		// eslint-disable-next-line react/destructuring-assignment
		const setValue = isVariant ? this.props?.variantManagementSetValue : this.props?.productManagementSetValue

		setValue(...params)
	}

	stockSave() {
		const { product, productManaging, user } = this.props
		if (!checkIsChildProduct(product)) return this.props.stockSave()

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

		// POST to /stock-inactive => update Product model on local DB(Realm)
		if (!isStockEnabled) {
			return new Promise((resolve) => {
				this.props.productManageStockActivity(stockActivity, () => {
					this.props.productSetVirtualData(product.id, 0)
					resolve()
				})
			})
		}

		// POST to /stock-add => update Product model on local DB(Realm)
		return new Promise((resolve) => {
			this.props.productManageStock(updatedStock, () => {
				this.props.productSetVirtualData(product.id, Number(currentStock - initialStock))
				resolve()
			})
		})
	}

	render() {
		const { isConnected, isBillingAllowed, isModalStockManagerVisible, isModalMinimumManagerVisible } = this.state
		const { product, productManaging, currency, form } = this.props
		const { currentStock, minimumStock, isStockEnabled } = productManaging
		const { decimalSeparator, groupingSeparator } = currency
		const hasForm = form
		const emptyName = hasForm && !hasForm.name
		const emptyPrice = hasForm && typeof hasForm.salePrice === 'undefined' // allow 0.00 price
		const isVariant = checkIsVariant(product)

		const { outerContainer, bottomContainer } = scaffolding
		const { stockContainer, numberContainer, stockTitle, stockNumber } = styles

		const stockEmpty = currentStock <= 0 || currentStock === '0.000'
		const showTip = !product.stock && stockEmpty && isStockEnabled
		const EmptyStockFields = !product.stock && currentStock === 0 // deprecated
		const FirstManageInactiveStock = !product.stock && !isStockEnabled
		const EmptyProductFields = emptyName || emptyPrice
		const SaleCostHigher = hasForm && hasForm.values?.saleCostPrice > hasForm.values?.salePrice

		const stockStatus = checkStockValueStatus(Number(currentStock), { minimum: Number(minimumStock) }, product)

		let stockColor = colors.actionColor
		if (stockStatus === 'error' || !isBillingAllowed) stockColor = colors.errorColor
		else if (stockStatus === 'warning') stockColor = colors.warningColor

		const errorMessages = [
			{ condition: EmptyProductFields, message: I18n.t('productSaveAlertDescription') },
			{ condition: EmptyStockFields, message: I18n.t('errorMessages.EmptyStockFields') },
			{ condition: SaleCostHigher, message: I18n.t('productCategoryCostPriceGreaterThan') },
			{ condition: FirstManageInactiveStock, message: I18n.t('errorMessages.ActivateStock') },
			{ condition: !isConnected, message: I18n.t('customersOfflineWarningTitle') },
		]

		const displayErrorMessage = (condition) => {
			const item = errorMessages.find((error) => error.condition === condition)
			return item.message
		}

		this.renderValue = (value) =>
			productManaging.isFractioned ? formatStockFractioned(value, decimalSeparator, groupingSeparator) : Number(value)

		return (
			<View style={outerContainer}>
				{!isVariant && (
					<SwitchContainer
						title={I18n.t('stockAtivateTitle')}
						renderProBadge={!isBillingAllowed}
						onPress={() =>
							this.checkBillingAllowed(() => this.productManagementSetValue(!isStockEnabled, 'isStockEnabled'))
						}
						testProps={generateTestID('stock-switch-pes')}
					>
						<KyteSwitch
							onValueChange={(value) =>
								this.checkBillingAllowed(() => this.productManagementSetValue(value, 'isStockEnabled'))
							}
							active={isStockEnabled}
						/>
					</SwitchContainer>
				)}
				<View style={stockContainer}>
					<TouchableOpacity onPress={() => this.checkBillingAllowed(() => this.goToCurrentStockManager())}>
						<View style={numberContainer(isStockEnabled && isBillingAllowed ? 1 : 0.25)}>
							<Text style={stockTitle}>{I18n.t('stockCurrentTitle')}</Text>
							<Text style={stockNumber(stockColor)} {...generateTestID('stock-quantity-pes')}>
								{isBillingAllowed ? this.renderValue(currentStock) : this.renderValue(0)}
							</Text>
						</View>
					</TouchableOpacity>
				</View>
				{showTip ? this.stockUnmanged() : this.manageOptions()}
				<View style={bottomContainer}>
					<ActionButton
						alertDescription={displayErrorMessage(
							EmptyProductFields || EmptyStockFields || FirstManageInactiveStock || !isConnected
						)}
						onPress={() => this.checkBillingAllowed(() => this.finishManaging())}
						cancel={!isBillingAllowed}
						disabled={EmptyProductFields || FirstManageInactiveStock || !isConnected}
					>
						{I18n.t(product.id ? 'productSaveButton' : 'stockAddToProductButton')}
					</ActionButton>
				</View>
				{isModalStockManagerVisible ? this.renderCurrentStockManagerModal() : null}
				{isModalMinimumManagerVisible ? this.renderMinimumStockManagerModal() : null}
			</View>
		)
	}
}

const mapStateToProps = (state, ownProps) => {
	const { auth, products, variants, common, preference, stock, billing } = state

	const productFromDetailPage = products?.detail
	const productFromProps = ownProps?.product
	const product = productFromProps ?? productFromDetailPage
	const isVariant = checkIsVariant(product)

	const checkForSomeVariantStockActive = variants?.productVariants?.some((variant) => variant.stockActive)

	const checkIfIsStockEnabled = (_product) => {
		if (isVariant && checkForSomeVariantStockActive) {
			return true
		}
		return _product.isStockEnabled
	}

	const { productManaging: productManagingState } = (isVariant ? variants ?? ownProps : products) ?? {}
	const productManaging = {
		...productManagingState,
		isStockEnabled: checkIfIsStockEnabled(productManagingState),
	}
	const permissions = checkUserPermission(auth.user.permissions)
	const { allowProductsRegister } = permissions

	return {
		billing,
		product,
		productManaging,
		allowProductsRegister,
		user: auth.user,
		currency: preference.account.currency,
		form: getFormValues('ProductSave')(state),
		isOnline: common.isOnline,
		viewport: common.viewport,
		permissions: checkUserPermission(auth.user.permissions),
		parentProduct: products?.detail,
		stockSearchText: stock.searchText,
	}
}

export default connect(mapStateToProps, {
	productManagementSetValue,
	productSave,
	productSetVirtualData,
	checkFeatureIsAllowed,
	checkPlanKeys,
	productManageStock,
	productManageStockActivity,
	variantManagementSetValue,
	startToast,
	getProductVariants,
	fetchStockTotals,
	stockFetch,
})(ProductStock)
