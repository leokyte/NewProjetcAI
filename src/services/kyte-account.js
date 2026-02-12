import Config from 'react-native-config'
import { putStorageImageAccount } from '../integrations'
import { apiGateway } from './kyte-api-gateway'

const baseURL = Config.KYTE_USER_ACCOUNT_URL

// register - SignIn
export const kyteAccountRegister = (uid, os, deviceCountry, payload = null) =>
	apiGateway.post(`/user-register/${uid}/${os}/extra?country=${deviceCountry}`, { payload })
export const kyteAccountSignIn = (uid, lang) => apiGateway.get(`/sign-in/${uid}/${lang}`)

// Signup
export const kyteAccountSignUpOwner = (uid, extra, lang, os, deviceCountry) =>
	apiGateway.post(`/sign-up-owner/${uid}/${lang}/${os}/extra?country=${deviceCountry}`, { extra })
export const kyteAccountSignUpUser = (uid, aid, lang, extra, psw64) =>
	apiGateway.post(`/sign-up-user/${uid}/${aid}/${lang}`, { psw64, extra })
export const kyteAccountUpdateUser = (uid, lang, extra) => apiGateway.post(`/update-user/${uid}/${lang}`, { extra })
export const kyteAccountUpdateUserChangePassword = (uid, lang, extra, psw64) =>
	apiGateway.post(`/update-user/${uid}/${lang}`, { resendCredential: true, psw64, extra })
export const kyteAccountDeleteUser = (uid) => apiGateway.get(`/delete-user/${uid}`)

// Auth Verify - Validation
export const kyteAccountAuthVerified = (uid, codeValidation) =>
	apiGateway.get(`/auth-verified/${uid}/${codeValidation}`)
export const kyteAccountAuthVerifiedByEmail = (email, codeValidation) =>
	apiGateway.post('/auth-verified-by-email', { email, codeValidation })
export const kyteAccountForgotPassword = (email, lang) => apiGateway.post('/forgot-password', { email, lang })
export const kyteAccountResendCodeValidation = (email, lang) =>
	apiGateway.post('/resend-code-validation', { email, lang })

// PREFERENCE
export const kyteAccountGetPreference = (uid) => apiGateway.get(`/preferences/${uid}`)
export const kyteAccountSetPreference = async (uid, key, value) => {
	const preferenceItem = { [key]: value }
	const response = await apiGateway.post(`/preferences/${uid}`, preferenceItem)

	return response.data
}

// COMMON
export const kyteAccountGetCountries = (language) => apiGateway.get(`/common/countries/${language}`)
export const kyteAccountLoggerApp = (obj) => apiGateway.post('/common/logger-app', obj)

// ACCOUNT
export const kyteAccountGetUserByEmail = (email) => apiGateway.post('/get-user-by-email', { email })
export const kyteAccountSetStore = ({ store }) => apiGateway.post('/store', { store })
export const kyteAccountSetStoreImage = ({ store }, storeImage) => {
	if (storeImage) {
		const document = { aid: store.aid, _id: store._id, image: storeImage, banner: false }
		const cbUpImage = putStorageImageAccount(document)

		return cbUpImage
			.then((imageURL) => apiGateway.post('/store', { store: { ...store, imageURL, image: storeImage } }))
			.then((storeResult) => storeResult.data)
			.catch((error) => console.log('kyteAccountSetStoreImage Error', error))
	}
	return apiGateway
		.post('/store', { store: { ...store, imageURL: '', image: '' } })
		.then((storeResult) => storeResult.data)
		.catch((error) => console.log('kyteAccountSetStoreImage Error', error))
}

export const kyteAccountSetImageBanner = async ({ aid, _id }, bannerFilepath, active, res) => {
	const defaultDoc = { active, aid }
	let bannerDoc

	if (bannerFilepath) {
		const document = { aid, _id, image: bannerFilepath, banner: true, useFilepath: true }
		const URL = await putStorageImageAccount(document)

		bannerDoc = {
			...res,
			...defaultDoc,
			URL,
		}
	} else {
		bannerDoc = {
			...res,
			...defaultDoc,
		}
	}

	try {
		const { data } = await apiGateway.post('/banner', bannerDoc)
		return data
	} catch (ex) {
		if (__DEV__) {
			console.tron.logImportant('kyteAccountSetImageBanner Error', { message: ex.message })
		}

		return null
	}
}

export const kyteAccountDeleteImageBanner = async ({ aid }) => {
	try {
		await apiGateway.delete(`/banner/${aid}`)
		return true
	} catch (ex) {
		if (__DEV__) {
			console.tron.logImportant('kyteAccountDeleteImageBanner Error', { message: ex.message })
		}
		return false
	}
}

export const kyteAccountSetTaxes = (tax) => apiGateway.post('/taxes', { ...tax })
export const kyteAccountGetMultiUsers = (aid) => apiGateway.get(`/account/${aid}`)
export const kyteRegisterDeviceUniqueId = (sid, uniqueid) => apiGateway.post(`/register-device/${sid}/${uniqueid}`)
export const kyteAccountSetPixData = ({
	type, 
	value,
	accountName,
	contactNumber,
	enabled,
	aid,
}) => apiGateway.post(`/pix/${aid}`,
	{ 
		enabled,
		accountName,
		key: {
			type,
			value
		},
		contact: {
			whatsApp: contactNumber
		}
	}
)

// ACCOUNT INTEGRATION
export const kyteAccountPartnerIntegration = (aid, code) => apiGateway.get(`/account/partner-link/${aid}/${code}`)

// APP Initializer
export const KyteAccountInitializer = (aid) => apiGateway.get(`/account-info/${aid}`)

// Billing Payment
export const KyteBillingPayment = (aid, paymentMethod) => apiGateway.get(`/billing-payment-url/${aid}?${paymentMethod}`)
export const KyteBillingPrices = (countryCode) => apiGateway.get(`/billing/pro-values/${countryCode}`)

// Catalog Gateways Payments
export const kyteAccountGatewaysUrl = (gatewayKey, aid) =>
	`${baseURL}/gateway-checkout/account-link-proxy/${gatewayKey}/${aid}`
export const kyteAccountGatewayGetCountryFees = (gatewayKey, countryCode) =>
	apiGateway.get(`gateway-checkout/get-country-fees/${gatewayKey}/${countryCode}`)

// Blocked Devices
export const kyteAccountCheckBlockedDevice = (uuid) => apiGateway.get(`/account/check-device/${uuid}`)

// Kyte Terms
export const kyteChangeTermsAnswer = (aid, uid, payload) =>
	apiGateway.post(`/account/change-terms-answer/${aid}/${uid}`, { payload })

// Update Device Info
export const kyteAccountUpdateDeviceInfo = (aid, uid, payload) =>
	apiGateway.post(`/account/update-device-info/${aid}/${uid}`, { payload })

// Behavior
export const kyteAccountBehaviorCompleteStep = (aid, behavior, step) =>
	apiGateway.post(`behavior/set-completed-step/${aid}/${behavior}/${step}`)
export const kyteAccountBehaviorUpdateState = (aid, behavior, state) =>
	apiGateway.post(`behavior/update/${aid}/${behavior}/${state}`)
export const kyteAccountBehaviorCreateState = (aid, behavior, state) =>
	apiGateway.post(`behavior/update/${aid}/${behavior}/${state}`)
export const kyteAccountBehaviorFetch = (aid) => apiGateway.get(`behavior/${aid}`)

export const kyteAccountGetUUID = (aid) => apiGateway.get(`/uuid-apple/${aid}`)
