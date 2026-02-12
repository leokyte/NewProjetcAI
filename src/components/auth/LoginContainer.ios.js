import { View, Text, Alert, Platform, TouchableOpacity, Linking, Dimensions } from 'react-native'
import React, { Component } from 'react'
import { Icon } from 'react-native-elements'
import { connect } from 'react-redux'
import appleAuth from '@invertase/react-native-apple-authentication'
import Intercom from '@intercom/intercom-react-native'

import { KyteIcon, KyteButton, GoogleIcon, LoadingCleanScreen, KyteSafeAreaView, KyteText } from '../common'
import { scaffolding, colors, Type, colorSet } from '../../styles'
import {
	doGoogleSignIn,
	doFacebookSignIn,
	doFormSignUpInit,
	doSignUpInit,
	doFormSignInInit,
	doAppleSignIn,
} from '../../stores/actions'
import I18n from '../../i18n/i18n'

import {
	checkDeviceConnection,
	generateTestID,
	LoginTracker,
	APP_MAIN_SCREEN,
	EMAIL_BUTTON_ACTION,
	FACEBOOK_BUTTON_ACTION,
	GOOGLE_BUTTON_ACTION,
	APPLE_BUTTON_ACTION,
} from '../../util'
import { loginUserOnIntercom } from '../../integrations/Intercom'
import { getPolicyUrl, getTermsUrl } from '../../util/util-policies'

