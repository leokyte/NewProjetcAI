import React, { useState, useCallback } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Icon } from 'react-native-elements'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	runOnJS,
	interpolateColor,
} from 'react-native-reanimated'

import { colors } from '../../styles'
import { KyteText } from './KyteText'
import I18n from '../../i18n/i18n'

const THUMB_SIZE = 50
const THUMB_BORDER = 3
const CONTAINER_BORDER = 1.3
const SWIPE_THRESHOLD = 0.7 // 70% of the track to trigger success
const ANIMATION_DURATION = 300

const KyteSwipeButton = (props) => {
	const [isFilled, setIsFilled] = useState(false)
	const [containerWidth, setContainerWidth] = useState(0)

	const GENERAL_COLOR = props.showDisabled ? colors.lightBorder : colors.actionColor

	// Shared values for reanimated
	const translateX = useSharedValue(0)
	const isActive = useSharedValue(false)

	const maxTranslateX = containerWidth - THUMB_SIZE - (CONTAINER_BORDER * 2)

	const onSwipeStart = useCallback(() => {
		if (props.onSwipeStart) props.onSwipeStart()
	}, [props.onSwipeStart])

	const onSwipeFail = useCallback(() => {
		if (props.onSwipeFail) props.onSwipeFail()
	}, [props.onSwipeFail])

	const onSwipeSuccess = useCallback(() => {
		setIsFilled(true)
		if (props.onSwipeSuccess) props.onSwipeSuccess()
	}, [props.onSwipeSuccess])

	const resetPosition = useCallback(() => {
		translateX.value = withTiming(0, { duration: ANIMATION_DURATION })
	}, [])

	const completeSwipe = useCallback(() => {
		translateX.value = withTiming(maxTranslateX, { duration: ANIMATION_DURATION / 2 }, () => {
			runOnJS(onSwipeSuccess)()
			// Reset after success
			translateX.value = withTiming(0, { duration: ANIMATION_DURATION })
		})
	}, [maxTranslateX, onSwipeSuccess])

	const panGesture = Gesture.Pan()
		.enabled(!props.disabled)
		.onStart(() => {
			isActive.value = true
			runOnJS(onSwipeStart)()
		})
		.onUpdate((event) => {
			const newValue = Math.max(0, Math.min(event.translationX, maxTranslateX))
			translateX.value = newValue
		})
		.onEnd((event) => {
			isActive.value = false
			const progress = translateX.value / maxTranslateX

			if (progress >= SWIPE_THRESHOLD) {
				runOnJS(completeSwipe)()
			} else {
				translateX.value = withTiming(0, { duration: ANIMATION_DURATION })
				runOnJS(onSwipeFail)()
			}
		})

	const thumbAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}))

	const fillAnimatedStyle = useAnimatedStyle(() => ({
		// Fill track covers from left edge to current thumb position
		// Hidden at rest (opacity 0), visible when swiping
		width: translateX.value + THUMB_SIZE,
		opacity: translateX.value > 2 ? 1 : 0,
		backgroundColor: GENERAL_COLOR,
	}))

	const handleLayout = useCallback((event) => {
		setContainerWidth(event.nativeEvent.layout.width)
	}, [])

	const renderSwipe = () => (
		<View
			style={[
				styles.container,
				{
					borderColor: GENERAL_COLOR,
					opacity: props.disabled ? 0.5 : 1,
				},
			]}
			onLayout={handleLayout}
		>
			{/* Title */}
			<View style={styles.titleContainer}>
				<KyteText
					size={18}
					weight="Medium"
					color={GENERAL_COLOR}
					style={styles.title}
				>
					{props.title || I18n.t('SlideToConfirmLabel')}
				</KyteText>
			</View>

			{/* Fill track (animated) */}
			<Animated.View style={[styles.fillTrack, fillAnimatedStyle]} />

			{/* Thumb (draggable) */}
			<GestureDetector gesture={panGesture}>
				<Animated.View
					style={[
						styles.thumb,
						{ backgroundColor: GENERAL_COLOR },
						thumbAnimatedStyle,
					]}
				>
					<Icon name="keyboard-arrow-right" color="#FFF" size={30} />
				</Animated.View>
			</GestureDetector>
		</View>
	)

	const renderSwipeSuccess = () => (
		<TouchableOpacity
			activeOpacity={0.8}
			style={styles.swipeSuccess}
			onPress={() => {
				if (props.onSwipeSuccess) props.onSwipeSuccess()
			}}
		>
			<KyteText size={18} weight="Medium" color="#FFF" style={styles.swipeSuccessText}>
				{props.swipeTextSuccess || I18n.t('receiptFinishedSale')}
			</KyteText>
			<Icon name="chevron-right" color="#FFF" size={28} />
		</TouchableOpacity>
	)

	return (
		<View style={styles.wrapper}>
			{isFilled || props.isFilled ? renderSwipeSuccess() : renderSwipe()}
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		paddingHorizontal: 10,
		bottom: 3,
	},
	container: {
		height: 54,
		borderRadius: 50,
		borderWidth: CONTAINER_BORDER,
		backgroundColor: '#FFF',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	titleContainer: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		paddingLeft: THUMB_SIZE,
	},
	title: {
		fontFamily: 'Graphik-Medium',
	},
	fillTrack: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		borderRadius: 50,
	},
	thumb: {
		position: 'absolute',
		left: 0,
		width: THUMB_SIZE,
		height: THUMB_SIZE,
		borderRadius: THUMB_SIZE / 2,
		borderWidth: THUMB_BORDER,
		borderColor: '#FFF',
		justifyContent: 'center',
		alignItems: 'center',
	},
	swipeSuccess: {
		height: 54,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'stretch',
		paddingHorizontal: 10,
		backgroundColor: colors.actionColor,
		borderRadius: 50,
	},
	swipeSuccessText: {
		flex: 1,
		textAlign: 'center',
		fontFamily: 'Graphik-Medium',
		fontSize: 18,
		paddingLeft: 15,
	},
})

export default React.memo(KyteSwipeButton)
