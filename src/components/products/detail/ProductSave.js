import React, { Component } from 'react'
import runes from 'runes'
import { connect } from 'react-redux'
import { View, TouchableOpacity, Alert, Dimensions, ScrollView, Text, Platform } from 'react-native'
import { Icon } from 'react-native-elements'

import { Field, reduxForm, getFormValues, change } from 'redux-form'
import _ from 'lodash'
import { Container, Margin, Padding, Row, KyteText as UIKyteText, KyteSwitch, Label } from '@kyteapp/kyte-ui-components'
import { checkHasVariants, isFree } from '@kyteapp/kyte-utils'
import NavigationService from '../../../services/kyte-navigation'

import { formStyle, colors, colorGrid, gridStyles, gridItemDefaults } from '../../../styles'
import {
	productCategoryDetailCreate,
	checkUserReachedLimit,
	productCategorySelect,
	productManagementSetValue,
	clearAISuggestProductDescription,
	toggleBillingMessage,
} from '../../../stores/actions'
import { productCategorySave } from '../../../stores/actions/ProductCategoryActions'
import {
	ActionButton,
	Input,
	MaskedInput,
	InputTextArea,
	KyteModal,
	KyteIcon,
	KyteButton,
	ColorItem,
	ListOptions,
	CustomKeyboardAvoidingView,
	CurrencyText,
	SwitchContainer,
	KyteText,
	CircleBadge,
	PinProductTipModal,
} from '../../common'
import { logEvent } from '../../../integrations'
import { getProductByCode } from '../../../repository'
import {
	moveToKyteFolder,
	checkUserPermission,
	openDevicePhotoLibrary,
	cropImage,
	openDeviceCamera,
	generateTestID,
} from '../../../util'
import I18n from '../../../i18n/i18n'

import ProductImage from '../image/ProductImage'
import { DetailOrigin, Features, ProductWithVariationDetailsTabKeys } from '../../../enums'
import KyteImageGallery from '../../common/KyteImageGallery'
import ProductDescriptionModal from './ProductDescriptionModal'
import SectionButton from '../../common/SectionButton'
import {
	totalOptionsCount,
	checkShouldShowCatalogVersionWarning,
} from '../../../util/products/util-variants'
import CatalogVersionTooltip from './CatalogVersionTooltip'
import VariantsSectionButton from '../variants/VariantsSectionButton'

const Strings = {
	CREATE_WITH_AI: I18n.t('createWithAI'),
	NEWS: I18n.t('words.p.news'),
	NOW_WITH_DESCRIPTION: I18n.t('tryAIGenerated'),
}

// Codesplit declaration
let ProductCategoryList = null
let ProductCategoryCreate = null

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

class ProductComponent extends Component {
	constructor(props) {
		super(props)
		const { initialValues, route } = this.props
		const { image, foreground, background, isFractioned, description } = initialValues

		let selectedCategory = null
		if (route.params && route.params.selectedCategory && route.params.selectedCategory.id) {
			selectedCategory = route.params.selectedCategory
			this.props.change('category', selectedCategory.name)
		}

		this.state = {
			isFractioned,
			isLabelFocused: false,
			shrinkSection: false,
			isModalVisible: false,
			isCategoryModalVisible: false,
			isCreatingCategory: false,
			isSettingFractioned: false,
			isSettingPhoto: false,
			isDescription: false,
			colorSet: foreground || false,
			PhotoFromCamera: image || false,
			PhotoFromGallery: false,
			isPhotoZoom: false,
			productColor: {
				foreground: foreground || colors.primaryBg,
				background: background || colors.secondaryBg,
			},
			colorGrid,
			contentHasChanged: false,
			selectedCategory: null,
			description,
			descriptionBackup: description || '',
			heightFieldsExtras: 0,
			iconNameFieldsExtras: 'nav-arrow-down',
			productLabelSelected: false,
			showOnCatalog: 'showOnCatalog' in initialValues ? initialValues.showOnCatalog : true,
			pin: this.generatePinState(),
			lastClickProductSave: new Date('1999'),
			writeTempFile: true,
			isKytePhotoSelectorVisible: false,
			showPinProductTip: false,
			hasVariants: checkHasVariants(props?.initialValues),
		}
	}

	componentDidMount() {
		this.checkInitialValues()
		this.checkSelectedCategory()
		this.checkSellByUnit()
		this.checkImage()
		this.generatePinState()
		if (this.props.barcode) this.handleBarcodeRead(this.props.barcode)
	}

	componentDidUpdate(prevProps) {
		const { productManaging, aiSuggestionsApplied } = this.props
		const { heightFieldsExtras, iconNameFieldsExtras } = this.state

		if (productManaging.category && productManaging.category.name !== prevProps.productManaging.category?.name) {
			this.props.change('category', productManaging.category.name)
		}

		// When AI suggestions are applied, automatically expand extra fields section
		const justAppliedAISuggestions = aiSuggestionsApplied && !prevProps.aiSuggestionsApplied
		const isCollapsed = heightFieldsExtras === 0 && iconNameFieldsExtras === 'nav-arrow-down'

		if (justAppliedAISuggestions && isCollapsed) {
			this.setState({ heightFieldsExtras: 'auto', iconNameFieldsExtras: 'nav-arrow-up' })
		}
	}

	generatePinState() {
		const { selectedPin, initialValues } = this.props
		if (selectedPin || initialValues.pin) {
			this.props.change('pin', true)
			return true
		}

		return false
	}

	getPhotoFromGallery() {
		openDevicePhotoLibrary((event) => this.photoResponse(event))
	}

	getPhotoFromCamera() {
		openDeviceCamera((event) => this.photoResponse(event))
	}

