import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'

import { MainDrawerNavigator } from '../Router'
import { SignInStack } from '../screens'
import LoadingScreen from './common/LoadingScreen'
import { AnswersScreen } from '../integrations'
import {
	updateDrawerVisibility,
	updateSaleQuantity,
	commonSetIsOnline,
	setActualRouteName,
	setCampaignProps,
} from '../stores/actions'
import { SyncDownStatus } from '../sync'
import I18n from '../i18n/i18n'
import { initUtilFile, linking } from '../util'
import NavigationService from '../services/kyte-navigation'
import { isCatalogApp } from '../util/util-flavors'

class AuthContainer extends Component {
	componentDidMount() {
		initUtilFile()
	}

	shouldComponentUpdate(nextProps) {
		const { syncDownResult, isLogged } = this.props
		const { syncDownResult: nextSyncDownResult, isLogged: nextIsLogged } = nextProps

		if (isLogged !== nextIsLogged) {
			return true
		}

		// remove for improve reports of tracking
		// this comparison needs to be with boolean explicit because sometimes 'isLogged' is equals to null
		// if (isLogged === false && nextIsLogged) {
		//  LoginTracker.trackSuccessEvent(APP_SALE_SCREEN);
		// }

		return (
			(syncDownResult.syncDownStatus === SyncDownStatus.BLANK &&
				nextSyncDownResult.syncDownStatus === SyncDownStatus.OK) ||
			syncDownResult.syncDownStatus === SyncDownStatus.NEED_SYNC ||
			syncDownResult.syncDownStatus === SyncDownStatus.BLANK
		)
	}

	traceNavigation() {
		const { actualRouteName } = this.props
		const routeName = NavigationService.getActiveRouteName()

		if (actualRouteName !== routeName) {
			this.props.setActualRouteName(routeName)
			AnswersScreen(routeName)
		}
	}

	render() {
		const {
			initialRouteName: commonInitialRoute,
			syncDownResult,
			isLogged,
			actualRouteName,
			loadingAuthentication,
		} = this.props
		const isKyteCatalogApp = isCatalogApp()
		const navigationKey = isLogged ? 'app' : 'auth'

		const needSync =
			syncDownResult.syncDownStatus === SyncDownStatus.BLANK ||
			syncDownResult.syncDownStatus === SyncDownStatus.NEED_SYNC

		if (isLogged) {
			if (needSync) {
				return <LoadingScreen description={I18n.t('syncingScreenMessage')} />
			}
			return (
				<NavigationContainer
					key={navigationKey}
					fallback={
						<LoadingScreen
							description={isKyteCatalogApp ? I18n.t('openingScreenMessageCatalogApp') : I18n.t('openingScreenMessage')}
						/>
					}
					linking={linking}
					onStateChange={() => this.traceNavigation()}
					ref={(navigatorRef) => NavigationService.setTopLevelNavigator(navigatorRef)}
				>
					<MainDrawerNavigator initialRouteName={commonInitialRoute} actualRouteName={actualRouteName} />
				</NavigationContainer>
			)
		}

		// Since reducers state from redux persist is not yet loaded on app start,
		// null is used to represent the initial state of the application.
		// so: null = initial state, false = not logged, true = logged
		// ugly but thats the way it works in the current architecture
		const isAppLoading = isLogged === null || loadingAuthentication === null
		const showLoadingScreen = isAppLoading || loadingAuthentication
		if (showLoadingScreen) {
			return (
				<LoadingScreen
					description={isKyteCatalogApp ? I18n.t('openingScreenMessageCatalogApp') : I18n.t('openingScreenMessage')}
				/>
			)
		}

		return (
			<NavigationContainer
				key={navigationKey}
				ref={(navigatorRef) => NavigationService.setTopLevelNavigator(navigatorRef)}
			>
				<SignInStack />
			</NavigationContainer>
		)
	}
}

const mapStateToProps = (state) => ({
	isLogged: state.auth.isLogged,
	store: state.auth.store,
	syncDownResult: state.sync.syncDownResult,
	initialRouteName: state.common.initialRouteName,
	actualRouteName: state.common.actualRouteName,
	campaignProps: state.auth.campaignProps,
	loadingAuthentication: state.auth.loadingAuthentication,
	onboarding: state.onboarding,
})

export default connect(mapStateToProps, {
	updateDrawerVisibility,
	updateSaleQuantity,
	commonSetIsOnline,
	setActualRouteName,
	setCampaignProps,
})(AuthContainer)
