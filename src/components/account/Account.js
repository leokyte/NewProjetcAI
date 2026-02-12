import { Pressable, View, Text, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import DeviceInfo from 'react-native-device-info'
import { destroy } from 'redux-form'
import _ from 'lodash'
import { WebView } from 'react-native-webview'
import { KyteBox, KyteText, isFree, isPro, isGrow, isPrime, isTrial } from '@kyteapp/kyte-ui-components'
import Intercom from '@intercom/intercom-react-native'

import { DetailPage, ListOptions, CircleBadge, TextButton, KyteModal, KyteIcon } from '../common'
import I18n from '../../i18n/i18n'
import {
	logOut,
	updateMultiUser,
	checkFeatureIsAllowed,
	forgotPassword,
	setInitialRouteName,
	setSucessfulMessageVisibility,
	openModalWebview,
	redirectToSubscription,
} from '../../stores/actions'
import {
	checkUserPermission,
	generateTestID,
	generateDefaultPROFeatures,
	getPROFeature,
	shouldRedirectToSubscription,
} from '../../util'
import { Features } from '../../enums'
import { colors } from '../../styles'
import NavigationService from '../../services/kyte-navigation'
import * as packages from '../../../package.json'
import LoadingScreen from '../common/LoadingScreen'
import { logEvent, remoteConfigGetValue } from '../../integrations'
import navigateToSubscription from '../../util/navigation/subscription-navigate'

const Account = (props) => {
	const { isOnline, navigation, user } = props
	const { navigate } = navigation

	const [appVersion, setAppVersion] = useState(packages.version)
	const [showModalDeleteAccount, setShowModalDeleteAccount] = useState(false)
	const [linkDeleteAccount, setLinkDeleteAccount] = useState(null)
	const [PROUserLimit, setPROUserLimit] = useState(generateDefaultPROFeatures('PROUserLimit'))

	useEffect(() => {
		remoteConfigGetValue(
			'DeleteAccountLink',
			(k) => {
				setLinkDeleteAccount(k)
			},
			'json'
		)

		getAppVersion()
		getPROFeatures()
		logEvent('Store Data View')
	}, [])

	const getAppVersion = () => {
		const version = DeviceInfo.getVersion()
		setAppVersion(version)
	}

	const getPROFeatures = async () => {
		const switchUsers = await getPROFeature('PROUserLimit')
		switchUsers && setPROUserLimit(switchUsers)
	}

	const SignOut = () => {
		const { form } = props
		if (!_.isEmpty(form)) {
			for (const key in form) {
				props.destroy(key)
			}
		}
		props.logOut()
	}

	const logoutAlert = () => {
		Alert.alert(I18n.t('exitAlertTitle'), I18n.t('exitAlertDescription'), [
			{ text: I18n.t('alertDismiss') },
			{ text: I18n.t('alertConfirm'), onPress: () => SignOut() },
		])
	}

	const goToChangeUser = async () => {
		await Intercom.logout()
		props.updateMultiUser(false)
		NavigationService.navigate('UsersLock')
		props.setInitialRouteName('UsersLock')
	}

	const offlineAlert = () => {
		Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }, ,])
	}

	const goToStoreData = () => {
		if (!isOnline) {
			return offlineAlert()
		}
		return navigate('StoreDetail')
	}

	const goToUserConfirmPassword = () => {
		if (!isOnline) {
			return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
		}

		return navigate('UserConfirmPassword', { origin: 'reset-password', user })
	}

	const goToConfirmationAccount = () => {
		if (!isOnline) {
			return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
		}

		props.forgotPassword(props.user.email)
		return NavigationService.navigate('Confirmation', 'AccountConfirmation', { origin: 'default' })
	}

	const manageOptions = () => {
		const { multiUsers, userPermissions, billingInfo, account, auth, onboarding, coreActionsPref } = props
		const { key, remoteKey } = Features.items[Features.MULTI_USER]
		const referralCode = account?.metadata?.referral?.code

		const planCases = () => {
			if (isFree(billingInfo)) return `Free ${I18n.t('Account.planStatus.free')}`
			if (isTrial(billingInfo)) {
				return `${billingInfo.plan.toUpperCase()} ${I18n.t('Account.planStatus.trial')}`
			}
			if (isPro(billingInfo)) return I18n.t('plansPage.pro.title')
			if (isGrow(billingInfo)) return I18n.t('plansPage.grow.title')
			if (isPrime(billingInfo)) return I18n.t('plansPage.prime.title')
		}

		const actualPlan = () => planCases()

		const billingNavigate = () => {
			if (isFree(billingInfo) || isTrial(billingInfo)) {
				return navigateToSubscription(auth.signinEmail, auth.aid, billingInfo, referralCode, coreActionsPref || [])
			}
			props.setSucessfulMessageVisibility(true, true)
		}

		const { isAdmin, isOwner } = checkUserPermission(userPermissions)

		const options = [
			{
				title: I18n.t('Account.changeUser'),
				onPress: () => props.checkFeatureIsAllowed(key, () => goToChangeUser(), remoteKey),
				disabled: multiUsers.length < 2,
				PROFeature: PROUserLimit,
			},
			{
				title: I18n.t('configMenus.storeInfo'),
				onPress: () => goToStoreData(),
				hideItem: !isAdmin,
			},
			{
				title: `${I18n.t('Account.actualPan')}: ${actualPlan()}`,
				onPress: () => billingNavigate(),
				hideItem: !isOwner,
			},
			{
				title: I18n.t('Account.deleteAccount'),
				onPress: () => setShowModalDeleteAccount(!showModalDeleteAccount),
				hideItem: !isOwner,
			},
			{
				title: I18n.t('Account.finishSession'),
				onPress: () => logoutAlert(),
				color: colors.errorColor,
			},
		]

		return <ListOptions items={options} />
	}

	const renderUserInfo = () => {
		const { authVerified } = user
		const hasAuthProperty = Object.prototype.hasOwnProperty.call(user, 'authVerified')

		const renderChangePassword = () => (
			<TextButton
				onPress={() => goToUserConfirmPassword()}
				title={I18n.t('userEditResetPassword')}
				color={colors.actionColor}
				size={15}
				testProps={generateTestID('reset-pass-ba')}
			/>
		)

		const renderAccountConfirmation = () => (
			<TextButton
				onPress={() => goToConfirmationAccount()}
				title={I18n.t('bannerConfirmation.title')}
				color={colors.actionColor}
				size={15}
				testProps={generateTestID('verify-acc-ba')}
			/>
		)

		return (
			<View style={s.userContent}>
				<CircleBadge
					info={user.displayName}
					backgroundColor={colors.secondaryBg}
					textColor="#FFF"
					fontSize={24}
					size={80}
				/>
				<Text style={s.userName} {...generateTestID('store-ba')}>
					{user.displayName}
				</Text>
				<Text style={s.userEmail} {...generateTestID('email-ba')}>
					{user.email}
				</Text>
				{user.psw ? renderChangePassword() : null}
				{hasAuthProperty && !authVerified ? renderAccountConfirmation() : null}
			</View>
		)
	}

	const modalDeleteAccount = () => {
		const uri = `${linkDeleteAccount[I18n.t('locale')]}?aid=${user.aid}`

		return (
			<KyteModal
				bottomPage
				propagateSwipe
				noPadding
				height="100%"
				isModalVisible={showModalDeleteAccount}
			>
				<KyteBox h={64} d="row" align="center">
					<Pressable onPress={() => setShowModalDeleteAccount(!showModalDeleteAccount)}>
						<KyteBox
							w={64}
							h={64}
							align="center"
							justify="center"
							style={{
								transform: [{ rotate: '180deg' }],
							}}
						>
							<KyteIcon name="nav-arrow-right" size={20} />
						</KyteBox>
					</Pressable>

					<KyteText size={14} weight={500}>
						{I18n.t('Account.deleteAccount')}
					</KyteText>
					<KyteBox h={1} w="100%" bg="#D9DCE2" position="absolute" bottom={0} left={0} />
				</KyteBox>

				<WebView
					renderLoading={() => (
						<KyteBox w="100%" h="100%">
							<LoadingScreen hideLogo reverseColor description={I18n.t('words.s.loading')} />
						</KyteBox>
					)}
					startInLoadingState
					source={{
						uri,
					}}
				/>
			</KyteModal>
		)
	}

	const rightButtons = [
		{
			icon: 'no-internet',
			color: colors.grayBlue,
			onPress: () => offlineAlert(),
			iconSize: 20,
			isHidden: isOnline,
			testProps: generateTestID('offline-ba'),
		},
	]

	return (
		<DetailPage
			outerPage
			pageTitle={I18n.t('configMenus.storeAccount')}
			rightButtons={rightButtons}
			navigate={navigation.navigate}
			navigation={navigation}
		>
			<View style={s.contentContainer}>
				<View style={s.topContainer}>
					{renderUserInfo()}
					<Text style={s.appVersion}>{appVersion}</Text>
				</View>
				<View style={s.optionsContainer}>{manageOptions()}</View>
			</View>

			{linkDeleteAccount && modalDeleteAccount()}
		</DetailPage>
	)
}

