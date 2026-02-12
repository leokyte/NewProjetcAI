import { Platform } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { LoginManager, AccessToken } from 'react-native-fbsdk-next'
import _ from 'lodash'
import Intercom from '@intercom/intercom-react-native'

import {
	getBrand,
	getUniqueId,
	getTotalMemory,
	getCarrier,
	getDeviceId,
	getDeviceName,
	getFirstInstallTime,
	getInstallReferrer,
	getMacAddress,
	getUsedMemory,
} from 'react-native-device-info'
import { constants } from '@kyteapp/react-native-locale'
import * as RNLocalize from 'react-native-localize'

import appleAuth, {
	AppleAuthRequestScope,
	AppleAuthRequestOperation,
	AppleAuthCredentialState,
} from '@invertase/react-native-apple-authentication'
import { updateMixpanelUserData, updateIntercomUserData, startToast } from './CommonActions'

import I18n from '../../i18n/i18n'
import {
	logEvent,
	logSignUpEvent,
	firebaseSetBasicUserProperties,
	logError,
	authSignOut,
	authSignInWithCredential,
	authSignInWithEmailAndPassword,
	authCreateUserWithEmailAndPassword,
	authFetchSignInMethodsForEmail,
	getGoogleAuthCredential,
	getAppleAuthCredential,
	getFacebookAuthCredential,
	analyticsGetAppInstanceId,
	crashlyticsSetAttribute,
} from '../../integrations'
import { deleteAll } from '../../repository'
import {
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT,
	SET_SIGNIN_EMAIL,
	SET_SIGNIN_PASSWORD,
	SET_CAMPAIGN_PROPS,
	ACCOUNT_STORE_SAVE,
	SET_MULTI_USERS,
	ADD_USER_FAIL,
	USER_SET,
	SET_DID,
	UPDATE_USER_ACCOUNT,
	STORE_IMAGE_SET,
	USER_ALREADY_SEEN_CATALOG_HELPER,
	AUTH_INITIALIZE,
	ACCOUNT_TAX_SAVE,
	CATALOG_TAX_SAVE,
	SET_AUTH_CONFIRMED,
	SET_USER_CUSTOM_INFO,
	COMMON_USER_REACHED_LIMIT,
	SYNC_LOGOUT,
	LOADING_AUTHENTICATION,
	PIX_DATA_CONFIG,
	PROMOTION_LIST,
} from './types'
import { clearAllReducers } from './SyncActions'

import {
	encrypt,
	Base64,
	setUserAccountCache,
	showAlert,
	compare,
	writePartnerLogo,
	getUID,
	LoginTracker,
	FACEBOOK_ACCOUNT_CREATION_SUCCESS,
	FACEBOOK_ACCOUNT_LOGIN_SUCCESS,
	FACEBOOK_ACCOUNT_ERROR,
	GOOGLE_ACCOUNT_CREATION_SUCCESS,
	GOOGLE_ACCOUNT_LOGIN_SUCCESS,
	GOOGLE_ACCOUNT_ERROR,
	APPLE_ACCOUNT_CREATION_SUCCESS,
	APPLE_ACCOUNT_LOGIN_SUCCESS,
	APPLE_ACCOUNT_ERROR,
	EMAIL_ACCOUNT_VERIFY_ERROR,
	EMAIL_ACCOUNT_CREATION_SUCCESS,
	EMAIL_ACCOUNT_CREATION_ERROR,
	FORGOT_PASSWORD_REQUEST_SUCCESS,
	FORGOT_PASSWORD_REQUEST_ERROR,
	FORGOT_PASSWORD_CODE_CONFIRMATION_SUCCESS,
	FORGOT_PASSWORD_CODE_CONFIRMATION_ERROR,
	FORGOT_PASSWORD_CHANGE_PASSWORD_SUCCESS,
	FORGOT_PASSWORD_CHANGE_PASSWORD_ERROR,
	APP_PASSWORD_LOGIN_SUCCESS,
	APP_PASSWORD_LOGIN_ERROR,
	getUserFingerPrint,
} from '../../util'

import {
	kyteAccountRegister,
	kyteAccountSignUpOwner,
	kyteAccountSignUpUser,
	kyteAccountUpdateUser,
	kyteAccountUpdateUserChangePassword,
	kyteAccountDeleteUser,
	kyteAccountSetStore,
	kyteAccountGetUserByEmail,
	kyteAccountAuthVerified,
	kyteAccountAuthVerifiedByEmail,
	kyteAccountForgotPassword,
	kyteAccountResendCodeValidation,
	kyteAccountSignIn,
	kyteAccountGetMultiUsers,
	kyteRegisterDeviceUniqueId,
	kyteAccountPartnerIntegration,
	kyteAccountSetTaxes,
	kyteAccountGetPreference,
	kyteAccountSetStoreImage,
	kyteAccountCheckBlockedDevice,
	kyteChangeTermsAnswer,
	kyteAccountUpdateDeviceInfo,
	kyteSetAttribution,
	kyteAccountSetPixData,
	kyteListPromotions,
} from '../../services'
import {
	startLoading,
	stopLoading,
	currentSaleSetTax,
	preferenceSetCountryCode,
	updateQuantitySales,
	AccountInitializer,
	updatePaymentGateways,
	setHasUpdatedDeviceInfo,
	createHelperState,
	toggleHelperVisibility,
	setHelperRemoteAvailability,
	preferenceAddCoreAction,
} from '.'
import { CoreAction } from '../../enums/Subscription.ts'
import { decideInitialRoute, setUserSampleGroup } from './OnboardingActions'
import { FirebaseAnalytics, FirebaseUserProperties } from '../../enums'
import { AppsEnum } from '../../enums/Flavors'
import KyteErrorHandler from '../../integrations/ErrorHandler'
import { setOneSignalExternalId, unregisterOneSignalTag, removeOneSignalExternalId } from '../../integrations/OneSignal'
import { unsubscribeFirestoreListener } from '../../sync/server-manager/documentDownServerManager'
import KyteMixpanel from '../../integrations/Mixpanel'
import { loginUserOnIntercom } from '../../integrations/Intercom'
import { isCatalogApp } from '../../util/util-flavors'
import { getTokenFromClipboard, getUserByToken } from '../../services/kyte-auth'