const Strings = {
	CHOOSE_OPTION: I18n.t('authChooseOption'),
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

class Login extends Component {
	async UNSAFE_componentWillMount() {
		const getConnectionInfo = await checkDeviceConnection()
		if (!getConnectionInfo) {
			Alert.alert(I18n.t('connectionAlertTitle'), I18n.t('connectionAlertDescription'), [{ text: I18n.t('alertOk') }])
		}
		this.props.doSignUpInit()
	}

	componentDidMount() {
		LoginTracker.trackSuccessEvent(APP_MAIN_SCREEN)
	}

	formLogin() {
		const { navigate } = this.props.navigation
		LoginTracker.trackSuccessEvent(EMAIL_BUTTON_ACTION)
		navigate('SigninEmail')
	}

	googleLogin() {
		LoginTracker.trackSuccessEvent(GOOGLE_BUTTON_ACTION)
		this.props.doGoogleSignIn()
	}

	facebookLogin() {
		LoginTracker.trackSuccessEvent(FACEBOOK_BUTTON_ACTION)
		this.props.doFacebookSignIn()
	}

	renderLoader() {
		return <LoadingCleanScreen />
	}

	appleLogin() {
		LoginTracker.trackSuccessEvent(APPLE_BUTTON_ACTION)
		this.props.doAppleSignIn()
	}

	renderAuthButton({ type, iconColor, bgColor, pallete, borderColor }) {
		const { socialMediaContainer } = styles
		const getIcon = (type) => {
			switch (type) {
				case 'facebook':
					return (
						<Icon
							type="font-awesome"
							name="facebook-official"
							color={iconColor}
							size={22}
							style={{ margin: 0, padding: 0 }}
						/>
					)
				case 'google':
					return <GoogleIcon size={22} />
				case 'email':
					return <KyteIcon name="email-stripped" color={iconColor} size={20} style={{ margin: 0, padding: 0 }} />
				case 'apple':
					return <Icon type="font-awesome" name="apple" color={iconColor} size={22} style={{ margin: 0, padding: 0 }} />
			}
		}

		const getName = (type) => {
			switch (type) {
				case 'facebook':
					return 'Facebook'
				case 'google':
					return 'Google'
				case 'email':
					return 'E-mail'
				case 'apple':
					return `${I18n.t('signinButtonText')} Apple`
			}
		}

		const getAction = (type) => {
			switch (type) {
				case 'facebook':
					return this.facebookLogin()
				case 'google':
					return this.googleLogin()
				case 'email':
					return this.formLogin()
				case 'apple':
					return this.appleLogin()
			}
		}

		const getTestProps = (type) => {
			switch (type) {
				case 'facebook':
					return 'face-ios-main'
				case 'google':
					return 'google-ios-main'
				case 'email':
					return 'email-ios-main'
				case 'apple':
					return 'apple-main'
			}
		}

		return (
			<View style={socialMediaContainer(type === 'apple')}>
				<KyteButton
					onPress={() => getAction(type)}
					style={{ borderRadius: 4 }}
					height={52}
					background={bgColor || '#FFF'}
					borderColor={borderColor || colors.disabledIcon}
					borderWidth={1}
					testProps={generateTestID(getTestProps(type))}
				>
					<View style={{ flexDirection: 'row', flex: 1 }}>
						<View
							style={{
								width: '15%',
								alignItems: 'center',
								justifyContent: 'center',
								position: 'relative',
							}}
						>
							{getIcon(type)}
						</View>
						<View style={{ width: '70%', alignItems: 'center', justifyContent: 'center' }}>
							<KyteText weight="Medium" size={13} pallete={pallete || 'primaryDarker'}>
								{getName(type)}
							</KyteText>
						</View>
					</View>
				</KyteButton>
			</View>
		)
	}

	render() {
		const { outerContainer } = scaffolding
		const {
			logoContainer,
			rowContainer,
			agreementTerms,
			justifyContentCenter,
			agreementLink,
			helpContainer,
			helpButton,
			helpText,
		} = styles
		const { visible } = this.props.loader

		const openIntercomMessenger = async () => {
			await loginUserOnIntercom(this.props.isLogged)
			await Intercom.present()
		}

		return (
			<KyteSafeAreaView style={outerContainer}>
				<View style={helpContainer}>
					<TouchableOpacity
						style={helpButton}
						activeOpacity={0.8}
						onPress={() => openIntercomMessenger()}
						{...generateTestID('help-ios-main')}
					>
						<Text style={helpText}>{I18n.t('sideMenu.helpCenter')}</Text>
						<KyteIcon name="help" size={19} color={colors.primaryBg} style={{ paddingLeft: 5 }} />
					</TouchableOpacity>
				</View>

				<View style={logoContainer}>
					<KyteIcon name="logo" size={90} color={colors.actionColor} />
				</View>

				<View style={{ paddingBottom: 20 }}>
					<View style={[rowContainer, { alignItems: 'center' }]}>
						<KyteText size={12} pallete="fadePrimary">
							{Strings.CHOOSE_OPTION}
						</KyteText>
					</View>
					{this.renderAuthButton({ type: 'email', iconColor: '#000' })}
					{this.renderAuthButton({ type: 'facebook', iconColor: '#3c5a99' })}
					{this.renderAuthButton({ type: 'google', iconColor: '#3c5a99' })}
					{appleAuth.isSupported
						? this.renderAuthButton({
								type: 'apple',
								iconColor: '#FFF',
								bgColor: '#000',
								pallete: 'drawerIcon',
								borderColor: '#FFF',
						  })
						: null}
				</View>

				<View
					style={[rowContainer, justifyContentCenter, { alignItems: 'center', marginBottom: SMALL_SCREENS ? 40 : 20 }]}
				>
					<Text style={agreementTerms}>
						{`${I18n.t('agreementTerm')} `}
						<Text onPress={() => Linking.openURL(getTermsUrl())} style={agreementLink}>
							{I18n.t('termsOfUse')}
						</Text>{' '}
						{` ${I18n.t('words.s.and')} `}
						<Text onPress={() => Linking.openURL(getPolicyUrl())} style={agreementLink}>
							{I18n.t('privacyPolicy')}
						</Text>
					</Text>
				</View>
				{visible ? this.renderLoader() : null}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	justifyContentCenter: {
		justifyContent: 'center',
	},
	logoContainer: {
		flex: 3,
		alignItems: 'center',
		justifyContent: 'center',
	},
	rowContainer: {
		marginBottom: 20,
	},
	socialMediaContainer: (removePadding) => ({
		paddingBottom: removePadding ? 0 : 10,
		paddingHorizontal: 10,
	}),
	socialButton: {
		flexDirection: 'row',
		borderRadius: 0,
	},
	agreementContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 40,
		paddingVertical: 15,
	},
	agreementTerms: {
		fontFamily: 'Graphik-Regular',
		textAlign: 'center',
		fontSize: 12,
		color: colors.fadePrimary,
		lineHeight: 18,
		paddingHorizontal: 20,
	},
	agreementLink: {
		color: colors.actionColor,
		fontFamily: 'Graphik-Medium',
	},
	helpContainer: {
		alignItems: 'center',
		justifyContent: 'flex-start',
		paddingTop: 10,
	},
	helpButton: {
		height: 30,
		width: 75,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.borderlight,
		flexDirection: 'row',
		borderRadius: 12,
	},
	helpText: [
		Type.Medium,
		colorSet(colors.primaryBg),
		Type.fontSize(13),
		{
			paddingTop: Platform.OS === 'ios' ? 3 : 0,
			paddingBottom: Platform.OS === 'android' ? 3 : 0,
			paddingLeft: 3,
		},
	],
}

const mapStateToProps = (state) => ({
	loader: state.common.loader,
	isLogged: state.auth.isLogged,
})

export default connect(mapStateToProps, {
	doGoogleSignIn,
	doFacebookSignIn,
	doAppleSignIn,
	doFormSignUpInit,
	doSignUpInit,
	doFormSignInInit,
})(Login)
