import { View, Text, Alert, Platform, Dimensions, Linking, TouchableOpacity } from 'react-native'
import React, { Component } from 'react'
import { Icon } from 'react-native-elements'
import { connect } from 'react-redux'
import Intercom from '@intercom/intercom-react-native'
import { KyteIcon, KyteButton, GoogleIcon, LoadingCleanScreen, KyteSafeAreaView } from '../common'
import { scaffolding, colors, Type, colorSet } from '../../styles'
import {
	doGoogleSignIn,
	doFacebookSignIn,
	doFormSignUpInit,
	doSignUpInit,
	doFormSignInInit,
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
} from '../../util'
import { loginUserOnIntercom } from '../../integrations/Intercom'
import { getPolicyUrl, getTermsUrl } from '../../util/util-policies'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALLEST_SCREENS = SCREEN_HEIGHT <= 480
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

	signUp() {
		this.props.doFormSignUpInit()
		const { navigate } = this.props.navigation
		navigate('SignUp')
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

	render() {
		const { outerContainer } = scaffolding
		const {
			logoContainer,
			textLogo,
			contentContainer,
			rowContainer,
			socialMediaContainer,
			signButton,
			signButtonText,
			socialButton,
			socialButtonText,
			socialLogoContainer,
			separatorSocialMedia,
			justifyContentCenter,
			orSignDifferentText,
			agreementTerms,
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
						{...generateTestID('help-main')}
					>
						<Text style={helpText}>{I18n.t('sideMenu.helpCenter')}</Text>
						<KyteIcon name="help" size={19} color={colors.grayBlue} style={{ paddingLeft: 5 }} />
					</TouchableOpacity>
				</View>
				<View style={logoContainer}>
					<KyteIcon name="logo" size={78} color={colors.actionColor} />
					<Text style={textLogo}>{I18n.t('subtitleLogoKyte')}</Text>
				</View>
				<View style={contentContainer}>
					<View style={[rowContainer, { justifyContent: 'flex-start' }]}>
						<KyteButton
							onPress={() => this.formLogin()}
							style={signButton}
							height={52}
							borderWidth={1.5}
							borderColor={colors.lightBorder}
							background="#FFF"
							testProps={generateTestID('login-main')}
						>
							<Text style={[signButtonText, { color: colors.primaryColor }]}>{I18n.t('login')}</Text>
						</KyteButton>
					</View>

					<View
						style={[
							rowContainer,
							justifyContentCenter,
							Platform.select({ ios: { paddingTop: SMALLEST_SCREENS ? 20 : 0 } }),
						]}
					>
						<KyteButton
							onPress={() => this.signUp()}
							style={{ marginHorizontal: 3 }}
							height={52}
							borderWidth={1.5}
							borderColor={colors.actionColor}
							background={colors.actionColor}
							testProps={generateTestID('create-acc-main')}
						>
							<Text style={[signButtonText, { color: '#FFF' }]}>{I18n.t('signUp')}</Text>
						</KyteButton>
					</View>

					<View style={[rowContainer, justifyContentCenter, { alignItems: 'center' }]}>
						<Text style={orSignDifferentText}>{I18n.t('orSignInWith').toUpperCase()}</Text>
					</View>

					<View style={[rowContainer, justifyContentCenter, { flexDirection: 'row' }]}>
						<View style={socialMediaContainer}>
							<KyteButton
								onPress={() => this.facebookLogin()}
								style={[socialButton, separatorSocialMedia]}
								height={52}
								background="#FFF"
								testProps={generateTestID('face-main')}
							>
								<View style={socialLogoContainer}>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Icon type="font-awesome" name="facebook-official" color="#3c5a99" size={35} />
										<Text style={[socialButtonText, { paddingLeft: 5 }]}>Facebook</Text>
									</View>
								</View>
							</KyteButton>
						</View>

						<View style={socialMediaContainer}>
							<KyteButton
								onPress={() => this.googleLogin()}
								style={socialButton}
								height={52}
								background="#FFF"
								testProps={generateTestID('google-main')}
							>
								<View style={socialLogoContainer}>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<View style={{ width: 30 }}>
											<GoogleIcon size={30} />
										</View>
										<Text style={[socialButtonText, { paddingLeft: 5 }]}>Google</Text>
									</View>
								</View>
							</KyteButton>
						</View>
					</View>

					<View
						style={[
							rowContainer,
							justifyContentCenter,
							{ alignItems: 'center', marginBottom: SMALL_SCREENS ? 40 : 20 },
						]}
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
		flex: SMALLEST_SCREENS ? 1.1 : 1.2,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 30,
	},
	textLogo: {
		marginTop: 10,
		color: colors.actionColor,
		fontSize: 13,
		fontFamily: 'Graphik-Medium',
	},
	contentContainer: {
		padding: 20,
		flex: 1,
		justifyContent: 'center',
	},
	rowContainer: {
		marginBottom: 20,
	},
	socialMediaContainer: {
		// flex: 0.5,
		width: '50%',
	},
	signButton: {
		flexDirection: 'row',
		marginHorizontal: 3,
	},
	signButtonText: {
		flex: 1,
		textAlign: 'center',
		fontFamily: 'Graphik-Medium',
		fontSize: 15,
	},
	socialLogoContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	socialButton: {
		flexDirection: 'row',
		borderRadius: 0,
	},
	socialButtonText: {
		color: colors.secondaryBg,
		fontFamily: 'Graphik-Regular',
		fontSize: 14,
	},
	separatorSocialMedia: {
		borderStyle: 'solid',
		borderRightWidth: 1,
		borderRightColor: colors.secondaryBorderColor,
	},
	orSignDifferentText: {
		fontFamily: 'Graphik-Medium',
		fontSize: 10,
		letterSpacing: 1,
		color: colors.fadePrimary,
	},
	agreementTerms: {
		fontFamily: 'Graphik-Regular',
		textAlign: 'center',
		fontSize: 12,
		color: colors.fadePrimary,
		lineHeight: 18,
		marginBottom: 20,
	},
	agreementLink: {
		color: colors.actionColor,
		textDecorationLine: 'underline',
	},
	helpContainer: {
		alignItems: 'flex-end',
		marginTop: 20,
		paddingRight: 20,
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
		colorSet(colors.grayBlue),
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
	doFormSignUpInit,
	doSignUpInit,
	doFormSignInInit,
})(Login)
