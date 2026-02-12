import React, { Component } from 'react'
import { View, ScrollView, Alert, TouchableOpacity, Image } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'

import {
	Row,
	Margin,
	PixLogo,
	Container,
	colors as UIColors,
} from '@kyteapp/kyte-ui-components'
import { scaffolding, colors } from '../../../../styles'
import {
	ActionButton,
	DetailPage,
	LoadingCleanScreen,
	KyteSection,
	SwitchOptions,
	TextAreaModal,
	KyteModal,
	KyteIcon,
	KyteText,
	CenterContent,
	KyteCountrySelector,
	KyteTagNew,
} from '../../../common'
import { PaymentType, PaymentGatewayServiceType, toList, PaymentGatewayType } from '../../../../enums'

import I18n from '../../../../i18n/i18n'
import {
	storeAccountSave,
	startLoading,
	stopLoading,
	preferenceSetOnlinePaymentsCountryCode,
} from '../../../../stores/actions'
import { setCountryFees, updatePaymentGateways } from '../../../../stores/actions/ExternalPaymentsActions'
import { kyteAccountGatewayGetCountryFees, kyteAccountGetCountries } from '../../../../services'
import BottomMessageModal from '../../../common/BottomMessageModal'
import { CATALOG_SERVICE_TYPE, checkUserPermission, getIsBRAndUseBRL, isBetaCatalog, NEW_CATALOG_VERSION, toggleGateway } from '../../../../util'
import { logEvent } from '../../../../integrations'
import ActivateCatalogBetaModal from '../../../common/modals/ActivateCatalogBetaModal'
import TooltipContainer from '../../../common/utilities/TooltipContainer'
import { MercadoPagoWithName, ServiceNotAvailable, StripeConnect } from '../../../../../assets/images'
import { OnlinePaymentPlaceholder } from './CatalogOrderPaymentsComponents/OnlinePaymentPlaceholder'
import { OnlinePaymentSwitchTitle } from './CatalogOrderPaymentsComponents/OnlinePaymentSwitchTitle'

const Strings = {
	OFF: I18n.t('words.s.off'),
	ON: I18n.t('words.s.on'),
	ADD_DESCRIPTION: I18n.t('addDescriptionButton'),
	ONLINE_PAYMENT: I18n.t('words.p.integration'),
	ORDER_PAYMENT: I18n.t('integratedPayments.title'),
	ORDER_PAYMENT_SUBTITLE: I18n.t('integratedPayments.subtitle'),
	PAYMENT_METHODS: I18n.t('catalogPaymentMethods.orderTitle'),
	PAYMENT_METHODS_SUBTITLE: I18n.t('paymentMethods.integrationsSubtitle'),
	PROCESSED_BY: I18n.t('expressions.processedBy'),
	MERCADO_PAGO: I18n.t('paymentMachines.cardReaderMercadoPago'),
	DEFAULT_PLACEHOLDER: I18n.t('catalogPaymentMethods.defaultPlaceholder'),
	CREDIT_PLACEHOLDER: I18n.t('catalogPaymentMethods.creditPlaceholder'),
	OTHERS_PLACEHOLDER: I18n.t('catalogPaymentMethods.othersPlaceholder'),
	PIX_PLACEHOLDER: I18n.t('paymentMethods.pixPlaceholder'),
	ORDER_PAYMENT_TIP: I18n.t('catalogPaymentMethods.tip'),
	OFFLINE_MESSAGE_TITLE: I18n.t('offlineMessage.title'),
	OFFLINE_MESSAGE_MESSAGE: I18n.t('offlineMessage.message'),
	SERVICE_NOT_AVAILABLE_IN_COUNTRY: I18n.t('serviceNotAvailableInCountry'),
	CHANGE_COUNTRY: I18n.t('expressions.changeCountry'),
	OK: I18n.t('alertOk'),
	CARD_AND_PIX: I18n.t('integratedPayments.cardAndPix'),
	STRIPE: I18n.t('paymentGateways.stripeConnect'),
	PIX_TOOLTIP_TITLE: I18n.t('paymentMethods.pixTooltipTitle'),
	PIX_TOOLTIP_DESCRIPTION: I18n.t('paymentMethods.pixTooltipDescription'),
	PIX_TOOLTIP_BUTTON: I18n.t('paymentMethods.pixTooltipButton'),
	PAYMENTS_ALERT: I18n.t('catalogConfig.noPaymentsAlert'),
	AUTOMATIC_PAYMENT: I18n.t('integratedPayments.automaticPayments'),
	ACTIVE_AUTOMATIC_PAYMENT: I18n.t('integratedPayments.activeAutomaticPayments'),
	SEE_ALL_BENEFITS: I18n.t('integratedPayments.seeAllBenefits'),
	MANAGE_INTEGRATION: I18n.t('integratedPayments.manageIntegration'),
	AUTOMATIC_CONFIRMATION: I18n.t('integratedPayments.automaticConfirmation'),
	DEACTIVATE_ONLINE_PAYMENTS_MSG: I18n.t('integratedPayments.deactivateOnlinePayments')
}

