import React, { CSSProperties } from 'react'
import KyteBaseButton from './KyteBaseButton'
import { colors, Container } from '@kyteapp/kyte-ui-components'
import { TestID } from '../../../util'

interface AddEntryButtonProps {
	icon?: string
	iconColor?: string
	title: string
	fontWeight?: string
	onPress?: () => void
	isDisabled?: boolean
	testID?: TestID
	style?: CSSProperties
}

const AddEntryButton: React.FC<AddEntryButtonProps> = ({
	icon = 'plus-cart',
	iconColor,
	title,
	onPress,
	isDisabled,
	testID,
	fontWeight,
	style,
}) => (
	<Container style={{ opacity: isDisabled ? 0.5 : 1, ...style }}>
		<KyteBaseButton
			leftIcon={icon}
			iconColor={iconColor || colors.green03Kyte}
			onPress={onPress}
			textStyle={{
				alignSelf: 'flex-start',
				fontWeight: fontWeight || '400',
				fontSize: 14,
				marginLeft: 10,
			}}
			textColor={colors.gray02Kyte}
			backgroundColor={isDisabled ? null : 'transparent'}
			borderColor={'transparent'}
			type={'tertiary'}
			disabled={isDisabled}
			{...testID}
		>
			{title}
		</KyteBaseButton>
	</Container>
)

export default AddEntryButton
