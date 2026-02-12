/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Alert } from 'react-native'
import { bindActionCreators } from 'redux'
import _ from 'lodash'

import { KyteSwitch , Body11, Margin, Row, Padding } from '@kyteapp/kyte-ui-components'
import { Icon } from 'react-native-elements'
import I18n from '../../../i18n/i18n'
import ActivateCatalogBetaModal from '../../common/modals/ActivateCatalogBetaModal'
import NeedConfigureCatalogModal from '../../common/modals/NeedConfigureCatalogModal'
import {
	DetailPage,
	KyteCountrySelector,
	KyteModal,
	ListOptions,
	LoadingCleanScreen,
	SwitchContainer,
} from '../../common'
import { colors } from '../../../styles'
import { checkUserPermission, getIsBRAndUseBRL, isBetaCatalog, NEW_CATALOG_VERSION } from '../../../util'
import MessageModal from './online-payments/MessageModal'
import { ServiceNotAvailable, ActiveBetaModalPixConfig, NeedCatalogModal } from '../../../../assets/images'
import BottomMessageModal from '../../common/BottomMessageModal'
import {
	startLoading,
	stopLoading,
	preferenceSetOnlinePaymentsCountryCode,
	preferenceSetStorePayLater,
	storeAccountSave,
} from '../../../stores/actions'
import { setCountryFees } from '../../../stores/actions/ExternalPaymentsActions'
import { PaymentGatewayServiceType, PaymentGatewayType } from '../../../enums'
import { kyteAccountGatewayGetCountryFees, kyteAccountGetCountries } from '../../../services'
import { logEvent } from '../../../integrations/Firebase-Integration'
import { checkIsCardServiceCustomized } from '../../../util/util-preference'

const Strings = {
	PAGE_TITLE: I18n.t('integratedPayments.title'),
	ONLINE_PAYMENTS: I18n.t('catalogPaymentMethods.settingsTitle'),
	ONLINE_PAYMENTS_SUBTITLE: I18n.t('catalogPaymentMethods.settingsSubtitle'),
	LINK_PAYMENTS: I18n.t('paymentMethods.link'),
	LINK_PAYMENTS_SUBTITLE: I18n.t('integratedPayments.linkSubtitle'),
	CARD_READERS: I18n.t('configMenus.cardReaders'),
	CARD_READERS_SUBTITLE: I18n.t('configStoreCardSubtitle'),
	OFFLINE_MESSAGE_TITLE: I18n.t('offlineMessage.title'),
	OFFLINE_MESSAGE_MESSAGE: I18n.t('offlineMessage.message'),
	SERVICE_NOT_AVAILABLE_IN_COUNTRY: I18n.t('serviceNotAvailableInCountry'),
	CHANGE_COUNTRY: I18n.t('expressions.changeCountry'),
	ACTION_BUTTON_TEXT: I18n.t('alertOk'),
	ALLOW_STORE_PAYLATER_TITLE: I18n.t('customerAccount.allowStorePayLaterTitle'),
	DEADLINE_AND_FEES: I18n.t('deadlineAndFeesTitle'),
	DEADLINE_AND_FEES_ACTIVE: I18n.t('words.s.turnedOn').toUpperCase(),
	DEADLINE_AND_FEES_INACTIVE: I18n.t('words.s.turnedOff').toUpperCase(),
	ALLOW_STORE_PAYLATER_RESTRICTED_ACCESS: I18n.t('customerAccount.allowStorePayLaterRestrictedAccess'),
	RESTRICTED_ACCESS: I18n.t('words.m.restrictedAccess'),
	PIX_DATA_CONFIG: I18n.t('pixDataConfig.title'),
	PIX_DATA_CONFIG_NEED_CATALOG_SUB: 'pixDataConfig.needCatalogModalSubtitle',
	PIX_DATA_CONFIG_NEED_NEW_CATALOG_SUB: 'pixDataConfig.needNewCatalogModalSubtitle',
}

const messageTypes = {
	OFFLINE: 'offline',
	COUNTRY_NOT_ALLOWED: 'country-not-allowed',
}

const LINK_SERVICE_TYPE = PaymentGatewayServiceType.items[PaymentGatewayServiceType.LINK].type

const MERCADO_PAGO_ONLINE_TYPE = PaymentGatewayType.items[PaymentGatewayType.MERCADO_PAGO_ONLINE].type
const STRIPE_CONNECT_TYPE = PaymentGatewayType.items[PaymentGatewayType.STRIPE_CONNECT].type

