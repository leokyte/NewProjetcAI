/* eslint-disable react/destructuring-assignment, no-use-before-define, react/jsx-curly-brace-presence */
import React from 'react'
import { connect } from 'react-redux'
import { BleManager } from 'react-native-ble-plx'
import { ScrollView, View, Alert } from 'react-native'
import {
	DetailPage,
	MenuSelector,
	Input,
	ActionButton,
	LoadingCleanScreen,
	KyteButton,
	KyteIcon,
	TextAreaModal,
} from '../../common'
import { StoreHelpModal } from '../store/modal'
import I18n from '../../../i18n/i18n'
import { colors } from '../../../styles'
import { BLUETOOTH, Features } from '../../../enums'
import { checkPlanKeys, storeAccountSave, preferenceAddCoreAction } from '../../../stores/actions'
import { CoreAction } from '../../../enums/Subscription.ts'
import { checkUserPermission } from '../../../util'
import { requestPermission } from '../../../util/util-permissions'
import { logEvent } from '../../../integrations'

const strings = {
	PAGE_TITLE: I18n.t('ConfigreceiptPageTitle'),
	STORE_MENU_SELECTOR_LABEL: I18n.t('configMenus.storeInfo'),
	ADD_CUSTOMER_DATA_LABEL: I18n.t('storeReceiptCustomerInfoPlaceholder'),
	ADD_CUSTOMER_CATA_SUBTITLE: I18n.t('storeReceiptCustomerInfoSubtitle'),
	HEADER_PLACEHOLDER: I18n.t('storeReceiptHeaderPlaceholder'),
	FOOTER_PLACEHOLDER: I18n.t('storeReceiptFooterPlaceholder'),
	PRINTER_LABEL: I18n.t('configMenus.printer'),
	GO_TO_RECEIPT_PREVIE_BUTTON_LABEL: I18n.t('storeReceiptModalHelpSeeReceipt'),
	SAVE_LABEL: I18n.t('descriptionSaveButton'),
}

class ConfigReceipt extends React.Component {
	constructor(props) {
		super(props)

		const { customerExtra, headerExtra, footerExtra } = props.authStore

		this.state = {
			isLoading: false,
			showTipModal: false,
			tipModalType: '',
			showTextAreaModal: false,
			textAreaType: '',
			customerExtra,
			headerExtra,
			footerExtra,
			headerExtraModal: '',
			footerExtraModal: '',
			isBluetoothTurnedOff: false,
			isPrintersAllowed: false,
		}

		this.manager = new BleManager()
		this.bluetoothStatusSubscription = null
	}

	componentDidMount() {
		this.checkKeys()
		this.bluetoothStatusSubscription = this.manager.onStateChange(
			(state) => this.setState({ isBluetoothTurnedOff: state === 'PoweredOff' }),
			true
		)
	}

	componentWillUnmount() {
		if (this.bluetoothStatusSubscription) {
			this.bluetoothStatusSubscription.remove()
			this.bluetoothStatusSubscription = null
		}
	}

	async checkKeys() {
		const printersKey = Features.items[Features.PRINTERS].key
		if (await this.props.checkPlanKeys(printersKey)) this.setState({ isPrintersAllowed: true })
	}

	saveForm() {
		const { authStore } = this.props
		const { customerExtra, headerExtra, footerExtra } = this.state

		this.setState({ isLoading: true })

		const store = {
			...authStore,
			customerExtra,
			headerExtra,
			footerExtra,
		}
		this.props.storeAccountSave(store, () => {
			this.props.navigation.goBack()
			this.props.preferenceAddCoreAction(CoreAction.ConfigReceipt)
			logEvent('Receipt Config Save')
		})
	}

	async navigateToPrinters() {
		const { isBluetoothTurnedOff } = this.state
		const { navigate } = this.props.navigation
		const { id, name } = this.props.printer

		// Check if bluetooth is turned off
		if (isBluetoothTurnedOff) {
			Alert.alert(I18n.t('words.s.attention'), I18n.t('storePrinterBluetoothOffIos'), [{ text: I18n.t('alertOk') }])
			return
		}

		const hasPermission = await requestPermission(BLUETOOTH)
		if (!hasPermission) return

		if (id) {
			const pairing = { id, name }
			navigate({
				key: 'StorePrinterConfirmPage',
				name: 'StorePrinterConfirm',
				params: { pairing },
			})
		} else {
			navigate({ key: 'StorePrinterPage', name: 'StorePrinter' })
		}
	}

