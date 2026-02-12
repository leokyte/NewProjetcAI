import React, { Component } from 'react'
import { View, Text, Keyboard, Platform, Dimensions, TouchableOpacity, Alert, Linking } from 'react-native'
import { connect } from 'react-redux'
import { Field, reduxForm, getFormValues } from 'redux-form'
import {
	TextButton,
	KyteToolbar,
	Input,
	ActionButton,
	KyteButton,
	KyteIcon,
	LoadingCleanScreen,
	CustomKeyboardAvoidingView,
	CircleBadge,
	KyteSafeAreaView,
} from '../common'
import {
	setSigninPassword,
	doFormSignIn,
	forgotPassword,
	doFormResetPassword,
	changeCurrentUserPassword,
	changePasswordOfOtherUser,
	signInInternally,
	setInitialRouteName,
	createNonFormUserPassword,
} from '../../stores/actions'
import { scaffolding, colors, Type } from '../../styles'
import I18n from '../../i18n/i18n'
import { logEvent } from '../../integrations'
import {
	LoginTracker,
	APP_PASSWORD_SCREEN,
	APP_PASSWORD_VISIBILITY_ACTION,
	APP_PASSWORD_BUTTON_ACTION,
	FORGOT_PASSWORD_BUTTON_ACTION,
	FORGOT_PASSWORD_CHANGE_PASSWORD_SCREEN,
} from '../../util'
import { generateTestID } from '../../util'
import Intercom from '@intercom/intercom-react-native'

const SCREEN_HEIGHT = Dimensions.get('window').height
const MEDIUM_SCREENS = SCREEN_HEIGHT <= 640
const SMALLEST_SCREENS = SCREEN_HEIGHT <= 480

class SigninPasswordComponent extends Component {
	static navigationOptions = () => {
		return {
			header: null,
		}
	}

	constructor(props) {
		super(props)
		const { params } = this.props.route
		const { origin } = params

		switch (origin) {
			case 'sign-email':
			case 'users-lock':
				this.state = {
					origin,
					visibilityPassword: false,
					toolbarHeaderTitle: I18n.t('words.s.password'),
					inputPlaceholder: I18n.t('words.s.password'),
					buttonLabelIForgotMyPassword: I18n.t('iForgotThePassword'),
					buttonLabel: I18n.t('login'),
					buttonAlertDescription: I18n.t('signPasswordFieldValidate.empty'),
					shrinkSection: false,
				}
				break

			case 'code-confirmation':
				this.state = {
					origin: 'code-confirmation',
					visibilityPassword: false,
					toolbarHeaderTitle: I18n.t('newPassword'),
					inputPlaceholder: I18n.t('placeholderInputNewPassword'),
					textIntroduction: I18n.t('textIntroductionNewPassword'),
					buttonLabel: I18n.t('labelButtonNewPassword'),
					buttonAlertDescription: I18n.t('newPasswordFieldValidate.empty'),
					shrinkSection: false,
				}
				break

			case 'users-list':
				this.state = {
					origin: 'users-list',
					visibilityPassword: true,
					toolbarHeaderTitle: I18n.t('userHelperPasswordLabel'),
					inputPlaceholder: I18n.t('words.s.password'),
					textIntroduction: I18n.t('textIntroductionNewPassword'),
					buttonLabel: I18n.t('userHelperPasswordCreate'),
					buttonAlertDescription: I18n.t('newPasswordFieldValidate.empty'),
					shrinkSection: false,
				}
				break
			case 'reset-password':
			case 'users-lock-reset':
				this.state = {
					origin,
					visibilityPassword: true,
					toolbarHeaderTitle: I18n.t('userEditResetPassword'),
					inputPlaceholder: I18n.t('words.s.password'),
					textIntroduction: I18n.t('textIntroductionNewPassword'),
					buttonLabel: I18n.t('userEditResetPassword'),
					buttonAlertDescription: I18n.t('newPasswordFieldValidate.empty'),
					shrinkSection: false,
					forceChangePasswordValue: false,
				}
				break
			case 'add-user':
				this.state = {
					origin: 'add-user',
					visibilityPassword: true,
					inputPlaceholder: I18n.t('passwordPlaceholder'),
					textIntroduction: I18n.t('textIntroductionNewPassword'),
					forceChangePassword: I18n.t('forceChangePassword'),
					shrinkSection: false,
					forceChangePasswordValue: false,
				}
				break
			default:
				break
		}
	}

