import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { connect } from 'react-redux'
import { IConversationSession } from '@kyteapp/kyte-utils'
import Initial from '../components/smart-assistant/Initial'
import Chat from '../components/smart-assistant/Chat'
import Sessions from '../components/smart-assistant/Sessions'

const Stack = createStackNavigator()

interface SmartAssistantProps {
	sessionDetail: IConversationSession
}

const SmartAssistantStack: React.FC<SmartAssistantProps> = () => {
	return (
		<Stack.Navigator initialRouteName="Initial">
			<Stack.Screen
				name="Initial"
				component={Initial}
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="Chat"
				component={Chat}
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="Sessions"
				component={Sessions}
				options={{
					headerShown: false,
				}}
			/>
		</Stack.Navigator>
	)
}

const mapStateToProps = (state: any) => {
	const smartAssistant = state.smartAssistant ?? {}

	return {
		sessionDetail: smartAssistant.sessionDetail,
	}
}

export default connect(mapStateToProps)(SmartAssistantStack)