const messageTypes = {
	OFFLINE: 'offline',
	COUNTRY_NOT_ALLOWED: 'country-not-allowed',
}


const MERCADO_PAGO_ONLINE_TYPE = PaymentGatewayType.items[PaymentGatewayType.MERCADO_PAGO_ONLINE].type
const STRIPE_CONNECT_TYPE = PaymentGatewayType.items[PaymentGatewayType.STRIPE_CONNECT].type

class CatalogOrderPayments extends Component {
	constructor(props) {
		super(props)
		const { payments = [] } = props.catalog
		const { navigate } = props.navigation
		const enumPayment = (type) => PaymentType.items[PaymentType[type]].type
		const placeholders = [
			{
				type: enumPayment('PIX'),
				placeholder: Strings.PIX_PLACEHOLDER,
				tooltip: (
					<Container padding={16}>
						<TooltipContainer
							leftIcon="pix"
							containerBg={UIColors.green07}
							iconColor={UIColors.green03Kyte}
							terms={{ title: Strings.PIX_TOOLTIP_TITLE, description: [Strings.PIX_TOOLTIP_DESCRIPTION] }}
							help={{
								onPress: () => {
									navigate('PixDataConfig')
									logEvent('Pix QR Code Config Click', { where: 'settings' })
									this.setState({ paymentSelected: {} })
								},
								leftIcon: 'nav-arrow-right',
								text: Strings.PIX_TOOLTIP_BUTTON,
							}}
						/>
					</Container>
				),
			},
			{ type: enumPayment('MONEY'), placeholder: Strings.DEFAULT_PLACEHOLDER },
			{ type: enumPayment('DEBIT'), placeholder: Strings.CREDIT_PLACEHOLDER },
			{ type: enumPayment('CREDIT'), placeholder: Strings.CREDIT_PLACEHOLDER },
			{ type: enumPayment('OTHERS'), placeholder: Strings.OTHERS_PLACEHOLDER },
		]

		const catalogPayments = payments.map((p) => {
			const placeholder = placeholders.find((ph) => p.type === ph.type)
			return { ...p, ...placeholder }
		})

		this.bottomSheetRef = React.createRef()

		const hasAnyGatewayConfigured = this.props.checkoutGateways.some((g) => g?.key)
		const pageConfigToGo = hasAnyGatewayConfigured ? 'ConfigOnlinePayments' : 'ConfigOnlinePaymentsWizard'

		this.state = {
			paymentSelected: {},
			paymentDescription: '',
			paymentsModified: false,
			isHelpModalVisible: false,
			isOfflineModalVisible: false,
			isCountrySelectorVisible: false,
			catalogPayments,
			countries: [],
			isMessageModalVisible: false,
			messageType: null,
			isBetaCatalogActive: isBetaCatalog(props.catalog?.version),
			showActivateBetaModal: false,
			wasDescriptionClicked: false,
			isBR: getIsBRAndUseBRL(props.currency),
			pageConfigToGo
		}

		this.selectedCountry = null
	}

