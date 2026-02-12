import React from 'react'
import { Container, Padding, Row, Body12, Body14, KyteIcon, colors } from '@kyteapp/kyte-ui-components'
import { renderBoldText } from '../../../util'

interface WarningProps {
	title?: string
	message?: string
}

const CONTENT_SPACING = 10
const WARNING_COLOR = '#FDEACA'

const Warning: React.FC<WarningProps> = ({ title, message }) => (
	<Container backgroundColor={WARNING_COLOR} padding={10} borderRadius={5}>
		<Padding all={CONTENT_SPACING}>
			<Row alignItems="center">
				<KyteIcon name="warning" size={20} color={colors.alert} />
				<Container flex={1} marginLeft={CONTENT_SPACING}>
					{title && (
						<Padding bottom={CONTENT_SPACING / 2}>
							<Body14 weight={'500'}>{title}</Body14>
						</Padding>
					)}
					{message && (
						<Body12 lineHeight={18} color={colors.yellow03}>
							{renderBoldText(message)}
						</Body12>
					)}
				</Container>
			</Row>
		</Padding>
	</Container>
)

export default Warning
