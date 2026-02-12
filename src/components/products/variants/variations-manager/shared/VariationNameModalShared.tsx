import React, { useState, useEffect } from 'react'
import { Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import KyteButton from '@kyteapp/kyte-ui-components/src/packages/buttons/kyte-button/KyteButton'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import I18n from '../../../../../i18n/i18n'
import { Input } from '../../../../common/Input'
import { DetailPage } from '../../../../common/scaffolding/DetailPage'

const Strings = {
	t_title: I18n.t('variantsWizard.variantName'),
	t_placeholder: I18n.t('form.placeholder.enterVariationName'),
	t_save_btn: I18n.t('descriptionSaveButton'),
	t_validation_required: I18n.t('form.placeholder.enterVariationName'),
}

interface VariationNameModalSharedProps {
	visible: boolean
	onClose: () => void
	variationName: string
	setVariationName: (name: string) => void
	checkVariationNameExists: (name: string, excludeCurrentId?: string) => boolean
	variationId?: string
}

export const VariationNameModalShared: React.FC<VariationNameModalSharedProps> = ({
	visible,
	onClose,
	variationName,
	setVariationName,
	checkVariationNameExists,
	variationId,
}) => {
	const [nameInput, setNameInput] = useState('')
	const [error, setError] = useState('')

	useEffect(() => {
		if (visible) {
			setNameInput(variationName || '')
			setError('')
		}
	}, [visible, variationName])

	const setErrorWithVariationName = (variationName: string) => {
		setError(I18n.t('error.variationAlreadyExistsWithName', { variationName: `"${variationName}"` }))
	}

	const handleInputChange = (text: string) => {
		setNameInput(text)
		setError('')

		const trimmedName = text.trim()
		if (
			trimmedName &&
			trimmedName !== variationName &&
			checkVariationNameExists &&
			checkVariationNameExists(trimmedName, variationId)
		) {
			setErrorWithVariationName(trimmedName)
		}
	}

	const isValid = nameInput.trim().length > 0 && !error

	const handleSave = () => {
		const trimmedName = nameInput.trim()

		if (!trimmedName) {
			setError(Strings.t_validation_required)
			return
		}

		if (
			trimmedName !== variationName &&
			checkVariationNameExists &&
			checkVariationNameExists(trimmedName, variationId)
		) {
			setErrorWithVariationName(trimmedName)
			return
		}

		setVariationName(trimmedName)
		onClose()
	}

	return (
		<Modal visible={visible} animationType="fade" onRequestClose={onClose}>
			<SafeAreaView style={{ flex: 1 }}>
				<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
					<DetailPage goBack={onClose} pageTitle={Strings.t_title}>
						{/* Content */}
						<Container flex={1} backgroundColor={colors.white} justifyContent="center" alignItems="center">
							<Container width={'100%'} maxWidth={400} backgroundColor={colors.white} borderRadius={12} padding={24}>
								<Input
									value={nameInput}
									placeholder={Strings.t_placeholder}
									onChangeText={handleInputChange}
									returnKeyType="done"
									maxLength={100}
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
					</DetailPage>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</Modal>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
})
