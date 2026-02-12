import React from 'react'
import { change, FormErrors, InjectedFormProps, reduxForm } from 'redux-form'
import { IVariant, IVariantOption } from '../../../../stores/variants/variants.types'
import { Dispatch } from 'react-redux'

/**
 * Centralizes variant creation form through shared interfaces and a HOC factory function.
 * Ensures consistent form value types and creation across all variant-related forms.
 */

export interface VariantCreateFormValues extends IVariant {
	optionField: string
}

export const VARIANT_CREATE_FORM_NAME = 'VariantCreate'
export const OPTIONS_CREATE_FORM_NAME = 'OptionsCreate'
export const CONTENT_SPACING = 20
export const WIZARD_IMAGE_SIZE = 200

/**
 * Higher-order component factory for creating Redux Form variants
 * @param formId - Unique identifier for the form instance
 * @param Component - React component to wrap with form functionality
 * @param validate - Optional validation function for form values
 * @returns A Redux Form enhanced component with variant creation capabilities
 */
export const createVariantForm = <P extends object>(
	formId: string,
	Component: React.ComponentType<P & InjectedFormProps<VariantCreateFormValues, P>>,
	validate?: (values: VariantCreateFormValues, props: P) => FormErrors<VariantCreateFormValues>
) =>
	reduxForm<VariantCreateFormValues, P>({
		form: formId,
		validate,
		enableReinitialize: true,
	})(Component)

// Action creator for updating external form values
/**
 * Updates a Redux Form field value from an external source
 * @param formId - Unique identifier for the form instance
 * @param formField - Field to update
 * @param value - New value for the field
 * @returns A Redux action to update the form field
 *
 **/
export const updateExternalForm =
	(formId: string, formField: string, value?: string | number) => (dispatch?: Dispatch) => {
		dispatch?.(change(formId, formField, value))
	}

// === Start: Utility functions for manual form validation ===
export const checkOptionsWithoutTitle = (options: IVariant['options']) => options?.some((option) => !option.title)

export const checkOptionsWithSameName = (options: IVariant['options']) => {
	const optionNames = options?.map((option) => option.title?.toLocaleLowerCase()?.trim())
	return new Set(optionNames).size !== optionNames?.length
}

export const checkOptionAlreadyExists = (options: IVariant['options'], option: IVariantOption) => {
	const otherTitles = options
		?.filter((otherOption) => otherOption.id !== option.id)
		.map((otherOption) => otherOption.title?.toLowerCase()?.trim())
	const optionField = option?.title?.toLowerCase()?.trim()

	return otherTitles?.includes(optionField)
}

export const checkOptionsActive = (options: IVariant['options']) => options?.filter((option) => option.active)
// === End: Utility functions for manual form validation ===
