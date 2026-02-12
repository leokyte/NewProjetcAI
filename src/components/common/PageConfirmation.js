import React, { Component } from 'react'
import { View, Text, Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { scaffolding, colors } from '../../styles'
import I18n from '../../i18n/i18n'
import { ActionButton, KyteIcon, KyteSafeAreaView } from '../common'
import { setInitialRouteName } from '../../stores/actions'
import NavigationService from '../../services/kyte-navigation'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

class PageConfirmation extends Component {
	constructor(props) {
		super(props)
		const { params = {} } = this.props.route

		this.state = {
			complexText: params.complexText ? params.complexText : false,
			textConfirmation: params.textConfirmation
				? params.textConfirmation
				: I18n.t('words.m.accountConfirmedSuccessfully'),
			labelButton: params.labelButton ? params.labelButton : I18n.t('words.s.ok').toUpperCase(),
			onPress: params.onPress ? params.onPress : null,
		}
	}

	componentWillUnmount() {
		const { initialRouteName } = this.props
		NavigationService.reset(initialRouteName)
	}

	onPressButton() {
		const { params = {} } = this.props.route
		const { helper, navigation, initialRouteName } = this.props

		if (params.returnPreviousScreen) {
			return this.props.navigation.pop(2)
		}

		if (helper.actualStep === 'invite-users') {
			NavigationService.navigate(null, 'Users')
			return
		}

		if (params.resetTo) {
			navigation.reset({
				index: 0,
				routes: [{ name: params.resetTo }],
			})
			return undefined
		}

		if (!this.state.onPress) {
			NavigationService.reset(initialRouteName)
			return
		}

		NavigationService.navigate(null, this.state.onPress)
		// navigate(this.state.onPress);
	}

	renderText() {
		const { infoStyle } = styles
		const { textConfirmation } = this.state
		return <Text style={infoStyle}>{textConfirmation}</Text>
	}

	render() {
		const { outerContainer, bottomContainer } = scaffolding
		const { infoContainer } = styles
		const { textConfirmation, labelButton, complexText } = this.state

		return (
			<KyteSafeAreaView style={outerContainer}>
				<View style={infoContainer}>
					<KyteIcon name={'check-inner'} size={240} color={colors.actionColor} />
					{complexText ? textConfirmation : this.renderText()}
				</View>
				<View style={bottomContainer}>
					<ActionButton onPress={() => this.onPressButton()}>{labelButton}</ActionButton>
				</View>
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	infoContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 30,
	},
	infoStyle: {
		fontFamily: 'Graphik-Medium',
		fontSize: 16,
		textAlign: 'center',
		color: colors.primaryColor,
		...Platform.select({
			ios: { lineHeight: SMALL_SCREENS ? 18 : 22 },
			android: { lineHeight: SMALL_SCREENS ? 18 : 25 },
		}),
	},
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
	helper: state.onboarding.helper,
	initialRouteName: state.common.initialRouteName,
})
const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators({ setInitialRouteName }, dispatch),
})
export default connect(mapStateToProps, mapDispatchToProps)(PageConfirmation)
