import React, { useState } from 'react'
import { connect } from 'react-redux'
import { getFormValues, getFormSyncErrors } from 'redux-form'
import _ from 'lodash'
import { View, Keyboard } from 'react-native'
import StoreForm from '../store/StoreForm'
import { DetailPage, CustomKeyboardAvoidingView, ActionButton, LoadingCleanScreen } from '../../common'
import { storeAccountSave } from '../../../stores/actions'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'

const Strings = {
	PAGE_TITLE: I18n.t('configMenus.storeInfo'),
}

const CatalogStore = ({
	form,
	formSyncErrors,
	storeAccount,
	navigation,
	imageSet,
	storeAccountSave,
}) => {
	const [isLoadingForm, setIsLoadingForm] = useState(false)
	const saveForm = () => {
		const { catalog, ...storeForm } = form // destructuring here to prevent any errors related to catalog configuration

		setIsLoadingForm(true)
		Keyboard.dismiss()

		const store = {
			...storeAccount,
			...storeForm,
			phone: form.phone ? `+${form.phone.replace('+', '')}` : null,
			image: imageSet,
		}
		
		storeAccountSave(store, () => {
			setIsLoadingForm(false)
			logEvent('Store Data Config Save')
			navigation.popToTop()
		})
	}

	const checkSyncErrors = () => {
		// Checks for errors just in this form's fields
		const errors = Object.keys(formSyncErrors).filter((key) => key === 'name' || key === 'phone')

		return Boolean(errors.length)
	}

	const renderSaveButton = () => (
		<View style={{ paddingVertical: 15 }}>
			<ActionButton
				onPress={saveForm}
				disabled={checkSyncErrors()}
				alertTitle={I18n.t('words.s.attention')}
				alertDescription={I18n.t('enterAllfields')}
			>
				{I18n.t('descriptionSaveButton')}
			</ActionButton>
		</View>
	)

	return (
		<DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()}>
			<CustomKeyboardAvoidingView style={{ flex: 1 }}>
				<StoreForm hideFooterReceipt navigation={navigation} />
				{renderSaveButton()}
			</CustomKeyboardAvoidingView>
			{isLoadingForm ? <LoadingCleanScreen /> : null}
		</DetailPage>
	)
}

export default connect(
	(state) => ({
		form: getFormValues('ConfigStoreForm')(state),
		formSyncErrors: getFormSyncErrors('ConfigStoreForm')(state),
		storeAccount: state.auth.store,
		imageSet: state.auth.store.imageSet,
		isLoading: state.common.loader.visible,
	}),
	{ storeAccountSave }
)(CatalogStore)
