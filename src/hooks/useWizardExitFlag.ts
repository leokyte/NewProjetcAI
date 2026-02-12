import { useCallback, useMemo } from 'react'

const sharedRef = { current: false }

const useWizardExitFlag = () => {
	const allowExit = useCallback(() => {
		sharedRef.current = true
	}, [])

	const resetExit = useCallback(() => {
		sharedRef.current = false
	}, [])

	return useMemo(
		() => ({
			allowExitRef: sharedRef,
			allowExit,
			resetExit,
		}),
		[allowExit, resetExit]
	)
}

export default useWizardExitFlag
