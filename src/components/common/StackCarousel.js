import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import PropTypes from 'prop-types'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { Caption09, Container, Padding, Row } from '@kyteapp/kyte-ui-components'
import { Platform, TouchableOpacity } from 'react-native'
import { colors } from '../../styles'
import { KyteIcon } from './KyteIcon'

const StackCarousel = forwardRef(({
	carouselKey,
	data,
	renderItem,
	sliderWidth,
	itemWidth,
	layoutCardOffset,
	slideStyle,
	onSnapToItem,
	activeDotIndex,
	layout = 'stack',
	carouselProps,
	containerCustomStyle,
	containerPaginationProps,
	shouldShowArrowsAndIndicator,
}, ref) => {
	const isAndroid = Platform.OS === 'android'
	const carouselRef = useRef(null)
	const arrowButtonStyle = {
		backgroundColor: colors.littleDarkGray,
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
	}
	const shouldInvertCarousel = isAndroid && layout === 'stack'

	// Expose imperative methods to parent component
  useImperativeHandle(ref, () => ({
    snapToItem: (index) => {
      carouselRef.current?.snapToItem(index)
    },
    snapToNext: () => {
      carouselRef.current?.snapToNext()
    },
    snapToPrev: () => {
      carouselRef.current?.snapToPrev()
    }
  }), [])

	const handlePrev = () => {
		if (carouselRef.current) {
			carouselRef.current.snapToPrev()
		}
	}

	const handleNext = () => {
		if (carouselRef.current) {
			carouselRef.current.snapToNext()
		}
	}
	return (
		<Container>
			<Carousel
				ref={carouselRef}
				key={carouselKey}
				firstItem={shouldInvertCarousel ? data.length - 1 : undefined}
				containerCustomStyle={{
					...containerCustomStyle,
					transform: shouldInvertCarousel ? [{ scaleX: -1 }] : undefined,
				}}
				activeSlideAlignment={isAndroid ? 'end' : 'start'}
				data={data}
				renderItem={renderItem}
				sliderWidth={sliderWidth}
				itemWidth={itemWidth}
				layout={layout}
				layoutCardOffset={layoutCardOffset}
				slideStyle={slideStyle}
				inactiveSlideOpacity={1}
				onSnapToItem={onSnapToItem}
				removeClippedSubviews={false}
				{...carouselProps}
			/>
			<Container {...containerPaginationProps}>
				<Pagination
					containerStyle={shouldInvertCarousel && { transform: [{ scaleX: -1 }] }}
					dotsLength={data.length}
					activeDotIndex={activeDotIndex}
					dotStyle={{
						width: data.length > 8 ? 18 : 24,
						height: 4,
						borderRadius: 0,
						marginHorizontal: -6,
						backgroundColor: colors.actionColor,
					}}
					inactiveDotStyle={{
						backgroundColor: '#D9D9D9',
					}}
					inactiveDotOpacity={1}
					inactiveDotScale={1}
				/>
				{shouldShowArrowsAndIndicator && (
					<Container backgroundColor={colors.littleDarkGray} borderRadius={24} position="absolute" right={16}>
						<Padding vertical={4} horizontal={8}>
							<Caption09 color={colors.primaryDarker} textAlign="center">
								{activeDotIndex + 1} / {data.length}
							</Caption09>
						</Padding>
					</Container>
				)}
			</Container>

			{shouldShowArrowsAndIndicator && (
				<Row width="100%" justifyContent="space-between" position="absolute" top="40%" paddingHorizontal={16}>
					{activeDotIndex !== 0 && (
						<TouchableOpacity onPress={handlePrev} style={{ ...arrowButtonStyle, left: 16 }}>
							<KyteIcon name="back-navigation" size={16} color={colors.primaryDarker} />
						</TouchableOpacity>
					)}

					{activeDotIndex !== data.length - 1 && (
						<TouchableOpacity onPress={handleNext} style={{ ...arrowButtonStyle, right: 16 }}>
							<KyteIcon name="nav-arrow-right" size={16} color={colors.primaryDarker} />
						</TouchableOpacity>
					)}
				</Row>
			)}
		</Container>
	)
})

StackCarousel.propTypes = {
	carouselKey: PropTypes.string,
	data: PropTypes.arrayOf(PropTypes.any),
	renderItem: PropTypes.func.isRequired,
	sliderWidth: PropTypes.number,
	itemWidth: PropTypes.number,
	layoutCardOffset: PropTypes.string,
	slideStyle: PropTypes.shape({}),
	onSnapToItem: PropTypes.func,
	activeDotIndex: PropTypes.number,
	carouselProps: PropTypes.shape({}),
	containerCustomStyle: PropTypes.shape({}),
	containerPaginationProps: PropTypes.shape({}),
	shouldShowArrows: PropTypes.bool,
}

StackCarousel.defaultProps = {
	carouselKey: '',
	data: [],
	sliderWidth: 400,
	itemWidth: 400,
	layoutCardOffset: '18',
	slideStyle: {},
	onSnapToItem: () => undefined,
	activeDotIndex: 0,
	carouselProps: {},
	containerCustomStyle: {},
	containerPaginationProps: {},
	shouldShowArrows: false,
}
export default StackCarousel
