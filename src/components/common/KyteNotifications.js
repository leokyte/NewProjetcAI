import { Container, Margin } from '@kyteapp/kyte-ui-components'
import KyteNotification from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import React from 'react'
import { Dimensions } from 'react-native'

export const toasTimer = 3000

export default function KyteNotifications({ notifications, containerProps = {}, containerWidth = 0 }) {
	const screenWidth = Dimensions.get('window').width

	return (
		<Container
			alignItems="center"
			bottom={0}
			position="absolute"
			alignSelf="center"
			zIndex={1}
			backgroundColor="transparent"
			{...containerProps}
		>
			{notifications.map((notification, index) => (
				<Margin key={notification.creationDateTime || index} bottom={10}>
					<Container maxWidth={screenWidth - 16} width={containerWidth || (210 + 5 * (notification?.title?.length ?? 0))}>
						<KyteNotification {...notification} />
					</Container>
				</Margin>
			))}
		</Container>
	)
}
