import React, { Component } from 'react'
import { Dimensions, Alert, ScrollView } from 'react-native'
import { connect } from 'react-redux'
import NavigationService from '../../services/kyte-navigation'

import { scaffolding, colors } from '../../styles'
import { KyteToolbar, ListOptions, KyteSafeAreaView } from '../common'
import { checkUserReachedLimit, updateshareCatalogModalVisible, checkPlanKeys } from '../../stores/actions'
import { checkUserPermission, checkDeviceConnection } from '../../util'
import I18n from '../../i18n/i18n'
import { Features } from '../../enums'
import BottomMessageModal from '../common/BottomMessageModal'
import { logEvent } from '../../integrations'

const Strings = {
	INTEGRATED_PAYMENTS: I18n.t('integratedPayments.title'),
	STORE_PREFERENCES: I18n.t('configMenus.storePreferences'),
	STORE_INFO: I18n.t('configMenus.storeInfo'),
	REPORT_EXPORT: I18n.t('configMenus.reportExport'),
	CATALOG_ONLINE: I18n.t('sideMenu.onlineCatalog'),
	ORDERS_AND_SALES: I18n.t('configMenus.ordersAndSales'),
	SOCIALMEDIA_INTEGRATION: I18n.t('socialMediaIntegrationPageTitle'),
	SOCIALMEDIA_INTEGRATION_SUBTITLE: I18n.t('socialMediaListOptionSubtitle'),
	MY_RECEIPT: I18n.t('ConfigReceiptLabel'),
	SHIPPING_FEES: I18n.t('ShippingFees.PageTitle'),
	PRODUCT_CATEGORIES: I18n.t('productsTabProductsLabel'),
	PRODUCT_CATEGORIES_SUBTITLE: I18n.t('product.productCategoriesAndVariations'),
}

const generateSocialMediaOptionItem = (onPress, hideItem = false) => ({
	title: Strings.SOCIALMEDIA_INTEGRATION,
	subtitle: Strings.SOCIALMEDIA_INTEGRATION_SUBTITLE,
	onPress,
	hideItem,
	leftIcon: { icon: 'integrate', color: colors.secondaryBg },
	badge: I18n.t('words.s.new'),
	billingList: true,
	containerStyle: {
		height: 70,
	},
})

class ConfigContainer extends Component {
	static navigationOptions = () => ({
		header: null,
	})

	constructor(props) {
		super(props)

		this.state = {
			isPrintersAllowed: false,
			isTaxesAllowed: false,
			isBluetoothActive: false,
			isBottomMessageModalVisible: false,
		}
	}

	componentDidMount() {
		this.checkKeys()
		logEvent('Config View')
	}

	async checkKeys() {
		const taxesKey = Features.items[Features.TAXES].key

		if (await this.props.checkPlanKeys(taxesKey)) this.setState({ isTaxesAllowed: true })
	}

	async validateConnection(route = 'StorePreferences') {
		const { navigation } = this.props
		const { navigate } = navigation
		const getConnectionInfo = await checkDeviceConnection()
		const { user } = this.props

		if (!getConnectionInfo) {
			return this.offlineAlert()
		}

		if (route === 'StoreCatalogCode' && !user.authVerified) {
			NavigationService.navigate('Confirmation', 'SendCode', {
				origin: 'user-blocked',
				previousScreen: 'CurrentSale',
			})
			return
		}
		navigate({ key: `${route}Page`, name: route })
	}

	configShareCatalog() {
		const { props } = this
		const { isOnline } = props
		const { permissions } = props.user
		const { navigation } = props
		const hasPermission = checkUserPermission(permissions).isAdmin || checkUserPermission(permissions).isOwner

		if (!isOnline) return this.offlineAlert()

		if (hasPermission) {
			navigation.navigate('OnlineCatalogStack')
		} else {
			Alert.alert(I18n.t('words.s.attention'), I18n.t('catalogWithoutPermission'))
		}
	}

	goToTaxes() {
		const { navigate } = this.props.navigation
		const { isOnline } = this.props

		if (!isOnline) return this.offlineAlert()
		navigate({ key: 'TaxesPage', name: 'Taxes' })
	}

	goToShippingFees() {
		const { isOnline, navigation } = this.props
		const { navigate } = navigation

		if (!isOnline) return this.offlineAlert()
		navigate({ key: 'ShippingFeesPage', name: 'ShippingFees' })
	}

	goToExportReports() {
		const { isOnline, navigation } = this.props
		const { navigate } = navigation

		if (!isOnline) return this.offlineAlert()
		return navigate({ key: 'DataExportPage', name: 'DataExport' })
	}

	offlineAlert() {
		this.setState({ isBottomMessageModalVisible: true })
	}

	goToSocialMediaIntegration() {
		const { navigation } = this.props
		const { navigate } = navigation

		navigate('SocialMediaIntegration', { key: 'SocialMediaIntegrationPage' })
	}

