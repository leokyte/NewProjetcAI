import React, { useEffect, useMemo, useRef } from 'react'
import { Platform, Image, StyleSheet, Animated, Easing, View } from 'react-native'
import { Container, Padding, Row, KyteText, Center, KyteSwitch, colors } from '@kyteapp/kyte-ui-components'
import { IVariant } from '../../../../../stores/variants/variants.types'
import KyteBaseButton from '../../../../common/buttons/KyteBaseButton'
import TwistedArrowIllustration from '../../../../../../assets/images/common/twisted-arrow'
import { renderBoldText } from '../../../../../util'
import I18n from '../../../../../i18n/i18n'

interface VariantChooseMainExampleProps {
	chosenVariations: IVariant[]
}

const Strings = {
	t_variant_photo: I18n.t('variantsWizard.variantPhoto'),
}

const CONTENT_SPACING = 20
const PHOTO_BUTTON_SIZE = 50
const PHOTO_BUTTON_CONTENT_SIZE = 30
const ARROW_IMAGE_SIZE = 90
const BORDER_RADIUS = CONTENT_SPACING / 2
const ANIMATION_DURATION = 350
const SHADOW_MIN_OPACITY = 0.05
const SHADOW_MIN_ELEVATION = 16
const SHADOW_MAX_OPACITY = 0.2
const SHADOW_MAX_ELEVATION = 48
const BUTTON_ANIMATION_DISTANCE = 82

const styles = StyleSheet.create({
	buttonContainer: {
		width: PHOTO_BUTTON_SIZE,
		height: PHOTO_BUTTON_SIZE,
	},
	image: { width: ARROW_IMAGE_SIZE, height: ARROW_IMAGE_SIZE },
	shadow: {
		marginTop: CONTENT_SPACING * 2,
		minWidth: '95%',
		borderRadius: BORDER_RADIUS,
		backgroundColor: colors.white,
		...Platform.select({
			ios: {
				shadowOffset: {
					width: 20,
					height: 32,
				},
				shadowOpacity: 0.2,
				shadowRadius: 20,
			},
			android: {
				elevation: 32,
			},
		}),
	},
})