	navigateToReceiptPreview() {
		const { name, phone, customerExtra, imageURL } = this.props.authStore
		const { headerExtra, footerExtra } = this.state
		const navigateParams = {
			companyLogo: imageURL || '',
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

		this.props.navigation.navigate({
			key: 'ReceiptShareOptionsFromConfig',
			name: 'ReceiptShareOptions',
			params: navigateParams,
		})
	}

	renderStoreMenuSelector() {
		const { navigation } = this.props
		const name = 'CatalogStore'
		return (
			<MenuSelector
				onClick={() => navigation.navigate({ name, key: `${name}FromIndex` })}
				label={strings.STORE_MENU_SELECTOR_LABEL}
				arrow
			/>
		)
	}

	renderAddCustomerData() {
		const { customerExtra } = this.state
		return (
			<MenuSelector
				label={strings.ADD_CUSTOMER_DATA_LABEL}
				subtitle={strings.ADD_CUSTOMER_CATA_SUBTITLE}
				switchOption
				switchActive={customerExtra}
				onClick={() => this.setState({ customerExtra: !customerExtra })}
			/>
		)
	}

	renderHeaderFooter() {
		const renderHelpIcon = (type) => (
			<KyteButton
				width={40}
				height={27}
				onPress={() => this.setState({ showTipModal: true, tipModalType: type })}
				style={styles.helpIcon}
			>
				<KyteIcon name="help-filled" size={20} color={colors.grayBlue} />
			</KyteButton>
		)

		const renderInput = (item) => (
			<View style={styles.inputFieldContainer}>
				<Input
					placeholder={item.placeholder}
					placeholderColor={colors.primaryGrey}
					maxLength={50}
					value={this.state[item.fieldName]}
					rightIcon={renderHelpIcon(item.type)}
					focusAction={() =>
						this.setState((prev) => ({
							showTextAreaModal: true,
							textAreaType: item.type,
							[`${item.type}ExtraModal`]: prev[`${item.type}Extra`],
						}))
					}
				/>
			</View>
		)

		return (
			<View style={styles.headerFooterContainer}>
				{renderInput({
					placeholder: strings.HEADER_PLACEHOLDER,
					fieldName: 'headerExtra',
					type: 'header',
				})}
				{renderInput({
					placeholder: strings.FOOTER_PLACEHOLDER,
					fieldName: 'footerExtra',
					type: 'footer',
				})}
			</View>
		)
	}

	renderTipModal() {
		const { tipModalType } = this.state

		const closeTipModal = () => this.setState({ showTipModal: false })
		const navigateAction = () => this.navigateToReceiptPreview()
		return (
			<StoreHelpModal
				modalType={tipModalType}
				closeAction={() => closeTipModal()}
				buttonAction={() => closeTipModal()}
				navigateAction={() => navigateAction()}
			/>
		)
	}

	renderTextAreaModal() {
		const { textAreaType, headerExtraModal, footerExtraModal } = this.state

		const closeModal = () => this.setState({ showTextAreaModal: false })
		const paramsMap = {
			header: {
				modalTitle: strings.HEADER_PLACEHOLDER,
				value: 'headerExtraModal',
				onChangeText: (text) => this.setState({ headerExtraModal: text }),
				ctaAction: () => this.setState({ headerExtra: headerExtraModal, showTextAreaModal: false }),
			},
			footer: {
				modalTitle: strings.FOOTER_PLACEHOLDER,
				value: 'footerExtraModal',
				onChangeText: (text) => this.setState({ footerExtraModal: text }),
				ctaAction: () => this.setState({ footerExtra: footerExtraModal, showTextAreaModal: false }),
			},
		}

		const params = paramsMap[textAreaType]
		return (
			<TextAreaModal
				modalTitle={params.modalTitle}
				closeModal={() => closeModal()}
				value={this.state[params.value]}
				onChangeText={(text) => params.onChangeText(text)}
				ctaAction={() => params.ctaAction()}
			/>
		)
	}

	renderPrinterMenuSelector() {
		return <MenuSelector label={strings.PRINTER_LABEL} arrow onClick={() => this.navigateToPrinters()} />
	}

	renderButtons() {
		const { userPermissions } = this.props
		const { isAdmin } = checkUserPermission(userPermissions)
		const renderGoToReceiptPreviewButton = () => (
			<ActionButton
				style={{ marginBottom: isAdmin ? 10 : 0 }}
				onPress={() => this.navigateToReceiptPreview()}
				leftIcon={<KyteIcon name="eye" color={colors.primaryColor} />}
				cancel
			>
				{strings.GO_TO_RECEIPT_PREVIE_BUTTON_LABEL}
			</ActionButton>
		)

		const renderSaveButton = () => <ActionButton onPress={() => this.saveForm()}>{strings.SAVE_LABEL}</ActionButton>
		return (
			<View style={styles.buttonsContainer}>
				{renderGoToReceiptPreviewButton()}
				{isAdmin ? renderSaveButton() : null}
			</View>
		)
	}

	render() {
		const { isLoading, showTipModal, showTextAreaModal, isPrintersAllowed } = this.state
		const { userPermissions } = this.props
		const { isAdmin } = checkUserPermission(userPermissions)

		return (
			<DetailPage pageTitle={strings.PAGE_TITLE} goBack={() => this.props.navigation.goBack()}>
				<ScrollView>
					{isAdmin ? this.renderStoreMenuSelector() : null}
					{isAdmin ? this.renderAddCustomerData() : null}
					{isAdmin ? this.renderHeaderFooter() : null}
					{isAdmin ? <View style={styles.separator} /> : null}
					{isPrintersAllowed ? this.renderPrinterMenuSelector() : null}
				</ScrollView>
				{this.renderButtons()}
				{isLoading ? <LoadingCleanScreen /> : null}
				{showTipModal ? this.renderTipModal() : null}
				{showTextAreaModal ? this.renderTextAreaModal() : null}
			</DetailPage>
		)
	}
}

const styles = {
	headerFooterContainer: {
		paddingVertical: 20,
		paddingHorizontal: 25,
	},
	helpIcon: {
		marginLeft: 10,
		justifyContent: 'flex-end',
		alignItems: 'center',
		position: 'relative',
		top: 1,
	},
	inputFieldContainer: {
		marginVertical: 10,
	},
	separator: {
		height: 20,
		backgroundColor: colors.lightBg,
	},
	buttonsContainer: {
		paddingVertical: 15,
	},
}

export default connect(
	({ auth, printer }) => ({
		authStore: auth.store,
		printer,
		userPermissions: auth.user.permissions,
	}),
	{ checkPlanKeys, storeAccountSave, preferenceAddCoreAction }
)(ConfigReceipt)
