import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Animated, Text, BackHandler, Dimensions, Image, Platform, TouchableOpacity } from 'react-native'
import { MobileOnly, Container, Margin, Row, KyteIcon as Icon, Center } from '@kyteapp/kyte-ui-components'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'
import {
	saleSave,
	saleUpdate,
	currentSaleSetStatus,
	saleDetail,
	customerDetailUpdate,
	setUserCustomInfo,
	checkLastSaleStock,
	currentSaleSet,
	updateQuantitySales,
} from '../../../stores/actions'
import {
	ActionButton,
	TextButton,
	CurrencyText,
	KyteText,
	KyteIcon,
	KyteModal,
	KyteDropdown,
	OrderTransition,
	KyteSafeAreaView,
	CenterContent,
	InsufficientStockModal,
	KyteButton,
} from '../../common'
import { logEvent } from '../../../integrations'
import { colors, scaffolding, Type, colorSet } from '../../../styles'
import { PaymentType, OrderStatus } from '../../../enums'
import { ReceiptInfoIcon } from '../../../../assets/images'
import I18n from '../../../i18n/i18n'
import NavigationService from '../../../services/kyte-navigation'
import {
	isIphoneX,
	checkUserPermission,
	currencyFormat,
	capitalizeFirstLetter,
	generateTestID,
	statusNames,
	getIsBRAndUseBRL,
} from '../../../util'
import { checkHasBeenSyncedOnServer, checkHasNeverBeenOnServer } from '../../../util/util-sync'
import ApiGenericErrorModal from '../../common/modals/ApiGenericErrorModal'
import SpinAnimation from '../../common/utilities/SpinAnimation'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568
const SMALLEST_SCREENS = SCREEN_HEIGHT <= 480

class Receipt extends Component {
	constructor(props) {
		super(props)
		const { lastSale, store, route, currentSale } = this.props
		const isOpened = lastSale.status === 'opened'

		this.backHandlerSubscription = null
		this._isMounted = false
		this.initialSale = route?.params?.sale || currentSale || lastSale

		this.state = {
			isReceiptInfo: false,
			isTransitionVisible: false,
			lastSaleStatus: null,
			openedTransitionOpacity: new Animated.Value(isOpened ? 1 : 0),
			confirmedTransitionOpacity: new Animated.Value(isOpened ? 0 : 1),
			showInsufficientStockModal: false,
			hasPixSetup: store.pixSetup,
			displaySale: this.initialSale,
		}
	}