const s = {
	contentContainer: {
		flex: 1,
		backgroundColor: colors.lightBg,
	},
	topContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	optionsContainer: {
		backgroundColor: '#FFF',
	},
	userContent: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	userName: {
		fontFamily: 'Graphik-Medium',
		fontSize: 18,
		color: colors.primaryColor,
		marginVertical: 8,
	},
	userEmail: {
		fontFamily: 'Graphik-Regular',
		fontSize: 16,
		color: colors.primaryColor,
	},
	appVersion: {
		fontFamily: 'Graphik-Regular',
		fontSize: 14,
		color: colors.primaryColor,
		position: 'absolute',
		right: 15,
		bottom: 15,
	},
}

const mapStateToProps = ({ billing, auth, form, common, onboarding, preference }) => ({
	plan: billing.planInfo,
	status: billing.status,
	trialDays: billing.trialDays,
	endDate: billing.endDate,
	billingInfo: { plan: billing.plan, status: billing.status },
	user: auth.user,
	multiUsers: auth.multiUsers,
	userPermissions: auth.user.permissions,
	isOnline: common.isOnline,
	form,
	billing,
	account: auth.account,
	auth,
	onboarding,
	coreActionsPref: preference?.account?.coreActions || [],
})

export default connect(mapStateToProps, {
	logOut,
	updateMultiUser,
	checkFeatureIsAllowed,
	destroy,
	forgotPassword,
	setInitialRouteName,
	setSucessfulMessageVisibility,
	openModalWebview,
	redirectToSubscription,
})(Account)