const APP_TYPE = isCatalogApp() ? AppsEnum.CATALOG : AppsEnum.POS
const APP_TYPE_PAYLOAD = { app: APP_TYPE }
const lang = I18n.t('locale')

export const authInitialize = () => async (dispatch, getState) => {
	const { auth, common, onboarding } = getState()
	const { uid } = auth.user
	const { hasUpdatedDeviceInfo } = common
	const deviceCountry = await RNLocalize.getCountry()
	const userSampleGroup = onboarding?.sample?.expInitialScreen

	// check if userSampleGroup is explicitly undefined (A/B test Dashboard)
	if (userSampleGroup === undefined) await dispatch(setUserSampleGroup())

	// Enable/Disable Helper according to remoteConfig value
	dispatch(setHelperRemoteAvailability())

	if (!hasUpdatedDeviceInfo) {
		await dispatch(updateDeviceInfo())
	}

	return kyteAccountRegister(uid, Platform.OS, deviceCountry)
		.then(async (response) => {
			if (auth.user) {
				// Identifying user with Firebase Crashlytics
				crashlyticsSetAttribute('Name', auth.user.displayName)
				crashlyticsSetAttribute('Email', auth.user.email)
				crashlyticsSetAttribute('AID', auth.user.aid)

				// Set BASIC User Properties - Firebase Analytics
				firebaseSetBasicUserProperties(getState)
			}

			// storing checkout gateways, if there's any.
			if (!!auth.store.checkoutGateways && auth.store.checkoutGateways.length > 0) {
				dispatch(updatePaymentGateways())
			}

			// storing checkout gateways, if there's any.
			if (!!auth.store.checkoutGateways && auth.store.checkoutGateways.length > 0) {
				dispatch(updatePaymentGateways())
			}

			dispatch({ type: AUTH_INITIALIZE, payload: response.data })
			dispatch(AccountInitializer())
		})
		.catch((ex) => {
			const errorMessage = ex.message ? ex.message : 'No error message provided.'
			logEvent('AuthInitializeError', { error: errorMessage })
		})
}

// TODO: Remove

export const doSignUpInit = () => async (dispatch) => {
	dispatch()
}

export const logOut = () => async (dispatch, getState) => {
	const { auth } = getState()
	KyteMixpanel.logOut()
	LoginManager.logOut()
	await Intercom.logout()

	if (auth.user.provider === 'google.com') GoogleSignin.revokeAccess()
	clearAllReducers(dispatch)
	dispatch({ type: SYNC_LOGOUT })
	dispatch({ type: LOGOUT })
	authSignOut()

	// removing firebase firestore listener
	unsubscribeFirestoreListener()

	// Unregistering OneSignal tags and removing External User ID
	unregisterOneSignalTag('aid')
	unregisterOneSignalTag('billing_plan')
	removeOneSignalExternalId()

	// clear Realm
	deleteAll()
}

const checkBlockedDevice = (uuid) =>
	kyteAccountCheckBlockedDevice(uuid)
		.then((result) => {
			const { isBlocked } = result.data
			if (isBlocked) return Promise.reject({ message: 'This device is in blocklist.' })
			return Promise.resolve()
		})
		.catch(() =>
			Promise.reject({
				message: 'A problem has occured. Please, check your internet connection and try again.',
			})
		)

export const doGoogleSignIn = () => async (dispatch, getState) => {
	// stopLoading on doSignInServer or on .catch()
	dispatch(startLoading())

	// checking if this current device is blocked or not
	const uuid = await getUniqueId()
	return checkBlockedDevice(uuid)
		.then(() => GoogleSignin.signIn())
		.then(({ accessToken, idToken }) => {
			const credential = getGoogleAuthCredential(idToken, accessToken)
			return authSignInWithCredential(credential)
		})
		.then((res) => {
			const { user, additionalUserInfo } = res
			const { providerId, isNewUser } = additionalUserInfo

			return Promise.all([doSignInServer(dispatch, getState, { uid: user.uid, isNewUser }), isNewUser, providerId])
		})
		.then(([doSignInServerResult, isNewUser, method]) => {
			const { user } = doSignInServerResult
			logSignUpEvent({ getState, isNewUser, method, user })
			LoginTracker.trackSuccessEvent(isNewUser ? GOOGLE_ACCOUNT_CREATION_SUCCESS : GOOGLE_ACCOUNT_LOGIN_SUCCESS)
			dispatch(stopLoading())
		})
		.catch((ex) => {
			LoginTracker.trackErrorEvent(GOOGLE_ACCOUNT_ERROR, { error_message: ex.message })
			dispatch(stopLoading())
			loginFail(ex, dispatch)
		})
}