	componentWillUnmount() {
		clearTimeout(this.timer)
	}

	componentDidMount() {
		logEvent('Payment Method Config View')
	}

	saveCatalogPayments(version) {
		const { catalogPayments } = this.state
		const { store, catalog } = this.props

		this.props.storeAccountSave(
			{ ...store, catalog: { ...catalog, payments: catalogPayments, version: version || catalog?.version } },
			() => {
				logEvent('Payment Method Config Save')
				this.setState({ paymentsModified: false })
			}
		)
	}

	renderPaymentsLists() {
		const { isBetaCatalogActive, catalogPayments, isBR } = this.state

		const isPix = (payment) => payment.type === PaymentType.PIX

		const setShowPixBetaModal = () => {
			this.setState({ showActivateBetaModal: true })
			logEvent('Catalog Version Exclusive Feature', { where: 'pix_payment_type' })
		}

		const renderSwitchTitle = (item, payment) =>
			isPix(payment) ? (
				<Row justifyContent="flex-start" alignItems="center">
					<KyteText size={14} weight="Semibold" pallete="primaryDarker">
						{item?.description}
					</KyteText>
					<Margin left={3} />
					{!isBetaCatalogActive && <KyteTagNew isFromNewCatalog />}
				</Row>
			) : (
				item?.description
			)

		const onSwitch = (value, payment, isToShowBetaModal) => {
			if (isToShowBetaModal) {
				setShowPixBetaModal()
				return
			}

			this.activePayment(value, payment.type)
		}

		const onPress = (payment, isToShowBetaModal) => {
			if (isToShowBetaModal) {
				setShowPixBetaModal()
				return
			}
			return this.goToEditDescription(payment)
		}
		const sortedPaymentMethods = catalogPayments.sort((a, b) => {
			if (a.type === 9) return -1
			if (b.type === 9) return 1
			return 0
		})

		return sortedPaymentMethods.map((payment) => {
			if (isPix(payment) && !isBR) return

			const item = toList(PaymentType).find((enums) => enums.type === payment.type)
			const isToShowBetaModal = isPix(payment) && !isBetaCatalogActive

			return (
				<SwitchOptions
					key={payment.type}
					active={payment.active}
					title={renderSwitchTitle(item, payment)}
					icon={item?.icon}
					iconSize={isPix(payment) ? 40 : 30}
					onSwitch={(value) => onSwitch(value, payment, isToShowBetaModal)}
					onPress={() => onPress(payment, isToShowBetaModal)}
					description={payment.userDescription}
					subDescripion={
						payment.userDescription ? { text: I18n.t('words.s.edit'), weight: 'Semibold', color: 'actionColor' } : null
					}
					placeholder={payment.userDescription ? null : Strings.ADD_DESCRIPTION}
				/>
			)
		})
	}

	activePayment(value, type) {
		const { catalogPayments } = this.state
		const { payments = [] } = this.props.catalog

		const selected = catalogPayments.find((p) => p.type === type)
		const activate = { ...selected, active: value }
		const oldArr = catalogPayments.filter((p) => p.type !== selected.type)
		const newArr = [...oldArr, activate].sort((a, b) => a.type - b.type)

		const paymentsModifiedChanged = newArr.some((newPayment) => {
			const original = payments.find((p) => p.type === newPayment.type)
			return original?.active !== newPayment.active
    })

		this.setState({ catalogPayments: newArr, paymentsModified: paymentsModifiedChanged })
	}

