import React from 'react'
import { connect } from 'react-redux'
import { View, ScrollView, Linking } from 'react-native'
import {
	DetailPage,
	KyteText,
	ActionButton,
	KyteIcon,
	LoadingCleanScreen,
	Input,
	TextButton,
	MaskedInput,
	KyteButton,
	PhoneInput,
	TextAreaModal,
	ListOptions,
} from '../../common'
import { StoreHelpModal } from '../store/modal'
import I18n from '../../../i18n/i18n'
import { colors, Type } from '../../../styles'
import { storeAccountSave } from '../../../stores/actions'
import { kyteCatalogDomain, checkUserPermission, renderBoldText, isBetaCatalog } from '../../../util'
import { generateSocialMediaOptionItem } from '../ConfigContainer'
import { logEvent } from '../../../integrations'
import CatalogBetaActiveModal from '../../common/modals/CatalogBetaActiveModal'

const strings = {
	PAGE_TITLE: I18n.t('catalogSocialNetworkAndOthers'),
	INFO_EXTRA_PLACEHOLDER: I18n.t('storeInfoExtraPlaceholder'),

	WARNING_WHATS_MODAL_TITLE: I18n.t('warningWhatsAppModalTitle'),
	WARNING_WHATS_MODAL_TEXT: I18n.t('warningWhatsAppModalText'),
	WARNING_WHATS_MODAL_BUTTON: I18n.t('warningWhatsAppModalButton'),
	WARNING_WHATS_MODAL_SECOND_BUTTON: I18n.t('warningWhatsAppModalSecondButton'),
}

class CatalogSocialNetwork extends React.Component {
	constructor(props) {
		super(props)

		const { whatsapp, instagram, email, infoExtra } = props.authStore
		const { isAdmin } = checkUserPermission(props.userPermissions)

		this.state = {
			isLoading: false,
			showInfoExtraTip: false,
			showInfoExtraForm: false,
			whatsapp,
			instagram,
			email,
			infoExtra,
			isAdmin,
			showWhatsModal: false,
		}
	}

	saveForm() {
		this.setState({ isLoading: true })
		const { authStore } = this.props
		const { whatsapp, instagram, email, infoExtra } = this.state
		const deleteWhatsWithResume = !whatsapp && authStore.catalog.whatsappOrder

		if (whatsapp && authStore.whatsapp !== whatsapp) {
			logEvent('WhatsApp Number Add', { where: 'store_info' })
		}

		if (!whatsapp && authStore.whatsapp !== whatsapp) {
			logEvent('WhatsApp Number Remove')

			if (authStore.catalog.whatsappOrder) {
				logEvent('Catalog Whatsapp Summary Disable', { where: 'whatsapp_removed' })
			}
		}

		const whatsappRegex = /(?![0-9+])./g

		const store = {
			...authStore,
			catalog: {
				...authStore.catalog,
				whatsappOrder: deleteWhatsWithResume ? false : authStore.catalog.whatsappOrder,
			},
			whatsapp: whatsapp ? whatsapp.replace(whatsappRegex, '') : '',
			instagram,
			email,
			infoExtra,
		}

		this.props.storeAccountSave(store, () => this.props.navigation.goBack())
	}

	setWhatsapp(text) {
		const regex = /(?![0-9])./g
		const whatsapp = text.replace(regex, '')
		this.setState({
			whatsapp: !whatsapp.length ? whatsapp : `+${whatsapp}`,
		})
	}

	goToSocialMediaIntegration() {
		const { navigation } = this.props
		return navigation.navigate('SocialMediaIntegration', { key: 'SocialMediaIntegrationPage' })
	}

	renderSaveButton() {
		const { whatsapp } = this.state
		const { catalog } = this.props.authStore
		const style = { paddingVertical: 15 }
		const showWhatsModal = !whatsapp && catalog.whatsappOrder && isBetaCatalog(catalog?.version)
		const action = () => (showWhatsModal ? this.setState({ showWhatsModal: true }) : this.saveForm())

		return (
			<View style={style}>
				<ActionButton onPress={() => action()}>{I18n.t('descriptionSaveButton')}</ActionButton>
			</View>
		)
	}

	renderInfoExtraTip() {
		const style = {
			marginLeft: 10,
			justifyContent: 'flex-end',
			alignItems: 'center',
			position: 'relative',
			top: 1,
		}

		return (
			<KyteButton width={40} height={27} onPress={() => this.setState({ showInfoExtraTip: true })} style={style}>
				<KyteIcon name="help-filled" size={20} color={colors.grayBlue} />
			</KyteButton>
		)
	}

	renderField(Component, props) {
		const { placeholder, fieldName, type, keyboardType, options, autoCapitalize, maxLength, rightIcon, onFocus } = props

		return (
			<Component
				placeholder={placeholder}
				placeholderColor={colors.primaryGrey}
				value={this.state[fieldName]}
				onChangeText={(text) => this.setState({ [fieldName]: text })}
				type={type}
				keyboardType={keyboardType}
				maxLength={maxLength || 20}
				options={options}
				autoCapitalize={autoCapitalize}
				rightIcon={rightIcon}
				onFocus={onFocus}
			/>
		)
	}

