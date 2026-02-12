import { KyteNotificationProps } from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'

type MakeNotifictionProp = {
	message: string
}


export const makeErrorNotification = (props: MakeNotifictionProp): KyteNotificationProps => {
	return {
		title: props.message,
		timer: 3000,
		type: NotificationType.ERROR,
	}
}
