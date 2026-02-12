import React from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'

import { setErrorMessageVisibility, redirectCheckoutWeb } from '../../../stores/actions'
import I18n from '../../../i18n/i18n'
import { KyteModal } from '../../common'
import KyteBaseButton from '../../common/buttons/KyteBaseButton'
import { KyteText, KyteIcon, Margin, Row, Container, Padding, colors } from '@kyteapp/kyte-ui-components'
import StoresOutageillustration from '../../subscription/StoresOutageillustration'
import { logEvent } from '../../../integrations'

const SubscribeErrorMessageComponent = ({ actionButtonOnPress, onSwipeComplete, selectedPlan, ...props }) => {
	const BUTTON_SPACING = 15
	const isAndroid = Platform.OS === 'android'
	const appServiceName = isAndroid ? 'Google Play' : 'App Store'
	const eventLocation = 'in-app_payment_error'

	const Strings = {
		t_app_service_name: appServiceName,
		t_try_again: I18n.t('billingMessages.ios.paymentFailButton'),
		t_unable_to_connect: I18n.t('billingMessages.unableToConnect', {
			appServiceName: appServiceName,
		}),
		t_what_to_do: I18n.t('expressions.whatWouldYouLike'),
		t_proceed_in_browser: I18n.t('expressions.proceedInBrowser'),
	}

	const textContainer = (textString) => (
		<Padding horizontal={30} top={20}>
			<KyteText size={16} textAlign="center">
				{textString}
			</KyteText>
		</Padding>
	)

	const handleProceedInBrowser = () => {
		logEvent('Browser Subscribe Click', {
			plan: selectedPlan?.plan,
			recurrence: selectedPlan?.recurrence,
			where: eventLocation,
		})

		props.setErrorMessageVisibility(false)
		props.redirectCheckoutWeb()
	}

	const handleTryAgain = () => {
		logEvent('In App Subscribe Try Again Click', {
			plan: selectedPlan?.plan,
			recurrence: selectedPlan?.recurrence,
			where: eventLocation,
		})

		props.setErrorMessageVisibility(false)
	}

	return (
		<KyteModal
			bottomPage
			propagateSwipe
			noPadding
			noEdges
			height={490}
			title={Strings.t_app_service_name}
			isModalVisible
			hideModal={() => props.setErrorMessageVisibility(false)}
			topRadius={12}
		>
			<Container flex={1}>
				<Container marginBottom={BUTTON_SPACING - 5} alignItems="center">
					<StoresOutageillustration />
				</Container>
				{textContainer(Strings.t_unable_to_connect)}
				{textContainer(Strings.t_what_to_do)}
			</Container>
			<Padding bottom={BUTTON_SPACING} horizontal={BUTTON_SPACING}>
				<KyteBaseButton onPress={handleProceedInBrowser}>{Strings.t_proceed_in_browser}</KyteBaseButton>
				<Margin bottom={BUTTON_SPACING - 5} />
				<KyteBaseButton
					onPress={handleTryAgain}
					type="disabled"
					customChildren={
						<Row justifyContent="center" alignItems="center">
							<Margin top={2} right={10}>
								<KyteIcon name="refresh" size={18} color={colors.green03Kyte} />
							</Margin>
							<KyteText style={{ alignSelf: 'center' }} size={16} weight={500} color={colors.green03Kyte}>
								{Strings.t_try_again}
							</KyteText>
						</Row>
					}
				/>
			</Padding>
		</KyteModal>
	)
}

const mapStateToProps = ({ plans }) => ({
	selectedPlan: plans.selectedPlan,
})

const SubscribeErrorMessage = connect(mapStateToProps, { redirectCheckoutWeb, setErrorMessageVisibility })(
	SubscribeErrorMessageComponent
)
export { SubscribeErrorMessage }