	checkSelectedCategory() {
		const { initialValues, productCategory, route } = this.props
		if (initialValues?.category) {
			this.setState({ selectedCategory: initialValues.category })
			this.props.productManagementSetValue(initialValues.category, 'category', 'initial')
			this.props.change('category', initialValues.category.name)
			return
		}

		const typeOfObject = typeof productCategory.selected
		if (typeOfObject !== 'ProductCategory' && route.params?.selectedCategory) {
			const selectedCategory = _.find(
				productCategory.list,
				(eachCategory) => eachCategory.id === productCategory.selected.id
			)
			if (selectedCategory) {
				this.props.productCategorySelect(selectedCategory)
				this.setState({ selectedCategory })
				this.props.productManagementSetValue(selectedCategory, 'category', 'initial')
				this.props.change('category', productCategory.selected.name)
			}
		} else if (route.params?.selectedCategory) {
			this.setState({ selectedCategory: productCategory.selected })
			this.props.productManagementSetValue(productCategory.selected, 'category', 'initial')
			this.props.change('category', productCategory.selected.name)
		}
	}

	checkInitialValues() {
		const { initialValues } = this.props
		if (initialValues?.description || initialValues?.saleCostPrice || initialValues?.code) {
			this.setState({ heightFieldsExtras: 1, iconNameFieldsExtras: 'nav-arrow-up' })
		}
		this.props.initialize(initialValues)
	}

	checkSellByUnit() {
		const { isFractioned } = this.state

		let sellBy = `${I18n.t('productsSellByUnit')}`
		if (isFractioned) {
			sellBy = `${I18n.t('productsSellByFraction')}`
		}
		this.props.change('fractioned', sellBy)
	}

	checkImage() {
		const { productManaging, initialValues } = this.props
		const { productPhoto } = productManaging
		const { image } = initialValues

		if (!productPhoto && image) {
			this.props.productManagementSetValue(image, 'productPhoto')
		}
	}

	changeState(
		categoryModalVisible = false,
		creatingCategory = false,
		settingFractioned = false,
		description = false,
		settingPhoto = false
	) {
		// Codesplit require
		if (categoryModalVisible && !ProductCategoryList)
			ProductCategoryList = require('../categories/ProductCategoryList').default

		this.setState({
			isCategoryModalVisible: categoryModalVisible,
			isCreatingCategory: creatingCategory,
			isSettingFractioned: settingFractioned,
			isDescription: description,
			isSettingPhoto: settingPhoto,
			shrinkSection: false,
		})
	}

	resetPhoto() {
		this.setState({
			isPhotoZoom: false,
			PhotoFromCamera: false,
			PhotoFromGallery: false,
			contentHasChanged: true,
		})
		this.props.productManagementSetValue('', 'productPhoto')
	}

	extractFileName(path) {
		const pathSplitted = path.split('/')
		return pathSplitted.length ? pathSplitted[pathSplitted.length - 1] : ''
	}

	async photoResponse(response) {
		try {
			const imageResponse = await cropImage(response.path)
			this.changeState()

			const getPath = () => {
				const path = imageResponse.path || imageResponse
				return Platform.OS === 'ios' ? path : path.split('file://')[1]
			}
			const setPhoto = (fileName) => {
				const productPhoto = Platform.OS === 'ios' ? source.uri : fileName
				this.props.productManagementSetValue(productPhoto, 'productPhoto')
				this.props.navigation.navigate('ProductPhotoSelector')
			}

			const source = {
				fileName: this.extractFileName(getPath()),
				path: getPath(),
				uri: getPath(),
			}

			if (imageResponse.didCancel || imageResponse.error) {
				return
			}

			moveToKyteFolder(source.fileName, source.path, setPhoto)
		} catch (error) {
			console.log('[error] photoResponse', error)
		}
	}

	alertToggleFraction() {
		Alert.alert('', I18n.t('productFractionAlertDescription'), [
			{ text: I18n.t('alertDismiss'), style: 'cancel' },
			{
				text: I18n.t('alertOk'),
				onPress: () => {
					const sellBy = `${I18n.t('productsSellByFraction')}`
					this.props.change('fractioned', sellBy)
					this.setState({
						isCategoryModalVisible: false,
						isCreatingCategory: false,
						isSettingFractioned: false,
						isFractioned: true,
					})
					this.props.productManagementSetValue(true, 'isFractioned')
				},
			},
		])
	}

	finishManaging() {
		const { initialValues, backToList, formSubmit, stockSave, productManaging } = this.props
		const { initialStock, currentStock, isStockEnabled, pendingCategory } = productManaging

		const stockValueUpdate = initialStock !== currentStock
		const stockActivityUpdate = isStockEnabled !== initialValues.stockActive
		const stockHasChanged = stockValueUpdate || stockActivityUpdate

		const manuallySaveStock = !initialValues.id && stockValueUpdate && isStockEnabled
		const serviceSaveStock = initialValues.id && stockHasChanged

		const handleProductSaved = () => {
			if (serviceSaveStock) {
				stockSave().then(() => null)
			}
			this.trackProductSave(initialValues)
			backToList()
		}

		// If there's a pending category from AI, create it before saving the product
		if (pendingCategory) {
			this.props.productCategorySave(pendingCategory, (categorySaved) => {
        // this.props.productCategorySelect(categorySaved)
				this.props.productManagementSetValue(categorySaved, 'category')
				this.props.productManagementSetValue(null, 'pendingCategory')
				this.props.change('category', categorySaved)

				formSubmit(manuallySaveStock).then(handleProductSaved)
			})
		} else {
			// No category to create, proceed normally
			formSubmit(manuallySaveStock).then(handleProductSaved)
		}
	}

