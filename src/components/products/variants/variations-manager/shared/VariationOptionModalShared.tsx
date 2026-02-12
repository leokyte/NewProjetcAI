import React, { useState, useEffect } from 'react'
import { Modal, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import KyteButton from '@kyteapp/kyte-ui-components/src/packages/buttons/kyte-button/KyteButton'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import KyteIcon from '@kyteapp/kyte-ui-components/src/packages/icons/KyteIcon/KyteIcon'
import I18n from '../../../../../i18n/i18n'
import { Input } from '../../../../common/Input'
import { DetailPage } from '../../../../common/scaffolding/DetailPage'
import ConsentModal from '../../../../common/modals/ConsentModal'
import { VariationFormOption } from '../../../../../stores/variants/actions/variation-form.actions'

const Strings = {
	t_title_add: I18n.t('variantsList.addOption'),
	t_title_edit: I18n.t('words.s.edit'),
	t_placeholder: I18n.t('label.optionName'),
	t_save_btn: I18n.t('descriptionSaveButton'),
	t_validation_required: I18n.t('variantsWizard.optionNameRequired'),
	t_delete_option_title: I18n.t('action.deleteOption'),
	t_delete_option_description: I18n.t('info.optionDeactivationNotice'),
	t_delete_option_btn_consent: I18n.t('confirmationAction.actionIrreversible'),
	t_delete_option_btn_confirm: I18n.t('action.confirmDeletion'),
	t_delete_option_btn_cancel: I18n.t('alertDismiss'),
}

interface VariationOptionModalSharedProps {
	visible: boolean
	onClose: () => void
	isNewVariation: boolean
	editingOption: VariationFormOption | null
	options: VariationFormOption[]
	addOption: (option: VariationFormOption) => void
	updateOption: (optionId: string, updatedOption: Partial<VariationFormOption>) => void
	deleteOption: (optionId: string, optionTitle: string) => void
}

export const VariationOptionModalShared: React.FC<VariationOptionModalSharedProps> = ({
	visible,
	onClose,
	isNewVariation,
	editingOption,
	options,
	addOption,
	updateOption,
	deleteOption,
}) => {
	const [optionName, setOptionName] = useState('')
	const [error, setError] = useState('')
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	const isEditing = !!editingOption
	const isLastOption = options.length === 1 && isEditing
	const pageTitle = isEditing ? Strings.t_title_edit : Strings.t_title_add

	useEffect(() => {
		if (visible) {
			setOptionName(editingOption?.title || '')
			setError('')
		}
	}, [visible, editingOption])

	const handleInputChange = (text: string) => {
		setOptionName(text)

		const trimmedText = text.trim()
		if (trimmedText) {
			const existingOption = options.find((option) => {
				const isDifferentOption = isEditing ? option.id !== editingOption?.id : true
				const isOptionTitleDifferent = option.title.toLowerCase().trim() === trimmedText.toLowerCase()

				return isDifferentOption && isOptionTitleDifferent
			})

			setError(existingOption ? I18n.t('variantsWizard.optionAlreadyExist', { optionName: trimmedText }) : '')
			return
		}

		setError('')
	}

	const handleDelete = () => {
		if (editingOption) {
			deleteOption(editingOption.id as string, editingOption.title)
			setShowDeleteModal(false)
			onClose()
		}
	}

	const handleSave = () => {
		const trimmedName = optionName.trim()

		if (!trimmedName) {
			setError(Strings.t_validation_required)
			return
		}

		if (isEditing && editingOption) {
			updateOption(editingOption.id as string, { title: trimmedName })
		} else {
			const newOption = {
				id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				title: trimmedName,
				active: true,
			}

			addOption(newOption)
		}

		onClose()
	}

	const isValid = optionName.trim().length > 0 && !error

	return (
		<>
			<Modal visible={visible} animationType="fade" onRequestClose={onClose}>
				<SafeAreaView style={{ flex: 1 }}>
					<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
						<DetailPage
							goBack={onClose}
							pageTitle={pageTitle}
							rightComponent={
								!isLastOption && isNewVariation && isEditing ? (
									<TouchableOpacity onPress={() => setShowDeleteModal(true)} style={{ marginRight: 16 }}>
										<KyteIcon name="trash" size={24} color={colors.gray02Kyte} />
									</TouchableOpacity>
								) : null
							}
						>
							{/* Content */}
							<Container flex={1} backgroundColor={colors.white} justifyContent="center" alignItems="center">
								<Container width={'100%'} maxWidth={400} backgroundColor={colors.white} borderRadius={12} padding={24}>
									<Input
										value={optionName}
										placeholder={Strings.t_placeholder}
										onChangeText={handleInputChange}
										returnKeyType="done"
										maxLength={64}
										autoFocus
										error={error}
										onSubmitEditing={isValid ? handleSave : undefined}
									/>
								</Container>
							</Container>

							{/* Save Button */}
							<Padding all={16}>
								<KyteButton type={isValid ? 'primary' : 'tertiary'} onPress={handleSave} disabledButton={!isValid}>
									{Strings.t_save_btn}
								</KyteButton>
							</Padding>

							{/* Delete Confirmation Modal */}
							<ConsentModal
								onCancel={() => setShowDeleteModal(false)}
								onConfirm={handleDelete}
								texts={{
									title: Strings.t_delete_option_title,
									description: Strings.t_delete_option_description,
									btnConsent: Strings.t_delete_option_btn_consent,
									btnConfirm: Strings.t_delete_option_btn_confirm,
									btnCancel: Strings.t_delete_option_btn_cancel,
								}}
								isVisible={showDeleteModal}
							/>
						</DetailPage>
					</KeyboardAvoidingView>
				</SafeAreaView>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
})
