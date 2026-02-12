import { HelperStepsStates } from '../enums'
import { calculePercent } from './'
import { kyteAdminFetchSample } from '../services/kyte-admin'
import Sample from '../enums/Sample'
import { logEvent } from '../integrations'
import { checkUserPermission } from './util-common'
import { isCatalogApp } from './util-flavors'

const stepState = (state) => HelperStepsStates.items[HelperStepsStates[state]].id
const active = stepState('ACTIVE')
const completed = stepState('COMPLETED')
const highlighted = stepState('HIGHLIGHTED')
const disabled = stepState('DISABLED')

export const guidedStepState = (actual, list) => {
	const firstProduct = list.find((step) => step.id === 'first-product')
	const hasCompleted = list.find((step) => step.completed)

	if (actual.completed) return completed

	if (!firstProduct.completed && !hasCompleted) {
		if (actual.id === 'first-product') return highlighted
		return disabled
	}

	if (!firstProduct.completed) {
		if (actual.id === 'first-product') return highlighted
		return active
	}

	if (actual.highlight) return highlighted

	return active
}

export const unguidedStepState = (actual, list) => {
	const firstProduct = list.find((step) => step.id === 'first-product')
	const hasCompleted = list.find((step) => step.completed)

	if (!firstProduct.completed && !hasCompleted) {
		if (actual.id === 'first-product') return highlighted
		return disabled
	}
	if (actual.completed) return completed

	return highlighted
}

function setHighligthedStep(helperSteps) {
	return helperSteps.reduce((acc, cur, index) => {
		const firstCompleted = acc.find((step) => step.completed)
		const hasHighlighted = acc.find((step) => step.highlight)
		const highlight = firstCompleted && !hasHighlighted && !cur.completed

		const actual = { ...cur, index, highlight }
		return [...acc, actual]
	}, [])
}

export const buildHelperSteps = (apiSteps, reducerSteps) => {
	const filterSteps = reducerSteps.filter((enumStep) => apiSteps.find((api) => api.id === enumStep.id))

	const steps = filterSteps.map((reducerStep) => {
		const apiStep = apiSteps.find((s) => s.id === reducerStep.id)
		return { ...reducerStep, ...apiStep }
	})

	return setHighligthedStep(steps)
}

export const helperCompletionState = (helperSteps) => {
	const completedSteps = helperSteps.filter((step) => step.completed)
	return calculePercent(helperSteps.length, completedSteps.length)
}

const removeAccents = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const getEncodeURIComponent = (value) => {
	if (value) {
		const normalizedValue = removeAccents(value)
		const regex = /[^a-zA-Z0-9-_]+/gu
		const valueWithRegex = normalizedValue.replace(regex, ' ')
		const encodedValue = encodeURIComponent(valueWithRegex.trim().replace(/\s+/g, '-'))
		return encodedValue
	}
	// replaces a character other than a letter, digit, hyphen or underscore with empty
	return value
}

export const formatCatalogUrl = (value = '') => {
	const regex = /(?![0-9a-z-])./gi
	const valueWithHyphens = value.replace(/ ([0-9a-z])/gi, '-$1')
	const prunedCatalogUrl = removeAccents(valueWithHyphens.toLowerCase())
	const formattedCatalogUrl = prunedCatalogUrl.replace(regex, '')

	return formattedCatalogUrl
}

export const fetchUserOnboardingGroup = async (aid) => {
	const userOnboardingGroup = { initialScreen: Sample.DEFAULT_SCREEN, userGroup: undefined }
	let timeoutHandler

	try {
		const sample = await new Promise(async (resolve) => {
			timeoutHandler = setTimeout(() => {
				resolve(Sample.DEFAULT_SCREEN)
			}, 5000)

			const result = await kyteAdminFetchSample(aid)
			const userGroup = result?.[Sample.NAME] || ''
			userOnboardingGroup.userGroup = userGroup

			resolve(userGroup)
		})
		clearTimeout(timeoutHandler)

		switch (sample) {
			case Sample.CONTROLE:
				userOnboardingGroup.initialScreen = Sample.DEFAULT_SCREEN
				break
			case Sample.DASHBOARD:
				userOnboardingGroup.initialScreen = Sample.DASHBOARD_SCREEN
				break
			default:
				userOnboardingGroup.initialScreen = Sample.DEFAULT_SCREEN
		}
	} catch (error) {
		userOnboardingGroup.initialScreen = Sample.DEFAULT_SCREEN
		logEvent('Home Experiment Fetch Fail')
		if (__DEV__) {
			console.log('Error fetchUserOnboardingGroup: ', error)
		}
	}

	return userOnboardingGroup
}

export const getInitialRoute = ({ defaultInitialRoute = Sample.DEFAULT_SCREEN, user, hasCatalog } = {}) => {
	const isKyteCatalogApp = isCatalogApp()
	const userPermissions = checkUserPermission(user?.permissions)
	const hasPermission = userPermissions.isAdmin || userPermissions.isOwner
	
	// TODO: create screens ENUM
	const initialRouteCatalogApp = !hasCatalog ? 'OnlineCatalog' : 'CurrentSale'
	const initialRoutePOSApp = hasPermission ? defaultInitialRoute : 'CurrentSale'

	const initialRoute = isKyteCatalogApp ? initialRouteCatalogApp : initialRoutePOSApp

	return initialRoute
}
