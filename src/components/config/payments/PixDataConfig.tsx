import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Container, colors, Margin, KyteText, InputStatusColors } from '@kyteapp/kyte-ui-components'
import { pixDataConfigSave, storeAccountSave } from '../../../stores/actions'
import {
	ActionButton,
	DetailPage,
	Input,
	KyteDropdown,
	LoadingCleanScreen,
	PhoneInput,
	SwitchContainer2,
	AlertActionModal,
	CustomKeyboardAvoidingView,
} from '../../common'
import I18n from '../../../i18n/i18n'
import { isBetaCatalog, IStore } from '@kyteapp/kyte-utils'
import { InjectedFormProps } from 'redux-form'
import { Platform } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { NavigationProp, useFocusEffect } from '@react-navigation/native'
import { Controller, useForm } from 'react-hook-form'
import { maskValues, NEW_CATALOG_VERSION, PIX_TYPES, sanitizeText, validateFormValues } from '../../../util'
import KyteNotifications from '../../common/KyteNotifications'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import InstitutionalCarousel from './InstitutionalCarousel'
import { logEvent } from '../../../integrations'
import AdminProtectionRoute from '../AdminProtectionRoute'
import NeedConfigureCatalogModal from '../../common/modals/NeedConfigureCatalogModal'
import { NeedCatalogModal } from '../../../../assets/images'
import ActivateCatalogBetaModal from '../../common/modals/ActivateCatalogBetaModal'
import { CustomColorModal } from '../../../../assets/images/catalog/custom-color-modal'

const InstitutionalCarouselIgnoredType: any = InstitutionalCarousel
const PhoneInputIgnoredType: any = PhoneInput
const ActiveButtonIgnoredType: any = ActionButton
const KyteNotificationsIgnoredType: any = KyteNotifications
const AdminProtectionRouteIgnoredType: any = AdminProtectionRoute

const Strings = {
	PAGE_TITLE: I18n.t('pixDataConfig.title'),
	ENABLE_PIX_TITLE: I18n.t('pixDataConfig.enabledPixTitle'),
	ENABLE_PIX_SUB: I18n.t('pixDataConfig.enabledPixSub'),
	PIX_CONFIG_TITLE: I18n.t('pixDataConfig.pixConfigTitle'),
	PIX_TYPE_PLACEHOLDER: I18n.t('pixDataConfig.pixTypePlaceholder'),
	PIX_KEY_PLACEHOLDER: I18n.t('pixDataConfig.pixKeyPlaceholder'),
	PIX_ACCOUNT_PLACEHOLDER: I18n.t('pixDataConfig.pixAccountPlaceholder'),
	ACCOUNT_INFO_TEXT: I18n.t('pixDataConfig.accountNameInfoText'),
	CONTACT_TITLE: I18n.t('pixDataConfig.contactTitle'),
	KEY_CPF: I18n.t('customerCpfPlaceholder'),
	KEY_EMAIL: I18n.t('emailPlaceholder'),
	KEY_RANDOM: I18n.t('pixDataConfig.keyRandom'),
	KEY_PHONE: I18n.t('customerPhonePlaceholder'),
	KEY_ERROR: I18n.t('pixDataConfig.pixKeyError'),
	FORM_GENERAL_ERROR: I18n.t('pixDataConfig.formGeneralError'),
	CONTACT_PLACEHOLDER: I18n.t('storeInfoWhatsappPlaceholder'),
	CONTACT_INFO_TEXT: I18n.t('pixDataConfig.contactInfoText'),
	ALERT_TITLE: I18n.t('pixDataConfig.alertConfirmModalTtitle'),
	ALERT_BUTTON: I18n.t('pixDataConfig.alertConfirmModalButton'),
	ALERT_SUB: I18n.t('pixDataConfig.alertConfirmModalText'),
	API_ERROR: I18n.t('apiErrorTryAgain'),
	BUTTON_SAVE: I18n.t('alertSave'),
}
interface PixDataConfigProps {
	navigation: NavigationProp<any>
	isLoading: boolean
	store: IStore
	pixDataConfigSave: (data: any, callback: (cb: string) => void) => void
	storeAccountSave: (data: any, callback: (cb?: string) => void) => void
}

