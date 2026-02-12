import React, { useCallback, useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import I18n from '../../../../../i18n/i18n'
import { LoadingCleanScreen } from '../../../../common'
import { DetailPage } from '../../../../common/scaffolding/DetailPage'
import KyteNotifications from '../../../../common/KyteNotifications'
import { VariationOptionModalShared } from '../shared/VariationOptionModalShared'
import { VariationNameModalShared } from '../shared/VariationNameModalShared'
import { VariationCreateProvider, useVariationCreate } from './VariationCreateContext'
import { VariationNameSection, VariationOptionsSection, VariationSaveButton } from '../shared/VariationFormShared'
import { UnsavedChangesModal } from '../../../../common/modals/UnsavedChangesModal'

const Strings = {
	t_title: I18n.t('createNewVariant'),
	t_variation_name_label: I18n.t('variantsWizard.variantName'),
	t_options_label: I18n.t('words.p.option'),
	t_save_btn: I18n.t('createNewVariant'),
	t_add_option: I18n.t('variantsList.addOption'),
}

const VariationCreatePageInner: React.FC = () => {
	const navigation = useNavigation()
	const [isUnsavedChangesModalVisible, setIsUnsavedChangesModalVisible] = useState<boolean>(false)

	const {
		// State
		variationName,
		options,
		isLoading,
		notifications,
		canSave,
		editingOption,
		isOptionModalVisible,
		isNameModalVisible,
		isNewVariation,

		// Actions
		setOptions,
		addOption,
		updateOption,
		deleteOption,
		setVariationName,

		// Modal actions
		openOptionModal,
		closeOptionModal,
		openNameModal,
		closeNameModal,

		// Form submission
		saveVariation,

		// Helpers
		ensureOptionsHaveId,
		checkVariationNameExists,
	} = useVariationCreate()

	const handleOrderChange = useCallback(
		(hasChanges: boolean, updatedVariations: any[]) => {
			if (hasChanges) {
				const optionsWithId = ensureOptionsHaveId(updatedVariations)
				setOptions(optionsWithId)
			}
		},
		[setOptions, ensureOptionsHaveId]
	)

	const handleSave = useCallback(async () => {
		const result = await saveVariation()

		if (result.success) {
			navigation.navigate('VariationsManager')
		}
	}, [saveVariation, navigation, variationName, options, canSave, isLoading])

	const handleGoBack = useCallback(() => {
		if (canSave) {
			setIsUnsavedChangesModalVisible(true)
			return
		}
		navigation.goBack()
	}, [navigation, canSave])

	const handleUnsavedChangesDiscard = useCallback(() => {
		setIsUnsavedChangesModalVisible(false)
		navigation.goBack()
	}, [navigation])

	const handleUnsavedChangesCancel = useCallback(() => {
		setIsUnsavedChangesModalVisible(false)
	}, [])

	useEffect(() => {
		return () => {
			setIsUnsavedChangesModalVisible(false)
		}
	}, [])

	return (
		<DetailPage pageTitle={Strings.t_title} goBack={handleGoBack}>
			{isLoading && <LoadingCleanScreen />}

			<KyteNotifications notifications={notifications} />

			<Container flex={1} backgroundColor={colors.gray10}>
				{/* Variation Name Section */}
				<VariationNameSection
					variationName={variationName}
					placeholder={Strings.t_variation_name_label}
					onPress={() => {
						openNameModal()
					}}
				/>

				{/* Options Section */}
				<VariationOptionsSection
					options={options}
					onOrderChange={handleOrderChange}
					onOptionPress={openOptionModal}
					onAddOptionPress={() => openOptionModal()}
					optionsLabel={Strings.t_options_label}
					addOptionLabel={Strings.t_add_option}
				/>
			</Container>

			{/* Save Button */}
			<VariationSaveButton
				canSave={canSave}
				isLoading={isLoading}
				onPress={handleSave}
				buttonText={Strings.t_save_btn}
				loadingText="Creating..."
			/>

			{/* Option Modal */}
			<VariationOptionModalShared
				visible={isOptionModalVisible}
				onClose={closeOptionModal}
				editingOption={editingOption}
				options={options}
				addOption={addOption}
				updateOption={updateOption}
				deleteOption={deleteOption}
				isNewVariation={isNewVariation}
			/>

			{/* Name Modal */}
			<VariationNameModalShared
				visible={isNameModalVisible}
				onClose={closeNameModal}
				variationName={variationName}
				setVariationName={setVariationName}
				checkVariationNameExists={checkVariationNameExists}
			/>

			{/* Unsaved Changes Modal */}
			<UnsavedChangesModal
				isVisible={isUnsavedChangesModalVisible}
				onConfirm={handleSave}
				onCancel={handleUnsavedChangesCancel}
				onDiscard={handleUnsavedChangesDiscard}
			/>
		</DetailPage>
	)
}

const VariationCreatePage: React.FC = () => {
	return (
		<VariationCreateProvider>
			<VariationCreatePageInner />
		</VariationCreateProvider>
	)
}

export default VariationCreatePage
