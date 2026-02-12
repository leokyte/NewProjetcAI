import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
	View,
	ScrollView,
	Text,
	Alert,
	Dimensions,
	Linking,
	TouchableOpacity,
	Animated,
	Image,
	ActivityIndicator,
} from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { TabView, SceneMap } from 'react-native-tab-view'
import { CheckBox, Icon } from 'react-native-elements'
import moment from 'moment/min/moment-with-locales'
import _ from 'lodash'
import { Padding, Viewports, Margin, Row, isFree } from '@kyteapp/kyte-ui-components'
import { useNavigation } from '@react-navigation/native'
import Share from 'react-native-share'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import NavigationService from '../../services/kyte-navigation'

import { logEvent } from '../../integrations'
import {
	saleCancel,
	saleUpdate,
	saleDetail,
	customerFetchById,
	checkUserReachedLimit,
	currentSaleSetOpenedSale,
	currentSaleSetStatus,
	checkoutEditionMode,
	checkPlanKeys,
	checkFeatureIsAllowed,
	startToast,
	setCommon,
	salesSetFilter,
	ordersSetFilter,
	customerDetailUpdate,
	customersClear,
	salesClear,
	salesClearFilter,
	ordersClearFilter,
	salesUpdateListItem,
	setIsCancellingSale,
	changeApiError,
	storeAccountSave,
} from '../../stores/actions'

import { scaffolding, colors, colorSet, Type, tabStyle } from '../../styles'
import {
	ActionButton,
	KyteIcon,
	KyteText,
	CurrencyText,
	KyteToolbar,
	KyteModal,
	KyteButton,
	ListOptions,
	OrderTransition,
	KyteSafeAreaView,
	TextButton,
	ToolbarCustomer,
	GatewayLogo,
	CenterContent,
	KyteSwipeButton,
	InsufficientStockModal,
	KyteTabBar,
} from '../common'
import DetailItems from './sale-detail/DetailItems'
import DetailObservation from './sale-detail/DetailObservation'
import DetailPayments from './sale-detail/DetailPayments'
import DetailCustomer from './sale-detail/DetailCustomer'
import {
	PaymentType,
	PaymentGatewayType,
	SaleOrigin,
	Features,
	OrderStatus,
	Breakpoints,
	ORDER_STATUS_CLOSED,
} from '../../enums'
import I18n from '../../i18n/i18n'
import {
	checkUserPermission,
	checkSaleConfirmed,
	checkSalePaid,
	checkSaleAwaitingPayment,
	capitalizeFirstLetterOfString,
	isAndroid,
	cloneSale,
	trackSalePropsEvent,
	isBetaCatalog,
	NEW_CATALOG_VERSION,
	kyteCatalogDomain,
	statusNames,
} from '../../util'
import { fetchOneByID, CUSTOMER, SALE, checkSyncProductStock } from '../../repository'
import StatusSelector from './StatusSelector'
import StatusList from './StatusList'
import { CancelTransaction } from '../../../assets/images'
import { SalesTypeEnum } from '../../enums/SaleSort'
import NoConnectionModal from '../common/modals/NoConnectionModal'
import ApiGenericErrorModal from '../common/modals/ApiGenericErrorModal'
import { renderBoldText } from '../../util/util-render'
import NeedConfigureCatalogModal from '../common/modals/NeedConfigureCatalogModal'
import ActivateCatalogBetaModal from '../common/modals/ActivateCatalogBetaModal'
import { ShareOrderCatalogModal } from '../../../assets/images/catalog/order-status-catalog-modal'
import { NeedCatalogModal } from '../../../assets/images/catalog/need-catalog-modal'
import PixConfirmArea from './auxiliary-components/PixConfirmArea'
import KyteNotifications from '../common/KyteNotifications'

const SCREEN_HEIGHT = Dimensions.get('window').height
const initialLayout = { width: Dimensions.get('window').width }

const statusPaid = OrderStatus.items[OrderStatus.PAID]

