import React from 'react'
import { Padding, Container } from '@kyteapp/kyte-ui-components'
import { ActionButton } from './ActionButton'
import { colors } from '../../styles'

const BottomButton = ({ children, onPress, bgColor, ...props }) => (
		<Container borderTopWidth={1} borderColor={colors.disabledIcon} backgroundColor={bgColor}>
			<Padding vertical={16}>
				<ActionButton onPress={onPress} {...props}>
					{children}
				</ActionButton>
			</Padding>
		</Container>
	)

export default BottomButton