const VariantChooseMainExample: React.FC<VariantChooseMainExampleProps> = ({ chosenVariations = [] }) => {
	const { primaryVariationIndex, nonPrimaryVariants } = useMemo(() => {
		let index = -1

		const nonPrimaryVariants = chosenVariations.filter((variation, currentIndex) => {
			if (variation.isPrimary && index === -1) index = currentIndex

			return !variation.isPrimary
		})

		return { primaryVariationIndex: index, nonPrimaryVariants }
	}, [chosenVariations])
	// Animated value for shadow
	const shadowAnim = useRef(new Animated.Value(1)).current
	const buttonAnim = useRef(new Animated.Value(0)).current // 0: at rest, 1: moved down
	const primaryTextAnim = useRef(new Animated.Value(0)).current // 0: at rest, 1: swapped
	const secondaryTextAnim = useRef(new Animated.Value(0)).current // 0: at rest, 1: swapped
	const [primaryTextPos, setPrimaryTextPos] = React.useState({ x: 0, y: 0 })
	const [secondaryTextPos, setSecondaryTextPos] = React.useState({ x: 0, y: 0 })
	const [swapActive, setSwapActive] = React.useState(false)

	const primaryTextRef = useRef<View | null>(null)
	const secondaryTextRef = useRef<View | null>(null)

	const getPrimaryVariation = (params: {
		chosenVariations: typeof chosenVariations
		primaryVariationIndex: number
		nonPrimaryVariants: typeof nonPrimaryVariants
	}) => {
		return params.chosenVariations[params.primaryVariationIndex] || params.nonPrimaryVariants[0]
	}

	const getSecondaryVariation = (params: {
		primaryVariationIndex: number
		nonPrimaryVariants: typeof nonPrimaryVariants
	}) => {
		const hasPrimaryVariation = primaryVariationIndex !== -1

		return hasPrimaryVariation ? params.nonPrimaryVariants[0] : params.nonPrimaryVariants[1]
	}

	const primaryVariationRef = useRef(
		getPrimaryVariation({ chosenVariations, primaryVariationIndex, nonPrimaryVariants })
	)
	const secondaryVariationRef = useRef(getSecondaryVariation({ primaryVariationIndex, nonPrimaryVariants }))

	// Grouped animation function
	const triggerSwapAnimation = React.useCallback(
		(duration = ANIMATION_DURATION) => {
			setSwapActive(true)
			Animated.parallel([
				// Shadow reset
				Animated.sequence([
					Animated.timing(shadowAnim, {
						toValue: 0,
						duration: duration,
						easing: Easing.out(Easing.quad),
						useNativeDriver: false,
					}),
					Animated.timing(shadowAnim, {
						toValue: 1,
						duration: duration,
						easing: Easing.in(Easing.quad),
						useNativeDriver: false,
					}),
				]),
				// '+' button down
				Animated.sequence([
					Animated.timing(buttonAnim, {
						toValue: 1,
						duration: duration * 0.9,
						easing: Easing.inOut(Easing.linear),
						useNativeDriver: true,
					}),
					Animated.timing(buttonAnim, {
						toValue: 0,
						duration: duration * 0.1,
						easing: Easing.inOut(Easing.linear),
						useNativeDriver: true,
					}),
				]),
				// Texts swap
				Animated.parallel([
					Animated.timing(primaryTextAnim, {
						toValue: 1,
						duration: duration,
						easing: Easing.inOut(Easing.cubic),
						useNativeDriver: true,
					}),
					Animated.timing(secondaryTextAnim, {
						toValue: 1,
						duration: duration,
						easing: Easing.inOut(Easing.cubic),
						useNativeDriver: true,
					}),
				]),
			]).start(() => {
				primaryTextAnim.setValue(0)
				secondaryTextAnim.setValue(0)
				setSwapActive(false)
			})
		},
		[shadowAnim, buttonAnim, primaryTextAnim, secondaryTextAnim]
	)

	useEffect(() => {
		const primaryVariation = getPrimaryVariation({ chosenVariations, primaryVariationIndex, nonPrimaryVariants })
		const secondaryVariation = getSecondaryVariation({ primaryVariationIndex, nonPrimaryVariants })
		const didChange = primaryVariation?.id && primaryVariation?.id !== primaryVariationRef.current?.id

		if (didChange) {
			// triggerSwapAnimation(ANIMATION_DURATION)
			// setTimeout(() => {
			primaryVariationRef.current = primaryVariation
			secondaryVariationRef.current = secondaryVariation
			// }, ANIMATION_DURATION)
		}
	}, [primaryVariationIndex, nonPrimaryVariants, chosenVariations, triggerSwapAnimation])

	// Interpolate shadow style
	const animatedShadowStyle = Platform.select({
		ios: {
			shadowOpacity: shadowAnim.interpolate({
				inputRange: [0, 1],
				outputRange: [SHADOW_MIN_OPACITY, SHADOW_MAX_OPACITY],
			}),
			shadowRadius: 20,
			shadowOffset: { width: 20, height: 32 },
		},
		android: {
			elevation: shadowAnim.interpolate({
				inputRange: [0, 1],
				outputRange: [SHADOW_MIN_ELEVATION, SHADOW_MAX_ELEVATION],
			}),
		},
	})

	// Calculate deltas for swap
	const deltaX = secondaryTextPos.x - primaryTextPos.x - CONTENT_SPACING
	const deltaY = secondaryTextPos.y - primaryTextPos.y

	// Button animation style
	const buttonAnimatedStyle = {
		zIndex: -1,
		opacity: buttonAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [1, 0.1],
		}),
		transform: [
			{
				translateY: buttonAnim.interpolate({
					inputRange: [0, 1],
					outputRange: [0, BUTTON_ANIMATION_DISTANCE],
				}),
			},
		],
	}

	const primaryTextAnimatedStyle = {
		zIndex: 2,
		backgroundColor: colors.white,
		paddingVertical: 5,
		paddingHorizontal: CONTENT_SPACING,
		transform: [
			{
				translateX: primaryTextAnim.interpolate({
					inputRange: [0, 1],
					outputRange: [0, deltaX],
				}),
			},
			{
				translateY: primaryTextAnim.interpolate({
					inputRange: [0, 1],
					outputRange: [0, deltaY],
				}),
			},
		],
	}

	const secondaryTextAnimatedStyle = {
		zIndex: 1,
		paddingVertical: 5,
		flex: 1,
		transform: [
			{
				translateX: secondaryTextAnim.interpolate({
					inputRange: [0, 1],
					outputRange: [0, -deltaX],
				}),
			},
			{
				translateY: secondaryTextAnim.interpolate({
					inputRange: [0, 1],
					outputRange: [0, -deltaY],
				}),
			},
		],
	}

	const renderVariationText = (variation?: IVariant) =>
		renderBoldText(`${variation?.name}: [[bold]]${variation?.options?.[0]?.title}[[bold]]`)

	const primaryVariation = getPrimaryVariation({ chosenVariations, primaryVariationIndex, nonPrimaryVariants })
	const secondaryVariation = getSecondaryVariation({ primaryVariationIndex, nonPrimaryVariants })

	return (
		<Center flex={1}>
			<Container alignItems="center" position="relative">
				<Container position="absolute" top={25} left={25} zIndex={1}>
					<Image style={styles.image} source={{ uri: TwistedArrowIllustration }} resizeMode="contain" />
				</Container>
				<Container padding={14} backgroundColor={colors.gray02Kyte} borderRadius={BORDER_RADIUS}>
					<KyteText weight="500" color={'white'} size={14}>
						{Strings.t_variant_photo}
					</KyteText>
				</Container>
				<Animated.View style={[styles.shadow, animatedShadowStyle]}>
					<Padding all={CONTENT_SPACING}>
						<Row alignItems="center" style={{ position: 'relative' }}>
							<Animated.View style={buttonAnimatedStyle}>
								<KyteBaseButton
									backgroundColor={colors.gray10}
									borderColor={'transparent'}
									containerStyle={styles.buttonContainer}
									onPress={() => null}
									customContent={
										<Center>
											<KyteText weight="300" size={PHOTO_BUTTON_CONTENT_SIZE} color={colors.gray02Kyte}>
												{'+'}
											</KyteText>
										</Center>
									}
								/>
							</Animated.View>
							<Animated.View
								style={primaryTextAnimatedStyle}
								onLayout={(e) => {
									if (!swapActive) {
										// Use measureInWindow for true screen coordinates
										requestAnimationFrame(() => {
											if (primaryTextRef.current) {
												primaryTextRef.current.measureInWindow((x: number, y: number) => {
													setPrimaryTextPos({ x, y })
												})
											}
										})
									}
								}}
								ref={primaryTextRef}
							>
								<KyteText size={14}>{renderVariationText(primaryVariation)}</KyteText>
							</Animated.View>
						</Row>
						<Padding top={CONTENT_SPACING * 1.6}>
							<Row alignItems="center" style={{ position: 'relative' }}>
								<Animated.View
									style={secondaryTextAnimatedStyle}
									onLayout={(e) => {
										if (!swapActive) {
											requestAnimationFrame(() => {
												if (secondaryTextRef.current) {
													secondaryTextRef.current.measureInWindow((x: number, y: number) => {
														setSecondaryTextPos({ x, y })
													})
												}
											})
										}
									}}
									ref={secondaryTextRef}
								>
									<KyteText size={14}>{renderVariationText(secondaryVariation)}</KyteText>
								</Animated.View>
							</Row>
						</Padding>
					</Padding>
				</Animated.View>
			</Container>
		</Center>
	)
}

export default VariantChooseMainExample