	renderFields() {
		const { infoExtra, whatsapp, isAdmin } = this.state
		const { phone } = this.props.authStore
		return (
			<ScrollView style={styles.mainContainer}>
				<View style={styles.fieldContainer}>
					<PhoneInput
						isWhatsApp
						value={whatsapp}
						onChangeText={(text) => this.setWhatsapp(text)}
						placeholder={I18n.t('storeInfoWhatsappPlaceholder')}
					/>
					<TextButton
						onPress={() => this.setState({ whatsapp: phone })}
						title={I18n.t('storeInfoCopyPhonePlaceholder')}
						color={colors.actionColor}
						size={14}
						style={[Type.Medium, { paddingLeft: 3, textAlign: 'right' }]}
					/>
				</View>

				<View style={{ ...styles.fieldContainer, marginTop: 10 }}>
					{this.renderField(MaskedInput, {
						placeholder: I18n.t('storeInstagramPlaceholder'),
						fieldName: 'instagram',
						options: { mask: '@******************************' },
						autoCapitalize: 'none',
						type: 'custom',
						maxLength: 30,
					})}
				</View>

				<View style={styles.fieldContainer}>
					{this.renderField(Input, {
						placeholder: I18n.t('storeInfoEmailPlaceholder'),
						fieldName: 'email',
						keyboardType: 'email-address',
						autoCapitalize: 'none',
						maxLength: 200,
					})}
				</View>

				<View style={styles.fieldContainer}>
					{this.renderField(Input, {
						placeholder: strings.INFO_EXTRA_PLACEHOLDER,
						fieldName: 'infoExtra',
						maxLength: 50,
						rightIcon: this.renderInfoExtraTip(),
						onFocus: () => this.setState({ showInfoExtraForm: true, infoExtraModal: infoExtra }),
					})}
					<KyteText size={12} pallete="grayBlue" lineHeight={16} marginTop={5}>
						{I18n.t('storeInfoExtraText')}
					</KyteText>
				</View>

				{isAdmin ? this.renderSocialMediaIntegration() : null}
			</ScrollView>
		)
	}

	renderInfoExtraTipModal() {
		const closeAction = () => this.setState({ showInfoExtraTip: false })
		const navigateAction = () => {
			Linking.openURL(`https://${this.props.authStore.urlFriendly}${kyteCatalogDomain}`)
		}

		return (
			<StoreHelpModal
				modalType="catalog-extra"
				navigateAction={() => navigateAction()}
				closeAction={() => closeAction()}
				buttonAction={() => closeAction()}
			/>
		)
	}

	renderInfoExtraFormModal() {
		const { infoExtraModal } = this.state

		return (
			<TextAreaModal
				modalTitle={strings.INFO_EXTRA_PLACEHOLDER}
				closeModal={() => this.setState({ showInfoExtraForm: false })}
				value={infoExtraModal}
				onChangeText={(text) => this.setState({ infoExtraModal: text })}
				ctaAction={() => this.setState({ showInfoExtraForm: false, infoExtra: infoExtraModal })}
			/>
		)
	}

	renderSocialMediaIntegration() {
		return (
			<View style={styles.socialMediaIntegrationContainer}>
				<ListOptions items={[generateSocialMediaOptionItem(this.goToSocialMediaIntegration.bind(this))]} noPadding />
			</View>
		)
	}

	renderWhatsAppModal() {
		return (
			<CatalogBetaActiveModal
				title={strings.WARNING_WHATS_MODAL_TITLE}
				mainButtonTitle={strings.WARNING_WHATS_MODAL_BUTTON}
				secondaryButtonTitle={strings.WARNING_WHATS_MODAL_SECOND_BUTTON}
				onPress={() => {
					this.setState({ showWhatsModal: false })
					this.saveForm()
				}}
				secondaryButtonOnPress={() => {
					this.setState({ showWhatsModal: false })
				}}
				hideModal={() => {
					this.setState({ showWhatsModal: false })
				}}
				customContent={
					<KyteText {...styles.textStyle} style={{ textAlign: 'center' }}>
						{renderBoldText(strings.WARNING_WHATS_MODAL_TEXT, styles.textStyle)}
					</KyteText>
				}
			/>
		)
	}

	render() {
		const { isLoading, showInfoExtraTip, showInfoExtraForm, showWhatsModal } = this.state

		return (
			<DetailPage pageTitle={strings.PAGE_TITLE} goBack={() => this.props.navigation.goBack()}>
				{this.renderFields()}
				{this.renderSaveButton()}
				{isLoading ? <LoadingCleanScreen /> : null}
				{showInfoExtraTip ? this.renderInfoExtraTipModal() : null}
				{showInfoExtraForm ? this.renderInfoExtraFormModal() : null}
				{showWhatsModal && this.renderWhatsAppModal()}
			</DetailPage>
		)
	}
}

const styles = {
	mainContainer: {
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	fieldContainer: {
		marginTop: 10,
	},
	phoneContainer: {
		flexDirection: 'row',
	},
	socialMediaIntegrationContainer: {
		marginTop: 25,
	},
	textStyle: {
		size: 16,
		lineHeight: 25,
		weight: 400,
	},
}

export default connect(({ auth }) => ({ authStore: auth.store, userPermissions: auth.user.permissions }), {
	storeAccountSave,
})(CatalogSocialNetwork)
