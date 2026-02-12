import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Animated, PanResponder, StyleSheet } from 'react-native'

const AnimatedBottomSheet = React.forwardRef(({ snapPoints = [], index = 0, onChange, children, style }, ref) => {
	const heightValues = useMemo(() => {
		if (!snapPoints.length) {
			return [0]
		}

		const sorted = snapPoints
			.map((value, originalIndex) => ({ value, originalIndex }))
			.sort((a, b) => a.value - b.value)

		const mapped = new Array(sorted.length)
		sorted.forEach((entry, order) => {
			const mirrored = sorted[sorted.length - 1 - order]
			mapped[entry.originalIndex] = mirrored.value
		})

		return mapped
	}, [snapPoints])

	const resolvedIndex = heightValues[index] != null ? index : 0
	const animatedHeight = useRef(new Animated.Value(heightValues[resolvedIndex])).current
	const currentIndexRef = useRef(resolvedIndex)
	const startHeightRef = useRef(heightValues[resolvedIndex])

	const minHeight = useMemo(() => Math.min(...heightValues), [heightValues])
	const maxHeight = useMemo(() => Math.max(...heightValues), [heightValues])

	const clampHeight = useCallback((value) => Math.min(Math.max(value, minHeight), maxHeight), [minHeight, maxHeight])

	const getClosestIndex = useCallback(
		(value) => {
			let closestIndex = 0
			let smallestDiff = Infinity

			heightValues.forEach((point, idx) => {
				const diff = Math.abs(point - value)
				if (diff < smallestDiff) {
					smallestDiff = diff
					closestIndex = idx
				}
			})

			return closestIndex
		},
		[heightValues]
	)

	const animateToIndex = useCallback(
		(nextIndex, { notify = true } = {}) => {
			const target = heightValues[nextIndex]
			if (target == null) {
				return
			}

			if (currentIndexRef.current === nextIndex) {
				if (notify) {
					onChange?.(nextIndex)
				}
				return
			}

			currentIndexRef.current = nextIndex
			Animated.timing(animatedHeight, {
				toValue: target,
				duration: 250,
				useNativeDriver: false,
			}).start()

			if (notify) {
				onChange?.(nextIndex)
			}
		},
		[animatedHeight, onChange, heightValues]
	)

	useImperativeHandle(
		ref,
		() => ({
			snapToIndex: (nextIndex) => animateToIndex(nextIndex),
		}),
		[animateToIndex]
	)

	useEffect(() => {
		if (index !== currentIndexRef.current && heightValues[index] != null) {
			animateToIndex(index, { notify: false })
		}
	}, [index, animateToIndex, heightValues])

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 2,
				onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 2,
				onPanResponderGrant: () => {
					animatedHeight.stopAnimation((value) => {
						startHeightRef.current = value ?? heightValues[currentIndexRef.current]
					})
				},
				onPanResponderMove: (_, gesture) => {
					const nextHeight = clampHeight(startHeightRef.current - gesture.dy)
					animatedHeight.setValue(nextHeight)
				},
				onPanResponderRelease: (_, gesture) => {
					const nextHeight = clampHeight(startHeightRef.current - gesture.dy)
					const closestIndex = getClosestIndex(nextHeight)
					animateToIndex(closestIndex)
				},
				onPanResponderTerminate: (_, gesture) => {
					const nextHeight = clampHeight(startHeightRef.current - gesture.dy)
					const closestIndex = getClosestIndex(nextHeight)
					animateToIndex(closestIndex)
				},
			}),
		[animatedHeight, clampHeight, getClosestIndex, animateToIndex][
			(animatedHeight, clampHeight, getClosestIndex, heightValues, animateToIndex)
		]
	)

	return (
		<Animated.View style={[styles.container, style, { height: animatedHeight }]} {...panResponder.panHandlers}>
			{children}
		</Animated.View>
	)
})

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
		overflow: 'hidden',
	},
})

export default AnimatedBottomSheet
