import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { connect, Dispatch } from 'react-redux'
import { RootState } from '../../../../../types/state/RootState'
import { KyteNotificationProps } from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import {
	VariationFormOption,
	setVariationFormName,
	setVariationFormOptions,
	addVariationFormOption,
	updateVariationFormOption,
	deleteVariationFormOption,
	setVariationFormLoading,
	addVariationFormNotification,
	clearVariationFormNotifications,
	resetVariationForm,
	setEditingOption,
	setOptionModalVisible,
	setNameModalVisible,
	setOriginalValues,
	setVariationFormMode,
} from '../../../../../stores/variants/actions/variation-form.actions'
import {
	updateVariationFromForm,
	updateVariationOptionsForm,
} from '../../../../../stores/variants/actions/variation-form.async.actions'
import { getVariations } from '../../../../../stores/variants/actions/wizard-variation.async.actions'
import { setVariationDetail } from '../../../../../stores/variants/actions/product-variant.actions'
import { IVariant } from '../../../../../stores/variants/variants.types'
import { OptionsPayloadUpdate } from '../../../../../services/kyte-backend'
import { makeErrorNotification } from '../utils/notification'
import I18n from '../../../../../i18n/i18n'

interface VariationEditContextType {
	// State
	variationId?: string
	variationName: string
	options: VariationFormOption[]
	isLoading: boolean
	notifications: KyteNotificationProps[]
	canSave: boolean
	editingOption: VariationFormOption | null
	isOptionModalVisible: boolean
	isNameModalVisible: boolean
	hasChanges: boolean
	hasOptionsChanges: boolean
	originalVariationName?: string
	originalOptions: VariationFormOption[]
	variationAid?: string

	// Actions
	setVariationName: (name: string) => void
	setOptions: (options: VariationFormOption[]) => void
	addOption: (option: VariationFormOption) => void
	updateOption: (optionId: string, updatedOption: Partial<VariationFormOption>) => void
	deleteOption: (optionId: string, optionTitle: string) => void
	clearNotifications: () => void
	setOriginalValues: (variationName: string, options: VariationFormOption[]) => void
	addNotification: (notification: KyteNotificationProps) => void
	setLoading: (loading: boolean) => void


	// Modal actions
	openOptionModal: (option?: VariationFormOption) => void
	closeOptionModal: () => void
	openNameModal: () => void
	closeNameModal: () => void

	// Form submission
	saveVariation: () => Promise<{ success: boolean; error?: string }>
	updateVariationOptionsForm: (payload: OptionsPayloadUpdate, keepLoading?: boolean) => (dispatch: Dispatch) => Promise<any>
	refreshVariationData: () => Promise<void>

	// Helpers
	ensureOptionsHaveId: (options: VariationFormOption[]) => VariationFormOption[]
	checkVariationNameExists: (name: string, excludeCurrentId?: string) => boolean
}

const VariationEditContext = createContext<VariationEditContextType | null>(null)

export const useVariationEdit = (): VariationEditContextType => {
	const context = useContext(VariationEditContext)
	if (!context) {
		throw new Error('useVariationEdit must be used within a VariationEditProvider')
	}
	return context
}

type ProviderProps = ReturnType<typeof mapStateToProps> &
	typeof mapDispatchToProps & {
		children: React.ReactNode
	}

const Strings = {
	t_variation_name_required: I18n.t('error.variationNameRequired'),
	t_at_least_one_option_required: I18n.t('error.atLeastOneOptionRequired'),
	t_variation_name_already_exists: I18n.t('error.variationNameAlreadyExists'),
	t_failed_to_update_variation: I18n.t('error.failedToUpdateVariation'),
	t_no_variation_id_found: I18n.t('error.noVariationIdFound'),
}