export const doAppleSignIn = () => async (dispatch, getState) => {
	dispatch(startLoading())
	// checking if this current device is blocked or not
	const uuid = await getUniqueId()
	return checkBlockedDevice(uuid)
		.then(() =>
			appleAuth.performRequest({
				requestedOperation: AppleAuthRequestOperation.LOGIN,
				requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
			})
		)
		.then((appleAuthRequestResponse) =>
			Promise.all([appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user), appleAuthRequestResponse])
		)
		.then(([credentialState, appleAuthRequestResponse]) => {
			if (credentialState !== AppleAuthCredentialState.AUTHORIZED) {
				const message = () => {
					if (credentialState !== AppleAuthCredentialState.REVOKED) return 'REVOKED'
					if (credentialState !== AppleAuthCredentialState.NOT_FOUND) return 'NOT FOUND'
					if (credentialState !== AppleAuthCredentialState.TRANSFERRED) return 'TRANSFERRED'
				}
				return loginFail({ message: `Apple authentication has been ${message()}` }, dispatch)
			}

			const { identityToken, nonce, fullName } = appleAuthRequestResponse
			const appleCredential = getAppleAuthCredential(identityToken, nonce)
			return Promise.all([authSignInWithCredential(appleCredential), fullName])
		})
		.then(([res, fullName]) => {
			const { user, additionalUserInfo } = res
			const { providerId, isNewUser } = additionalUserInfo
			const method = providerId

			if (isNewUser) {
				return res.user
					.updateProfile({
						displayName: `${fullName.givenName} ${fullName.familyName}`,
						photoURL: null,
					})
					.then(() => Promise.resolve({ isNewUser, user, method, fullName }))
			}
			return Promise.resolve({ isNewUser, user, method })
		})
		.then(({ isNewUser, user, method, fullName }) => {
			const payload = isNewUser ? { displayName: `${fullName.givenName} ${fullName.familyName}` } : null

			return Promise.all([doSignInServer(dispatch, getState, { uid: user.uid, isNewUser }, payload), isNewUser, method])
		})
		.then(([doSignInServerResult, isNewUser, method]) => {
			const { user } = doSignInServerResult
			logSignUpEvent({ getState, isNewUser, method, user })
			LoginTracker.trackSuccessEvent(isNewUser ? APPLE_ACCOUNT_CREATION_SUCCESS : APPLE_ACCOUNT_LOGIN_SUCCESS)
			dispatch(stopLoading())
		})
		.catch((ex) => {
			LoginTracker.trackErrorEvent(APPLE_ACCOUNT_ERROR, { error_message: ex.message })
			dispatch(stopLoading())
			loginFail(ex, dispatch)
		})
}

export const doFacebookSignIn = () => async (dispatch, getState) => {
	// stopLoading on doSignInServer or on .catch()
	dispatch(startLoading())

	// checking if this current device is blocked or not
	const uuid = await getUniqueId()
	return checkBlockedDevice(uuid)
		.then(() => LoginManager.logInWithPermissions(['public_profile', 'email']))
		.then(() => AccessToken.getCurrentAccessToken())
		.then((data) => {
			if (!data) throw { message: 'token-data null' }

			const credential = getFacebookAuthCredential(data.accessToken)
			return authSignInWithCredential(credential)
		})
		.then((userRes) => {
			const { user, additionalUserInfo } = userRes
			const { providerId, isNewUser } = additionalUserInfo

			return Promise.all([doSignInServer(dispatch, getState, { uid: user.uid, isNewUser }), isNewUser, providerId])
		})
		.then(([doSignInServerResult, isNewUser, method]) => {
			const { user } = doSignInServerResult
			logSignUpEvent({ getState, isNewUser, method, user })
			LoginTracker.trackSuccessEvent(isNewUser ? FACEBOOK_ACCOUNT_CREATION_SUCCESS : FACEBOOK_ACCOUNT_LOGIN_SUCCESS)
			dispatch(stopLoading())
		})
		.catch((ex) => {
			LoginTracker.trackErrorEvent(FACEBOOK_ACCOUNT_ERROR, { error_message: ex.message })
			dispatch(stopLoading())
			loginFail(ex, dispatch)
		})
}

export const doFormSignInInit = () => async (dispatch) => {
	dispatch()
}

export const doFormSignIn = (email, password) => {
	const passwordCrypt = encrypt(password)
	return async (dispatch, getState) => {
		// stopLoading on doSignInServer or on .catch()
		dispatch(startLoading())
		return authSignInWithEmailAndPassword(email, passwordCrypt)
			.then((res) => {
				const { user } = res

				return doSignInServer(dispatch, getState, user)
			})
			.then((doSignInServerResult) => {
				const { user } = doSignInServerResult
				LoginTracker.trackSuccessEvent(APP_PASSWORD_LOGIN_SUCCESS)
				logSignUpEvent({ getState, isNewUser: false, method: 'password', user })
			})
			.catch((ex) => {
				LoginTracker.trackErrorEvent(APP_PASSWORD_LOGIN_ERROR, { error_message: ex.message })
				dispatch(stopLoading())
				loginFail(ex, dispatch)
			})
	}
}

export const doFormSignUpInit = () => async (dispatch) => {
	dispatch()
}

export const doFormSignUp = (displayName, email, password) => async (dispatch, getState) => {
	dispatch(startLoading())

	const extra = { psw: encrypt(password), ...APP_TYPE_PAYLOAD }
	const deviceCountry = await RNLocalize.getCountry()
	const { helper } = getState().onboarding

	// checking if this current device is blocked or not
	const uuid = await getUniqueId()
	return checkBlockedDevice(uuid)
		.then(() => doSignUp(displayName, email, extra))
		.then((res) => kyteAccountSignUpOwner(res[0].uid, extra, lang, Platform.OS, deviceCountry))
		.then(async ({ data }) => {
			await dispatch(decideInitialRoute(data?.user, data?.store))

			dispatch({ type: LOGIN_SUCCESS, payload: data })
			LoginTracker.trackSuccessEvent(EMAIL_ACCOUNT_CREATION_SUCCESS)
			logSignUpEvent({ getState, isNewUser: true, method: 'password', user: data?.user })
			dispatch(stopLoading())

			await dispatch(acceptKyteTerms())
			dispatch(createHelperState(1))
			//  delay para dar um tempo de carregar o app e aparecer o Helper
			setTimeout(() => {
				dispatch(toggleHelperVisibility(helper.active))
			}, 3000)

			setOneSignalExternalId(data?.user?.aid)
		})
		.catch((ex) => {
			LoginTracker.trackErrorEvent(EMAIL_ACCOUNT_CREATION_ERROR, { error_message: ex.message })
			KyteErrorHandler.addItemInErrorsQueue({
				message: ex.message || 'Unknown error message',
				stack: ex.stack || 'Unknown error stack',
				componentStack: ex.componentStack || 'Unknown component error stack',
				error: ex,
				isFatal: false,
			})
			loginFail(ex, dispatch)
			dispatch(stopLoading())
		})
}

