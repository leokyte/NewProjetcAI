import React, { Component } from 'react'
import { View, Keyboard, Platform, Alert, Linking } from 'react-native'
import { connect } from 'react-redux'
import { Icon } from 'react-native-elements'
import { Field, reduxForm, getFormValues, change } from 'redux-form'
import { isEmpty } from 'lodash'
import {
	KyteToolbar,
	Input,
	KyteButton,
	KyteIcon,
	ActionButton,
	LoadingCleanScreen,
	CustomKeyboardAvoidingView,
	KyteSafeAreaView,
} from '../common'
import {
	emailValidate,
	generateTestID,
	LoginTracker,
	APP_EMAIL_SCREEN,
	EMAIL_ACCOUNT_VERIFY_NEW,
	EMAIL_ACCOUNT_VERIFY_EXISTS,
} from '../../util'
import {
	doFormSignIn,
	verifySignIn,
	doGoogleSignIn,
	doFacebookSignIn,
	doAppleSignIn,
	setSigninEmail,
} from '../../stores/actions'
import I18n from '../../i18n/i18n'
import { scaffolding, colors } from '../../styles'

class SigninEmailComponent extends Component {
	componentDidMount() {
		LoginTracker.trackSuccessEvent(APP_EMAIL_SCREEN)
	}

	goToPassword(provider) {
		const { navigate } = this.props.navigation
		if (provider === 'password') {
			LoginTracker.trackSuccessEvent(EMAIL_ACCOUNT_VERIFY_EXISTS)
			return navigate('SigninPassword', { origin: 'sign-email' })
		}

		if (provider === 'google.com') {
			return this.googleLogin()
		}

		if (provider === 'facebook.com') {
			return this.facebookLogin()
		}

		if (provider === 'apple.com') {
			if (Platform.OS === 'ios') return this.appleLogin()
			return this.showAppleSigninAlert()
		}

		if (provider === undefined) {
			LoginTracker.trackSuccessEvent(EMAIL_ACCOUNT_VERIFY_NEW)
			return navigate({ key: 'SignUpPage', name: 'SignUp', params: { origin: 'from-signin' } })
		}

		return null
	}

	showAppleSigninAlert() {
		Alert.alert(I18n.t('words.s.attention'), I18n.t('appleSignInAndroidError'), [
			{
				text: I18n.t('expressions.learnMore'),
				onPress: () => Linking.openURL(I18n.t('appleSignInAndroidErrorURL')),
			},
			{ text: I18n.t('words.s.ok').toUpperCase() },
		])
	}

	verifyEmail() {
		const { email } = this.props.formValues
		Keyboard.dismiss()
		this.props.verifySignIn(email, this.goToPassword.bind(this))
	}

	goBackLogin() {
		const { goBack } = this.props.navigation

		Keyboard.dismiss()
		goBack()
	}

	googleLogin() {
		this.props.doGoogleSignIn()
	}

	facebookLogin() {
		this.props.doFacebookSignIn()
	}

	appleLogin() {
		this.props.doAppleSignIn()
	}

	validationEmail() {
		this.verifyEmail()
	}

	cleanEmailForm() {
		this.props.dispatch(change('SigninEmail', 'email', null))
		this.props.setSigninEmail('')
	}

	renderIconClean() {
		const { iconClean } = styles
		return (
			<KyteButton width={40} height={27} onPress={() => this.cleanEmailForm()} style={iconClean}>
				<KyteIcon name="close-navigation" size={10} color={colors.secondaryBg} />
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
				rightIcon={field.rightIcon}
				testProps={generateTestID('email-login')}
			/>
		)
	}

	renderButton() {
		const { bottomContainer } = styles
		const { handleSubmit, valid } = this.props
		return (
			<View style={bottomContainer}>
				<ActionButton
					alertDescription={I18n.t('receiptShareFieldValidate.empty')}
					disabled={!valid}
					onPress={handleSubmit(this.validationEmail.bind(this))}
					rightIcon={<Icon name="keyboard-arrow-right" color={!valid ? colors.actionColor : '#fff'} />}
					testProps={generateTestID('next-login')}
				>
					{I18n.t('words.s.proceed')}
				</ActionButton>
			</View>
		)
	}

	renderLoader() {
		return <LoadingCleanScreen />
	}

	render() {
		const { outerContainer } = scaffolding
		const { fieldsContainer, field, bottomContainer } = styles
		const { visible } = this.props.loader

		return (
			<KyteSafeAreaView style={outerContainer}>
				<KyteToolbar innerPage borderBottom={1.5} headerTitle={I18n.t('signIn')} goBack={() => this.goBackLogin()} />
				<CustomKeyboardAvoidingView style={{ flex: 1 }}>
					<View style={[fieldsContainer, { flex: 1 }]}>
						<View style={bottomContainer}>
							<Field
								placeholder={I18n.t('words.s.email')}
								placeholderColor={colors.primaryGrey}
								name="email"
								kind="email-address"
								component={this.renderField}
								style={field}
								autoCapitalize="none"
								rightIcon={
									this.props.formValues && !isEmpty(this.props.formValues.email) ? this.renderIconClean() : null
								}
							/>
						</View>
					</View>
					{this.renderButton()}
				</CustomKeyboardAvoidingView>
				{visible ? this.renderLoader() : null}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	fieldsContainer: {
		paddingHorizontal: 18,
		justifyContent: 'center',
	},
	bottomContainer: {
		height: 70,
		justifyContent: 'center',
	},
	field: Platform.select({
		ios: {
			height: 32,
		},
	}),
	iconClean: {
		marginLeft: 10,
		justifyContent: 'flex-end',
		alignItems: 'center',
		position: 'relative',
		top: 1,
	},
}

const SigninEmail = reduxForm({
	form: 'SigninEmail',
	validate: emailValidate,
})(SigninEmailComponent)

export default connect(
	(state) => ({
		formValues: getFormValues('SigninEmail')(state),
		initialValues: { email: state.auth.signinEmail, signinType: state.auth.signinType },
		loader: state.common.loader,
	}),
	{ doFormSignIn, verifySignIn, doGoogleSignIn, doFacebookSignIn, doAppleSignIn, setSigninEmail }
)(SigninEmail)