	trackProductSave(product) {
		const propertiesTrack = {
			origin: this.props.origin === 2 ? 'Sale Flow' : 'Menu',
			hasColor: product.background !== colors.primaryBg,
			hasImage: !!product.image,
			isFractioned: this.state.isFractioned || false,
		}

		// eslint-disable-next-line no-underscore-dangle
		if (!product._id) {
			logEvent('Product Create', {
				...propertiesTrack,
				hasAIAutofillFromImage: !!this.props.aiSuggestionsApplied,
				where: 'full-page',
				userEmail: this.props.user.email,
				hasVariants: Boolean(product.variants?.length),
				variations: product?.variations?.length,
				variants: product?.variants?.length,
				options: totalOptionsCount(product?.variations),
			})
		} else {
			logEvent('Product Save', {
				...propertiesTrack,
				userEmail: this.props.user.email,
				hasVariants: Boolean(product.variants?.length),
				variations: product?.variations?.length,
				variants: product?.variants?.length,
				options: totalOptionsCount(product?.variations),
			})
		}
	}

	showColorModal() {
		this.setState({ isModalVisible: true })
	}

	hideColorModal() {
		this.setState({ isModalVisible: false })
	}

	confirmFraction(value) {
		if (value) {
			this.alertToggleFraction()
		} else {
			const sellBy = `${I18n.t('productsSellByUnit')}`
			this.props.change('fractioned', sellBy)
			this.setState({ isFractioned: false, contentHasChanged: true })
			this.props.productManagementSetValue(false, 'isFractioned')
		}
	}

	productPhoto() {
		const { appearanceContainer } = styles

		return <View style={[appearanceContainer]}>{this.renderAppearance()}</View>
	}

	isEditable() {
		const { formValues } = this.props
		if (formValues && formValues.name) return true
		return false
	}

	labelFocused(focus) {
		this.setState({ isLabelFocused: focus, productLabelSelected: focus })
	}

	colorIcon() {
		const { productColor } = this.state
		const { colorSquare } = styles
		return (
			<KyteButton
				onPress={() => this.showColorModal()}
				height={128}
				width={80}
				style={{ justifyContent: 'center' }}
				testProps={generateTestID('color-btn-pes')}
			>
				<View style={colorSquare(productColor.foreground)} />
			</KyteButton>
		)
	}

	buttonPhoto() {
		const { productPhoto, productOtherPhotos } = this.props.productManaging

		const renderProductsQuantityBadge = () => {
			let quantity = 0
			if (productPhoto) quantity++
			if (!!productOtherPhotos && productOtherPhotos.length > 0) quantity += productOtherPhotos.length

			if (quantity <= 0) return null
			return (
				<CircleBadge
					info={quantity.toString()}
					backgroundColor={colors.actionColor}
					textColor={colors.primaryColor}
					fontSize={10}
					size={18}
					style={{ position: 'absolute', right: 15, top: 45 }}
				/>
			)
		}

		return (
			<KyteButton
				onPress={
					!!productPhoto || (!!productOtherPhotos && productOtherPhotos.length > 0)
						? () => this.props.navigation.navigate('ProductPhotoSelector')
						: () => this.setState({ isSettingPhoto: true })
				}
				height={128}
				width={70}
				style={{ justifyContent: 'center', position: 'relative' }}
				testProps={generateTestID('photo-btn-pes')}
			>
				<KyteIcon name="square-gallery" size={20} color={colors.primaryBg} style={{ position: 'relative' }} />
				{renderProductsQuantityBadge()}
			</KyteButton>
		)
	}

	closePhotoZoom() {
		this.setState({ isPhotoZoom: false })
	}

	openProductCategoryCreate() {
		const { userHasReachedLimit, user } = this.props
		const { permissions } = user

		this.props.checkUserReachedLimit()
		if (userHasReachedLimit) {
			NavigationService.reset('Confirmation', 'SendCode', { origin: 'user-blocked', previousScreen: 'Products' })

			logEvent('UserReachedLimit', user)
			return
		}

		if (checkUserPermission(permissions).allowProductsRegister) {
			// Codesplit require
			if (!ProductCategoryCreate) ProductCategoryCreate = require('../categories/ProductCategoryCreate').default

			this.props.productCategoryDetailCreate()
			this.setState({ isCreatingCategory: true })
			return
		}

		Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToManageProducts'))
	}

	categorySelectFromOutside(category) {
		this.setState({ isCreatingCategory: false, isCategoryModalVisible: false, selectedCategory: category })
		this.props.change('category', category.name)
		this.props.productManagementSetValue(category, 'category')
	}

	categorySelect(category) {
		this.setState({
			isCreatingCategory: false,
			isCategoryModalVisible: false,
			selectedCategory: category.id ? category : null,
		})
		this.props.change('category', category.id ? category.name : null)
		this.props.productManagementSetValue(category.id ? category : null, 'category')
	}

	createCategory() {
		this.setState({ isCreatingCategory: true })
	}

	cleanFieldDescription() {
		this.props.change('description', '')
		this.setState({ description: '' })
	}

	closeModalDescription() {
		if (this.props.formValues) {
			this.props.formValues.description = this.state.descriptionBackup
		}
		this.setState({ isDescription: false, description: this.state.descriptionBackup })
	}

	saveModalDescription() {
		const { formValues } = this.props
		const description = formValues && formValues.description ? formValues.description || '' : ''
		this.setState({ isDescription: false, description, descriptionBackup: description })
		this.props.clearAISuggestProductDescription()
	}