	renderOnlinePayment() {
		const { checkoutGateways } = this.props
		const { isAdmin } = checkUserPermission(this.props.user.permissions)

		const activeGateway = checkoutGateways.find((cg) => cg.active)

		const hasActiveMP = activeGateway?.active && activeGateway?.key === MERCADO_PAGO_ONLINE_TYPE
			&& activeGateway.services.some((service) => service.active && service.type === CATALOG_SERVICE_TYPE)
		const hasActiveStripe = activeGateway?.active && activeGateway?.key === STRIPE_CONNECT_TYPE
			&& activeGateway.services.some((service) => service.active && service.type === CATALOG_SERVICE_TYPE)

		const imgMP = activeGateway ? <Image source={{ uri: MercadoPagoWithName, width: 66, height: 17 }} /> : null
		const imgStripe = activeGateway ? <Image source={{ uri: StripeConnect, width: 43, height: 18 }} /> : null
		const hasAnyIntegration = (hasActiveMP || hasActiveStripe)
	
		const gatewayImgToUse = activeGateway?.key === MERCADO_PAGO_ONLINE_TYPE ? imgMP : imgStripe
		const gatewayImg = activeGateway ? gatewayImgToUse : null

		const switchTitle = (
			activeGateway ? Strings.AUTOMATIC_PAYMENT : (
				<OnlinePaymentSwitchTitle text={Strings.ACTIVE_AUTOMATIC_PAYMENT} />
		))

		return (
			<KyteSection title={Strings.ONLINE_PAYMENT} subtitle={Strings.PAYMENT_METHODS_SUBTITLE}>
				<SwitchOptions
					title={switchTitle}
					titleSize={activeGateway ? 14 : 11}
					icon="automatic-payment"
					iconSize={40}
					active={hasAnyIntegration}
					onPress={() => this.goToOnlinePayment()}
					onSwitch={() => this.handleToggleGateway(activeGateway)}
					description={!activeGateway ? Strings.AUTOMATIC_CONFIRMATION : null}
					placeholder={(
						<OnlinePaymentPlaceholder
							text={activeGateway ? Strings.MANAGE_INTEGRATION : Strings.SEE_ALL_BENEFITS}
							image={gatewayImg}
						/>
					)}
					titleSpacing
					disabled={!isAdmin}
					rightComponent={activeGateway ? null : (
						<KyteIcon name="nav-arrow-right" size={14} />
					)}
				/>
			</KyteSection>
		)
	}

	handleToggleGateway(gateway) {
		toggleGateway({
			gatewayKey: gateway.key, 
			store: this.props.store,
			hasOtherPaymentsActive: this.state.catalogPayments.some((p) => p.active),
			selectOneAlert: this.selectOneAlert.bind(this),
			storeAccountSave: this.props.storeAccountSave,
			updatePaymentGateways: this.props.updatePaymentGateways,
		})
	}

	renderHelpModal() {
		return (
			<KyteModal
				height="40%"
				title=""
				isModalVisible={this.state.isHelpModalVisible}
				noEdges
				noPadding
				hideModal={this.closeHelpModal}
				hideOnBack={this.closeHelpModal}
			>
				<TouchableOpacity style={styles.closeIconContainer} onPress={() => this.closeHelpModal()}>
					<CenterContent style={styles.closeIcon}>
						<KyteIcon name="close-navigation" size={12} />
					</CenterContent>
				</TouchableOpacity>
				<CenterContent style={styles.helpPadding}>
					<KyteText size={20} marginBottom={20} pallete="primaryDarker" weight="Medium">
						{Strings.PAYMENT_METHODS}
					</KyteText>
					<KyteText size={16} lineHeight={20} textAlign="center">
						{Strings.ORDER_PAYMENT_TIP}
					</KyteText>
				</CenterContent>
				<View style={scaffolding.bottomContainer}>
					<ActionButton style={styles.bottomSpace} onPress={() => this.closeHelpModal()}>
						{I18n.t('alertOk')}
					</ActionButton>
				</View>
			</KyteModal>
		)
	}

	closeHelpModal() {
		this.setState({ isHelpModalVisible: false })
	}

	openHelpModal() {
		this.setState({ isHelpModalVisible: true })
	}

	getGatewayCountryFees(gateway, countryCode) {
		return new Promise((resolve, reject) => {
			kyteAccountGatewayGetCountryFees(gateway, countryCode)
				.then((fees) => {
					const countryFees = fees.data
					if (countryFees.length <= 0) return reject({ type: messageTypes.COUNTRY_NOT_ALLOWED })
					resolve(countryFees[0])
				})
				.catch((error) => reject({ type: 'general-error', error }))
		})
	}

