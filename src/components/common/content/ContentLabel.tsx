import React from 'react'
import { Container, ListTile, KyteIcon, colors } from '@kyteapp/kyte-ui-components'
import { generateTestID, TestID } from '../../../util'

interface ContentLabelProps {
	label: string
	title: string
	icon: string
	iconColor?: string
	testID?: TestID
}

const ContentLabel: React.FC<ContentLabelProps> = ({ label, title, icon, iconColor = colors.green03Kyte, testID }) => (
	<Container borderRadius={12} backgroundColor={colors.gray10}>
		<ListTile
			padding={15}
			borderColor={'transparent'}
			subtitle={{
				text: title,
				fontSize: 16,
				fontWeight: '500',
				...generateTestID('label_name_variation'),
				testID: 'label_name_variation',
			}}
			title={{
				fontSize: 12,
				text: label,
				fontWeight: '400',
			}}
			rightContent={<KyteIcon name={icon} size={24} color={iconColor} />}
			{...testID}
		/>
	</Container>
)

export default ContentLabel
