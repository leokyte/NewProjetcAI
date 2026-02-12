import { useEffect, useCallback } from 'react'
import { Keyboard, Platform } from 'react-native'

type KeyboardCallback = () => void

interface UseKeyboardOptions {
	enabled?: boolean
}

/**
 * A hook that listens for keyboard hide events and executes a callback function.
 *
 * @param callback - Function to be executed when the keyboard is hidden
 * @param options - Configuration options
 * @param options.enabled - Whether the keyboard listener is enabled (default: true)
 *
 * @returns An object containing the dismissKeyboard function to manually dismiss the keyboard
 *
 * @example
 * ```tsx
 * const { dismissKeyboard } = useHideKeyboardEvent(() => {
 *   console.log('Keyboard hidden');
 * });
 * ```
 */
export const useHideKeyboardEvent = (callback: KeyboardCallback, options: UseKeyboardOptions = { enabled: true }) => {
	const handleKeyboardEvent = useCallback(() => {
		if (options.enabled) {
			callback()
		}
	}, [callback, options.enabled])

	useEffect(() => {
		if (!options.enabled) return

		const keyboardListener = Keyboard.addListener(
			Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
			handleKeyboardEvent
		)

		return () => {
			keyboardListener.remove()
		}
	}, [handleKeyboardEvent, options.enabled])

	return {
		dismissKeyboard: Keyboard.dismiss,
	}
}
