import React, { Component } from 'react'
import _ from 'lodash'
import { Alert, View, Platform, Text, Keyboard } from 'react-native'
import { connect } from 'react-redux'
import { getFormValues, isPristine, reduxForm, Field } from 'redux-form'
import {
	productCategorySave,
	productCategoryFetch,
	productCategoryRemove,
	stockSetCategory,
	stockClearFilter,
	stockFetch,
} from '../../../stores/actions'
import I18n from '../../../i18n/i18n'
import {
	ActionButton,
	Input,
	KyteToolbar,
	CustomKeyboardAvoidingView,
	KyteSafeAreaView,
	LoadingCleanScreen,
} from '../../common'
import { colors, scaffolding, Type, colorSet } from '../../../styles'
import { logEvent } from '../../../integrations'
import { generateTestID } from '../../../util'

class ProductCategoryCreate extends Component {
	constructor(props) {
		super(props)

		this.state = {
			deleteButton: [
				{ icon: 'trash', onPress: () => this.alertDeleteProduct(), testProps: generateTestID('remove-categ') },
			],
			keyboardVisible: false,
		}

		this.handleKeyboardWillShow = this.handleKeyboardWillShow.bind(this)
		this.handleKeyboardWillHide = this.handleKeyboardWillHide.bind(this)
	}

