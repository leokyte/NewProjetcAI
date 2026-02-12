import React from 'react'
import { Modal, TouchableOpacity, View } from 'react-native'
import I18n from '../../../i18n/i18n'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import KyteBaseButton from '../buttons/KyteBaseButton'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import KyteIcon from '@kyteapp/kyte-ui-components/src/packages/icons/KyteIcon/KyteIcon'

type UnsavedChangesModalProps = {
	isVisible: boolean
	onConfirm: () => void
	onCancel: () => void
	onDiscard: () => void
}

const String = {
	t_unsaved_changes_title: I18n.t('unsavedChanges.warning'),
	t_unsaved_changes_description: I18n.t('unsavedChanges.exitConfirmation'),
	t_unsaved_changes_exit_message: I18n.t('unsavedChanges.exitMessage'),
	t_unsaved_save: I18n.t('descriptionSaveButton'),
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({ isVisible, onConfirm, onCancel, onDiscard }) => {
	const overlay = { backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 10 }

	if (!isVisible) return null

	return (
		<Modal visible={isVisible} transparent={true} animationType="slide">
			<Container flex={1} justifyContent="center" alignItems="center" style={overlay}>
				<Container
					backgroundColor={colors.white}
					borderRadius={10}
					style={{ width: '90%', height: 304, justifyContent: 'space-between' }}
					position="relative"
				>
					<Container justifyContent="space-between" padding={20} borderBottomWidth={1} borderColor={colors.disable03}>
						<TouchableOpacity style={{ zIndex: 1, position: 'absolute', top: 20, right: 24 }} onPress={onCancel}>
							<KyteIcon name="close-navigation" size={16} color={colors.darkBlack} />
						</TouchableOpacity>
						<KyteText color={colors.darkBlack} allowFontScaling={false} style={{ fontSize: 16, fontWeight: '500' }}>
							{String.t_unsaved_changes_title}
						</KyteText>
					</Container>
					<Container padding={20} alignItems="center">
						<KyteText style={{ fontSize: 16 }} allowFontScaling={false} textAlign="center">
							{String.t_unsaved_changes_description}
						</KyteText>
					</Container>

					<Container borderTopWidth={1} borderColor={colors.disable03} padding={20} paddingTop={0}>
						<Margin bottom={16} top={15}>
							<KyteBaseButton type="disabled" onPress={onDiscard} allowFontScaling={false}>
								{String.t_unsaved_changes_exit_message}
							</KyteBaseButton>
						</Margin>
						<KyteBaseButton type="primary" onPress={onConfirm} allowFontScaling={false}>
							{String.t_unsaved_save}
						</KyteBaseButton>
					</Container>
				</Container>
			</Container>
		</Modal>
	)
}
