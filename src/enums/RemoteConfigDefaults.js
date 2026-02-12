import { Features } from '.'
import { completedStep, highlightedStep, disabledStep, activeStep } from '../styles'
import { generateDefaultPROFeatures } from '../util'
import I18n from '../i18n/i18n'
import { isCatalogApp } from '../util/util-flavors'
import { DashboardVersionEnum } from '@kyteapp/kyte-utils/dist/enums'

const modalProDefault = 'pro-default'
const modalTrialDefault = 'trial-default'
const modalFreeDefault = 'free-default'

const featureRemoteKey = (key) => Features.items[Features[key]].remoteKey
const languages = ['en', 'es-ES', 'es', 'pt-br']

// Modals
// - Feature Modals
const featureModals = {
	featureProDefault: modalProDefault,
	[featureRemoteKey('PRINTERS')]: modalProDefault,
	[featureRemoteKey('STOCK')]: modalProDefault,
	[featureRemoteKey('ANALYTICS')]: modalProDefault,
	[featureRemoteKey('OPENED_SALES')]: modalProDefault,
	[featureRemoteKey('MULTI_USER')]: modalProDefault,
	[featureRemoteKey('TAXES')]: modalProDefault,
	[featureRemoteKey('EXPORT')]: modalProDefault,
	[featureRemoteKey('CUSTOMER_ACCOUNT')]: modalProDefault,
	[featureRemoteKey('CUSTOM_STATUS')]: modalProDefault,
	[featureRemoteKey('CUSTOM_COLOR')]: modalProDefault,
}

// PRO Features 2022
const generatePROFeatures = generateDefaultPROFeatures()

// - Billing Modals
const billingModals = {
	free: modalFreeDefault,
	trial: modalTrialDefault,
	trialLastDay: modalTrialDefault,
	tolerancePeriod: 'default',
	toleranceExpired: 'default',
}

// Helper
const helper = {
	helperType: 'guided',
	helperVariation: 'helper',
	helperAvailability: isCatalogApp() ? 'disabled' : 'enabled',
	completedStep,
	activeStep,
	highlightedStep,
	disabledStep,
}

const socialMediaIntegration = {
	SocialMediaIntegrationFBE: true,
	SocialMediaIntegrationFBShopping: true,
	SocialMediaIntegrationFBPixel: true,
	SocialMediaIntegrationGoogleShopping: true,
	SocialMediaIntegrationTikTokShopping: true,
}

// Trial Journey
const enabledTrialJourney = false
const trialJourney = () => {
	const days = [...Array(8).keys()]
	return days.reduce((acc, cur, index) => {
		const actual = { [`trialDay${index}`]: modalTrialDefault }
		return { ...acc, ...actual }
	}, {})
}

const KyteExternalPayment = false

const addFeatures = (plan) => {
	let final = {}
	languages.map(
		(lang) =>
			(final = {
				...final,
				[lang]: {
					feature1: I18n.t(`plansPage.${plan}.feature1`),
					feature2: I18n.t(`plansPage.${plan}.feature2`),
					feature3: I18n.t(`plansPage.${plan}.feature3`),
				},
			})
	)

	return final
}

const generatePlansAdditionalInfo = () => {
	let additionalInfo = {}
	languages.map((lang) => {
		additionalInfo = {
			...additionalInfo,
			trialDisclaimer: {
				...additionalInfo.trialDisclaimer,
				[lang]: I18n.t('plansPage.trialDisclaimer'),
			},
			subscriptionAutoRenewal: {
				...additionalInfo.subscriptionAutoRenewal,
				[lang]: I18n.t('plansPage.subscriptionAutoRenewal'),
			},
		}
	})

	return additionalInfo
}

const PlansPageSettings = {
	pro: {
		starPlan: false,
		hidePlan: false,
		defaultPlan: false,
		features: addFeatures('pro'),
	},
	grow: {
		starPlan: true,
		hidePlan: false,
		defaultPlan: true,
		features: addFeatures('grow'),
	},
	prime: {
		starPlan: false,
		hidePlan: false,
		defaultPlan: false,
		features: addFeatures('prime'),
	},
}

export const PlansPageAdditionalInfo = generatePlansAdditionalInfo()
const MPBannerOnMenu = false
const ByPassSubscription = false
const TrialMagicRegistration = false

const dashboardSubscribeBtn = {
	backgroundColor: 'white',
	textColor: '#363f4d',
	enabled: false,
	link: {
		stackName: 'Plans',
		pageName: 'Plans',
	},
	btnLabel: {
		en: 'Subscribe',
		'es-ES': 'Adquirir',
		es: 'Adquirir',
		'pt-br': 'Assinar',
	},
}

const StoryblokDashboardVersion = `${DashboardVersionEnum.V1}`

// onboarding carousel images
const OnboardingCarousel = {
	sales: [
		{
			es: 'sales-card-1-es',
			pt: 'sales-card-1-pt',
			en: 'sales-card-1-en',
		},
		{
			es: 'sales-card-2-es',
			pt: 'sales-card-2-pt',
			en: 'sales-card-2-en',
		},
		{
			es: 'sales-card-3-es',
			pt: 'sales-card-3-pt',
			en: 'sales-card-3-en',
		},
	],
	orders: [
		{
			es: 'orders-card-1-es',
			pt: 'orders-card-1-pt',
			en: 'orders-card-1-en',
		},
		{
			es: 'orders-card-2-es',
			pt: 'orders-card-2-pt',
			en: 'orders-card-2-en',
		},
		{
			es: 'orders-card-3-es',
			pt: 'orders-card-3-pt',
			en: 'orders-card-3-en',
		},
		{
			es: 'orders-card-4-es',
			pt: 'orders-card-4-pt',
			en: 'orders-card-4-en',
		},
		{
			es: 'orders-card-5-es',
			pt: 'orders-card-5-pt',
			en: 'orders-card-5-en',
		},
	],
	statistics: [
		{
			es: 'statistics-card-1-es',
			pt: 'statistics-card-1-pt',
			en: 'statistics-card-1-en',
		},
		{
			es: 'statistics-card-2-es',
			pt: 'statistics-card-2-pt',
			en: 'statistics-card-2-en',
		},
		{
			es: 'statistics-card-3-es',
			pt: 'statistics-card-3-pt',
			en: 'statistics-card-3-en',
		},
		{
			es: 'statistics-card-4-es',
			pt: 'statistics-card-4-pt',
			en: 'statistics-card-4-en',
		},
		{
			es: 'statistics-card-5-es',
			pt: 'statistics-card-5-pt',
			en: 'statistics-card-5-en',
		},
	],
}

export const RemoteConfigDefaults = {
	...featureModals,
	...billingModals,
	...helper,
	...socialMediaIntegration,
	enabledTrialJourney,
	...trialJourney(),
	...generatePROFeatures,
	KyteExternalPayment,
	PlansPageSettings,
	PlansPageAdditionalInfo,
	MPBannerOnMenu,
	dashboardSubscribeBtn,
	StoryblokDashboardVersion,
	OnboardingCarousel,
	ByPassSubscription,
	TrialMagicRegistration,
}
