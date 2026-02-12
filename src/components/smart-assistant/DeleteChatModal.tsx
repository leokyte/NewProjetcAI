import React from 'react'
import { KyteModal } from '../common'
import { KyteText, Margin } from '@kyteapp/kyte-ui-components'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import KyteBaseButton from '../common/buttons/KyteBaseButton'
import I18n from '../../i18n/i18n'
import { renderBoldText } from '../../util'

interface DeleteChatModalProps {
	isVisible: boolean
	isDeleting?: boolean
	chatDescription: string
	onCancel: () => void
	onConfirm: () => void
}

const Strings = {
	t_delete_chat: I18n.t('assistant.deleteChat.title'),
	t_delete_chat_warning: I18n.t('actionCantUndone'),
	t_delete_chat_cancel: I18n.t('alertDismiss'),
}

const DeleteChatModal: React.FC<DeleteChatModalProps> = ({ isVisible, chatDescription, onCancel, onConfirm }) => {
	return (
		<KyteModal
			isModalVisible={isVisible}
			hideModal={onCancel}
			title={Strings.t_delete_chat}
			height="auto"
			topRadius={16}
			bottomRadius={16}
			noPadding
		>
			<Padding
				all={24}
				style={{
					borderTopWidth: 1,
					borderColor: '#15181E14',
				}}
			>
				<KyteText size={16} lineHeight={24} color={colors.black80} textAlign="center">
					{renderBoldText(chatDescription, { size: 16 })}
				</KyteText>

				<KyteText size={15} lineHeight={22} color={colors.black80} textAlign="center">
					{Strings.t_delete_chat_warning}
				</KyteText>
			</Padding>

			<Padding
				all={16}
				style={{
					borderTopWidth: 1,
					// TODO: move color to kyte-ui-components
					borderColor: '#15181E14',
				}}
			>
				<KyteBaseButton
					type="secondary"
					onPress={onCancel}
					textColor={colors.successTextColor}
					borderColor={colors.successTextColor}
				>
					{Strings.t_delete_chat_cancel}
				</KyteBaseButton>

				<Margin top={16} />

				<KyteBaseButton onPress={onConfirm}>{Strings.t_delete_chat}</KyteBaseButton>
			</Padding>
		</KyteModal>
	)
}

export default DeleteChatModal