export const doFormSignUpStart = () => async (dispatch) => {
	dispatch()
}

export const addUser = (displayName, email, password, permissions, navigateCb, kid) => async (dispatch, getState) => {
	dispatch(startLoading())
	const extra = { psw: encrypt(password), permissions, ...APP_TYPE_PAYLOAD }

	try {
		const doSignUpValue = await doSignUp(displayName, email, extra)
		const kyteAccountSignUpUserValue = await kyteAccountSignUpUser(
			doSignUpValue[0].uid,
			getState().auth.aid,
			lang,
			extra,
			Base64.encode(password)
		)

		dispatch({ type: SET_MULTI_USERS, payload: kyteAccountSignUpUserValue.data })
		dispatch(stopLoading())
		// invite-users agora é core action -> registrar em preferences
		dispatch(preferenceAddCoreAction(CoreAction.InviteUsers))
		navigateCb()
	} catch (err) {
		addUserFail(err, dispatch)
		dispatch(stopLoading())
	}
}

export const changeCurrentUserPassword = (newPassword, successCb, errorCb) => (dispatch, getState) => {
	dispatch(startLoading())
	const { email, psw, provider, uid } = getState().auth.user

	const handleSuccess = async (multiUsers, user) => {
		await dispatch({ type: SET_MULTI_USERS, payload: multiUsers })
		await dispatch({ type: USER_SET, payload: user })
		dispatch(stopLoading())
		if (successCb) successCb()
	}
	const handleFailure = (error) => {
		dispatch(stopLoading())
		if (errorCb) errorCb(error)
	}

	if (provider !== 'password') {
		// you only need to update Kyte password
		return kyteAccountUpdateUser(uid, '', { psw: encrypt(newPassword) })
			.then((res) => handleSuccess(res.data.multiUsers, res.data.user))
			.catch((error) => handleFailure(error))
	}

	authSignInWithEmailAndPassword(email, psw)
		.then((res) => {
			const userAuth = res.user
			const cryptNewPassword = encrypt(newPassword)
			return Promise.all([userAuth.updatePassword(cryptNewPassword), userAuth, cryptNewPassword])
		})
		.then(([updatePassword, userAuth, cryptNewPassword]) =>
			kyteAccountUpdateUser(userAuth.uid, '', { psw: cryptNewPassword })
		)
		.then((res) => handleSuccess(res.data.multiUsers, res.data.user))
		.catch((error) => handleFailure(error))
}

export const createNonFormUserPassword = (newPassword, navigateCb) => (dispatch, getState) => {
	dispatch(startLoading())
	const { uid } = getState().auth.user

	kyteAccountUpdateUser(uid, '', { psw: encrypt(newPassword) })
		.then(async (res) => {
			await dispatch({ type: SET_MULTI_USERS, payload: res.data.multiUsers })
			await dispatch({ type: USER_SET, payload: res.data.user })
			dispatch(stopLoading())
			if (navigateCb) navigateCb()
		})
		.catch((ex) => {
			dispatch(stopLoading())
		})
}

export const changePasswordOfOtherUser =
	(user, newPassword, forceChangePassword, navigateCb, changeToUser) => async (dispatch, getState) => {
		dispatch(startLoading())
		const hashedPsw = encrypt(newPassword)
		const base64Psw = Base64.encode(newPassword) // this can be decoded to be sent via email to the user
		const { provider, uid } = user
		const oldPassword = user.psw
		const localUser = _.find(getState().auth.multiUsers, (eachUser) => eachUser.uid === user.uid)

		const extra = {
			psw: hashedPsw,
			permissions: { ...localUser.permissions, forcePswChange: forceChangePassword },
		}

		try {
			if (provider === 'password') {
				const firebaseUser = await authSignInWithEmailAndPassword(user.email, oldPassword)
				await firebaseUser.user.updatePassword(hashedPsw)
			}

			const res = await kyteAccountUpdateUserChangePassword(uid, lang, extra, base64Psw)

			dispatch({ type: SET_MULTI_USERS, payload: res.data.multiUsers })

			if (changeToUser) {
				const userSearch = _.find(res.data.multiUsers, (eachUser) => eachUser.uid === uid)
				dispatch({ type: USER_SET, payload: userSearch })
				dispatch(dispatchUserAccountCache())
			}

			dispatch(stopLoading())
			navigateCb(hashedPsw)
		} catch (error) {
			dispatch(stopLoading())
			loginFail(error, dispatch)
		}
	}

export const editUser = (user, userInfo, extra, navigateCb) => (dispatch, getState) => {
	dispatch(startLoading())
	authSignInWithEmailAndPassword(user.email, user.psw)
		.then(async (res) => {
			const userAuth = res.user
			if (userInfo && userInfo.email !== user.email) {
				await userAuth.updateEmail(userInfo.email)
			}
			return Promise.all([userAuth, userAuth.updateProfile({ displayName: user.displayName })])
		})
		.then(() => kyteAccountUpdateUser(user.uid, lang, extra))
		.then((res) => {
			if (user.uid !== getState().auth.user.uid) {
				dispatch({ type: SET_MULTI_USERS, payload: res.data.multiUsers })
			}
			dispatch(stopLoading())
			navigateCb()
		})
		.catch((ex) => {
			dispatch(stopLoading())
			addUserFail(ex, dispatch)
			dispatch(stopLoading())
		})
}

export const deleteUser = (user, navigateCb) => (dispatch) => {
	dispatch(startLoading())
	kyteAccountDeleteUser(user.uid)
		.then((res) => {
			dispatch({ type: SET_MULTI_USERS, payload: res.data })
			dispatch(stopLoading())
			navigateCb()
		})
		.catch((error) => {
			showAlert(I18n.t('userDeleteFail'))
			dispatch(stopLoading())
		})
}

