/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { connect } from 'react-redux'
import { checkIsCardServiceCustomized } from '../../../../util/util-preference'
import CardServiceConfigContainer from './CardServiceConfigContainer'
import CardServiceConfigEmptyState from './CardServiceConfigEmptyState'
import CardServiceHelp from './CardServiceHelp'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

class CardServiceConfigStack extends Component {
	render() {
		const { cardServiceConfig } = this.props
		const isCreditCardServiceConfigCustomized = checkIsCardServiceCustomized(cardServiceConfig)

		return (
			<Stack.Navigator screenOptions={screenOptions}>
				{!isCreditCardServiceConfigCustomized && (
					<Stack.Screen name="CardServiceConfigEmptyState" component={CardServiceConfigEmptyState} />
				)}
				<Stack.Screen name="CardServiceConfigContainer" component={CardServiceConfigContainer} />
				<Stack.Screen name="CardServiceHelp" component={CardServiceHelp} />
			</Stack.Navigator>
		)
	}
}

const mapStateToProps = (state) => ({
	cardServiceConfig: state.preference.account.cardService,
})

export default connect(mapStateToProps)(CardServiceConfigStack)
