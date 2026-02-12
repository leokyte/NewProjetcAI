import React, { ReactNode } from 'react'
import { Container, Padding, Margin, KyteText } from '@kyteapp/kyte-ui-components'
import { colors } from 'react-native-elements'
import { CONTENT_BOX_PADDING } from '../../products/variants/tab/product-skus/constants'

const FieldFormBox = ({ children, isLast, title }:
	{
		children: ReactNode,
		title?: string,
		isLast?: boolean
	}) => {
	return (
		<React.Fragment>
			<Container backgroundColor={colors.white}>
				<Padding vertical={CONTENT_BOX_PADDING} horizontal={CONTENT_BOX_PADDING}>
					{title && <KyteText marginBottom={CONTENT_BOX_PADDING} weight={500} color={colors.primaryDarker} size={14}>{title}</KyteText>}
					{children}
				</Padding>
			</Container>
			{!isLast && <Margin bottom={16} />}
			
		</React.Fragment>
		
	)
}

export default FieldFormBox
