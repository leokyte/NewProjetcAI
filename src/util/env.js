import axios from 'axios'
import Config from 'react-native-config'
import I18n from '../i18n/i18n'

export const kyteCatalogDomain = Config.ENV === 'stage' ? '.stagebeta.kyte.site' : '.kyte.site'
export const kyteCatalogBetaDomain = '.beta.kyte.site'
export const redirappURL = I18n.t('kyteStoreURL')
export const appleBillingTutorialURL = 'https://www.kyte.com.br/tutoriais/gerenciar-assinatura-apple'
export const imgUrl = `https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o`
export const catalogBaseUrl = 'https://kyte.site/'

const services = {
	userAccount: Config.KYTE_USER_ACCOUNT_URL,
	data: Config.KYTE_DATA_URL,
	sender: Config.KYTE_SENDER_URL,
	stats: Config.KYTE_STATS_URL,
	pay: Config.KYTE_API_URL,
}

export const firebaseConfig = {
	apiKey: 'AIzaSyDnTaitHm-VyPE-74Ji3qWiATNrvGAPNFI',
	authDomain: 'kyte-7c484.firebaseapp.com',
	databaseURL: 'https://kyte-7c484.firebaseio.com',
	projectId: 'kyte-7c484',
	appId: 'com.kyte',
	storageBucket: 'kyte-7c484.appspot.com',
	messagingSenderId: '1068616619719',
}
const ROOT_FIREBASE_URL = 'https://us-central1-kyte-7c484.cloudfunctions.net/api'

export const firebaseUrlConfig = {
	countData: '/countData',
	getAllData: '/getAllData',
	deleteAllData: '/deleteAllData',
}

export const googleSigninConfig = {
	// scopes: ['email', 'profile'],
	webClientId: '1068616619719-tvgp141h51nraam1dasnk441dv0qq2l1.apps.googleusercontent.com',
	iosClientId: '1068616619719-q5ic3e4iom9ho8a8lob8o7tm5aie3jf6.apps.googleusercontent.com',
	// offlineAccess: true,
	// forceConsentPrompt: true
}

export const kyteAccountServiceUrl = services.userAccount
export const kyteStatisticServiceUrl = services.stats
export const kyteDataServiceUrl = services.data
export const kyteSenderServiceUrl = services.sender

// export const kyteAccountServiceUrl = 'https://kyte-user-account.azurewebsites.net/api';
// export const kyteStatisticServiceUrl = 'https://kyte-stats-linux.azurewebsites.net/api';
// export const kyteDataServiceUrl = 'https://kyte-data.azurewebsites.net/api';
// export const kyteSenderServiceUrl = 'https://kyte-sender.azurewebsites.net';
// export const kyteFunctionsServiceUrl = 'https://us-central1-kyte-7c484.cloudfunctions.net';

export const axiosAPI = axios.create({
	baseURL: ROOT_FIREBASE_URL,
	timeout: 10000,
})
