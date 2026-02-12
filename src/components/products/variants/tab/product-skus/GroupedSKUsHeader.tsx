import React from 'react'
import { Container, Body14, Center, KyteText, Row, Padding } from '@kyteapp/kyte-ui-components'
import { colors } from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { renderBoldText, TestID } from '../../../../../util'
import { TouchableOpacity, Pressable } from 'react-native'
import {
	CONTENT_HORIZONTAL_SPACING,
	CONTENT_VERTICAL_SPACING,
	PHOTO_BUTTOM_CONTENT_SIZE,
	PHOTO_BUTTON_SIZE,
} from './constants'
import ProductImage from '../../../image/ProductImage'

interface GroupedSKUsHeaderProps {
	primaryKey?: string
	onPress?: () => void
	onPressImageBtn?: () => void
	testID?: TestID
	disabled?: boolean
	subtitleElement?: React.ReactNode
	rightElement?: React.ReactNode
	image?: string
	uid?: string
	variationTitle?: string
}

const GroupedSKUsHeader: React.FC<GroupedSKUsHeaderProps> = ({
	primaryKey,
	subtitleElement,
	testID,
	rightElement,
	disabled,
	onPress,
	onPressImageBtn,
	image,
	uid,
	variationTitle
}) => {
	const isDisabled = !onPress || disabled
	const Touchable = isDisabled ? Pressable : TouchableOpacity

	return (
		<Touchable
			style={{ backgroundColor: 'white' }}
			// pointerEvents={isDisabled ? 'none' : 'auto'}
			disabled={disabled}
			{...testID}
			onPress={onPress}
		>
			<Padding horizontal={CONTENT_HORIZONTAL_SPACING} vertical={CONTENT_VERTICAL_SPACING}>
				<Row alignItems="center">
					<TouchableOpacity
						style={{
							borderRadius: 4,
							overflow: 'hidden',
							backgroundColor: variationTitle ? colors.gray03 : colors.gray10,
							borderColor: 'transparent',
							width: PHOTO_BUTTON_SIZE,
							height: PHOTO_BUTTON_SIZE,
						}}
						onPress={onPressImageBtn}
					>
						{!!image ? (
							<ProductImage
								key={image}
								{...({} as any)}
								product={{
									image,
									uid: uid,
									imageThumb: image,
								}}
								style={{
									width: PHOTO_BUTTON_SIZE,
									height: PHOTO_BUTTON_SIZE,
								}}
								resizeMode="cover"
							/>
						) : (
							<Center width={PHOTO_BUTTON_SIZE} height={PHOTO_BUTTON_SIZE}>
									<KyteText
										numberOfLines={1}
  									ellipsizeMode="tail"
										color={variationTitle ? colors.white : colors.gray02Kyte}
										weight={variationTitle ? 500 : '300'}
										size={variationTitle ? 14 : PHOTO_BUTTOM_CONTENT_SIZE}>
									{variationTitle ? variationTitle : '+'} 
								</KyteText>
							</Center>
						)}
					</TouchableOpacity>

					<Container flex={1} height={'100%'} marginLeft={10} paddingLeft={10}>
						<Container flex={1} justifyContent="center">
							<Body14>{renderBoldText(primaryKey)}</Body14>
						</Container>
						{subtitleElement}
					</Container>

					<Container>{rightElement}</Container>
				</Row>
			</Padding>
		</Touchable>
	)
}

export default GroupedSKUsHeader
