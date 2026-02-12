import React, { useEffect } from 'react'
import { KyteScreen } from '../common'
import { connect } from 'react-redux'
import {
	fetchSmartAssistantSessionDetail,
	fetchSmartAssistantSessions,
} from '../../stores/actions/SmartAssistantActions'
import { IConversationSession, IListConversationSessionsParams } from '@kyteapp/kyte-utils'
import { ActivityIndicator, ScrollView } from 'react-native'
import { Session } from '@kyteapp/kyte-agent'
import NewMessageButton from './NewMessageButton'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { NavigationProp } from '@react-navigation/native'
import I18n from '../../i18n/i18n'
import { IUser } from '../../types/state/auth'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'

interface SessionsProps {
	sessions: IConversationSession[]
	isFetchingSessions?: boolean
	navigation: NavigationProp<any>
	user?: IUser
	fetchSessionDetail: (sessionId: string) => Promise<any>
	fetchSessions: (params: IListConversationSessionsParams) => Promise<any>
}

const Strings = {
	t_your_chats: I18n.t('assistant.chat.yourChats'),
}

const Sessions = ({
	sessions,
	isFetchingSessions,
	navigation,
	user,
	fetchSessionDetail,
	fetchSessions,
}: SessionsProps) => {
	const aid = user?.aid || ''
	const uid = user?.uid || ''

	useEffect(() => {
		if (!aid || !uid) return
		fetchSessions({ aid, uid })
	}, [aid, uid, fetchSessions])

	return (
		<KyteScreen
			title={Strings.t_your_chats}
			navigation={navigation}
			rightButtons={[
				{
					onPress: () => {},
					renderCustomButton: () => (
						<NewMessageButton
							isLoading={false}
							onPress={() => {
								navigation.reset({ index: 0, routes: [{ name: 'Initial' }] })
							}}
						/>
					),
				},
			]}
			headerProps={{ innerPage: true, borderBottom: 1, goBack: () => navigation.goBack() }}
		>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: colors.white }}>
				{isFetchingSessions ? (
					<Container flex={1} justifyContent="center">
						<ActivityIndicator size="large" color={colors.green03Kyte} />
					</Container>
				) : (
					sessions?.map((session) => (
						<Session
							key={session._id}
							session={session}
							handleSessionClick={(sessionId) => {
								fetchSessionDetail(sessionId)
								navigation.navigate('Chat', { isChatHistory: true })
							}}
						/>
					))
				)}
			</ScrollView>
		</KyteScreen>
	)
}

const mapStateToProps = (state: any) => {
	const authState = state.auth ?? {}
	const user = authState.user
	const smartAssistant = state.smartAssistant ?? {}

	return {
		user,
		sessions: smartAssistant.sessionsList ?? [],
		isFetchingSessions: Boolean(smartAssistant.isFetchingSessions),
	}
}

const mapDispatchToProps = {
	fetchSessions: fetchSmartAssistantSessions,
	fetchSessionDetail: fetchSmartAssistantSessionDetail,
}

export default connect(mapStateToProps, mapDispatchToProps)(Sessions as any)
