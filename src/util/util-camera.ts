import type { CameraDevice } from 'react-native-vision-camera'

export function findBarcodeReadingCamera(devices: CameraDevice[]): CameraDevice | null {
	if (!devices?.length) return null

	const sortedDevices = [...devices].sort((currentDevice, nextDevice) => {
		if (currentDevice.position === 'back') return -1
		if (nextDevice.position === 'back') return 1
		return 0
	})
	const [camera] = sortedDevices

	return camera ?? null
}