const StatusToggle = (isActive) => (
	<Padding left={16} right={4}>
			<Row alignItems="center">
				<Body11
					weight={500}
					size={11}
					lineHeight={11}
					color={isActive ? colors.actionDarkColor : colors.grayBlue}
				>
					{isActive ? Strings.DEADLINE_AND_FEES_ACTIVE : Strings.DEADLINE_AND_FEES_INACTIVE}
				</Body11>
				<Margin left={12}>
					<Icon name="chevron-right" color={colors.terciaryBg} size={20} />
				</Margin>
			</Row>
		</Padding>
)

const ConfigIntegratedPayments = (props) => {
	const { navigation, userPermissions, store, route, allowPayLater, catalog, storeAccountSave, currency } = props
	const { navigate, goBack } = navigation
	const { params = {} } = route
	const { isTryingToConfigLink = false } = params
	const isBetaActive = isBetaCatalog(catalog?.version)
	const hasAnyGatewayConfigured = props.checkoutGateways.some((g) => g?.key)
	const pageConfigToGo = hasAnyGatewayConfigured ? 'ConfigOnlinePayments' : 'ConfigOnlinePaymentsWizard'

	const [state, setState] = useState({
		isOnlineOrderModalVisible: false,
		isCountrySelectorVisible: false,
		isBottomMessageModalVisible: false,
		countries: [],
		messageType: null,
		selectedCountry: null,
		isOnlinePaymentActive: !!props.checkoutGateways.find((c) => c.active),
		isPayLaterEnabled: !!allowPayLater,
		showNeedCatalogModal: false,
		showNeedNewCatalogModal: false
	})

	useEffect(() => {
		if (isTryingToConfigLink) {
			goToOnlinePayments()
		}
		logEvent('Payment Config View')
	}, [])

	useEffect(() => {
		const isOnlinePaymentActive = !!props.checkoutGateways.find((c) => c.active)
		setState({ ...state, isOnlinePaymentActive })
	}, [props.checkoutGateways])

	// legacy useState code
	const [isOnlineOrderModalVisible, setModalVisibility] = useState(false)

	const navigateToOrder = () => {
		if (!props.isOnline)
			return setState({ ...state, messageType: messageTypes.OFFLINE, isBottomMessageModalVisible: true })

		const isCatalogActivated = store.catalog && store.catalog.active
		const isOnlineOrdersAllowed = store.catalog && store.catalog.onlineOrdersAllowed

		if (!isCatalogActivated) return navigate('OnlineCatalog')

		if (isCatalogActivated && !isOnlineOrdersAllowed) {
			return setModalVisibility(true)
		}

		navigate('CatalogOrderPayments')
	}

	const navigateToPixDataConfig = () => {
		const hasCatalog = Boolean(store?.catalog)
		if (!hasCatalog) return setState({ ...state, showNeedCatalogModal: true })
		if(!isBetaActive) return setState({ ...state, showNeedNewCatalogModal: true })
		logEvent("Pix QR Code Config Click", { where: "settings" })
		navigate('PixDataConfig')
	}

	const updateToNewCatalog = () => { 
		setState({ ...state, showNeedNewCatalogModal: false })
		const updatedStore = {
			...store,
			catalog: { ...catalog, version: NEW_CATALOG_VERSION }
		}
		storeAccountSave(updatedStore, (e) => {
			if (e) return
			logEvent("Pix QR Code Config Click", { where: "settings" })
			navigate('PixDataConfig')
		})
	}

	const goToOnlinePayments = () => {
		if (!props.isOnline)
			return setState({ ...state, messageType: messageTypes.OFFLINE, isBottomMessageModalVisible: true })

		const gateway = props.onlinePaymentsCountryCode !== 'BR' ? STRIPE_CONNECT_TYPE : MERCADO_PAGO_ONLINE_TYPE

		if (!!props.onlinePaymentsCountryCode && state.isOnlinePaymentActive) {
			props.startLoading()
			return getGatewayCountryFees(gateway, props.onlinePaymentsCountryCode)
				.then((countryFees) => {
					props.setCountryFees(countryFees)
					props.stopLoading()
					navigation.navigate(pageConfigToGo, {
						type: LINK_SERVICE_TYPE,
						gateway,
						origin: 'CatalogConfig',
					})
				})
				.catch(() => props.stopLoading())
		}

		if (!!state.countries && state.countries.length <= 0) {
			props.startLoading()
			return kyteAccountGetCountries(I18n.t('locale')).then((countries) => {
				const filteredCountries = countries.data.filter((c) => c.dialCode && c.name)
				const orderedCountries = _.orderBy(filteredCountries, ['name'], ['asc'])
				setState({ ...state, countries: orderedCountries, isCountrySelectorVisible: true })
				logEvent('Payment Integration Country View')
				props.stopLoading()
			})
		}
		logEvent('Payment Integration Country View')
		setState({ ...state, isCountrySelectorVisible: true })
	}

	const renderBottomMessageModal = () => {
		const generateOfflineMessage = () => ({
			title: Strings.OFFLINE_MESSAGE_TITLE,
			actionText: Strings.OFFLINE_MESSAGE_MESSAGE,
		})
		const generateCountryNotAllowed = () => ({
			title: Strings.SERVICE_NOT_AVAILABLE_IN_COUNTRY.replace('$x', state.selectedCountry.name),
			actionText: Strings.CHANGE_COUNTRY,
			actionTextOnPress: () => {
				setState({ ...state, isBottomMessageModalVisible: false, isCountrySelectorVisible: true }),
				logEvent('Payment Integration Country View')
			},
			image: ServiceNotAvailable,
		})

		const selectedMessage =
			state.messageType === messageTypes.OFFLINE ? generateOfflineMessage() : generateCountryNotAllowed()
		return (
			<BottomMessageModal
				image={selectedMessage.image || null}
				title={selectedMessage.title}
				actionText={selectedMessage.actionText || null}
				actionTextOnPress={selectedMessage.actionTextOnPress || null}
				actionButtonText={Strings.ACTION_BUTTON_TEXT}
				actionButtonOnPress={() => setState({ ...state, isBottomMessageModalVisible: false })}
				onSwipeComplete={() => setState({ ...state, isBottomMessageModalVisible: false })}
				hideSeePlansButton
			/>
		)
	}

	const getGatewayCountryFees = (gateway, countryCode) =>
		new Promise((resolve, reject) => {
			kyteAccountGatewayGetCountryFees(gateway, countryCode)
				.then((fees) => {
					const countryFees = fees.data
					if (countryFees.length <= 0) return reject({ type: messageTypes.COUNTRY_NOT_ALLOWED })
					resolve(countryFees[0])
				})
				.catch((error) => reject({ type: 'general-error', error }))
		})

	const handleCountrySelected = (country) => {
		const gateway = country.code !== 'BR' ? STRIPE_CONNECT_TYPE : MERCADO_PAGO_ONLINE_TYPE
		setState({ ...state, isCountrySelectorVisible: false })
		props.startLoading()
		getGatewayCountryFees(gateway, country.code)
			.then((fees) => {
				setState({ ...state, isCountrySelectorVisible: false, selectedCountry: country })
				logEvent('Payment Integration Country Select', { where: 'payment link' })
				props.preferenceSetOnlinePaymentsCountryCode(country.code, () => {
					props.setCountryFees(fees)
					props.stopLoading()
					navigation.navigate('ConfigOnlinePaymentsWizard', {
						type: 'link',
						gateway: country.code !== 'BR' ? STRIPE_CONNECT_TYPE : MERCADO_PAGO_ONLINE_TYPE,
						origin: 'IntegratedPaymentsConfig',
					})
				})
			})
			.catch((error) => {
				props.stopLoading()
				if (error.type === messageTypes.COUNTRY_NOT_ALLOWED) {
					return setState({
						...state,
						messageType: messageTypes.COUNTRY_NOT_ALLOWED,
						isCountrySelectorVisible: false,
						isBottomMessageModalVisible: true,
						selectedCountry: country,
					})
				}
			})
	}

	const savePayLater = () => {
		const isToPayLater = !state.isPayLaterEnabled
		const eventName = isToPayLater ? 'EnablePayLater' : 'DisablePayLater'

		logEvent('ConfigPayLater', { type: eventName })
		setState({ ...state, isPayLaterEnabled: isToPayLater })
		props.preferenceSetStorePayLater(isToPayLater)
	}

	const toggleAllowStorePayLater = () => {
		if (!checkUserPermission(userPermissions).allowCustomerInDebt) {
			Alert.alert(Strings.RESTRICTED_ACCESS, Strings.ALLOW_STORE_PAYLATER_RESTRICTED_ACCESS)
		} else {
			savePayLater()
		}
	}

	const renderCountrySelector = () => (
		<KyteModal
			height="100%"
			fullPage
			fullPageTitle={I18n.t('storeAccountCountryPlaceholder')}
			hideFullPage={() => setState({ ...state, isCountrySelectorVisible: false })}
			hideOnBack
			isModalVisible
		>
			<KyteCountrySelector onPress={(item) => handleCountrySelected(item)} data={state.countries} />
		</KyteModal>
	)
	
	const { isAdmin } = checkUserPermission(userPermissions)
	const { cardServiceConfig } = props
	const hasConfiguredCardService = cardServiceConfig
	const isCardServiceConfigCustomized = checkIsCardServiceCustomized(cardServiceConfig)
	const isBRAndUseBRL = getIsBRAndUseBRL(currency)
	const items = [
		{
			title: Strings.ONLINE_PAYMENTS,
			subtitle: Strings.ONLINE_PAYMENTS_SUBTITLE,
			onPress: () => navigateToOrder(),
			leftIcon: {
				icon: 'cart',
				color: colors.secondaryBg,
			},
			hideItem: !isAdmin || (isAdmin && isTryingToConfigLink),
		},
		{
			title: Strings.PIX_DATA_CONFIG,
			onPress: () => navigateToPixDataConfig(),
			leftIcon: {
				icon: 'pix',
				color: colors.secondaryBg,
			},
			hideItem: !isAdmin || !isBRAndUseBRL,
			tagNew: {
				isFromNewCatalog: !isBetaActive && catalog,
			},
			rightSideContent: isBetaActive ? StatusToggle(store?.pix?.enabled) : null,	
			hideChevron: isBetaActive,
		},
		{
			title: Strings.LINK_PAYMENTS,
			subtitle: Strings.LINK_PAYMENTS_SUBTITLE,
			onPress: () => goToOnlinePayments(),
			leftIcon: {
				icon: 'link',
				color: colors.secondaryBg,
			},
			hideItem: !isAdmin,
		},
		{
			title: Strings.CARD_READERS,
			subtitle: Strings.CARD_READERS_SUBTITLE,
			onPress: () => navigate('StorePaymentContainer'),
			leftIcon: {
				icon: 'machine',
				color: colors.secondaryBg,
			},
			hideItem: isTryingToConfigLink || !isBRAndUseBRL,
		},
		{
			title: Strings.ALLOW_STORE_PAYLATER_TITLE,
			onPress: () => toggleAllowStorePayLater(),
			leftIcon: {
				icon: 'dollar-buddy',
				color: colors.secondaryBg,
			},
			hideChevron: true,
			rightSideContent: (
				<SwitchContainer style={styles.switchContainer} onPress={() => toggleAllowStorePayLater()}>
					<KyteSwitch onValueChange={() => toggleAllowStorePayLater()} active={state.isPayLaterEnabled} />
				</SwitchContainer>
			),
		},
		{
			title: Strings.DEADLINE_AND_FEES,
			onPress: () => navigate('ConfigCardService'),
			tagNew: !hasConfiguredCardService,
			leftIcon: {
				icon: 'percent',
				color: colors.secondaryBg,
			},
			hideChevron: true,
			rightSideContent: StatusToggle(isCardServiceConfigCustomized),
		},
	]

	return (
		<DetailPage pageTitle={Strings.PAGE_TITLE} goBack={goBack}>
			<ListOptions items={items} />
			{isOnlineOrderModalVisible ? <MessageModal hideModal={() => setModalVisibility(false)} isModalVisible /> : null}
			{state.isBottomMessageModalVisible ? renderBottomMessageModal() : null}
			{state.isCountrySelectorVisible ? renderCountrySelector() : null}
			{props.isLoaderVisible ? <LoadingCleanScreen /> : null}
			<NeedConfigureCatalogModal
				imgStyles={{ width: 210, height: 210 }}
				image={NeedCatalogModal}
				isVisible={state.showNeedCatalogModal}
				hideModal={() => setState({ ...state, showNeedCatalogModal: false })}
				subtitle={Strings.PIX_DATA_CONFIG_NEED_CATALOG_SUB}
			/>
			<ActivateCatalogBetaModal
				hideModal={() => setState({ ...state, showNeedNewCatalogModal: false })}
				onPress={updateToNewCatalog}
				isVisible={state.showNeedNewCatalogModal}
				image={ActiveBetaModalPixConfig}
				imgStyles={{ width: 276, height: 210 }}
				subtitle={Strings.PIX_DATA_CONFIG_NEED_NEW_CATALOG_SUB}
			/>
		</DetailPage>
	)
}

const styles = {
	switchContainer: {
		paddingHorizontal: 0,
	},
}

const mapStateToProps = ({ auth, common, preference }) => ({
	userPermissions: auth.user.permissions,
	store: auth.store,
	catalog: auth.store.catalog,
	checkoutGateways: auth.store.checkoutGateways || [],
	isOnline: common.isOnline,
	onlinePaymentsCountryCode: preference.account.onlinePaymentsCountryCode || null,
	isLoaderVisible: common.loader.visible,
	allowPayLater: !!preference.account.allowPayLater,
	cardServiceConfig: preference?.account.cardService,
	currency: preference.account.currency,
})

const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators(
		{
			startLoading,
			stopLoading,
			preferenceSetOnlinePaymentsCountryCode,
			setCountryFees,
			preferenceSetStorePayLater,
			storeAccountSave
		},
		dispatch
	),
})

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(ConfigIntegratedPayments))
