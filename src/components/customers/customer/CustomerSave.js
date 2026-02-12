import React, { Component } from 'react'
import {
	View,
	Keyboard,
	TouchableOpacity,
	ScrollView,
	Platform,
	Text,
	Dimensions,
	Alert,
	Linking,
	BackHandler,
} from 'react-native'
import { connect } from 'react-redux'
import { Field, getFormValues, reduxForm, isDirty, change } from 'redux-form'
import { Icon } from 'react-native-elements'
import formatCpf from '@brazilian-utils/format-cpf'
import formatCnpj from '@brazilian-utils/format-cnpj'
import * as RNLocalize from 'react-native-localize'

import { KyteSwitch } from '@kyteapp/kyte-ui-components'
import { scaffolding, colors, Type, colorSet, gridStyles } from '../../../styles'
import {
	ActionButton,
	CustomKeyboardAvoidingView,
	Input,
	DetailPage,
	KyteIcon,
	KyteModal,
	ListOptions,
	SwitchContainer,
	InputTextArea,
	KyteImageModal,
	KyteAddressSearch,
	PhoneInput,
} from '../../common'
import {
	convertOnlyToNumber,
	validateCpfOrCpnj,
	autocompleteAddress,
	moveToKyteFolder,
	insertContactInContactsList,
	checkUserPermission,
	cropImage,
	openDeviceCamera,
	openDevicePhotoLibrary,
	requestPermission,
	generateTestID,
} from '../../../util'
import { CONTACTS, DetailOrigin } from '../../../enums'
import I18n from '../../../i18n/i18n'
import {
	customerCreateBySale,
	customersFetch,
	customerSave,
	customerRemove,
	customerManageNewBalance,
	customerFetchById,
	salesLengthByCustomer,
} from '../../../stores/actions'
import CustomerImage from '../image/CustomerImage'
import { logEvent } from '../../../integrations'
import CustomerPayLaterDeniedAlert from '../../current-sale/payments/alerts/CustomerPayLaterDeniedAlert'

