import React from 'react'
import { Container, KyteText, Margin, Row, KyteIcon } from '@kyteapp/kyte-ui-components'
import I18n from '../../i18n/i18n'

const SyncWarning = () => {
	return (
		<Margin horizontal={16} bottom={16}>
			<Container backgroundColor="#f7b84f" borderRadius={8} padding={12}>
				<Row justifyContent="center" alignItems="center">
					<KyteIcon name="not-sync" size={40} />
					<Margin left={12}>
						<KyteText size={18} lineHeight={25} weight={500}>
							{I18n.t('pendingSync')}
						</KyteText>
					</Margin>
				</Row>
				<Margin top={6}>
					<KyteText size={16} lineHeight={24} textAlign="center">
						{I18n.t('pendingSaleSync')}
					</KyteText>
				</Margin>
			</Container>
		</Margin>
	)
}

export default SyncWarning
