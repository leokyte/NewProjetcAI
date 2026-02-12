import React, { useCallback, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import I18n from '../../../../../i18n/i18n'
import { LoadingCleanScreen } from '../../../../common'
import { DetailPage } from '../../../../common/scaffolding/DetailPage'
import KyteNotifications from '../../../../common/KyteNotifications'
import { VariationOptionModalShared } from '../shared/VariationOptionModalShared'
import { VariationNameModalShared } from '../shared/VariationNameModalShared'
import ConsentModal from '../../../../common/modals/ConsentModal'
import { VariationEditProvider, useVariationEdit } from './VariationEditContext'
import { VariationNameSection, VariationOptionsSection, VariationSaveButton } from '../shared/VariationFormShared'
import { UnsavedChangesModal } from '../../../../common/modals/UnsavedChangesModal'
import { useVariationSave } from './useVariationSave'

const Strings = {
	t_title: I18n.t('variants.editVariation'),
	t_variation_name: I18n.t('variantsWizard.variantName'),
	t_save_btn: I18n.t('descriptionSaveButton'),
	t_options: I18n.t('words.p.option'),
	t_add_option: I18n.t('variantsList.addOption'),
	t_delete_variation_title: I18n.t('action.confirmDelete'),
	t_delete_variation_description: I18n.t('info.variationDeactivationNotice'),
	t_delete_variation_btn_consent: I18n.t('confirmationAction.actionIrreversible'),
	t_delete_variation_btn_confirm: I18n.t('action.confirmDeletion'),
	t_delete_variation_btn_cancel: I18n.t('alertDismiss'),
}

const VariationEditPageInner: React.FC = () => {
	const navigation = useNavigation()
	const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState<boolean>(false)
	const [isUnsavedChangesModalVisible, setIsUnsavedChangesModalVisible] = React.useState<boolean>(false)

	const editContext = useVariationEdit()
	const {
		// State
		variationId,
		variationName,
		options,
		isLoading,
		notifications,
		canSave,
		editingOption,
		isOptionModalVisible,
		isNameModalVisible,
		hasOptionsChanges,
		originalOptions,
		variationAid,

		// Actions
		setOptions,
		clearNotifications,
		addOption,
		updateOption,
		deleteOption,
		setVariationName,
		addNotification,
		setLoading,

		// Modal actions
		openOptionModal,
		closeOptionModal,
		openNameModal,
		closeNameModal,

		// Form submission
		saveVariation,
		updateVariationOptionsForm,
		refreshVariationData,

		// Helpers
		ensureOptionsHaveId,
		checkVariationNameExists,
	} = editContext

	// Custom hook for save logic
	const { handleSave } = useVariationSave({
		hasOptionsChanges,
		variationAid,
		variationId,
		originalOptions,
		options,
		setOptions,
		setLoading,
		addNotification,
		clearNotifications,
		saveVariation,
		updateVariationOptionsForm,
		refreshVariationData,
	})

	const handleOrderChange = useCallback(
		(hasChanges: boolean, updatedVariations: any[]) => {
			if (hasChanges) {
				const optionsWithId = ensureOptionsHaveId(updatedVariations)
				setOptions(optionsWithId)
			}
		},
		[setOptions, ensureOptionsHaveId]
	)

	const handleDeleteVariation = useCallback(() => {
		setIsDeleteModalVisible(false)
		navigation.goBack()
	}, [navigation])

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

	// TODO: Add right icon (keep this for now)
	// const renderRightIcon = () => {
	//   return (
	//     <TouchableOpacity
	//       onPress={() => setIsDeleteModalVisible(true)}
	//       style={{ padding: 8, paddingRight: 16 }}
	//     >
	//       <KyteIcon name="trash" size={24} color={colors.gray02Kyte} />
	//     </TouchableOpacity>
	//   )
	// }

	useEffect(() => {
		return () => {
			setIsUnsavedChangesModalVisible(false)
		}
	}, [])

	return (
		<DetailPage
			pageTitle={Strings.t_title}
			goBack={handleGoBack}
			// rightComponent={renderRightIcon()}
		>
			{isLoading && <LoadingCleanScreen />}

			<Container flex={1} backgroundColor={colors.gray10} position="relative">
				<KyteNotifications notifications={notifications} />

				{/* Variation Name Section */}
				<VariationNameSection
					variationName={variationName}
					placeholder={Strings.t_variation_name}
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
					optionsLabel={Strings.t_options}
					addOptionLabel={Strings.t_add_option}
				/>

				{/* Save Button */}
				<VariationSaveButton
					canSave={canSave}
					isLoading={isLoading}
					onPress={handleSave}
					buttonText={Strings.t_save_btn}
					loadingText="Saving..."
				/>
			</Container>

			{/* Option Modal */}
			<VariationOptionModalShared
				visible={isOptionModalVisible}
				onClose={closeOptionModal}
				editingOption={editingOption}
				options={options}
				addOption={addOption}
				updateOption={updateOption}
				deleteOption={deleteOption}
				isNewVariation={false}
			/>

			{/* Name Modal */}
			<VariationNameModalShared
				visible={isNameModalVisible}
				onClose={closeNameModal}
				variationName={variationName}
				setVariationName={setVariationName}
				checkVariationNameExists={checkVariationNameExists}
				variationId={variationId}
			/>

			{/* Delete Variation Modal */}
			<ConsentModal
				onCancel={() => setIsDeleteModalVisible(false)}
				onConfirm={handleDeleteVariation}
				texts={{
					title: Strings.t_delete_variation_title,
					description: Strings.t_delete_variation_description,
					btnConsent: Strings.t_delete_variation_btn_consent,
					btnConfirm: Strings.t_delete_variation_btn_confirm,
					btnCancel: Strings.t_delete_variation_btn_cancel,
				}}
				isVisible={isDeleteModalVisible}
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

const VariationEditPage: React.FC = () => {
	return (
		<VariationEditProvider>
			<VariationEditPageInner />
		</VariationEditProvider>
	)
}

export default VariationEditPage