const doSignUp = (displayName, email, extra) =>
	authCreateUserWithEmailAndPassword(email, extra.psw)
		.then((userAuth) => {
			const { user } = userAuth
			return Promise.all([user, user.updateProfile({ displayName })])
		})

export const doFormResetPassword = (email, newPassword) => (dispatch, getState) => {
	// stopLoading on doSignInServer or on .catch()
	dispatch(startLoading())

	let uid
	kyteAccountGetUserByEmail(email)
		.then((res) => {
			uid = res.data.uid
			return authSignInWithEmailAndPassword(email, res.data.psw)
		})
		.then((res) => {
			const userAuth = res.user
			const cryptNewPassword = encrypt(newPassword)
			return Promise.all([
				cryptNewPassword,
				userAuth.updatePassword(cryptNewPassword),
				kyteAccountUpdateUser(userAuth.uid, '', { psw: cryptNewPassword }),
			])
		})
		.then((res) => {
			LoginTracker.trackSuccessEvent(FORGOT_PASSWORD_CHANGE_PASSWORD_SUCCESS)
			doSignInServer(dispatch, getState, { uid }, res[0])
		})
		.catch((ex) => {
			LoginTracker.trackSuccessEvent(FORGOT_PASSWORD_CHANGE_PASSWORD_ERROR)
			dispatch(stopLoading())
			loginFail(ex, dispatch)
		})
}

/**
 * Shows or hides the loading green screen for the authentication process.
 * @param {boolean} isLoading
 * @returns
 */
export const loadingAuthentication = (isLoading) => ({ type: LOADING_AUTHENTICATION, payload: isLoading })

/**
 * Authenticates users via token using getUserByToken API to retrieve user's UID,
 * and then uses doSignInServer API to retrieve user data and sign-in.
 *
 * Additionally, it logs the sign-in event, and record any errors that occur on Crashlytics.
 *
 * @param {string} token - The token used for sign-in.
 * @returns {Function} A thunk function that interacts with the state.
 */
export const doTokenSignIn = (token) => async (dispatch, getState) => {
	dispatch(startLoading())
	try {
		const isNewUser = false
		const { uid } = await getUserByToken(token)
		const doSignInServerResult = await doSignInServer(dispatch, getState, { uid, isNewUser })
		const { user } = doSignInServerResult

		logSignUpEvent({ getState, isNewUser, method: 'token', user })
		dispatch(stopLoading())
	} catch (ex) {
		dispatch(stopLoading())
		dispatch(startToast(I18n.t('loginFailedTitle')))
		logError(ex, `doTokenSignIn error: ${ex.message}`)
	}
}

/**
 *
 * Authenticates users via token from clipboard using getTokenFromClipboard API to retrieve user's token,
 * Uses getUserByToken API to retrieve user's UID,
 * to finally use doSignInServer API to retrieve user data and sign-in.
 *
 * @returns {Function} A thunk function that interacts with the state.
 */
export const doSeamlessSignIn = () => async (dispatch, getState) => {
	dispatch(loadingAuthentication(true))
	try {
		const isNewUser = false
		const fingerprint = getUserFingerPrint()

		// First: Get token from clipboard
		// Second: Get user UID from token
		// Third: Sign-in user with doSignInServer
		const { payload } = await getTokenFromClipboard(fingerprint)
		let uid
		let userData

		if (payload?.accessToken) {
			const tokenResponse = await getUserByToken(payload.accessToken, true)
			uid = tokenResponse?.uid
		}
		if (uid) {
			const doSignInServerResult = await doSignInServer(dispatch, getState, { uid, isNewUser })
			userData = doSignInServerResult?.user
		}

		if (userData) {
			logEvent('Clipboard Login', { ...userData })
			logSignUpEvent({ getState, isNewUser, method: 'clipboard', user: userData })
		}

		dispatch(loadingAuthentication(payload?.confirm))
	} catch (ex) {
		dispatch(loadingAuthentication(false))
		logError(ex, `doSeamlessSignIn error: ${ex.message}`)
	}
}

export const updateDeviceInfo = () => (dispatch, getState) => {
	const { aid, uid } = getState().auth.user
	return Promise.all([
		getBrand(),
		getCarrier(),
		getDeviceId(),
		getDeviceName(),
		getFirstInstallTime(),
		getInstallReferrer(),
		getMacAddress(),
		getUsedMemory(),
		getTotalMemory(),
		getUniqueId(),
	])
		.then(
			([
				brand,
				carrier,
				deviceId,
				deviceName,
				firstInstallTime,
				installReferrer,
				macAddress,
				usedMemory,
				totalMemory,
				uniqueId,
			]) =>
				kyteAccountUpdateDeviceInfo(aid, uid, {
					brand,
					carrier,
					deviceId,
					deviceName,
					firstInstallTime,
					installReferrer,
					macAddress,
					usedMemory,
					totalMemory,
					uniqueId,
				})
		)
		.then(() => dispatch(setHasUpdatedDeviceInfo(true)))
		.catch(() => dispatch(setHasUpdatedDeviceInfo(false)))
}

const doSignInServer = async (dispatch, getState, { uid, isNewUser }, payload = null) => {
	const { helper } = getState().onboarding

	try {
		const deviceCountry = await RNLocalize.getCountry()
		const { data } = await kyteAccountRegister(uid, Platform.OS, deviceCountry, { ...payload, ...APP_TYPE_PAYLOAD })
		await dispatch(decideInitialRoute(data?.user, data?.store))

		const res = await kyteListPromotions({ aid: data?.user?.aid })
		const promotion = res.data
		dispatch({ type: PROMOTION_LIST, payload: promotion })

		dispatch({ type: LOGIN_SUCCESS, payload: data })

    
		if (isNewUser) {
      await dispatch(acceptKyteTerms())
			dispatch(createHelperState(1))
			//  delay para dar um tempo de carregar o app e aparecer o Helper
			setTimeout(() => {
        dispatch(toggleHelperVisibility(helper.active))
			}, 3000)
		}
    
    try {
      logEvent(FirebaseAnalytics.items[FirebaseAnalytics.USER_SIGN_IN].type, { uid })
      setOneSignalExternalId(data?.user?.aid)
    } catch {
      /* do nothing */
    }
		return data
	} catch (ex) {
		if (ex.response && ex.response.status === 422) {
			showAlert(I18n.t('loginFailedTitle'), I18n.t('userNotAllowedToLogIn'), [{ text: I18n.t('alertOk') }])
			return
		}
		const errorMessage = ex.message ? ex.message : 'No error message provided.'
		logEvent('AuthSigninError', { error: errorMessage })
	} finally {
		dispatch(stopLoading())
	}
}

