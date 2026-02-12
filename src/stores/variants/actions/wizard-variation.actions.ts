import { Dispatch } from 'react-redux'
import {
	IVariant,
	SET_WIZARD_VARIATION,
	REMOVE_WIZARD_VARIATION,
	REMOVE_WIZARD_VARIATION_OPTION,
	SET_WIZARD_SELECTED_VARIANT,
	SET_WIZARD_PRIMARY_VARIANT,
	RESET_WIZARD_VARIATION,
	ISetWizardPrimaryVariantAction,
	SET_SKUS_GENERATION_LIMIT,
	IVariantsState,
	SET_VARIANTS_NOTIFICATIONS,
	SET_VARIANTS_NEEDS_REFRESH,
} from '../variants.types'
import { IVariationOption } from '@kyteapp/kyte-utils'

const randomId = () => String(Math.floor(Math.random() * 90000) + 10000)
// ._id id from the database, id from the frontend
const variantId = (variant: IVariant) => variant._id || variant.id || randomId()

// Set one of the wizard variations
export const setWizardVariation = (variation: IVariant) => ({
	type: SET_WIZARD_VARIATION,
	payload: {
		...variation,
		id: variantId(variation),
		options: variation.options.map((option) => ({ ...option, id: option.id || randomId() })),
	},
})

// Remove a variation from the wizard
export const removeWizardVariation = (variation: IVariant) => ({
	type: REMOVE_WIZARD_VARIATION,
	payload: { ...variation, id: variantId(variation) },
})

export const setSKUsGenerationLimit = (variantId: string, options: IVariationOption[]) => ({
	type: SET_SKUS_GENERATION_LIMIT,
	payload: { variantId, options },
})

export const setWizardPrimaryVariant = (variant: IVariant): ISetWizardPrimaryVariantAction => ({
	type: SET_WIZARD_PRIMARY_VARIANT,
	payload: variant,
})

// Remove a variation option from the wizard
export const removeWizardVariationOption = (variation: IVariant, optionId?: string | number) => ({
	type: REMOVE_WIZARD_VARIATION_OPTION,
	payload: { variant: { ...variation, id: variantId(variation) }, optionId },
})

// Set the selected variant for the wizard
export const setWizardSelectedVariant = (variant?: IVariant) => (dispatch: Dispatch) => {
	dispatch({
		type: SET_WIZARD_SELECTED_VARIANT,
		payload: variant,
	})
}

// Reset the wizard variations
export const resetWizardVariation = () => (dispatch: Dispatch) => {
	dispatch({ type: RESET_WIZARD_VARIATION })
}

export const setVariantsNotification = (notifications: IVariantsState['notifications']) => ({
	type: SET_VARIANTS_NOTIFICATIONS,
	payload: notifications,
})

export const setVariantsNeedsRefresh = (needsRefresh: boolean) => ({
	type: SET_VARIANTS_NEEDS_REFRESH,
	payload: needsRefresh,
})