	goToOnlinePayment() {
		const { navigation, onlinePaymentsCountryCode, isOnline, checkoutGateways } = this.props
		const { countries } = this.state
		if (!isOnline) return this.setState({ isMessageModalVisible: true, messageType: messageTypes.OFFLINE })

		const gateway = onlinePaymentsCountryCode !== 'BR' ? STRIPE_CONNECT_TYPE : MERCADO_PAGO_ONLINE_TYPE
		const hasActiveGateway = checkoutGateways.find((cg) => cg.active)
		
		if ((!!onlinePaymentsCountryCode && this.isOnlinePaymentActive) || hasActiveGateway) {
			this.props.startLoading()
			return this.getGatewayCountryFees(gateway, onlinePaymentsCountryCode)
				.then((countryFees) => {
					this.props.setCountryFees(countryFees)
					this.props.stopLoading()
					navigation.navigate(this.state.pageConfigToGo, {
						type: CATALOG_SERVICE_TYPE,
						gateway,
						origin: 'CatalogConfig',
					})
				})
				.catch(() => this.props.stopLoading())
		}

		if (countries.length <= 0) {
			this.props.startLoading()
			return kyteAccountGetCountries(I18n.t('locale')).then((countries) => {
				const filteredCountries = countries.data.filter((c) => c.dialCode && c.name)
				const orderedCountries = _.orderBy(filteredCountries, ['name'], ['asc'])
				logEvent('Payment Integration Country View')
				this.setState({ countries: orderedCountries, isCountrySelectorVisible: true }, () => this.props.stopLoading())
			})
		}
		logEvent('Payment Integration Country View')
		this.setState({ isCountrySelectorVisible: true })
	}

	goToEditDescription(payment) {
		const item = toList(PaymentType).find((enums) => enums.type === payment.type)
		this.setState({ paymentSelected: { ...item, ...payment }, paymentDescription: payment.userDescription })
	}

	closeModalDescription() {
		this.setState({ paymentSelected: {}, paymentDescription: '' })
	}

	setPaymentDescription(value) {
		this.setState({ paymentDescription: value })
	}

	saveDescription() {
		const { paymentDescription, paymentSelected, catalogPayments } = this.state

		const oldArr = catalogPayments.filter((p) => p.type !== paymentSelected.type)
		const itemDescription = { ...paymentSelected, userDescription: paymentDescription }
		const newArr = [...oldArr, itemDescription].sort((a, b) => a.type - b.type)

		this.setState({ catalogPayments: newArr, paymentsModified: true })
		this.closeModalDescription()
	}

	renderEditDescription() {
		const { paymentSelected, paymentDescription } = this.state
		const modalButton = {
			icon: 'help',
			color: colors.grayBlue,
			iconSize: 24,
			onPress: () => this.openHelpModal(),
		}

		return (
			<TextAreaModal
				modalTitle={paymentSelected.description}
				closeModal={() => this.closeModalDescription()}
				value={paymentDescription}
				onChangeText={(text) => this.setPaymentDescription(text)}
				ctaAction={() => this.saveDescription()}
				visibiliy={paymentSelected.type >= 0}
				placeholder={paymentSelected.placeholder}
				maxLength={140}
				inputFlex={1}
				rightButtons={[modalButton]}
				tooltipContainer={paymentSelected.tooltip}
			>
				{this.renderHelpModal()}
			</TextAreaModal>
		)
	}

	backPressAlert() {
		const { navigation, catalog } = this.props
		const hasActivePayments = catalog.payments.find((p) => p.active)

		const onSave = () => {
			if (this.noStatePaymentActive && !this.isOnlinePaymentActive) return this.selectOneAlert()
			this.saveCatalogPayments()
		}

		const onClose = () => {
			if (!hasActivePayments && !this.isOnlinePaymentActive) return this.selectOneAlert()
			navigation.goBack()
		}

		Alert.alert(I18n.t('unsavedChangesTitle'), I18n.t('unsavedChangesDescription'), [
			{ text: I18n.t('alertDiscard'), onPress: () => onClose() },
			{ text: I18n.t('alertSave'), onPress: () => onSave() },
		])
	}