const VariationEditProviderInner: React.FC<ProviderProps> = ({
	children,
	variationForm,
	variationsList,
	variationDetail,
	...reduxActions
}) => {
	const [hasInitialized, setHasInitialized] = useState(false)

	const ensureOptionsHaveId = useCallback((options: VariationFormOption[]): VariationFormOption[] => {
		return options.map((option, index) => ({
			...option,
			id: option.id || `option_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
		}))
	}, [])

	const checkVariationNameExists = useCallback(
		(name: string, excludeCurrentId?: string): boolean => {
			if (!name.trim()) return false

			return variationsList.some((variation: IVariant) => {
				const variationId = variation.id || variation._id

				if (excludeCurrentId && variationId === excludeCurrentId) {
					return false
				}

				return variation.name?.toLowerCase().trim() === name.toLowerCase().trim()
			})
		},
		[variationsList]
	)

	const hasOptionsChanges = useCallback(() => {
		return JSON.stringify(variationForm.options) !== JSON.stringify(variationForm.originalOptions)
	}, [variationForm.options, variationForm.originalOptions])

	const hasChanges = useCallback(() => {
		if (!variationForm.originalVariationName || !variationForm.originalOptions) {
			return false
		}

		const nameChanged = variationForm.variationName !== variationForm.originalVariationName
		const optionsChanged = hasOptionsChanges()

		return nameChanged || optionsChanged
	}, [
		variationForm.variationName,
		variationForm.options,
		variationForm.originalVariationName,
		variationForm.originalOptions,
		hasOptionsChanges,
	])

	const currentVariationId = variationDetail?.id || variationDetail?._id

	const canSave =
		variationForm.variationName.trim().length > 0 &&
		variationForm.options.length > 0 &&
		!variationForm.isLoading &&
		hasChanges() &&
		!checkVariationNameExists(variationForm.variationName, currentVariationId)

	const openOptionModal = useCallback(
		(option?: VariationFormOption) => {
			reduxActions.setEditingOption(option ?? null)

			reduxActions.setOptionModalVisible(true)
		},
		[reduxActions]
	)

	const closeOptionModal = useCallback(() => {
		reduxActions.setOptionModalVisible(false)
		reduxActions.setEditingOption(null)
	}, [reduxActions])

	const openNameModal = useCallback(() => {
		reduxActions.setNameModalVisible(true)
	}, [reduxActions])

	const closeNameModal = useCallback(() => {
		reduxActions.setNameModalVisible(false)
	}, [reduxActions])

	const refreshVariationData = useCallback(async () => {
		const aid = variationDetail?.aid
		if (aid) {
			await (reduxActions.getVariations(aid, undefined, true) as any)
		}
	}, [variationDetail?.aid, reduxActions])

	const saveVariation = useCallback(async () => {
		try {
			if (!currentVariationId) {
				return { success: false, error: Strings.t_no_variation_id_found }
			}

			if (!variationForm.variationName.trim()) {
				reduxActions.addVariationFormNotification(
					makeErrorNotification({
						message: Strings.t_variation_name_required,
					})
				)
				return { success: false, error: Strings.t_variation_name_required }
			}

			if (variationForm.options.length === 0) {
				reduxActions.addVariationFormNotification(
					makeErrorNotification({
						message: Strings.t_at_least_one_option_required,
					})
				)
				return { success: false, error: Strings.t_at_least_one_option_required }
			}

			if (checkVariationNameExists(variationForm.variationName, currentVariationId)) {
				reduxActions.addVariationFormNotification(
					makeErrorNotification({
						message: Strings.t_variation_name_already_exists,
					})
				)

				return { success: false, error: Strings.t_variation_name_already_exists }
			}

			const result = await (reduxActions.updateVariationFromForm() as any)

			const hasSuccess = result && result.success

			return {
				success: hasSuccess,
				...(!hasSuccess && { error: result?.error || Strings.t_failed_to_update_variation }),
			}
		} catch (error) {
			reduxActions.addVariationFormNotification(
				makeErrorNotification({
					message: Strings.t_failed_to_update_variation,
				})
			)
			return { success: false, error: Strings.t_failed_to_update_variation }
		}
	}, [variationForm, reduxActions, checkVariationNameExists, currentVariationId])

	useEffect(() => {
		if (variationDetail && currentVariationId && !hasInitialized) {
			setHasInitialized(true)

			reduxActions.setVariationFormMode('edit', currentVariationId)

			reduxActions.clearVariationFormNotifications()

			reduxActions.setVariationFormName(variationDetail.name || '')

			const optionsWithId = ensureOptionsHaveId(variationDetail.options || [])
			reduxActions.setVariationFormOptions(optionsWithId)

			reduxActions.setOriginalValues(variationDetail.name || '', optionsWithId)
		}
	}, [variationDetail, currentVariationId, hasInitialized, reduxActions, ensureOptionsHaveId])

	useEffect(() => {
		if (!variationDetail || !currentVariationId) {
			setHasInitialized(false)
		}
	}, [variationDetail?.id, variationDetail?._id, currentVariationId])

	const contextValue: VariationEditContextType = {
		// State
		variationId: currentVariationId,
		variationName: variationForm.variationName,
		options: variationForm.options,
		isLoading: variationForm.isLoading,
		notifications: variationForm.notifications,
		canSave,
		editingOption: variationForm.editingOption,
		isOptionModalVisible: variationForm.isOptionModalVisible,
		isNameModalVisible: variationForm.isNameModalVisible,
		hasChanges: hasChanges(),
		hasOptionsChanges: hasOptionsChanges(),
		originalVariationName: variationForm.originalVariationName,
		originalOptions: variationForm.originalOptions || [],
		variationAid: variationDetail?.aid,

		// Actions
		setVariationName: reduxActions.setVariationFormName,
		setOptions: reduxActions.setVariationFormOptions,
		addOption: reduxActions.addVariationFormOption,
		updateOption: reduxActions.updateVariationFormOption,
		deleteOption: reduxActions.deleteVariationFormOption,
		clearNotifications: reduxActions.clearVariationFormNotifications,
		setOriginalValues: reduxActions.setOriginalValues,
		addNotification: reduxActions.addVariationFormNotification,
		setLoading: reduxActions.setVariationFormLoading,

		// Modal actions
		openOptionModal,
		closeOptionModal,
		openNameModal,
		closeNameModal,

		// Form submission
		saveVariation,
		updateVariationOptionsForm: reduxActions.updateVariationOptionsForm,
		refreshVariationData,

		// Helpers
		ensureOptionsHaveId,
		checkVariationNameExists,
	}

	return <VariationEditContext.Provider value={contextValue}>{children}</VariationEditContext.Provider>
}

const mapStateToProps = (state: RootState) => ({
	variationForm: state.variants.variationForm,
	variationsList: state.variants.list || [],
	variationDetail: state.variants.variationDetail,
})

const mapDispatchToProps = {
	setVariationFormName,
	setVariationFormOptions,
	addVariationFormOption,
	updateVariationFormOption,
	deleteVariationFormOption,
	setVariationFormLoading,
	addVariationFormNotification,
	clearVariationFormNotifications,
	resetVariationForm,
	setEditingOption,
	setOptionModalVisible,
	setNameModalVisible,
	setOriginalValues,
	setVariationFormMode,
	updateVariationFromForm,
	updateVariationOptionsForm,
	getVariations,
	setVariationDetail,
}

const ConnectedVariationEditProvider = connect(mapStateToProps, mapDispatchToProps)(VariationEditProviderInner)

export const VariationEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <ConnectedVariationEditProvider>{children}</ConnectedVariationEditProvider>
}
