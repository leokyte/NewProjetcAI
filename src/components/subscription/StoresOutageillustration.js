import React from 'react'
import { Image } from 'react-native'
import { Margin, Container } from '@kyteapp/kyte-ui-components'
import AnimatedDots from '../common/animations/AnimatedDots'
import { GooglePlayImage } from '../../../assets/images/app-services/google-play'
import { AppStoreImage } from '../../../assets/images/app-services/app-store'

/**
 * Animated illustration of the app stores
 * @param {number} imageSize - Size of the image
 * @returns {JSX.Element}
 */
const StoresOutageillustration = ({ imageSize = 180 }) => {
	const isAndroid = Platform.OS === 'android'
	const appImage = isAndroid ? GooglePlayImage : AppStoreImage
	const dotsRightPosition = isAndroid ? 35 : 18

	return (
		<>
			{/* Negative margin to avoid image whitespace */}
			<Margin width={imageSize} position="relative" vertical={-30}>
				<Container alignSelf="flex-end" zIndex={100} top={42} right={dotsRightPosition} position="absolute">
					<AnimatedDots />
				</Container>
				<Image source={{ uri: appImage }} style={{ width: imageSize, height: imageSize }} resizeMode={'contain'} />
			</Margin>
		</>
	)
}

export default StoresOutageillustration