const Strings = {
	ALLOW_PAY_LATTER_LABEL: I18n.t('customerAccount.allowPayLater'),
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

class CustomerComponent extends Component {
	constructor(props) {
		super(props)

		this.state = {
			isAddressModalVisible: false,
			isExtraFieldsVisible:
				props.initialValues &&
				(props.initialValues.email ||
					props.initialValues.phone ||
					props.initialValues.documentNumber ||
					props.initialValues.observation),
			isImageModalVisible: false,
			isObservationModalVisible: false,
			isMapsSelectorVisible: false,
			isPhotoZoom: false,
			saveButtonBlock: false,

			customerPhoto: props.initialValues && props.initialValues.image ? props.initialValues.image : null,
			forceLocalPhoto: false,
			insertInContacts: false,

			documentType: 'cpf',
			showCustomerPayLaterDeniedAlert: false,
		}

		this.phoneMask = '+999999999999999'
		this.renderMaskedField = this.renderMaskedField.bind(this)
	}

	UNSAFE_componentWillMount() {
		this.BackHandlerListener = BackHandler.addEventListener('hardwareBackPress', this.backPressEvent.bind(this))
	}

	componentDidMount() {
		const { origin } = this.props

		if (origin === DetailOrigin.CREATE) logEvent('New Customer View')
	}

	componentWillUnmount() {
		this.BackHandlerListener.remove()
		clearTimeout(this.timer)
	}

	backPressEvent() {
		const { goBack } = this.props.navigation
		const { dirty } = this.props
		if (dirty) {
			Alert.alert(I18n.t('unsavedChangesTitle'), I18n.t('unsavedChangesDescription'), [
				{ text: I18n.t('alertDiscard'), onPress: () => goBack() },
				{ text: I18n.t('alertSave'), onPress: null },
			])
			return false
		}
		return true
	}


	formSubmit({ name, celPhone, address, addressComplement, email, phone, documentNumber, observation, allowPayLater }) {
		// Avoid double click save
		const { saveButtonBlock } = this.state
		if (!saveButtonBlock) this.setState({ saveButtonBlock: true })
		else return

		const locales = RNLocalize.getLocales()
		const isPtBR = locales[0].languageTag === 'pt-BR'

		const phoneRaw = phone ? convertOnlyToNumber(phone) : null
		const celPhoneRaw = celPhone ? convertOnlyToNumber(celPhone) : null
		const documentNumberRaw =
			documentNumber && isPtBR ? convertOnlyToNumber(documentNumber).toString() : documentNumber || null
		const image = this.state.customerPhoto
		let customer = {
			name,
			celPhone: celPhoneRaw,
			phone: phoneRaw,
			address,
			addressComplement,
			email,
			documentNumber: documentNumberRaw,
			observation,
			image,
			allowPayLater,
		}

		if (this.props.origin !== DetailOrigin.BY_SALE) {
			if (this.props.origin === DetailOrigin.UPDATE) {
				customer = { ...customer, id: this.props.initialValues.id }
			}
			this.saveCustomer(customer, phone, celPhone)
		} else {
			this.createCustomerBySale(customer, phone, celPhone)
		}
	}

	saveCustomer(customer, phone, celPhone) {
		const { insertInContacts } = this.state
		this.props.customerSave(customer, () => {
			if (insertInContacts) {
				const agendaCustomer = { ...customer, phone, celPhone }
				insertContactInContactsList(agendaCustomer)
			}

			this.trackCustomerSave(customer)
			this.props.navigation.goBack()
			this.props.customersFetch()
			Keyboard.dismiss()
		})
	}

	goToCustomerBalance(customer) {
		const { navigate } = this.props.navigation
		const { totalNet } = this.props.currentSale

		this.props.customerFetchById(customer.id)
		this.props.customerManageNewBalance('remove', totalNet)

		navigate({
			key: 'CustomerAccountBalancePage',
			name: 'CustomerSaleAccountBalance',
			params: { useSplit: false },
		})
	}

	createCustomerBySale(customer, phone, celPhone) {
		const { insertInContacts } = this.state
		const { customerCreateBySale, customersFetch, navigation, route } = this.props
		const { navigate } = navigation
		const { params = {} } = route
		const { payLaterOrigin } = params

		customerCreateBySale(customer, (savedCustomer) => {
			if (insertInContacts) {
				const agendaCustomer = { ...customer, phone, celPhone }
				insertContactInContactsList(agendaCustomer)
			}
			this.trackCustomerSave(customer)
			Keyboard.dismiss()

			if (payLaterOrigin && savedCustomer.allowPayLater) {
				return this.goToCustomerBalance(savedCustomer)
			}
			if (payLaterOrigin && !savedCustomer.allowPayLater) {
				return navigate({
					key: 'AllowPayLaterPage',
					name: 'AllowPayLater',
					params: { customer: savedCustomer },
				})
			}
			customersFetch()
			navigation.pop(2)
		})
	}

	trackCustomerSave(customer) {
		const propertiesTrack = {
			origin: this.props.origin === 2 ? 'Sale Flow' : this.props.origin === 'Menu',
			hasEmail: !!customer.email,
			hasPhone: !!customer.phone,
		}

		if (!customer.id) {
			logEvent('Customer Create', { ...propertiesTrack, userEmail: this.props.user.email })
		} else {
			logEvent('Customer Save', { ...propertiesTrack, userEmail: this.props.user.email })
		}
	}

	renderField(field) {
		return (
			<Input
				{...field.input}
				onChangeText={field.input.onChange}
				placeholder={field.placeholder}
				keyboardType={field.kind}
				style={field.style}
				placeholderColor={field.placeholderColor}
				maxLength={field.maxLength}
				error={field.meta.touched ? field.meta.error : ''}
				autoCapitalize={field.autoCapitalize}
				returnKeyType="done"
				autoFocus={field.autoFocus}
				rightIcon={field.rightIcon}
				rightIconStyle={field.rightIconStyle}
				displayIosBorder={field.displayIosBorder}
				hideLabel={field.hideLabel}
				noBorder={field.noBorder}
				normalize={field.normalize}
				autoCorrect={field.autoCorrect}
				onSubmitEditing={field.onSubmitEditing}
				testProps={generateTestID(String(field.id))}
			/>
		)
	}

	renderMaskedField(field) {
		const { placeholder, input } = field
		const { value, onChange } = input
		const valueToUse = value.replace(/-/g, '')

		return (
			<PhoneInput
				{...field.input}
				value={valueToUse}
				placeholder={placeholder}
				onChangeText={onChange}
			/>
		)
	}

	renderTextareaField(field) {
		return (
			<InputTextArea
				{...field.input}
				style={field.style}
				onChangeText={field.input.onChange}
				value={field.input.value}
				placeholder={field.placeholder}
				placeholderColor={field.placeholderColor}
				autoFocus={field.autoFocus}
				multiline={field.multiline}
				textAlignVertical={field.textAlignVertical}
				noBorder={field.noBorder}
				hideLabel={field.hideLabel}
				shrinkSection={field.shrinkSection}
				flex={field.flex}
				autoCorrect={field.autoCorrect}
			/>
		)
	}

	renderTopSection() {
		const { isImageModalVisible, customerPhoto } = this.state
		const { topContainer, photoButton, actionIcon, actionContainer, removeButton } = styles
		const { formValues, initialValues } = this.props

		const extractFileName = (path) => {
			const pathSplitted = path.split('/')
			return pathSplitted.length ? pathSplitted[pathSplitted.length - 1] : ''
		}

		const photoResponse = async (response) => {
			try {
				const imageResponse = await cropImage(response.path)
				this.setState({ isImageModalVisible: false })

				const getPath = () => {
					const path = imageResponse.path || imageResponse
					return Platform.OS === 'ios' ? path : path.split('file://')[1]
				}

				const source = {
					fileName: extractFileName(getPath()),
					path: getPath(),
					uri: getPath(),
				}

				const setPhoto = (fileName) => {
					this.setState({
						customerPhoto: Platform.OS === 'ios' ? source.uri : fileName,
						forceLocalPhoto: true,
					})
				}

				if (imageResponse.didCancel || imageResponse.error) {
					return
				}

				moveToKyteFolder(source.fileName, source.path, setPhoto)
			} catch (err) {
				console.log(err)
			}
		}

		const getPhotoFromGallery = () => openDevicePhotoLibrary(photoResponse)

		const getPhotoFromCamera = () => openDeviceCamera(photoResponse)

		const renderTopSectionModal = () => {
			const options = [
				{
					title: I18n.t('productTakePicture'),
					onPress: () => getPhotoFromCamera(),
					leftIcon: { icon: 'square-camera', color: colors.secondaryBg },
				},
				{
					title: I18n.t('productBrowseImage'),
					onPress: () => getPhotoFromGallery(),
					leftIcon: { icon: 'square-gallery', color: colors.secondaryBg },
				},
			]

			return (
				<KyteModal
					bottomPage
					height="auto"
					title={I18n.t('productAddNewImage')}
					isModalVisible={isImageModalVisible}
					hideModal={() => this.setState({ isImageModalVisible: false })}
				>
					<View>
						<ListOptions items={options} />
					</View>
				</KyteModal>
			)
		}

		const renderCustomerPhoto = () => {
			if (customerPhoto) {
				return <CustomerImage customer={{ ...initialValues, image: customerPhoto }} style={gridStyles.flexImage} />
			}

			return <KyteIcon name="gallery" size={22} color={colors.primaryBg} />
		}

		const iconAction = (type) => {
			const { isOnline } = this.props
			// eslint-disable-next-line default-case
			switch (type) {
				case 'whatsapp':
					const celPhone = initialValues && initialValues.celPhone ? initialValues.celPhone : formValues.celPhone
					const whatsApp = `+${celPhone.replace(' ', '').replace('+', '')}`
					Linking.openURL(`https://wa.me/${whatsApp}`)
					logEvent('Customer WhatsApp Open')
					break
				case 'phone':
					const phone = initialValues && initialValues.phone ? initialValues.phone : formValues.phone
					Linking.openURL(`tel://${phone}`)
					logEvent('Customer Phone Open')
					break
				case 'mail':
					const email = initialValues && initialValues.email ? initialValues.email : formValues.email
					if (!isOnline) {
						Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('customersOfflineWarningContent'))
						return
					}
					Linking.openURL(`mailto:${email}`)
					logEvent('Customer Email Open')
					break
				case 'pin':
					if (!isOnline) {
						Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('customersOfflineWarningContent'))
						return
					}

					this.setState({ isMapsSelectorVisible: true })
					break
			}
		}

		const renderActionIcons = () => {
			const renderIcon = (name) => <KyteIcon name={name} size={30} color={colors.secondaryBg} />
			const renderWhatsApp = () => (
				<TouchableOpacity style={actionIcon} activeOpacity={0.8} onPress={() => iconAction('whatsapp')}>
					{renderIcon('whatsapp-filled')}
				</TouchableOpacity>
			)
			const renderPhone = () => (
				<TouchableOpacity style={actionIcon} activeOpacity={0.8} onPress={() => iconAction('phone')}>
					{renderIcon('phone')}
				</TouchableOpacity>
			)
			const renderEmail = () => (
				<TouchableOpacity style={actionIcon} activeOpacity={0.8} onPress={() => iconAction('mail')}>
					{renderIcon('mail')}
				</TouchableOpacity>
			)
			const renderPin = () => (
				<TouchableOpacity style={actionIcon} activeOpacity={0.8} onPress={() => iconAction('pin')}>
					{renderIcon('pin-filled')}
				</TouchableOpacity>
			)
			return (
				<View style={actionContainer}>
					{(formValues && formValues.celPhone) || (initialValues && initialValues.celPhone) ? renderWhatsApp() : null}
					{(formValues && formValues.phone) || (initialValues && initialValues.phone) ? renderPhone() : null}
					{(formValues && formValues.email) || (initialValues && initialValues.email) ? renderEmail() : null}
					{(formValues && formValues.address) || (initialValues && initialValues.address) ? renderPin() : null}
				</View>
			)
		}

		const renderRemoveButton = () => (
				<TouchableOpacity activeOpacity={0.8} onPress={() => photoAction()} style={removeButton}>
					<KyteIcon name="cross-thin" size={10} color="#FFFFFF" />
				</TouchableOpacity>
			)

		const photoAction = () => {
			if (customerPhoto) {
				this.setState({ customerPhoto: null, isPhotoZoom: false })
				return
			}

			this.setState({ isImageModalVisible: true })
		}

		return (
			<View style={topContainer}>
				<View style={{ flex: 1, alignItems: 'center' }}>
					<TouchableOpacity
						activeOpacity={0.8}
						style={[photoButton, { flex: 1 }]}
						onPress={customerPhoto ? () => this.setState({ isPhotoZoom: true }) : () => photoAction()}
					>
						{renderCustomerPhoto()}
					</TouchableOpacity>
					{customerPhoto ? renderRemoveButton() : null}
				</View>
				{formValues || initialValues ? renderActionIcons() : null}
				{renderTopSectionModal()}
			</View>
		)
	}

	renderMandatoryFields() {
		const { mandatoryContainer } = styles
		const { formValues, initialValues } = this.props

		const renderAddressComplement = () => (
				<Field
					placeholder={I18n.t('customerAddressComplementPlaceholder')}
					placeholderColor={colors.primaryGrey}
					style={Platform.select({ ios: { borderBottomColor: colors.primaryGrey, borderBottomWidth: 1, height: 32 } })}
					name="addressComplement"
					autoCapitalize="words"
					component={this.renderField}
					id='complete-address'
					
				/>
			)

		return (
			<View style={mandatoryContainer}>
				<Field
					placeholder={I18n.t('customerNamePlaceholder')}
					placeholderColor={colors.primaryGrey}
					style={Platform.select({ ios: { borderBottomColor: colors.primaryGrey, borderBottomWidth: 1, height: 32 } })}
					name="name"
					autoCapitalize="words"
					component={this.renderField}
				/>
				<Field
					placeholder={I18n.t('customerCelPhonePlaceholder')}
					placeholderColor={colors.primaryGrey}
					style={Platform.select({ ios: { borderBottomColor: colors.primaryGrey, borderBottomWidth: 1, height: 32 } })}
					name="celPhone"
					kind="phone-pad"
					type="custom"
					autoCapitalize="none"
					component={this.renderMaskedField}
				/>
				<TouchableOpacity
					activeOpacity={0.8}
					onPress={() => {
						let address = ''
						if ((!!formValues && formValues.address) || (!!initialValues && !!initialValues.address)) {
							address = formValues.address || initialValues.address
							this.props.change('addressModal', address)
							this.onChangeAddressText(address)
						}

						this.setState({ isAddressModalVisible: true })
					}}
				>
					<View pointerEvents="none">
						<Field
							placeholder={I18n.t('customerAddressPlaceholder')}
							placeholderColor={colors.primaryGrey}
							name="address"
							component={this.renderField}
							rightIcon={<Icon name="chevron-right" color={colors.secondaryBg} size={28} />}
							rightIconStyle={{ position: 'absolute', right: -5 }}
							style={Platform.select({ ios: { height: 32 } })}
						/>
					</View>
				</TouchableOpacity>
				{(!!formValues && formValues.address) || (!!initialValues && initialValues.address)
					? renderAddressComplement()
					: null}
			</View>
		)
	}

	renderExtraFields() {
		const { extraContainer } = styles
		const { formValues } = this.props
		const { isExtraFieldsVisible, insertInContacts, documentType } = this.state
		const locales = RNLocalize.getLocales()
		const isPtBR = locales[0].languageTag === 'pt-BR'

		const insertInContactsAction = async () => {
			if (formValues && formValues.name && (formValues.celPhone || formValues.phone)) {
				const hasPermission = await requestPermission(CONTACTS)
				hasPermission && this.setState({ insertInContacts: !insertInContacts })
			}
		}

		const renderSwitch = () => (
				<SwitchContainer
					title={I18n.t('customerInsertInContacts')}
					onPress={() => this.setState({ insertInContacts: !insertInContacts })}
					style={{ paddingHorizontal: 0, borderBottomWidth: 0 }}
					titleStyle={[Type.fontSize(13), Type.Medium, colorSet(colors.secondaryBg)]}
				>
					<KyteSwitch
						onValueChange={(value) => insertInContactsAction(value)}
						active={insertInContacts}
					/>
				</SwitchContainer>
			)

		const renderFields = () => (
				<View>
					<Field
						placeholder={I18n.t('customerEmailPlaceholder')}
						placeholderColor={colors.primaryGrey}
						style={Platform.select({ ios: { borderBottomColor: colors.primaryGrey, borderBottomWidth: 1, height: 32 } })}
						name="email"
						kind="email-address"
						autoCapitalize="none"
						component={this.renderField}
					/>
					<Field
						placeholder={I18n.t('customerPhonePlaceholder')}
						placeholderColor={colors.primaryGrey}
						style={Platform.select({ ios: { borderBottomColor: colors.primaryGrey, borderBottomWidth: 1, height: 32 } })}
						name="phone"
						inputId="phone"
						kind="phone-pad"
						type="custom"
						component={this.renderMaskedField}
					/>
					<Field
						placeholder={I18n.t('customerCpfPlaceholder')}
						placeholderColor={colors.primaryGrey}
						style={Platform.select({ ios: { borderBottomColor: colors.primaryGrey, borderBottomWidth: 1, height: 32 } })}
						name="documentNumber"
						kind={isPtBR ? 'numeric' : null}
						type={isPtBR ? documentType : 'text'}
						component={this.renderField}
						normalize={
							!isPtBR
								? null
								: (value, previousValue) => {
										if ((!value && !previousValue) || (!value && previousValue.length === 1)) {
											return ''
										}

										const currentValue = value || previousValue
										return currentValue.length <= 14 ? formatCpf(currentValue) : formatCnpj(currentValue)
								  }
						}
					/>
					<TouchableOpacity activeOpacity={0.8} onPress={() => this.setState({ isObservationModalVisible: true })}>
						<View pointerEvents="none">
							<Field
								placeholder={I18n.t('customerObservationPlaceholder')}
								placeholderColor={colors.primaryGrey}
								name="observation"
								component={this.renderField}
								rightIcon={<Icon name="chevron-right" color={colors.secondaryBg} size={28} />}
								rightIconStyle={{ position: 'absolute', right: -5 }}
								style={Platform.select({ ios: { height: 32 } })}
								autoCorrect
							/>
						</View>
					</TouchableOpacity>
					{this.props.origin !== DetailOrigin.UPDATE ? renderSwitch() : null}
				</View>
			)

		const onPressTitle = () => {
			this.setState({ isExtraFieldsVisible: !isExtraFieldsVisible })
			this.timer = setTimeout(() => this.customerScrollView.scrollToEnd({ animated: true }), 100)
		}

		return (
			<View style={[extraContainer, isExtraFieldsVisible ? { paddingBottom: 30 } : {}]}>
				<TouchableOpacity
					style={{ justifyContent: 'center', flexDirection: 'row', paddingVertical: 20 }}
					onPress={() => onPressTitle()}
					activeOpacity={0.8}
				>
					<View style={{ flex: 1, alignItems: 'flex-start' }}>
						<Text style={[Type.Medium, Type.fontSize(17), colorSet(colors.secondaryBg)]}>
							{I18n.t('productLabelExtrasFields')}
						</Text>
					</View>

					<View style={{ flex: 1, alignItems: 'flex-end' }}>
						<KyteIcon
							name={isExtraFieldsVisible ? 'nav-arrow-up' : 'nav-arrow-down'}
							size={16}
							color={colors.primaryBg}
						/>
					</View>
				</TouchableOpacity>
				{isExtraFieldsVisible ? renderFields() : null}
			</View>
		)
	}

	renderPayLatterSwitch() {
		const { mandatoryContainer } = styles
		const { formValues, user } = this.props
		const allowPayLater = formValues && formValues.allowPayLater
		const { allowCustomerInDebt } = checkUserPermission(user.permissions)

		const switchPayLater = () => {
			if (!allowCustomerInDebt) return this.setState({ showCustomerPayLaterDeniedAlert: true })
			this.props.change('allowPayLater', !allowPayLater)
		}

		return (
			<View style={{ ...mandatoryContainer, marginTop: 20, paddingBottom: 0, paddingTop: 0 }}>
				<SwitchContainer
					title={Strings.ALLOW_PAY_LATTER_LABEL}
					onPress={() => switchPayLater()}
					style={{ paddingHorizontal: 0, borderBottomWidth: 0 }}
					titleStyle={[Type.fontSize(16), Type.SemiBold, colorSet(colors.secondaryBg)]}
				>
					<KyteSwitch
            onValueChange={() => switchPayLater()}
            active={allowPayLater}
          />
				</SwitchContainer>
			</View>
		)
	}

	onChangeAddressText(text) {
		const { placesAutoCompleteSessionToken } = this.state
		autocompleteAddress(text, placesAutoCompleteSessionToken)
			.then((result) => {
				const { predictions } = result.data
				if (predictions.length > 0) {
					const geocodeResult = predictions.map((eachPrediction) => {
						const result = eachPrediction.structured_formatting
						return { address: result.main_text, subtitle: result.secondary_text }
					})
					this.setState({ addressesFound: geocodeResult })
					return
				}
				this.setState({ addressesFound: [] })
			})
			.catch(() => {
				this.setState({ addressesFound: [] })
			})
	}

	renderAddressModal() {
		const { formValues } = this.props

		const saveAddress = (address, isEditing) => {
			this.props.change('address', address)
			if (!isEditing) {
				this.setState({ isAddressModalVisible: false })
			}
		}

		return (
			<KyteModal
				height="100%"
				fullPage
				fullPageTitle={I18n.t('customerAddressPlaceholder')}
				fullPageTitleIcon="back-navigation"
				hideFullPage={() => this.setState({ isAddressModalVisible: false })}
				isModalVisible
				backdropColor="#F7F7F8"
			>
				<KyteAddressSearch
					address={formValues ? formValues.address || '' : ''}
					saveAction={(address, isEditing) => saveAddress(address, isEditing)}
				/>
			</KyteModal>
		)
	}

	renderObservationModal() {
		const { bottomContainer } = scaffolding
		const { formValues } = this.props

		const rightButtons = [
			{
				title: I18n.t('words.s.clear'),
				onPress: () => this.props.change('observation', ''),
			},
		]

		return (
			<KyteModal
				height="100%"
				fullPage
				fullPageTitle={I18n.t('customerObservationPlaceholder')}
				fullPageTitleIcon="back-navigation"
				hideFullPage={() => this.setState({ isObservationModalVisible: false })}
				isModalVisible
				rightButtons={rightButtons}
			>
				<CustomKeyboardAvoidingView style={{ flex: 1 }}>
					<Field
						style={{ height: SCREEN_HEIGHT - 150 }}
						placeholder={I18n.t('customerObservationPlaceholder')}
						placeholderColor={colors.primaryGrey}
						name="observation"
						component={this.renderTextareaField}
						autoFocus
						multiline
						textAlignVertical="top"
						noBorder
						hideLabel
						flex
						autoCorrect
					/>
					<View style={[bottomContainer, Platform.select({ ios: { marginBottom: 5 } })]}>
						<ActionButton
							onPress={() => {
								this.props.change('observation', formValues.observation || '')
								this.setState({ isObservationModalVisible: false })
							}}
						>
							{I18n.t('productSaveButton')}
						</ActionButton>
					</View>
				</CustomKeyboardAvoidingView>
			</KyteModal>
		)
	}

	renderMapsSelector() {
		// const { address } = this.props.initialValues;
		const { address } = this.props.formValues
		const options = [
			{
				title: 'Google Maps',
				onPress: () => {
					this.setState({ isMapsSelectorVisible: false })
					logEvent('Customer Map Open', { option: 'Google Maps' })
					Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURI(address)}`)
				},
			},
			{
				title: 'Waze',
				onPress: () => {
					this.setState({ isMapsSelectorVisible: false })
					logEvent('Customer Map Open', { option: 'Waze' })
					Linking.openURL(`https://waze.com/ul?q=${encodeURI(address)}`)
				},
			},
		]

		return (
			<KyteModal
				title={I18n.t('customerMapsSelectorTitle')}
				bottomPage
				height="auto"
				isModalVisible
				hideModal={() => this.setState({ isMapsSelectorVisible: false })}
			>
				<ListOptions items={options} hideChevron />
			</KyteModal>
		)
	}

	renderActionButton() {
		const { customerPhoto } = this.state
		const { handleSubmit, formValues, dirty, origin, initialValues } = this.props
		const { bottomContainer } = scaffolding

		let disableButton = false
		if (origin === DetailOrigin.UPDATE && initialValues && customerPhoto !== initialValues.image) {
			disableButton = false
		} else if ((origin === DetailOrigin.UPDATE && !dirty) || (origin === DetailOrigin.CREATE && !formValues)) {
			disableButton = true
		}
		const alertDescription =
			origin === DetailOrigin.UPDATE && !dirty
				? I18n.t('customersFormNoChanges')
				: I18n.t('customerSaveAlertDescription')
		return (
			<View style={[bottomContainer, { backgroundColor: 'transparent' }]}>
				<ActionButton
					alertTitle={I18n.t('words.s.attention')}
					alertDescription={alertDescription}
					onPress={handleSubmit(this.formSubmit.bind(this))}
					disabled={disableButton}
				>
					{I18n.t('customerSaveButton')}
				</ActionButton>
			</View>
		)
	}

	renderPhotoZoom() {
		const { initialValues } = this.props
		const { customerPhoto, forceLocalPhoto } = this.state

		return (
			<KyteImageModal
				document={{ ...initialValues, image: customerPhoto }}
				isModalVisible
				hideOnBack
				hideModal={() => this.setState({ isPhotoZoom: false })}
				onBackButtonPress={() => this.setState({ isPhotoZoom: false })}
				useLocal={forceLocalPhoto}
			/>
		)
	}

	removeCustomer() {
		const { initialValues, navigation } = this.props
		if (!initialValues) return

		this.props.customerRemove(initialValues.id, () => {
			this.props.customersFetch()
			navigation.goBack()
		})
	}

	showAlert() {
		const { permissions } = this.props.user
		const { accountBalance, id } = this.props.initialValues
		const customerHasSales = salesLengthByCustomer(id)
		const isAdmin = permissions.isOwner || permissions.isAdmin
		const hasBalance = accountBalance !== 0 || customerHasSales

		// Denied to remove!
		if (!isAdmin && hasBalance) {
			Alert.alert(I18n.t('customerDeleteAlertTitle'), I18n.t('customerDeleteAlertDescriptionHasBalanceNotAdmin'), [
				{ text: I18n.t('alertOk') },
			])
		}
		// Allowed to remove!
		else {
			Alert.alert(
				I18n.t('customerDeleteAlertTitle'),
				hasBalance ? I18n.t('customerDeleteAlertDescriptionHasBalanceAdmin') : I18n.t('customerDeleteAlertDescription'),
				[
					{ text: I18n.t('alertDismiss'), style: 'cancel' },
					{ text: I18n.t('alertConfirm'), onPress: () => this.removeCustomer() },
				]
			)
		}
	}

	goBackAction() {
		const { goBack } = this.props.navigation
		const { dirty } = this.props

		if (dirty) {
			Alert.alert(I18n.t('unsavedChangesTitle'), I18n.t('unsavedChangesDescription'), [
				{ text: I18n.t('alertDiscard'), onPress: () => goBack() },
				{ text: I18n.t('alertSave'), onPress: null },
			])
			return
		}
		goBack()
	}

	showCustomerPayLaterDeniedAlert() {
		const hideModal = () => this.setState({ showCustomerPayLaterDeniedAlert: false })

		return (
			<CustomerPayLaterDeniedAlert
				customerName=""
				hideModal={() => hideModal()}
				text={I18n.t('customerAccount.customerPayLaterDenied')}
			/>
		)
	}

	render() {
		const { 
			origin, 
			account,
			hideHeader 
		} = this.props

		const {
			isAddressModalVisible,
			isObservationModalVisible,
			isMapsSelectorVisible,
			isPhotoZoom,
			showCustomerPayLaterDeniedAlert,
		} = this.state
		const { formContainer } = styles

		const isDetailOriginUpdate = Boolean(origin === DetailOrigin.UPDATE)

		const keyboardVerticalOffset = () => {
			if (origin === DetailOrigin.UPDATE) {
				return 0
			}
			if (SMALL_SCREENS) {
				return origin === DetailOrigin.BY_SALE ? 105 : 95
			}
			return origin === DetailOrigin.BY_SALE ? 105 : 95
		}
		
		const renderContent = () => (
			<View style={formContainer}>
				<CustomKeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={keyboardVerticalOffset()}>
					<ScrollView
						ref={(customerScrollView) => {
							this.customerScrollView = customerScrollView
						}}
					>
						{this.renderTopSection()}
						{this.renderMandatoryFields()}
						{this.renderExtraFields()}
						{account.allowPayLater ? this.renderPayLatterSwitch() : null}
					</ScrollView>
				</CustomKeyboardAvoidingView>
				{this.renderActionButton()}
				{isAddressModalVisible ? this.renderAddressModal() : null}
				{isObservationModalVisible ? this.renderObservationModal() : null}
				{isMapsSelectorVisible ? this.renderMapsSelector() : null}
				{isPhotoZoom ? this.renderPhotoZoom() : null}
				{showCustomerPayLaterDeniedAlert ? this.showCustomerPayLaterDeniedAlert() : null}
			</View>
		)
		const renderContentWithHeader = () => (
			<DetailPage
				pageTitle={I18n.t('customerSavePageTitle')}
				goBack={this.goBackAction.bind(this)}
				hideHeader={hideHeader}
				showCloseButton
			>
				{renderContent()}
			</DetailPage>
		)

		// This is to avoid nesting two KyteSafeAreaView, which causes excess padding.
		return isDetailOriginUpdate ? renderContent() : renderContentWithHeader()
	}
}

