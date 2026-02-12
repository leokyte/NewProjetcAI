import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native'
import { KytePro, isFree } from '@kyteapp/kyte-ui-components'
import {
	DetailPage,
	SwitchContainer2,
	ActionButton,
	KyteText,
	KyteIcon,
	InputToTextArea,
	UnsaveChangesAlert,
	LoadingCleanScreen,
} from '../../common'
import { StoreFormModal } from '../store/modal'
import ShippingFeesTipModal from './ShippingFeesTipModal'
import I18n from '../../../i18n/i18n'
import { isEqual, generateTestID, showOfflineAlert, generateDefaultPROFeatures, getPROFeature } from '../../../util'
import { colors } from '../../../styles'
import {
	set_form,
	reset_form,
	storeAccountSave,
	checkFeatureIsAllowed,
	openModalWebview,
} from '../../../stores/actions'
import { ShippingFeesBetaTipImage } from '../../../../assets/images/shipping-fees/beta-tip-image'
import { ActiveOneDeliveryMethod } from '../../../../assets/images'
import NeedDeliveryMethodModal from '../../common/modals/NeedDeliveryMethodModal'

const Strings = {
	PAGE_TITLE: I18n.t('ShippingFees.NewPageTitle'),
	WORK_WITH_DELIVERY: I18n.t('catalogWorksWithDelivery'),
	WORK_WITH_DELIVERY_TEXT: I18n.t('catalogWorksWithDeliveryText'),
	SAVE: I18n.t('alertSave'),
	DESCRIPTION: I18n.t('productDescriptionLabel'),
	DESCRIPTION_TIP: I18n.t('ShippingFees.GeneralDescriptionTip'),
	ADD_FEE: I18n.t('ShippingFees.AddShippingFee'),
	ACTIVE: I18n.t('ShippingFees.active'),
	INACTIVE: I18n.t('ShippingFees.inactive'),

	UNSAVE_CHANGES_TITLE: I18n.t('unsavedChangesTitle'),
	UNSAVE_CHANGES_DESCRIPTION: I18n.t('unsavedChangesDescription'),
	ALERT_DISCARD: I18n.t('alertDiscard'),
	ALERT_SAVE: I18n.t('alertSave'),

	MODAL_TIP_TITLE: I18n.t('ShippingFees.PageTitle'),
	MODAL_TIP_INFO: I18n.t('ShippingFees.TipModalInfo'),

	MODAL_BETA_TITLE: I18n.t('ShippingFees.ModalActiveBetaTitle'),
	MODAL_BETA_TEXT: I18n.t('ShippingFees.ModalActiveBetaText'),
	MODAL_BETA_SECOND_TEXT: I18n.t('ShippingFees.ModalActiveBetaSecondText'),
	MODAL_BETA_BUTTON: I18n.t('ShippingFees.ModalActiveBetaButton'),
	MODAL_BETA_SECOND_BUTTON: I18n.t('ShippingFees.ModalActiveBetaSecondButton'),
}

const FORM_NAME = 'shippingFees'

