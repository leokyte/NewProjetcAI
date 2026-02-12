import { useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import { OptionsPayloadUpdate } from '../../../../../services/kyte-backend'
import { VariationFormOption } from '../../../../../stores/variants/actions/variation-form.actions'
import I18n from '../../../../../i18n/i18n'
import { Dispatch } from 'react-redux'

const Strings = {
	t_updating_options: I18n.t('info.updatingOptions'),
	t_options_update_failed: I18n.t('errorOptions.failedToUpdateOptions'),
}

type PromiseSettledResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult

interface PromiseFulfilledResult<T> {
	status: 'fulfilled'
	value: T
}

interface PromiseRejectedResult {
	status: 'rejected'
	reason: any
}

interface UseVariationSaveParams {
	hasOptionsChanges: boolean
	variationAid?: string
	variationId?: string
	originalOptions: VariationFormOption[]
	options: VariationFormOption[]
	setOptions: (options: VariationFormOption[]) => void
	setLoading: (loading: boolean) => void
	addNotification: (notification: any) => void
	clearNotifications: () => void
	saveVariation: () => Promise<{ success: boolean; error?: string }>
	updateVariationOptionsForm: (payload: OptionsPayloadUpdate) => (dispatch: Dispatch) => Promise<any>
	refreshVariationData: () => Promise<void>
}

// Helper functions for option processing
const getOptionId = (option: VariationFormOption): string | null => {
	const id = option?.id
	return id === undefined || id === null ? null : String(id)
}

const getOptionTitle = (option: VariationFormOption): string => {
	return (option?.title || '').trim()
}

const buildOptionMap = (options: VariationFormOption[]) => {
	return options.reduce((map, option, index) => {
		const id = getOptionId(option)
		if (id) {
			map.set(id, { option, index })
		}
		return map
	}, new Map<string, { option: VariationFormOption; index: number }>())
}

const createRenamePayload = (
	aid: string,
	variationId: string,
	originalTitle: string,
	newTitle: string
): OptionsPayloadUpdate => ({
	aid,
	variationId,
	currentTitle: originalTitle,
	newTitle,
})

const findChangedOptions = (
	currentOptions: VariationFormOption[],
	originalMap: Map<string, { option: VariationFormOption; index: number }>,
	aid: string,
	variationId: string
): OptionsPayloadUpdate[] => {
	return currentOptions.reduce<OptionsPayloadUpdate[]>((payloads, currentOption) => {
		const optionId = getOptionId(currentOption)
		if (!optionId) return payloads

		const originalEntry = originalMap.get(optionId)
		if (!originalEntry) return payloads

		const currentTitle = getOptionTitle(currentOption)
		const originalTitle = getOptionTitle(originalEntry.option)

		if (originalTitle !== currentTitle) {
			payloads.push(createRenamePayload(aid, variationId, originalTitle, currentTitle))
		}

		return payloads
	}, [])
}

const buildRenamePayloads = (
	hasChanges: boolean,
	variationAid: string | undefined,
	variationId: string | undefined,
	originalOptions: VariationFormOption[],
	currentOptions: VariationFormOption[]
): OptionsPayloadUpdate[] => {
	const canUpdate = Boolean(variationAid && variationId)
	if (!hasChanges || !canUpdate) return []

	const originalMap = buildOptionMap(originalOptions)
	return findChangedOptions(currentOptions, originalMap, variationAid as string, variationId as string)
}

// Helper functions for error handling
const handleRejectedResult = (
	result: PromiseSettledResult<any>,
	index: number,
	addNotification: (notification: any) => void
) => {
	if (result.status === 'rejected') {
		const reason = 'reason' in result ? result.reason : 'Unknown error'
		addNotification({
			title: `Option ${index} error: ${reason}`,
			type: NotificationType.ERROR,
			timer: 500,
		})
	}
}

const processUpdateResults = (
	results: PromiseSettledResult<any>[],
	addNotification: (notification: any) => void,
	clearNotifications: () => void
): boolean => {
	const rejectedResults = results.filter((result) => result.status === 'rejected')

	if (rejectedResults.length === 0) return true

	rejectedResults.forEach((result, index) => handleRejectedResult(result, index, addNotification))

	clearNotifications()
	addNotification({
		title: Strings.t_options_update_failed,
		type: NotificationType.ERROR,
		timer: 5000,
	})

	return false
}

const applyTitleUpdates = (
	options: VariationFormOption[],
	renamePayloads: OptionsPayloadUpdate[]
): VariationFormOption[] => {
	return options.map((option) => {
		const currentTitle = getOptionTitle(option)
		const renamePayload = renamePayloads.find((p) => p.currentTitle === currentTitle)

		return renamePayload ? { ...option, title: renamePayload.newTitle } : option
	})
}

const executeOptionUpdates = async (
	payloads: OptionsPayloadUpdate[],
	updateFn: (payload: OptionsPayloadUpdate) => (dispatch: Dispatch) => Promise<any>,
	setLoading: (loading: boolean) => void,
	addNotification: (notification: any) => void,
	clearNotifications: () => void
): Promise<boolean> => {
	if (payloads.length === 0) return true

	setLoading(true)
	addNotification({
		title: Strings.t_updating_options,
		type: NotificationType.NEUTRAL,
	})

	const results = await Promise.allSettled(payloads.map(updateFn))
	const success = processUpdateResults(results, addNotification, clearNotifications)

	if (!success) {
		setLoading(false)
	}

	return success
}

export const useVariationSave = (params: UseVariationSaveParams) => {
	const navigation = useNavigation()
	const {
		hasOptionsChanges,
		variationAid,
		variationId,
		originalOptions,
		options,
		setOptions,
		setLoading,
		addNotification,
		clearNotifications,
		saveVariation,
		updateVariationOptionsForm,
		refreshVariationData,
	} = params

	const handleSave = useCallback(async () => {
		// STEP 1: Build payloads for option title changes
		const renamePayloads = buildRenamePayloads(hasOptionsChanges, variationAid, variationId, originalOptions, options)

		// STEP 2: Execute option updates (if any)
		const updateSuccess = await executeOptionUpdates(
			renamePayloads,
			updateVariationOptionsForm,
			setLoading,
			addNotification,
			clearNotifications
		)

		if (!updateSuccess) return

		// STEP 3: Update local state with new option titles
		if (renamePayloads.length > 0) {
			const updatedOptions = applyTitleUpdates(options, renamePayloads)
			setOptions(updatedOptions)
			clearNotifications()
			setLoading(false)
		}

		// STEP 4: Save variation with complete options array
		const result = await saveVariation()
		const isSuccess = result?.success === true

		if (isSuccess) {
			await refreshVariationData()
			setLoading(false)
			navigation.goBack()
			return
		}

		setLoading(false)
	}, [
		hasOptionsChanges,
		variationAid,
		variationId,
		originalOptions,
		options,
		setOptions,
		setLoading,
		addNotification,
		clearNotifications,
		saveVariation,
		updateVariationOptionsForm,
		refreshVariationData,
		navigation,
	])

	return { handleSave }
}
