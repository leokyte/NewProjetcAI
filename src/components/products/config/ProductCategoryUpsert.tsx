import React, { useState, useEffect, useCallback } from 'react'
import _ from 'lodash'
import { Alert, Platform, Keyboard } from 'react-native'
import { connect } from 'react-redux'
import { getFormValues, isPristine, reduxForm, Field, InjectedFormProps } from 'redux-form'
import {
	productCategorySave,
	productCategoryFetch,
	productCategoryRemove,
	stockSetCategory,
	stockClearFilter,
	stockFetch,
} from '../../../stores/actions'
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
import I18n from '../../../i18n/i18n'
import { useNavigation } from '@react-navigation/native'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'

// eslint-disable-next-line
type FormValues = {
	name: string
}

type ProductCategory = {
	id: string | null
	name: string
	productQuantity?: number
	active: boolean
}

type FilterCategory = {
	id: string
	name: string
}

type Filters = {
	categories: FilterCategory[]
}

type ReduxProps = {
	formValues: FormValues
	pristine: boolean
	initialValues: ProductCategory | null
	searchTerm: string
	filters: Filters
	isLoading: boolean
	productCategoryFetch: (sort: { key: string; isDesc: boolean }) => void
	productCategorySave: (category: Partial<ProductCategory>, callback?: (result: any) => void) => void
	productCategoryRemove: (id: string, callback?: () => void) => void
	stockSetCategory: (category: ProductCategory) => void
	stockClearFilter: () => void
	stockFetch: (term: string, options: { limit: number; length: number }, refresh?: boolean) => void
}

type NavigationProps = {
	navigation: {
		goBack: () => void
	}
}

type OwnProps = {
	origin?: string
	cb?: (result: any) => void
}

type Props = InjectedFormProps<FormValues> & ReduxProps & NavigationProps & OwnProps

type DeleteButton = {
	icon: string
	onPress: () => void
	testProps: any
}

