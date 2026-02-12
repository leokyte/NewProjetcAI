import { useState, useCallback, useEffect } from 'react'
import { Platform } from 'react-native'
import { PERMISSIONS, RESULTS, check } from 'react-native-permissions'

interface UseAudioPermissionOptions {
	audioPermissionRequested: boolean
	setAudioPermissionRequested: (requested: boolean) => void
	onPermissionStatusChange?: (isDenied: boolean) => void
}

export const useAudioPermission = ({
	audioPermissionRequested,
	setAudioPermissionRequested,
	onPermissionStatusChange,
}: UseAudioPermissionOptions) => {
	const [isPermissionDenied, setIsPermissionDenied] = useState(false)

	const checkPermissionStatus = useCallback(async () => {
		const AUDIO_PERMISSION = Platform.select({
			ios: PERMISSIONS.IOS.MICROPHONE,
			android: PERMISSIONS.ANDROID.RECORD_AUDIO,
		})

		if (!AUDIO_PERMISSION) return

		const status = await check(AUDIO_PERMISSION)
    
		// If status is GRANTED, always show mic and reset the requested flag
		if (status === RESULTS.GRANTED) {
			setIsPermissionDenied(false)
			if (audioPermissionRequested) {
				setAudioPermissionRequested(false)
			}
		}
		// If status is BLOCKED, always show muted
		else if (status === RESULTS.BLOCKED) {
			setIsPermissionDenied(true)
		}
		// If status is DENIED and we've requested before, show muted (permanently denied)
		else if (status === RESULTS.DENIED && audioPermissionRequested) {
			setIsPermissionDenied(true)
		}
		// If status is DENIED (first time, never requested), show mic
		else {
			setIsPermissionDenied(false)
		}
	}, [audioPermissionRequested, setAudioPermissionRequested])

	// Method to explicitly set permission as denied (called when user denies permission)
	const setPermissionDenied = useCallback(() => {
		setIsPermissionDenied(true)
	}, [])

	// Check permission on mount
	useEffect(() => {
		checkPermissionStatus()
	}, [checkPermissionStatus])

	// Notify parent when permission status changes
	useEffect(() => {
		onPermissionStatusChange?.(isPermissionDenied)
	}, [isPermissionDenied, onPermissionStatusChange])

	return {
		isPermissionDenied,
		checkPermissionStatus,
		setPermissionDenied,
	}
}