	renderImage() {
		const { isLabelFocused } = this.state
		const { formValues, initialValues, productManaging } = this.props
		const { labelContainer, labelInner } = styles
		const labelValue = formValues && formValues.label
		const labelPlaceHolder = () => {
			if (formValues && formValues.name) {
				return runes.substr(formValues.name, 0, 6)
			}
			return I18n.t('productLabelPlaceholder')
		}

		const labelName = () => {
			if (!initialValues.name) {
				return isLabelFocused ? 'label' : 'name'
			}
			return 'label'
		}

		if (productManaging.productPhoto) {
			const loadImage = () => (
				<TouchableOpacity
					onPress={() => this.setState({ isPhotoZoom: true })}
					activeOpacity={0.8}
					style={{ borderTopLeftRadius: 4, borderTopRightRadius: 4, overflow: 'hidden' }}
				>
					<ProductImage
						product={{ ...initialValues, image: productManaging.productPhoto }}
						style={gridStyles.flexImage}
						useLargeImage
					/>
				</TouchableOpacity>
			)

			return productManaging.productPhoto ? loadImage() : null
		}

		return (
			<View style={labelContainer}>
				<View style={labelInner}>
					<Field
						editable={this.isEditable()}
						placeholder={labelPlaceHolder()}
						placeholderColor={colors.drawerIcon}
						underlineColor={labelValue || isLabelFocused ? colors.drawerIcon : 'transparent'}
						maxLength={6}
						name={labelName()}
						style={[gridStyles.labelStyle, { marginLeft: -50, width: 100, textAlign: 'center' }]}
						focusIn={() => this.labelFocused(true)}
						focusOut={() => this.setState({ labelFocused: false })}
						component={this.renderField}
						displayIosBorder={false}
						hideLabel
						testProps={generateTestID('product-label-pes')}
					/>
				</View>
			</View>
		)
	}

	renderCard() {
		const image = this.props.productManaging.productPhoto
		const { formValues } = this.props
		const { hasVariants } = this.state
		const { foreground, background } = this.state.productColor
		const name = formValues && formValues.name ? formValues.name : I18n.t('productNamePlaceholder')
		const salePrice = formValues && formValues.salePrice
		const hasPromotionalPrice = formValues && Number.isFinite(formValues.salePromotionalPrice)

		const { itemContainer, itemStyles, labelContainer, descriptionContainer, nameStyle, priceStyle, oldPriceStyle } =
			gridStyles
		const itemColor = foreground || colors.primaryBg
		const itemTopColor = image ? '#e1e3e6' : itemColor

		return (
			<View style={[itemContainer, { justifyContent: 'center' }]}>
				<View style={[itemStyles(background || colors.secondaryBg), gridItemDefaults]}>
					<View style={[labelContainer, { backgroundColor: itemTopColor }]}>{this.renderImage()}</View>
					<View style={descriptionContainer(hasPromotionalPrice ? 60 : 45)}>
						<Text
							ellipsizeMode="tail"
							numberOfLines={1}
							style={nameStyle}
							allowFontScaling={false}
							{...generateTestID('product-name-label-pes')}
						>
							{_.capitalize(name)}
						</Text>
						{hasPromotionalPrice && !hasVariants ? (
							<CurrencyText style={priceStyle} value={formValues.salePromotionalPrice} />
						) : null}
						{!hasVariants ? (
							<CurrencyText
								style={hasPromotionalPrice ? oldPriceStyle : priceStyle}
								value={salePrice || 0}
								testProps={generateTestID('product-price-label-pes')}
							/>
						) : null}
					</View>
				</View>
			</View>
		)
	}

	renderAppearance() {
		const { appearanceActions } = styles
		return (
			<View style={appearanceActions}>
				{this.colorIcon()}
				{this.renderCard()}
				{this.buttonPhoto()}
			</View>
		)
	}

	renderColorGrid() {
		const setProductColor = (c) => {
			this.setState({
				productColor: { foreground: c.foreground, background: c.background },
				isModalVisible: false,
				colorSet: true,
				contentHasChanged: true,
			})
			this.props.productManagementSetValue({ foreground: c.foreground, background: c.background }, 'productColor')
		}
		return this.state.colorGrid.map((c, i) => (
			<ColorItem key={i} itemColor={c.foreground} itemHeight={80} onPress={() => setProductColor(c)} />
		))
	}

	renderField(field) {
		return (
			<Input
				{...field.input}
				onChangeText={field.input.onChange}
				onFocus={field.focusIn}
				onBlur={field.focusOut}
				placeholder={field.placeholder}
				keyboardType={field.kind}
				style={field.style}
				placeholderColor={field.placeholderColor}
				maxLength={field.maxLength}
				editable={field.editable}
				inputRef={field.inputRef}
				underlineColor={field.underlineColor}
				error={field.meta.touched ? field.meta.error : ''}
				substring={field.substring}
				displayIosBorder={field.displayIosBorder}
				hideLabel={field.hideLabel}
				returnKeyType="done"
				rightIcon={field.rightIcon}
				rightIconStyle={field.rightIconStyle}
				pointerEvents={field.pointerEvents}
				multiline={field.multiline}
				numberOfLines={field.numberOfLines}
				autoCorrect={field.autoCorrect}
				testProps={field.testProps}
			/>
		)
	}

	renderMaskedField(field) {
		return (
			<MaskedInput
				{...field.input}
				onChangeText={field.input.onChange}
				onFocus={field.focusIn}
				onBlur={field.focusOut}
				placeholder={field.placeholder}
				keyboardType={field.kind}
				style={field.style}
				placeholderColor={field.placeholderColor}
				type={field.type}
				error={field.meta.touched ? field.meta.error : ''}
				returnKeyType="done"
				maxLength={field.maxLength}
				inputRef={field.inputRef}
				testProps={field.testProps}
			/>
		)
	}

	renderTextareaField(field) {
		return (
			<InputTextArea
				{...field.input}
				style={field.style}
				onChangeText={field.input.onChange}
				value={field.input.value}
				placeholder={field.placeholder}
				placeholderColor={field.placeholderColor}
				autoFocus={field.autoFocus}
				multiline={field.multiline}
				textAlignVertical={field.textAlignVertical}
				noBorder={field.noBorder}
				hideLabel={field.hideLabel}
				shrinkSection={field.shrinkSection}
				flex={field.flex}
				autoCorrect={field.autoCorrect}
			/>
		)
	}

