import { Mixpanel } from 'mixpanel-react-native'
import moment from 'moment-timezone'
import Config from 'react-native-config'
import I18n from '../i18n/i18n'
import { version } from '../../package.json'
import { isCatalogApp } from '../util/util-flavors'
import { FlavorsEnum } from '../enums/Flavors'
import AsyncStorage from '@react-native-community/async-storage'
import { USER_IP_STORAGE_KEY } from '../constants/common'
import { PaymentType } from '../enums'
import { evaluateSubscriptionByPass } from '../util/subscription/util-subscription-by-pass'
import { getByPassExperimentLabels } from '../util/subscription/util-subscription-by-pass-experiment'
import {
	evaluateTrialMagicRegistration,
	getTrialMagicExperimentLabels,
} from '../util/subscription/util-trial-magic-registration'

const lang = I18n.t('locale')
const timezone = 'Europe/London'

export const getMixpanelProps = async (getState) => {
	let userIP = ''
	try {
		userIP = await AsyncStorage.getItem(USER_IP_STORAGE_KEY)
	} catch {
		if (__DEV__) console.tron.log('getMixpanelProps Error fetching user IP or remote config:', error)
	}

	try {
		const { auth, preference, billing, sales } = getState()
		const { user, store, account } = auth
		const { dateCreation: date, checkoutGateways, catalog } = store
		const { coreActions } = preference.account || {}
		const referralCode = account?.metadata?.referral?.code
		const activeGatewayKeys =
			checkoutGateways.length > 0
				? checkoutGateways.filter((g) => g.active).map((activeGateway) => activeGateway.key)
				: null
		const activePaymentMethods = catalog?.payments
			?.filter((payment) => payment.active)
			?.map((payment) => PaymentType.items[payment.type].description)

		const byPassResult = await evaluateSubscriptionByPass(auth.user?.email, billing, referralCode, coreActions)
		const { ByPassEnabledProp, byPassExperimentProp } = getByPassExperimentLabels(byPassResult)

		const trialMagicResult = await evaluateTrialMagicRegistration(billing)
		const { trialMagicExperimentProp } = getTrialMagicExperimentLabels(trialMagicResult)

		const lastCreatedSale = sales.ordersGroupResult?.list[0]?.sale?.dateCreation
		const superProps = {
			Email: user?.email,
			'Is Confirmed': user?.permissions?.authVerified,
			'Is Owner': user?.permissions?.isOwner,
			'Is In Tolerance': billing.status === 'tolerance',
			'Session Language': lang,
			'Login Provider': user?.provider,
			UID: user?.uid,
			'App Version': version,
			'User name': user?.displayName,
			billing_status: billing?.status,
			billing_plan: billing?.plan,
			billing_end_date: billing?.endDate,
			multiapp: isCatalogApp() ? FlavorsEnum.CATALOG : FlavorsEnum.POS,
			$ip: userIP,
		}

		const userProps = new Map([
			['$email', billing?.email],
			['$name', store?.name],
			['Store Id (aid)', user?.aid],
			['Is In Tolerance', billing.status === 'tolerance'],
			['billing_buy_date', billing?.buyDate],
			['billing_end_date', billing?.endDate],
			['billing_status', billing?.status],
			['billing_plan', billing?.plan],
			['Store Catalog URL', store?.urlFriendly],
			['Store Country', preference.account?.countryCode],
			['Store Currency', preference.account?.currency?.currencyCode],
			['Store Creation Date', moment(date).tz(timezone).format('YYYY-MM-DD') || ''],
			['dt_last_created_sale', moment(lastCreatedSale).tz(timezone).format('YYYY-MM-DD') || ''],
			['Store Whatsapp', store?.whatsapp || ''],
			['Last Language', lang],
			['Online Payment', activeGatewayKeys],
			['$ip', userIP],
			['Catalog Payment Methods', activePaymentMethods],
			['exp_bypass_assinatura', byPassExperimentProp],
			['exp_TrialMagicRegistration', trialMagicExperimentProp],
		])

		return [userProps, superProps]
	} catch (error) {
		if (__DEV__) console.tron.log('getMixpanelProps Error: ', error)
	}
}

class KyteMixpanel {
	static _token = Config.MIXPANEL_TOKEN

	static isLoggedIn = false

	static async init() {
		try {
			if (this._mixpanel) return

			this._mixpanel = new Mixpanel(this._token)
			await this._mixpanel.init()

			if (__DEV__) this._mixpanel.setLoggingEnabled(true)
		} catch (error) {
			if (__DEV__) console.tron.log('KyteMixpanel Error: ', error)
		}
	}

	static track(event, props) {
		if (!this._mixpanel || !this.isLoggedIn) return
		this._mixpanel?.track(event, props)
	}

	static setTrackingProperties(userProps, superProps) {
		try {
			this._mixpanel?.identify(userProps.get('Store Id (aid)'))
			this.isLoggedIn = true

			for (const [key, value] of userProps) {
				this._mixpanel?.getPeople().set(key, value)
			}

			this._mixpanel?.registerSuperProperties(superProps)
		} catch (error) {
			if (__DEV__) console.tron.log('KyteMixpanel Error: ', error)
		}
	}

	static updateCurrentAppMixPanelProps(aid) {
		const currentApp = isCatalogApp() ? FlavorsEnum.CATALOG : FlavorsEnum.POS
		const lastAppOpen = `last_${currentApp.toLowerCase()}_app_open`
		const dateNow = moment(new Date()).tz(timezone).format('YYYY-MM-DD')

		try {
			this._mixpanel?.identify(aid)
			this.isLoggedIn = true

			this._mixpanel?.getPeople().set('current_app', currentApp)
			this._mixpanel?.getPeople().set(lastAppOpen, dateNow)
		} catch (error) {
			if (__DEV__) console.tron.log('KyteMixpanel Error: ', error)
		}
	}

	static logOut() {
		this._mixpanel?.reset()
		this._mixpanel = null
		this.isLoggedIn = false
	}
}

export default KyteMixpanel
