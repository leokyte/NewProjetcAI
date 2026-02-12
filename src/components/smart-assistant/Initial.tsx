import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Welcome } from '@kyteapp/kyte-agent'
import type { ChatHandle, WelcomeHandle } from '@kyteapp/kyte-agent'
import { KyteScreen } from '../common'
import { connect } from 'react-redux'
import { NavigationProp, useFocusEffect } from '@react-navigation/native'
import { IUser } from '../../types/state/auth'
import {
	AgentTypeEnum,
	BillingPlanType,
	capitalize,
	IConversationSession,
	ICreateConversationSessionBody,
	IListConversationSessionsParams,
	IUserContext,
} from '@kyteapp/kyte-utils'
import { createSmartAssistantSession, fetchSmartAssistantSessions } from '../../stores/actions/SmartAssistantActions'
import { fetchUserContext } from '../../stores/actions/UserContextActions'
import I18n from '../../i18n/i18n'
import KyteMixpanel from '../../integrations/Mixpanel'
import { useAudioRecorder } from '../../hooks/useAudioRecorder'
import { useAudioPermission } from '../../hooks/useAudioPermission'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { colors as localColors } from '../../styles'
import Tooltip from '@kyteapp/kyte-ui-components/src/packages/utilities/tooltip/Tooltip'
import { getSuggestedQuestions } from '../../utils/suggested-questions'
import { logEvent } from '../../integrations'
import { Dimensions, Linking, Platform } from 'react-native'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import { setAudioPermissionRequested } from '../../stores/actions/CommonActions'
import { Padding } from '@kyteapp/kyte-ui-components'
import { KyteButton } from '../common/KyteButton'
import { KyteText } from '@kyteapp/kyte-ui-components'
import KyteNotifications from '../common/KyteNotifications'

const Strings = {
	t_title: I18n.t('assistant.header.title'),
	t_subtitle: I18n.t('assistant.intro.description'),
	t_new_chat: I18n.t('assistant.chat.title'),
	t_your_chats: I18n.t('assistant.chat.yourChats'),
	t_ask_me: I18n.t('assistant.input.placeholder'),
	t_assistant_tip_text: I18n.t('assistant.tooltip.text'),
	t_assistant_tip_send: I18n.t('assistant.tooltip.send'),
	t_transcribing: I18n.t('transcribing'),
	t_transcription_error: I18n.t('assistant.error.transcription'),
	t_experimental_feature: I18n.t('experimentalFeatureBanner.title'),
	t_experimental_feature_description: I18n.t('experimentalFeatureBanner.description'),
	t_offline_reconnect_message: I18n.t('reconnectToSendMessage'),
	t_recording: I18n.t('recording'),
	t_show_examples_button: I18n.t('assistant.showExamplesButton'),
	t_suggested_questions_title: I18n.t('assistant.suggestedQuestionsTitle'),
	t_generate_other: I18n.t('assistant.generateOther'),
	t_generating: I18n.t('assistant.generating'),
	t_audio_permission_denied: I18n.t('assistant.audioPermissionDenied'),
	t_audio_permission_description: I18n.t('assistant.audioPermissionDescription'),
	t_open_settings: I18n.t('assistant.openSettings'),
}

interface InitialProps {
	navigation: NavigationProp<any>
	user?: IUser
	sessions: IConversationSession[]
	plan: BillingPlanType
	isOnline?: boolean
	userContext: IUserContext | null
	audioPermissionRequested: boolean
	createSession: (body: ICreateConversationSessionBody) => Promise<any>
	fetchSessions: (params: IListConversationSessionsParams) => Promise<any>
	fetchUserContext: (aid: string) => Promise<any>
	setAudioPermissionRequested: (requested: boolean) => void
}

