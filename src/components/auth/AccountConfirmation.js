import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, Alert, Platform, Linking } from 'react-native'
import Intercom from '@intercom/intercom-react-native'
import { KyteToolbar, Calculator, TextButton, LoadingCleanScreen, KyteSafeAreaView } from '../common'
import { scaffolding, colors } from '../../styles'
import I18n from '../../i18n/i18n'
import {
	setAuthVerified,
	setAuthVerifiedResetPassword,
	forgotPassword,
	resendCodeValidation,
	updateDrawerVisibility,
} from '../../stores/actions'
import NavigationService from '../../services/kyte-navigation'
import { LoginTracker, FORGOT_PASSWORD_CODE_CONFIRMATION_SCREEN, generateTestID } from '../../util'

class AccountConfirmation extends Component {
	constructor(props) {
		super(props)
		const { params = {} } = this.props.route
		const origin = params.origin || ''

		let signinEmail = null
		if (origin === 'users-lock') {
			signinEmail = params.user.email
		} else if (origin === 'sign-email') {
			signinEmail = params.signinEmail
		} else {
			signinEmail = props.auth.user.email
		}

		this.state = {
			confirmationNumber: '',
			numbersArr: [],
			origin,
			signinEmail,
		}
	}

	componentDidMount() {
		const { origin } = this.state
		if (origin === 'sign-email') {
			LoginTracker.trackSuccessEvent(FORGOT_PASSWORD_CODE_CONFIRMATION_SCREEN)
		}
	}

	rightButtons() {
		return [
			{
				icon: 'help',
				color: colors.actionColor,
				onPress: () => {
					// console.log('AccountConfirmation - Forgot my password.')
					Intercom.present()
				},
				iconSize: 22,
			},
		]
	}

	showAlert(email) {
		Alert.alert(I18n.t('words.s.attention'), `${I18n.t('codeYouResent')} ${email}`, [{ text: I18n.t('alertOk') }])
	}

	resendCode() {
		const { signinEmail } = this.state
		const { auth } = this.props

		if (auth && auth.isLogged) {
			this.props.resendCodeValidation(signinEmail, this.showAlert(signinEmail))
		} else {
			this.props.forgotPassword(signinEmail, this.showAlert(signinEmail))
		}
	}

	goToResetPassword() {
		const { signinEmail } = this.state
		const { params = {} } = this.props.route
		const origin = params.origin || ''

		this.setState({ numbersArr: [] })
		if (origin === 'users-lock') {
			NavigationService.reset('UsersLockPassword', 'UsersLockPassword', {
				user: {
					displayName: params.user.displayName,
					psw: params.user.psw,
					uid: params.user.uid,
					email: params.user.email,
				},
				origin: 'users-lock-reset',
			})
		} else {
			NavigationService.reset('SigninPassword', 'SigninPassword', {
				signinEmail,
				origin: 'code-confirmation',
			})
		}
	}

	confirmationDone() {
		const { navigate } = this.props.navigation
		if (Platform.OS === 'ios') {
			this.props.updateDrawerVisibility(false) // just fixing the shadow
		}

		// navigate('PageConfirmation') // now Kyte will wait for the notification from server
	}

	incorrectCode() {
		Alert.alert(I18n.t('invalidCodeTitle'), I18n.t('invalidCodeAlertDescription'), [{ text: I18n.t('alertOk') }])
		this.setState({ numbersArr: [], confirmationNumber: '' })
	}

	insertNumber(number) {
		const { numbersArr, signinEmail } = this.state
		if (numbersArr.length <= 4) {
			numbersArr.push(number)
		} else {
			const { auth } = this.props
			numbersArr.push(number)

			if (auth.isLogged) {
				const { params } = this.props.route
				const origin = params ? params.origin || '' : ''

				if (origin === 'users-lock') {
					this.props.setAuthVerifiedResetPassword(
						params.user.email,
						parseInt(numbersArr.join('')),
						this.goToResetPassword.bind(this),
						this.incorrectCode.bind(this)
					)
				} else {
					this.props.setAuthVerified(
						parseInt(numbersArr.join('')),
						this.confirmationDone.bind(this),
						this.incorrectCode.bind(this)
					)
				}
			} else {
				this.props.setAuthVerifiedResetPassword(
					signinEmail,
					parseInt(numbersArr.join('')),
					this.goToResetPassword.bind(this),
					this.incorrectCode.bind(this)
				)
			}
		}
	}

