import React from 'react'
import { MobileChat } from '@kyteapp/kyte-agent'
import { useAudioRecorder } from '../../hooks/useAudioRecorder'
import { useAudioPermission } from '../../hooks/useAudioPermission'
import { KyteScreen } from '../common'
import { connect } from 'react-redux'
import Config from 'react-native-config'
import { Dimensions, Linking, Platform } from 'react-native'
import { setAudioPermissionRequested } from '../../stores/actions/CommonActions'
import { IStore } from '../../types/state/auth'
import { IBilling, IDeleteConversationSessionBody, IGetConversationSessionResponse } from '@kyteapp/kyte-utils'
import {
	clearSmartAssistantSessionDetail,
	deleteSmartAssistantSession,
	fetchSmartAssistantSessionDetail,
	fetchSmartAssistantSessions,
} from '../../stores/actions/SmartAssistantActions'
import I18n, { getLocale } from '../../i18n/i18n'
import NewMessageButton from './NewMessageButton'
import DeleteChatModal from './DeleteChatModal'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { NavigationProp, useFocusEffect } from '@react-navigation/native'
import KyteMixpanel from '../../integrations/Mixpanel'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import { Padding } from '@kyteapp/kyte-ui-components'
import { KyteButton } from '../common/KyteButton'
import { KyteText } from '@kyteapp/kyte-ui-components'
import KyteNotifications from '../common/KyteNotifications'
import { colors as localColors } from '../../styles'

const Strings = {
	t_ai_mistakes: I18n.t('assistant.disclaimer'),
	t_seems_there_was_some_problem: I18n.t('assistant.error.title'),
	t_try_trying_again: I18n.t('assistant.error.subtitle'),
	t_loading: I18n.t('assistant.loading.message'),
	t_new_conversation: I18n.t('assistant.chat.title'),
	t_transcribing: I18n.t('transcribing'),
	t_transcription_error: I18n.t('assistant.error.transcription'),
	t_today: I18n.t('periodTypes.today'),
	t_yesterday: I18n.t('periodTypes.yesterday'),
	t_recording: I18n.t('recording'),
	t_offline_reconnect_message: I18n.t('reconnectToSendMessage'),
	t_audio_permission_denied: I18n.t('assistant.audioPermissionDenied'),
	t_audio_permission_description: I18n.t('assistant.audioPermissionDescription'),
	t_open_settings: I18n.t('assistant.openSettings'),
}

interface SmartAssistantProps {
	navigation: NavigationProp<any>
	route: any
	aid: string
	uid: string
	storeInfo?: IStore
	billing?: IBilling
	isCreatingSession: boolean
	isDeletingSession: boolean
	isLoadingSessionDetail: boolean
	sessionDetail: IGetConversationSessionResponse | null
	isOnline?: boolean
	audioPermissionRequested: boolean
	fetchSessions: (params: any) => Promise<any>
	deleteSession: (body: IDeleteConversationSessionBody) => Promise<any>
	fetchSessionDetail: (sessionId: string) => Promise<any>
	clearSessionDetail: () => void
	setAudioPermissionRequested: (requested: boolean) => void
}

