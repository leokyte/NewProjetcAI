import { Pressable } from 'react-native'
import React, { useEffect } from 'react'
import { KyteBox, KyteText, KyteButton, isPaid, Padding } from '@kyteapp/kyte-ui-components'
import { connect } from 'react-redux'

import { KyteIcon } from '../../common'
import { PLAN_MONTHLY, PLAN_YEARLY } from '../../../enums'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'
import { styles } from './styles'

const FooterButtonsComponent = ({ selectedPlan, setType, billing, subscribe, type, hasStorePlans }) => {
	const hasMonthly = Boolean(selectedPlan?.monthly)
	const hasYearly = Boolean(selectedPlan?.yearly)
	const isOnlyOnePlan = !(hasMonthly && hasYearly)

	const plansList = []
	if (hasMonthly) plansList.push({ item: selectedPlan?.monthly, typeButton: PLAN_MONTHLY })
	if (hasYearly) plansList.push({ item: selectedPlan?.yearly, typeButton: PLAN_YEARLY })

	const labelButton = () => {
		if (isOnlyOnePlan || type === PLAN_MONTHLY) {
			return I18n.t('billingMessages.ios.plansButtonMonth')
		}

		return I18n.t('billingMessages.ios.plansButtonYear')
	}

	const isMyPlan = () => {
		if (!isPaid(billing)) return false

		return billing.recurrence
			? selectedPlan?.id === billing.plan && type === billing.recurrence
			: selectedPlan?.id === billing.plan
	}

	const buttonType = ({ item, typeButton }, index) => (
		<Pressable
			onPress={() => {
				setType(typeButton)
			}}
			style={{ flex: 1 }}
			key={index}
		>
			<KyteBox
				style={type === typeButton || isOnlyOnePlan ? styles.planCardStar : styles.planCard}
				mr={index % 2 || isOnlyOnePlan ? 0 : 2}
				ml={index % 2 && !isOnlyOnePlan ? 2 : 0}
				borderWidth={1.5}
				flexGrow={1}
				overflow="hidden"
				p={3}
				borderRadius={10}
				align="center"
			>
				{(type === typeButton || isOnlyOnePlan) && (
					<>
						<KyteBox style={styles.triangle.sm} />
						<KyteIcon size={12} name="star-fill" color="#FFF" style={styles.star.sm} />
					</>
				)}
				{hasStorePlans && item?.localizedPrice ? (
					<KyteText weight={500} size={16} lineHeight={20} marginBottom={5} marginTop={5}>
						{`${item?.localizedPrice} /${
							typeButton === PLAN_MONTHLY ? I18n.t('words.s.month') : I18n.t('words.s.year')
						}`}
					</KyteText>
				) : (
					<KyteText
						weight={500}
						size={16}
						lineHeight={20}
						marginBottom={5}
						marginTop={5}
						style={{ textTransform: 'capitalize' }}
					>
						{typeButton === PLAN_MONTHLY ? I18n.t('words.s.monthly') : I18n.t('words.s.yearly')}
					</KyteText>
				)}

				{!isOnlyOnePlan && (
					<KyteText size={12} marginBottom={4}>
						{typeButton === PLAN_MONTHLY
							? I18n.t('billingMessages.android.buttonMostPoppular')
							: I18n.t('billingMessages.android.buttonMostAffordable')}
					</KyteText>
				)}
			</KyteBox>
		</Pressable>
	)

	useEffect(() => {
		logEvent('PlanRecurrenceChange', { recurrence: type })
	}, [type])

	return (
		<Padding bottom={10} horizontal={10}>
			<KyteBox d="row" pb={3} flexWrap="nowrap" alignItems="stretch" alignContent="center">
				{plansList.map((item, index) => buttonType(item, index))}
			</KyteBox>

			<KyteButton
				type="primary"
				disabledButton={isMyPlan()}
				rightIcon="arrow-cart"
				textStyle={{ fontSize: 16 }}
				onPress={() => {
					subscribe()
				}}
			>
				{labelButton()}
			</KyteButton>
		</Padding>
	)
}

const mapStateToProps = ({ billing, plans }) => ({
	billing,
	hasStorePlans: plans.hasStorePlans,
})

const FooterButtons = connect(mapStateToProps, null)(FooterButtonsComponent)
export { FooterButtons }