const ShippingFees = ({ billing, ...props }) => {
	// Props
	const { navigation, form, accountStore, isOnline, openModalWebview } = props
	const [PRODeliveryRates, setPRODeliveryRates] = useState(generateDefaultPROFeatures('PROOnlineOrders'))
	const [isLoading, setIsLoading] = useState(false)

	const SHIPPING_FEES_DEFAULT = {
		active: false,
		description: '',
		fees: [],
	}

	// States

	useEffect(() => {
		props.set_form(FORM_NAME, accountStore.shippingFees || SHIPPING_FEES_DEFAULT)
		return () => props.reset_form(FORM_NAME)
	}, [])

	const [showDescriptionTextarea, setShowDescriptionTextarea] = useState(false)
	const [showTipModal, setShowTipModal] = useState(false)
	const [showUnsaveChangesAlert, setShowUnsaveChangesAlert] = useState(false)
	const [showNeedActiveOneDeliveryMethodModal, setShowNeedActiveOneDeliveryMethodModal] = useState(false)

	const { onlineOrdersAllowed, allowLocalPickUp } = accountStore.catalog || {};

	// Funcs
	const goBack = () => navigation.goBack()

	const checkEnableSave = () => !isEqual(accountStore.shippingFees, form)

	const tryGoBack = () => {
		if (checkEnableSave() && onlineOrdersAllowed) return setShowUnsaveChangesAlert(true)
		return goBack()
	}

	const editForm = (payload) => props.set_form(FORM_NAME, { ...form, ...payload })

	const goToFeeEdit = (i) => navigation.navigate({ name: 'ShippingFeeEdit', key: 'ShippingFeeEditPage', params: { i } })

	const saveStore = () => {
		setIsLoading(true)
		if (!isOnline) {
			setIsLoading(false)
			return showOfflineAlert()
		}
		const store =  { ...accountStore, shippingFees: form }
		props.storeAccountSave(store, () => {
			goBack()
			setIsLoading(false)
		})
	}

	const unsaveChangesAlertClick = (save) => {
		setShowUnsaveChangesAlert(false)

		if (save) return saveStore()
		return goBack()
	}

	//
	// RENDER section
	//

	const renderUnsaveChangesAlert = () => 
		 (
			<UnsaveChangesAlert
				discardAction={() => unsaveChangesAlertClick(false)}
				saveAction={() => unsaveChangesAlertClick(true)}
			/>
		)
	
	const renderShowNeedActiveOneDeliveryMethodModal = () => {
		const strings = {
			t_first_button: I18n.t('alertOk'),
			t_title: `${I18n.t('words.s.attention')}:`,
			t_subtitle: I18n.t('needActiveOneDeliveryMethod.subtitle'),
		}
		
		const hideModal = () => setShowNeedActiveOneDeliveryMethodModal(!showNeedActiveOneDeliveryMethodModal)
		return (
			<NeedDeliveryMethodModal
				strings={strings}
				hideModal={hideModal}
				onPressFirstButton={hideModal}
				isVisible={showNeedActiveOneDeliveryMethodModal}
				imageURI={ActiveOneDeliveryMethod}
			/>
		)
	} 
	

	const rightButtons = [
		{
			icon: 'help',
			onPress: () => setShowTipModal(true),
			testProps: generateTestID('help-do'),
		},
	]

	const renderDeliverySwitch = () => {
		const onPressSwitch = () => {
			if(!form.active === false && onlineOrdersAllowed && !allowLocalPickUp){
				setShowNeedActiveOneDeliveryMethodModal(!showNeedActiveOneDeliveryMethodModal)
			} else {
				editForm({ active: !form.active })
			}
		}
		
		return (
			<View>
				<SwitchContainer2
					title={Strings.WORK_WITH_DELIVERY}
					description={Strings.WORK_WITH_DELIVERY_TEXT}
					onPressAction={onPressSwitch}
					value={form.active}
					testProps={generateTestID('switch-do')}
				/>
			</View>
		)
	}

	const renderSaveButton = () => (
		<View style={styles.saveButtonContainer}>
			<ActionButton
				onPress={saveStore}
				disabled={!checkEnableSave()}
				noDisabledAlert
				testProps={generateTestID('save-do')}
			>
				{Strings.SAVE}
			</ActionButton>
		</View>
	)

	const renderDescriptionSection = () => (
		<View style={styles.descriptionSectionContainer} onPress={() => setShowDescriptionTextarea(true)}>
			<InputToTextArea
				value={form.description}
				placeholder={Strings.DESCRIPTION}
				onFocus={() => setShowDescriptionTextarea(true)}
				testProps={generateTestID('desc-do')}
			/>
			<View style={styles.descriptionTip}>
				<KyteText size={13} pallete="grayBlue">
					{Strings.DESCRIPTION_TIP}
				</KyteText>
			</View>
		</View>
	)

	const renderAllowedSections = () => (
		<View>
			{renderDescriptionSection()}
			{renderFeesSection()}
		</View>
	)

	const renderDescriptionTextarea = () => {
		const closeAction = () => setShowDescriptionTextarea(false)
		return (
			<StoreFormModal
				modalInfo={{ title: Strings.DESCRIPTION, maxLength: 250 }}
				trueValue={form.description}
				onChangeText={(description) => editForm({ description })}
				closeAction={closeAction}
				buttonAction={closeAction}
				testID="description-delivery"
			/>
		)
	}

	const renderAddFeeButton = () => (
		<TouchableOpacity style={styles.section} onPress={() => goToFeeEdit(null)} {...generateTestID('add-do')}>
			<KyteText pallete="actionColor" weight="SemiBold" size={15}>
				{Strings.ADD_FEE}
			</KyteText>
			<KyteIcon name="plus-thin" color={colors.actionColor} size={22} />
		</TouchableOpacity>
	)

	const renderShippingFeeOption = (fee, i) => (
		<TouchableOpacity style={styles.section} key={i} onPress={() => goToFeeEdit(i)}>
			<View style={styles.feeOptionNameContainer}>
				<KyteText pallete="primaryDarker" size={15} weight="SemiBold">
					{fee.name}
				</KyteText>
			</View>
			<View style={styles.feeOptionStatusContainer}>
				<KyteText size={13} uppercase weight="Medium" pallete={fee.active ? 'actionColor' : 'disabledIcon'}>
					{fee.active ? Strings.ACTIVE : Strings.INACTIVE}
				</KyteText>
			</View>
			<View>
				<KyteIcon name="arrow-cart" size={10} color={colors.primaryDarker} />
			</View>
		</TouchableOpacity>
	)

	const renderFeesSection = () => {
		const innerFeature = PRODeliveryRates?.innerFeatures?.find((p) => p.name === 'OnlineOrders_DeliveryRates')
		const planLimit = innerFeature?.plans?.find((p) => p.plan === 'free').limit

		return (
			<View>
				{isFree(billing) && form.fees.length < planLimit ? (
					renderAddFeeButton()
				) : (
					<KytePro
						billing={billing}
						feature={PRODeliveryRates}
						component={() => renderAddFeeButton()}
						onPressFree={() => openModalWebview(innerFeature.infoURL)}
						position={60}
					/>
				)}
				<View {...generateTestID('delivery-list-do')}>{form.fees.map(renderShippingFeeOption)}</View>
			</View>
		)
	}

	const renderTipModal = () => {
		const info = `${Strings.MODAL_TIP_INFO.pt1}\n\n${Strings.MODAL_TIP_INFO.pt2}`;

		return (
			<ShippingFeesTipModal
				info={info}
				imageWidth={120}
				imageHeightProportion={0.9}
				title={Strings.MODAL_TIP_TITLE}
				image={ShippingFeesBetaTipImage}
				hideModal={() => setShowTipModal(false)}
			/>
		)
	}

	const getPROFeatures = async () => {
		const deliveryRate = await getPROFeature('PROOnlineOrders')
		setPRODeliveryRates(deliveryRate)
	}

	useEffect(() => {
		getPROFeatures()
	}, [])

	if (!form) return null
	return (
		<DetailPage
			goBack={tryGoBack}
			pageTitle={Strings.PAGE_TITLE}
			rightButtons={rightButtons}
			goBackTestProps={generateTestID('back-do')}
		>
			<ScrollView>
				{renderDeliverySwitch()}
				{form.active ? renderAllowedSections() : null}
			</ScrollView>
			{renderSaveButton()}
			{showDescriptionTextarea ? renderDescriptionTextarea() : null}
			{showTipModal && renderTipModal()}
			{showUnsaveChangesAlert ? renderUnsaveChangesAlert() : null}
			{isLoading && <LoadingCleanScreen />}
			{showNeedActiveOneDeliveryMethodModal && renderShowNeedActiveOneDeliveryMethodModal()}
		</DetailPage>
	)
}

const styles = StyleSheet.create({
	saveButtonContainer: {
		paddingVertical: 10,
	},
	descriptionSectionContainer: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderlight,
	},
	inputContainer: (hasDescription) => ({
		marginVertical: 5,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: hasDescription ? colors.primaryBg : colors.borderlight,
	}),
	descriptionTip: {
		marginTop: 10,
	},
	section: {
		paddingHorizontal: 15,
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderlight,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	feeOptionNameContainer: {
		flex: 1,
	},
	feeOptionStatusContainer: {
		marginLeft: 5,
		marginRight: 20,
	},
	textStyle: {
		size: 16,
		lineHeight: 25,
		weight: 400
	}
})

const mapStateToProps = ({ _form, auth, common, billing }) => ({
	form: _form[FORM_NAME],
	accountStore: auth.store,
	isOnline: common.isOnline,
	billing,
})

export default connect(mapStateToProps, {
	set_form,
	reset_form,
	storeAccountSave,
	checkFeatureIsAllowed,
	openModalWebview,
})(ShippingFees)

export { FORM_NAME }