	selectOneAlert(text) {
		Alert.alert(I18n.t('words.s.attention'), text || I18n.t('catalogConfig.noPaymentsAlert'), [{ text: I18n.t('alertOk') }])
	}

	toggleBottomSheet() {
		const { bottomSheetIndex } = this.state
		this.setState({ bottomSheetIndex: bottomSheetIndex ? 0 : 1 })
	}

	renderMessageModal() {
		const { messageType } = this.state
		const generateOfflineMessage = () => ({
			title: Strings.OFFLINE_MESSAGE_TITLE,
			actionText: Strings.OFFLINE_MESSAGE_MESSAGE,
		})
		const generateCountryNotAllowed = () => ({
			title: Strings.SERVICE_NOT_AVAILABLE_IN_COUNTRY.replace('$x', this.selectedCountry.name),
			actionText: Strings.CHANGE_COUNTRY,
			actionTextOnPress: () => { 
				this.setState({ isMessageModalVisible: false, isCountrySelectorVisible: true }); 
				logEvent('Payment Integration Country View')
			},
			image: ServiceNotAvailable,
		})

		const selectedMessage =
			messageType === messageTypes.OFFLINE ? generateOfflineMessage() : generateCountryNotAllowed()
		return (
			<BottomMessageModal
				image={selectedMessage.image || null}
				title={selectedMessage.title}
				actionText={selectedMessage.actionText || null}
				actionTextOnPress={selectedMessage.actionTextOnPress || null}
				actionButtonText={Strings.OK}
				actionButtonOnPress={() => this.setState({ isMessageModalVisible: false })}
				onSwipeComplete={() => this.setState({ isMessageModalVisible: false })}
				hideSeePlansButton
			/>
		)
	}

	handleCountrySelected(country) {
		const { navigation } = this.props
		const gateway = country.code !== 'BR' ? STRIPE_CONNECT_TYPE : MERCADO_PAGO_ONLINE_TYPE
		this.selectedCountry = country
		this.setState({ isCountrySelectorVisible: false })
		this.props.startLoading()

		this.getGatewayCountryFees(gateway, country.code)
			.then((countryFees) => {
				this.props.preferenceSetOnlinePaymentsCountryCode(country.code, () => {
					this.setState({ isCountrySelectorVisible: false }, () => {
						logEvent('Payment Integration Country Select', { where: 'online payment' })
						this.props.setCountryFees(countryFees)
						this.props.stopLoading()
						navigation.navigate('ConfigOnlinePaymentsWizard', {
							type: CATALOG_SERVICE_TYPE,
							gateway: country.code !== 'BR' ? STRIPE_CONNECT_TYPE : MERCADO_PAGO_ONLINE_TYPE,
							origin: 'CatalogConfig',
						})
					})
				})
			})
			.catch((error) => {
				this.props.stopLoading()
				if (error.type === messageTypes.COUNTRY_NOT_ALLOWED) {
					this.setState({
						isCountrySelectorVisible: false,
						isMessageModalVisible: true,
						messageType: messageTypes.COUNTRY_NOT_ALLOWED,
					})
				}
			})
	}

	renderCountrySelector() {
		return (
			<KyteModal
				height="100%"
				fullPage
				fullPageTitle={I18n.t('storeAccountCountryPlaceholder')}
				hideFullPage={() => this.setState({ isCountrySelectorVisible: false })}
				hideOnBack
				isModalVisible
			>
				<KyteCountrySelector onPress={(item) => this.handleCountrySelected(item)} data={this.state.countries} />
			</KyteModal>
		)
	}

