import KyteNotification, {
	KyteNotificationProps,
} from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import { VariationFormState } from './reducers/variation-form.reducer'
import {
	IVariationOption,
	IVariation,
	IProductWithVariation,
	IStockMovement,
	IProduct,
	IProductVariant,
} from '@kyteapp/kyte-utils'
import { ComponentProps } from 'react'
import { Action } from 'redux'
import { buildProductManaging } from '../../util/util-product'

export interface IVariantOption extends IVariationOption {
	id?: string | number
	title: string
	active?: boolean
	isFocused?: boolean
	isTouched?: boolean
	hasError?: boolean
}

export interface IVariant extends IVariation {
	id?: string
	active?: boolean
	options: IVariantOption[]
}

export const SET_VARIANTS = 'SET_VARIANTS'
export const SET_SELECTED_VARIANT = 'SET_SELECTED_VARIANT'
export const SET_WIZARD_PRODUCT_ID = 'SET_WIZARD_PRODUCT_ID'
export const SET_WIZARD_VARIATION = 'SET_WIZARD_VARIATION'
export const REMOVE_WIZARD_VARIATION = 'REMOVE_WIZARD_VARIATION'
export const REMOVE_WIZARD_VARIATION_OPTION = 'REMOVE_WIZARD_VARIATION_OPTION'
export const SET_WIZARD_SELECTED_VARIANT = 'SET_WIZARD_SELECTED_VARIANT'
export const SET_WIZARD_PRIMARY_VARIANT = 'SET_WIZARD_PRIMARY_VARIANT'
export const RESET_WIZARD_VARIATION = 'RESET_WIZARD_VARIATION'
export const CREATE_VARIATION = 'CREATE_VARIATION'
export const GET_VARIATIONS = 'GET_VARIATIONS'
export const GENERATE_PRODUCT_SKUS = 'GENERATE_PRODUCT_SKUS'
export const PERSIST_PRODUCT_SKUS = 'PERSIST_PRODUCT_SKUS'
export const IS_CREATING_SKUS = 'IS_CREATING_SKUS'
export const IS_FETCHING_VARIATIONS = 'IS_FETCHING_VARIATIONS'
export const SET_SKUS_GENERATION_LIMIT = 'SET_SKUS_GENERATION_LIMIT'
export const LOGOUT = 'logout'
export const SET_VARIANTS_NOTIFICATIONS = 'SET_VARIANTS_NOTIFICATIONS'
export const SET_VARIANT_MANAGEMENT_VALUE = 'SET_VARIANT_MANAGEMENT_VALUE'
export const GET_PRODUCT_VARIANTS = 'GET_PRODUCT_VARIANTS'
export const SET_PARENT_PRODUCT_STOCK_ACTIVE = 'SET_PARENT_PRODUCT_STOCK_ACTIVE'
export const SET_PARENT_PRODUCT_STOCK_INACTIVE = 'SET_PARENT_PRODUCT_STOCK_INACTIVE'
export const RESET_VARIANTS_STATE = 'RESET_VARIANTS_STATE'
export const SET_PRODUCT_VARIANT_DETAIL = 'SET_PRODUCT_VARIANT_DETAIL'
export const SET_CHECKOUT_PRODUCT = 'SET_CHECKOUT_PRODUCT'
export const SET_VARIATION_DETAIL = 'SET_VARIATION_DETAIL'
export const UPDATE_PRODUCT_VARIANT_OPTIONS = 'UPDATE_PRODUCT_VARIANT_OPTIONS'
export const SET_VARIANTS_NEEDS_REFRESH = 'SET_VARIANTS_NEEDS_REFRESH'

export interface ISetWizardProductIdAction extends Action {
	type: typeof SET_WIZARD_PRODUCT_ID
	payload: string
}

export interface ISetWizardVariationAction extends Action {
	type: typeof SET_WIZARD_VARIATION
	payload: IVariant
}

export interface IRemoveWizardVariationAction extends Action {
	type: typeof REMOVE_WIZARD_VARIATION
	payload: IVariant
}

export interface IRemoveWizardVariationOptionAction extends Action {
	type: typeof REMOVE_WIZARD_VARIATION_OPTION
	payload: { variant: IVariant; optionId?: string | number }
}

export interface IResetWizardVariationAction extends Action {
	type: typeof RESET_WIZARD_VARIATION
	payload: undefined
}

export interface ISetWizardSelectedVariantAction extends Action {
	type: typeof SET_WIZARD_SELECTED_VARIANT
	payload: IVariant
}

export interface ISetWizardPrimaryVariantAction extends Action {
	type: typeof SET_WIZARD_PRIMARY_VARIANT
	payload: IVariant
}

export interface ICreateVariantAction extends Action {
	type: typeof CREATE_VARIATION
	payload: IVariant
}

export interface IGenerateProductSKUsAction extends Action {
	type: typeof GENERATE_PRODUCT_SKUS
	payload: { product: IProductWithVariation; variants: IProductWithVariation[] }
}

