import { colors } from '@kyteapp/kyte-ui-components'
import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'

/**
 * Animited dots component that resambles a loading animation
 *
 * @param {number} dotSize - Size of the dots
 * @param {string} dotColor - Color of the dots
 * @returns {React.Component} - Animated dots component
 */
const AnimatedDots = ({ dotSize = 10, dotColor = colors.white }) => {
	// Create animated values for the opacity of the three dots
	const opacity1 = useRef(new Animated.Value(0))?.current
	const opacity2 = useRef(new Animated.Value(0))?.current
	const opacity3 = useRef(new Animated.Value(0))?.current

	useEffect(() => {
		const AnimatedFade = (animatedValue, fadeTo) =>
			Animated.timing(animatedValue, {
				toValue: fadeTo,
				duration: 300,
				useNativeDriver: true,
			})

		const loopAnimation = () => {
			Animated.sequence([
				// Dot 1 fades in and out
				AnimatedFade(opacity1, 1),
				AnimatedFade(opacity1, 0),
				// Dot 2 fades in and out
				AnimatedFade(opacity2, 1),
				AnimatedFade(opacity2, 0),
				// Dot 3 fades in and out
				AnimatedFade(opacity3, 1),
				AnimatedFade(opacity3, 0),
			]).start(() => loopAnimation()) // Repeat the sequence
		}

		loopAnimation()
	}, [opacity1, opacity2, opacity3])

	return (
		<View style={styles.container(dotSize)}>
			<Animated.View style={[styles.dot(dotSize, dotColor), { opacity: opacity1 }]} />
			<Animated.View style={[styles.dot(dotSize, dotColor), { opacity: opacity2 }]} />
			<Animated.View style={[styles.dot(dotSize, dotColor), { opacity: opacity3 }]} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: (height) => ({
		flexDirection: 'row',
		height,
	}),
	dot: (size, color) => ({
		width: size,
		height: size,
		borderRadius: size / 2,
		backgroundColor: color,
	}),
})

export default AnimatedDots
