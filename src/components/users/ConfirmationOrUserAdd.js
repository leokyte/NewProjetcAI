import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { connect } from 'react-redux'
import ConfirmationStack from '../../screens/Confirmation'
import UserAdd from './UserAdd'

const Stack = createStackNavigator()
const Routes = {
	USER_CREATE: 'UserAdd',
	EMAIL_CONFIRMATION: 'Confirmation',
}
const screenOptions = { headerShown: false }

const ConfirmationOrUserAdd = ({ user }) => {
	const initialRouteName = user.authVerified ? Routes.USER_CREATE : Routes.EMAIL_CONFIRMATION

	return (
		<Stack.Navigator initialRouteName={initialRouteName} screenOptions={screenOptions}>
			<Stack.Screen name={Routes.USER_CREATE} component={UserAdd} />
			<Stack.Screen
				name={Routes.EMAIL_CONFIRMATION}
				component={ConfirmationStack}
				initialParams={{ resetTo: 'Dashboard' }}
			/>
		</Stack.Navigator>
	)
}

const mapStateToProps = (state) => ({ user: state.auth.user })

export default connect(mapStateToProps)(ConfirmationOrUserAdd)
