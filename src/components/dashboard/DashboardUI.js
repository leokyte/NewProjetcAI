import React, { useEffect, useState } from 'react'
import { Container, colors, KyteButton, Body12, Margin, isFree, IconButton } from '@kyteapp/kyte-ui-components'
import Dashboard from '@kyteapp/kyte-dashboard/dist/components/Dashboard'
import moment from 'moment/min/moment-with-locales'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Config from 'react-native-config'
import { TabletScreenContainer } from '../common/scaffolding/TabletScreenContainer'
import { KyteSafeAreaView } from '../common/KyteSafeAreaView'
import { KyteToolbar } from '../common/KyteToolbar'
import I18n from '../../i18n/i18n'
import { logEvent, remoteConfigGetValue } from '../../integrations'
import { RemoteConfigDefaults } from '../../enums'
import navigateToSubscription from '../../util/navigation/subscription-navigate'
import { Platform } from 'react-native'

const DashboardUI = ({
	auth,
	account,
	billing,
	currency,
	decimalCurrency,
	isValueHidden,
	navigation,
	stats,
	isLoading,
	didLastFetchFail,
	lastFetchDate,
	shouldFetchAgain,
	handleFetchAgain,
	handleAppNavigation,
	handleInternalNavigation,
	handleExternalNavigation,
	handleIntercomAction,
	handleSelectOrder,
	locale,
	isBr,
	canShowToolTip,
	handleLogEvent,
	onPressVisibilityBtn,
	version,
	kyteAdminData,
	coreActions,
	shouldShowAssistantButton,
}) => {
	const statusBarText =
		!didLastFetchFail || !lastFetchDate
			? ''
			: `${I18n.t('dashboard.statusBarText')} ${moment(lastFetchDate).format('DD/MM/YYYY HH:mm')}`

	const [subscribeBtn, setSubscribeBtn] = useState(RemoteConfigDefaults.dashboardSubscribeBtn)
	const shouldShowSubscribeBtn = isFree(billing) && subscribeBtn.enabled
	const insets = useSafeAreaInsets()

	useEffect(() => {
		remoteConfigGetValue('DashboardSubscribeBtn', (k) => setSubscribeBtn(k), 'json')
	}, [])

	const rightComponent = () => (
		<Margin horizontal={16}>
			<KyteButton
				onPress={() => {
					const referralCode = account?.metadata?.referral?.code
					logEvent('Dashboard Subscribe Click', { where: 'header' })
					navigateToSubscription(auth?.email, auth?.aid, billing, referralCode, coreActions)
				}}
				backgroundColor={subscribeBtn.backgroundColor}
				size="small"
				containerStyle={{
					paddingHorizontal: 0,
					width: 84,
				}}
				textStyle={{
					textAlign: 'center',
				}}
			>
				<Body12 weight={500} color={subscribeBtn.textColor} lineHeight={16}>
					{subscribeBtn.btnLabel[I18n.t('locale')].toUpperCase()}
				</Body12>
			</KyteButton>
		</Margin>
	)

	return (
		<TabletScreenContainer maxHeight={620}>
			<KyteSafeAreaView
				style={{
					height: '100%',
					backgroundColor: colors.gray02Kyte,
				}}
				edges={['top', 'right', 'left']}
			>
				<Container flex={1} backgroundColor={colors.gray10} style={{ paddingBottom: insets.bottom }}>
					<Container style={{ flexGrow: 0 }}>
						<KyteToolbar
							borderBottom={0}
							backgroundColor={colors.gray02Kyte}
							headerTitle={I18n.t('sideMenu.dashboard')}
							navigate={navigation?.navigate}
							navigation={navigation}
							headerTextStyle={{ color: colors.white }}
							menuButtonProps={{ color: colors.white }}
							rightComponent={shouldShowSubscribeBtn ? rightComponent() : null}
						/>
					</Container>
					<Container flex={1}>
						<Dashboard
							baseUrl={Config.API_CDN_DEFAULT_URL}
							urlKey={Config.APIM_SUBSCRIPTION_KEY}
							auth={auth}
							currency={currency}
							decimalCurrency={decimalCurrency}
							isValueHidden={isValueHidden}
							isLoading={isLoading}
							statusBarText={statusBarText}
							shouldFetchAgain={shouldFetchAgain}
							locale={locale}
							handleAppNavigation={handleAppNavigation}
							handleInternalNavigation={handleInternalNavigation}
							handleExternalNavigation={handleExternalNavigation}
							handleIntercomAction={handleIntercomAction}
							handleSelectOrder={handleSelectOrder}
							handleFetchAgain={handleFetchAgain}
							onPressVisibilityBtn={onPressVisibilityBtn}
							stats={{
								currentMonthValue: stats?.month?.amount,
								todayCount: stats?.today?.amount,
								todayValue: stats?.today?.value,
								yesterdayValue: stats?.yesterday?.value,
							}}
							canShowToolTip={canShowToolTip}
							handleLogEvent={handleLogEvent}
							strings={{
								buttonLabelSimulateSale: I18n.t('dashboard.buttonLabelStartSale'),
								buttonLabelStartSale: I18n.t('dashboard.buttonLabelStartSale'),
								concludedSaleText1: I18n.t('words.s.in'),
								concludedSaleText2: I18n.t('dashboard.concludedSaleText2'),
								thisMonthText: I18n.t('dashboard.thisMonthText'),
								topText: I18n.t('dashboard.topText'),
								yesterdayText: I18n.t('dashboard.yesterdayText'),
								loadingText: I18n.t('dashboard.loadingText'),
								loadingText2: I18n.t('dashboard.loadingText2'),
								error: {
									title: I18n.t('dashboard.error.title'),
									subtitle: I18n.t('dashboard.error.subtitle'),
									btnTryAgain: I18n.t('dashboard.error.btnTryAgain'),
								},
								toolTipText: I18n.t('words.m.pullToRefresh'),
								visibilityToast: {
									title: I18n.t('dashboard.visibilityToast.title'),
									subtitle: I18n.t('dashboard.visibilityToast.subtitle'),
								},
							}}
							version={version}
							kyteAdminData={kyteAdminData}
							isBr={isBr}
						/>
					</Container>
					
					{shouldShowAssistantButton && (
						<IconButton
							name="kai"
							size={32}
							color={colors.successTextColor}
							onPress={() => {
								navigation?.navigate('SmartAssistant', { screen: 'Initial' })
								logEvent('Smart AI Assistant Click', { where: 'home' })
							}}
							containerStyles={{
								backgroundColor: colors.gray03,
								position: 'absolute',
								bottom: insets.bottom + 16,
								right: 16,
								width: 64,
								height: 64,
								borderRadius: 8,
								alignItems: 'center',
								justifyContent: 'center',
							}}
						/>
					)}
				</Container>
			</KyteSafeAreaView>
		</TabletScreenContainer>
	)
}

export default DashboardUI
