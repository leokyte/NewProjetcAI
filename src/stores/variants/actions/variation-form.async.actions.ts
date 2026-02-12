import { Dispatch } from 'redux'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import { RootState } from '../../../types/state/RootState'

type AppDispatch = Dispatch<any, any>
import { IVariant, SET_VARIANTS_NOTIFICATIONS } from '../variants.types'
import { logEvent } from '../../../integrations'
import {
	setVariationFormLoading,
	addVariationFormNotification,
	resetVariationForm,
	setOriginalValues,
	VariationFormOption,
} from './variation-form.actions'
import { createVariations } from './wizard-variation.async.actions'
import { updateVariation, updateVariationOptions } from './product-variant.async.actions'
import { toasTimer } from '../../../components/common/KyteNotifications'
import I18n from '../../../i18n/i18n'
import { OptionsPayloadUpdate } from '../../../services/kyte-backend'

const Strings = {
	t_variation_error_name_and_option: I18n.t('error.variationNameAndOptionRequired'),
	t_variation_create_error: I18n.t('errorOptions.failedToCreateVariation'),
	t_variation_update_error: I18n.t('errorOptions.failedToUpdateVariation'),
}

export const createVariationFromForm = () => {
	return async (dispatch: AppDispatch, getState: () => RootState) => {
		const state = getState()
		const { auth } = state
		const { variationName, options, isLoading } = state.variants.variationForm

		if (isLoading) {
			return { success: false }
		}

		const trimmedName = variationName.trim()
		const validOptions = options.filter((opt: VariationFormOption) => opt.title.trim())

		if (!trimmedName || validOptions.length === 0) {
			dispatch(
				addVariationFormNotification({
					title: Strings.t_variation_error_name_and_option,
					type: NotificationType.ERROR,
				})
			)
			return { success: false }
		}

		const existingVariations = state.variants.list || []
		const nameExists = existingVariations.some(
			(variation: any) => variation.name?.toLowerCase() === trimmedName.toLowerCase()
		)

		if (nameExists) {
			dispatch(
				addVariationFormNotification({
					title: `Variation "${trimmedName}" already exists`,
					type: NotificationType.ERROR,
				})
			)
			return { success: false }
		}

		const newVariation: IVariant = {
			name: trimmedName,
			aid: auth?.aid,
			uid: auth?.user?.uid,
			options: validOptions.map((option: VariationFormOption) => ({
				title: option.title,
				id: String(option.id),
				active: true,
			})),
			isPrimary: false,
			active: true,
		}

		dispatch(setVariationFormLoading(true))

		try {
			dispatch(createVariations([newVariation]))

			logEvent('Variation Create', {
				variation_name: trimmedName,
				variation_options: validOptions.map((opt: VariationFormOption) => opt.title.trim()),
				options_count: validOptions.length,
				origin: 'variations_manager',
			})

			const { notifications = [] } = getState().variants ?? {}
			const successNotification = {
				title: I18n.t('successOptions.variationCreated', { variationName: trimmedName }),
				type: NotificationType.SUCCESS,
				timer: toasTimer,
			}
			dispatch({
				type: SET_VARIANTS_NOTIFICATIONS,
				payload: [...notifications, successNotification],
			})

			dispatch(resetVariationForm())

			return { success: true }
		} catch (error) {
			dispatch(
				addVariationFormNotification({
					title: Strings.t_variation_create_error,
					type: NotificationType.ERROR,
				})
			)
			return { success: false, error }
		} finally {
			dispatch(setVariationFormLoading(false))
		}
	}
}

export const updateVariationOptionsForm = (payload: OptionsPayloadUpdate) => {
	return (dispatch: AppDispatch) => dispatch(updateVariationOptions(payload) as any)
}

export const updateVariationFromForm = () => {
	return async (dispatch: AppDispatch, getState: () => RootState) => {
		const state = getState()
		const { variationForm } = state.variants
		const { mode, variationId, variationName, options, isLoading } = variationForm

		if (mode !== 'edit' || !variationId || isLoading) {
			return { success: false, error: 'Invalid conditions' }
		}

		const trimmedName = variationName.trim()
		const validOptions = options.filter((opt: VariationFormOption) => opt.title.trim())

		if (!trimmedName || validOptions.length === 0) {
			dispatch(
				addVariationFormNotification({
					title: Strings.t_variation_error_name_and_option,
					type: NotificationType.ERROR,
				})
			)
			return { success: false, error: 'Invalid form data' }
		}

		const existingVariations = state.variants.list || []
		const nameExists = existingVariations.some((variation: any) => {
			const isCurrentVariation = variation.id === variationId || variation._id === variationId

			return !isCurrentVariation && variation.name?.toLowerCase() === trimmedName.toLowerCase()
		})

		if (nameExists) {
			dispatch(
				addVariationFormNotification({
					title: `Variation "${trimmedName}" already exists`,
					type: NotificationType.ERROR,
				})
			)
			return { success: false }
		}

		const currentVariation = state.variants.variationDetail
		if (!currentVariation) {
			return { success: false, error: 'No current variation' }
		}

		const updatedVariation: IVariant = {
			...currentVariation,
			name: trimmedName,
			options: validOptions.map((option: VariationFormOption) => ({
				title: option.title,
				id: String(option.id),
				active: option.active ?? true,
			})),
		}

		dispatch(setVariationFormLoading(true))

		try {
			await new Promise<void>((resolve, reject) => {
				dispatch(
					updateVariation({
						variation: updatedVariation,
						callback: (error: any) => {
							if (!error) {
								resolve()
								return
							}
							reject(error)
						},
					})
				)
			})

			logEvent('Product Variation Update', {
				variation_id: variationId,
				variation_name: trimmedName,
			})

			const { notifications = [] } = getState().variants ?? {}
			const successNotification = {
				title: I18n.t('successOptions.variationUpdated', { variationName: trimmedName }),
				type: NotificationType.SUCCESS,
				timer: toasTimer,
			}
			dispatch({
				type: SET_VARIANTS_NOTIFICATIONS,
				payload: [...notifications, successNotification],
			})

			dispatch(setOriginalValues(trimmedName, validOptions))

			return { success: true }
		} catch (error) {
			dispatch(
				addVariationFormNotification({
					title: Strings.t_variation_update_error,
					type: NotificationType.ERROR,
				})
			)
			return { success: false, error }
		} finally {
			dispatch(setVariationFormLoading(false))
		}
	}
}
