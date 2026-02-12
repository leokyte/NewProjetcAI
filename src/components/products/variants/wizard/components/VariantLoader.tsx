import React from 'react'
import { Container, colors } from '@kyteapp/kyte-ui-components'
import { ActivityIndicator } from 'react-native'

// TO-DO: Temporary loader, this will be an animation
const VariantLoader = () => (
	<Container
		position="absolute"
		top={0}
		left={0}
		bottom={0}
		right={0}
		backgroundColor={'rgba(255, 255, 255, 0.5)'}
		flex={1}
		justifyContent="center"
		alignItems="center"
		zIndex={999}
	>
		<ActivityIndicator size="large" color={colors.green03Kyte} />
	</Container>
)

export default VariantLoader
