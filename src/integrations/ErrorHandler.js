import AsyncStorage from '@react-native-community/async-storage'
import _ from 'lodash'
import moment from 'moment'
import { logError } from './Firebase-Integration'

const ERRORS_QUEUE_KEY = 'ERRORS_QUEUE'

export default class KyteErrorHandler {
	static async getErrorsQueue() {
		return new Promise((resolve, reject) => {
			AsyncStorage.getItem(ERRORS_QUEUE_KEY)
				.then((queue) => resolve(JSON.parse(queue)))
				.catch((error) => reject(error))
		})
	}

	static async addItemInErrorsQueue(item) {
		await KyteErrorHandler.getErrorsQueue().then(async (actualQueue) => {
			const newItem = { error: item, id: moment().unix() }
			const newQueue = actualQueue ? [...actualQueue, newItem] : [newItem]
			await AsyncStorage.setItem(ERRORS_QUEUE_KEY, JSON.stringify(newQueue)).then(() => {
				if (__DEV__) {
					console.tron.logImportant({
						message: 'A NEW ERROR HAS BEEN ADDED INTO ERRORS QUEUE AND WILL BE PROCESSED IN NEXT APP REFRESH!',
						queue: JSON.stringify(newQueue),
						error: item?.message || item,
					})
				}
			})
		})
	}

	static async removeItemFromErrorsQueue(item) {
		const actualQueue = await KyteErrorHandler.getErrorsQueue()
		await AsyncStorage.setItem(ERRORS_QUEUE_KEY, JSON.stringify(_.filter(actualQueue, (i) => i.id !== item.id)))
	}

	static async processErrorsQueue() {
		const actualQueue = await KyteErrorHandler.getErrorsQueue()
		if (!actualQueue) return
		actualQueue.forEach((item) => {
			if (!item.error) return
			logError(new Error(item.error))

			if (__DEV__) {
				console.tron.logImportant('One item has been synced with crashlytics', { item })
			}

			KyteErrorHandler.removeItemFromErrorsQueue(item)
		})
	}
}
