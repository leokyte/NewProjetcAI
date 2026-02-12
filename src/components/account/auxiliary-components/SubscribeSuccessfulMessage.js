import React from 'react'
import { connect } from 'react-redux'
import { isTrial } from '@kyteapp/kyte-ui-components'

import BottomMessageModal from '../../common/BottomMessageModal'
import { Rocket } from '../../../../assets/images'
import I18n from '../../../i18n/i18n'

const Strings = {
	PAYMENT_SUCCESS_TITLE: I18n.t('billingMessages.ios.paymentSuccessTitle'),
	PAYMENT_SUCCESS_MESSAGE: I18n.t('billingMessages.ios.paymentSuccessMessage'),
	PAYMENT_SUCCESS_BUTTON: I18n.t('billingMessages.ios.paymentSuccessButton'),
	SHARE_MESSAGE: I18n.t('billingMessages.shareMessageMessage'),
	SHARE_LINK: I18n.t('billingMessages.shareMessageLink'),
	MANAGE_BUTTON: I18n.t('plansAndPrices.manageSubscriptionAndroid'),
	MANAGE_BUTTON_PARAGRAPH: I18n.t('plansAndPrices.subscriptionMessage'),
	MANAGE_TITLE: I18n.t('billingMessages.ios.paymentSuccessTitle'),
	PLAN_GROW_TRIAL: `GROW ${I18n.t('Account.planStatus.trial')}`,
}

const SubscribeSuccessfulMessage = ({ user, ...props }) => {
	const shareOptions = {
		message: Strings.SHARE_MESSAGE,
		url: Strings.SHARE_LINK,
		manage_button: Strings.MANAGE_BUTTON,
		manage_paragraph: Strings.MANAGE_BUTTON_PARAGRAPH,
	}

	const generateTitle = () => {
		let plan = props?.billingInfo?.plan?.toUpperCase()

		if (isTrial(props?.billingInfo)) {
			plan = Strings.PLAN_GROW_TRIAL
		}

		return Strings.PAYMENT_SUCCESS_TITLE.replace('$name', user.displayName).replace('$plan', plan)
	}

	return (
		<BottomMessageModal
			fromManageButton={props.fromManageButton}
			fromManageButtonAction={props.fromManageButtonAction}
			billingInfo={props.billingInfo}
			image={Rocket}
			title={generateTitle()}
			titleStyle={styles.paragraphStyle}
			paragraph={Strings.PAYMENT_SUCCESS_MESSAGE}
			paragraphStyle={styles.paragraphStyle}
			shareButton
			shareOptions={shareOptions}
			actionButtonText={Strings.PAYMENT_SUCCESS_BUTTON}
			actionButtonOnPress={props.actionButtonOnPress}
			redirectToRate={props.redirectToRate}
			onSwipeComplete={props.onSwipeComplete}
			seePlans={props.seePlans}
		/>
	)
}

const styles = {
	paragraphStyle: {
		marginBottom: 20,
	},
}

const mapStateToProps = ({ auth }) => ({
	user: auth.user,
})

export default connect(mapStateToProps)(SubscribeSuccessfulMessage)
