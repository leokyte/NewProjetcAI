import { SyncStatus } from '../enums/SyncStatus'

export function markSyncStatus(document, syncStatus) {
	return { ...document, syncStatus }
}

export function markDocumentAs(document, syncStatus) {
	return markSyncStatus(document, syncStatus)
}

export function checkHasNeverBeenOnServer(document) {
	const hasNeverBeenOnServer = document?.syncStatus === SyncStatus.NEVER_ON_SERVER

	return hasNeverBeenOnServer
}

export function checkHasBeenSyncedOnServer(document) {
	const hasBeenSyncedOnServer = document?.syncStatus === SyncStatus.SYNCED

	return hasBeenSyncedOnServer
}

export const checkHasBeenOnServer = (document) => !checkHasNeverBeenOnServer(document)
