// Action to set the variation detail in global state
import { IProductVariant } from '@kyteapp/kyte-utils'
import { buildProductManaging } from '../../../util/util-product'
import { IVariant, SET_VARIATION_DETAIL } from '../variants.types'
import {
	IResetVariantsState,
	ISetProductVariantDetail,
	RESET_VARIANTS_STATE,
	SET_PRODUCT_VARIANT_DETAIL,
	SET_VARIANT_MANAGEMENT_VALUE,
} from '../variants.types'

export const variantManagementSetValue = (
	value: any,
	property: keyof ReturnType<typeof buildProductManaging>,
	set?: 'initial'
) => ({
	type: SET_VARIANT_MANAGEMENT_VALUE,
	payload: { value, property, set },
})

export function setProductVariantDetail(productVariant: IProductVariant) {
	const action: ISetProductVariantDetail = {
		type: SET_PRODUCT_VARIANT_DETAIL,
		payload: productVariant,
	}

	return action
}

export function resetVariantsState() {
	const action: IResetVariantsState = {
		type: RESET_VARIANTS_STATE,
		payload: undefined,
	}

	return action
}

export function setVariationDetail(variation: IVariant) {
	return {
		type: SET_VARIATION_DETAIL,
		payload: variation,
	}
}
