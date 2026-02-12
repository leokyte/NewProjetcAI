import React from 'react'
import { Platform } from 'react-native'
import { KyteBox, KyteText, isFree, isTrial, KyteButton, Margin } from '@kyteapp/kyte-ui-components'

import { KyteIcon, CurrencyText } from '../../common'
import I18n from '../../../i18n/i18n'
import { styles } from './styles'
import { colors } from '../../../styles'
import { PLAN_MONTHLY, PLAN_YEARLY } from '../../../enums'

const CarouselItem = ({ item, type, billing, height = 385, hasStorePlans, toggleModalVisibility }) => {
	if (!item) return null

	const hasMonthly = Boolean(item?.monthly)
	const hasYearly = Boolean(item?.yearly)
	const isOnlyOnePlan = !(hasMonthly && hasYearly)
	const pricingInfoHeight = 85

	const monthlTotal = (value) => (value * 12).toFixed(2)

	const percentageDiscount = (monthly, yearly) => {
		const final = Math.round((yearly * 100) / monthlTotal(monthly) - 100)

		return `${final}%`
	}

	const monthDiscount = (monthly, yearly) => Math.round((monthlTotal(monthly) - yearly) / monthly)

	const renderMonthly = hasMonthly ? (
		<KyteBox mb={4} align="center" justify="center" d="row" h={pricingInfoHeight}>
			<KyteText lineHeight={32} size={32} weight={500}>
				{item?.monthly?.localizedPrice}
			</KyteText>
			<KyteText lineHeight={18} size={18}>
				{` /${I18n.t('words.s.month')}`}
			</KyteText>
		</KyteBox>
	) : null

	const renderYearly = hasYearly ? (
		<KyteBox mb={4} align="center" justify="center" h={pricingInfoHeight}>
			<KyteBox align="center" d="row" mb={1}>
				{hasMonthly && (
					<>
						<KyteText color={colors.grayBlue} lineHeight={26} size={14} textDecorationLine="line-through">
							<CurrencyText value={monthlTotal(item?.monthly?.price)} />
						</KyteText>
						<KyteText
							style={{ width: 43, height: 26, backgroundColor: colors.warningColor, borderRadius: 8 }}
							size={14}
							lineHeight={25}
							weight={500}
							color="#fff"
							textAlign="center"
							marginLeft={10}
						>
							{percentageDiscount(item?.monthly?.price, item?.yearly?.price)}
						</KyteText>
					</>
				)}
			</KyteBox>

			<KyteBox align="center" d="row" mb={2}>
				<KyteText lineHeight={32} size={32} weight={500}>
					{item?.yearly?.localizedPrice}
				</KyteText>
				<KyteText lineHeight={18} size={18}>
					{` /${I18n.t('words.s.year')}`}
				</KyteText>
			</KyteBox>
			{hasMonthly && (
				<KyteText color={colors.warningColor} size={14}>
					{`${I18n.t('words.s.save')} ${monthDiscount(item?.monthly?.price, item?.yearly?.price)} ${
						monthDiscount(item?.monthly?.price, item?.yearly?.price) > 1
							? I18n.t('words.p.months')
							: I18n.t('words.p.month')
					}`}
				</KyteText>
			)}
		</KyteBox>
	) : null

	const renderContentPlan = () => {
		if (!hasStorePlans) return <KyteBox h={10} w={20} />
		if (isOnlyOnePlan) return renderMonthly || renderYearly
		if (type === PLAN_MONTHLY && hasMonthly) return renderMonthly
		if (type === PLAN_YEARLY && hasMonthly && hasYearly) return renderYearly
		return null
	}

	const locale = I18n.t('locale')
	// Fallback strategy: try exact locale, then language variant, then 'en'
	// This handles cases where Remote Config may not have all locale keys
	const getFeatures = () => {
		if (!item?.features) return null
		
		// Try exact locale first
		if (item.features[locale]) return item.features[locale]
		
		// If locale is 'es-ES', try 'es' as fallback
		if (locale === 'es-ES' && item.features.es) return item.features.es
		
		return null
	}
	
	const features = getFeatures()

	return (
		<KyteBox
			style={item.starPlan ? styles.starPlan : styles.simplePlan}
			align="center"
			h={height}
			borderWidth={2}
			borderRadius={8}
			padding={15}
			overflow="hidden"
		>
			{item.starPlan && (
				<>
					<KyteBox style={styles.triangle.lg} />
					<KyteIcon size={20} name="star-fill" color="#FFF" style={styles.star.lg} />
				</>
			)}

			<KyteBox justify="center" d="row" align="center" pb={4}>
				<KyteText weight={500} size={24} color={colors.primaryDarker}>
					{item.title}
				</KyteText>

				{item.id === billing.plan && !isFree(billing) && !isTrial(billing) && (
					<KyteBox
						borderRadius={6}
						borderColor={colors.warningColor}
						borderWidth={1}
						justify="center"
						align="center"
						ph={1}
						h={26}
						ml={2}
					>
						<KyteText textAlign="center" size={14} color={colors.primaryDarker} weight={500}>
							{I18n.t('plansPage.yourPlan').toUpperCase()}
						</KyteText>
					</KyteBox>
				)}
			</KyteBox>

			<KyteText textAlign="center" size={16} color={colors.primaryDarker} marginBottom={15}>
				{item.description}
			</KyteText>

		{renderContentPlan()}

		{features &&
			Object.values(features).map((text, index) => (
				<KyteText textAlign="center" key={index} size={16} weight={index === 0 ? 500 : 400} marginBottom={8}>
					{text}
				</KyteText>
			))}

			{Platform.OS === 'android' ? (
				<Margin width="100%" top={5}>
					<KyteButton containerStyle={{ height: 40 }} onPress={toggleModalVisibility} type="disabled">
						{I18n.t('plansPage.comparePlans')}
					</KyteButton>
				</Margin>
			) : null}
		</KyteBox>
	)
}

export { CarouselItem }
