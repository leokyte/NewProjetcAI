import {
	View,
	Text,
	Image,
	Keyboard,
	Platform,
	Dimensions,
	ScrollView,
	TouchableOpacity,
	Linking,
} from 'react-native'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Icon } from 'react-native-elements'
import { Field, reduxForm, getFormValues, change } from 'redux-form'
import _ from 'lodash'
import * as RNLocalize from 'react-native-localize'

import { KyteSwitch } from '@kyteapp/kyte-ui-components'
import {
	KyteIcon,
	KyteButton,
	Input,
	MaskedInput,
	SwitchContainer,
	KyteModal,
	KyteCountrySelector,
	KyteAddressSearch,
	KyteSafeAreaView,
	PhoneInput,
} from '../../common'
import {
	getImagePath,
	moveToKyteFolder,
	kyteCatalogDomain,
	openDevicePhotoLibrary,
	cropImage,
	extractFileName,
} from '../../../util'
import I18n from '../../../i18n/i18n'
import { scaffolding, colors, Type, colorSet } from '../../../styles'
import { storeImgSet, startLoading, stopLoading } from '../../../stores/actions'
import { StoreHelpModal, StoreFormModal } from './modal'
import { kyteAccountGetCountries } from '../../../services'
import { logEvent } from '../../../integrations'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568
const BIG_SCREENS = SCREEN_HEIGHT >= 736

class StoreForm extends Component {
	constructor(props) {
		super(props)
		const { initialValues } = props

		this.state = {
			shrinkSection: false,
			companyLogo: initialValues && initialValues.imageURL ? initialValues.imageURL : '',

			isReceiptVisible: false,
			isCatalogVisible: false,

			isFormModalVisible: false,
			isHelpModalVisible: false,
			isCountrySelectorVisible: false,
			isSearchCountryBarVisible: false,
			isAddressModalVisible: false,

			country: initialValues.country || RNLocalize.getCountry(),
			countries: [],

			modalType: 'header',
			hasNavigationFromModal: null,

			customerExtra: initialValues.customerExtra,
		}

		this.dialCode = '+99'
		this.willFocusListener = props.navigation.addListener('focus', (payload) => {
			const { hasNavigationFromModal } = this.state
			if (hasNavigationFromModal === 'formModal') {
				this.setState({ isFormModalVisible: true, hasNavigationFromModal: null })
			}
		})
	}