const loginFail = (ex, dispatch) => {
	logEvent('login_failed', { error: ex.message })
	dispatch({ type: LOGIN_FAIL, payload: ex })
}

const addUserFail = (ex, dispatch) => {
	dispatch({ type: ADD_USER_FAIL, payload: ex })
}

export const setSigninEmail = (email) => ({ type: SET_SIGNIN_EMAIL, payload: email })

export const verifySignInType = (email, navigate) => (dispatch) => {
	dispatch(startLoading())
	authFetchSignInMethodsForEmail(email)
		.then((res) => {
			// fetchProvidersForEmail << deprecated
			dispatch(stopLoading())
			navigate(res[0])
		})
		.catch((error) => {
			dispatch(stopLoading())
		})
}

export const verifySignIn = (email, callback) => async (dispatch) => {
	dispatch(startLoading())

	// checking if this current device is blocked or not
	const uuid = await getUniqueId()
	return checkBlockedDevice(uuid)
		.then(() => authFetchSignInMethodsForEmail(email))
		.then((res) => {
			dispatch({ type: SET_SIGNIN_EMAIL, payload: email })
			dispatch(stopLoading())
			callback(res[0])
		})
		.catch((ex) => {
			callback(false)
			LoginTracker.trackErrorEvent(EMAIL_ACCOUNT_VERIFY_ERROR, { error_message: ex.message })
			dispatch(stopLoading())
		})
}

export const forgotPassword = (email, navigateCb) => (dispatch) => {
	dispatch(startLoading())
	kyteAccountForgotPassword(email, lang)
		.then((res) => {
			LoginTracker.trackSuccessEvent(FORGOT_PASSWORD_REQUEST_SUCCESS)
			dispatch(stopLoading())
			if (navigateCb) navigateCb()
		})
		.catch((error) => {
			LoginTracker.trackErrorEvent(FORGOT_PASSWORD_REQUEST_ERROR, {
				error_message: error.message,
			})
			dispatch(stopLoading())
		})
}

export const resendCodeValidation = (email, navigateCb) => (dispatch) => {
	dispatch(startLoading())
	kyteAccountResendCodeValidation(email, lang)
		.then(() => {
			dispatch(stopLoading())
			if (navigateCb) navigateCb()
		})
		.catch((error) => {
			dispatch(stopLoading())
		})
}

/* Refatorar */
export const changeEmail = (newEmail, cb) => async (dispatch, getState) => {
	const userStorage = await AsyncStorage.getItem('user')
	const { email, psw } = JSON.parse(userStorage)
	// stopLoading on doSignInServer or on .catch()
	dispatch(startLoading())

	return authSignInWithEmailAndPassword(email, psw)
		.then((res) => {
			const userAuth = res.user
			return Promise.all([userAuth, userAuth.updateEmail(newEmail)])
		})
		.then((res) => {
			doSignInServer(dispatch, getState, res[0])
			if (cb) cb()
		})
		.catch((ex) => {
			dispatch(stopLoading())
			loginFail(ex, dispatch)
		})
}

export const setSigninPassword = (password) => ({
	type: SET_SIGNIN_PASSWORD,
	payload: password,
})

export const setAuthVerified = (codValidation, navigateCb, errorCb) => (dispatch, getState) => {
	const { uid } = getState().auth.user
	dispatch(startLoading())
	kyteAccountAuthVerified(uid, codValidation)
		.then((success) => {
			dispatch({ type: SET_AUTH_CONFIRMED })
			dispatch({ type: COMMON_USER_REACHED_LIMIT, payload: false })
			dispatch(stopLoading())
			navigateCb()
		})
		.catch((ex) => {
			dispatch(stopLoading())
			errorCb()
		})
}

export const setAuthVerifiedResetPassword = (email, codValidation, navigateCb, errorCb) => (dispatch) => {
	dispatch(startLoading())
	kyteAccountAuthVerifiedByEmail(email, codValidation)
		.then(() => {
			LoginTracker.trackSuccessEvent(FORGOT_PASSWORD_CODE_CONFIRMATION_SUCCESS)
			dispatch(stopLoading())
			navigateCb()
		})
		.catch((ex) => {
			LoginTracker.trackErrorEvent(FORGOT_PASSWORD_CODE_CONFIRMATION_ERROR)
			dispatch(stopLoading())
			errorCb()
		})
}

export const storeAccountSave = (s, cb) => async (dispatch, getState) => {
	const { imageURL } = getState().auth.store
	const store = { ...s, imageURL }

	if (!s.noLoading) dispatch(startLoading())
	// getting user preferences
	let userPreferences
	await kyteAccountGetPreference(getUID())
		.then(({ data }) => {
			userPreferences = data
		})
		.catch((ex) => {
			const errorMessage = ex.message ? ex.message : 'No error message provided.'
			logEvent('ErrorListingUserPreferences', { error: errorMessage })
		})

	kyteAccountSetStore({ store, imageURL })
		.then(async (res) => {
			const storeAccount = res.data
			dispatch({ type: ACCOUNT_STORE_SAVE, payload: storeAccount.store })
			if (!userPreferences || !userPreferences.countryCode) {
				const deviceConstants = await constants()
				await dispatch(preferenceSetCountryCode(deviceConstants.countryCode))
			}

			await dispatch(updateMixpanelUserData())

			dispatch(stopLoading())
			if (cb) cb()
		})
		.catch((e) => {
			dispatch(stopLoading())
			if (cb) cb(e?.response?.data)
		})
}

