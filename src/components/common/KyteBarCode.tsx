import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import { View, Vibration, Platform, StyleSheet } from 'react-native'
import { Camera, useCameraDevices, useCodeScanner, CodeType } from 'react-native-vision-camera'
import { colors } from '../../styles'
import { requestPermission } from '../../util/util-permissions'
import { CAMERA } from '../../enums/Permission'
import { findBarcodeReadingCamera } from '../../util/util-camera'
import { RootState } from 'src/types/state/RootState'
import { playBarcodeBeep } from '../../util/sounds'

let lastRead = new Date('1999')
const COMMON_CODE_TYPES: CodeType[] = [
	'qr',
	'ean-13',
	'ean-8',
	'code-128',
	'code-39',
	'code-93',
	'itf',
	'codabar',
	'data-matrix',
	'pdf-417',
	'aztec',
	'upc-e',
	'upc-a',
]
const IOS_CODE_TYPES: CodeType[] = COMMON_CODE_TYPES.concat([
	'gs1-data-bar',
	'gs1-data-bar-limited',
	'gs1-data-bar-expanded',
	'itf-14',
])
const CODE_TYPES: CodeType[] = Platform.select({ android: COMMON_CODE_TYPES, ios: IOS_CODE_TYPES }) || COMMON_CODE_TYPES
const KBC = (props: any) => {
	const [hasCameraPermission, setHasCameraPermission] = useState(false)
	const devices = useCameraDevices()
	const device = useMemo(() => findBarcodeReadingCamera(devices), [devices])

	useEffect(() => {
		let isMounted = true
		async function setupPermissions() {
			const granted = await requestPermission(CAMERA)
			const visionStatus = Camera.getCameraPermissionStatus()
			const isVisionGranted = visionStatus === 'granted' || visionStatus === 'authorized'
			const visionGrant = isVisionGranted ? visionStatus : await Camera.requestCameraPermission()
			const grantedVisionStatus = visionGrant === 'granted' || visionGrant === 'authorized'

			if (isMounted) {
				setHasCameraPermission(Boolean(granted) && grantedVisionStatus)
			}
		}

		setupPermissions()

		return () => {
			isMounted = false
		}
	}, [])

	const handleBarcodeRead = useCallback(
		(data: any) => {
			const now = new Date()
			if (lastRead.getTime() + 2500 > now.getTime()) return

			lastRead = new Date()
			props.onBarcodeRead(data)

			if (props.barcodeBeep) playBarcodeBeep()
			else Vibration.vibrate(300)
		},
		[props.onBarcodeRead, props.barcodeBeep]
	)

	const onCodeScanned = useCallback(
		(codes: any) => {
			if (!codes?.length) return

			let nextValue = null
			for (const code of codes) {
				const candidate = code?.value ?? code?.rawValue ?? code?.displayValue ?? null
				if (candidate) {
					nextValue = candidate
					break
				}
			}

			if (nextValue) {
				handleBarcodeRead(nextValue)
			}
		},
		[handleBarcodeRead]
	)

	const codeScanner = useCodeScanner({
		codeTypes: CODE_TYPES,
		onCodeScanned,
	})

	const renderScanner = () => {
		if (!device) return null

		return (
			<Camera
				style={StyleSheet.absoluteFill}
				device={device}
				isActive={props.isVisible}
				audio={false}
				codeScanner={props.isVisible ? codeScanner : undefined}
			/>
		)
	}

	return (
		<View style={[{ height: props.height }, Platform.select({ android: { overflow: 'hidden' } })]}>
			{props.isVisible && hasCameraPermission ? renderScanner() : null}
			<View
				style={{
					backgroundColor: colors.barcodeRed,
					height: 2,
					position: 'absolute',
					width: '100%',
					top: '50%',
				}}
			/>
		</View>
	)
}

const KyteBarCode = connect(({ common }: RootState) => ({ barcodeBeep: common.barcodeBeep }))(KBC)

export { KyteBarCode }
