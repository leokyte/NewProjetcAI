import React from 'react'
import { Center, ListTile, KyteText } from '@kyteapp/kyte-ui-components'
import KyteBaseButton from './KyteBaseButton'
import { TestID } from '../../../util'

interface ListTileWithButtonProps {
	onPress: () => void
	title: string
	titleSize?: number
	contentPadding?: number
	cornerButtonHeight?: number | 'string'
	cornerButtonWidth?: number | 'string'
	cornerButtonContent: string | React.ReactNode // Can be a string or a KyteIcon
	cornerButtonContentSize?: number
	testID?: TestID
}

const ListTileWithButton: React.FC<ListTileWithButtonProps> = ({
	title,
	onPress,
	titleSize = 14,
	contentPadding = 15,
	cornerButtonHeight = 36,
	cornerButtonWidth = 36,
	cornerButtonContent,
	cornerButtonContentSize = 14,
	testID,
}) => (
	<ListTile
		padding={contentPadding}
		title={{
			fontWeight: '500',
			text: title,
			fontSize: titleSize,
		}}
		onPress={onPress}
		rightContent={
			<KyteBaseButton
				containerStyle={{ width: cornerButtonWidth, height: cornerButtonHeight }}
				onPress={onPress}
				customContent={
					<Center>
						<KyteText size={cornerButtonContentSize} color="white">
							{cornerButtonContent}
						</KyteText>
					</Center>
				}
				titleSize
				{...testID}
			/>
		}
	/>
)

export default ListTileWithButton
