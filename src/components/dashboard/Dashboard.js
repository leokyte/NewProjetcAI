import React, { useCallback, useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'
import { Linking } from 'react-native'
import { DashboardVersionEnum } from '@kyteapp/kyte-utils/dist/enums'
import { saleDetail } from '../../stores/actions/SaleActions'
import { handleIntercomAction } from '../../integrations/Intercom'
import DashboardUI from './DashboardUI'
import NavigationService from '../../services/kyte-navigation'
import { canAccessSmartAssistant, checkIsBr, openAppUrl } from '../../util'
import {
	fetchDashboardStats,
	incrementDashboardViews,
	toggleDashboardValuesVisibility,
} from '../../stores/actions/DashboardActions'
import { getLocale } from '../../i18n/i18n'
import { logEvent, remoteConfigGetValue } from '../../integrations'
import { productDetailCreate } from '../../stores/actions/ProductActions'
import { kyteAdminFetchSample } from '../../services'
import navigateToSubscription from '../../util/navigation/subscription-navigate'

const Dashboard = ({
	auth,
	billing,
	currency,
	decimalCurrency,
	isValuesHidden,
	isOnline,
	stats,
	isLoading,
	doFetchDashboardStats,
	navigation,
	setSaleDetail,
	didLastFetchFail,
	lastFetchDate,
	version,
	account,
	doIncrementDashboardViews,
	totalDashboardViews,
	resetProductDetail,
	doToggleDashboardValuesVisibility,
	coreActions,
	userPermissions,
}) => {
	const [shouldFetchAgain, setShouldFetchAgain] = useState(false)
	const [kyteAdminData, setkyteAdminData] = useState()
	const [smartAssistantPlan, setSmartAssistantPlan] = useState()

	// TO-DO: Implement the useRef logic later to check if the user has navigated away from the dashboard
	// this code avoids duplicate fetches when the user back to the dashboard
	// but is causing sales total not to update when users first open the app
	// const hasNavigatedAwayRef = useRef(false)
	// useFocusEffect(
	// 	useCallback(() => {
	// 		if (hasNavigatedAwayRef.current) {
	// 			setShouldFetchAgain(true)
	// 			setTimeout(() => setShouldFetchAgain(false), 100)
	// 		}
	// 		return () => {
	// 			hasNavigatedAwayRef.current = true
	// 		}
	// 	}, [])
	// )

	useFocusEffect(
		useCallback(() => {
			setShouldFetchAgain(true)
			setTimeout(() => setShouldFetchAgain(false))
		}, [])
	)

	useEffect(() => {
		doIncrementDashboardViews()
		logEvent('Dashboard View', { dashboard_values_hidden: isValuesHidden })
		remoteConfigGetValue('SmartAssistantPlan', (value) => {
			if (value) {
				setSmartAssistantPlan(value.toLowerCase())
			}
		})
	}, [])

	const handleInternalNavigation = useCallback(
		(stackName, pageName) => {
			const isProductCreationPage = stackName === 'ProductCreate'
			const isPlanPage = stackName === 'Plans'
			const referralCode = account?.metadata?.referral?.code

			if (isPlanPage) {
				return navigateToSubscription(auth?.user?.email, auth?.user?.aid, billing, referralCode, coreActions)
			}

			if (isProductCreationPage) resetProductDetail?.()

			NavigationService.navigate(stackName, pageName)
		},
		[billing, account?.metadata?.referral]
	)

	const handleExternalNavigation = useCallback((uri) => {
		Linking.openURL(uri)
	}, [])

	const handleLogEvent = useCallback((eventName, additionalInfo = {}) => {
		logEvent(eventName, additionalInfo)
	}, [])

	const openOrderDetail = useCallback(
		(order) => {
			logEvent('Dashboard Order Detail Click')
			setSaleDetail(order)
			NavigationService.navigate('SaleDetail', 'SaleDetail', { sale: order, refreshSales: () => null })
		},
		[navigation]
	)

	const toggleValuesVisibility = () => {
		const eventAction = isValuesHidden ? 'Show' : 'Hide'
		logEvent(`Dashboard Values ${eventAction}`)
		doToggleDashboardValuesVisibility(!isValuesHidden)
	}

	const fetchKyteAdmin = useCallback(async () => {
		try {
			const data = await kyteAdminFetchSample(auth.user.aid)
			setkyteAdminData(data)
		} catch (error) {
			console.error('Failed to fetch admon data:', error)
		}
	}, [auth.user.aid])

	useEffect(() => {
		fetchKyteAdmin()
	}, [fetchKyteAdmin])

	const isDashboardViewsLessThan2 = totalDashboardViews < 2
	const shouldShowTooltip = isOnline && isDashboardViewsLessThan2

	return (
		<DashboardUI
			auth={auth.user}
			account={auth.account}
			billing={billing}
			isLoading={isLoading || shouldFetchAgain}
			didLastFetchFail={didLastFetchFail}
			lastFetchDate={lastFetchDate}
			stats={stats}
			currency={currency}
			decimalCurrency={decimalCurrency}
			isValueHidden={isValuesHidden}
			navigation={navigation}
			shouldFetchAgain={shouldFetchAgain}
			locale={getLocale()}
			handleFetchAgain={doFetchDashboardStats}
			handleInternalNavigation={handleInternalNavigation}
			handleExternalNavigation={handleExternalNavigation}
			handleIntercomAction={handleIntercomAction}
			handleAppNavigation={(...bla) => openAppUrl(...bla)}
			handleSelectOrder={openOrderDetail}
			canShowToolTip={shouldShowTooltip}
			handleLogEvent={handleLogEvent}
			onPressVisibilityBtn={toggleValuesVisibility}
			isBr={checkIsBr()}
			version={version || DashboardVersionEnum.V1}
			kyteAdminData={kyteAdminData}
			coreActions={coreActions}
			shouldShowAssistantButton={canAccessSmartAssistant({ billing, userPermissions, smartAssistantPlan })}
		/>
	)
}

function mapStateToProps({ preference, billing, auth, common, dashboard }) {
	const { currency, decimalCurrency, coreActions } = preference.account
	const { isOnline } = common
	const {
		salesStats,
		isFetching: isLoading,
		fetchedAt,
		didLastFetchFail,
		totalDashboardViews,
		isValuesHidden,
		version,
	} = dashboard

	return {
		currency,
		decimalCurrency,
		isValuesHidden,
		billing,
		auth,
		isOnline,
		isLoading,
		stats: salesStats,
		lastFetchDate: fetchedAt,
		didLastFetchFail,
		totalDashboardViews,
		version,
		account: auth.account,
		coreActions,
		userPermissions: auth.user.permissions,
	}
}

export default connect(mapStateToProps, {
	doFetchDashboardStats: fetchDashboardStats,
	setSaleDetail: saleDetail,
	doIncrementDashboardViews: incrementDashboardViews,
	resetProductDetail: productDetailCreate,
	doToggleDashboardValuesVisibility: toggleDashboardValuesVisibility,
})(Dashboard)
