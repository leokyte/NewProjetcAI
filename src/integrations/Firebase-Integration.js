import * as RNLocalize from 'react-native-localize'
import { Platform, Linking } from 'react-native'
import { getApp, getApps, initializeApp } from '@react-native-firebase/app'
import analytics, {
	logEvent as analyticsLogEvent,
	logScreenView as analyticsLogScreenView,
	setAnalyticsCollectionEnabled as analyticsSetCollectionEnabled,
	setConsent as analyticsSetConsent,
	setUserId as analyticsSetUserId,
	setUserProperties as analyticsSetUserProperties,
	setUserProperty as analyticsSetUserProperty,
	getAppInstanceId as analyticsGetAppInstanceIdMod,
} from '@react-native-firebase/analytics'
import auth from '@react-native-firebase/auth'
import remoteConfig, {
	fetchAndActivate as fetchRemoteConfigAndActivate,
	getValue as getRemoteConfigValue,
	setConfigSettings as setRemoteConfigSettings,
	setDefaults as setRemoteConfigDefaults,
} from '@react-native-firebase/remote-config'
import firestore from '@react-native-firebase/firestore'
import {
	collection as firestoreCollectionMod,
	doc as firestoreDocMod,
	writeBatch as firestoreWriteBatchMod,
	setDoc as firestoreSetDocMod,
	updateDoc as firestoreUpdateDocMod,
} from '@react-native-firebase/firestore/lib/modular'
import { serverTimestamp as firestoreServerTimestampMod } from '@react-native-firebase/firestore/lib/modular/FieldValue'
import storage from '@react-native-firebase/storage'
import Intercom from '@intercom/intercom-react-native'
import crashlytics, {
	recordError as crashlyticsRecordErrorMod,
	setAttribute as crashlyticsSetAttributeMod,
	setUserId as crashlyticsSetUserIdMod,
} from '@react-native-firebase/crashlytics'
import { PLAN_FREE } from '@kyteapp/kyte-ui-components/src/packages/utils/util-billing'
import { getUniqueId } from 'react-native-device-info'
import AsyncStorage from '@react-native-community/async-storage'
import { AppEventsLogger } from 'react-native-fbsdk-next'
import { intercomEvents } from './Intercom'
import { isCatalogApp } from '../util/util-flavors'

import {
	getUID,
	getAID,
	firebaseConfig,
	getImagePath,
	localFileExist,
	decodeURLParams,
	momentFirebaseUserProperties,
	checkUserPermission,
	turnObjectPropertiesIntoString,
	turnObjectKeysIntoString,
} from '../util'
import { store } from '../App'
import { ErrorTypes, RemoteConfigDefaults, FlavorsEnum, FirebaseUserProperties } from '../enums'
import KyteMixpanel from './Mixpanel'
import I18n from '../i18n/i18n'
import { USER_IP_STORAGE_KEY } from '../constants/common'

const IMAGE_MIME = 'image/jpg'
const ACCOUNT_COLLECTION = 'account'
const lang = I18n.t('locale')

let firebaseApp
let analyticsConfigured = false

export const getFirebaseApp = () => {
	if (firebaseApp) {
		return firebaseApp
	}

	const apps = getApps()
	firebaseApp = apps.length ? getApp() : initializeApp(firebaseConfig)

	return firebaseApp
}

const analyticsModule = () => analytics(getFirebaseApp())
const remoteConfigModule = () => remoteConfig(getFirebaseApp())
const firestoreModule = () => firestore(getFirebaseApp())
const storageModule = () => storage(getFirebaseApp())
const crashlyticsModule = () => crashlytics(getFirebaseApp())
const authModule = () => auth(getFirebaseApp())

export const firestoreCollection = (parent, path, ...segments) =>
	firestoreCollectionMod(parent, path, ...segments)
export const firestoreDoc = (parent, path, ...segments) => firestoreDocMod(parent, path, ...segments)
export const firestoreSetDoc = (reference, data, options) =>
	firestoreSetDocMod(reference, data, options)
export const firestoreUpdateDoc = (reference, ...args) => firestoreUpdateDocMod(reference, ...args)