	renderCategoriesModal() {
		return (
			<View style={{ flex: 1 }}>
				<ProductCategoryList
					data={this.props.productCategory.list}
					onItemPress={this.categorySelect.bind(this)}
					onAddPress={() => this.createCategory()}
					origin="ProductDetail"
					navigation={this.props.navigation}
				/>
			</View>
		)
	}

	renderCreateCategory() {
		const { navigation } = this.props
		if (!ProductCategoryCreate) ProductCategoryCreate = require('../categories/ProductCategoryCreate').default
		return (
			<View style={{ flex: 1 }}>
				<ProductCategoryCreate
					navigation={navigation}
					origin="ProductDetail"
					cb={this.categorySelectFromOutside.bind(this)}
				/>
			</View>
		)
	}

	renderModalDescription() {
		const { formValues } = this.props
		const { isDescription } = this.state

		return (
			<ProductDescriptionModal
				isVisible={isDescription}
				onClose={() => this.closeModalDescription()}
				onSave={() => this.saveModalDescription()}
				onCleanField={() => this.cleanFieldDescription()}
				onChangeDescription={(description) => this.props.change('description', description)}
				onChangeName={(name) => this.props.change('name', name)}
				formValues={formValues}
			/>
		)
	}

	renderModalPhoto() {
		const { isSettingPhoto } = this.state
		const options = [
			{
				title: I18n.t('productTakePicture'),
				onPress: () => this.getPhotoFromCamera(),
				leftIcon: { icon: 'square-camera', color: colors.secondaryBg },
				hideChevron: true,
			},
			{
				title: I18n.t('productBrowseImage'),
				onPress: () => this.getPhotoFromGallery(),
				leftIcon: { icon: 'square-gallery', color: colors.secondaryBg },
				hideChevron: true,
			},
		]
		return (
			<KyteModal
				bottomPage
				height="auto"
				title={I18n.t('productAddNewImage')}
				isModalVisible={isSettingPhoto}
				hideModal={() => this.changeState()}
			>
				<ListOptions items={options} />
			</KyteModal>
		)
	}

	renderModalFractioned() {
		const { isSettingFractioned } = this.state
		const options = [
			{
				title: I18n.t('productsSellByUnit'),
				onPress: () => {
					this.confirmFraction(false)
					this.changeState()
				},
			},
			{
				title: I18n.t('productsSellByFraction'),
				onPress: () => {
					this.confirmFraction(true)
				},
			},
		]
		return (
			<KyteModal
				bottomPage
				height="auto"
				title={I18n.t('productsSellBy')}
				isModalVisible={isSettingFractioned}
				hideModal={() => this.changeState()}
			>
				<ListOptions items={options} hideChevron />
			</KyteModal>
		)
	}

	renderModalCategory() {
		const { isCreatingCategory, isCategoryModalVisible } = this.state
		const rightIcons = [
			{
				icon: 'plus-calculator',
				color: colors.actionColor,
				onPress: () => this.openProductCategoryCreate(),
				iconSize: 18,
			},
		]

		return (
			<KyteModal
				height="100%"
				fullPage
				fullPageTitle={
					isCreatingCategory
						? I18n.t('productCategoryAddPageTitle')
						: `${I18n.t('productsTabCategoriesLabel')} (${this.props.productCategory.list.length})`
				}
				fullPageTitleIcon={isCreatingCategory ? null : 'back-navigation'}
				hideOnBack
				hideFullPage={
					isCreatingCategory
						? () => this.setState({ isCreatingCategory: false })
						: () => this.setState({ isCategoryModalVisible: false })
				}
				isModalVisible={isCategoryModalVisible}
				rightIcons={isCreatingCategory ? null : rightIcons}
			>
				<View style={{ flex: 1 }}>
					{isCreatingCategory ? this.renderCreateCategory() : this.renderCategoriesModal()}
				</View>
			</KyteModal>
		)
	}

