import _ from 'lodash'
import moment from 'moment'
import DeviceInfo from 'react-native-device-info'

import { getAID } from '../../util'
import { refFirestoreCollectionAccount } from '../../integrations'
import { kyteFirstSync } from '../../services'
import { SyncDownStatus } from '../status'
import KyteErrorHandler from '../../integrations/ErrorHandler'
import { SyncDownRepositoryData } from '../syncDataManager'

const DOCUMENT_COLLECTION = 'documents'

let _lastDinc
let _cbLastDinc
const syncDocumentsCache = []

export const subscribeDocumentReceiveData = (syncDownStatusDispatcher, syncDownDocumentDispatcher, setDinc) => {
	const { lastDinc, cbLastDinc } = setDinc

	_lastDinc = lastDinc
	_cbLastDinc = cbLastDinc

	if (!_lastDinc) {
		syncDownStatusDispatcher(SyncDownStatus.NEED_SYNC)
		firstDataSync(syncDownStatusDispatcher, syncDownDocumentDispatcher).then(() =>
			firestoreListener(syncDownDocumentDispatcher)
		)
	} else {
		syncDownStatusDispatcher(SyncDownStatus.OK)
		firestoreListener(syncDownDocumentDispatcher)
	}
}

export const getDocumentsByModel = (model) => {
	return new Promise((resolve, reject) => {
		refDocumentsAccountCollection()
			.where('metadata.model', '==', model)
			.where('data.isChildren', 'not-in', [true])
			.orderBy('metadata.dinc', 'desc')
			.limit(100)
			.get()
			.then((documents) => _.map(documents.docs, (doc) => firebaseDataAdapter(doc.data())))
			.then((documents) => resolve(documents))
			.catch((error) => reject(error))
	})
}

const firstDataSync = (syncDownStatusDispatcher, syncDownDocumentDispatcher) => {
	return new Promise((resolve) => {
		kyteFirstSync(getAID())
			.then(({ data }) => {
				setLastDinc(data.dinc)
				SyncDownRepositoryData(data.documents, syncDownDocumentDispatcher)
				syncDownStatusDispatcher(SyncDownStatus.OK)
				resolve()
			})
			.catch((error) => KyteErrorHandler.addItemInErrorsQueue(error))
	})
}

let firebaseOnSnapshotListener
const firestoreListener = async (syncDownDocumentDispatcher) => {
	const deviceId = await DeviceInfo.getUniqueId()

	// only range-filter in Firestore
	const refCollection = refDocumentsAccountCollection()
		.where('metadata.dinc', '>', new Date(_lastDinc))
		.orderBy('metadata.dinc')
		.limit(500)

	firebaseOnSnapshotListener = refCollection.onSnapshot((snapshot) => {
		// only handle newly added/modified docs
		const docs = snapshot
			.docChanges()
			.filter((c) => c.type === 'added' || c.type === 'modified')
			.map((c) => c.doc.data())

		// 1) drop any child docs
		const parents = docs.filter((d) => d.data.isChildren !== true)

		// 2) drop your own pending writes & adapt
		const adapted = parents
			.filter((r) => !r.metadata.hasPendingWrites)
			.map(firebaseDataAdapter)
			.filter((d) => d.metadata.deviceId !== deviceId)

		// 3) dedupe & dispatch as before
		const toProcess = adapted.filter((d) => !syncDocumentsCache.includes(getKeySyncDocumentCache(d)))

		if (!toProcess.length) return

		const newest = _.maxBy(toProcess, 'metadata.dinc').metadata.dinc
		setLastDinc(newest, toProcess)
		SyncDownRepositoryData(toProcess, syncDownDocumentDispatcher)
	})
}

const setLastDinc = (lastDinc, documents = []) => {
	_lastDinc = lastDinc
	documents.map(getKeySyncDocumentCache).forEach((d) => syncDocumentsCache.push(d))
	_cbLastDinc(_lastDinc)
}

const getKeySyncDocumentCache = (d) => `${d.metadata.dinc}_${d.data.id}`
const refDocumentsAccountCollection = () => refFirestoreCollectionAccount(DOCUMENT_COLLECTION)

const firebaseDataAdapter = (model) => {
	const propKeysAdapted = ['metadata.dinc', 'data.dateCreation', 'data.dateClosed', 'data.category.dateCreation']

	let modelAdapted = { ...model }

	propKeysAdapted.forEach((propKey) => {
		const prop = _.get(modelAdapted, propKey)

		if (prop && typeof prop === 'object') {
			// This behavior started in 29/06/2022.
			// When you receive an order with a fractioned item and after this try to confirm it
			// the date is coming in a incorrect format where the app couldn't handle it.
			try {
				_.set(modelAdapted, propKey, prop.toDate())
			} catch (ex) {
				// TODO: ask to the backend team if this could be happening at their side
				// The problem is at Product.Category.dateCreation
				_.set(modelAdapted, propKey, moment.unix(prop._seconds).toDate())
			}
		}
	})

	if (modelAdapted.data.timeline) {
		modelAdapted = {
			...modelAdapted,
			data: {
				...modelAdapted.data,
				timeline: _.map(modelAdapted.data.timeline, (t) => {
					return { ...t, timeStamp: t.timeStamp?.toDate?.() || t.timeStamp }
				}),
			},
		}
	}

	return modelAdapted
}

export const unsubscribeFirestoreListener = () => (!firebaseOnSnapshotListener ? firebaseOnSnapshotListener() : null)
