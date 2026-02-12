/* eslint-disable react-native/no-inline-styles */
import { DrawerItem } from '@react-navigation/drawer'
import React, { useEffect, useState } from 'react'
import { Alert, Platform, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { Icon } from 'react-native-elements'
import { connect } from 'react-redux'
import Intercom from '@intercom/intercom-react-native'
import {
	Container,
	useViewport,
	Viewports,
	LargeScreenOnly,
	isFree,
	isTrial,
	Row,
	Margin,
} from '@kyteapp/kyte-ui-components'
import I18n, { getLocale } from '../../i18n/i18n'
import {
	checkPlanKeys,
	forgotPassword,
	helperFetch,
	logOut,
	productCategorySelect,
	resendCodeValidation,
	toggleBillingMessage,
	toggleHelperVisibility,
	updateDrawerVisibility,
	updateMultiUser,
	setSucessfulMessageVisibility,
	updateIntercomUserData,
	redirectToSubscription,
} from '../../stores/actions'
import { colors, colorSet, Type, drawerStyles } from '../../styles'
import NavigationService from '../../services/kyte-navigation'
import {
	checkIsExpired,
	checkUserPermission,
	daysPassed,
	generateTestID,
	shouldRedirectToSubscription,
} from '../../util'
import { KyteText, UserProgress, KyteTagNew, MPBannerOnMenu, KyteSafeAreaView } from '.'
import { KyteIcon } from './KyteIcon'
import { KyteButton } from './KyteButton'
import { CircleBadge } from './CircleBadge'
import { logEvent } from '../../integrations'
import DrawerIcon from './DrawerIcon'
import { openAppUrl } from '../../util/util-url-friendly'
import { BundleEnum, KYTE_CONTROL_APP_ID } from '../../enums'
import { isCatalogApp } from '../../util/util-flavors'
import Sample from '../../enums/Sample'
import { KYTE_CONTROL_APP_URL } from '../../kyte-constants'
import navigateToSubscription from '../../util/navigation/subscription-navigate.ts'
import { KyteTag } from './KyteTag'

const DrawerContent = (props) => {
	const [isBillingAllowed, setIsBillingAllowed] = useState(false)
	const viewport = useViewport()
	const { isOpen, shouldOverlay } = props

	useEffect(() => {
		checkBilling()
	}, [checkBilling])

	const checkBilling = React.useCallback(async () => {
		setIsBillingAllowed(await props.checkPlanKeys(''))
	}, [props, setIsBillingAllowed])

	const goToConfirmationAccount = () => {
		props.resendCodeValidation(props.user.email)
		NavigationService.navigate(null, 'Confirmation', {
			origin: 'default',
		})
	}

	const menuNavigation = (routeName) => {
		const { user, navigation, isOnline } = props

		if (routeName === 'OnlineCatalog' && !isOnline) {
			showOfflineAlert()
			return
		}

		// Uncomment this block to enable email confirmation ( Temporary validation bug fix )
		// if (routeName === 'Users' && !user.authVerified) {
		// 	goToConfirmationAccount()
		// 	return
		// }

		if (routeName === 'Helpcenter') {
			props.updateIntercomUserData()
			Intercom.present()
			return
		}

		props.updateDrawerVisibility(false)
		navigation.navigate(routeName)
	}

	const filterRoutes = (routes) => {
		const { user, descriptors, sample } = props
		const userPermissions = checkUserPermission(user.permissions)
		const { expInitialScreen } = sample

		const filteredRoutes = routes.filter(({ name: routeName, key: routeKey }) => {
			const { drawerLabel, drawerIcon } = descriptors[routeKey].options
			const restrictRoutes = ['Users', 'Statistics', 'Coupons']
			const needsPermission = restrictRoutes.includes(routeName)
			const hasPermission = userPermissions.isAdmin || userPermissions.isOwner

			// Grupo do teste A/B Helper/Home que o usuário está.
			const isDashboardSampleGroup = expInitialScreen === Sample.DASHBOARD
			const isDashboardRoute = routeName === 'Dashboard'
			const isOldUser = expInitialScreen === ''
			const shouldIncludeDashboardPage =
				isDashboardRoute && !isCatalogApp() && (isDashboardSampleGroup || isOldUser) && hasPermission

			if (!drawerLabel || !drawerIcon) return false

			if (isDashboardRoute) return shouldIncludeDashboardPage
			if (needsPermission) return hasPermission

			return true
		})

		return filteredRoutes.map((route) => ({
			...route,
			isBeta: descriptors[route.key]?.options?.isBeta,
		}))
	}

	const renderDrawerItems = () => {
		const { state, descriptors, isOpen } = props
		const filteredRoutes = filterRoutes(state.routes)
		const locale = getLocale()
		const shouldRenderLabel = viewport === Viewports.Mobile || isOpen
		const defaultItemStyle = styles.drawerItem
		const defaultLabelStyle = [drawerStyles.labelStyle]

		const renderDrawerLabel = (label, tagNew, labelStyle = defaultLabelStyle, isBeta) => (
			<Row alignItems="center">
				<KyteText color={colors.white} style={labelStyle}>
					{label}
				</KyteText>
				{tagNew ? (
					<Margin left={10}>
						<KyteTagNew isOutline />
					</Margin>
				) : null}
				{isBeta && (
					<Margin left={10}>
						<KyteTag text="BETA" />
					</Margin>
				)}
			</Row>
		)

		const drawerItemElements = filteredRoutes.map(({ key: routeKey, name: routeName, isBeta, tagNew }) => {
			const { options, navigation } = descriptors[routeKey]
			const { drawerLabel, drawerIcon } = options
			const itemStyle = options.drawerItemStyle ?? defaultItemStyle
			const labelStyle = options.drawerLabelStyle ?? defaultLabelStyle
			const activeBackgroundColor = options.drawerActiveBackgroundColor ?? drawerStyles.activeBackgroundColor
			const isFocused = navigation.isFocused()
			const backgroundColor = isFocused ? activeBackgroundColor : null
			const routesWithinTagNew = ['Coupons']
			const shouldRenderTagNew = tagNew || routesWithinTagNew.includes(routeName)
			const testProps = generateTestID(routeName)

			return (
				<View key={routeKey}>
					<DrawerItem
						label={
							shouldRenderLabel
								? () => renderDrawerLabel(drawerLabel, shouldRenderTagNew, labelStyle, isBeta)
								: () => null
						}
						onPress={() => {
							if (routeName === 'SmartAssistant') {
								logEvent('Smart AI Assistant Click', { where: 'menu' })
							}
							menuNavigation(routeName)
						}}
						icon={() => drawerIcon(isOpen)}
						style={[itemStyle, { backgroundColor, borderRadius: 0 }]}
						labelStyle={labelStyle}
						testID={testProps.testID}
						accessibilityLabel={testProps.accessibilityLabel}
					/>
				</View>
			)
		})

		const financeItemElement = (
			<View key="finance-123">
				<DrawerItem
					label={
						shouldRenderLabel
							? () => renderDrawerLabel(I18n.t('sideMenu.finance'), false, defaultLabelStyle)
							: () => null
					}
					onPress={() => {
						logEvent('Menu Finance Click')
						openAppUrl(KYTE_CONTROL_APP_URL, {
							locale,
							playStoreId: BundleEnum.CONTROL_ANDROID,
							appStoreId: KYTE_CONTROL_APP_ID,
						})
					}}
					icon={() => <DrawerIcon isOpen={isOpen} name="wallet" />}
					style={defaultItemStyle}
					labelStyle={defaultLabelStyle}
				/>
			</View>
		)

		drawerItemElements.splice(6, 0, financeItemElement)

		return drawerItemElements
	}

	const showOfflineAlert = () => {
		Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
	}

	const openHelper = () => {
		logEvent('Helper Open Click')
		props.helperFetch(() => props.toggleHelperVisibility(true))
	}

	const buttonManage = () => {
		const { billingInfo, isOnline, account, user, coreActionsPref } = props
		const referralCode = account?.metadata?.referral?.code

		if (!isOnline) {
			return showOfflineAlert()
		}

		if (isFree(billingInfo) || isTrial(billingInfo)) {
			return navigateToSubscription(user.email, user.aid, billingInfo, referralCode, coreActionsPref)
		}

		props.setSucessfulMessageVisibility(true, true)
	}

	const renderStoreNameButton = () => {
		const { storeNameButton, storeNameRow } = styles
		const { billingInfo, navigation, user } = props
		const { navigate } = navigation
		const storeName = props.store && props.store.name ? props.store.name : I18n.t('sideMenu.typeStoreName')
		const { displayName } = props.user
		const { helper, behavior = {}, sample } = props
		const notPro = !isBillingAllowed || isTrial(billingInfo)
		const { isOwner } = checkUserPermission(user.permissions)
		const badgeTextColor = notPro ? colors.primaryDarker : colors.actionColor
		const badgeInfo = displayName.substring(0, 2).toUpperCase()

		const helperEnabled = () => {
			const { expInitialScreen } = sample
			const isEnabled = behavior.hasOwnProperty(helper.key) ? behavior[helper.key]?.enabled : false
			const remoteAvailability = helper.remoteAvailability === 'enabled'
			const isDashboardSampleGroup = expInitialScreen === Sample.DASHBOARD

			return isEnabled && remoteAvailability && !isDashboardSampleGroup
		}

		const showHelperProgress = helper.completionPercentage < 100 && behavior[helper.key] && helperEnabled()
		const storeNameContainer = {
			flex: 1,
			marginLeft: showHelperProgress ? 15 : 0,
		}

		const renderLabel = () => (
			<TouchableOpacity onPress={() => buttonManage()}>
				<View style={styles.label(notPro)}>
					<KyteText weight="Semibold" size={12} lineHeight={12} color={badgeTextColor}>
						{notPro
							? I18n.t('sideMenuBanner.subscribeLabel').toUpperCase()
							: I18n.t('sideMenuBanner.manageLabel').toUpperCase()}
					</KyteText>
				</View>
			</TouchableOpacity>
		)

		const renderHelperProgress = () => (
			<View>
				<UserProgress
					onPress={openHelper}
					label={badgeInfo}
					size={26}
					labelSize={16}
					percent={helper.completionPercentage}
					border={3}
					darkMode
					activeOpacity={0.9}
				/>
			</View>
		)

		return (
			<View style={storeNameButton}>
				{showHelperProgress ? renderHelperProgress() : null}
				<View style={storeNameContainer}>
					<TouchableOpacity
						onPress={() => {
							logEvent('Menu Store Click')
							navigate('Account')
						}}
						{...generateTestID('my-acc-menu')}
					>
						<View style={[storeNameRow, { marginBottom: 5 }]}>
							<KyteText
								style={styles.setFlex()}
								weight="Medium"
								size={18}
								color="white"
								ellipsizeMode="tail"
								numberOfLines={1}
							>
								{storeName}
							</KyteText>
							<Icon name="keyboard-arrow-right" size={28} color="white" />
						</View>
					</TouchableOpacity>
					<View style={storeNameRow}>
						<KyteText style={styles.setFlex()} size={12} pallete="grayBlue" ellipsizeMode="tail" numberOfLines={1}>
							{displayName}
						</KyteText>
						{isOwner ? renderLabel() : null}
					</View>
				</View>
			</View>
		)
	}

	const renderBanner = (messages, action) => {
		const { confirmInfoContainer, confirmInfo, confirmInfoIconContainer } = styles

		return (
			<TouchableOpacity onPress={action} style={confirmInfoContainer}>
				<View style={confirmInfo}>
					<Text
						style={[Type.Medium, Type.fontSizeNormalize(18), colorSet(colors.primaryDarker), { marginBottom: 5 }]}
						adjustsFontSizeToFit={Platform.OS === 'android'}
					>
						{messages.title}
					</Text>
					<Text
						style={[Type.Medium, Type.fontSizeNormalize(13), colorSet(colors.primaryBg)]}
						adjustsFontSizeToFit={Platform.OS === 'android'}
					>
						{messages.subtitle}
					</Text>
				</View>
				<View style={confirmInfoIconContainer}>
					<Icon name="keyboard-arrow-right" size={32} color={colors.primaryDarker} />
				</View>
			</TouchableOpacity>
		)
	}

	const renderToggleButton = () => (
		<KyteButton
			height={45}
			style={{
				justifyContent: isOpen ? 'flex-start' : 'center',
				paddingHorizontal: 10,
				width: isOpen ? null : '100%',
			}}
			onPress={() => props.handleToggleDrawer(props.navigation)}
		>
			{isOpen ? (
				<KyteIcon name="close-menu" size={40} color={colors.grayBlue} />
			) : (
				<Icon name="menu" size={26} color={colors.grayBlue} />
			)}
		</KyteButton>
	)

	const renderFooter = () => {
		const { user, multiUsers, navigation, creationDate, endDate, billingInfo } = props
		const { authVerified } = user
		const hasPermission = checkUserPermission(user.permissions).isOwner && authVerified
		const hasAuthProperty = Object.prototype.hasOwnProperty.call(user, 'authVerified')
		const { confirmAcc, createTeam, goPro, defaultMessages } = I18n.t('sideMenuBanner')
		const isExpired = checkIsExpired(endDate)
		const days = daysPassed(creationDate)

		const messages = {
			title: '',
			subtitle: '',
		}

		let action = () => null

		const contentLog = (log) => {
			logEvent('MenuBannerClick', {
				content: log,
			})
		}

		if (hasPermission && ((isTrial(billingInfo) && days >= 5) || isFree(billingInfo))) {
			// if user is in the 5 day of trial
			messages.title = goPro.title
			messages.subtitle = goPro.subtitle
			action = () => {
				buttonManage()
				contentLog('Conheça o Kyte PRO')
			}
		} else if (hasAuthProperty && !authVerified) {
			messages.title = confirmAcc.title
			messages.subtitle = confirmAcc.subtitle
			action = () => {
				goToConfirmationAccount()
				contentLog('Confirme seu e-mail')
			}
		} else if (multiUsers.length === 1 && isTrial(billingInfo) && !isExpired) {
			messages.title = createTeam.title
			messages.subtitle = createTeam.subtitle
			action = () => {
				navigation.navigate('Users')
				contentLog('Cadastre sua equipe')
			}
		} else {
			messages.title = defaultMessages.title
			messages.subtitle = defaultMessages.subtitle
			action = () => {
				props.toggleBillingMessage(true, 'fullWebview', 'featureKytePC')
				contentLog('Use o Kyte no PC')
			}
		}

		if (messages.title) return renderBanner(messages, action)
	}

	const renderOverlayWrapper = (children) => (
		<Container height="100%" flexDirection="row">
			{children}
			<TouchableOpacity
				style={{ backgroundColor: 'black', flex: 1, opacity: 0.5 }}
				activeOpacity={0.7}
				onPress={() => props.handleToggleDrawer(props.navigation)}
			/>
		</Container>
	)

	const renderCircleBadge = () => (
		<TouchableOpacity onPress={() => props.navigation.navigate('Account')}>
			<Container width="100%" alignItems="center" style={{ marginTop: 10, marginBottom: 10 }}>
				<CircleBadge
					info={props.user.displayName}
					backgroundColor={colors.secondaryBg}
					textColor="#FFF"
					fontSize={15}
					size={45}
				/>
			</Container>
		</TouchableOpacity>
	)

	const renderDrawer = () => {
		const { container, menusContainer } = styles

		return (
			<KyteSafeAreaView style={[container, props.containerStyle]}>
				<ScrollView>
					<LargeScreenOnly>
						{renderToggleButton()}
						{!isOpen && renderCircleBadge()}
					</LargeScreenOnly>
					{(viewport === Viewports.Mobile || isOpen) && renderStoreNameButton()}
					<View style={menusContainer}>{renderDrawerItems()}</View>
					<MPBannerOnMenu
						title={I18n.t('sideMenuBannerMP.title')}
						subtitle={I18n.t('sideMenuBannerMP.subtitle')}
						buttonTitle={I18n.t('sideMenuBannerMP.button')}
						navigation={props.navigation}
					/>
				</ScrollView>
				{props.isFooterVisible && renderFooter()}
			</KyteSafeAreaView>
		)
	}

	return shouldOverlay && isOpen ? renderOverlayWrapper(renderDrawer()) : renderDrawer()
}

const styles = {
	setFlex: (flex = 1) => ({ flex }),
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: colors.primaryDarker,
		paddingTop: 20,
	},
	menusContainer: {
		flex: 1,
		paddingTop: 5,
	},
	storeNameButton: {
		flexDirection: 'row',
		paddingBottom: 20,
		paddingHorizontal: 15,
		justifyContent: 'center',
		alignItems: 'center',
	},
	storeNameRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	confirmInfoContainer: {
		flexDirection: 'row',
		backgroundColor: colors.actionColor,
		paddingVertical: 20,
	},
	confirmInfo: {
		flex: 1.5,
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	confirmInfoIconContainer: {
		flex: 0.25,
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	label: (notPro) => ({
		borderRadius: 10,
		paddingBottom: 3,
		paddingTop: 4,
		paddingHorizontal: 7,
		backgroundColor: notPro ? colors.actionColor : 'transparent',
		borderWidth: 1,
		borderColor: colors.actionColor,
	}),
}

const mapStateToProps = (state) => {
	const { status, plan, creationDate, endDate, trialDays } = state.billing
	const { user, multiUsers, store, behavior } = state.auth
	const { isOnline, drawerVisible } = state.common
	const { helper, sample } = state.onboarding
	const coreActionsPref = state?.preference?.account?.coreActions || []

	return {
		billingStatus: status,
		billingInfo: { plan, status },
		creationDate,
		endDate,
		trialDays,
		user,
		multiUsers,
		drawerVisible,
		store,
		isOnline,
		salesQuantity: state.sales.salesQuantity,
		helper,
		behavior,
		sample,
		account: state.auth.account,
		coreActionsPref,
	}
}

export default connect(mapStateToProps, {
	logOut,
	updateMultiUser,
	updateDrawerVisibility,
	toggleHelperVisibility,
	productCategorySelect,
	toggleBillingMessage,
	checkPlanKeys,
	forgotPassword,
	resendCodeValidation,
	helperFetch,
	setSucessfulMessageVisibility,
	updateIntercomUserData,
	redirectToSubscription,
})(DrawerContent)