	renderTopSection() {
		const { shrinkSection, isModalVisible } = this.state
		const { colorGridContainer } = styles
		const renderTopSectionModal = () => (
			<KyteModal
				height="auto"
				title={I18n.t('productColorModalTitle')}
				isModalVisible={isModalVisible}
				hideModal={() => this.hideColorModal()}
			>
				<View style={colorGridContainer}>{this.renderColorGrid()}</View>
			</KyteModal>
		)

		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<View style={topSectionStyle(shrinkSection)}>
					{this.productPhoto()}
					{isModalVisible ? renderTopSectionModal() : null}
				</View>
			</View>
		)
	}

	renderButtonFieldsExtras() {
		const { iconNameFieldsExtras } = this.state

		const toggleButtonFieldsExtras = () => {
			if (iconNameFieldsExtras === 'nav-arrow-down') {
				this.setState({ heightFieldsExtras: 'auto', iconNameFieldsExtras: 'nav-arrow-up' })
				this.timer = setTimeout(() => this.productScrollView.scrollToEnd({ animated: true }), 100)
			} else {
				this.setState({ heightFieldsExtras: 0, iconNameFieldsExtras: 'nav-arrow-down' })
			}
		}

		return (
			<SectionButton
				title={I18n.t('productLabelExtrasFields')}
				icon={iconNameFieldsExtras}
				onPress={toggleButtonFieldsExtras}
				testID="extra-fields-pes"
				description={Strings.NOW_WITH_DESCRIPTION}
			/>
		)
	}

	renderPhotoZoom() {
		const { initialValues, productManaging } = this.props
		return (
			<KyteImageGallery
				product={{ ...initialValues, image: productManaging.productPhoto }}
				gallery={[productManaging.productPhoto]}
				hideOnBack
				hideModal={() => this.closePhotoZoom()}
				onBackButtonPress={() => this.closePhotoZoom()}
				isModal
			/>
		)
	}

	alertDuplicatedBarcode(product) {
		Alert.alert(I18n.t('barcodeDuplicatedAlertTitle'), `${I18n.t('barcodeDuplicatedAlertText')} ${product.name}.`, [
			{ text: I18n.t('alertOk') },
		])
	}

	handleBarcodeRead(barcode) {
		const duplicated = getProductByCode(barcode)
		if (duplicated) this.alertDuplicatedBarcode(duplicated)
		else {
			const eventName = 'ProductSaveBarCode'
			logEvent(eventName)
			this.props.change('code', barcode)
		}
	}

	handleNavigateToCreateVariants() {
		logEvent('Product Variants Add Click')
		const { billing, navigation, toggleBillingMessage } = this.props
		if (isFree(billing)) {
			const { remoteKey } = Features.items[Features.VARIANTS_PRO_PAYWALL]
			return toggleBillingMessage(true, 'Pro', remoteKey ?? '')
		}
		navigation.navigate('VariantsWizard')
	}

	renderBarcodeIcon() {
		const { navigate } = this.props.navigation
		return (
			<TouchableOpacity
				onPress={() =>
					navigate('BarcodeReader', {
						onBarcodeRead: (barcode) => this.handleBarcodeRead(barcode),
					})
				}
			>
				<KyteIcon name="barcode" color={colors.secondaryBg} size={24} />
			</TouchableOpacity>
		)
	}

	changeShowOnCatalog() {
		const { showOnCatalog } = this.props.formValues
		this.props.change('showOnCatalog', !showOnCatalog)
		this.setState({ showOnCatalog: !showOnCatalog })
	}

	changePinProduct() {
		const { pin } = this.props.formValues
		this.props.change('pin', !pin)
		this.setState({ pin: !pin })
	}

	renderPinProductTip() {
		return <PinProductTipModal hideModal={() => this.setState({ showPinProductTip: false })} />
	}

	render() {
		const { formValues = {}, origin, storeAccount } = this.props
		const { formContainer, buttonContainer, extraContainer } = styles
		const {
			shrinkSection,
			isPhotoZoom,
			isDescription,
			isSettingPhoto,
			isSettingFractioned,
			isCategoryModalVisible,
			heightFieldsExtras,
			showOnCatalog,
			showPinProductTip,
			pin,
			isFractioned,
			hasVariants,
		} = this.state
		const { fieldSet } = formStyle
		const hasName = formValues && formValues.name
		const hasPrice = formValues && typeof formValues.salePrice !== 'undefined' // allow 0.00 price
		const hasPromotionalPrice = formValues && Number.isFinite(formValues.salePromotionalPrice)
		const hasCatalog = storeAccount && storeAccount.catalog
		const priceOk = !formValues.saleCostPrice || formValues.saleCostPrice <= formValues.salePrice
		const fieldSetContainer = { position: 'relative', flex: 1 }
		const clearIcon = { width: 40, height: 40, position: 'absolute', zIndex: 100, right: -15, top: 25 }
		const disabledShowOnCatalogSwitch = !hasCatalog || (checkShouldShowCatalogVersionWarning(storeAccount.catalog) && hasVariants)

		const renderIconClean = () => (
			<TouchableOpacity
				width={40}
				height={40}
				onPress={() => this.props.change('salePromotionalPrice', null)}
				style={clearIcon}
			>
				<KyteIcon name="close-navigation" size={14} color={colors.secondaryBg} />
			</TouchableOpacity>
		)

		const renderExtraFields = () => (
			<View style={[fieldSet, { backgroundColor: colors.drawerIcon }]}>
				{!hasVariants && (
					<View>
						<View style={fieldSetContainer}>
							{hasPromotionalPrice ? renderIconClean() : null}
							<Field
								placeholder={I18n.t('productPromotionalPricePlaceholder')}
								placeholderColor={colors.primaryGrey}
								kind="numeric"
								name="salePromotionalPrice"
								type="money"
								component={this.renderMaskedField}
								ref={(input) => {
									this.salePromotionalPrice = input
								}}
								maxLength={18}
								style={Platform.select({ ios: { height: 32 } })}
								testProps={generateTestID('promo-price-pes')}
							/>
						</View>
						<KyteText lineHeight={20} marginBottom={5} pallete="grayBlue">
							{`${I18n.t('productPromotionalPriceInfo')} (${I18n.t('exampleAbbr')} ${I18n.t(
								'productPriceFromTo.from'
							)} `}
							<KyteText pallete="grayBlue" lineThrough>
								<CurrencyText value={10} />
							</KyteText>
							{` ${I18n.t('productPriceFromTo.to')} `}
							<CurrencyText value={5} />)
						</KyteText>
					</View>
				)}
				<TouchableOpacity
					onPress={() => {
						this.categoryRef.focus()
						this.changeState(true)
						this.categoryRef.blur()
					}}
					activeOpacity={0.8}
				>
					<View pointerEvents="none">
						<Field
							placeholder={I18n.t('productCategoryFieldPlaceholder')}
							placeholderColor={colors.primaryGrey}
							name="category"
							format={(value) => value?.name || value}
							component={this.renderField}
							rightIcon={<Icon name="chevron-right" color={colors.secondaryBg} size={28} />}
							rightIconStyle={{ position: 'absolute', right: 0 }}
							style={Platform.select({ ios: { height: 32 } })}
							inputRef={(categoryRef) => {
								this.categoryRef = categoryRef
							}}
							testProps={generateTestID('product-category-pes')}
						/>
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						this.changeState(false, false, false, true)
					}}
					activeOpacity={0.8}
				>
					<View pointerEvents="none">
						<Field
							placeholder={I18n.t('productDescriptionLabel')}
							placeholderColor={colors.primaryGrey}
							name="description"
							component={this.renderField}
							rightIcon={
								<Row>
									{!formValues.description && (
										<Label
											textProps={{
												size: 9,
												lineHeight: 15,
											}}
											containerProps={{
												height: 23,
											}}
										>
											{Strings.CREATE_WITH_AI}
										</Label>
									)}
									<Icon name="chevron-right" color={colors.secondaryBg} size={28} />
								</Row>
							}
							rightIconStyle={{ position: 'absolute', right: 0 }}
							style={Platform.select({ ios: { height: 32 } })}
							autoCorrect
							testProps={generateTestID('product-description-pes')}
						/>
					</View>
				</TouchableOpacity>
				{!hasVariants && (
					<View>
						<Field
							placeholder={I18n.t('productCodeLabel')}
							placeholderColor={colors.primaryGrey}
							name="code"
							component={this.renderField}
							inputRef={(input) => {
								this.productCode = input
							}}
							style={Platform.select({ ios: { height: 32 } })}
							rightIcon={this.renderBarcodeIcon()}
							rightIconStyle={{ position: 'absolute', right: 6, top: Platform.OS === 'ios' ? 5 : 7 }}
							testProps={generateTestID('product-code-pes')}
						/>
						<Field
							placeholder={I18n.t('productCostPricePlaceholder')}
							placeholderColor={colors.primaryGrey}
							kind="numeric"
							name="saleCostPrice"
							type="money"
							component={this.renderMaskedField}
							ref={(input) => {
								this.saleCostPrice = input
							}}
							maxLength={18}
							style={Platform.select({ ios: { height: 32 } })}
							testProps={generateTestID('cost-price-pes')}
						/>
					</View>
				)}

				<TouchableOpacity
					onPress={() => {
						this.changeState(false, false, true)
					}}
					activeOpacity={0.8}
				>
					<View pointerEvents="none">
						<Field
							placeholder={I18n.t('productsSellBy')}
							placeholderColor={colors.primaryGrey}
							name="fractioned"
							format={() => (isFractioned ? I18n.t('productsSellByFraction') : I18n.t('productsSellByUnit'))}
							component={this.renderField}
							rightIcon={<Icon name="chevron-right" color={colors.secondaryBg} size={28} />}
							rightIconStyle={{ position: 'absolute', right: 0 }}
							style={Platform.select({ ios: { height: 32 } })}
							testProps={generateTestID('portion-unit-pes')}
						/>
					</View>
				</TouchableOpacity>

				<SwitchContainer
					title={
						<Container flex={1} flexDirection="row" alignItems="center" justifyContent="space-between">
							<UIKyteText fontFamily="Graphik-SemiBold" color={colors.primaryColor} size={16}>
								{I18n.t('pinProductLabel')}
							</UIKyteText>
							<Padding right={12}>
								<TouchableOpacity onPress={() => this.setState({ showPinProductTip: true })}>
									<KyteIcon name="help" />
								</TouchableOpacity>
							</Padding>
						</Container>
					}
					onPress={() => this.changePinProduct()}
					style={{ paddingHorizontal: 0 }}
					testProps={generateTestID('highlight-product-pes')}
				>
					<KyteSwitch onValueChange={() => this.changePinProduct()} active={pin} />
				</SwitchContainer>

				<>
					<SwitchContainer
						title={
							<Container flex={1} flexDirection="row" alignItems="center" justifyContent="space-between">
								<UIKyteText fontFamily="Graphik-SemiBold" color={colors.primaryColor} size={16}>
									{I18n.t('productShowInCatalog')}
								</UIKyteText>
							</Container>
						}
						onPress={() => this.changeShowOnCatalog()}
						disabled={disabledShowOnCatalogSwitch}
						style={{ paddingHorizontal: 0 }}
						testProps={generateTestID('public-catalog-pes')}
					>
						<KyteSwitch
							onValueChange={() => this.changeShowOnCatalog()}
							active={showOnCatalog}
							disabled={disabledShowOnCatalogSwitch}
						/>
					</SwitchContainer>
					{checkShouldShowCatalogVersionWarning(this.props.storeAccount.catalog) && hasVariants && (
						<Margin top={8}>
							<CatalogVersionTooltip />
						</Margin>
					)}
				</>
			</View>
		)

		const saveButtonHandler = () => {
			const { lastClickProductSave } = this.state
			if (new Date().getTime() < lastClickProductSave.getTime() + 3000) return

			if (priceOk) {
				this.finishManaging()
			} else {
				Alert.alert(I18n.t('words.s.attentionAlert'), I18n.t('productCostGraterThanPriceAlert'), [
					{ text: I18n.t('alertConfirm'), onPress: () => this.finishManaging() },
					{ text: I18n.t('alertDismiss') },
				])
			}
			this.setState({ lastClickProductSave: new Date() })
		}

		const renderButtonContainer = () => {
			const { initialValues } = this.props
			return (
				<View style={[buttonContainer, { backgroundColor: 'transparent' }]}>
					<ActionButton
						alertTitle=""
						alertDescription={I18n.t('productSaveAlertDescription')}
						onPress={() => saveButtonHandler()}
						disabled={!hasName || !hasPrice}
						testProps={generateTestID('save-product-pes')}
					>
						{initialValues.id ? I18n.t('productSaveButton') : I18n.t('productAddButton')}
					</ActionButton>
				</View>
			)
		}
		const keyboardVerticalOffset = () => {
			if (origin === DetailOrigin.UPDATE) {
				return SMALL_SCREENS ? 65 : 85
			}
			return SMALL_SCREENS ? 65 : 85
		}
		return (
			<> 
				<CustomKeyboardAvoidingView style={formContainer} keyboardVerticalOffset={keyboardVerticalOffset()}>
					<ScrollView
						style={{ backgroundColor: 'transparent' }}
						ref={(productScrollView) => {
							this.productScrollView = productScrollView
						}}
					>
						{this.renderTopSection()}
						<View style={[fieldSet, { backgroundColor: colors.drawerIcon }]}>
							<View style={{ flex: 1 }}>
								<Field
									placeholder={I18n.t('productNamePlaceholder')}
									placeholderColor={colors.primaryGrey}
									name="name"
									component={this.renderField}
									inputRef={(input) => {
										this.productName = input
									}}
									style={Platform.select({ ios: { height: 32 } })}
									autoCorrect
									testProps={generateTestID('product-name-pes')}
								/>
								{!hasVariants && (
									<Field
										placeholder={I18n.t('productPricePlaceholder')}
										placeholderColor={colors.primaryGrey}
										kind="numeric"
										name="salePrice"
										type="money"
										component={this.renderMaskedField}
										maxLength={18}
										style={Platform.select({ ios: { height: 32 } })}
										inputRef={(salePriceRef) => {
											this.salePriceRef = salePriceRef
										}}
										testProps={generateTestID('product-price-pes')}
									/>
								)}
							</View>
						</View>
						<View style={extraContainer}>
							{this.renderButtonFieldsExtras()}
							{heightFieldsExtras !== 0 ? renderExtraFields() : null}
						</View>

						<View style={extraContainer}>
							<VariantsSectionButton
								product={this.props.formValues}
								onPress={() =>
									hasVariants
										? this.props.setTabIndex(ProductWithVariationDetailsTabKeys.Variants)
										: this.handleNavigateToCreateVariants()
								}
							/>
						</View>
					</ScrollView>
					{shrinkSection ? null : renderButtonContainer()}
				</CustomKeyboardAvoidingView>
				{isPhotoZoom ? this.renderPhotoZoom() : null}
				{isDescription ? this.renderModalDescription() : null}
				{isSettingPhoto ? this.renderModalPhoto() : null}
				{isSettingFractioned ? this.renderModalFractioned() : null}
				{isCategoryModalVisible ? this.renderModalCategory() : null}
				{showPinProductTip ? this.renderPinProductTip() : null}
			</>
		)
	}
}