export interface IPersistProductSKUsAction extends Action {
	type: typeof PERSIST_PRODUCT_SKUS
	payload: { product: IProductWithVariation; variants: IProductWithVariation[] }
}

export interface IIsCreatingSKUsAction extends Action {
	type: typeof IS_CREATING_SKUS
	payload: boolean
}

export interface ISetSkuGenerationLimitAction extends Action {
	type: typeof SET_SKUS_GENERATION_LIMIT
	payload: { variantId: string; options: IVariantOption[] }
}

export interface IGetVariationsAction extends Action {
	type: typeof GET_VARIATIONS
	payload: IVariant[]
}

export interface IIsFetchingVariationsAction extends Action {
	type: typeof IS_FETCHING_VARIATIONS
	payload: boolean
}

export interface ILogoutAction extends Action {
	type: typeof LOGOUT
}

export interface ISetVariantsNotifications extends Action {
	type: typeof SET_VARIANTS_NOTIFICATIONS
	payload: KyteNotificationProps[]
}

export interface IVariantManagementSetValue extends Action {
	type: typeof SET_VARIANT_MANAGEMENT_VALUE
	payload: { set?: 'initial'; value: any; property: keyof ReturnType<typeof buildProductManaging> }
}

export interface IGetProductVariants extends Action {
	type: typeof GET_PRODUCT_VARIANTS
	payload: IProductVariant[] | null
}

export interface ISetParentProductStockActive extends Action {
	type: typeof SET_PARENT_PRODUCT_STOCK_ACTIVE
	payload: any
}

export interface ISetParentProductStockInactive extends Action {
	type: typeof SET_PARENT_PRODUCT_STOCK_INACTIVE
	payload: any
}

export interface IResetVariantsState extends Action {
	type: typeof RESET_VARIANTS_STATE
	payload: void
}

export interface ISetProductVariantDetail extends Action {
	type: typeof SET_PRODUCT_VARIANT_DETAIL
	payload: IProductVariant
}

export interface ISetCheckoutProduct extends Action {
	type: typeof SET_CHECKOUT_PRODUCT
	payload: IProductWithVariation
}

export interface ISetVariationDetailAction {
	type: typeof SET_VARIATION_DETAIL
	payload: IVariant
}

export interface IUpdateProductVariantOptionsAction {
	type: typeof UPDATE_PRODUCT_VARIANT_OPTIONS
	payload: {
		productId: string
		variations: {
			_id: string
			aid: string
			uid: string
			name: string
			options: Array<{
				title: string
			}>
			isPrimary?: boolean
		}[]
	}
}

export interface ISetVariantsNeedsRefreshAction {
	type: typeof SET_VARIANTS_NEEDS_REFRESH
	payload: boolean
}

export type VariantActionsTypes =
	| ISetWizardProductIdAction
	| ISetWizardVariationAction
	| IRemoveWizardVariationAction
	| IRemoveWizardVariationOptionAction
	| ISetWizardSelectedVariantAction
	| ICreateVariantAction
	| IGenerateProductSKUsAction
	| IIsCreatingSKUsAction
	| ISetWizardPrimaryVariantAction
	| IPersistProductSKUsAction
	| IResetWizardVariationAction
	| ISetSkuGenerationLimitAction
	| ILogoutAction
	| IGetVariationsAction
	| IIsFetchingVariationsAction
	| ISetVariantsNotifications
	| IVariantManagementSetValue
	| IGetProductVariants
	| ISetParentProductStockActive
	| ISetParentProductStockInactive
	| IResetVariantsState
	| ISetProductVariantDetail
	| ISetCheckoutProduct
	| ISetVariationDetailAction
	| IUpdateProductVariantOptionsAction
	| ISetVariantsNeedsRefreshAction

// Variants Reducer State
export interface IVariantsState {
	list: IVariant[] // list of variations
	selected?: IVariant
	isFetchingList?: boolean
	notifications: ComponentProps<typeof KyteNotification>[]
	wizard: {
		productId?: string
		selected?: {
			step?: string | number
			variant: IVariant
		}
		skus?: { product: IProductWithVariation; variants: IProductWithVariation[] }
		isCreatingSKUs?: boolean
		chosenVariations?: IVariant[]
		skusGenerationLimit: {
			max: number
			current: number
			isOffLimit: boolean
			isAtLimit: boolean
		}
	}
	productVariants?: IProductVariant[] | null // list of variants(product childs)
	productVariant?: IProductVariant // the current selected variant(been seen on detail page)
	productManaging?: ReturnType<typeof buildProductManaging> // a helper state on productVariant editting
	stockHistory?: IStockMovement[]
	stockHistoryTotal?: number
	checkoutProduct?: IProductWithVariation
	variationDetail?: IVariant
	needsRefresh?: boolean
	variationForm: VariationFormState
}
