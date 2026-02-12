import React from 'react'
import IconButton from '@kyteapp/kyte-ui-components/src/packages/buttons/icon-button/IconButton'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'

interface NewMessageButtonProps {
	isLoading?: boolean
	onPress: () => void
}

const NewMessageButton: React.FC<NewMessageButtonProps> = ({ isLoading, onPress }) => {
	return (
		<IconButton
			name="new-message"
			containerStyles={{
				backgroundColor: isLoading ? colors.black4 : colors.successTextColor,
				paddingLeft: 14,
				paddingRight: 14,
				paddingTop: 14,
				paddingBottom: 14,
				margin: 14,
				borderRadius: 8,
				marginLeft: 0,
			}}
			color={isLoading ? colors.black24 : colors.white}
			onPress={onPress}
		/>
	)
}

export default NewMessageButton