	UNSAFE_componentWillMount() {
		this.KeyboardShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this))
		this.KeyboardHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this))
	}

	componentDidMount() {
		const { origin } = this.state
		if (origin === 'sign-email') {
			LoginTracker.trackSuccessEvent(APP_PASSWORD_SCREEN)
		}

		if (origin === 'code-confirmation') {
			LoginTracker.trackSuccessEvent(FORGOT_PASSWORD_CHANGE_PASSWORD_SCREEN)
		}
	}

	componentWillUnmount() {
		this.KeyboardShowListener.remove()
		this.KeyboardHideListener.remove()
	}

	keyboardDidShow() {
		this.setState({ shrinkSection: true })
	}

	keyboardDidHide() {
		this.setState({ shrinkSection: false })
	}

	submitForm({ password }) {
		const { navigate } = this.props.navigation
		const { signinEmail } = this.props
		const { origin } = this.state

		Keyboard.dismiss()
		if (origin === 'code-confirmation') {
			return this.props.doFormResetPassword(signinEmail, password)
		}

		if (origin === 'users-list') {
			if (this.props.cbPassword) {
				this.props.cbPassword(signinEmail, password)
			} else {
				const navigateToSuccess = () => {
					navigate('UserConfirmation', {
						onPress: 'Users',
						labelButton: I18n.t('words.s.ok').toUpperCase(),
						textConfirmation: I18n.t('userHelperPasswordSuccess'),
						returnPreviousScreen: true,
					})
				}
				logEvent('AdminAddPass', { email: signinEmail })
				this.props.createNonFormUserPassword(password, navigateToSuccess.bind(this))
				return
			}
		}

		if (origin === 'reset-password') {
			const { user } = this.props.route.params
			const { forceChangePasswordValue } = this.state
			const { authUser } = this.props

			const updateUserPasswordInState = (newPsw) => {
				this.props.navigation.setParams({ user: Object.assign(user, { psw: newPsw }) })
			}

			const handleSuccess = (newPsw) => {
				if (newPsw) updateUserPasswordInState(newPsw)

				return navigate('UserConfirmation', {
					onPress: 'Users',
					labelButton: I18n.t('words.s.ok').toUpperCase(),
					textConfirmation: I18n.t('userEditResetPasswordSuccessful'),
					returnPreviousScreen: true,
				})
			}

			const handleFailure = () => Alert.alert(I18n.t('words.s.attention'), I18n.t('loginFailedDescription'))

			if (authUser.uid === user.uid) {
				return this.props.changeCurrentUserPassword(
					password,
					() => handleSuccess(),
					() => handleFailure()
				)
			}
			return this.props.changePasswordOfOtherUser(
				user,
				password,
				forceChangePasswordValue,
				(newPsw) => handleSuccess(newPsw),
				authUser.uid === user.uid
			)
		}

		if (origin === 'users-lock-reset') {
			const { user } = this.props.route.params
			const { forceChangePasswordValue } = this.state
			const navigateToSuccess = () => {
				this.props.setInitialRouteName('CurrentSale')
				navigate('UsersLockConfirmation', {
					onPress: 'CurrentSale',
					labelButton: I18n.t('words.s.ok').toUpperCase(),
					textConfirmation: I18n.t('userEditResetPasswordSuccessful'),
					returnPreviousScreen: false,
				})
			}
			return this.props.changePasswordOfOtherUser(
				user,
				password,
				forceChangePasswordValue,
				navigateToSuccess.bind(this),
				true
			)
		}

		if (origin === 'users-lock') {
			const { user } = this.props.route.params
			
			const navigateToSuccess = () => {
				navigate('CurrentSale')
			}
			return this.props.signInInternally(user, password, navigateToSuccess.bind(this))
		}

		LoginTracker.trackSuccessEvent(APP_PASSWORD_BUTTON_ACTION)
		this.props.doFormSignIn(signinEmail, password)
	}

	goBackSigninEmail() {
		const { goBack } = this.props.navigation

		Keyboard.dismiss()
		goBack()
	}

	forgotMyPassword() {
		const { signinEmail } = this.props
		const { navigate } = this.props.navigation
		const { origin } = this.state
		Keyboard.dismiss()

		if (origin === 'users-lock') {
			const { user } = this.props.route.params
			const { email } = user

			return this.props.forgotPassword(email, () => navigate('UsersLockCode', { origin, user }))
		} else if (origin === 'sign-email') {
			LoginTracker.trackSuccessEvent(FORGOT_PASSWORD_BUTTON_ACTION)
			return this.props.forgotPassword(signinEmail, () => navigate('AccountConfirmation', { origin, signinEmail }))
		}

		this.goToConfirmation()
	}

	goToConfirmation() {
		const { navigate } = this.props.navigation
		navigate('SendCode', { origin: 'sign-password' })
	}

	hidePassword() {
		this.setState({ visibilityPassword: false })
	}

	showPassword() {
		const { origin } = this.state
		if (origin === 'sign-email') {
			LoginTracker.trackSuccessEvent(APP_PASSWORD_VISIBILITY_ACTION)
		}

		this.setState({ visibilityPassword: true })
	}

	writePassword(value) {
		const { params } = this.props.route
		const { origin } = params
		if (origin === 'add-user') {
			this.props.passwordCallback(value)
			return
		}
		if (origin !== 'users-list') {
			this.props.setSigninPassword(value)
		}
	}

	toggleForceChangePassword() {
		const { forceChangePasswordValue } = this.state
		this.setState({ forceChangePasswordValue: !forceChangePasswordValue })
		if (this.props.forceChangePassword) {
			this.props.forceChangePassword(!forceChangePasswordValue)
		}
	}

	renderIconSecurity() {
		const { iconEye } = styles
		return this.state.visibilityPassword ? (
			<KyteButton
				width={40}
				height={27}
				onPress={() => this.hidePassword()}
				style={iconEye}
				testProps={generateTestID('hide-pass-pw')}
			>
				<KyteIcon name={'eye'} size={22} color={colors.primaryBg} />
			</KyteButton>
		) : (
			<KyteButton
				width={40}
				height={27}
				onPress={() => this.showPassword()}
				style={iconEye}
				testProps={generateTestID('view-pass-pw')}
			>
				<KyteIcon name={'eye-remove'} size={22} color={colors.primaryBg} />
			</KyteButton>
		)
	}

	renderField(field) {
		return (
			<Input
				{...field.input}
				onChangeText={field.input.onChange}
				placeholder={field.placeholder}
				keyboardType={field.kind}
				style={field.style}
				placeholderColor={field.placeholderColor}
				maxLength={field.maxLength}
				autoCapitalize={field.autoCapitalize}
				error={field.meta.touched ? field.meta.error : ''}
				returnKeyType="done"
				autoFocus
				secureTextEntry={field.secureTextEntry}
				rightIcon={field.rightIcon}
				testProps={generateTestID('password-pw')}
			/>
		)
	}

	renderButton() {
		const { bottomContainer } = styles
		const { handleSubmit, formValues } = this.props
		const { buttonLabel, buttonAlertDescription } = this.state
		return (
			<View style={bottomContainer}>
				<ActionButton
					alertDescription={buttonAlertDescription}
					disabled={formValues ? formValues.password.length < 6 : true}
					onPress={handleSubmit(this.submitForm.bind(this))}
					testProps={generateTestID('login-pw')}
				>
					{buttonLabel}
				</ActionButton>
			</View>
		)
	}

	renderButtonIForgotMyPassword() {
		const { alignContent } = styles
		const { buttonLabelIForgotMyPassword, shrinkSection } = this.state
		return (
			<View style={[alignContent, Platform.select({ ios: { bottom: shrinkSection && SMALLEST_SCREENS ? 5 : 0 } })]}>
				<TextButton
					onPress={() => this.forgotMyPassword()}
					title={buttonLabelIForgotMyPassword}
					style={[Type.Medium, { fontSize: 15 }]}
					color={colors.actionColor}
					testProps={generateTestID('forgot-pass-pw')}
				/>
			</View>
		)
	}

	renderTextIntroduction() {
		const { alignContent } = styles
		const { textIntroduction } = this.state

		return (
			<View style={alignContent}>
				<Text style={[Type.Regular, { fontSize: 16 }]}>{textIntroduction}</Text>
			</View>
		)
	}

	renderLoader() {
		const { loader, route } = this.props
		const { origin } = this.state
		const { params } = route
		if (params.showLoading && loader.visible) {
			return <LoadingCleanScreen />
		} else if (loader.visible && origin !== 'users-list' && origin !== 'add-user') {
			return <LoadingCleanScreen />
		}

		return null
	}

	renderTextIdentifier() {
		const { textEmail, alignContent, siglaContainer, nameContent, emailContent } = styles
		const { signinEmail, route } = this.props
		const { user } = route.params
		const { origin, shrinkSection } = this.state

		const renderName = () => {
			let name = ''
			if (user) {
				name = user.displayName
			}
			return (
				<View style={{ paddingBottom: 3, paddingTop: 10 }}>
					<Text style={nameContent}>{name} </Text>
				</View>
			)
		}

		const renderEmail = () => {
			let email = ''
			if (user) {
				email = user.email
			}
			if (origin !== 'users-lock') {
				return (
					<View>
						<Text testProps={generateTestID('next-login')} style={emailContent}>
							{email}{' '}
						</Text>
					</View>
				)
			}
			return
		}

		if (origin === 'users-list') {
			if (shrinkSection && SMALLEST_SCREENS) {
				return (
					<View style={alignContent}>
						{renderName()}
						{renderEmail()}
					</View>
				)
			}
			return (
				<View style={alignContent}>
					<View style={siglaContainer}>
						<CircleBadge
							info={user.displayName}
							backgroundColor={colors.secondaryBg}
							textColor="#FFFFFF"
							fontSize={18}
							size={50}
							style={Platform.select({ ios: { paddingTop: 2 } })}
						/>
					</View>
					{renderName()}
					{renderEmail()}
				</View>
			)
		}

		if (origin === 'users-lock') {
			if (shrinkSection && MEDIUM_SCREENS) {
				return <View style={alignContent}>{renderName()}</View>
			}
			return (
				<View style={alignContent}>
					<View style={siglaContainer}>
						<CircleBadge
							info={user.displayName}
							backgroundColor={colors.secondaryBg}
							textColor="#FFFFFF"
							fontSize={20}
							size={50}
							style={Platform.select({
								ios: { paddingTop: 2, paddingLeft: 5 },
								android: { paddingTop: 0, paddingLeft: 5 },
							})}
						/>
					</View>
					{renderName()}
				</View>
			)
		}

		if (origin === 'code-confirmation' || origin === 'sign-email') {
			return (
				<Text {...generateTestID('email-pw')} style={textEmail}>
					{signinEmail}
				</Text>
			)
		}

		return null
	}

	renderForceChangePassword() {
		const { labelSwitch } = styles
		const { shrinkSection } = this.state

		return shrinkSection && SMALLEST_SCREENS ? null : (
			<View style={{ paddingTop: shrinkSection ? 10 : 40 }}>
				<TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.toggleForceChangePassword()}>
					<View style={{ flex: 1 }}>
						<Text style={labelSwitch}>{I18n.t('userForcePasswordChange')}</Text>
					</View>
					<View>
						 <KyteSwitch
							onValueChange={() => this.toggleForceChangePassword()}
							active={this.state.forceChangePasswordValue}
						/>
					</View>
				</TouchableOpacity>
			</View>
		)
	}

	render() {
		const { outerContainer } = scaffolding
		const { fieldsContainer, field, alignContent } = styles
		const { origin, visibilityPassword, toolbarHeaderTitle, inputPlaceholder, shrinkSection } = this.state

		const calcMarginBottomTextEmail = () => {
			if (shrinkSection && SMALLEST_SCREENS) {
				return 0
			}

			if (origin === 'users-list') {
				return 15
			}

			return 48
		}

		const openIntercomMessenger = async () => {
			// console.log('SigninPassword no users-lock')
			await Intercom.loginUnidentifiedUser()
			await Intercom.present()
		}

		const rightButtons = () => {
			return [
				{
					icon: 'help',
					color: colors.actionColor,
					onPress: () => {
						Keyboard.dismiss()
						openIntercomMessenger()
					},
					iconSize: 22,
				},
			]
		}

		return (
			<KyteSafeAreaView style={outerContainer}>
				{origin !== 'add-user' ? (
					<KyteToolbar
						innerPage
						borderBottom={1.5}
						headerTitle={toolbarHeaderTitle}
						rightButtons={origin === 'users-lock' ? rightButtons() : null}
						goBack={() => this.goBackSigninEmail()}
					/>
				) : null}
				<CustomKeyboardAvoidingView style={{ flex: 1 }}>
					<View style={fieldsContainer(origin)}>
						<View
							style={[
								alignContent,
								{
									marginBottom: calcMarginBottomTextEmail(),
									...Platform.select({
										ios: {
											marginBottom: calcMarginBottomTextEmail(),
											marginTop: shrinkSection && SMALLEST_SCREENS ? 35 : 0,
										},
									}),
								},
							]}
						>
							{this.renderTextIdentifier()}
						</View>
						<View
							style={{
								height: 70,
								...Platform.select({
									ios: {
										marginTop: shrinkSection && MEDIUM_SCREENS ? 17 : 0,
										height: shrinkSection && MEDIUM_SCREENS ? 50 : 70,
									},
								}),
							}}
						>
							<Field
								placeholder={inputPlaceholder}
								placeholderColor={colors.primaryGrey}
								name="password"
								component={this.renderField}
								style={field}
								autoCapitalize="none"
								secureTextEntry={!visibilityPassword}
								rightIcon={origin !== 'users-list' && origin !== 'add-user' ? this.renderIconSecurity() : null}
								onChange={(event, newValue) => this.writePassword(newValue)}
							/>
						</View>
						{origin === 'sign-email' || origin === 'users-lock'
							? this.renderButtonIForgotMyPassword()
							: this.renderTextIntroduction()}
						{/*{(origin === 'add-user' || origin === 'reset-password') ? this.renderForceChangePassword() : null} */}
					</View>
					{origin !== 'add-user' ? this.renderButton() : null}
				</CustomKeyboardAvoidingView>
				{this.renderLoader()}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	fieldsContainer: (origin) => ({
		paddingHorizontal: origin === 'add-user' ? 2 : 18,
		justifyContent: 'center',
		flex: 1,
	}),
	alignContent: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	bottomContainer: {
		height: 70,
		justifyContent: 'center',
	},
	textEmail: [{ color: colors.primaryBg, fontSize: 15 }, Type.SemiBold],
	siglaContainer: {
		justifyContent: 'center',
		alignContent: 'center',
		width: 56,
		height: 56,
		backgroundColor: colors.secondaryBg,
		borderRadius: 100,
	},
	siglaContent: [
		{
			paddingTop: 3,
			color: '#fff',
			textAlign: 'center',
			fontSize: 20,
			lineHeight: 20,
		},
		Type.Medium,
	],
	nameContent: [
		{
			color: colors.secondaryBg,
			textAlign: 'center',
			fontSize: 18,
		},
		Type.SemiBold,
	],
	emailContent: [
		{
			color: colors.primaryBg,
			textAlign: 'center',
			fontSize: 16,
		},
		Type.Regular,
	],
	labelSwitch: {
		fontSize: 15,
		paddingTop: 3,
		color: colors.fadePrimary,
	},
	field: [
		Platform.select({
			ios: {
				height: 32,
			},
		}),
	],
	iconEye: {
		marginLeft: 10,
		justifyContent: 'flex-end',
		alignItems: 'center',
		position: 'relative',
		top: 1,
	},
}

const validate = (values) => {
	const errors = {}
	const passwordRegex = /.{6,}/i

	if (values.password && !passwordRegex.test(values.password)) {
		errors.password = I18n.t('signPasswordFieldValidate.lessThanSixDigits')
	}
	return errors
}

const SigninPassword = reduxForm({
	form: 'SigninPassword',
	validate,
	touchOnBlur: true,
	destroyOnUnmount: true,
	keepDirtyOnReinitialize: false,
})(SigninPasswordComponent)

export default connect(
	(state) => ({
		formValues: getFormValues('SigninPassword')(state),
		authUser: state.auth.user,
		signinEmail: state.auth.signinEmail,
		loader: state.common.loader,
		initialRoute: state.common.initialRouteName
	}),
	{
		setSigninPassword,
		doFormSignIn,
		forgotPassword,
		doFormResetPassword,
		changeCurrentUserPassword,
		changePasswordOfOtherUser,
		signInInternally,
		setInitialRouteName,
		createNonFormUserPassword,
	}
)(SigninPassword)