const ProductCategoryUpsert: React.FC<Props> = ({
	handleSubmit,
	formValues,
	pristine,
	initialValues,
	filters,
	isLoading,
	origin,
	cb,
	productCategoryFetch,
	productCategorySave,
	productCategoryRemove,
	stockSetCategory,
	stockFetch,
}) => {
	const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false)
	const [contentHasChanged] = useState<boolean>(false)
	const navigation = useNavigation()

	const deleteButton: DeleteButton[] = [
		{
			icon: 'trash',
			onPress: () => alertDeleteProduct(),
			testProps: generateTestID('remove-categ'),
		},
	]

	useEffect(() => {
		const showListener = Keyboard.addListener('keyboardWillShow', () => {
			setKeyboardVisible(true)
		})
		const hideListener = Keyboard.addListener('keyboardWillHide', () => {
			setKeyboardVisible(false)
		})

		return () => {
			showListener.remove()
			hideListener.remove()
		}
	}, [])

	const alertDeleteProduct = useCallback((): void => {
		Alert.alert(I18n.t('productCategoryDeleteAlertTitle'), I18n.t('productCategoryDeleteAlertDescription'), [
			{ text: I18n.t('alertDismiss'), style: 'cancel' },
			{ text: I18n.t('alertConfirm'), onPress: () => deleteProductCategory() },
		])
	}, [])

	const deleteProductCategory = useCallback((): void => {
		if (!initialValues?.id) return

		const shouldRemoveItemFromStockFilter = _.find(filters.categories, (item) => item.id === initialValues.id)

		const removeCategoryFromStockFilter = () => {
			if (shouldRemoveItemFromStockFilter && initialValues) {
				stockSetCategory(initialValues)
			}
			stockFetch('', { limit: 40, length: 0 }, true)
		}

		productCategoryRemove(initialValues.id, () => {
			removeCategoryFromStockFilter()
			backToList()
		})
	}, [initialValues, filters.categories, stockSetCategory, stockFetch, productCategoryRemove])

	const formSubmit = useCallback(
		({ name }: FormValues): void => {
			let objectForSave: Partial<ProductCategory> = {
				name,
				productQuantity: 0,
				active: true,
				id: null,
			}

			if (initialValues?.id) {
				objectForSave = { ...objectForSave, id: initialValues.id }
				delete objectForSave.productQuantity
			}

			productCategorySave(objectForSave, (productReturn: any) => {
				const categoryCreationLocation = origin === 'ProductDetail' ? 'product-detail' : 'list'

				if (!initialValues?.id) {
					logEvent('Category Create', { where: categoryCreationLocation })
				} else {
					logEvent('Category Save')
				}

				const sort = { key: 'dateCreation', isDesc: false }
				productCategoryFetch(sort)

				if (origin && cb && origin === 'ProductDetail') {
					cb(productReturn)
					return
				}
				backToList()
			})
		},
		[initialValues, origin, cb, productCategorySave, productCategoryFetch]
	)

	const goBackAction = useCallback((): void => {
		if (!pristine || contentHasChanged) {
			alertDiscardChanges()
			return
		}
		navigation.goBack()
	}, [pristine, contentHasChanged, navigation])

	const backToList = useCallback((): void => {
		const sort = { key: 'dateCreation', isDesc: false }
		productCategoryFetch(sort)
		navigation.goBack()
	}, [productCategoryFetch, navigation])

	const alertDiscardChanges = useCallback((): void => {
		Alert.alert(I18n.t('unsavedChangesTitle'), I18n.t('unsavedChangesDescription'), [
			{ text: I18n.t('alertDiscard'), onPress: () => navigation.goBack() },
			{ text: I18n.t('alertSave'), onPress: handleSubmit(formSubmit) },
		])
	}, [navigation, handleSubmit, formSubmit])

	const renderField = useCallback((field: any) => {
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
	}, [])

	const renderHeader = useCallback(() => {
		return (
			<KyteToolbar
				showCloseButton
				innerPage
				borderBottom={1.5}
				headerTitle={initialValues ? I18n.t('productCategoryEditPageTitle') : I18n.t('productCategoryAddPageTitle')}
				rightButtons={initialValues ? deleteButton : null}
				navigation={navigation}
				goBack={() => goBackAction()}
				{...({} as any)}
			/>
		)
	}, [initialValues, deleteButton, navigation, goBackAction])

	const { outerContainer, bottomContainer } = scaffolding
	const { fieldsContainer, keyboardAvoid } = styles
	const hasName = formValues?.name

	return (
		<KyteSafeAreaView style={outerContainer}>
			<CustomKeyboardAvoidingView style={{ flex: 1 }}>
				{origin && origin === 'ProductDetail' ? null : renderHeader()}
				<Container flex={1}>
					<Container flex={1} />
					<Container flex={1} style={fieldsContainer}>
						<Field
							name="name"
							component={renderField}
							style={Platform.select({ ios: { height: 32 } })}
							maxLength={20}
							autoFocus
						/>
						<Container alignItems="center" paddingTop={10}>
							<KyteText style={[Type.Regular, colorSet(colors.secondaryColor)]}>
								{I18n.t('productCategoryPlaceholder')}
							</KyteText>
						</Container>
					</Container>
					{/* @ts-ignore */}
					<Container style={[bottomContainer, keyboardAvoid(origin, keyboardVisible)]}>
						<ActionButton
							alertTitle=""
							alertDescription={I18n.t('productCategoryValidateName')}
							onPress={handleSubmit(formSubmit)}
							disabled={!hasName}
							debounce
							full={false}
						>
							{I18n.t('productSaveButton')}
						</ActionButton>
					</Container>
				</Container>
				{isLoading ? <LoadingCleanScreen /> : null}
			</CustomKeyboardAvoidingView>
		</KyteSafeAreaView>
	)
}

const styles = {
	fieldsContainer: {
		paddingHorizontal: 20,
	},
	keyboardAvoid: (origin?: string, keyboardVisible?: boolean) =>
		origin === 'ProductDetail' && keyboardVisible && Platform.OS === 'ios' ? { marginBottom: 65 } : {},
}

function validate(values: FormValues) {
	const errors: Partial<FormValues> = {}
	if (!values.name) {
		errors.name = I18n.t('productValidateName')
	}
	return errors
}

const ProductCategorySave = reduxForm<FormValues, OwnProps>({
	form: 'ProductCategorySave',
	validate,
	// @ts-ignore
})(ProductCategoryUpsert)

export default connect(
	(state: any) => ({
		formValues: getFormValues('ProductCategorySave')(state),
		pristine: isPristine('ProductCategorySave')(state),
		initialValues: state.productCategory.detail,
		searchTerm: state.productCategory.searchTerm,
		filters: state.stock.filters,
		isLoading: state.common.loader.visible,
	}),
	{
		productCategoryFetch,
		productCategorySave,
		productCategoryRemove,
		stockSetCategory,
		stockClearFilter,
		stockFetch,
	}
	// @ts-ignore
)(ProductCategorySave)