const SaleDetail = ({ ...props }) => {
	const { sale, salesGroup, ordersGroup, isLoading, store, storeAccountSave } = props
	const isOpened = sale.status === statusNames.OPENED
	const dateType = sale.status !== ORDER_STATUS_CLOSED ? 'dateCreation' : 'dateClosed'
	const date = moment(sale[dateType]).format('L')
	const time = moment(sale[dateType]).format('LT')
	const gateway = PaymentGatewayType
	const navigation = useNavigation()
	const hasCatalog = Boolean(store?.catalog)

	const noCustomerTabs = [
		{ key: '1', title: I18n.t('saleTabItemsLabel').toUpperCase() },
		{ key: '2', title: I18n.t('words.p.details').toUpperCase() },
	]
	const customerTabs = [
		{ key: '1', title: I18n.t('saleTabItemsLabel').toUpperCase() },
		{ key: '2', title: I18n.t('words.p.details').toUpperCase() },
		{ key: '3', title: I18n.t('words.s.customer').toUpperCase() },
		// { key: '3', title: (SMALL_SCREENS) ? `${I18n.t('saleTabObservationLabel').substring(0, 3)}.` : I18n.t('saleTabObservationLabel').toUpperCase() }
	]

	const [index, setIndex] = useState(0)
	const routes = sale.customer ? customerTabs : noCustomerTabs
	const [isMPOnlineModalVisible, setIsMPOnlineModalVisible] = useState(false)
	const [isOptionsVisible, setIsOptionsVisible] = useState(false)
	const [showObservationModal, setShowObservationModal] = useState(false)
	const [isTransitionVisible, setIsTransitionVisible] = useState(false)
	const [openedTransitionOpacity, setOpenedTransitionOpacity] = useState(new Animated.Value(isOpened ? 1 : 0))
	const [confirmedTransitionOpacity, setConfirmedTransitionOpacity] = useState(new Animated.Value(isOpened ? 0 : 1))
	const [isStatusListVisible, setIsStatusListVisible] = useState(false)
	const [showModalNoConnection, setShowModalNoConnection] = useState(false)
	const [showActiveBetaModal, setShowActiveBetaModal] = useState(false)
	const [showNeedCatalogModal, setShowNeedCatalogModal] = useState(false)
	const isBetaActive = isBetaCatalog(store?.catalog?.version)

    const [toastPix, setToastPix] = useState(null)

    const removeToastPix = () => setToastPix(null)
	const defaultToastProps = { handleClose: removeToastPix, onAutoDismiss: removeToastPix }
    const errorToastPix = { ...defaultToastProps, timer: 3000, title: I18n.t('pixOrderArea.toastError'), type: NotificationType.ERROR }

	const saleTime = `${date} ${I18n.t('saleLabelConnectorTitle')} ${time}`
	const { key } = Features.items[Features.CUSTOM_STATUS]
	const { remoteKey } = Features.items[Features.CUSTOM_STATUS]
	const [isCustomStatusAllowed, setIsCustomStatusAllowed] = useState(false)
	const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false)
	const [statusList, setStatusList] = useState([])
	const cancelMessages = [
		{
			key: gateway.items[gateway.MERCADO_PAGO_CARD_READER].type,
			method: () => showCancelAlert(),
		},
		{
			key: gateway.items[gateway.MERCADO_PAGO_ONLINE].type,
			method: () => toggleMPOnlineModal(),
		},
	]
	const [showConfirmOfflineModal, setShowConfirmOfflineModal] = useState(false)
	const [showConfirmInsufficientStockModal, setShowConfirmInsufficientStockModal] = useState(false)
	const isOrder = sale.status !== ORDER_STATUS_CLOSED
	const salesType = isOrder ? SalesTypeEnum.ORDER : SalesTypeEnum.SALE
	const salesList = isOrder ? ordersGroup : salesGroup
	const canEdit = props.isOnline && Boolean(sale.id)
	const isPix = sale?.payments[0]?.type === PaymentType.PIX
	const status = sale.statusInfo ? sale.statusInfo.status : sale.status
	const isStatusClosed = status === ORDER_STATUS_CLOSED

	const hasPixSetupAndPixPayment = store.pixSetup && sale.payments?.[0]?.type === PaymentType.PIX
	const hasStatusAvailableForPix = !sale.isCancelled && !isStatusClosed
	const shouldShowPixArea = hasPixSetupAndPixPayment && hasStatusAvailableForPix

	let timer
	let scrollView

	const checkFeatureKey = async () => {
		const isCustomStatusAllowed = await props.checkPlanKeys(key)

		setIsCustomStatusAllowed(isCustomStatusAllowed)
	}

	// Generate statusList based on current status
	const generateStatusList = (currentStatus) => {
		const { filterOrders, salesStatus } = props
		const disableCustomStatus = currentStatus === statusNames.OPENED

		const sliceDefaults = (sliceIndex) =>
			filterOrders.defaultStatus
				.slice(sliceIndex)
				.filter((s) => ![statusNames.PAID, statusNames.AWAITING_PAYMENT].includes(s.status))
		const disableStatus = (arr) => arr.map((s) => ({ ...s, disabled: true }))

		return disableCustomStatus
			? [...sliceDefaults(1), ...disableStatus([statusPaid, ...salesStatus])]
			: [...sliceDefaults(2), statusPaid, ...salesStatus]
	}

	const setStatusListFunc = (status) => {
		setStatusList(generateStatusList(status))
	}

	const onRequestChangeTab = (index) => setIndex(index)

	const notConfirmed = () => !checkSaleConfirmed(props.sale)

	const isPaid = () => checkSalePaid(props.sale)

	const confirmCancel = () => {
		props.saleCancel(sale, (cancelledSale) => {
			props.setIsCancellingSale(true)
			props.salesUpdateListItem({ salesType, salesList, updatedSale: cancelledSale })
			setIsOptionsVisible(false)
			navigation.goBack()
			logEvent('Order Status Change', { status: 'canceled' })
		})
	}

	const cancelSaleConfirmation = () => {
		const { sale, isOnline } = props
		const { payments } = sale
		const pTransaction = _.find(payments, (item) => item.transaction)
		if (pTransaction) {
			const cancelType = cancelMessages.find((c) => c.key === pTransaction.transaction.gateway)

			if (isOptionsVisible) {
				hideOptions()
				timer = setTimeout(() => (cancelType ? cancelType.method() : showCancelAlert()), 500)
				return
			}

			return cancelType ? cancelType.method() : showCancelAlert()
		}

		const hasAnyProductWithStockControl = sale.items.find((i) => !!i.product && i.product.stockActive)
		if (!isOnline && !!hasAnyProductWithStockControl) {
			return showOfflineAlert()
		}

		showCancelAlert()
	}

	const showOfflineAlert = () => {
		Alert.alert(I18n.t('offlineMessage.title'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
	}

	const showCancelAlert = () => {
		Alert.alert(
			isOrder ? I18n.t('openedSaleCancelConfirmTitle') : I18n.t('saleCancelAlertTitle'),
			isOrder ? I18n.t('openedSaleCancelConfirmDescription') : I18n.t('saleCancelAlertDescription'),
			[
				{ text: I18n.t('words.s.back'), style: 'cancel' },
				{ text: I18n.t('alertConfirm'), onPress: () => confirmCancel() },
			]
		)
	}

	const showEditOrderAlert = () => {
		Alert.alert(I18n.t('generalErrorTitle'), I18n.t('orderEditionFailure'), [
			{ text: I18n.t('alertOk'), style: 'cancel' },
		])
	}

	const goToShareSale = () => {
		const { navigate } = navigation
		const { sale } = props
		hideOptions()
		navigate('ReceiptShareOptions', { sale, origin: 'sale' })
	}

	const goToCustomer = (_saleCustomer = null) => {
		const {
			sale,
			route,
			salesClear,
			salesClearFilter,
			ordersClearFilter,
			salesSetFilter,
			ordersSetFilter,
			customerDetailUpdate,
		} = props
		const { params = {} } = route
		const { origin = null, user = null } = params
		const navigationOrigin = origin

		salesClear()
		salesClearFilter()
		ordersClearFilter()
		salesSetFilter(sale.customer.id, 'customer')
		ordersSetFilter(sale.customer.id, 'customer')

		let saleCustomer = _saleCustomer
		if (!_saleCustomer) {
			try {
				saleCustomer = fetchOneByID(CUSTOMER, sale.customer.id).clone()
			} catch (ex) {
				saleCustomer = sale.customer
			}
		}

		customerDetailUpdate(saleCustomer)

		if (!!navigationOrigin && navigationOrigin === 'UserSales') {
			const goBackHandler = () => {
				salesSetFilter([user], 'users')
				ordersSetFilter([user], 'users')
			}

			salesSetFilter([], 'users')
			ordersSetFilter([], 'users')
			return navigation.navigate('CustomerDetail', { goBackHandler })
		}

		navigation.navigate('CustomerDetail')
	}

	const toggleMPOnlineModal = () => {
		setIsMPOnlineModalVisible(!isMPOnlineModalVisible)
	}

	const toggleStatusModal = () => {
		setIsStatusListVisible(!isStatusListVisible)
	}

	const toggleConfirmationModal = () => {
		setIsConfirmationModalVisible(!isConfirmationModalVisible)
	}

	const showOptions = () => {
		setIsOptionsVisible(true)
	}

	const hideOptions = () => {
		setIsOptionsVisible(false)
	}

	const setOrderStatus = (status) => {
		const { salesStatus, sale, billing } = props
		const isConfirmed = status === statusNames.CONFIRMED
		const isFreeAccount = billing && isFree(billing)
		const hasCustomStatus = salesStatus.find((s) => s.status === sale.status)
		toggleStatusModal()

		if (isConfirmed) {
			// check Stock if status opened
			// if (sale.status === statusNames.OPENED) return;
			if (sale.status === statusNames.OPENED) {
				return confirmOpened(!isAndroid)
			}

			// Dont need to check stock if status not opened
			return confirmOrder()
		}

		const isAlreadyPaid = checkSalePaid(sale)
		const isStatusPaid = status === statusNames.PAID
		if (isStatusPaid && !isAlreadyPaid && !isFreeAccount) {
			return goToPayment()
		}

		if (hasCustomStatus) return switchOrder(status)
		timer = setTimeout(() => {
			props.checkFeatureIsAllowed(key, () => switchOrder(status), remoteKey)
		}, 500)
	}

	const checkStock = () => {
		const { sale } = props
		const stockOk = !sale.items.find((item) => !checkSyncProductStock(item))
		return stockOk
	}

	const renderHeader = (props) => (
		<KyteTabBar
			inactiveColor={colors.primaryGrey}
			tabStyle={tabStyle.tab}
			indicatorStyle={tabStyle.indicator}
			style={tabStyle.base}
			{...props}
		/>
	)

	const renderConfirmTip = () => {
		const { saleDetailShowConfirmedTip } = props
		if (!saleDetailShowConfirmedTip) return null

		const style = {
			container: {
				flexDirection: 'row',
				padding: 10,
				paddingBottom: 20,
			},
			closeContainer: {
				flex: 0,
				paddingRight: 15,
			},
			closeTouchable: {
				padding: 5,
			},
			tipContainer: {
				flex: 1,
			},
			tipText: {
				color: colors.tipColor,
				fontSize: 12,
				lineHeight: 16,
			},
		}
		const tipText = renderBoldText(I18n.t('ConfirmOrderTip'))
		return (
			<View style={style.container}>
				<CenterContent style={style.closeContainer}>
					<TouchableOpacity
						style={style.closeTouchable}
						onPress={() => props.setCommon({ saleDetailShowConfirmedTip: false })}
					>
						<KyteIcon name="close-navigation" size={11} color={colors.secondaryBg} />
					</TouchableOpacity>
				</CenterContent>
				<CenterContent style={style.tipContainer}>
					<KyteText style={style.tipText}>{tipText}</KyteText>
				</CenterContent>
			</View>
		)
	}

	const renderFootterButtons = () => {
		const { sale, saleDetailShowConfirmedTip } = props
		const footerBtn = isOrder ? renderOrderFooterButton() : renderSaleFooterButton()
		const notConfirmedVar = notConfirmed()
		const tipOn = notConfirmedVar && !sale.isCancelled && saleDetailShowConfirmedTip
		const container = {
			paddingTop: 10,
			paddingBottom: 10,
			backgroundColor: tipOn ? colors.lightBg : 'white',
		}

		if (sale.isCancelled) return renderCancelledInfo()

		return (
			<View style={container}>
				{tipOn ? renderConfirmTip() : null}
				{footerBtn}
			</View>
		)
	}

	const renderItems = () => (
		<View style={{ height: '100%' }}>
			<View style={{ flex: 1, paddingTop: 0, backgroundColor: 'transparent' }}>
				<DetailItems sale={sale} />
			</View>
			{renderFootterButtons()}
		</View>
	)

	const renderObservation = () => {
		const { sale } = props

		return (
			<View style={{ height: '100%' }}>
				<View style={{ flex: 1, paddingTop: 10 }}>
					<DetailObservation observation={sale.observation} />
				</View>
				{renderFootterButtons()}
			</View>
		)
	}

	const copyToClipboard = (content) => {
		Clipboard.setString(content)
		props.startToast(I18n.t('fbIntegration.toastCopiedText'))
	}

	const renderPayments = () => {
		const { sale, auth } = props
		const { user } = auth

		return (
			<View style={{ height: '100%' }}>
				<ScrollView ref={(ref) => (scrollView = ref)}>
					<DetailPayments
						sale={sale}
						userPermissions={user.permissions}
						copyToClipboard={(content) => copyToClipboard(content)}
						handlePressShareButton={() => handlePressShareButton()}
					/>
				</ScrollView>
				{renderFootterButtons()}
			</View>
		)
	}

	const renderClient = () => {
		const { sale } = props
		let saleCustomer
		try {
			saleCustomer = fetchOneByID(CUSTOMER, sale.customer.id).clone()
		} catch (ex) {
			saleCustomer = sale.customer
		}

		return (
			<View>
				<DetailCustomer
					customer={sale.customer || {}}
					saleCustomer={saleCustomer}
					goToCustomer={() => goToCustomer(saleCustomer)}
					shippingFee={sale.shippingFee}
				/>
			</View>
		)
	}

	const concludeSale = async (stackName, navigateTo, isClosed) => {
		const { popToTop } = navigation
		const { userHasReachedLimit, user } = props
		const { sale } = props
		props.checkUserReachedLimit()
    setIsOptionsVisible(false)

		if (userHasReachedLimit) {
			NavigationService.reset('Confirmation', 'SendCode', {
				origin: 'user-blocked',
				previousScreen: 'Customers',
			})

			logEvent('UserReachedLimit', user)
			return
		}

		const getModelSale = () => fetchOneByID(SALE, sale.id)
		// realm workaround
		let _sale
		try {
			_sale = getModelSale().clone()
		} catch (ex) {
			_sale = getModelSale()
		}

		if (sale.notification && !_sale) {
			return showEditOrderAlert()
		}

		if (isClosed) setIsOptionsVisible(false)
		// else popToTop();

		await props.checkoutEditionMode(true)
		await props.currentSaleSetOpenedSale(sale.notification ? _sale : sale)

		NavigationService.navigate(stackName, navigateTo, { isClosed })
	}

	const renderDiscount = () => {
		const { sale } = props
		return (
			<Text style={[Type.Regular, Type.fontSize(15), colorSet(colors.errorColor)]}>
				{`${I18n.t('words.s.discount')} `}
				<CurrencyText value={sale.discountValue} />
				{` (${sale.discountPercent}%)`}
			</Text>
		)
	}

	const renderCancelButton = () => {
		const { buttonsContainer } = styles
		const cancelPress = !props.isOnline ? () => showNoConnectionModalVisible() : () => cancelSaleConfirmation()
		const textStyle = { color: !props.isOnline && colors.disabledColor }
		return (
			<View style={buttonsContainer}>
				<View style={{ width: 80 }}>
					<ActionButton onPress={() => goToShareSale()} cancel>
						<KyteIcon name="receipt" color={colors.primaryColor} />
					</ActionButton>
				</View>
				<View style={{ flex: 1 }}>
					<ActionButton
						onPress={cancelPress}
						showDisabled={!props.isOnline}
						textStyle={!props.isOnline && textStyle}
						cancel
					>
						{I18n.t('saleCancelButton')}
					</ActionButton>
				</View>
			</View>
		)
	}

	const switchOrder = async (newStatus) => {
		const { route } = props
		const { status } = sale
		const { params = {} } = route

		const clonedSale = cloneSale(sale)
		const getModelSale = () => fetchOneByID(SALE, sale.id, showEditOrderAlert.bind(this))
		const newSale = sale.notification ? { ...getModelSale()?.clone() } : clonedSale

		const updatedSale = await props.saleUpdate({
			...newSale,
			status: newStatus,
			prevStatus: status,
		})

		if (updatedSale) {
			props.saleDetail(updatedSale)
			props.salesUpdateListItem({ salesType, salesList, updatedSale })
			if (params.refreshSales) params.refreshSales()
			if (newStatus === 'confirmed') setStatusListFunc(newStatus)
			logEvent('Order Status Change', { status: newStatus })
		}
	}

	const confirmOrder = () => {
		const confirmedStatus = statusNames.CONFIRMED
		switchOrder(confirmedStatus)
	}

	const goToPayment = () => {
		props.currentSaleSetOpenedSale(sale)
		NavigationService.navigate('Payment', 'Payment', { clearCartOnGoBack: true })
	}

	const doClockAnimation = (status) => {
		const animationDuration = 1000
		const animationDelay = 1000

		Animated.parallel([
			Animated.timing(openedTransitionOpacity, {
				delay: animationDelay,
				toValue: isOpened ? 0 : 1,
				duration: animationDuration,
			}),
			Animated.timing(confirmedTransitionOpacity, {
				delay: animationDelay,
				toValue: isOpened ? 1 : 0,
				duration: animationDuration,
			}),
		]).start(() => {
			switchOrder(status)
			setIsTransitionVisible(false)
			setOpenedTransitionOpacity(new Animated.Value(isOpened ? 0 : 1))
			setConfirmedTransitionOpacity(new Animated.Value(isOpened ? 1 : 0))
		})
	}

	const toggleTransition = (visibility, status) => {
		setIsTransitionVisible(visibility)
		setIsOptionsVisible(false)
		doClockAnimation(status)
	}

	const editObservation = async (observation, showObservationInReceipt) => {
		const clonedSale = cloneSale(sale)

		const status = sale.statusInfo ? sale.statusInfo.status : sale.status
		const getModelSale = () => fetchOneByID(SALE, sale.id, showEditOrderAlert(this))

		const newSale = sale.notification ? { ...getModelSale().clone() } : clonedSale
		const updatedSale = await props.saleUpdate({
			...newSale,
			status,
			observation,
			showObservationInReceipt,
		})

		props.saleDetail(cloneSale(updatedSale))
		props.salesUpdateListItem({ salesType, salesList, updatedSale })
	}

	const goToObservation = () => {
		const { navigate } = navigation
		const { observation, showObservationInReceipt } = props.sale

		setShowObservationModal(false)
		navigate('CartObservation', {
			observation,
			showObservationInReceipt,
			callback: editObservation,
		})
	}

	const goToReceipt = () => {
		const selectedGateway = sale?.gatewayKey === 'mercadopago-online' ? 'mercadopago' : 'stripe'
		const gatewayKey = sale.gatewayKey ? selectedGateway : ''
		const propertiesTrack = {
			...trackSalePropsEvent(sale),
			gateway: gatewayKey,
		}

		props.currentSaleSetOpenedSale(sale)
		props.currentSaleSetStatus(ORDER_STATUS_CLOSED, sale.status)
		navigation.navigate('Receipt')

		logEvent('Order Finished', propertiesTrack)
	}

	const confirmOpened = (notCheck) => {
		if (notCheck) return confirmOrder()

		const { isOnline, auth } = props
		const isMultiuser = auth.multiUsers.length > 1

		if (!isOnline && isMultiuser) return setShowConfirmOfflineModal(true) // launch Offline modal
		if (!checkStock()) return setShowConfirmInsufficientStockModal(true) // launch Insufficient stock modal
		return confirmOrder()
	}

	const renderOrderFooterButton = () => {
		const { buttonsContainer } = styles
		const isPaidVar = isPaid()
		const awaitingPayment = checkSaleAwaitingPayment(sale) && !isPaidVar
		const hasTransaction = sale.payments.find((p) => p.transaction)

		const concludeAction = () => goToReceipt()
		const confirmAction = isOpened ? () => confirmOpened() : () => confirmOrder()

		const swipeButton = (title, action) => (
			<KyteSwipeButton
				onSwipeSuccess={() => {
					if (!props.isOnline) {
						return showNoConnectionModalVisible()
					}
					return action()
				}}
				showDisabled={!canEdit}
				disabled={!sale.id}
				title={title}
				swipeTextSuccess={I18n.t('words.s.confirming')}
			/>
		)

		const paymentButton = () => (
			<ActionButton
				showDisabled={!props.isOnline}
				onPress={() => {
					if (!props.isOnline) {
						return showNoConnectionModalVisible()
					}
					return goToPayment()
				}}
			>
				{I18n.t('goToPaymentLabel')}
			</ActionButton>
		)

		const renderCTA = () => {
			// awaiting payment
			if (awaitingPayment) return paymentButton()

			// To conclude -> status [kyte-paid, confirmed]
			// [LEGACY] - hasTransaction
			if (isPaidVar || hasTransaction) {
				return <ActionButton onPress={concludeAction}>{I18n.t('orderConcludeButton')}</ActionButton>
			}

			// To confirm -> status [^confirmed]
			if (notConfirmed()) {
				return swipeButton(I18n.t('SlideToConfirmLabel'), confirmAction)
			}

			// To kyte-paid -> status [confirmed, ^kyte-paid]
			return paymentButton()
		}

		return (
			<View style={buttonsContainer}>
				<View style={{ paddingLeft: 10 }}>
					<KyteButton
						width={50}
						height={50}
						background={colors.littleDarkGray}
						style={{ borderColor: colors.disabledIcon, borderWidth: 1 }}
						onPress={() => showOptions()}
					>
						<Icon name="more-horiz" color={colors.primaryBg} />
					</KyteButton>
				</View>
				<View style={{ flex: 1 }}>{renderCTA()}</View>
			</View>
		)
	}

	const renderSaleFooterButton = () => renderCancelButton()

	const renderCancelledInfo = () => {
		const { cancelledInfo } = styles

		return (
			<View style={cancelledInfo}>
				<Text style={[Type.Regular, Type.fontSize(16), colorSet('white')]}>{I18n.t('words.s.canceled')}</Text>
			</View>
		)
	}

	const renderSellerName = () => {
		const { sale } = props

		return (
			<Text
				style={[
					Type.Regular,
					{
						color: colors.grayBlue,
						justifyContent: 'flex-end',
						textAlign: 'right',
					},
				]}
			>
				{`#${sale.number} ${I18n.t('words.s.by')} ${sale.userName}`}
			</Text>
		)
	}

	const renderOrderDeliveryType = () => {
		const { sale } = props
		const { orderDeliveryTypeContainer } = styles
		const iconStyle = { marginRight: 4, position: 'relative' }

		const renderDeliverButton = () => (
			<TouchableOpacity style={orderDeliveryTypeContainer} onPress={() => setIndex(2)}>
				<KyteIcon style={iconStyle} name="pin" size={14} color={colors.primaryBg} />
				<KyteText weight="500" size={13} style={{ marginBottom: 2 }}>
					{I18n.t('catalogOrderDelivery')}
				</KyteText>
			</TouchableOpacity>
		)

		const renderWithdrawalText = () => (
			<View style={orderDeliveryTypeContainer}>
				<KyteIcon style={iconStyle} name="store" size={14} color={colors.primaryBg} />
				<KyteText weight="Medium" size={13} pallete="primaryBg" style={{ marginBottom: 2 }}>
					{I18n.t('words.s.withdrawal')}
				</KyteText>
			</View>
		)

		if (sale.origin !== SaleOrigin.CATALOG) return
		return sale.origin === SaleOrigin.CATALOG && sale.toDeliver ? renderDeliverButton() : renderWithdrawalText()
	}

	const saleStatusText = () => {
		const { sale } = props

		const isSplitPayment = sale.payments.length > 1
		const paymentFirst = sale?.payments[0]
		const salePaymentType = paymentFirst?.type ? paymentFirst.type : PaymentType.MONEY
		const singlePaymentDescr = PaymentType.items[salePaymentType]?.description ?? 'oops.. error'
		const splitPaymentDescr = I18n.t('paymentMethods.split')
		const salePaymentDescr = isSplitPayment ? splitPaymentDescr : singlePaymentDescr
		return salePaymentDescr
	}

	const renderObservationRow = () => {
		const obsContainer = {
			backgroundColor: colors.littleDarkGray,
			flexDirection: 'row',
			justifyContent: sale.observation ? 'center' : 'flex-start',
			alignItems: 'center',
			height: 40,
			paddingHorizontal: 20,
		}
		const onPress = !props.isOnline
			? () => showNoConnectionModalVisible()
			: sale.observation
			? () => setShowObservationModal(true)
			: () => goToObservation()
		return (
			<TouchableOpacity style={styles.topSectionTd} onPress={onPress} disabled={!canEdit}>
				<View style={obsContainer}>
					<KyteIcon
						name={sale.observation ? 'observation-right' : 'plus-calculator'}
						color={canEdit ? colors.secondaryBg : colors.disabledColor}
						size={14}
					/>
					<Padding horizontal={10}>
						<KyteText
							ellipsizeMode="tail"
							color={canEdit ? colors.primaryColor : colors.disabledColor}
							numberOfLines={1}
							weight={500}
						>
							{sale.observation || I18n.t('cartOptions.addObservation')}
						</KyteText>
					</Padding>
				</View>
			</TouchableOpacity>
		)
	}

	const renderObservationModal = () => {
		const noteLink = { margin: 10, padding: 10, alignSelf: 'center' }
		return (
			<KyteModal isModalVisible height="auto">
				<View style={{ alignItems: 'center', paddingVertical: 15 }}>
					<KyteIcon name="observation" size={40} color={colors.secondaryBg} />
				</View>
				<ScrollView
					style={{
						marginVertical: 10,
						paddingHorizontal: 15,
						maxHeight: SCREEN_HEIGHT * 0.5,
					}}
				>
					<KyteText pallete="secondaryBg" size={16} style={{ lineHeight: 32 }}>
						{sale.observation}
					</KyteText>
				</ScrollView>
				<View>
					{isOrder ? (
						<TextButton
							onPress={() => goToObservation()}
							title={I18n.t('editObservation')}
							color={colors.actionColor}
							size={16}
							style={noteLink}
						/>
					) : null}
					<ActionButton onPress={() => setShowObservationModal(false)}>OK</ActionButton>
				</View>
			</KyteModal>
		)
	}

	const renderConfirmationModal = () => {
		const container = { paddingHorizontal: 10 }
		const noteLink = { marginBottom: 10, padding: 10, alignSelf: 'center' }
		const textStyle = { textAlign: 'center', lineHeight: 20, marginBottom: 10 }

		return (
			<KyteModal
				isModalVisible
				height="auto"
				title={I18n.t('orderConfirmationTitle')}
				hideModal={() => toggleConfirmationModal()}
			>
				<View>
					<View style={container}>
						<KyteText size={16} style={textStyle}>
							{`${I18n.t('orderConfirmationText1')} `}
							<KyteText size={16} weight="Semibold">
								{I18n.t('words.s.confirmed')}
							</KyteText>
							{` ${I18n.t('orderConfirmationText2')} `}
							<KyteText size={16} weight="Semibold">
								{I18n.t('words.s.pending')}
							</KyteText>
						</KyteText>
						<KyteText style={textStyle} pallete="grayBlue" size={12}>
							{I18n.t('orderConfirmationText3')}
						</KyteText>
					</View>
					<View>
						<TextButton
							onPress={() => toggleConfirmationModal()}
							title={I18n.t('words.s.back')}
							color={colors.actionColor}
							size={16}
							style={noteLink}
							weight="Medium"
						/>
						<ActionButton onPress={() => confirmOrder('confirmed')}>{I18n.t('confirmOrderLabel')}</ActionButton>
					</View>
				</View>
			</KyteModal>
		)
	}

	const renderOptionsModal = () => (
		<KyteModal
			bottomPage
			height="auto"
			title={I18n.t('orderOptionsTitle')}
			isModalVisible
			hideModal={() => hideOptions()}
		>
			{renderOpenSaleOptions()}
		</KyteModal>
	)

	const renderNoConnectionModal = () => (
		<NoConnectionModal isModalVisible={showModalNoConnection} hideModal={() => setShowModalNoConnection(false)} />
	)

	const renderTransitionModal = () => (
		<KyteModal fullPage height="100%" isModalVisible>
			<OrderTransition openedOpacity={openedTransitionOpacity} confirmedOpacity={confirmedTransitionOpacity} />
		</KyteModal>
	)

	const showNoConnectionModalVisible = () => {
		setIsOptionsVisible(false)
		setShowModalNoConnection(true)
	}

	const renderOpenSaleOptions = () => {
		const { editOrder, cancelOrder, turnIntoOpened, previewSaleOnHold } = I18n.t('openedSalesOptions')

		const isAwaitingPayment = sale.status === statusNames.AWAITING_PAYMENT
		const opnOptionTitle = isOpened ? editOrder : turnIntoOpened
		const opnIcon = isOpened ? 'edit' : 'clock-stroke-small'
		const opnOnPress = isOpened
			? () => concludeSale(null, 'CurrentSale')
			: () => toggleTransition(true, statusNames.OPENED)
		const hasTransaction = sale.payments.find((p) => p.transaction) || isPaid() || isAwaitingPayment
		const isOnTablet = Dimensions.get('window').width >= Breakpoints[Viewports.Tablet]
		const confirmedRouteName = isOnTablet ? 'CurrentSale' : 'Cart'
		const confirmedStackName = isOnTablet ? null : 'ClosedSaleCart'

		const openedOptions = [
			{
				title: previewSaleOnHold,
				onPress: () => goToShareSale(),
				leftIcon: { icon: 'receipt', color: colors.primaryColor },
			},
			{
				title: opnOptionTitle,
				disabled: !sale.id || !!sale.appliedCoupon,
				alert: {
					message: I18n.t("coupons.editWarning"),
					active: !!sale.appliedCoupon
				},
				onPress: () => {
					if (!props.isOnline) {
						return showNoConnectionModalVisible()
					}
					return opnOnPress()
				},
				leftIcon: { icon: opnIcon, color: props.isOnline ? colors.primaryColor : colors.lightBorder },
				color: !props.isOnline && colors.lightBorder,
			},
			{
				title: cancelOrder,
				color: props.isOnline ? colors.errorColor : colors.lightBorder,
				onPress: () => {
					if (!props.isOnline) {
						return showNoConnectionModalVisible()
					}
					return cancelSaleConfirmation()
				},
				leftIcon: { icon: 'trash', color: props.isOnline ? colors.errorColor : colors.lightBorder },
			},
		]

		const confirmedOptions = [
			{
				title: previewSaleOnHold,
				onPress: () => goToShareSale(),
				leftIcon: { icon: 'receipt', color: colors.primaryColor },
			},
			{
				title: editOrder,
				disabled: !!sale.appliedCoupon,
				alert: {
					message: I18n.t("coupons.editWarning"),
					active: !!sale.appliedCoupon
				},
				color: !props.isOnline && colors.lightBorder,
				onPress: () => {
					if (!props.isOnline) {
						return showNoConnectionModalVisible()
					}
					return concludeSale(confirmedStackName, confirmedRouteName, true)
				},
				leftIcon: { icon: 'edit', color: props.isOnline ? colors.primaryColor : colors.lightBorder },
			},
			{
				title: cancelOrder,
				color: props.isOnline ? colors.errorColor : colors.lightBorder,
				onPress: () => {
					if (!props.isOnline) {
						return showNoConnectionModalVisible()
					}
					return cancelSaleConfirmation()
				},
				leftIcon: { icon: 'trash', color: props.isOnline ? colors.errorColor : colors.lightBorder },
			},
		]

		const transactionOptions = [
			{
				title: previewSaleOnHold,
				onPress: () => goToShareSale(),
				leftIcon: { icon: 'receipt', color: colors.primaryColor },
			},
			{
				title: cancelOrder,
				color: props.isOnline ? colors.errorColor : colors.lightBorder,
				onPress: () => {
					if (!props.isOnline) {
						return showNoConnectionModalVisible()
					}
					return cancelSaleConfirmation()
				},
				leftIcon: { icon: 'trash', color: props.isOnline ? colors.errorColor : colors.lightBorder },
			},
		]

		const nonTransactionalOptions = isOpened ? openedOptions : confirmedOptions

		return <ListOptions items={hasTransaction ? transactionOptions : nonTransactionalOptions} hideChevron />
	}

	const renderStatusListModal = () => {
		const { userPermissions } = props
		const { isAdmin } = checkUserPermission(userPermissions)
		const status = sale.statusInfo ? sale.statusInfo.status : sale.status

		return (
			<KyteSafeAreaView>
				<KyteModal
					bottomPage
					height="auto"
					title={I18n.t('selectStatus')}
					isModalVisible
					hideModal={() => toggleStatusModal()}
				>
					<StatusList
						disableCustomStatus={!isCustomStatusAllowed}
						navigate={navigation.navigate}
						setOrder={(s) => setOrderStatus(s)}
						statusList={statusList}
						status={[status]}
						toggleModal={() => (props.isOnline ? toggleStatusModal() : showNoConnectionModalVisible())}
						setStatusList={setStatusListFunc}
						hideManageBtn={!isAdmin}
					/>
				</KyteModal>
			</KyteSafeAreaView>
		)
	}

	const renderMPOnlineModal = () => {
		const outerContainer = { position: 'relative' }
		const container = { paddingHorizontal: 10 }
		const bottomContainer = { paddingHorizontal: 5, paddingBottom: 15 }
		const noteLink = { marginBottom: 10, padding: 10, alignSelf: 'center' }
		const textStyle = {
			textAlign: 'center',
			lineHeight: 20,
			paddingHorizontal: 10,
		}
		const imageStyle = { height: 230, marginTop: -5 }
		const closeIconContainer = {
			position: 'absolute',
			right: 15,
			top: 10,
			zIndex: 100,
		}
		const closeIcon = {
			backgroundColor: colors.littleDarkGray,
			width: 30,
			height: 30,
			borderRadius: 10,
		}
		const MPInfoURL = 'https://www.kyte.com.br/tutoriais/cancelamento-mercado-pago'
		const cancel = () => {
			toggleMPOnlineModal()
			timer = setTimeout(confirmCancel.bind(this), 250)
		}

		return (
			<KyteModal isModalVisible height="auto" hideModal={() => toggleMPOnlineModal()} noPadding noEdges>
				<View style={outerContainer}>
					<TouchableOpacity style={closeIconContainer} onPress={() => toggleMPOnlineModal()}>
						<CenterContent style={closeIcon}>
							<KyteIcon name="close-navigation" size={12} />
						</CenterContent>
					</TouchableOpacity>
					<Image style={imageStyle} resizeMode="cover" source={{ uri: CancelTransaction }} />
					<View style={container}>
						<KyteText marginTop={20} marginBottom={20} size={22} style={textStyle} weight="Medium">{`${I18n.t(
							'paymentSplitCancelButton'
						)} ${I18n.t(isOrder ? 'words.s.order' : 'words.s.sale')}`}</KyteText>
						<KyteText marginBottom={10} size={16} style={textStyle}>
							{I18n.t('chargebackInfo')}
						</KyteText>
					</View>
					<View style={bottomContainer}>
						<TextButton
							onPress={() => Linking.openURL(MPInfoURL)}
							title={I18n.t('expressions.learnMore')}
							color={colors.actionColor}
							size={16}
							style={noteLink}
							weight="Medium"
						/>
						<ActionButton onPress={() => cancel()}>{I18n.t('chargebackConfirmation')}</ActionButton>
					</View>
				</View>
			</KyteModal>
		)
	}

	const modalTitle = (title, marginBottom = 20) => (
		<KyteText marginBottom={marginBottom} size={22} weight="Medium" pallete="secondaryBg">
			{title}
		</KyteText>
	)

	const modalInfo = (text, marginBottom = 20) => (
		<KyteText marginBottom={marginBottom} size={16} lineHeight={20} textAlign="center" pallete="secondaryBg">
			{text}
		</KyteText>
	)

	const modalCloseIcon = (onPress) => {
		const size = 25
		const closeIconContainer = {
			position: 'absolute',
			right: 15,
			top: 10,
			zIndex: 100,
		}
		const closeIcon = {
			backgroundColor: colors.littleDarkGray,
			width: size,
			height: size,
			borderRadius: 15,
		}
		return (
			<TouchableOpacity style={closeIconContainer} onPress={onPress}>
				<CenterContent style={closeIcon}>
					<KyteIcon name="close-navigation" size={size * 0.4} color={colors.secondaryBg} />
				</CenterContent>
			</TouchableOpacity>
		)
	}

	const renderConfirmOfflineModal = () => {
		const { outerContainer } = styles

		const hideModal = () => setShowConfirmOfflineModal(false)
		const cancelButtonStyle = { marginVertical: 10 }
		const continueAnyway = () => {
			hideModal()
			confirmOrder()
		}

		return (
			<KyteModal isModalVisible hideModal={hideModal} noPadding noEdges height="auto">
				<View style={outerContainer}>
					<CenterContent style={{ paddingVertical: 50, flex: 0 }}>
						<KyteIcon name="no-internet" size={45} color={colors.secondaryBg} />
					</CenterContent>

					<View style={{ alignItems: 'center', paddingHorizontal: 25 }}>
						{modalTitle(I18n.t('customersOfflineWarningTitle'))}
						{modalInfo(I18n.t('confirmOrderOfflineWarning'))}
					</View>

					<View style={{ marginTop: 20 }}>
						<ActionButton cancel onPress={continueAnyway}>
							{I18n.t('ContinueAnyway')}
						</ActionButton>
						<ActionButton onPress={hideModal} style={cancelButtonStyle}>
							{I18n.t('alertDismiss')}
						</ActionButton>
					</View>
				</View>
			</KyteModal>
		)
	}

	const renderConfirmInsufficientStockModal = () => {
		const hideModal = () => setShowConfirmInsufficientStockModal(false)
		const continueAnyway = () => {
			hideModal()
			confirmOrder()
		}
		const goToCart = () => concludeSale('Cart')

		return (
			<InsufficientStockModal
				isModalVisible
				hideModal={hideModal}
				continueAnyway={continueAnyway}
				goToCart={goToCart}
			/>
		)
	}

	const renderGateway = (gt) => {
		const container = {
			paddingLeft: 8,
			marginLeft: 8,
			borderLeftWidth: 1,
			borderColor: colors.disabledIcon,
		}

		return (
			<View style={container}>
				<GatewayLogo gateway={gt} resizeMode={gt === 'stripe-connect' ? 'contain' : null} />
			</View>
		)
	}

	const renderPaymentType = () => {
		const isSplitPayment = sale.payments.length > 1
		const paymentFirst = sale.payments[0]
		const salePaymentType = paymentFirst?.type ? paymentFirst.type : PaymentType.MONEY
		const pixIcon = paymentFirst ? 'pix' : salePaymentType
		const singlePaymentIcon =
			paymentFirst?.type === PaymentType.PIX ? pixIcon : PaymentType.items[salePaymentType]?.icon ?? ''
		const splitPaymentIcon = 'split'
		const salePaymentIcon = isSplitPayment ? splitPaymentIcon : singlePaymentIcon
		const iconAlternativeColor = isSplitPayment ? false : PaymentType.items[salePaymentType]?.iconColor ?? ''
		const textStyle = { marginLeft: 4 }
		const container = {
			justifyContent: 'center',
			flexDirection: 'row',
			alignItems: 'center',
		}
		// Payments with transaction
		const payment = sale.payments.find((p) => p.transaction)

		// When order canceled
		if (isOrder && sale.isCancelled) {
			return (
				<View style={container}>
					<KyteText size={13}>{I18n.t('words.s.canceled')}</KyteText>
				</View>
			)
		}

		return (
			<View style={container}>
				<KyteIcon name={salePaymentIcon} size={isPix ? 16 : 13} color={iconAlternativeColor || colors.secondaryBg} />
				<KyteText style={{ ...textStyle, marginBottom: 1 }} size={13} weight={500} textAlign="center">
					{saleStatusText()}
				</KyteText>
				{payment && payment.transaction.gateway ? renderGateway(payment.transaction.gateway) : null}
			</View>
		)
	}

	const renderApiGenericError = () => (
		<ApiGenericErrorModal isModalVisible={props.hasApiError} hideModal={() => props.changeApiError(false)} />
	)

	const renderStatusSelector = () => {
		const { salesStatus, filterOrders } = props

		if (isStatusClosed) return null
		return (
			<StatusSelector
				disabled={!sale.id || sale.isCancelled}  
				showDisabled={!canEdit || sale.isCancelled}
				onPress={props.isOnline ? () => toggleStatusModal() : () => showNoConnectionModalVisible()}
				status={[status]}
				statusList={[...salesStatus, ...filterOrders.defaultStatus]}
			/>
		)
	}

	const handleGoBack = () => {
		const { filterSales, filterOrders, route } = props
		const hasCustomer = !!filterOrders.customer || !!filterSales.customer
		const { params = {} } = route
		const { keepReducer = false } = params

		if (hasCustomer && !keepReducer) {
			props.customersClear()
			props.salesSetFilter(null, 'customer')
			props.ordersSetFilter(null, 'customer')
		}

		navigation.goBack()
	}

	// Have to be here inside render() because of bottom Buttons
	const renderNoCustomerTabs = SceneMap({
		1: () => renderItems(),
		2: () => renderPayments(),
	})

	const renderCustomerTabs = SceneMap({
		1: () => renderItems(),
		2: () => renderPayments(),
		3: () => renderClient(),
	})

	const { outerContainer } = scaffolding
	const { topSection, topSectionRow, innerSection } = styles

	const renderLoading = () => {
		const containerHeight = { flex: 4 }
		const container = { ...containerHeight, justifyContent: 'center', alignItems: 'center' }
		return (
			<View style={container}>
				<ActivityIndicator size="large" color={colors.actionColor} />
			</View>
		)
	}

	const renderComponents = () => (
		<View>
			{Boolean(props.hasApiError) && renderApiGenericError()}
			{isTransitionVisible ? renderTransitionModal() : null}
			{isOptionsVisible ? renderOptionsModal() : null}
			{isStatusListVisible ? renderStatusListModal() : null}
			{showObservationModal ? renderObservationModal() : null}
			{isConfirmationModalVisible ? renderConfirmationModal() : null}
			{isMPOnlineModalVisible ? renderMPOnlineModal() : null}
			{showConfirmOfflineModal ? renderConfirmOfflineModal() : null}
			{showConfirmInsufficientStockModal ? renderConfirmInsufficientStockModal() : null}
		</View>
	)

	const shareOrderCatalog = () => {
		const orderStatusCatalogURL = `https://${store?.urlFriendly}${kyteCatalogDomain}/orders/${sale?.id}`
		const hasFractionedProduct = sale.items.some((item) => item?.product?.isFractioned)
		const lastStatus =
			sale?.timeline && sale.timeline.length > 0 ? sale.timeline[sale.timeline.length - 1].status : sale?.status
		Share.open(
			{
				title: I18n.t('followYourStatusOrder'),
				message: `${I18n.t('followYourStatusOrder')} ${orderStatusCatalogURL}`,
				// url: orderStatusCatalogURL,
			},
			logEvent('Order Share', {
				paymentType: PaymentType.items[sale?.payments[0]?.type]?.description,
				totalNet: sale.totalNet,
				hasCustomer: Boolean(sale.customer),
				hasDiscount: Boolean(sale.discountValue || sale.discountPercent),
				itemsAmount: sale.items.length,
				isOnHold: sale.status === statusNames.OPENED,
				hasObservation: Boolean(sale.observation),
				isQuickSale: sale.items.some(({ product }) => !product),
				hasFractionedProduct,
				hasTaxes: Boolean(sale.totalTaxes),
				hasSplitPayment: sale.payments.length > 1,
				hasChange: (sale.payBack ?? 0) > 0,
				status: lastStatus,
				where: 'order_detail',
				QRCode_create: Boolean(sale?.qrCode),
			})
		).catch((error) => {
			console.log(`Error shareOrderCatalog: ${error}`)
		})
	}

	const handlePressShareButton = () => {
		if (hasCatalog) {
			if (!isBetaActive) {
				logEvent('Catalog Version Exclusive Feature', { where: 'order_tracking' })
				return setShowActiveBetaModal(true)
			}
			return shareOrderCatalog();
		}
		logEvent('Catalog Order Tracking Warning', { where: 'order_tracking' })
		return setShowNeedCatalogModal(true)
	}

	const renderActivateBetaCatalogModal = () => {
		const handleConfirmModal = () => {
			const storeToSave = { ...store, catalog: { ...store.catalog, version: NEW_CATALOG_VERSION } }
			storeAccountSave(storeToSave, () => {
				logEvent('Catalog Version Change', { where: 'order_tracking', catalog_version: NEW_CATALOG_VERSION })
				setShowActiveBetaModal(false)
				setTimeout(() => {
					shareOrderCatalog();
				}, 500)
			})
		}

		return (
			<ActivateCatalogBetaModal
				isVisible={showActiveBetaModal}
				hideModal={() => setShowActiveBetaModal(false)}
				image={ShareOrderCatalogModal}
				imgStyles={{ width: 210, height: 210 }}
				subtitle="shareStatusModalSubtitle"
				onPress={handleConfirmModal}
			/>
		)
	}

	const renderNeedCatalogModal = () => (
		<NeedConfigureCatalogModal
			isVisible={showNeedCatalogModal}
			hideModal={() => setShowNeedCatalogModal(false)}
			image={NeedCatalogModal}
			imgStyles={{ width: 210, height: 210 }}
			subtitle="createCatalogFirstModal.modalSubtitle"
		/>
	)

	useEffect(() => {
		setStatusListFunc(sale.status)
	}, [sale.status])

	useEffect(() => {
		clearTimeout(timer)
		checkFeatureKey()
	}, [])

	return (
		<KyteSafeAreaView style={outerContainer}>
			<KyteToolbar
				innerPage
				borderBottom={1}
				headerTitle={saleTime}
				headerTextStyle={Type.fontSize(15)}
				rightComponent={
					<Row>
						{sale?.customer && <ToolbarCustomer customer={sale?.customer} onPress={() => goToCustomer()} inDetail />}
						<Margin right={8} />
						<KyteButton onPress={() => handlePressShareButton()}>
							<KyteIcon name="share" size={20} />
						</KyteButton>
						<Margin right={22} />
					</Row>
				}
				goBack={() => handleGoBack()}
				navigate={navigation.navigate}
				navigation={navigation}
			/>
			<View style={innerSection}>
				<View style={topSection}>
					<View style={topSectionRow(20, 15)}>
						<View style={styles.topSectionTd}>
							<KyteText size={28} lineThrough={sale.isCancelled}>
								<CurrencyText value={sale.totalNet} />
							</KyteText>
						</View>
						<View style={[styles.topSectionTd, styles.rightAlignment]}>
							<KyteText weight="Medium">{`#${sale.number}`}</KyteText>
							<KyteText ellipsizeMode="tail" numberOfLines={1} size={13} weight="Medium">
								{capitalizeFirstLetterOfString(sale.userName)}
							</KyteText>
						</View>
					</View>
					<View style={styles.paymentAndStatusContainer}>
						{renderStatusSelector()}
						<Row justifyContent={isStatusClosed ? 'space-between' : null} width={isStatusClosed ? '100%' : 'auto'}>
							{!isStatusClosed && <Margin left={16} />}
							{renderPaymentType()}
							<Margin left={16} />
							{renderOrderDeliveryType()}
						</Row>
					</View>

					{shouldShowPixArea && (
						<View style={styles.paymentAndStatusContainer}>
							<PixConfirmArea 
								sale={sale} 
								switchOrderStatus={switchOrder} 
								setToastError={setToastPix}
								errorToast={errorToastPix}
								isOnline={props.isOnline}
								onClickWhenIsOffline={() => setShowModalNoConnection(true)}
							/>
						</View>
					)}
					{sale.observation || isOrder ? <View style={topSectionRow(0, 0)}>{renderObservationRow()}</View> : null}
				</View>
				<View style={innerSection}>
					<TabView
						style={innerSection}
						initialLayout={initialLayout}
						navigationState={{ index, routes }}
						renderScene={sale.customer ? renderCustomerTabs : renderNoCustomerTabs}
						renderTabBar={renderHeader}
						onIndexChange={onRequestChangeTab}
						swipeEnabled={false}
					/>
				</View>
			</View>
			{showModalNoConnection && renderNoConnectionModal()}
			{isLoading || !sale ? renderLoading() : renderComponents()}
			{renderActivateBetaCatalogModal()}
			{renderNeedCatalogModal()}
			{Boolean(toastPix) && <KyteNotifications notifications={[toastPix]} />}
		</KyteSafeAreaView>
	)
}
const styles = {
	topSection: {
		backgroundColor: colors.lightBg,
		paddingTop: 20,
	},
	topSectionRow: (padding = 20, margin = 20) => ({
		flexDirection: 'row',
		paddingHorizontal: padding,
		marginBottom: margin,
		alignItems: 'center',
	}),
	topSectionTd: {
		flex: 1,
		minHeight: 20,
	},
	innerSection: {
		flex: 1,
	},
	paymentMethod: {
		flexDirection: 'column',
		justifyContent: 'center',
		flex: 1,
	},
	spaceBottom: {
		marginBottom: 10,
	},
	observationCircle: {
		width: 8,
		height: 8,
		borderRadius: 15,
		position: 'relative',
		top: -2,
		right: -5,
		backgroundColor: colors.infoColor,
	},
	cancelledInfo: {
		paddingVertical: 20,
		backgroundColor: colors.secondaryBg,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonsContainer: {
		flexDirection: 'row',
	},
	checkboxText: {
		fontFamily: 'Graphik-Regular',
		color: colors.primaryColor,
		fontWeight: 'normal',
		fontSize: 16,
	},
	textTitle: {
		fontFamily: 'Graphik-Semibold',
		color: colors.primaryColor,
		fontSize: 16,
		lineHeight: 32,
	},
	textBody: {
		fontFamily: 'Graphik-Regular',
		color: colors.primaryColor,
		fontSize: 16,
		lineHeight: 28,
	},
	textBodyAction: {
		fontFamily: 'Graphik-Semibold',
		color: colors.actionColor,
	},
	checkStyles: {
		backgroundColor: 'transparent',
		justifyContent: 'center',
		borderWidth: 0,
		marginLeft: 0,
		marginRight: 0,
		paddingTop: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0,
	},
	attentionMsgContainer: {
		flex: 1,
		padding: 30,
		flexDirection: 'column',
		justifyContent: 'space-around',
	},
	orderIconStyle: {
		position: 'absolute',
		bottom: -5,
		left: 30,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 1,
		backgroundColor: colors.lightBg,
		borderRadius: 50,
	},
	orderDeliveryTypeContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		position: 'relative',
		marginBottom: 2,
		top: 2,
	},
	rightAlignment: {
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
	setRow: {
		flexDirection: 'row',
		flex: 1,
	},
	setFlex: (flex = 1) => ({
		flex,
	}),
	paymentAndStatusContainer: {
		flexDirection: 'row',
		padding: 15,
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%'
	},
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	currency: state.preference.account.currency,
	decimalCurrency: state.preference.account.decimalCurrency,
	sale: state.sales.detail,
	salesStatus: state.preference.account.salesStatus,
	filterOrders: state.sales.filterOrders,
	filterSales: state.sales.filterSales,
	userPermissions: state.auth.user.permissions,
	customer: state.customers.detail,
	product: state.products.detail,
	saleDetailShowConfirmedTip: state.common.saleDetailShowConfirmedTip,
	isOnline: state.offline.online,
	isLoading: state.common.loader.visible,
	salesGroup: state.sales.salesGroupsResult.list,
	ordersGroup: state.sales.ordersGroupsResult.list,
	hasApiError: state.common.hasApiError,
	store: state.auth.store,
	billing: state.billing
})

const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators(
		{
			saleCancel,
			saleUpdate,
			saleDetail,
			customerFetchById,
			checkUserReachedLimit,
			currentSaleSetOpenedSale,
			currentSaleSetStatus,
			checkoutEditionMode,
			checkPlanKeys,
			checkFeatureIsAllowed,
			startToast,
			setCommon,
			salesSetFilter,
			ordersSetFilter,
			customerDetailUpdate,
			customersClear,
			salesClear,
			salesClearFilter,
			ordersClearFilter,
			salesUpdateListItem,
			setIsCancellingSale,
			changeApiError,
			storeAccountSave,
		},
		dispatch
	),
})

export default connect(mapStateToProps, mapDispatchToProps)(SaleDetail)
