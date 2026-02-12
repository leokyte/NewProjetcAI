import DeviceInfo from 'react-native-device-info'

import { updateMany, deleteAll } from '../repository'
import { getAID } from '../util'
import { kyteDataClearData } from '../services'

import { syncUpDocument, syncUpManyDocument } from './server-manager/documentUpServerManager'
import { getDocumentsByModel, subscribeDocumentReceiveData } from './server-manager/documentDownServerManager'
import { initStorageServer, syncUpStorage } from './server-manager/storageServerManager'

const syncManagerInit = (syncDownStatusDispatcher, syncDownDocumentDispatcher, setDinc) => {
	subscribeDocumentReceiveData(syncDownStatusDispatcher, syncDownDocumentDispatcher, setDinc)
	initStorageServer()
}

// SYNC UP
export const SyncUpRepositoryData = (modelName, data, isUpdated) => {
	if (Array.isArray(data)) {
		syncUpManyDocument(modelName, data)
		return
	}

	syncUpDocument(modelName, data, isUpdated)
	if (hasStorage(data)) {
		syncUpStorage(data)
	}
}

// SYNC DOWN
export const SyncDownRepositoryData = (documents, syncDownDocumentDispatcher) => {
	// Preventing children products from being synced
	const nonChildrenDocuments = documents?.filter((doc) => !doc?.data?.isChildren)

	if (!nonChildrenDocuments?.length) return
	updateMany(nonChildrenDocuments).then(() => {
		syncDownDocumentDispatcher(nonChildrenDocuments)
	})
}

// const listenerReceiveNotificationData = (document) => {
//   _pubNotification(document);
// };

const hasStorage = (data) => !!data.image || !!data.gallery

const resetStore = () => {
	return new Promise(async (resolve, reject) => {
		const deviceUniqueId = await DeviceInfo.getUniqueId()
		kyteDataClearData(getAID(), deviceUniqueId)
			.then(() => {
				deleteAll()
				resolve()
			})
			.catch((ex) => reject(ex))
	})
}

// TODO: adicionar evento no Firebase para saber se o usuário utilizou o
// pull-to-update e assim sabermos quantas pessoas utilizaram
const getAndUpdateDocumentsByModel = (model) => {
	return new Promise((resolve, reject) => {
		getDocumentsByModel(model)
			.then((documents) => Promise.all([updateMany(documents), documents]))
			.then(([updateResult, documents]) => resolve(documents))
			.catch((error) => reject(error))
	})
}

export { syncManagerInit, resetStore, getAndUpdateDocumentsByModel }
