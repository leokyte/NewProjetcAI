import { KyteNotificationProps } from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import {
	VariationFormActionTypes,
	VariationFormOption,
	VariationFormMode,
	SET_VARIATION_FORM_NAME,
	SET_VARIATION_FORM_OPTIONS,
	ADD_VARIATION_FORM_OPTION,
	UPDATE_VARIATION_FORM_OPTION,
	DELETE_VARIATION_FORM_OPTION,
	SET_VARIATION_FORM_LOADING,
	ADD_VARIATION_FORM_NOTIFICATION,
	CLEAR_VARIATION_FORM_NOTIFICATIONS,
	RESET_VARIATION_FORM,
	SET_VARIATION_FORM_MODE,
	SET_EDITING_OPTION,
	SET_OPTION_MODAL_VISIBLE,
	SET_NAME_MODAL_VISIBLE,
	SET_ORIGINAL_VALUES
} from '../actions/variation-form.actions'
import I18n from '../../../i18n/i18n'

export interface VariationFormState {
	mode: VariationFormMode
	variationId?: string
	variationName: string
	options: VariationFormOption[]
	isLoading: boolean
	notifications: KyteNotificationProps[]
	editingOption: VariationFormOption | null
	isOptionModalVisible: boolean
	isNameModalVisible: boolean
	originalVariationName?: string
	originalOptions?: VariationFormOption[]
}

const initialState: VariationFormState = {
	mode: 'create',
	variationId: undefined,
	variationName: '',
	options: [],
	isLoading: false,
	notifications: [],
	editingOption: null,
	isOptionModalVisible: false,
	isNameModalVisible: false,
	originalVariationName: undefined,
	originalOptions: undefined
}

const ensureOptionsHaveId = (options: VariationFormOption[]): VariationFormOption[] => {
	return options.map((option, index) => ({
		...option,
		id: option.id || `option_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
	}))
}

export const variationFormReducer = (
	state = initialState,
	action: VariationFormActionTypes
): VariationFormState => {
	switch (action.type) {
		case SET_VARIATION_FORM_NAME:
		
			return {
				...state,
				variationName: action.payload
			}

		case SET_VARIATION_FORM_OPTIONS:
			return {
				...state,
				options: ensureOptionsHaveId(action.payload)
			}

		case ADD_VARIATION_FORM_OPTION: {
			const newOption = {
				...action.payload,
				id: action.payload.id || `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
			}
			return {
				...state,
				options: [...state.options, newOption]
			}
		}

		case UPDATE_VARIATION_FORM_OPTION: {
			const { optionId, updatedOption } = action.payload
			
			const shouldUpdateOption = (option: VariationFormOption, optionId: string | number) => {
				if (option.id && optionId && option.id === optionId) return true
				if (option.title === optionId) return true
				return false
			}
			
			return {
				...state,
				options: state.options.map(option => {
					if (shouldUpdateOption(option, optionId)) {
						return { ...option, ...updatedOption }
					}
					return option
				})
			}
		}

		case DELETE_VARIATION_FORM_OPTION: {
			const { optionId, optionTitle } = action.payload
			
			const shouldKeepOption = (option: VariationFormOption) => {
				if (optionId && option.id) return option.id !== optionId
				return option.title !== optionTitle
			}
			
			const filteredOptions = state.options.filter(shouldKeepOption)

			const deletionNotification: KyteNotificationProps = {
				title: I18n.t('variants.optionRemoved', { optionName: optionTitle }),
				type: NotificationType.NEUTRAL,
				timer: 3000,
			}

			return {
				...state,
				options: filteredOptions,
				notifications: [...state.notifications, deletionNotification]
			}
		}

		case SET_VARIATION_FORM_LOADING:
			return {
				...state,
				isLoading: action.payload
			}

		case ADD_VARIATION_FORM_NOTIFICATION:
			const notificationWithId = {
				...action.payload,
				id: Date.now() + Math.random(),
				creationDateTime: Date.now()
			}
			
			return {
				...state,
				notifications: [...state.notifications, notificationWithId]
			}

		case CLEAR_VARIATION_FORM_NOTIFICATIONS:
			return {
				...state,
				notifications: []
			}

		case SET_VARIATION_FORM_MODE:
			return {
				...state,
				mode: action.payload.mode,
				variationId: action.payload.variationId,
				notifications: [],
				editingOption: null,
				isOptionModalVisible: false,
				isNameModalVisible: false
			}

		case SET_EDITING_OPTION:
			return {
				...state,
				editingOption: action.payload
			}

		case SET_OPTION_MODAL_VISIBLE:
			return {
				...state,
				isOptionModalVisible: action.payload,
				editingOption: action.payload ? state.editingOption : null
			}

		case SET_NAME_MODAL_VISIBLE:
			return {
				...state,
				isNameModalVisible: action.payload
			}

		case SET_ORIGINAL_VALUES:
			return {
				...state,
				originalVariationName: action.payload.variationName,
				originalOptions: action.payload.options
			}

		case RESET_VARIATION_FORM:
			return {
				...initialState
			}

		default:
			return state
	}
}