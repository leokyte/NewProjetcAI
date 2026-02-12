import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { RootState } from '../../../../../types/state/RootState'
import { KyteNotificationProps } from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
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
} from '../../../../../stores/variants/actions/variation-form.actions'
import { createVariationFromForm } from '../../../../../stores/variants/actions/variation-form.async.actions'
import { IVariant } from '../../../../../stores/variants/variants.types'
import { makeErrorNotification } from '../utils/notification'
import I18n from '../../../../../i18n/i18n'

interface VariationCreateContextType {
	// State
	variationName: string
	options: VariationFormOption[]
	isLoading: boolean
	notifications: KyteNotificationProps[]
	canSave: boolean
	editingOption: VariationFormOption | null
	isOptionModalVisible: boolean
	isNameModalVisible: boolean
	isNewVariation: boolean

	// Actions
	setVariationName: (name: string) => void
	setOptions: (options: VariationFormOption[]) => void
	addOption: (option: VariationFormOption) => void
	updateOption: (optionId: string, updatedOption: Partial<VariationFormOption>) => void
	deleteOption: (optionId: string, optionTitle: string) => void
	clearNotifications: () => void
	resetForm: () => void

	// Modal actions
	openOptionModal: (option?: VariationFormOption) => void
	closeOptionModal: () => void
	openNameModal: () => void
	closeNameModal: () => void

	// Form submission
	saveVariation: () => Promise<{ success: boolean; error?: string }>

	// Helpers
	ensureOptionsHaveId: (options: VariationFormOption[]) => VariationFormOption[]
	checkVariationNameExists: (name: string) => boolean
}

const VariationCreateContext = createContext<VariationCreateContextType | null>(null)

export const useVariationCreate = (): VariationCreateContextType => {
	const context = useContext(VariationCreateContext)
	if (!context) {
		throw new Error('useVariationCreate must be used within a VariationCreateProvider')
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
	t_failed_to_create_variation: I18n.t('error.failedToCreateVariation'),
}

const VariationCreateProviderInner: React.FC<ProviderProps> = ({
	children,
	variationForm,
	variationsList,
	...reduxActions
}) => {
	const ensureOptionsHaveId = useCallback((options: VariationFormOption[]): VariationFormOption[] => {
		return options.map((option, index) => ({
			...option,
			id: option.id || `option_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
		}))
	}, [])

	const checkVariationNameExists = useCallback(
		(name: string): boolean => {
			if (!name.trim()) return false
			return variationsList.some(
				(variation: IVariant) => variation.name?.toLowerCase().trim() === name.toLowerCase().trim()
			)
		},
		[variationsList]
	)

	const canSave =
		variationForm.variationName.trim().length > 0 &&
		variationForm.options.length > 0 &&
		!variationForm.isLoading &&
		!checkVariationNameExists(variationForm.variationName)

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

	const saveVariation = useCallback(async () => {
		try {
			if (!variationForm.variationName.trim()) {
				
				reduxActions.addVariationFormNotification(makeErrorNotification({
					message: Strings.t_variation_name_required,
				}))
				return { success: false, error: Strings.t_variation_name_required }
			}

			if (variationForm.options.length === 0) {
				reduxActions.addVariationFormNotification(makeErrorNotification({
					message: Strings.t_at_least_one_option_required,
				}))
				return { success: false, error: Strings.t_at_least_one_option_required }
			}

			if (checkVariationNameExists(variationForm.variationName)) {
				reduxActions.addVariationFormNotification(makeErrorNotification({
					message: Strings.t_variation_name_already_exists,
				}))
				return { success: false, error: Strings.t_variation_name_already_exists }
			}

			const result = await (reduxActions.createVariationFromForm() as any)
			const hasSuccess = result && result.success

			return {
				success: hasSuccess,
				...(!hasSuccess && { error: result?.error || Strings.t_failed_to_create_variation })
			}
		} catch (error) {
			reduxActions.addVariationFormNotification(makeErrorNotification({
				message: Strings.t_failed_to_create_variation,
			}))
			return { success: false, error: Strings.t_failed_to_create_variation }
		}
	}, [variationForm, reduxActions, checkVariationNameExists])

	useEffect(() => {
		reduxActions.resetVariationForm()
	}, [])

	const contextValue: VariationCreateContextType = {
		// State
		variationName: variationForm.variationName,
		options: variationForm.options,
		isLoading: variationForm.isLoading,
		notifications: variationForm.notifications,
		canSave,
		editingOption: variationForm.editingOption,
		isOptionModalVisible: variationForm.isOptionModalVisible,
		isNameModalVisible: variationForm.isNameModalVisible,
		isNewVariation: !variationForm.variationId,

		// Actions
		setVariationName: reduxActions.setVariationFormName,
		setOptions: reduxActions.setVariationFormOptions,
		addOption: reduxActions.addVariationFormOption,
		updateOption: reduxActions.updateVariationFormOption,
		deleteOption: reduxActions.deleteVariationFormOption,
		clearNotifications: reduxActions.clearVariationFormNotifications,
		resetForm: reduxActions.resetVariationForm,

		// Modal actions
		openOptionModal,
		closeOptionModal,
		openNameModal,
		closeNameModal,

		// Form submission
		saveVariation,

		// Helpers
		ensureOptionsHaveId,
		checkVariationNameExists,
	}

	return <VariationCreateContext.Provider value={contextValue}>{children}</VariationCreateContext.Provider>
}

const mapStateToProps = (state: RootState) => ({
	variationForm: state.variants.variationForm,
	variationsList: state.variants.list || [],
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
	createVariationFromForm,
}

const ConnectedVariationCreateProvider = connect(mapStateToProps, mapDispatchToProps)(VariationCreateProviderInner)

export const VariationCreateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <ConnectedVariationCreateProvider>{children}</ConnectedVariationCreateProvider>
}