// AUTH HELPERS
export const authSignOut = () => authModule().signOut()
export const authSignInWithCredential = (credential) => authModule().signInWithCredential(credential)
export const authSignInWithEmailAndPassword = (email, password) => authModule().signInWithEmailAndPassword(email, password)
export const authCreateUserWithEmailAndPassword = (email, password) =>
	authModule().createUserWithEmailAndPassword(email, password)
export const authFetchSignInMethodsForEmail = (email) => authModule().fetchSignInMethodsForEmail(email)
export const getGoogleAuthCredential = (idToken, accessToken) =>
	auth.GoogleAuthProvider.credential(idToken, accessToken)
export const getAppleAuthCredential = (identityToken, nonce) =>
	auth.AppleAuthProvider.credential(identityToken, nonce)
export const getFacebookAuthCredential = (accessToken) => auth.FacebookAuthProvider.credential(accessToken)

export const firebaseInit = async () => {
	if (analyticsConfigured) {
		return
	}

	const module = analyticsModule()
	await analyticsSetCollectionEnabled(module, true)
	await analyticsSetConsent(module, {
		ad_storage: true,
		ad_user_data: true,
		analytics_storage: true,
		ad_personalization: true,
		personalization_storage: true,
	})
	analyticsConfigured = true
}

// STORAGE

export const putStorageImage = (document, cbResolve) => {
	const { uid, id, image } = document
	const metadata = {
		contentType: IMAGE_MIME,
		customMetadata: {
			id,
		},
	}
	const imageDevice = getImagePath(image)
	const processImageUpload = (imageRef) =>
		imageRef
			.putFile(imageDevice, metadata)
			.then((snap) => {
				const error = snap.state !== 'success' ? snap.error : null
				return cbResolve(image, error)
			})
			.catch((error) => cbResolve(image, error.code))

	localFileExist(imageDevice)
		.then((existsLocally) => {
			if (!existsLocally) {
				return cbResolve(image, {
					code: ErrorTypes.items[ErrorTypes.STORAGE_IMAGE_UPLOAD_DOESNT_EXISTS_LOCALLY].type,
				})
			}
			return storageImageRef(uid, imageDevice).getDownloadURL()
		})
		.then((hasDownloadUrl) => {
			if (hasDownloadUrl) {
				return cbResolve(image, {
					code: ErrorTypes.items[ErrorTypes.STORAGE_IMAGE_UPLOAD_ALREADY_EXISTS].type,
				})
			}
		})
		.catch((error) => {
			if (error.code === 'storage/object-not-found') {
				return processImageUpload(storageImageRef(uid, imageDevice))
			}
			cbResolve(image, error.code)
		})
}

export const putStorageImageAccount = (document) => {
	const { aid, _id, image, banner } = document
	const metadata = {
		contentType: IMAGE_MIME,
		customMetadata: { _id, banner: banner !== undefined ? banner.toString() : false },
	}

	const imageDevice = document.useFilepath ? image : getImagePath(image)

	return new Promise((resolve, reject) => {
		const imageRef = storageImageRef(aid, imageDevice)
		imageRef
			.putFile(imageDevice, metadata)
			.then((snap) => {
				if (snap.state !== 'success') return reject()
				return imageRef.getDownloadURL()
			})
			.then((imageUrl) => resolve(imageUrl))
			.catch((error) => reject(error))
	})
}

export const storageImageRef = (idRef, image) => {
	const imgName = image.split('/').pop()
	return storageRef(idRef).child(imgName)
}

const storageRef = (idRef) => storageModule().ref(`${idRef}`)
export const firestoreCreateBatch = () => firestoreWriteBatchMod(firestoreModule())
export const firestoreServerTimestamp = () => firestoreServerTimestampMod()

// FIRESTORE
export const refFirestoreCollection = (rootCollection, collection) => {
	const root = firestoreCollection(firestoreModule(), rootCollection)
	const userDoc = firestoreDoc(root, getUID())
	return firestoreCollection(userDoc, collection)
}