	renderActivateBetaModal() {
		const { showActivateBetaModal, wasDescriptionClicked, catalogPayments } = this.state

		const handleConfirmModal = () => {
			this.saveCatalogPayments(NEW_CATALOG_VERSION)
			this.setState({ showActivateBetaModal: false, isBetaCatalogActive: true })

			logEvent('Catalog Version Change', { where: 'catalog_order_payments', catalog_version: NEW_CATALOG_VERSION })

			if (wasDescriptionClicked) {
				const payment = catalogPayments.find((p) => p.type === PaymentType.PIX)
				this.goToEditDescription(payment)
			}
		}

		const handleCancelModal = () => {
			this.setState({ showActivateBetaModal: false })
		}

		return (
			<ActivateCatalogBetaModal
				onPress={handleConfirmModal}
				hideModal={handleCancelModal}
				isVisible={showActivateBetaModal}
				image={PixLogo}
				subtitle="paymentMethods.subtitleActiveModal"
				imgStyles={{ width: 140, height: 140 }}
			/>
		)
	}

	render() {
		const {
			catalogPayments,
			paymentsModified,
			isMessageModalVisible,
			isCountrySelectorVisible,
			showActivateBetaModal,
		} = this.state
		const { loader, navigation, checkoutGateways } = this.props
		const catalogServiceType = PaymentGatewayServiceType.items[PaymentGatewayServiceType.CATALOG].type

		this.isOnlinePaymentActive = !!checkoutGateways.find((c) => {
			if (!c.active) return false
			const hasCatalog = c.services.length && !!c.services.find((s) => s.active && s.type === catalogServiceType)
			return c.active && hasCatalog
		})
		this.isOtherPaymentsActive = catalogPayments.find((p) => p.active)
		this.noStatePaymentActive = !this.isOtherPaymentsActive && !this.isOnlinePaymentActive

		return (
			<DetailPage
				pageTitle={Strings.PAYMENT_METHODS}
				goBack={paymentsModified ? this.backPressAlert.bind(this) : navigation.goBack}
			>
				<ScrollView>
					<View>
						{this.renderOnlinePayment()}
						<KyteSection title={Strings.ORDER_PAYMENT} subtitle={Strings.ORDER_PAYMENT_SUBTITLE}>
							{this.renderPaymentsLists()}
						</KyteSection>
					</View>
				</ScrollView>
				<View style={scaffolding.bottomContainer}>
					<ActionButton
						style={styles.bottomSpace}
						onPress={() => this.saveCatalogPayments()}
						alertTitle={I18n.t('words.s.attention')}
						alertDescription={I18n.t('catalogConfig.noPaymentsAlert')}
						disabled={!paymentsModified}
					>
						{I18n.t('descriptionSaveButton')}
					</ActionButton>
				</View>
				{this.renderEditDescription()}
				{loader ? <LoadingCleanScreen /> : null}
				{isMessageModalVisible ? this.renderMessageModal() : null}
				{isCountrySelectorVisible ? this.renderCountrySelector() : null}
				{showActivateBetaModal ? this.renderActivateBetaModal() : null}
			</DetailPage>
		)
	}
}

const styles = {
	closeIconContainer: {
		position: 'absolute',
		right: 15,
		top: 15,
		zIndex: 100,
	},
	closeIcon: {
		backgroundColor: colors.littleDarkGray,
		width: 30,
		height: 30,
		borderRadius: 15,
	},
	bottomSpace: {
		marginBottom: 10,
	},
	helpPadding: {
		padding: 20,
	},
	imgStyle: {
		height: 280,
		width: 280,
		marginVertical: 20,
	},
}

const mapStateToProps = ({ auth, common, preference }) => ({
	checkoutGateways: auth.store.checkoutGateways || [],
	catalog: auth.store.catalog,
	store: auth.store,
	loader: common.loader.visible,
	onlinePaymentsCountryCode: preference.account.onlinePaymentsCountryCode || null,
	currency: preference.account.currency,
	isOnline: common.isOnline,
	user: auth.user,
})

const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators(
		{
			storeAccountSave,
			startLoading,
			stopLoading,
			preferenceSetOnlinePaymentsCountryCode,
			setCountryFees,
			updatePaymentGateways
		},
		dispatch
	),
})

export default connect(mapStateToProps, mapDispatchToProps)(CatalogOrderPayments)