const styles = {
	formContainer: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#F7F7F8',
	},
	topContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 30,
	},
	mandatoryContainer: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 20,
		paddingTop: 15,
		paddingBottom: 30,
	},
	extraContainer: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 20,
		marginTop: 20,
	},
	photoButton: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#E8E9EA',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	addressesContainer: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 10,
		marginTop: 5,
	},
	iconClean: {
		marginLeft: 10,
		justifyContent: 'flex-end',
		alignItems: 'center',
		position: 'relative',
		top: 1,
	},
	actionContainer: {
		flex: 1,
		flexDirection: 'row',
		paddingTop: 20,
	},
	actionIcon: {
		// backgroundColor: colors.secondaryBg,
		width: 40,
		height: 40,
		borderRadius: 40,
		marginHorizontal: 15,
		alignItems: 'center',
		justifyContent: 'center',
	},
	removeButton: {
		width: 25,
		height: 25,
		borderRadius: 20,
		backgroundColor: colors.secondaryBg,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#F7F7F8',
		position: 'relative',
		bottom: 12,
	},
}

const validate = (values) => {
	const errors = {}

	if (!values.name) {
		errors.name = I18n.t('customerValidateName')
	}

	const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i
	if (values.email && !emailRegex.test(values.email)) {
		errors.email = I18n.t('customerValidateEmail')
	}

	const locales = RNLocalize.getLocales()
	const isPtBR = locales[0].languageTag === 'pt-BR'
	const cpfCnpjRegex =
		/([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})/g
	if (
		values.documentNumber &&
		isPtBR &&
		(!cpfCnpjRegex.test(values.documentNumber) || !validateCpfOrCpnj(values.documentNumber))
	) {
		errors.documentNumber = I18n.t('customerCpfCnpjError')
	}

	return errors
}

const CustomerSave = reduxForm({
	form: 'CustomerSave',
	validate,
})(CustomerComponent)

const mapStateToProps = (state) => {
	const { detail, detailOrigin } = state.customers
	const { user } = state.auth
	const { account } = state.preference
	return {
		formValues: getFormValues('CustomerSave')(state),
		initialValues: detail,
		origin: detailOrigin,
		user,
		account,
		dirty: isDirty('CustomerSave')(state),
		isOnline: state.common.isOnline,
		currentSale: state.currentSale,
	}
}

export default connect(mapStateToProps, {
	customerCreateBySale,
	customersFetch,
	customerSave,
	customerRemove,
	customerManageNewBalance,
	customerFetchById,
	change,
})(CustomerSave)