export const refFirestoreCollectionAccount = (collection) => {
	const root = firestoreCollection(firestoreModule(), ACCOUNT_COLLECTION)
	const accountDoc = firestoreDoc(root, getAID())
	return firestoreCollection(accountDoc, collection)
}

export const dynamicLinkForAppOpening = async () => {
	try {
		const url = await Linking.getInitialURL()
		if (!url) return
		const params = decodeURLParams(url) || {}
		const utmParameters = Object.keys(params || {}).reduce((acc, key) => {
			if (key?.toLowerCase().startsWith('utm_')) {
				acc[key] = params[key]
			}
			return acc
		}, {})
		return { utmParameters, params }
	} catch (err) {
		if (__DEV__) console.tron.logImportant('dynamicLinkForAppOpening Error: ', err)
	}
}

// ANALYTICS
export const logEvent = async (eventName, additionalInfo = {}) => {
	try {
		const { common } = store.getState()
		const currentApp = isCatalogApp() ? FlavorsEnum.CATALOG : FlavorsEnum.POS
		const userIP = await AsyncStorage.getItem(USER_IP_STORAGE_KEY)
		const info = { ...additionalInfo, isOnline: common.isOnline, multiapp: currentApp, ip: userIP }

		await analyticsLogEvent(analyticsModule(), eventName.replace(/\s/g, ''), info)
		KyteMixpanel.track(eventName, info)
		AppEventsLogger.logEvent(eventName, info)

		if (intercomEvents.includes(eventName)) {
			Intercom.logEvent(eventName, info)
		}
	} catch (ex) {
		// this block is to avoid any mistakes and will prevent any breaks regarding wrong calls of this method.
		if (__DEV__) {
			console.tron.logImportant('logEvent error', ex.message)
		}
	}
}

export const logScreenView = (params) => analyticsLogScreenView(analyticsModule(), params)

const ensureErrorInstance = (error) => {
	if (error instanceof Error) {
		return error
	}

	if (typeof error === 'string') {
		return new Error(error)
	}

	try {
		const serialized = JSON.stringify(error)
		return new Error(serialized)
	} catch (serializationError) {
		return new Error('Unknown error object received in logError')
	}
}

export const logError = (error, errorName = null) => {
	const normalizedError = ensureErrorInstance(error)

	try {
		crashlyticsRecordErrorMod(crashlyticsModule(), normalizedError, errorName || undefined)
	} catch (ex) {
		// this block is to avoid any mistakes and will prevent any breaks regarding wrong calls of this method.
	}
}

// Log events for sign up and login with campaign properties
export const logSignUpEvent = async ({ getState, isNewUser, method, user }) => {
	const { campaignProps } = getState().auth
	const deviceUniqueId = await getUniqueId()
	const deviceCountry = RNLocalize.getCountry()

	try {
		const eventProps = {
			aid: user?.aid,
			uid: user?.uid,
			email: user?.email,
			app: user?.app,
			os: Platform.OS,
			country: deviceCountry,
			provider: method,
			kid: deviceUniqueId,
			...campaignProps,
		}

		logEvent(isNewUser ? 'sign_up' : 'login', eventProps)
	} catch (ex) {
		crashlyticsRecordErrorMod(crashlyticsModule(), ex, `logSignUpEvent error: ${ex.message}`)
	}
}

export const crashlyticsSetAttribute = (key, value) =>
	crashlyticsSetAttributeMod(crashlyticsModule(), key, value)

export const setAnalyticsUserId = (userId) => {
	if (userId) {
		analyticsSetUserId(analyticsModule(), userId)
		crashlyticsSetUserIdMod(crashlyticsModule(), userId)
	}
}

export const remoteConfigSetDefaults = () => {
	const moduleInstance = remoteConfigModule()
	setRemoteConfigSettings(moduleInstance, {
		isDeveloperModeEnabled: __DEV__,
		minimumFetchIntervalMillis: 0,
	})
	if (__DEV__) {
		console.tron.logImportant('RemoteConfigDefaults', RemoteConfigDefaults)
	}
}

