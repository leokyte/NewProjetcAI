import { Image } from 'react-native'
import { createSound } from 'react-native-nitro-sound'

const barcodeBeepSound = createSound()
const barcodeBeepAsset = Image.resolveAssetSource(
	require('../../assets/images/sounds/barcode-beep.mp3')
)
const barcodeBeepUri = barcodeBeepAsset?.uri ?? null

export async function playBarcodeBeep() {
	if (!barcodeBeepUri) return

	try {
		await barcodeBeepSound.stopPlayer()
	} catch (error) {
		// stopPlayer throws if nothing is playing; ignore
	}

	try {
		await barcodeBeepSound.startPlayer(barcodeBeepUri)
	} catch (error) {
		console.warn('[sound] failed to play barcode beep', error)
	}
}

