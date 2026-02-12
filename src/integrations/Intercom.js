import * as RNLocalize from 'react-native-localize'
import Intercom, { IntercomContent, Space } from '@intercom/intercom-react-native'
import { isCatalogApp } from '../util/util-flavors'
import { FlavorsEnum } from '../enums/Flavors'

export const getIntercomProps = (getState) => {
	const { auth, preference, billing, printer } = getState()
	const { user, store, account, kid } = auth
	const { account: accountPreference } = preference
	const locales = RNLocalize.getLocales()
	const currentApp = isCatalogApp() ? FlavorsEnum.CATALOG : FlavorsEnum.POS
	const timestampInSeconds = Math.floor(Date.now() / 1000)

	const userAttributes = {
		email: user?.email,
		name: user?.displayName,
		avatar: { type: 'avatar', image_url: user?.photoURL },
		languageOverride: locales[0].languageTag,
		customAttributes: {
			aid: user?.aid,
			code_validation: user?.codeValidation,
			created_at: user?.dateCreation,
			is_admin: user.permissions.isAdmin || user.permissions.isOwner || false,
			is_confirmed: user.authVerified || false,
			is_owner: user.permissions.isOwner || false,
			login_provider: user.provider || '',
			printer: printer.name || '',
			current_app: currentApp,
			[`last_${currentApp.toLowerCase()}_app_open`]: timestampInSeconds,
		},
		companies: [
			{
				id: user.aid,
				name: store.name || '',
				plan: billing?.plan || '',
				customAttributes: {
					catalog: store?.urlFriendly ? `https://${store.urlFriendly}.kyte.site` : null,
					signup_date: store?.dateCreation || null,
					billing_status: billing?.status || null,
					billing_end_date: billing?.endDate || null,
					billing_tolerance_date: billing?.toleranceEndDate || null,
					billing_buy_date: billing?.buyDate || null,
					billing_recurrence: billing?.recurrence || null,
					kid: kid || '',
					phone: store?.phone || '',
					whatsapp: store?.whatsapp || '',
					country_locale: accountPreference?.countryCode || '',
					currency: accountPreference?.currency?.currencyCode || '',
					terms_accepted: account?.terms?.hasAccepted || '',
				},
			},
		],
	}

	return userAttributes
}

export const intercomEvents = [
	'Account Reset',
	'Add User',
	'Allow Customer Paylater',
	'Barcode Activate',
	'Catalog Create',
	'Catalog Share',
	'Category Create',
	'Category Save',
	'Checkout Quick Sale Add',
	'Click To Purchase',
	'Contacts Import',
	'Conversion Message View',
	'Current Plan Manage',
	'Current Plan View',
	'Current Sale Barcode',
	'Customer Create',
	'Customer Import Complete',
	'Customer Import Start',
	'Customer Save',
	'Helper Disabled',
	'Logo Add',
	'New Customer View',
	'Order Save',
	'Order Status Change',
	'Other Plans Click',
	'Plan Change Click',
	'Plan Change View',
	'Plan List View',
	'Plan Subscribe Click',
	'Print Confirmed',
	'Product Create',
	'Product Delete',
	'Product Save',
	'Product Stock Save',
	'Receipt Config Save',
	'Receipt Emailed',
	'Receipt Empty State View',
	'Receipt Shared',
	'Sale Finished',
	'User Add Attempt',
	'User View',
	'Catalog 3 Beta Opt Out'
]

export const getUnreadIntercomConversationCount = async () => {
	try {
		const response = await Intercom.getUnreadConversationCount()
		return response
	} catch (error) {
		if (__DEV__) console.tron.logImportant('Error getUnreadIntercomConversationCount', error)
		return 0
	}
}

// Prevent concurrent login calls that can trigger JSI race conditions
let isIntercomLoginInProgress = false

export const loginUserOnIntercom = async (isLogged, user) => {
	// Prevent race condition from multiple login attempts
	if (isIntercomLoginInProgress) {
		if (__DEV__) console.tron.log('Intercom login already in progress, skipping')
		return
	}

	const isTestUser = user?.email?.includes('@kyte.com')

	try {
		isIntercomLoginInProgress = true

		if (isLogged && !isTestUser) {
			await Intercom.loginUserWithUserAttributes({ email: user?.email, userId: user?.uid })
		} else {
			await Intercom.loginUnidentifiedUser()
		}

		// Small delay to ensure JSI bindings are stable
		await new Promise(resolve => setTimeout(resolve, 100))

	} catch (error) {
		if (__DEV__) console.tron.log('Error loginUserOnIntercom', error)
	} finally {
		isIntercomLoginInProgress = false
	}
}

export const updateCurrentAppIntercomProps = async () => {
	const currentApp = isCatalogApp() ? FlavorsEnum.CATALOG : FlavorsEnum.POS
	const timestampInSeconds = Math.floor(Date.now() / 1000)
	const userAttributes = {
		customAttributes: {
			current_app: currentApp,
			[`last_${currentApp.toLowerCase()}_app_open`]: timestampInSeconds,
		},
	}

	try {
		await Intercom.updateUser(userAttributes)
	} catch (error) {
		if (__DEV__) {
			console.tron.logImportant('updateCurrentAppIntercomProps Error ', error)
		}
	}
}

export const handleIntercomAction = ({ action, id } = {}) => {
	switch (action) {
		case 'survey': {
			const survey = IntercomContent.surveyWithSurveyId(id)
			Intercom.presentContent(survey)
			break
		}
		case 'carousel': {
			const carousel = IntercomContent.carouselWithCarouselId(id)
			Intercom.presentContent(carousel)
			break
		}
		case 'article': {
			const article = IntercomContent.articleWithArticleId(id)
			Intercom.presentContent(article)
			break
		}
		case 'chat': {
			Intercom.presentSpace(Space.messages)
			break
		}
		case 'event': {
			Intercom.logEvent(id)
			break
		}
		case 'helpcenter': {
			Intercom.present()			
			break
		}
		default:
			console.tron.warning('Unexpected intercom action: ', action, id)
			break
	}
}
