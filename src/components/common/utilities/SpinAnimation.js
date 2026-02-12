import React, { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'

const START_VALUE = 0
const END_VALUE = 1
const START_RANGE = '0deg'
const END_RANGE = '360deg'
const DURATION = 500

const SpinAnimation = ({ shouldSpin = false, children }) => {
	const spinValue = useRef(new Animated.Value(START_VALUE)).current

	const spin = spinValue.interpolate({
		inputRange: [START_VALUE, END_VALUE],
		outputRange: [START_RANGE, END_RANGE],
	})

	useEffect(() => {
		if (shouldSpin) {
			Animated.loop(
				Animated.timing(spinValue, {
					toValue: END_VALUE,
					duration: DURATION,
					easing: Easing.linear,
					useNativeDriver: true,
				})
			).start()
		} else {
			Animated.timing(spinValue).stop()
		}
	}, [shouldSpin])

	return <Animated.View style={[{ transform: [{ rotate: spin }] }]}>{children}</Animated.View>
}

export default SpinAnimation