/**
 * Saves the PIX data configuration and updates the state in the Redux store.
 *
 * @param {Object} data - The PIX data configuration to be saved. It contains the following fields:
 *   - type {string}: The type of PIX key (e.g., cpf, cnpj, email, phone, or random key).
 *   - value {string}: The actual value of the PIX key (e.g., cpf/cnpj number, email address, phone number or random key).
 *   - accountName {string}: The name of the account holder associated with the PIX key.
 *   - contactNumber {string}: The contact's phone number (including area code).
 *   - enable {boolean}: Indicates whether the PIX key is active (`true`) or not (`false`).
 *   - aid {string}: A unique identifier for the account or PIX key.
 *
 * @param {Function} [callback] - An optional callback function to be executed after the operation.
 *                                It is called with an error object if the operation fails, or nothing if successful.
 *
 * @returns {Function} - A Redux thunk function that handles the async operation and dispatches actions to update the state.
 */
export const pixDataConfigSave = (data, callback) => async (dispatch) => {
	dispatch(startLoading())

	try {
		const res = await kyteAccountSetPixData(data)
		const store = res.data
		dispatch({ type: PIX_DATA_CONFIG, payload: store })

		dispatch(stopLoading())
		if (callback) callback()
	} catch (e) {
		dispatch(stopLoading())
		if (callback) callback('error')
	}
}

export const taxesAccountSave = (tax) => (dispatch) => {
	kyteAccountSetTaxes(tax)
		.then((result) => {
			dispatch({ type: ACCOUNT_TAX_SAVE, payload: result.data })
			dispatch(currentSaleSetTax(result.data))
		})
		.catch((ex) => {
			const errorMessage = ex.message ? ex.message : 'No error message provided.'
			logEvent('TaxesAccountSaveError', { error: errorMessage })
		})
}

export const catalogTaxesSave = (tax) => (dispatch) =>
	new Promise((resolve, reject) => {
		dispatch(startLoading())
		kyteAccountSetTaxes(tax)
			.then(async (result) => {
				await dispatch({ type: CATALOG_TAX_SAVE, payload: result.data })
				dispatch(stopLoading())
				resolve()
			})
			.catch((ex) => {
				const errorMessage = ex.message || 'No error message provided.'
				logEvent('CatalogTaxesSaveError', { error: errorMessage })
				resolve()
			})
	})

export const storeImgSet = (store, imagePath) => (dispatch) => {
	dispatch(startLoading())
	kyteAccountSetStoreImage({ store }, imagePath)
		.then((storeAccount) => {
			dispatch({ type: STORE_IMAGE_SET, payload: imagePath })
			dispatch({ type: ACCOUNT_STORE_SAVE, payload: storeAccount.store })
			dispatch(stopLoading())
		})
		.catch(() => dispatch(stopLoading()))
}

export const dispatchUserAccountCache = () => (dispatch, getState) => {
	setUserAccountCache(getState().auth)
}

/*
 * Este método é responsável por verificar se usuários antigos já possuem a propriedade auth.multiUsers
 * para evitar bugs na construção da lista de Usuários
 *
 */
export const checkIfHasMultiuserProperty = () => async (dispatch, getState) => {
	if (
		!Object.prototype.hasOwnProperty.call(getState().auth, 'multiUsers') ||
		!Object.prototype.hasOwnProperty.call(getState().auth, 'account')
	) {
		kyteAccountSignIn(getState().auth.user.uid, lang)
			.then((res) => {
				const { multiUsers } = res.data
				const { user } = res.data
				const storeAccount = res.data.account

				dispatch({ type: SET_MULTI_USERS, payload: multiUsers })
				dispatch({ type: USER_SET, payload: user })
				dispatch({ type: ACCOUNT_STORE_SAVE, payload: storeAccount })
			})
			.catch((ex) => {
				const errorMessage = ex.message ? ex.message : 'No error message provided.'
				logEvent('CheckMultiuserPropertyError', { error: errorMessage })
			})
	}

	if (!Object.prototype.hasOwnProperty.call(getState().auth, 'did') || !getState().auth.did) {
		const deviceUniqueId = await getUniqueId()
		kyteRegisterDeviceUniqueId(getState().auth.store._id, deviceUniqueId)
			.then((res) => {
				dispatch({ type: SET_DID, payload: res.data })
				dispatch(dispatchUserAccountCache())
			})
			.catch((ex) => {
				const errorMessage = ex.message ? ex.message : 'No error message provided.'
				logEvent('CheckMultiuserPropertyError', { error: errorMessage })
			})
	}
}

export const signInInternally = (user, password, navigateCb) => async (dispatch, getState) => {
	if (!compare(user.psw, password)) {
		showAlert(I18n.t('loginFailedTitle'), I18n.t('loginFailedWrongPassword'), [{ text: I18n.t('alertOk') }])
		logEvent('UnblockApp', { email: user.email, success: false })
		return
	}

	logEvent('UnblockApp', { email: user.email, success: true })
	const { multiUsers, isLogged, store } = getState().auth
	const userInMultiUser = _.find(multiUsers, (eachUser) => eachUser.uid === user.uid)
	await dispatch({ type: USER_SET, payload: userInMultiUser })

	await dispatch(decideInitialRoute(userInMultiUser, store))

	await dispatch(dispatchUserAccountCache())
	await dispatch(updateQuantitySales())

	await loginUserOnIntercom(isLogged, user)

	dispatch(updateIntercomUserData())

	if (navigateCb) navigateCb()
}

