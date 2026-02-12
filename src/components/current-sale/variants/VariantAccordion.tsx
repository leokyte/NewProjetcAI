import React, { useState } from 'react'
import { Dimensions, Pressable, ScrollView, View } from 'react-native'
import { KyteText, Container, KyteIcon } from '@kyteapp/kyte-ui-components'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { colors } from '../../../styles'
import { CONTENT_BOX_PADDING } from '../../products/variants/tab/product-skus/constants'

interface VariantAccordionProps {
	children: React.ReactNode
	title: string
	selectedOptionTitle?: string
	isOpen: boolean
	onToggle: () => void
	isPrimary?: boolean
	testProps?: any
	reservedSpace?: number
	containerStyles?: object
}

const VariantAccordion = ({
	testProps,
	children,
	title,
	isOpen,
	onToggle,
	selectedOptionTitle,
	reservedSpace = 0,
	containerStyles
}: VariantAccordionProps) => {
	const screenHeight = Dimensions.get('window').height
	const MAX_HEIGHT = screenHeight - reservedSpace
	const height = useSharedValue(0)
	const [contentHeight, setContentHeight] = useState(0)

	const onLayout = (event: any) => {
		const measuredHeight = event.nativeEvent.layout.height
		setContentHeight(Math.min(measuredHeight, MAX_HEIGHT))
	}

	React.useEffect(() => {
		height.value = withTiming(isOpen ? contentHeight : 0, { duration: 300 })
	}, [isOpen, contentHeight])

	const animatedStyle = useAnimatedStyle(() => ({
		height: height.value,
		overflow: 'hidden',
	}))

	return (
		<Container style={containerStyles} overflow="hidden" backgroundColor={colors.white}>
			{/* Header */}
			<Pressable
				{...testProps}
				onPress={onToggle}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: CONTENT_BOX_PADDING,
					paddingVertical: 17.5,
				}}
			>
				<Container flex={1}>
					<KyteText size={14} weight={500} color={colors.primaryDarker}>
						{title}
						{selectedOptionTitle && (
							<>
								:{' '}
								<KyteText size={14} weight={500} color={colors.green01}>
									{selectedOptionTitle}
								</KyteText>
							</>
						)}
					</KyteText>
				</Container>

				<Container width={CONTENT_BOX_PADDING} height={CONTENT_BOX_PADDING}>
					<KyteIcon name={isOpen ? 'nav-arrow-up' : 'nav-arrow-down'} size={10} />
				</Container>
			</Pressable>

			{/* Hidden Content */}
			<Animated.View style={[animatedStyle, { backgroundColor: colors.white }]}>
				<ScrollView style={{ maxHeight: MAX_HEIGHT }}>
					<View onLayout={onLayout} style={{ position: 'absolute', opacity: 0 }}>
						{children}
					</View>
					{isOpen && children}
				</ScrollView>
			</Animated.View>
		</Container>
	)
}

export default VariantAccordion