	componentDidMount() {
		this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.handleKeyboardWillShow)
		this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.handleKeyboardWillHide)
	}

	componentWillUnmount() {
		if (this.keyboardWillShowListener && typeof this.keyboardWillShowListener.remove === 'function') {
			this.keyboardWillShowListener.remove()
		}
		if (this.keyboardWillHideListener && typeof this.keyboardWillHideListener.remove === 'function') {
			this.keyboardWillHideListener.remove()
		}
	}

	handleKeyboardWillShow() {
		this.setState({ keyboardVisible: true })
	}

	handleKeyboardWillHide() {
		this.setState({ keyboardVisible: false })
	}

	alertDeleteProduct() {
		Alert.alert(I18n.t('productCategoryDeleteAlertTitle'), I18n.t('productCategoryDeleteAlertDescription'), [
			{ text: I18n.t('alertDismiss'), style: 'cancel' },
			{ text: I18n.t('alertConfirm'), onPress: () => this.deleteProductCategory() },
		])
	}

	deleteProductCategory() {
		const { initialValues, filters } = this.props

		const shouldRemoveItemFromStockFilter = _.find(filters.categories, (item) => item.id === initialValues.id)

		const removeCategoryFromStockFilter = () => {
			if (shouldRemoveItemFromStockFilter) this.props.stockSetCategory(initialValues)

			this.props.stockFetch('', { limit: 40, length: 0 }, true)
		}

		this.props.productCategoryRemove(initialValues.id, () => {
			removeCategoryFromStockFilter()
			this.backToList()
		})
	}

	formSubmit({ name }) {
		const { initialValues, origin, cb } = this.props
		let objectForSave = { name, productQuantity: 0, active: true }

		if (initialValues && initialValues.id) {
			objectForSave = { ...objectForSave, id: initialValues.id }
			delete objectForSave.productQuantity
		}

		this.props.productCategorySave(objectForSave, (productReturn) => {
			const categoryCreationLocation = origin === 'ProductDetail' ? 'product-detail' : 'list'

			if (!initialValues?.id) {
				logEvent('Category Create', { where: categoryCreationLocation })
			} else {
				logEvent('Category Save')
			}

			const sort = { key: 'dateCreation', isDesc: false }
			this.props.productCategoryFetch(sort)
			if (origin && cb && origin === 'ProductDetail') {
				cb(productReturn)
				return
			}
			this.backToList()
		})
	}

	goBackAction() {
		const { pristine, navigation } = this.props
		const { contentHasChanged } = this.state

		if (!pristine || contentHasChanged) {
			this.alertDiscardChanges()
			return
		}
		navigation.goBack()
	}

	backToList() {
		const { navigation } = this.props
		const sort = { key: 'dateCreation', isDesc: false }

		this.props.productCategoryFetch(sort)
		navigation.goBack()
	}

	alertDiscardChanges() {
		const { handleSubmit } = this.props
		const { goBack } = this.props.navigation

		Alert.alert(I18n.t('unsavedChangesTitle'), I18n.t('unsavedChangesDescription'), [
			{ text: I18n.t('alertDiscard'), onPress: () => goBack() },
			{ text: I18n.t('alertSave'), onPress: handleSubmit(this.formSubmit.bind(this)) },
		])
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
				autoFocus={field.autoFocus}
				autoCorrect
			/>
		)
	}

	renderHeader() {
		const { initialValues } = this.props
		const { navigate } = this.props.navigation

		return (
			<KyteToolbar
				showCloseButton
				innerPage
				borderBottom={1.5}
				headerTitle={initialValues ? I18n.t('productCategoryEditPageTitle') : I18n.t('productCategoryAddPageTitle')}
				rightButtons={initialValues ? this.state.deleteButton : null}
				navigate={navigate}
				navigation={this.props.navigation}
				goBack={() => this.goBackAction()}
			/>
		)
	}

	render() {
		const { outerContainer, bottomContainer } = scaffolding
		const { handleSubmit, formValues, origin, isLoading } = this.props
		const { fieldsContainer, keyboardAvoid } = styles
		const hasName = formValues && formValues.name

		return (
			<KyteSafeAreaView style={outerContainer}>
				<CustomKeyboardAvoidingView style={{ flex: 1 }}>
					{origin && origin === 'ProductDetail' ? null : this.renderHeader()}
					<View style={{ flex: 1 }}>
						<View style={{ flex: 1 }} />
						<View style={[fieldsContainer, { flex: 1 }]}>
							<Field
								name="name"
								component={this.renderField}
								style={Platform.select({ ios: { height: 32 } })}
								maxLength={20}
								autoFocus
							/>
							<View style={{ alignItems: 'center', paddingTop: 10 }}>
								<Text style={[Type.Regular, colorSet(colors.secondaryColor)]}>
									{I18n.t('productCategoryPlaceholder')}
								</Text>
							</View>
						</View>
						<View style={[bottomContainer, keyboardAvoid(origin, this.state.keyboardVisible)]}>
							<ActionButton
								alertTitle=""
								alertDescription={I18n.t('productCategoryValidateName')}
								onPress={handleSubmit(this.formSubmit.bind(this))}
								disabled={!hasName}
								debounce
							>
								{I18n.t('productSaveButton')}
							</ActionButton>
						</View>
					</View>
				</CustomKeyboardAvoidingView>
				{isLoading ? <LoadingCleanScreen /> : null}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	fieldsContainer: {
		paddingHorizontal: 20,
	},
	keyboardAvoid: (origin, keyboardVisible) => {
		return origin === 'ProductDetail' && keyboardVisible && Platform.OS === 'ios' ? { marginBottom: 65 } : {}
	},
}

function validate(values) {
	const errors = {}
	if (!values.name) {
		errors.name = I18n.t('productValidateName')
	}
	return errors
}

const ProductCategorySave = reduxForm({
	form: 'ProductCategorySave',
	validate,
})(ProductCategoryCreate)

export default connect(
	(state) => ({
		formValues: getFormValues('ProductCategorySave')(state),
		pristine: isPristine('ProductCategorySave')(state),
		initialValues: state.productCategory.detail,
		searchTerm: state.productCategory.searchTerm,
		filters: state.stock.filters,
		isLoading: state.common.loader.visible,
	}),
	{ productCategoryFetch, productCategorySave, productCategoryRemove, stockSetCategory, stockClearFilter, stockFetch }
)(ProductCategorySave)
