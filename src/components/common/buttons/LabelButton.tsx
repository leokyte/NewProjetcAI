import React, { ComponentProps } from 'react'
import { colors, Row, KyteText, KyteIcon, Margin, Container } from '@kyteapp/kyte-ui-components'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { TestID } from '../../../util'
import { Badge } from '../content/Badge'

type LabelButtonProps = {
	label: string
	onPress: () => void
	labelState?: 'filled' | 'empty' | 'new'
	showCloseIcon?: boolean
	testID?: TestID
	labelProps?: ComponentProps<typeof KyteText>
}

export const LabelButton: React.FC<LabelButtonProps> = ({
	label,
	onPress,
	labelState = 'filled',
	showCloseIcon,
	testID,
	labelProps,
}) => {
	const isFilled = labelState === 'filled'
	const isNew = labelState === 'new'
	const contentSize = 12
	const contentSpacing = 4


	const determineBackgroundColor = () => {
		if (isFilled) return colors.gray02Kyte
		if (isNew) return colors.gray02Kyte
		return colors.gray09
	}

	return (
		<TouchableOpacity {...testID} onPress={onPress}>
			<Container
				padding={contentSpacing}
				paddingTop={contentSpacing + 3}
				paddingLeft={contentSpacing + 4}
				paddingRight={contentSpacing + 4}
				paddingBottom={contentSpacing + 3}
				borderRadius={18}
				backgroundColor={determineBackgroundColor()}
				borderColor={colors.gray02Kyte}
			>
				<Row alignItems="center">
					{!isFilled && !isNew && <KyteIcon name="plus-cart" size={contentSize} color={colors.gray02Kyte} />}
					{isNew && <Badge status="success" />}
					<Margin left={(!isFilled && !isNew) ? contentSpacing : 0} right={(isFilled || isNew) ? contentSpacing : 0}>
						<KyteText
							weight={'500'}
							lineHeight={contentSize}
							color={(isFilled || isNew) ? colors.white : colors.gray02Kyte}
							size={contentSize}
							{...labelProps}
							allowFontScaling={false}
						>
							{label.toUpperCase()}
						</KyteText>
					</Margin>
					{(isFilled || isNew) && (showCloseIcon ?? true) && (
						<KyteIcon name="close-x-fill" size={contentSize} color={colors.white} />
					)}
				</Row>
			</Container>
		</TouchableOpacity>
	)
}

export default LabelButton