type Props = PixDataConfigProps & InjectedFormProps<PixDataConfigProps>

const PixDataConfig: React.FC<Props> = ({ navigation, isLoading, pixDataConfigSave, storeAccountSave, store }) => {
	const pix = store?.pix || {}
	const { key, accountName, contact, enabled } = pix
	const {
		control,
		handleSubmit,
		formState: { errors, isDirty },
		watch,
	} = useForm({
		defaultValues: {
			pixKey: key?.value ? maskValues({ value: key?.value, pixType: key?.type }) : '',
			accountName: accountName || '',
			contact: contact?.whatsApp || store.whatsapp || '',
			enabledPix: enabled ?? true,
		},
	})
	const [hiddenInstitutionalCarousel, setHiddenInstitutionalCarousel] = useState(!!store?.pixSetup)
	const [pixType, setPixType] = useState(key?.type || '')
	const [checkedIndex, setCheckedIndex] = useState(2)
	const [showAlert, setShowAlert] = useState(false)
	const [contactFocus, setContactFocus] = useState(false)
	const [pixTypeError, setPixTypeError] = useState(false)
	const [showNeedCatalogModal, setShowNeedCatalogModal] = useState(false)
	const [showActiveBetaModal, setShowActiveBetaModal] = useState(false)
	const [toast, setToast] = useState<any>(null)
	const toasTimer = 3000
	const removeToast = () => setToast(null)
	const defaultToastProps = { handleClose: removeToast, onAutoDismiss: removeToast }
	const enabledPix = watch('enabledPix')
	const hasRequiredError =
		errors?.pixKey?.type === 'required' || errors?.accountName?.type === 'required' || pixTypeError
	const hasRequiredErrorContact = errors?.contact?.type === 'required'

	const typeOptions = [
		{
			value: PIX_TYPES.RANDOM,
			labelText: Strings.KEY_RANDOM,
			title: Strings.KEY_RANDOM,
			onPress: () => setPixType(PIX_TYPES.RANDOM),
		},
		{
			value: PIX_TYPES.DOCUMENT_ID,
			labelText: Strings.KEY_CPF,
			title: Strings.KEY_CPF,
			onPress: () => setPixType(PIX_TYPES.DOCUMENT_ID),
		},
		{
			value: PIX_TYPES.EMAIL,
			labelText: Strings.KEY_EMAIL,
			title: Strings.KEY_EMAIL,
			onPress: () => setPixType(PIX_TYPES.EMAIL),
		},
		{
			value: PIX_TYPES.PHONE,
			labelText: Strings.KEY_PHONE,
			title: Strings.KEY_PHONE,
			onPress: () => setPixType(PIX_TYPES.PHONE),
		},
	]

	const handleSave = ({
		data,
		isOpenModal = false,
	}: {
		data: {
			accountName: string
			contact: string
			pixKey: string
			enabledPix: boolean
		}
		isOpenModal?: boolean
	}) => {
		if (!pixType) {
			setPixTypeError(true)
			return
		}

		const { accountName, contact, pixKey, enabledPix } = data

		if (isOpenModal && enabledPix) {
			setShowAlert(true)
			logEvent('Pix QR Code Warning View')
			return
		}

		setShowAlert(false)
		const isDocumentOrPhoneKey = pixType === PIX_TYPES.DOCUMENT_ID || pixType === PIX_TYPES.PHONE

		pixDataConfigSave(
			{
				enabled: enabledPix,
				type: pixType,
				value: isDocumentOrPhoneKey ? sanitizeText(pixKey) : pixKey,
				accountName: accountName,
				contactNumber: contact,
				aid: store.aid,
			},
			(error) => {
				if (error) {
					setToast({
						...defaultToastProps,
						timer: toasTimer,
						title: Strings.API_ERROR,
						type: NotificationType.ERROR,
					})
					logEvent('Pix QR Code Config Error', { error: error })
					return
				}

				if (enabledPix) {
					logEvent('Pix QR Code Enable')
				} else {
					logEvent('Pix QR Code Disable')
				}
				navigation.goBack()
			}
		)
	}

	const handleConfirmModal = () => {
		const storeToSave = { ...store, catalog: { ...store.catalog, version: NEW_CATALOG_VERSION } }
		storeAccountSave(storeToSave, () => {
			logEvent('Catalog Version Change', { where: 'pix_config', catalog_version: NEW_CATALOG_VERSION })
			setShowActiveBetaModal(false)
		})
	}

	useEffect(() => {
		const findCheckedIndex = typeOptions.findIndex(({ value }) => value === pixType)
		setCheckedIndex(findCheckedIndex)
	}, [pixType])

	useEffect(() => {
		if (hiddenInstitutionalCarousel) logEvent('Pix QR Code Config View')
	}, [hiddenInstitutionalCarousel])

	useFocusEffect(
		useCallback(() => {
			const hasCatalog = Boolean(store?.catalog)

			if (!hasCatalog) {
				setShowNeedCatalogModal(true)
				setHiddenInstitutionalCarousel(true)
			}
		}, [store?.catalog])
	)

	useFocusEffect(
		useCallback(() => {
			const isBetaActive = isBetaCatalog(store?.catalog?.version)

			if (!isBetaActive) {
				setShowActiveBetaModal(true)
				setHiddenInstitutionalCarousel(true)
			}
		}, [store?.catalog])
	)

	return (
		<DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()}>
			<AdminProtectionRouteIgnoredType initialRouteName="CurrentSale">
				{hiddenInstitutionalCarousel ? (
					<ScrollView style={{ flex: 1, backgroundColor: colors.gray10 }}>
						<CustomKeyboardAvoidingView
							keyboardVerticalOffset={contactFocus ? 110 : 10}
							behavior={Platform.OS === 'ios' ? 'position' : null}
						>
							<Container backgroundColor={colors.white}>
								<Controller
									control={control}
									name="enabledPix"
									render={({ field: { onChange, value } }) => (
										<SwitchContainer2
											title={Strings.ENABLE_PIX_TITLE}
											description={Strings.ENABLE_PIX_SUB}
											disabled={false}
											value={value}
											onPressAction={onChange}
										/>
									)}
								/>
							</Container>
							{enabledPix && (
								<Container>
									<Margin bottom={16} />
									<Container padding={16} backgroundColor={colors.white}>
										<KyteText size={14} weight={500} color={colors.gray02Kyte}>
											{Strings.PIX_CONFIG_TITLE}
										</KyteText>
										{hasRequiredError && (
											<KyteText lineHeight={16.5} size={11} color={colors.red}>
												{Strings.FORM_GENERAL_ERROR}
											</KyteText>
										)}

										<Margin bottom={16} />
										<Container marginBottom={8} borderBottomWidth={1} borderColor={InputStatusColors.disabled}>
											<KyteDropdown
												placeholder={Strings.PIX_TYPE_PLACEHOLDER}
												checkedIndex={checkedIndex}
												mainViewProps={{ style: { justifyContent: 'space-between' } }}
												shouldHideLeftIcon
												options={typeOptions}
											/>
										</Container>
										{!!pixType && (
											<Controller
												control={control}
												rules={{
													validate: (value) => validateFormValues({ value, pixType }),
													required: true,
												}}
												name="pixKey"
												render={({ field: { onChange, value } }) => (
													<Input
														placeholder={Strings.PIX_KEY_PLACEHOLDER}
														placeholderColor={colors.gray05}
														value={maskValues({ value, pixType })}
														onChangeText={onChange}
														error={errors.pixKey?.type === 'validate' ? Strings.KEY_ERROR : ''}
													/>
												)}
											/>
										)}
										<Container position="relative">
											<Controller
												control={control}
												name="accountName"
												rules={{
													required: true,
												}}
												render={({ field: { onChange, value } }) => (
													<Input
														placeholder={Strings.PIX_ACCOUNT_PLACEHOLDER}
														placeholderColor={colors.gray05}
														maxLength={50}
														value={value}
														onChangeText={onChange}
													/>
												)}
											/>
											<KyteText marginTop={-6} size={11} color={colors.gray04} lineHeight={16.5}>
												{Strings.ACCOUNT_INFO_TEXT}
											</KyteText>
										</Container>
									</Container>

									<Margin bottom={16} />
									<Container padding={16} backgroundColor={colors.white}>
										<KyteText size={14} weight={500} color={colors.gray02Kyte}>
											{Strings.CONTACT_TITLE}
										</KyteText>
										{hasRequiredErrorContact && (
											<KyteText lineHeight={16.5} size={11} color={colors.red}>
												{Strings.FORM_GENERAL_ERROR}
											</KyteText>
										)}
										<Margin bottom={16} />
										<Controller
											control={control}
											name="contact"
											rules={{
												required: true,
											}}
											render={({ field: { onChange, value } }) => (
												<PhoneInputIgnoredType
													isWhatsApp
													value={value}
													onChangeText={onChange}
													placeholder={Strings.CONTACT_PLACEHOLDER}
													infoText={Strings.CONTACT_INFO_TEXT}
													onFocus={() => setContactFocus(true)}
													onBlur={() => setContactFocus(false)}
												/>
											)}
										/>
									</Container>
								</Container>
							)}
						</CustomKeyboardAvoidingView>
					</ScrollView>
				) : (
					<InstitutionalCarouselIgnoredType handleHidden={(hidden: boolean) => setHiddenInstitutionalCarousel(hidden)} />
				)}
				{!!toast && (
					<Container>
						<KyteNotificationsIgnoredType notifications={[toast]} />
					</Container>
				)}
				{hiddenInstitutionalCarousel && (
					<Container
						borderColor={colors.gray07}
						borderTopWidth={1}
						paddingTop={16}
						paddingBottom={16}
						backgroundColor={colors.white}
					>
						<ActiveButtonIgnoredType
							noDisabledAlert
							onPress={handleSubmit((data) => handleSave({ data, isOpenModal: true }))}
						>
							{Strings.BUTTON_SAVE}
						</ActiveButtonIgnoredType>
					</Container>
				)}

				<AlertActionModal
					hideAlertIcon
					isVisible={showAlert}
					strings={{
						title: Strings.ALERT_TITLE,
						button: Strings.ALERT_BUTTON,
						subtitle: Strings.ALERT_SUB,
					}}
					onPress={handleSubmit((data) => handleSave({ data }))}
					setHideModal={() => setShowAlert(false)}
				/>
			</AdminProtectionRouteIgnoredType>
			{isLoading ? <LoadingCleanScreen /> : null}
			<NeedConfigureCatalogModal
				imgStyles={{ width: 210, height: 210 }}
				image={NeedCatalogModal}
				isVisible={showNeedCatalogModal}
				hideModal={() => {
					navigation.navigate('Dashboard')
					setShowNeedCatalogModal(false)
				}}
				subtitle="pixDataConfig.needCatalogModalSubtitle"
			/>

			<ActivateCatalogBetaModal
				isVisible={showActiveBetaModal} 
				image={CustomColorModal}
				imgStyles={{ width: 145, height: 145 }}
				subtitle="pixDataConfig.needCatalogModalSubtitle"
				onPress={() => handleConfirmModal()}
				hideModal={() => setShowActiveBetaModal(false)}
				onCloseModal={() => {
					setShowActiveBetaModal(false)
					navigation.navigate('Dashboard')
				}}
			/>
		</DetailPage>
	)
}

const mapStateToProps = (state: any) => ({
	store: state.auth.store,
	isLoading: state.common.loader.visible,
})

const mapDispatchToProps = (dispatch: any) => ({
	...bindActionCreators(
		{
			pixDataConfigSave,
			storeAccountSave
		},
		dispatch
	),
})

export default connect(mapStateToProps, mapDispatchToProps)(PixDataConfig as any)
