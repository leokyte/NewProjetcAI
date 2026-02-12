import { KyteNotificationProps } from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'

export const SET_VARIATION_FORM_NAME = 'SET_VARIATION_FORM_NAME'
export const SET_VARIATION_FORM_OPTIONS = 'SET_VARIATION_FORM_OPTIONS'
export const ADD_VARIATION_FORM_OPTION = 'ADD_VARIATION_FORM_OPTION'
export const UPDATE_VARIATION_FORM_OPTION = 'UPDATE_VARIATION_FORM_OPTION'
export const DELETE_VARIATION_FORM_OPTION = 'DELETE_VARIATION_FORM_OPTION'
export const SET_VARIATION_FORM_LOADING = 'SET_VARIATION_FORM_LOADING'
export const ADD_VARIATION_FORM_NOTIFICATION = 'ADD_VARIATION_FORM_NOTIFICATION'
export const CLEAR_VARIATION_FORM_NOTIFICATIONS = 'CLEAR_VARIATION_FORM_NOTIFICATIONS'
export const RESET_VARIATION_FORM = 'RESET_VARIATION_FORM'
export const SET_VARIATION_FORM_MODE = 'SET_VARIATION_FORM_MODE'
export const SET_EDITING_OPTION = 'SET_EDITING_OPTION'
export const SET_OPTION_MODAL_VISIBLE = 'SET_OPTION_MODAL_VISIBLE'
export const SET_NAME_MODAL_VISIBLE = 'SET_NAME_MODAL_VISIBLE'
export const SET_ORIGINAL_VALUES = 'SET_ORIGINAL_VALUES'

export type VariationFormOption = {
	id: string | number
	title: string
	active?: boolean
	isFocused?: boolean
	isTouched?: boolean
	hasError?: boolean
}

export type VariationFormMode = 'create' | 'edit'

export const setVariationFormName = (name: string) => {
	return {
		type: SET_VARIATION_FORM_NAME,
		payload: name
	}
}

export const setVariationFormOptions = (options: VariationFormOption[]) => ({
	type: SET_VARIATION_FORM_OPTIONS,
	payload: options
})

export const addVariationFormOption = (option: VariationFormOption) => ({
	type: ADD_VARIATION_FORM_OPTION,
	payload: option
})

export const updateVariationFormOption = (optionId: string | number, updatedOption: Partial<VariationFormOption>) => ({
	type: UPDATE_VARIATION_FORM_OPTION,
	payload: { optionId, updatedOption }
})

export const deleteVariationFormOption = (optionId: string | number, optionTitle: string) => ({
	type: DELETE_VARIATION_FORM_OPTION,
	payload: { optionId, optionTitle }
})

export const setVariationFormLoading = (isLoading: boolean) => ({
	type: SET_VARIATION_FORM_LOADING,
	payload: isLoading
})

export const addVariationFormNotification = (notification: KyteNotificationProps) => ({
	type: ADD_VARIATION_FORM_NOTIFICATION,
	payload: notification
})

export const clearVariationFormNotifications = () => ({
	type: CLEAR_VARIATION_FORM_NOTIFICATIONS
})

export const resetVariationForm = () => ({
	type: RESET_VARIATION_FORM
})

export const setVariationFormMode = (mode: VariationFormMode, variationId?: string) => ({
	type: SET_VARIATION_FORM_MODE,
	payload: { mode, variationId }
})

export const setEditingOption = (option: VariationFormOption | null) => ({
	type: SET_EDITING_OPTION,
	payload: option
})

export const setOptionModalVisible = (visible: boolean) => ({
	type: SET_OPTION_MODAL_VISIBLE,
	payload: visible
})

export const setNameModalVisible = (visible: boolean) => ({
	type: SET_NAME_MODAL_VISIBLE,
	payload: visible
})

export const setOriginalValues = (variationName: string, options: VariationFormOption[]) => ({
	type: SET_ORIGINAL_VALUES,
	payload: { variationName, options }
})

export interface SetVariationFormNameAction {
	type: typeof SET_VARIATION_FORM_NAME
	payload: string
}

export interface SetVariationFormOptionsAction {
	type: typeof SET_VARIATION_FORM_OPTIONS
	payload: VariationFormOption[]
}

export interface AddVariationFormOptionAction {
	type: typeof ADD_VARIATION_FORM_OPTION
	payload: VariationFormOption
}

export interface UpdateVariationFormOptionAction {
	type: typeof UPDATE_VARIATION_FORM_OPTION
	payload: { optionId: string | number; updatedOption: Partial<VariationFormOption> }
}

export interface DeleteVariationFormOptionAction {
	type: typeof DELETE_VARIATION_FORM_OPTION
	payload: { optionId: string | number; optionTitle: string }
}

export interface SetVariationFormLoadingAction {
	type: typeof SET_VARIATION_FORM_LOADING
	payload: boolean
}

export interface AddVariationFormNotificationAction {
	type: typeof ADD_VARIATION_FORM_NOTIFICATION
	payload: KyteNotificationProps
}

export interface ClearVariationFormNotificationsAction {
	type: typeof CLEAR_VARIATION_FORM_NOTIFICATIONS
}

export interface ResetVariationFormAction {
	type: typeof RESET_VARIATION_FORM
}

export interface SetVariationFormModeAction {
	type: typeof SET_VARIATION_FORM_MODE
	payload: { mode: VariationFormMode; variationId?: string }
}

export interface SetEditingOptionAction {
	type: typeof SET_EDITING_OPTION
	payload: VariationFormOption | null
}

export interface SetOptionModalVisibleAction {
	type: typeof SET_OPTION_MODAL_VISIBLE
	payload: boolean
}

export interface SetNameModalVisibleAction {
	type: typeof SET_NAME_MODAL_VISIBLE
	payload: boolean
}

export interface SetOriginalValuesAction {
	type: typeof SET_ORIGINAL_VALUES
	payload: { variationName: string; options: VariationFormOption[] }
}

export type VariationFormActionTypes =
	| SetVariationFormNameAction
	| SetVariationFormOptionsAction
	| AddVariationFormOptionAction
	| UpdateVariationFormOptionAction
	| DeleteVariationFormOptionAction
	| SetVariationFormLoadingAction
	| AddVariationFormNotificationAction
	| ClearVariationFormNotificationsAction
	| ResetVariationFormAction
	| SetVariationFormModeAction
	| SetEditingOptionAction
	| SetOptionModalVisibleAction
	| SetNameModalVisibleAction
	| SetOriginalValuesAction