export const updateMultiUser = (showLoading) => (dispatch, getState) => {
	if (showLoading) dispatch(startLoading())
	const { aid } = getState().auth
	const { uid } = getState().auth.user
	kyteAccountGetMultiUsers(aid)
		.then((account) => {
			const { multiUsers } = account.data
			if (multiUsers.length > 0) {
				dispatch({ type: SET_MULTI_USERS, payload: account.data.multiUsers })
				const currentUser = _.find(multiUsers, (eachUser) => eachUser.uid === uid)
				if (currentUser) {
					dispatch({ type: USER_SET, payload: currentUser })
				}
			}
			if (showLoading) dispatch(stopLoading())
		})
		.catch((error) => {
			if (showLoading) dispatch(stopLoading())
		})
}

export const partnerIntegration = (code) => async (dispatch, getState) => {
	const { aid } = getState().auth
	const store = {
		name: _.startCase(_.toLower(code)),
		image: await writePartnerLogo(_.toLower(code)),
	}
	return new Promise((resolve, reject) => {
		dispatch(startLoading())
		kyteAccountPartnerIntegration(aid, code)
			.then(async (result) => {
				dispatch({ type: ACCOUNT_STORE_SAVE, payload: store })
				dispatch({ type: UPDATE_USER_ACCOUNT, payload: result.data })
				dispatch(stopLoading())
				resolve()
			})
			.catch((error) => {
				dispatch({ type: ACCOUNT_STORE_SAVE, payload: store })
				dispatch(stopLoading())
				reject()
			})
	})
}

export const setUserAlreadySeenCatalogHelper = (alreadySeen) => async (dispatch, getState) => {
	await dispatch({ type: USER_ALREADY_SEEN_CATALOG_HELPER, payload: alreadySeen })
	dispatch(startLoading())
	kyteAccountUpdateUser(getState().auth.user.uid, '', { appInfo: getState().auth.user.appInfo })
		.then(async (res) => {
			await dispatch({ type: SET_MULTI_USERS, payload: res.data.multiUsers })
			await dispatch({ type: USER_SET, payload: res.data.user })
			dispatch(stopLoading())
		})
		.catch((error) => dispatch(stopLoading()))
}

export const setUserCustomInfo = (key, value) => (dispatch, getState) => {
	const { user, appInfo } = getState().auth
	dispatch(startLoading())
	kyteAccountUpdateUser(user.uid, '', { appInfo: { ...appInfo, [key]: value } })
		.then(async () => {
			dispatch({ type: SET_USER_CUSTOM_INFO, payload: { [key]: value } })
			dispatch(stopLoading())
		})
		.catch(() => dispatch(stopLoading()))
}

const updateFacebookFirebaseEmail = (email) =>
	new Promise((resolve, reject) =>
		AccessToken.getCurrentAccessToken()
			.then((data) => {
				if (!data.accessToken) return reject()
				const credential = getFacebookAuthCredential(data.accessToken)
				return authSignInWithCredential(credential)
			})
			.then((userAuth) => {
				const { user } = userAuth
				if (!user) return reject()
				return user.updateEmail(email)
			})
			.then(() => resolve())
			.catch(() => reject())
	)

export const setUserEmail = (email) => (dispatch, getState) =>
	new Promise((resolve, reject) => {
		const dispatchUserSet = (newUser) => {
			dispatch({ type: USER_SET, payload: newUser })
			resolve()
		}

		const { user } = getState().auth
		kyteAccountUpdateUser(user.uid, '', { email, authVerified: false })
			.then(() => {
				const newUser = { ...user, email, authVerified: false }
				if (user.provider === 'facebook.com') {
					return updateFacebookFirebaseEmail(email)
						.then(() => dispatchUserSet(newUser))
						.catch(() => dispatchUserSet(newUser))
				}
				dispatchUserSet(newUser)
			})
			.catch(() => reject())
	})

export const acceptKyteTerms = () => async (dispatch, getState) => {
	const { user } = getState().auth
	const deviceUniqueId = await getUniqueId()

	try {
		await kyteChangeTermsAnswer(user.aid, user.uid, { uniqueId: deviceUniqueId })
	} catch (error) {
		if (__DEV__) console.tron.logImportant('AcceptKyteTerms Error', error)
	}
}

export const hasCatalog = () => (dispatch, getState) => {
	const authState = getState().auth
	return !!authState.store.catalog
}

export const publishCatalog = (callback) => (dispatch, getState) => {
	const authStore = getState().auth.store
	const { ConfigStoreForm } = getState().form

	const catalog = {
		version: 3,
		active: true,
		theme: 'list',
		color: ConfigStoreForm?.values?.catalog?.color.toString() || 0,
		themeColor: ConfigStoreForm?.values?.catalog?.themeColor || '#FDCA40',
	}
	const store = { ...authStore, catalog }

	// Adiciona core action
	dispatch(preferenceAddCoreAction(CoreAction.PublishCatalog))
	logEvent('Catalog Create')
	return dispatch(storeAccountSave(store, callback))
}

export const goBackToCatalogVersion2 = (callback) => (dispatch, getState) => {
	const authStore = getState().auth?.store
	const catalogConfig = getState().auth?.store?.catalog

	const catalog = {
		...catalogConfig,
		whatsappOrder: false,
		version: 2,
	}

	const store = { ...authStore, catalog }

	return dispatch(storeAccountSave(store, callback))
}

export const setCampaignProps = (campaign) => async (dispatch, getState) => {
	const { campaignProps, aid } = getState().auth
	const newAttribution = { ...campaignProps, ...campaign }
	const campaignPropsHasChanged = !_.isEqual(campaignProps, newAttribution)
	const deviceUniqueId = await getUniqueId()
	const appInstanceId = await analyticsGetAppInstanceId()

	const attributionPayload = {
		aid,
		kid: deviceUniqueId,
		app_instance_id: appInstanceId,
		...newAttribution,
	}

	if (campaignPropsHasChanged) {
		try {
			await kyteSetAttribution(attributionPayload)
		} catch (ex) {
			logError(ex, `Error setting campaign props: ${ex.message}`)
		}
	}

	logEvent(SET_CAMPAIGN_PROPS, attributionPayload)
	dispatch({ type: SET_CAMPAIGN_PROPS, payload: campaign })
}
