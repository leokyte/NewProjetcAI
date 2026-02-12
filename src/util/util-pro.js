import { PROFeatures } from '../enums/PROFeatures'
import { getRemoteConfigJsonValue } from '../integrations'

export const generateDefaultPROFeatures = (proKey = null) => {
	let features = {}
	if (proKey) {
		const feature = PROFeatures.items.find((i) => i.remoteKey === proKey)
		features = { [feature.remoteKey]: feature }

		return features
	}

	for (let i = 0; i < PROFeatures.items.length; i++) {
		const feature = PROFeatures.items[i]
		features = { ...features, [feature.remoteKey]: feature }
	}
	return features
}

export const getPROFeature = async (proKey) => {
	try {
		return await getRemoteConfigJsonValue(proKey)
	} catch (ex) {
		return null
	}
}
