import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm, getFormValues } from 'redux-form'
import { View, ScrollView, Keyboard, Text, Dimensions, Platform } from 'react-native'
import {
	KyteToolbar,
	ActionButton,
	Input,
	LoadingCleanScreen,
	CustomKeyboardAvoidingView,
	KyteSafeAreaView,
	TextButton,
} from '../common'
import { doFormSignUp } from '../../stores/actions'
import { scaffolding, colors } from '../../styles'
import I18n from '../../i18n/i18n'
import {
	LoginTracker,
	EMAIL_ACCOUNT_CREATION_SCREEN,
	EMAIL_ACCOUNT_CREATION_BUTTON_ACTION,
	EMAIL_ALREADY_HAD_ACCOUNT_BUTTON_ACTION,
	generateTestID,
} from '../../util'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALLEST_SCREENS = SCREEN_HEIGHT <= 480

class SignUpComponent extends Component {
	constructor(props) {
		super(props)

		this.state = { shrinkSection: false }
	}

	UNSAFE_componentWillMount() {
		this.KeyboardShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this))
		this.KeyboardHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this))
	}

	componentDidMount() {
		LoginTracker.trackSuccessEvent(EMAIL_ACCOUNT_CREATION_SCREEN)
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

	formSubmit({ name, email, password }) {
		Keyboard.dismiss()

		LoginTracker.trackSuccessEvent(EMAIL_ACCOUNT_CREATION_BUTTON_ACTION)
		this.props.doFormSignUp(name, email, password)
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
				autoFocus={field.autoFocus}
				secureTextEntry={field.secureTextEntry}
				rightIcon={field.rightIcon}
				contextMenuHidden={field.selectTextOnFocus}
				testProps={field.testProps}
			/>
		)
	}

	renderButton() {
		const { bottomContainer } = styles
		const { handleSubmit, valid } = this.props

		return (
			<View style={bottomContainer}>
				<ActionButton
					alertDescription={I18n.t('enterAllfields')}
					disabled={!valid}
					onPress={handleSubmit(this.formSubmit.bind(this))}
					testProps={generateTestID('create-acc-ca')}
				>
					{I18n.t('createAccount')}
				</ActionButton>
			</View>
		)
	}

	renderLoader() {
		return <LoadingCleanScreen />
	}

	renderTextIntroduction() {
		const { alignContent } = styles
		return (
			<View style={[alignContent, { marginTop: 10 }]}>
				<Text style={{ fontFamily: 'Graphik-Regular' }}>{I18n.t('textIntroductionNewPassword')}</Text>
			</View>
		)
	}

	renderGoAuth() {
		const { navigate } = this.props.navigation
		return (
			<TextButton
				title={I18n.t('AlreadyHaveAnAccount')}
				onPress={() => {
					LoginTracker.trackSuccessEvent(EMAIL_ALREADY_HAD_ACCOUNT_BUTTON_ACTION)
					navigate({ key: 'LoginPage', name: 'Login' })
				}}
				color={colors.actionColor}
				style={{ fontFamily: 'Graphik-Medium', paddingRight: 15 }}
			/>
		)
	}

	render() {
		const { goBack } = this.props.navigation
		const { params = {} } = this.props.route
		const { outerContainer } = scaffolding
		const { fieldsContainer } = styles
		const { visible } = this.props.loader
		const { shrinkSection } = this.state
		const fromSignIn = params.origin === 'from-signin'

		// Confirm Field
		// <Field
		//   placeholder={I18n.t('confirmEmailPlaceholder')}
		//   placeholderColor={colors.primaryGrey}
		//   name='email-confirm'
		//   kind='email-address'
		//   component={this.renderField}
		//   autoCapitalize='none'
		//   contextMenuHidden
		//   style={{ ...Platform.select({ ios: { height: 32 } }) }}
		// />

		return (
			<KyteSafeAreaView style={outerContainer}>
				<KyteToolbar
					innerPage
					borderBottom={1.5}
					headerTitle={I18n.t('createAccount')}
					goBack={() => goBack()}
					rightComponent={Platform.OS === 'ios' ? this.renderGoAuth() : null}
				/>
				<CustomKeyboardAvoidingView style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={fieldsContainer}>
						<Field
							testProps={generateTestID('email-ca')}
							placeholder={I18n.t('emailPlaceholder')}
							placeholderColor={colors.primaryGrey}
							name="email"
							kind="email-address"
							component={this.renderField}
							autoCapitalize="none"
							contextMenuHidden
							autoFocus={!fromSignIn}
							style={{ ...Platform.select({ ios: { height: 32 } }) }}
						/>
						<Field
							testProps={generateTestID('name-ca')}
							placeholder={I18n.t('namePlaceholder')}
							placeholderColor={colors.primaryGrey}
							name="name"
							autoFocus={fromSignIn}
							component={this.renderField}
							autoCapitalize="words"
							style={{ ...Platform.select({ ios: { height: 32 } }) }}
						/>
						<Field
							testProps={generateTestID('password-ca')}
							placeholder={I18n.t('passwordPlaceholder')}
							placeholderColor={colors.primaryGrey}
							name="password"
							component={this.renderField}
							autoCapitalize="none"
							style={{ ...Platform.select({ ios: { height: 32 } }) }}
						/>
						{shrinkSection && SMALLEST_SCREENS ? null : this.renderTextIntroduction()}
					</ScrollView>
					{shrinkSection && SMALLEST_SCREENS ? null : this.renderButton()}
				</CustomKeyboardAvoidingView>
				{visible ? this.renderLoader() : null}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	fieldsContainer: {
		paddingVertical: 20,
		paddingHorizontal: 18,
		justifyContent: 'center',
		flex: 1,
	},
	bottomContainer: {
		height: 70,
		justifyContent: 'center',
	},
	alignContent: {
		justifyContent: 'center',
		alignItems: 'center',
	},
}

const validate = (values) => {
	const errors = {}
	const passwordRegex = /.{6,}/i
	const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i
	// const differentEmails = values['email-confirm'] !== values.email;

	// Confirm Conditions

	// if (!values['email-confirm']) {
	//   errors['email-confirm'] = I18n.t('words.m.enterYourEmail');
	// }

	// if (values['email-confirm'] && differentEmails) {
	//   errors['email-confirm'] = errors.email = I18n.t('words.m.emailDoesntMatch');
	//   errors.email = I18n.t('words.m.emailDoesntMatch');
	// }

	if (!values.name) {
		errors.name = I18n.t('words.m.enterYourName')
	}

	if (!values.email) {
		errors.email = I18n.t('words.m.enterYourEmail')
	}

	if (!values.password) {
		errors.password = I18n.t('words.m.enterYourPassword')
	}

	if (values.email && !emailRegex.test(values.email)) {
		errors.email = I18n.t('receiptShareFieldValidate.invalid')
	}

	if (values.password && !passwordRegex.test(values.password)) {
		errors.password = I18n.t('signPasswordFieldValidate.lessThanSixDigits')
	}

	return errors
}

const SignUp = reduxForm({
	form: 'SignUp',
	validate,
})(SignUpComponent)

export default connect(
	(state) => {
		const initialValues = { email: state.auth.signinEmail }

		return {
			formValues: getFormValues('SignUp')(state),
			loader: state.common.loader,
			initialValues,
		}
	},
	{ doFormSignUp }
)(SignUp)
