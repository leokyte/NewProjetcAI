import React, { forwardRef, useCallback } from 'react'
import { Dimensions } from 'react-native'
import { Container, Body18, Body16, Row } from '@kyteapp/kyte-ui-components'
import FastImage from 'react-native-fast-image'
import BottomButton from './BottomButton'
import { KyteIcon } from './KyteIcon'
import { colors } from '../../styles'
import StackCarousel from './StackCarousel'

const OnboardingCarousel = forwardRef(
	({ handleSnapItem, activeSlide, hiddenIcon = false, data, textButton, onPress, bottomButtonBg }, ref) => {
		const screenWidth = Dimensions.get('window').width
		const screenHeight = Dimensions.get('window').height
		const imageMargin = 32
		const imageSize = screenWidth - 46 - imageMargin
		const paginationOffset = screenHeight * 0.49

		const renderItem = useCallback(
			({ item }) => (
				<Container
					style={{
						flexGrow: 1,
					}}
					top={screenHeight * 0.08}
				>
					<FastImage
						source={{
							uri: item.image,
							priority: FastImage.priority.high,
							cache: FastImage.cacheControl.immutable,
						}}
						style={{ 
							width: imageSize, 
							height: imageSize, 
							alignSelf: 'center'
						}}
					/>

					<Container alignItems="center" marginTop={101} marginBottom={27} flex={1}>
						<Body18 weight={600} lineHeight={25} marginBottom={5}>
							{item.title}
						</Body18>
						<Body16 textAlign="center" lineHeight={24}>
							{item.paragraph}
						</Body16>
					</Container>
				</Container>
			),
			[screenWidth]
		)

		return (
			<Container flex={1}>
				<Container flex={1}>
					<StackCarousel
						key="onboarding"
						data={data}
						renderItem={renderItem}
						sliderWidth={screenWidth}
						itemWidth={screenWidth - imageMargin}
						ref={ref}
						onSnapToItem={(index) => {
							handleSnapItem(index)
						}}
						activeDotIndex={activeSlide}
						shouldShowArrowsAndIndicator
						layout="default"
						containerCustomStyle={{
							height: '100%',
						}}
						carouselProps={{
							activeSlideAlignment: 'center',
						}}
						containerPaginationProps={{
							position: 'absolute',
							alignSelf: 'center',
							top: paginationOffset,
							width: '100%',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'row',
						}}
					/>
				</Container>

				<BottomButton
					bgColor={bottomButtonBg}
					onPress={() => onPress(activeSlide)}
					textStyle={{
						flex: 0,
					}}
				>
					<Row alignItems="center" justifyContent="center">
						{!hiddenIcon && <KyteIcon name="plus-thin" size={18} color={colors.white} />}
						<Body16 color={colors.white} weight={600} marginLeft={5}>
							{textButton}
						</Body16>
					</Row>
				</BottomButton>
			</Container>
		)
	}
)

export default OnboardingCarousel