	componentDidMount() {
		this._isMounted = true
		const { currentSale, lastSale } = this.props
		this.props.saleSave({
			currentSale,
			cb: (savedSale) => {
				if (this._isMounted) this.setState({ displaySale: savedSale })
			},
		})

		this.backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton)
		logEvent('Checkout Finish View')
	}

	componentWillUnmount() {
		this._isMounted = false
		this.backHandlerSubscription?.remove()
	}

	handleBackButton() {
		return true
	}

	hideInfoModal() {
		this.setState({ isReceiptInfo: false })
	}

	showInfoModal() {
		this.setState({ isReceiptInfo: true })
	}

	goToStoreReceipt() {
		const { navigate } = this.props.navigation

		this.hideInfoModal()
		navigate({ name: 'ConfigReceipt', key: 'ConfigReceiptPage' })
	}

	goToReceipt() {
		const { navigate } = this.props.navigation
		const { lastSale } = this.props
		const sale = this.getDisplaySale()

		logEvent('Receipt Empty State View')

		this.setState({ isReceiptInfo: false })
		navigate('ReceiptShareOptions', { sale: sale || lastSale, origin: 'currentSale' })
	}

	goToShareSale() {
		const { navigate } = this.props.navigation
		const { store, userPermissions } = this.props
		const { lastSale } = this.props
		const { currentSale } = this.props
		const sale = this.getDisplaySale() || (lastSale.items.length === 0 ? currentSale : lastSale)
		const { status } = sale

		if (!store.name && checkUserPermission(userPermissions).isAdmin) {
			this.showInfoModal()
		} else {
			logEvent('Go To Receipt', { status })
			navigate({
				key: 'ReceiptPage',
				name: 'ReceiptShareOptions',
				params: { sale, origin: 'currentSale' },
			})
		}
	}

	goToOrder(saleParam) {
		const { lastSale, currentSale, navigation } = this.props
		const saleAux = saleParam || (lastSale.items.length === 0 ? currentSale : lastSale)

		let sale
		try {
			sale = saleAux.clone()
		} catch (ex) {
			sale = saleAux
		}

		this.props.saleDetail(sale)
		navigation.navigate('SaleDetail', { sale, refreshSales: () => null })
	}

	async goToCustomer(customer, sale) {
		const saleData = sale || this.props.lastSale
		const { navigate } = this.props.navigation
		await this.props.customerDetailUpdate({
			...customer,
			accountBalance: saleData.customer.accountBalance,
		})
		navigate('CustomerDetail')
		// NavigationService.navigate('Customers', 'CustomerDetail');
		// navigate({ key: 'CustomerDetailPage', name: 'CustomerDetail' });
	}

	doClockAnimation(status) {
		const { lastSale } = this.props
		const { openedTransitionOpacity, confirmedTransitionOpacity } = this.state
		const isOpened = lastSale.status === 'opened'
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
			this.updateSaleStatus(status)
			this.setState({
				isTransitionVisible: false,
				openedTransitionOpacity: new Animated.Value(isOpened ? 0 : 1),
				confirmedTransitionOpacity: new Animated.Value(isOpened ? 1 : 0),
			})
		})
	}

	checkStock(visibility, status) {
		const stockOk = this.props.checkLastSaleStock()
		if (!stockOk) return this.setState({ showInsufficientStockModal: true })

		this.toggleTransition(visibility, status)
	}

	toggleTransition(visibility, status) {
		const { status: lastSale } = this.props.lastSale
		if (lastSale !== status) {
			this.setState({ isTransitionVisible: visibility })
			this.doClockAnimation(status)
		}
	}

	updateSaleStatus(newStatus) {
		const { lastSale } = this.props
		const { status } = lastSale

		let saleToUpdate
		try {
			saleToUpdate = lastSale.clone()
		} catch (ex) {
			saleToUpdate = lastSale
		} finally {
			if (status !== newStatus) {
				const newCurrentSale = { ...saleToUpdate, prevStatus: status, status: newStatus }
				this.props.saleUpdate(newCurrentSale)
			}

			logEvent('Order Status Change', { status: newStatus })
		}
	}

	setLastSaleAsCurrentSale() {
		const { lastSale } = this.props
		this.props.currentSaleSet(lastSale)
	}

	clickSaveSale() {
		const { props } = this
		props.updateQuantitySales()
		NavigationService.resetNavigation('CurrentSale')
	}

	getDisplaySale() {
		const { displaySale } = this.state
		const { lastSale, currentSale, route } = this.props
		const routeSale = route?.params?.sale
		const candidates = [displaySale, routeSale, currentSale, lastSale].filter(Boolean)
		const saleWithItems = candidates.find((sale) => Array.isArray(sale?.items) && sale.items.length > 0)
		return saleWithItems || displaySale || routeSale || currentSale || lastSale || {}
	}

	renderTotalChange(payBackValue) {
		const { paybackText } = styles
		const { currency, decimalCurrency } = this.props
		const convertedPayBack = currencyFormat(payBackValue, currency, decimalCurrency)

		return (
			<View>
				<Text style={paybackText}>
					{I18n.t('words.s.change')}: {convertedPayBack}
				</Text>
			</View>
		)
	}

	renderPaymentList(payments) {
		const { paymentListItem } = styles
		return payments?.map((payment, i) => (
			<Text key={i} style={paymentListItem}>
				<CurrencyText value={payment.total} /> {payment.description}
			</Text>
		))
	}

	renderPaymentListContainer(payments) {
		const { paymentsContainer } = styles
		return <View style={paymentsContainer}>{this.renderPaymentList(payments)}</View>
	}

	renderSendReceipt(sale) {
		const { buttonSpacing, buttonTxt } = styles
		const { status, payments = [] } = sale || {}
		const isOrder = status !== 'closed'
		let isPayLaterOnly = true

		payments?.forEach((p) => {
			if (p.type !== PaymentType.items[PaymentType.PAY_LATER].type) isPayLaterOnly = false
		})

		const generateText = () => {
			// if (isOrder) return I18n.t('openedSalesOptions.previewSaleOnHold');
			if (isPayLaterOnly) return I18n.t('customerAccount.saleViewDetail')
			return I18n.t('words.s.receipt')
		}

		return (
			<MobileOnly>
				<ActionButton
					style={buttonSpacing}
					textStyle={buttonTxt}
					leftIcon={this.renderButtonIcon()}
					onPress={() => this.goToShareSale()}
					cancel
					testProps={generateTestID('sale-receipt')}
				>
					{generateText()}
				</ActionButton>
			</MobileOnly>
		)
	}

	renderGotoOrder(sale) {
		const { salesLink } = styles
		const title = I18n.t('goToOrder')
		const saleAux = sale?.items?.length ? sale : this.props.lastSale
		return (
			<TextButton
				style={salesLink(15)}
				onPress={() => this.goToOrder(saleAux)}
				title={title}
				color={colors.actionColor}
				size={16}
				testProps={generateTestID('view-order-ssc')}
			/>
		)
	}

	renderButtonIcon() {
		return <KyteIcon name="receipt" color={colors.primaryColor} />
	}

	renderPageTitle(sale) {
		const { receiptEmailSent } = this.props
		const { pageTitle } = styles
		const { statusInfo = {} } = sale || {}
		const { params = {} } = this.props.route
		const { isEdition } = params
		const isConfirmed = statusInfo.status === OrderStatus.items[OrderStatus.CONFIRMED].status
		const isPaid = statusInfo.status === OrderStatus.items[OrderStatus.PAID].status
		const isAwaitingPayment = statusInfo.status === OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status
		const isClosed = statusInfo.status === 'closed'

		const titleInfo = () => {
			if (isAwaitingPayment) return 'awaitingPaymentOrderLabel'
			if (isEdition) return 'editedOrderLabel'
			if (receiptEmailSent) return 'receiptShareEmailSent'
			if (isConfirmed) return 'confirmedOrderLabel'
			if (isClosed) return 'receiptFinishedSale'
			if (isPaid) return 'paidOrderLabel'
			return 'openedOrderLabel'
		}


		return (
			<Text style={pageTitle} {...generateTestID('sale-status')}>
				{I18n.t(titleInfo())}
			</Text>
		)
	}

	renderCustomerAccountBalance(sale) {
		const { customer, lastSale } = this.props
		const { accountBalance } = sale?.customer || lastSale.customer
		const { flexDirectionRow, flexDirectionColumn, customerAccountBalanceButton } = styles
		const customerName = customer.name || sale?.customer?.name || lastSale.customer.name
		const balanceColor = () => {
			if (Math.sign(accountBalance) === 0) return 'primaryColor'
			if (Math.sign(accountBalance) < 1) return 'errorColor'
			return 'actionColor'
		}
		const customerNameLength = customerName.length > 30
		const changeDirection = customerNameLength ? flexDirectionColumn : flexDirectionRow
		const changeIcon = customerNameLength ? 25 : 32
		const changeFontSize = customerNameLength ? 14 : 16

		return (
			<TouchableOpacity
				style={[changeDirection, customerAccountBalanceButton]}
				onPress={() => this.goToCustomer(customer, sale)}
			>
				<KyteIcon style={{ marginRight: 15 }} name="customer-account" size={changeIcon} color={colors.primaryColor} />
				<KyteText
					weight="Semibold"
					size={changeFontSize}
					style={{ paddingRight: 5 }}
					ellipsizeMode="tail"
					numberOfLines={1}
					{...generateTestID('cust-linked-plcc')}
				>
					{customer.name} {customerNameLength ? '' : ':'}
				</KyteText>
				<KyteText weight="Semibold" size={16} pallete={balanceColor()} {...generateTestID('due-value-plcc')}>
					<CurrencyText value={accountBalance} />
				</KyteText>
			</TouchableOpacity>
		)
	}

	renderFinishedOrderPage(sale) {
		const { receiptEmailSent, currency, decimalCurrency } = this.props
		const { totalNet = 0, payBack, payments = [] } = sale || {}
		const { innerContainer, totalNetText, totalView, iconView } = styles
		const convertedTotalNet = currencyFormat(totalNet, currency, decimalCurrency)
		const acountPayment = PaymentType.items[PaymentType.ACCOUNT]
		const payLaterPayment = PaymentType.items[PaymentType.PAY_LATER]
		const showAccountInfo = payments.find((p) => p.type === acountPayment.type || p.type === payLaterPayment.type)

		const renderSaleInfo = () => (
			<View>
				<View style={[totalView]}>
					<Text style={totalNetText(payBack)} {...generateTestID('total-csl')}>
						{convertedTotalNet}
					</Text>
				</View>
				{payBack ? this.renderTotalChange(payBack) : null}
			</View>
		)

		return (
			<View style={{ flex: 1 }}>
				{showAccountInfo ? this.renderCustomerAccountBalance(sale) : null}
				<View style={innerContainer}>
					<View>
						<View style={{ ...iconView, marginBottom: 25 }}>
							<KyteIcon name="check-inner" color={colors.actionColor} size={150} />
						</View>
					</View>
					<View>{this.renderPageTitle(sale)}</View>
					{receiptEmailSent ? null : renderSaleInfo()}
				</View>
			</View>
		)
	}

	renderUnfinishedOrderPage(sale) {
		const { currency, decimalCurrency } = this.props
		const { totalNet = 0, status, statusInfo, id } = sale || {}
		const { innerContainer, totalNetText, totalView, iconView } = styles
		const convertedTotalNet = currencyFormat(totalNet, currency, decimalCurrency)
		const paid = OrderStatus.items[OrderStatus.PAID].status
		const opened = OrderStatus.items[OrderStatus.OPENED].status
		const awaitingPayment = OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status
		const isOpened = status === opened
		const statusSelectorContainer = { marginTop: 30, alignItems: 'center', justifyContent: 'center' }
		const shouldRenderStatusDropdown = isOpened && Boolean(id) && checkHasBeenSyncedOnServer(sale)

		const iconName = (statusName) => {
			if (statusName === opened) return 'clock-stroke'
			if (statusName === paid) return 'dollar-sign'
			if (statusName === awaitingPayment) return 'dollar-sign'
			return 'clock-thin'
		}

		return (
			<View style={innerContainer}>
				{shouldRenderStatusDropdown && (
					<View>
						<View style={statusSelectorContainer}>{this.renderDropdown()}</View>
					</View>
				)}
				<CenterContent>
					<View>
						<View style={iconView}>
							<KyteIcon name={iconName(status)} color={statusInfo ? statusInfo.color : colors.actionColor} size={120} />
						</View>
					</View>
					<View style={[Platform.select({ ios: { paddingTop: 20 }, android: { paddingTop: 10 } })]}>
						{this.renderPageTitle(sale)}
					</View>
					<View style={[totalView]}>
						<Text style={totalNetText()}>{convertedTotalNet}</Text>
					</View>
				</CenterContent>
			</View>
		)
	}

	renderSyncWarning() {
		return (
			<Margin horizontal={16} bottom={16}>
				<Container backgroundColor="#f7b84f" borderRadius={8} padding={12}>
					<Row justifyContent="center" alignItems="center">
						<Icon name="not-sync" size={40} />
						<Margin left={12}>
							<KyteText size={18} lineHeight={25} weight={500}>
								{I18n.t('pendingSync')}
							</KyteText>
						</Margin>
					</Row>
					<Margin top={6}>
						<KyteText size={16} lineHeight={24} textAlign="center">
							{I18n.t('pendingSaleSync')}
						</KyteText>
					</Margin>
				</Container>
			</Margin>
		)
	}

	renderTransitionModal() {
		const { openedTransitionOpacity, confirmedTransitionOpacity } = this.state

		return (
			<KyteModal fullPage height="100%" isModalVisible={this.state.isTransitionVisible}>
				<OrderTransition openedOpacity={openedTransitionOpacity} confirmedOpacity={confirmedTransitionOpacity} />
			</KyteModal>
		)
	}

	renderDropdown() {
		const { status } = this.props.lastSale
		const dropdownOptions = [
			{
				icon: { name: 'clock-stroke', color: colors.primaryColor },
				labelText: `${capitalizeFirstLetter(I18n.t('words.s.pending'))}`,
				title: capitalizeFirstLetter(I18n.t('words.s.pending')),
				subtitle: I18n.t('doesNotMoveStock'),
				onPress: () => this.toggleTransition(true, statusNames.OPENED),
			},
			{
				icon: { name: 'clock', color: colors.actionColor },
				labelText: `${capitalizeFirstLetter(I18n.t('words.s.confirmed'))}`,
				title: capitalizeFirstLetter(I18n.t('words.s.confirmed')),
				subtitle: I18n.t('movesStock'),
				onPress: () => this.checkStock(true, statusNames.CONFIRMED),
			},
		]
		return (
			<KyteDropdown
				options={dropdownOptions}
				checkedIndex={status === 'opened' ? 0 : 1}
				testProps={generateTestID('change-status-ssc')}
				testProps1={generateTestID('get-status-ssc')}
			/>
		)
	}

	renderReceiptInfo() {
		const { receiptInfoContainer, receiptInfoInner, receiptInfoLink, receiptInfoTop, svgImage, infoStyle, salesLink } =
			styles

		return (
			<KyteModal
				fullPage
				fullPageTitle={I18n.t('receiptCustomizePageTitle')}
				height="100%"
				isModalVisible
				hideFullPage={() => this.hideInfoModal()}
			>
				<View style={receiptInfoContainer}>
					<View style={receiptInfoInner}>
						<View style={receiptInfoTop}>
							<Image style={svgImage} source={{ uri: ReceiptInfoIcon }} />
						</View>
						<Text style={infoStyle}>
							{this.isOrder ? I18n.t('receiptCustomizeOrderInfo') : I18n.t('receiptCustomizeSaleInfo')}
						</Text>
						<View style={receiptInfoLink}>
							<TextButton
								style={salesLink()}
								onPress={() => this.goToReceipt()}
								title={I18n.t('receiptSaleView')}
								color={colors.actionColor}
								size={14}
							/>
						</View>
					</View>
				</View>
				<ActionButton style={{ marginBottom: 10 }} onPress={() => this.goToStoreReceipt()}>
					{I18n.t('receiptCustomizeSaveButton')}
				</ActionButton>
			</KyteModal>
		)
	}

	renderInsufficientStockModal() {
		const { showInsufficientStockModal } = this.state
		const hideModal = () => this.setState({ showInsufficientStockModal: false })
		const continueAnyway = () => this.toggleTransition(true, statusNames.CONFIRMED)
		const goToCart = () => {
			this.setLastSaleAsCurrentSale()
			this.props.navigation.navigate({ name: 'Cart', key: 'CartPage' })
		}

		return (
			<InsufficientStockModal
				isModalVisible={showInsufficientStockModal}
				hideModal={hideModal}
				continueAnyway={continueAnyway}
				goToCart={goToCart}
			/>
		)
	}

	renderApiGenericError() {
		return (
			<ApiGenericErrorModal
				isModalVisible={this.props.hasApiError}
				hideModal={() => {
					NavigationService.navigate('Cart')
				}}
			/>
		)
	}

	renderSyncingInfo() {
		return (
			<Margin bottom={24}>
				<Row justifyContent="center" alignItems="center">
					<SpinAnimation shouldSpin>
						<KyteIcon size={40} name="sync" color={colors.actionColor} />
					</SpinAnimation>
					<Margin left={12}>
						<KyteText size={18} weight={500} color={colors.primaryDarker}>
							{I18n.t('words.s.syncing')}...
						</KyteText>
					</Margin>
				</Row>
			</Margin>
		)
	}

	renderPixDivulgation() {
		const { navigate } = this.props.navigation

		return(
			<Container backgroundColor={colors.green08} borderRadius={8} marginLeft={16} marginRight={16} marginBottom={16}>
				<Padding all={12}>
					<Text style={styles.pixText}>
						{I18n.t('automaticQRCodePix')}
					</Text>
					<View style={styles.pixButton}>
						<TextButton onPress={() => navigate('SaleDetail', { screen: 'PixDataConfig' })}>
							<Row alignItems="center">
								<KyteIcon name="pix" size={20} color={colors.primaryColor} />
								<Margin right={4} />
								<Text style={{...styles.pixText, fontWeight: '600'}}>
									{I18n.t('setUpPixKey')}
								</Text>
							</Row>
						</TextButton>
					</View>
				</Padding>
            </Container>
		)
	}

	render() {
		const { contentContainer, buttonSpacing } = styles
		const { outerContainer } = scaffolding
		
		const { store } = this.props
		const sale = this.getDisplaySale()
		const { status, payments = [] } = sale
		const { hasPixSetup } = this.state
		const itHasCatalog = !!store?.catalog
		const hasPixPayment = payments.some((item) => item.type === PaymentType.PIX)
	
		this.isOrder = status !== 'closed'
		const isSyncing = !checkHasBeenSyncedOnServer(sale) && !checkHasNeverBeenOnServer(sale)

		return (
			<KyteSafeAreaView style={outerContainer}>
				{this.props.hasApiError && this.renderApiGenericError()}
				<View style={contentContainer}>
					{!this.isOrder ? this.renderFinishedOrderPage(sale) : this.renderUnfinishedOrderPage(sale)}
				</View>
				{isSyncing && this.renderSyncingInfo()}
				{checkHasNeverBeenOnServer(sale) && this.renderSyncWarning()}
				{!hasPixSetup && itHasCatalog && hasPixPayment && this.renderPixDivulgation()}
				{this.isOrder ? this.renderGotoOrder(sale) : null}
				<View>
					{this.renderSendReceipt(sale)}
					<ActionButton
						style={buttonSpacing}
						onPress={() => this.clickSaveSale()}
						testProps={generateTestID('start-new-sale')}
					>
						{I18n.t('receiptConcludeButton')}
					</ActionButton>
				</View>
				{this.state.isReceiptInfo ? this.renderReceiptInfo() : null}
				{this.renderTransitionModal()}
				{this.renderInsufficientStockModal()}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	contentContainer: {
		flexDirection: 'column',
		flex: 1,
	},
	innerContainer: {
		flex: 1,
		justifyContent: 'center',
	},
	pageTitle: {
		fontSize: 22,
		fontFamily: 'Graphik-Semibold',
		color: colors.primaryColor,
		textAlign: 'center',
		...Platform.select({
			ios: { marginTop: SMALLEST_SCREENS ? 5 : 0 },
		}),
	},
	inputWidth: {
		width: '60%',
		alignSelf: 'center',
	},
	salesLink: (marginBottom = 0) => ({
		fontFamily: 'Graphik-Medium',
		alignSelf: 'center',
		fontSize: 16,
		marginBottom,
	}),
	paymentsContainer: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	paymentListItem: {
		fontSize: 16,
		fontFamily: 'Graphik-Regular',
		lineHeight: 30,
		color: colors.primaryColor,
	},
	buttonSpacing: {
		marginBottom: 10,
	},
	buttonTxt: {
		textAlign: 'center',
		fontFamily: 'Graphik-Medium',
	},
	receiptInfoContainer: {
		flex: isIphoneX() ? 0.95 : 1,
	},
	receiptInfoInner: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-end',
		padding: 25,
	},
	receiptInfoLink: {
		justifyContent: 'center',
		alignItems: 'center',
		...Platform.select({
			android: { height: 100 },
			ios: { paddingTop: SMALLEST_SCREENS ? 30 : 0 },
		}),
	},
	infoStyle: {
		fontFamily: 'Graphik-Medium',
		fontSize: 15,
		...Platform.select({
			ios: { lineHeight: SMALLEST_SCREENS ? 22 : 25, top: SMALLEST_SCREENS ? 30 : 0 },
			android: { lineHeight: 25 },
		}),
		textAlign: 'center',
		color: colors.primaryColor,
	},
	receiptInfoTop: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		...Platform.select({
			ios: { paddingTop: SMALLEST_SCREENS ? 10 : 0 },
		}),
	},
	svgImage: {
		resizeMode: 'contain',
		width: SMALL_SCREENS ? Dimensions.get('window').width * 0.55 : Dimensions.get('window').width * 0.5,
		height: SMALL_SCREENS ? Dimensions.get('window').width * 0.55 : Dimensions.get('window').height * 0.5,
	},
	paybackText: [Type.Regular, Type.fontSize(15), colorSet(colors.primaryBg), { textAlign: 'center' }],
	iconView: {
		alignItems: 'center',
		marginBottom: 10,
	},
	totalView: {
		marginTop: 10,
	},
	totalNetText: (isPaddingBottom = true) => [
		Type.Light,
		Type.fontSize(36),
		colorSet(colors.secondaryBg),
		{
			textAlign: 'center',
			lineHeight: 36,
			paddingBottom: isPaddingBottom ? 25 : 0,
			paddingTop: 5,
		},
	],
	customerAccountBalanceButton: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 70,
		backgroundColor: colors.borderlight,
	},
	flexDirectionRow: {
		flexDirection: 'row',
	},
	flexDirectionColumn: {
		flexDirection: 'column',
	},
	pixButton: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	pixText: {
		textAlign: 'center',
		fontSize: 16,
	}
}

const mapStateToProps = (state) => {
	const { payBack, totalNet, payments } = state.lastSale
	const { store } = state.auth
	const { receiptEmailSent, doSaleSave } = state.common
	const { currency, decimalCurrency } = state.preference.account
	const { permissions } = state.auth.user
	const { detail } = state.customers
	const { user } = state.auth

	return {
		currentSale: state.currentSale,
		lastSale: state.lastSale,
		totalNet,
		payBack,
		payments,
		store,
		receiptEmailSent,
		currency,
		decimalCurrency,
		userPermissions: permissions,
		customer: detail,
		user,
		doSaleSave,
		hasApiError: state.common.hasApiError,
	}
}

export default connect(mapStateToProps, {
	saleSave,
	saleUpdate,
	currentSaleSetStatus,
	saleDetail,
	customerDetailUpdate,
	setUserCustomInfo,
	checkLastSaleStock,
	currentSaleSet,
	updateQuantitySales,
})(Receipt)