const extractConfigKey = (key, remoteConfigValue, cb, type) => {
	if (!remoteConfigValue) {
		return
	}
	let keyValue

	switch (type) {
		case 'json': {
			const stringValue = remoteConfigValue.asString()

			if (!stringValue) {
				keyValue = RemoteConfigDefaults?.[key] ?? null
				break
			}

			try {
				keyValue = JSON.parse(stringValue)
			} catch (error) {
				console.log(`[error] Parsing remote config json for ${key}`, error)
				keyValue = RemoteConfigDefaults?.[key] ?? null
			}
			break
		}
		case 'string':
			keyValue = remoteConfigValue.asString()
			break
		case 'boolean':
			keyValue = remoteConfigValue.asBoolean()
			break
		default:
			return
	}

	cb(keyValue)
}

export const remoteConfigGetValue = async (key, cb, type = 'string') => {
	const moduleInstance = remoteConfigModule()
	try {
		const currentValue = await remoteConfig().getValue(key)

		if (currentValue) {
			extractConfigKey(key, currentValue, cb, type)
		}
	} catch (error) {
		console.log('[error] Getting current value:', error)
	}

	return remoteConfig()
		.setDefaults(RemoteConfigDefaults)
		.then(() => remoteConfig().fetchAndActivate())
		.then((values) => {
			remoteConfig().setConfigSettings({ minimumFetchIntervalMillis: 0 })
			extractConfigKey(key, cb, type)
		})
		.catch((error) => {
			console.log('[error] remoteConfigGetValue', error)
		})
}

export const getRemoteConfigJsonValue = async (key) => {
	try {
		const moduleInstance = remoteConfigModule()
		const value = await getRemoteConfigValue(moduleInstance, key)
		const stringValue = value?.asString?.()
		if (!stringValue) {
			return null
		}
		return JSON.parse(stringValue)
	} catch (error) {
		console.log('[error] getRemoteConfigJsonValue', error)
		return null
	}
}

// User Properties
export const firebaseSetUserProperties = (properties) =>
	analyticsSetUserProperties(analyticsModule(), properties)
export const firebaseSetUserProperty = (name, value) =>
	analyticsSetUserProperty(analyticsModule(), name, value)
export const analyticsGetAppInstanceId = () => analyticsGetAppInstanceIdMod(analyticsModule())

export const firebaseSetBasicUserProperties = async (getState) => {
	const { auth, billing } = getState()
	const campaignProps = auth.campaignProps || {}
	const deviceUniqueId = await getUniqueId()
	const keys = FirebaseUserProperties

	// Turn all campaign object keys into string to match the pattern of the others
	const userCampaignProps = turnObjectKeysIntoString(campaignProps)

	const properties = {
		[keys.NAME]: auth.user.displayName,
		[keys.EMAIL]: auth.user.email,
		[keys.AID]: auth.user.aid,
		[keys.UID]: auth.user.uid,
		[keys.IS_OWNER]: (checkUserPermission(auth.user.permissions).isOwner || false).toString(),
		[keys.IS_CONFIRMED]: auth.user.authVerified.toString(),
		[keys.IS_IN_TOLERANCE]: (billing.status === 'tolerance').toString(),
		[keys.DATE_CREATION]: momentFirebaseUserProperties(auth.user.dateCreation),
		[keys.BILLING_END_DATE]: momentFirebaseUserProperties(billing.endDate),
		[keys.BILLING_STATUS]: billing.status || PLAN_FREE,
		[keys.BILLING_PLAN]: billing.plan || PLAN_FREE,
		[keys.BILLING_BUY_DATE]: momentFirebaseUserProperties(billing.buyDate),
		[keys.CATALOG_URL]: auth.store.urlFriendly || 'not-set',
		[keys.LANGUAGE_OVERRIDE]: lang,
		[keys.SESSION_START]: momentFirebaseUserProperties(new Date()),
		[keys.LOGIN_PROVIDER]: auth.user.provider,
		[keys.KID]: deviceUniqueId,
		...userCampaignProps,
	}

	try {
		// All properties are turned into string to avoid issues with firebase analytics
		return firebaseSetUserProperties(turnObjectPropertiesIntoString(properties))
	} catch (ex) {
		if (__DEV__) {
			console.tron.logImportant({ error: ex.message, properties })
		}
	}
}