const topSectionStyle = () => ({
	backgroundColor: colors.lightBg,
	justifyContent: 'center',
	paddingVertical: 15,
})

const styles = {
	formContainer: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: colors.lightBg,
	},
	labelStyle: {
		color: 'rgba(255, 255, 255, 0.5)',
	},
	buttonContainer: {
		height: 70,
		paddingVertical: 10,
		backgroundColor: '#FFFFFF',
	},
	fractionContainer: {
		flexDirection: 'row',
		marginTop: SCREEN_HEIGHT <= 480 ? 0 : 5,
		bottom: SCREEN_HEIGHT <= 480 ? 20 : 0,
		paddingVertical: 10,
		paddingHorizontal: 5,
		alignItems: 'center',
	},
	fractionText: {
		flex: 1,
		fontFamily: 'Graphik-Regular',
		fontSize: 16,
		color: colors.primaryBg,
	},
	hideContent: {
		display: 'none',
	},
	colorGridContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	colorSquare: (backgroundColor) => ({
		width: 25,
		height: 25,
		borderWidth: 1,
		borderColor: colors.borderDarker,
		borderRadius: 3,
		backgroundColor,
	}),
	appearanceActions: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	photoLayer: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		zIndex: 0,
	},
	layerInner: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.35)',
	},
	labelContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 11,
	},
	labelInner: {
		// width: '60%'
	},
	thumbnailImage: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		// position: 'relative',
		borderTopLeftRadius: 4,
		borderTopRightRadius: 4,
	},
	fieldContainer: {
		flex: 1,
	},
	appearanceContainer: {
		flex: 1,
	},
	containerButtonFieldsExtras: {
		flex: 1,
		borderColor: colors.drawerIcon,
		borderTopWidth: 1.5,
		borderBottomWidth: 1.5,
	},
	buttonFieldsExtras: {
		flexDirection: 'row',
		paddingHorizontal: 24,
		paddingVertical: 15,
		alignItems: 'center',
	},
	iconButtonFieldsExtras: {
		flex: 0.12,
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
		paddingVertical: 4,
	},
	extraContainer: {
		flex: 1,
		backgroundColor: colors.drawerIcon,
		marginTop: 10,
	},
	switchTitle: {
		fontSize: 16,
		fontFamily: 'Graphik-SemiBold',
		color: colors.primaryColor,
	},
}

function validate(values) {
	const errors = {}
	if (!values.salePrice) {
		errors.salePrice = I18n.t('productValidatePrice')
	}
	if (values.saleCostPrice > values.salePrice) {
		errors.saleCostPrice = I18n.t('productCategoryCostPriceGreaterThan')
	}
	return errors
}

const ProductSave = reduxForm({
	form: 'ProductSave',
	validate,
	enableReinitialize: true,
})(ProductComponent)

export default connect(
	(state) => ({
		formValues: getFormValues('ProductSave')(state),
		change,
		initialValues: state.products.detail,
		origin: state.products.detailOrigin,
		currency: state.preference.account.currency,
		user: state.auth.user,
		productManaging: state.products.productManaging,
		aiSuggestionsApplied: state.products.aiSuggestionsApplied,
		productCategory: state.productCategory,
		products: state.products.list,
		storeAccount: state.auth.store,
		checkoutSort: state.preference.account.checkoutSort,
		billing: state.billing,
	}),
	{
		checkUserReachedLimit,
		productCategoryDetailCreate,
		productCategorySelect,
		productManagementSetValue,
		clearAISuggestProductDescription,
		toggleBillingMessage,
		productCategorySave,
	}
)(ProductSave)