	renderBottomMessageModal() {
		const offlineMessage = {
			title: I18n.t('customersOfflineWarningTitle'),
			actionText: I18n.t('words.m.noInternet'),
			buttonText: I18n.t('alertOk'),
		}

		return (
			<BottomMessageModal
				title={offlineMessage.title}
				actionText={offlineMessage.actionText || null}
				actionButtonText={offlineMessage.buttonText || 'Ok'}
				actionButtonOnPress={() => this.setState({ isBottomMessageModalVisible: false })}
				onSwipeComplete={() => this.setState({ isBottomMessageModalVisible: false })}
			/>
		)
	}

	renderPageMenus() {
		const { navigate } = this.props.navigation
		const { userPermissions, isOnline } = this.props
		const { isTaxesAllowed } = this.state
		const isAdmin = checkUserPermission(userPermissions).isAdmin

		const makeNavigation = ({ key, name }) => {
			if (!isOnline) return this.offlineAlert()

			navigate({ key, name })
		}

		const navigateToStoreInfo = () => {
			makeNavigation({ key: 'CatalogStoreFromIndex', name: 'CatalogStore' })
		}

		const navigateToConfigReceipt = () => {
			makeNavigation({ key: 'ConfigReceiptPage', name: 'ConfigReceipt' })
		}

		const navigateToProductCategories = () => {
			makeNavigation({ key: 'ProductConfigPageIndex', name: 'ProductConfigPage' })
		}

		const pages = [
			{
				title: Strings.STORE_PREFERENCES,
				onPress: () => this.validateConnection(),
				hideItem: !isAdmin,
				leftIcon: { icon: 'cog', color: colors.secondaryBg },
			},
			{
				title: Strings.STORE_INFO,
				onPress: () => navigateToStoreInfo(),
				hideItem: !isAdmin,
				leftIcon: { icon: 'store', color: colors.secondaryBg },
			},
			{
				title: Strings.PRODUCT_CATEGORIES,
				onPress: () => navigateToProductCategories(),
				hideItem: !isAdmin,
				leftIcon: { icon: 'products', color: colors.secondaryBg },
				subtitle: Strings.PRODUCT_CATEGORIES_SUBTITLE,
				tagNew: true,
				billingList: true,
				containerStyle: {
					height: 70,
				},
			},
			{
				title: Strings.CATALOG_ONLINE,
				onPress: () => this.configShareCatalog(),
				leftIcon: { icon: 'cart', color: colors.secondaryBg },
				hideItem: !isAdmin,
			}, // badge: I18n.t('words.s.new')
			{
				title: Strings.MY_RECEIPT,
				onPress: () => navigateToConfigReceipt(),
				leftIcon: { icon: 'receipt-complete', color: colors.secondaryBg },
			},
			{
				title: Strings.INTEGRATED_PAYMENTS,
				onPress: () => navigate('ConfigIntegratedPayments'),
				leftIcon: { icon: 'dollar-sign', color: colors.secondaryBg },
			},
			{
				title: Strings.ORDERS_AND_SALES,
				onPress: () => this.goToTaxes(),
				proLabel: !isTaxesAllowed,
				leftIcon: { icon: 'percent', color: colors.secondaryBg },
				hideItem: !isAdmin,
			},
			{
				title: Strings.SHIPPING_FEES,
				onPress: () => this.goToShippingFees(),
				leftIcon: { icon: 'box-stock', color: colors.secondaryBg },
				badge: I18n.t('words.s.new'),
				hideItem: !isAdmin,
			},
			{
				title: Strings.REPORT_EXPORT,
				onPress: () => this.goToExportReports(),
				hideItem: !isAdmin,
				leftIcon: { icon: 'export', color: colors.secondaryBg },
			},
			generateSocialMediaOptionItem(this.goToSocialMediaIntegration.bind(this), !isAdmin),
		]

		return <ListOptions items={pages} />
	}

	render() {
		const { navigation } = this.props
		const { navigate } = navigation
		const { isBottomMessageModalVisible } = this.state
		const { outerContainer } = scaffolding
		const { topContainer } = styles

		return (
			<KyteSafeAreaView style={outerContainer}>
				<KyteToolbar
					borderBottom={1.5}
					headerTitle={I18n.t('configPageTitle')}
					navigate={navigate}
					navigation={navigation}
				/>
				<ScrollView style={topContainer}>{this.renderPageMenus()}</ScrollView>
				{isBottomMessageModalVisible ? this.renderBottomMessageModal() : null}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	topContainer: {
		flex: 1,
		backgroundColor: colors.drawerIcon,
	},
	svgImage: {
		resizeMode: 'contain',
		width: Dimensions.get('window').width * 0.6,
		height: Dimensions.get('window').height * 0.6,
	},
}

const mapStateToProps = (state) => ({
	printer: state.printer,
	currency: state.preference.account.currency,
	userPermissions: state.auth.user.permissions,
	user: state.auth.user,
	isOnline: state.common.isOnline,
})

export default connect(mapStateToProps, {
	checkUserReachedLimit,
	updateshareCatalogModalVisible,
	checkPlanKeys,
})(ConfigContainer)
export { generateSocialMediaOptionItem }