const Initial = ({
	navigation,
	user,
	sessions,
	plan,
	isOnline,
	userContext,
	audioPermissionRequested,
	createSession,
	fetchSessions,
	fetchUserContext,
	setAudioPermissionRequested,
}: InitialProps) => {
	const chatRef = React.useRef<ChatHandle>(null)
	const welcomeRef = React.useRef<WelcomeHandle>(null)
	const hasFocusedOnceRef = React.useRef(false)
	const userFirstName = user?.displayName?.split(' ')[0]
	const aid = user?.aid || ''
	const uid = user?.uid || ''
	const [showHeaderTooltip, setShowHeaderTooltip] = useState<'tip' | 'history' | null>(null)
	const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
	const [showPermissionNotification, setShowPermissionNotification] = useState(false)
	// Use audio permission hook to manage permission state
	const { isPermissionDenied, checkPermissionStatus, setPermissionDenied } = useAudioPermission({
		audioPermissionRequested,
		setAudioPermissionRequested,
	})
	useEffect(() => {
		fetchUserContext(aid)
	}, [aid, fetchUserContext])

	// Update suggested questions when userContext changes
	useEffect(() => {
		setSuggestedQuestions(getSuggestedQuestions(userContext, 3))
	}, [userContext])

	const triggerHeaderTooltip = useCallback((type: 'tip' | 'history') => {
		setShowHeaderTooltip(type)
		setTimeout(() => {
			setShowHeaderTooltip(null)
		}, 3000)
	}, [])

	const renderOfflineTooltip = useCallback(
		(type: 'tip' | 'history') => (content: React.ReactNode) =>
		(
			<Tooltip
				text={I18n.t('reconnectMessage')}
				positionY="bottom"
				isVisible={showHeaderTooltip === type}
				showArrow
				arrowPosition="top"
				arrowAlign="right"
				containerProps={{ style: { width: 190, right: 10, top: 50 } }}
				textProps={{ style: { textAlign: 'center' } }}
			>
				{content}
			</Tooltip>
		),
		[showHeaderTooltip]
	)

	const rightButtons = useMemo(() => {
		const buttons = [
			{
				icon: 'tip',
				onPress: () => {
					if (!isOnline) {
						triggerHeaderTooltip('tip')
						welcomeRef.current?.showOfflineTooltip()
						return
					}
					welcomeRef.current?.fillTipText(Strings.t_assistant_tip_text)
					KyteMixpanel.track('Smart AI Assistant Help Click')
				},
				color: !isOnline ? colors.black24 : undefined,
				renderParent: renderOfflineTooltip('tip'),
			},
		]

		if (!!sessions.length) {
			buttons.unshift({
				icon: 'history2',
				onPress: () => {
					if (!isOnline) {
						triggerHeaderTooltip('history')
						welcomeRef.current?.showOfflineTooltip()
						return
					}
					navigation.navigate('Sessions')
				},
				color: !isOnline ? colors.black24 : undefined,
				renderParent: renderOfflineTooltip('history'),
			})
		}

		return buttons
	}, [sessions.length, isOnline, navigation, triggerHeaderTooltip, renderOfflineTooltip])

	const handleCreateSession = React.useCallback(
		async (question: string, creationDate: string, inputType: 'text' | 'audio') => {
			navigation.navigate('Chat', {
				initialQuestion: question,
				initialInputType: inputType,
			})

			await createSession({
				aid,
				uid,
				wid: aid,
				question,
				creationDate,
				agentType: AgentTypeEnum.APP,
			})
		},
		[createSession, aid, uid, navigation]
	)

	const handleRegenerateSuggestedQuestions = React.useCallback(() => {
		setSuggestedQuestions(getSuggestedQuestions(userContext, 3))
	}, [userContext])

	const handleTrackSuggestionsSelect = React.useCallback(() => {
		logEvent('Smart AI Assistant Suggestions Select')
	}, [])

	const handleTrackNewSuggestions = React.useCallback(() => {
		logEvent('Smart AI Assistant New Suggestions')
	}, [])

	const handleTrackSuggestionsOpen = React.useCallback(() => {
		logEvent('Smart AI Assistant Suggestions Open')
	}, [])

	useEffect(() => {
		logEvent('Smart AI Assistant View')
	}, [])

	const openAppPermissionSettings = () => {
		if (Platform.OS === 'ios') {
			Linking.openURL('app-settings:')
		} else {
			Linking.openSettings()
		}
	}

	useFocusEffect(
		React.useCallback(() => {
			if (!aid || !uid) return
			fetchSessions({ aid, uid })
		}, [aid, uid, fetchSessions])
	)

	useFocusEffect(
		React.useCallback(() => {
			if (!hasFocusedOnceRef.current) {
				hasFocusedOnceRef.current = true
				return
			}

			// Clear input when returning to this screen
			welcomeRef.current?.clearInput()
			chatRef.current?.reset()
		}, [])
	)

	// Create audio recorder factory function for Welcome component
	const createAudioRecorder = useCallback(
		(options: Parameters<typeof useAudioRecorder>[0]) => {
			return useAudioRecorder({
				...options,
				onPermissionDenied: () => {
					// Mark that we've requested permission before
					setAudioPermissionRequested(true)
					// Set permission as denied immediately (don't wait for async check)
					setPermissionDenied()
					setShowPermissionNotification(true)
				},
				onPermissionGranted: () => {
					// Re-check permission status to update UI when permission is granted
					checkPermissionStatus()
				},
			})
		},
		[setAudioPermissionRequested, setPermissionDenied, checkPermissionStatus]
	)

	return (
		<KyteScreen
			navigation={navigation}
			title={Strings.t_title}
			rightButtons={rightButtons}
			headerProps={{
				borderBottom: 1,
			}}
		>
			<Welcome
				ref={welcomeRef}
				onSubmit={handleCreateSession}
				strings={Strings}
				userFirstName={I18n.t('assistant.greeting', { user_name: capitalize(userFirstName || '') })}
				useAudioRecorder={createAudioRecorder}
				plan={plan}
				isOnline={isOnline}
				suggestedQuestions={suggestedQuestions}
				onRegenerateQuestions={handleRegenerateSuggestedQuestions}
				onTrackSuggestionsSelect={handleTrackSuggestionsSelect}
				onTrackNewSuggestions={handleTrackNewSuggestions}
				onTrackSuggestionsOpen={handleTrackSuggestionsOpen}
				isPermissionDenied={isPermissionDenied}
			/>
			{showPermissionNotification && (
				<KyteNotifications
					containerWidth={Dimensions.get('window').width - 32}
					notifications={[
						{
							title: Strings.t_audio_permission_denied,
							subtitle: Strings.t_audio_permission_description,
							subtitleProps: { lineHeight: 20 },
							type: NotificationType.NEUTRAL,
							handleClose: () => setShowPermissionNotification(false),
							showBottomBorder: true,
							customChildren: (
								<Padding horizontal={8} bottom={4} top={6} style={{ marginBottom: 12 }}>
									<KyteButton onPress={openAppPermissionSettings} background={localColors.primaryLight} height={48}>
										<KyteText size={14} weight={500} color={localColors.darkGreen}>
											{Strings.t_open_settings}
										</KyteText>
									</KyteButton>
								</Padding>
							),
						},
					]}
				/>
			)}
		</KyteScreen>
	)
}

const mapStateToProps = (state: any) => {
	return {
		user: state.auth.user,
		sessions: state.smartAssistant.sessionsList ?? [],
		plan: state.billing.plan,
		isOnline: state.common?.isOnline,
		userContext: state.userContext?.data,
		audioPermissionRequested: state.common?.audioPermissionRequested,
	}
}

const mapDispatchToProps = {
	fetchSessions: fetchSmartAssistantSessions,
	createSession: createSmartAssistantSession,
	fetchUserContext,
	setAudioPermissionRequested,
}

export default connect(mapStateToProps, mapDispatchToProps)(Initial as any)