const Chat = ({
	navigation,
	route,
	aid,
	uid,
	storeInfo,
	billing,
	isCreatingSession,
	isDeletingSession,
	isLoadingSessionDetail,
	sessionDetail,
	isOnline,
	audioPermissionRequested,
	deleteSession,
	clearSessionDetail,
	setAudioPermissionRequested,
}: SmartAssistantProps) => {
	const plan = billing?.extraPlan?.plan ?? billing?.plan ?? ''
	const planStatus = billing?.status ?? ''
	const initialQuestion = route?.params?.initialQuestion ?? ''
	const initialInputType = route?.params?.initialInputType ?? 'text'
	const isLoading = isCreatingSession || isDeletingSession
	const [isDeleteModalVisible, setDeleteModalVisible] = React.useState(false)
	const [showPermissionNotification, setShowPermissionNotification] = React.useState(false)
	const hasShownNotificationRef = React.useRef(false)

	// Use audio permission hook to manage permission state
	const { isPermissionDenied, checkPermissionStatus, setPermissionDenied } = useAudioPermission({
		audioPermissionRequested,
		setAudioPermissionRequested,
		// Don't auto-show notification on mount, only when user tries to use mic
		onPermissionStatusChange: (isDenied) => {
			// Only hide notification if permission is granted
			if (!isDenied) {
				setShowPermissionNotification(false)
				hasShownNotificationRef.current = false
			}
		},
	})

	const openAppPermissionSettings = React.useCallback(() => {
		if (Platform.OS === 'ios') {
			Linking.openURL('app-settings:')
		} else {
			Linking.openSettings()
		}
	}, [])

	// Wrap useAudioRecorder to track permission state
	const wrappedUseAudioRecorder = React.useCallback(
		(options: Parameters<typeof useAudioRecorder>[0]) => {
			return useAudioRecorder({
				...options,
				onPermissionDenied: () => {
					// Mark that we've requested permission before
					setAudioPermissionRequested(true)
					// Set permission as denied immediately (don't wait for async check)
					setPermissionDenied()
					// Show notification only when user actually tries to use mic
					if (!hasShownNotificationRef.current) {
						setShowPermissionNotification(true)
						hasShownNotificationRef.current = true
					}
					options.onPermissionDenied?.()
				},
				onPermissionGranted: () => {
					// Re-check permission status to update UI when permission is granted
					checkPermissionStatus()
					options.onPermissionGranted?.()
				},
			})
		},
		[setAudioPermissionRequested, setPermissionDenied, checkPermissionStatus]
	)

	const handleDeleteSession = React.useCallback(
		(sessionId: string) => {
			return deleteSession({ session_id: sessionId })
		},
		[deleteSession]
	)

	const handleOpenDeleteModal = React.useCallback(() => {
		if (sessionDetail?.session_id) {
			setDeleteModalVisible(true)
		}
	}, [sessionDetail?.session_id])

	const handleCloseDeleteModal = React.useCallback(() => {
		setDeleteModalVisible(false)
	}, [])

	const handleConfirmDelete = React.useCallback(async () => {
		if (!sessionDetail?.session_id) return
		try {
			await handleDeleteSession(sessionDetail.session_id)
			KyteMixpanel.track('Smart AI Assistant Conversation Delete', {
				session_id: sessionDetail.session_id,
			})
			// clear session detail from store before navigating back to avoid stale session_id
			clearSessionDetail?.()
			navigation.reset({
				index: 0,
				routes: [{ name: 'Initial' }],
			})
		} finally {
			setDeleteModalVisible(false)
		}
	}, [handleDeleteSession, sessionDetail?.session_id, clearSessionDetail])

	React.useEffect(() => {
		if (initialQuestion) {
			navigation.setParams({ initialQuestion: undefined })
		}
	}, [initialQuestion, navigation])

	return (
		<KyteScreen
			navigation={navigation}
			title={sessionDetail?.title ?? Strings.t_new_conversation}
			headerProps={{
				borderBottom: 1,
				innerPage: true,
				headerTextStyle: { color: isCreatingSession ? colors.black24 : undefined },
				goBack: () => {
					navigation.goBack()
					clearSessionDetail()
				},
			}}
			rightButtons={[
				{
					icon: 'trash',
					onPress: isLoading ? () => {} : handleOpenDeleteModal,
					color: isLoading ? colors.black24 : undefined,
				},
				{
					onPress: () => {},
					renderCustomButton: () => (
						<NewMessageButton
							isLoading={isLoading}
							onPress={() => {
								clearSessionDetail?.()
								navigation.reset({
									index: 0,
									routes: [{ name: 'Initial' }],
								})
							}}
						/>
					),
				},
			]}
		>
			<MobileChat
				language={getLocale()}
				aid={aid}
				uid={uid}
				baseUrl={`${Config.API_GATEWAY_BASE_URL}/kyte-ai`}
				urlKey={Config.APIM_SUBSCRIPTION_KEY ?? ''}
				store={{
					description: storeInfo?.infoExtra,
					name: storeInfo?.name,
				}}
				phone={storeInfo?.phone}
				plan={plan}
				planStatus={planStatus}
				isLoadingSessionDetail={isLoadingSessionDetail}
				sessionDetail={sessionDetail}
				strings={Strings}
				initialQuestion={initialQuestion}
				initialInputType={initialInputType}
				trackChatMessageSent={(sessionId: string, inputType: 'text' | 'audio') =>
					KyteMixpanel.track('Smart AI Assistant Message Send', { session_id: sessionId, input_type: inputType })
				}
				trackChatError={() => KyteMixpanel.track('Smart AI Assistant LLM Error')}
				useAudioRecorder={wrappedUseAudioRecorder}
				isOnline={isOnline}
				isPermissionDenied={isPermissionDenied}
			/>
			<DeleteChatModal
				isVisible={isDeleteModalVisible}
				chatDescription={I18n.t('assistant.deleteChat.description', { chat_name: sessionDetail?.title ?? '' })}
				onCancel={handleCloseDeleteModal}
				onConfirm={handleConfirmDelete}
				isDeleting={isDeletingSession}
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
							handleClose: () => {
								setShowPermissionNotification(false)
								hasShownNotificationRef.current = false
							},
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
	const authState = state.auth ?? {}
	const user = authState.user
	const storeInfo = authState.store
	const billing = state.billing
	const smartAssistant = state.smartAssistant ?? {}

	return {
		aid: user?.aid ?? '',
		uid: user?.uid ?? '',
		storeInfo,
		billing,
		isCreatingSession: Boolean(smartAssistant.isCreatingSession),
		isDeletingSession: Boolean(smartAssistant.isDeletingSession),
		isLoadingSessionDetail: Boolean(smartAssistant.isLoadingSessionDetail),
		sessionDetail: smartAssistant.sessionDetail,
		isOnline: state.common?.isOnline,
		audioPermissionRequested: state.common?.audioPermissionRequested,
	}
}

const mapDispatchToProps = {
	fetchSessions: fetchSmartAssistantSessions,
	deleteSession: deleteSmartAssistantSession,
	fetchSessionDetail: fetchSmartAssistantSessionDetail,
	clearSessionDetail: clearSmartAssistantSessionDetail,
	setAudioPermissionRequested,
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat as any)