	UNSAFE_componentWillMount() {
		// const { companyLogo } = this.state;
		// this.props.storeImgSet(companyLogo);

		this.KeyboardShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this))
		this.KeyboardHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this))
	}

	componentDidMount() {
		// setting country name and country dial code
		this.props.startLoading()
		kyteAccountGetCountries(I18n.t('locale'))
			.then((countries) => {
				const filteredCountries = countries.data.filter((c) => c.dialCode)
				const orderedCountries = _.orderBy(filteredCountries, ['name'], ['asc'])
				const country = _.find(filteredCountries, (c) => c.code === this.state.country)

				if (country) {
					this.setState({ countries: orderedCountries, country })
					this.setCountry(country, 'keepDialCode')
				}

				this.props.stopLoading()
			})
			.catch(() => stopLoading())
	}

	componentWillUnmount() {
		this.KeyboardShowListener.remove()
		this.KeyboardHideListener.remove()
		clearTimeout(this.timer)
		this.willFocusListener()
	}

	getCompanyLogo() {
		openDevicePhotoLibrary((response) =>
			cropImage(response.path).then((imageResponse) => this.photoResponse(imageResponse.path, true))
		)
	}

	photoResponse(response) {
		const { formValues } = this.props
		const getPath = (response) => {
			const path = response.path || response
			return Platform.OS === 'ios' ? path : path.split('file://')[1]
		}

		const setPhoto = (fileName) => {
			const companyLogo = Platform.OS === 'ios' ? source.uri : fileName
			this.props.storeImgSet(formValues, fileName)
			this.setState({ companyLogo })
		}

		const source = {
			fileName: extractFileName(getPath(response)),
			path: getPath(response),
			uri: getPath(response),
		}

		if (response.didCancel || response.error) return
		logEvent('Logo Add', { where: 'store_settings' })
		moveToKyteFolder(source.fileName, source.path, setPhoto)
	}

	keyboardDidShow() {
		this.setState({ shrinkSection: true })
	}

	keyboardDidHide() {
		this.setState({ shrinkSection: false })
	}

	removeLogo() {
		const { formValues } = this.props
		this.props.storeImgSet(formValues, '')
		this.props.change('imageSet', null)
		this.setState({ companyLogo: '' })
	}

	saveModal(value) {
		const { modalType } = this.state
		switch (modalType) {
			case 'header':
				this.props.change('headerExtra', value)
				break
			case 'footer':
				this.props.change('footerExtra', value)
				break
			case 'catalog-extra':
				this.props.change('infoExtra', value)
				break
		}
		this.setState({ isFormModalVisible: false })
	}

	renderField(field) {
		return (
			<Input
				{...field.input}
				inputRef={field.inputRef}
				onChangeText={field.input.onChange}
				placeholder={field.placeholder}
				keyboardType={field.kind}
				style={field.style}
				placeholderColor={field.placeholderColor}
				maxLength={field.maxLength}
				autoCapitalize={field.autoCapitalize}
				error={field.meta.touched ? field.meta.error : ''}
				returnKeyType="done"
				value={field.input.value}
				autoFocus={field.autoFocus}
				multiline={field.multiline}
				textAlignVertical={field.textAlignVertical}
				rightIcon={field.rightIcon}
				rightIconStyle={field.rightIconStyle}
				onFocus={field.focusIn}
				focusAction={field.focusAction}
			/>
		)
	}

	renderMaskedField(field) {
		return (
			<MaskedInput
				{...field.input}
				onChangeText={field.input.onChange}
				placeholder={field.placeholder}
				keyboardType={field.kind}
				style={field.style}
				placeholderColor={field.placeholderColor}
				type={field.type}
				inputId={field.inputId}
				error={field.meta.touched ? field.meta.error : ''}
				returnKeyType="done"
				maxLength={field.maxLength}
				options={field.options}
			/>
		)
	}

	renderInsertLogo() {
		const { topContainer, textButtonStyle, alignContent } = styles

		return (
			<View style={topContainer}>
				<KyteButton style={alignContent} width={200} height={100} onPress={() => this.getCompanyLogo()}>
					<KyteIcon name="square-gallery" color={colors.primaryColor} size={26} />
					<Text style={textButtonStyle}>{I18n.t('storeInfoUploadImage')}</Text>
				</KyteButton>
			</View>
		)
	}

	renderLogo() {
		const { companyLogo } = this.state
		const { topContainer, logoStyle, logoContainer, iconContainer } = styles

		return (
			<View style={topContainer}>
				<View style={logoContainer}>
					<Image style={logoStyle} source={{ uri: getImagePath(companyLogo) }} />
				</View>
				<View style={iconContainer}>
					<KyteButton onPress={() => this.removeLogo()} width={40} height={40}>
						<Icon name="close" color={colors.primaryColor} />
					</KyteButton>
				</View>
			</View>
		)
	}

	renderTopSection() {
		const { companyLogo } = this.state
		return companyLogo ? this.renderLogo() : this.renderInsertLogo()
	}

	openCountrySelector() {
		this.setState({ isCountrySelectorVisible: true })
	}

	renderMandatoryFields() {
		const { fieldsContainer, field } = styles
		const { formValues = {}, initialValues } = this.props
		const phone = formValues?.phone?.replace(/-/g, '') || (formValues?.phone === '' ? '' : initialValues.phone);

		return (
			<View style={[fieldsContainer, { paddingTop: 20, paddingBottom: 30, backgroundColor: colors.drawerIcon }]}>
				<Field
					placeholder={I18n.t('storeAccountNamePlaceholder')}
					placeholderColor={colors.primaryGrey}
					name="name"
					component={this.renderField}
					style={field}
					maxLength={43}
				/>

				<PhoneInput
					isWhatsApp
					placeholder={I18n.t('storeInfoPhonePlaceholder')}
					value={phone}
					onChangeText={(phone) => this.props.change('phone', phone)}
				/>

				<TouchableOpacity
					activeOpacity={0.8}
					onPress={() => {
						// let address = '';
						// if (formValues && formValues.storeAddress || initialValues && initialValues.storeAddress) {
						//   address = formValues.storeAddress || initialValues.address;
						//   this.props.dispatch(change('ConfigStoreForm', 'addressModal', address));
						//   this.onChangeAddressText(address);
						// }
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

				<Field
					placeholder={I18n.t('customerAddressComplementPlaceholder')}
					placeholderColor={colors.primaryGrey}
					style={Platform.select({
						ios: { borderBottomColor: colors.primaryGrey, borderBottomWidth: 1, height: 32 },
					})}
					name="addressComplement"
					autoCapitalize="words"
					component={this.renderField}
				/>
			</View>
		)
	}

	modalInfo(type) {
		switch (type) {
			case 'header':
				return {
					title: I18n.t('storeReceiptModalHelpHeaderTitle'),
					maxLength: 160,
				}
			case 'footer':
				return {
					title: I18n.t('storeReceiptModalHelpFooterTitle'),
				}
			case 'catalog-extra':
				return {
					title: I18n.t('storeReceiptModalHelpExtraTitle'),
				}
			default:
				
		}
	}

	renderFormModal() {
		const { modalType } = this.state
		const { formValues } = this.props

		let modalValue
		switch (modalType) {
			case 'header':
				modalValue = formValues.headerExtra
				break
			case 'footer':
				modalValue = formValues.footerExtra
				break
			case 'catalog-extra':
				modalValue = formValues.infoExtra
				break
		}

		return (
			<StoreFormModal
				modalInfo={this.modalInfo(modalType)}
				closeAction={() => this.setState({ isFormModalVisible: false })}
				buttonAction={this.saveModal.bind(this)}
				value={modalValue}
				helpModal={(closeAction) => this.renderHelpModal(closeAction)}
				rightIcon={{ icon: 'help-filled', color: colors.grayBlue, iconSize: 18 }}
			/>
		)
	}

	renderHelpModal(closeAction) {
		const { modalType, companyLogo } = this.state
		const { navigation, formValues } = this.props
		const { name, phone, headerExtra, footerExtra, customerExtra } = formValues

		const navigateParams = {
			companyLogo,
			storeEditing: { name, phone, headerExtra, footerExtra, customerExtra },
			sale: {
				number: 1,
				status: 'closed',
				totalNet: 9.99,
				taxes: [],
				payments: [],
				items: [{ amount: '1', value: 9.99 }],
			},
		}

		const navigateAction = async () => {
			if (closeAction) {
				await closeAction()
				await this.setState({ isFormModalVisible: false, hasNavigationFromModal: 'formModal' })
			}

			if (modalType === 'catalog-extra' || modalType === 'instagram') {
				Linking.openURL(`https://${this.props.storeAccount.urlFriendly}${kyteCatalogDomain}`)
				return
			}
			navigation.navigate('ReceiptShareOptions', navigateParams)
		}

		return (
			<StoreHelpModal
				modalType={modalType}
				closeAction={closeAction || (() => this.setState({ isHelpModalVisible: false }))}
				buttonAction={closeAction || (() => this.setState({ isHelpModalVisible: false }))}
				navigateAction={() => navigateAction()}
			/>
		)
	}

	renderHelpButton(type) {
		const { helpIcon } = styles
		return (
			<KyteButton
				width={40}
				height={27}
				onPress={() => this.setState({ isHelpModalVisible: true, modalType: type })}
				style={helpIcon}
			>
				<KyteIcon name="help-filled" size={20} color={colors.grayBlue} />
			</KyteButton>
		)
	}

	renderReceiptForm() {
		const { isReceiptVisible, customerExtra } = this.state
		const { fieldsContainer, field } = styles
		const onPress = () => {
			this.setState({ isReceiptVisible: !isReceiptVisible })
			this.timer = setTimeout(() => this.mainScrollView.scrollToEnd({ animated: true }), 100)
		}

		const renderFields = () => (
				<View>
					<Field
						placeholder={I18n.t('storeReceiptHeaderPlaceholder')}
						placeholderColor={colors.primaryGrey}
						name="headerExtra"
						component={this.renderField}
						style={field}
						maxLength={50}
						rightIcon={this.renderHelpButton('header')}
						focusAction={() => {
							this.setState({ isFormModalVisible: true, modalType: 'header' })
							this.headerExtra.blur()
						}}
						inputRef={(headerExtra) => {
							this.headerExtra = headerExtra
						}}
					/>

					<Field
						placeholder={I18n.t('storeReceiptFooterPlaceholder')}
						placeholderColor={colors.primaryGrey}
						name="footerExtra"
						component={this.renderField}
						style={field}
						maxLength={50}
						parse={(val) => val === 'true'}
						rightIcon={this.renderHelpButton('footer')}
						inputRef={(footerExtra) => {
							this.footerExtra = footerExtra
						}}
						focusAction={() => {
							this.setState({ isFormModalVisible: true, modalType: 'footer' })
							this.footerExtra.blur()
						}}
					/>

					<SwitchContainer
						title={I18n.t('storeReceiptCustomerInfoPlaceholder')}
						titleStyle={[Type.fontSize(14), Type.Medium, colorSet(colors.secondaryBg)]}
						description={I18n.t('storeReceiptCustomerInfoSubtitle')}
						descriptionStyle={[Type.fontSize(12), Type.Regular, colorSet(colors.grayBlue)]}
						style={{
							paddingHorizontal: 0,
							borderBottomWidth: 0,
							borderBottomColor: colors.primaryGrey,
						}}
					>
						<Field
							name="customerExtra"
							component={() => (
								<KyteSwitch
									onValueChange={(value) => {
										this.setState({ customerExtra: value })
										this.props.change('customerExtra', value)
									}}
									active={customerExtra}
								/>
							)}
						/>
					</SwitchContainer>
				</View>
			)

		return (
			<View style={[fieldsContainer, { marginTop: 20, backgroundColor: colors.drawerIcon }]}>
				<TouchableOpacity
					style={{ justifyContent: 'center', flexDirection: 'row', paddingVertical: 20 }}
					onPress={() => onPress()}
					activeOpacity={0.8}
				>
					<View style={{ flex: 1, alignItems: 'flex-start' }}>
						<Text style={[Type.Medium, Type.fontSize(17), colorSet(colors.secondaryBg)]}>
							{I18n.t('words.s.receipt')}
						</Text>
					</View>

					<View style={{ flex: 1, alignItems: 'flex-end' }}>
						<KyteIcon name={isReceiptVisible ? 'nav-arrow-up' : 'nav-arrow-down'} size={16} color={colors.primaryBg} />
					</View>
				</TouchableOpacity>
				{isReceiptVisible ? renderFields() : null}
			</View>
		)
	}

	renderCatalogForm() {
		const { isCatalogVisible } = this.state
		const { fieldsContainer, field } = styles

		const onPress = () => {
			this.setState({ isCatalogVisible: !isCatalogVisible })
			this.timer = setTimeout(() => this.mainScrollView.scrollToEnd({ animated: true }), 100)
		}

		const renderFields = () => (
				<View style={{ paddingBottom: 20 }}>
					<Field
						placeholder={I18n.t('storeInstagramPlaceholder')}
						placeholderColor={colors.primaryGrey}
						name="instagram"
						component={this.renderMaskedField}
						type="custom"
						options={{ mask: '@******************************' }}
						style={field}
						autoCapitalize="none"
					/>

					<Field
						placeholder={I18n.t('storeInfoExtraPlaceholder')}
						placeholderColor={colors.primaryGrey}
						name="infoExtra"
						component={this.renderField}
						style={field}
						maxLength={50}
						rightIcon={this.renderHelpButton('catalog-extra')}
						focusIn={() => {
							this.setState({ isFormModalVisible: true, modalType: 'catalog-extra' })
							this.infoExtra.blur()
						}}
						inputRef={(infoExtra) => {
							this.infoExtra = infoExtra
						}}
					/>

					<Text style={[Type.Regular, Type.fontSize(12), colorSet(colors.grayBlue), { lineHeight: 20 }]}>
						{I18n.t('storeInfoExtraText')}
					</Text>
				</View>
			)

		return (
			<View style={[fieldsContainer, { marginTop: 20, backgroundColor: colors.drawerIcon, marginBottom: 20 }]}>
				<TouchableOpacity
					style={{ justifyContent: 'center', flexDirection: 'row', paddingVertical: 20 }}
					onPress={() => onPress()}
					activeOpacity={0.8}
				>
					<View style={{ flex: 1, alignItems: 'flex-start' }}>
						<Text style={[Type.Medium, Type.fontSize(17), colorSet(colors.secondaryBg)]}>
							{I18n.t('billingFeatures.catalog')}
						</Text>
					</View>

					<View style={{ flex: 1, alignItems: 'flex-end' }}>
						<KyteIcon name={isCatalogVisible ? 'nav-arrow-up' : 'nav-arrow-down'} size={16} color={colors.primaryBg} />
					</View>
				</TouchableOpacity>
				{isCatalogVisible ? renderFields() : null}
			</View>
		)
	}

	renderCountrySelector() {
		const { countries } = this.state
		return (
			<KyteModal
				height="100%"
				fullPage
				fullPageTitle={I18n.t('storeAccountCountryPlaceholder')}
				hideFullPage={() => this.setState({ isCountrySelectorVisible: false })}
				hideOnBack
				isModalVisible
			>
				<KyteCountrySelector onPress={(item) => this.setCountry(item)} data={countries} />
			</KyteModal>
		)
	}

	renderAddressModal() {
		const { formValues, storeAccount } = this.props

		const saveAddress = (address, isEditing) => {
			this.props.dispatch(change('ConfigStoreForm', 'address', address))
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
					address={formValues.address || storeAccount.address}
					saveAction={(address, isEditing) => saveAddress(address, isEditing)}
				/>
			</KyteModal>
		)
	}

	setPhoneCountryCode(field) {
		const { formValues } = this.props
		if (formValues[field]) return
		this.props.change(field, `${this.dialCode} `)
	}

	setCountry(item, keepDialCode) {
		const { countries } = this.state
		const { formValues } = this.props
		const dialCode = item.dialCode || ''
		const hasDialCode = (number) => number.startsWith(item.dialCode)
		const actualCountry = _.find(countries, (c) => c.name === formValues.countryName)

		const setDialCode = (field) => {
			if (formValues[field] && !hasDialCode(formValues[field])) {
				const actualNumber = formValues[field].replace(`${actualCountry.dialCode} `, '').replace(' ', '')
				this.props.change(field, `${dialCode} ${actualNumber}`)
			}
		}

		this.props.change('country', item.code)
		this.props.change('countryName', item.name)

		this.dialCode = dialCode

		if (!keepDialCode) {
			setDialCode('phone')
			setDialCode('whatsapp')
		}

		this.setState({ isCountrySelectorVisible: false })
	}

	renderSqueezeOptions() {
		return (
			<>
				{this.renderReceiptForm()}
				{this.renderCatalogForm()}
			</>
		)
	}

	render() {
		const { outerContainer } = scaffolding
		const { isHelpModalVisible, isFormModalVisible, isCountrySelectorVisible, isAddressModalVisible } = this.state

		return (
			<>
				<ScrollView
					style={{ flex: 1 }}
					ref={(mainScrollView) => {
						this.mainScrollView = mainScrollView
					}}
				>
					{this.renderTopSection()}
					{this.renderMandatoryFields()}
					{/* {false ? this.renderSqueezeOptions() : null} */}
				</ScrollView>
				{isFormModalVisible ? this.renderFormModal() : null}
				{isHelpModalVisible ? this.renderHelpModal() : null}
				{isCountrySelectorVisible ? this.renderCountrySelector() : null}
				{isAddressModalVisible ? this.renderAddressModal() : null}
			</>
		)
	}
}

const styles = {
	topContainer: {
		justifyContent: 'center',
		flexDirection: 'column',
		flex: SMALL_SCREENS ? 0.3 : 0.4,
		alignItems: 'center',
		backgroundColor: colors.lightBg,
		paddingVertical: 10,
		marginBottom: 20,
	},
	fieldsContainer: {
		paddingHorizontal: 20,
	},
	textButtonStyle: {
		fontFamily: 'Graphik-Medium',
		fontSize: 14,
		color: colors.actionColor,
		marginTop: 15,
	},
	logoContainer: {
		width: 220,
		height: SMALL_SCREENS ? 100 : 150,
		backgroundColor: 'transparent',
		...Platform.select({
			ios: { flex: 0.9 },
			android: { flex: 0.85 },
		}),
	},
	logoStyle: {
		flex: 1,
		resizeMode: 'contain',
		width: null,
		height: null,
		marginBottom: BIG_SCREENS ? -10 : 0,
	},
	alignContent: {
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	field: {
		...Platform.select({
			ios: {
				height: 32,
			},
		}),
	},
	iconContainer: {
		justifyContent: 'center',
		...Platform.select({
			ios: { flex: 0.1 },
			android: { flex: 0.15 },
		}),
	},
	helpIcon: {
		marginLeft: 10,
		justifyContent: 'flex-end',
		alignItems: 'center',
		position: 'relative',
		top: 1,
	},
	addressesContainer: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 10,
		marginTop: 5,
	},
}

const validate = (values) => {
	const errors = {}

	if (!values.name) {
		errors.name = I18n.t('storeInfoNameValidate')
	}
	if (values.phone && values.phone.length < 4) {
		errors.phone = I18n.t('errorInOneField')
	}
	if (values.whatsapp && values.whatsapp.length < 4) {
		errors.whatsapp = I18n.t('errorInOneField')
	}
	return errors
}

const ConfigStoreForm = reduxForm({
	form: 'ConfigStoreForm',
	validate,
})(StoreForm)

export default connect(
	(state) => ({
		formValues: getFormValues('ConfigStoreForm')(state),
		initialValues: state.auth.store,
		storeAccount: state.auth.store,
	}),
	{ storeImgSet, change, startLoading, stopLoading }
)(ConfigStoreForm)
