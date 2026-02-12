import React from 'react'
import { connect } from 'react-redux'
import { KytePro, KyteSwitch, Row, isFree } from '@kyteapp/kyte-ui-components'
import Share from 'react-native-share'
import { View, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native'
import { CUTOFF_DATE_HIDDEN_CATALOG_V2, getDateIsOnOrAfterCutoff } from '@kyteapp/kyte-utils'
import { DetailPage, KyteText, KyteIcon, LoadingCleanScreen, ActionButton, Tip, Tag, KyteTagNew } from '../../common'
import { storeAccountSave, hasCatalog, openModalWebview, preferenceAddCoreAction } from '../../../stores/actions'
import { CoreAction } from '../../../enums/Subscription.ts'
import {
	kyteCatalogDomain,
	generateDefaultPROFeatures,
	getPROFeature,
	checkUserPermission,
	isBetaCatalog,
	NEW_CATALOG_VERSION,
} from '../../../util'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'
import ActivateCatalogBetaModal from '../../common/modals/ActivateCatalogBetaModal'
import { CouponModalNewCatalog } from '../../../../assets/images/coupons/coupon-modal-new-catalog'

const Strings = {
	PAGE_TITLE: I18n.t('sideMenu.onlineCatalog'),
	LABEL_CATALOG_STORE: I18n.t('configMenus.storeInfo'),
	LABEL_CATALOG_THEME: I18n.t('catalogSelectTheme'),
	LABEL_CATALOG_LAYOUT: I18n.t('catalogSelectLayout'),
	LABEL_CATALOG_ORDER: I18n.t('catalogOrderAndOthers'),
	LABEL_CATALOG_SOCIAL_NETWORK_OTHERS: I18n.t('catalogSocialNetworkAndOthers'),
	CATALOG_ON: I18n.t('words.s.on').toUpperCase(),
	CATALOG_OFF: I18n.t('words.s.off').toUpperCase(),
	LABEL_PUBLISH_CATALOG: I18n.t('catalogBarPublishCatalog'),
	LABEL_PREVIEW_CATALOG_BUTTON: I18n.t('catalogBarOpenInNavigator'),
	LABEL_SHARE_BUTTON: I18n.t('catalogBarShareCatalog'),
	LABEL_ID: I18n.t('IdentificationLabel'),

	LABEL_CATALOG_VERSION: I18n.t('catalogMenus.version.label'),
	DESCRIPTION_CATALOG_VERSION: I18n.t('catalogMenus.version.description'),
	CATALOG_NEW_VERSION: I18n.t('catalogMenus.version.newVersion'),
	CATALOG_CLASSIC_VERSION: I18n.t('catalogMenus.version.classicVersion'),
}

class CatalogConfigIndex extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			isLoading: false,
			showOriginCouponModal: false,
			flagPro: {
				onlineOrders: generateDefaultPROFeatures('PROOnlineOrders').PROOnlineOrders,
			},
		}
	}

	async componentDidMount() {
		logEvent('Catalog Config View')
		this.setState({
			flagPro: {
				onlineOrders: await getPROFeature('PROOnlineOrders'),
			},
		})

		if (this.props.route?.params?.origin === 'coupon') {
			this.setState({ showOriginCouponModal: true })
		}
	}

	navigateTo(name) {
		this.props.navigation.navigate({
			name,
			key: `${name}FromIndex`,
		})
	}

	updatePublishCatalog() {
		const { authStore } = this.props
		this.setState({ isLoading: true })

		const catalog = {
			...authStore.catalog,
			active: authStore.catalog ? !authStore.catalog.active : true,
		}
		this.props.storeAccountSave({ ...authStore, catalog }, () => this.setState({ isLoading: false }))
	}

	generateCatalogUrl() {
		const { urlFriendly = '' } = this.props.authStore
		return `https://${urlFriendly}${kyteCatalogDomain}`
	}

	openCatalogUrl() {
		const url = this.generateCatalogUrl()
		logEvent('Catalog Open Click')
		Linking.openURL(url)
	}

	shareCatalogUrl() {
		const url = this.generateCatalogUrl()
		logEvent('Catalog Share')
		if (Platform.OS === 'ios') {
			Share.open({ url }).then(() => {
				this.props.preferenceAddCoreAction(CoreAction.ShareCatalog)
			})
			return
		}
		this.props.preferenceAddCoreAction(CoreAction.ShareCatalog)
		Share.open({ url })
	}

	renderItemLabel({ label, renderExtraInfo, onPress, isPaid = false, isNew = false }) {
		const Component = onPress ? TouchableOpacity : View

		return (
			<Component style={{ flex: 1 }} onPress={onPress}>
				<Row alignItems="center">
					<KyteText pallete="primaryDarker" size={styles.labelTextSize} weight="Semibold">
						{label}
					</KyteText>
					{isNew && <KyteTagNew style={{ marginLeft: 8 }} />}
					{isPaid && <Tag style={{ marginLeft: 8, borderRadius: 10 }} info="PRO" onPress={onPress} />}
				</Row>

				{renderExtraInfo ? renderExtraInfo() : null}
			</Component>
		)
	}

	renderListItem(item) {
		const { billing } = this.props
		const isPaid = item?.feature?.isPaid && isFree(billing)

		const renderOnoff = (isFree) => {
			const tagProActive = item?.feature?.isPaid && isFree

			return (
				<KyteText
					pallete={item.on && !tagProActive ? 'actionColor' : 'grayBlue'}
					size={styles.labelTextSize - 2}
					weight="Medium"
				>
					{item.on && !tagProActive ? Strings.CATALOG_ON : Strings.CATALOG_OFF}
				</KyteText>
			)
		}

		const renderCatalogOnLabel = () => (
			<KytePro component={(isFree) => renderOnoff(isFree)} billing={billing} feature={item.feature || {}} />
		)

		const renderExtraInfo = () =>
			item.text ? (
				<KyteText lineHeight={16.5} marginTop={4}>
					{item.text}
				</KyteText>
			) : null

		const renderVersion = (isBeta) => (
			<KyteText pallete="grayBlue" size={styles.labelTextSize - 2} weight="Medium" style={{ marginLeft: 20 }}>
				{isBeta ? Strings.CATALOG_NEW_VERSION : Strings.CATALOG_CLASSIC_VERSION}
			</KyteText>
		)

		return (
			<TouchableOpacity onPress={() => this.navigateTo(item.name)} style={styles.itemContainer} key={Math.random(100)}>
				{this.renderItemLabel({
					label: item.label,
					renderExtraInfo,
					isPaid,
					onPress: () => this.navigateTo(item.name),
					isNew: item.isNew,
				})}
				{item.on !== undefined && renderCatalogOnLabel()}
				{item.isBeta !== undefined && renderVersion(item.isBeta)}
				<KyteIcon name="arrow-cart" size={10} style={{ marginLeft: 20 }} />
			</TouchableOpacity>
		)
	}

	renderItems() {
		const { catalog, dateCreation } = this.props.authStore
		const onlineOrdersAllowed = catalog ? catalog.onlineOrdersAllowed : false
		const isBeta = isBetaCatalog(catalog?.version)
		const isNewStore = getDateIsOnOrAfterCutoff(dateCreation, CUTOFF_DATE_HIDDEN_CATALOG_V2)

		const items = [
			{ label: Strings.LABEL_CATALOG_STORE, name: 'CatalogStore' },
			{ label: Strings.LABEL_ID, name: 'CatalogLegalId' },
			{ label: Strings.LABEL_CATALOG_THEME, name: 'CatalogTheme' },
			{
				label: Strings.LABEL_CATALOG_ORDER,
				name: 'CatalogOnlineOrders',
				on: onlineOrdersAllowed,
				feature: this.state.flagPro.onlineOrders,
			},
			{ label: Strings.LABEL_CATALOG_SOCIAL_NETWORK_OTHERS, name: 'CatalogSocialNetwork' },
		]

		if (!isNewStore) {
			items.unshift({ 
				label: Strings.LABEL_CATALOG_VERSION, 
				text: Strings.DESCRIPTION_CATALOG_VERSION, 
				name: 'CatalogVersion', 
				isBeta, 
				isNew: !isBeta
			})
		}

		return <View>{items.map(this.renderListItem.bind(this))}</View>
	}

	renderPublishCatalogSwitch() {
		const { catalog = {}, urlFriendly } = this.props.authStore
		const { navigate } = this.props.navigation

		const editPress = () => navigate({ name: 'CatalogUrlFriendly', key: 'CatalogUrlFriendlyFromIndex' })
		const renderUrlCustomLabel = () => (
			<View style={{ flexDirection: 'row', marginTop: 3 }}>
				<KyteText size={12}>{`${urlFriendly}${kyteCatalogDomain}  `}</KyteText>
				<KyteText size={12} weight="Medium" pallete="actionDarkColor">
					{I18n.t('words.s.edit').toLowerCase()}
				</KyteText>
			</View>
		)

		return (
			<View style={styles.itemContainer}>
				{this.renderItemLabel({
					label: Strings.LABEL_PUBLISH_CATALOG,
					renderExtraInfo: renderUrlCustomLabel,
					onPress: editPress,
				})}
				<KyteSwitch onValueChange={this.updatePublishCatalog.bind(this)} active={!!catalog.active} />
			</View>
		)
	}

	renderBottomButtons() {
		const { urlFriendly = false } = this.props.authStore

		const renderPreviewButton = () => (
			<ActionButton onPress={this.openCatalogUrl.bind(this)} disabled={!urlFriendly} cancel noDisabledAlert>
				{Strings.LABEL_PREVIEW_CATALOG_BUTTON}
			</ActionButton>
		)

		const renderShareButton = () => (
			<ActionButton
				onPress={this.shareCatalogUrl.bind(this)}
				disabled={!urlFriendly}
				noDisabledAlert
				style={{ marginTop: 10 }}
			>
				{Strings.LABEL_SHARE_BUTTON}
			</ActionButton>
		)

		return (
			<View style={{ paddingVertical: 15 }}>
				{renderPreviewButton()}
				{renderShareButton()}
			</View>
		)
	}

	renderCatalogImage() {
		return <Tip text="" image="CatalogMobileDesktop" type={1} />
	}

	renderContentConfig() {
		return (
			<ScrollView>
				{this.renderPublishCatalogSwitch()}
				{this.renderItems()}
			</ScrollView>
		)
	}

	handleConfirmModal() {
		const { catalog = {} } = this.props.authStore
		const store = {
			...this.props.authStore, 
			catalog: { ...catalog, version: NEW_CATALOG_VERSION }
		}
		const itHasCoupon = this.props.promotions.length > 0

		this.props.storeAccountSave(store, () => {
			this.setState({ showOriginCouponModal: false })
				this.props.navigation.navigate(itHasCoupon ? "CouponsTypeChoice" : "CouponsOnBoarding")
			}
		)
	}

	render() {
		const { isLoading } = this.state
		const { navigation, userPermissions, route } = this.props
		const { isDrawerNavigation } = route.params
		const { catalog = {} } = this.props.authStore
		const { isAdmin } = checkUserPermission(userPermissions)

		const navigationProps =
			navigation.canGoBack() && !isDrawerNavigation
				? {
						goBack: () => navigation.goBack(),
				  }
				: {
						navigation,
						navigate: navigation.navigate,
						outerPage: true,
				  }

		return (
			<DetailPage pageTitle={Strings.PAGE_TITLE} {...navigationProps}>
				{isAdmin ? this.renderContentConfig() : this.renderCatalogImage()}
				{catalog.active ? this.renderBottomButtons() : null}
				{isLoading ? <LoadingCleanScreen /> : false}
				<ActivateCatalogBetaModal
					isVisible={this.state.showOriginCouponModal}
					hideModal={() => this.setState({ showOriginCouponModal: false })}
					image={CouponModalNewCatalog}
					imgStyles={{ width: 210, height: 210 }}
					subtitle="coupons.newCatalogSubtitleModal"
					onPress={this.handleConfirmModal.bind(this)}
				/>
			</DetailPage>
		)
	}
}

const styles = {
	itemContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderlight,
	},
	labelTextSize: 16,
}

export default connect(
	(state) => ({
		authStore: state.auth.store,
		catalog: state.auth.store.catalog,
		userPermissions: state.auth.user.permissions,
		billing: state.billing,
		promotions: state.auth.promotions,
	}),
	{ storeAccountSave, hasCatalog, openModalWebview, preferenceAddCoreAction }
)(CatalogConfigIndex)