	removeNumber() {
		const { numbersArr } = this.state
		numbersArr.pop()
	}

	renderLoader() {
		return <LoadingCleanScreen />
	}

	render() {
		const { goBack, navigate } = this.props.navigation
		const { params } = this.props.route
		const { numbersArr, signinEmail } = this.state
		const { outerContainer } = scaffolding
		const {
			topContainer,
			underline,
			numberHolder,
			numberStyle,
			textStyle,
			underlineContainer,
			numbersContainer,
			emailInfoContainer,
			resetCode,
			numbersSeparator,
			codeContainer,
		} = styles

		const { loader } = this.props
		const { visible } = loader

		const pattern = [0, 0, 0, 0, 0, 0]
		const separate = 2

		const underlinePattern = () =>
			pattern.map((item, index) => {
				const active = numbersArr.length > index

				return (
					<View
						style={[
							underline(active ? colors.pimaryLighter : colors.fadePrimary),
							separate === index ? { marginRight: 30 } : null,
						]}
						key={index}
					/>
				)
			})

		const numbers = () =>
			numbersArr.map((number, index) => (
				<View style={[numberHolder, separate === index ? { marginRight: 30 } : null]} key={index}>
					<Text style={numberStyle}>{number}</Text>
				</View>
			))

		return (
			<KyteSafeAreaView style={outerContainer}>
				<KyteToolbar
					innerPage={!(params.origin && params.origin === 'default')}
					borderBottom={1.5}
					headerTitle={I18n.t('confirmation')}
					goBack={() => goBack()}
					rightButtons={this.rightButtons()}
					navigate={navigate}
					navigation={this.props.navigation}
				/>
				<View style={topContainer}>
					<View style={emailInfoContainer}>
						<Text style={[textStyle, { fontFamily: 'Graphik-Regular' }]}>{I18n.t('enterCodeYouSent')}</Text>
						<Text {...generateTestID('email-crp')} style={[textStyle, { fontFamily: 'Graphik-Semibold' }]}>
							{signinEmail}
						</Text>
					</View>
					<View {...generateTestID('code-crp')} style={codeContainer}>
						<View style={numbersContainer}>{numbers()}</View>
						<View style={numbersSeparator} />
						<View style={underlineContainer}>{underlinePattern()}</View>
					</View>
					<TextButton
						onPress={() => this.resendCode()}
						title={I18n.t('resendCode')}
						style={resetCode}
						color={colors.actionColor}
						size={14}
						testProps={generateTestID('resend-crp')} // ana
					/>
				</View>
				<View style={{ flex: 1 }}>
					<Calculator
						state={this}
						stateProp="confirmationNumber"
						stateValue={this.state.confirmationNumber.toString()}
						getPressedNumber={(number) => this.insertNumber(number)}
						backPressAction={() => this.removeNumber()}
						disablePress={numbersArr.length >= 6}
						noConfirm
					/>
				</View>
				{visible ? this.renderLoader() : null}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	topContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.lightBg,
	},
	underline: (borderColor) => ({
		borderBottomWidth: 1.5,
		borderColor,
		width: 36,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 8,
	}),
	numberHolder: {
		width: 36,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 8,
	},
	numbersContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		height: 50,
		paddingLeft: 8,
	},
	numberStyle: {
		fontFamily: 'Graphik-Light',
		fontSize: 34,
	},
	underlineContainer: {
		flexDirection: 'row',
		paddingLeft: 8,
	},
	codeContainer: {
		position: 'relative',
		marginBottom: 30,
	},
	numbersSeparator: {
		width: 10,
		height: 1.5,
		backgroundColor: colors.fadePrimary,
		position: 'absolute',
		top: 28,
		alignSelf: 'center',
	},
	textStyle: {
		fontSize: 14,
		color: colors.primaryBg,
	},
	emailInfoContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},
	resetCode: {
		fontFamily: 'Graphik-Medium',
		justifyContent: 'center',
	},
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	signinEmail: state.auth.signinEmail,
	loader: state.common.loader,
})

export default connect(mapStateToProps, {
	setAuthVerified,
	setAuthVerifiedResetPassword,
	forgotPassword,
	resendCodeValidation,
	updateDrawerVisibility,
})(AccountConfirmation)
