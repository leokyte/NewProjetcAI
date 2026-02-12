import { useCallback } from 'react'
import { NativeSyntheticEvent, TextInputSubmitEditingEventData } from 'react-native'

type SubmitCallback = () => void

interface UseKeyboardSubmitOptions {
	enabled?: boolean
	dismissKeyboardOnSubmit?: boolean
}

/**
 * Hook to handle keyboard submission in input fields
 *
 * @param callback - Function to be executed when user presses the "done" button on keyboard
 * @param options - Configuration options
 * @param options.enabled - Enables or disables submit behavior (default: true)
 * @param options.dismissKeyboardOnSubmit - Dismisses keyboard after submit (default: true)
 *
 * @returns {Object} Object containing props needed for the input component
 * @returns {Object} submitProps - Props to configure submit behavior
 * @returns {string} submitProps.returnKeyType - Type of keyboard return button
 * @returns {Function} submitProps.onSubmitEditing - Handler for submit event
 * @returns {boolean} submitProps.blurOnSubmit - Controls if input should blur after submit
 *
 * @example
 * const { submitProps } = useKeyboardSubmit(() => {
 *   // your code here
 * }, { enabled: true, dismissKeyboardOnSubmit: true });
 *
 * return <TextInput {...submitProps} />
 */
export const useKeyboardSubmit = (
	callback: SubmitCallback,
	options: UseKeyboardSubmitOptions = {
		enabled: true,
		dismissKeyboardOnSubmit: true,
	}
) => {
	const handleSubmit = useCallback(
		(event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
			if (options.enabled) {
				callback()
			}
		},
		[callback, options.enabled]
	)

	return {
		submitProps: {
			returnKeyType: 'done',
			onSubmitEditing: handleSubmit,
			blurOnSubmit: options.dismissKeyboardOnSubmit,
		},
	}
}
