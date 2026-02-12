import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { View, TouchableOpacity, ScrollView, Alert, Keyboard, Platform } from 'react-native'
import ViewShot from 'react-native-view-shot'
import Share from 'react-native-share'
import { BleManager } from 'react-native-ble-plx'

import { KyteSafeAreaView, KyteIcon, KyteText, CurrencyText, ListOptionsWide, LoadingCleanScreen } from '../../common'
import LeftAlignedImage from '../../common/LeftAlignedImage'
import StatementItem from '../common/StatementItem'
import {
	checkFeatureIsAllowed,
	sendCustomerAccountReceiptByEmail,
	printCustomerStatements,
} from '../../../stores/actions'
import { getImagePath, formatCustomerInformation, formatStoreInformation } from '../../../util'
import { requestPermission } from '../../../util/util-permissions'
import { requestBluetoothPermissions } from '../../../util/util-permissions'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { CustomerAccountMovementReason, Features, PHOTO_LIBRARY } from '../../../enums'
import NavigationService from '../../../services/kyte-navigation'

const Strings = {
	CONTENT_HEADER_TRANSACTION: I18n.t('words.s.customerAccountTransaction'),
	CONTENT_HEADER_BALANCE: I18n.t('words.s.balance'),
	LAST_10: I18n.t('filterLast10'),
	OPTIONS_SUBTITLES: {
		complete: I18n.t('completeReport'),
		last_10: I18n.t('filterLast10Transactions'),
	},
}

class CustomerStatementsShare extends React.Component {
	constructor(props) {
		super(props)

		this.viewShotRef = React.createRef()

		this.state = {
			isBluetoothActive: false,
		}

		const { store, customer } = props
		this.storeInfo = formatStoreInformation(store.address, store.addressComplement, store.phone, store.headerExtra)
		this.customerInfo = formatCustomerInformation(
			customer.address,
			customer.addressComplement,
			customer.celPhone || customer.phone
		)

		this.manager = new BleManager()
		this.bluetoothStatusSubscription = null
	}

	componentDidMount() {
		this.bluetoothStatusSubscription = this.manager.onStateChange(
			(state) => this.setState({ isBluetoothActive: state === 'PoweredOn' }),
			true
		)
	}

	componentWillUnmount() {
		if (this.bluetoothStatusSubscription) {
			this.bluetoothStatusSubscription.remove()
			this.bluetoothStatusSubscription = null
		}
	}

	filterString = this.props.route.params.filterString

	receiptSender(receiver, callback) {
		const { customer, store, account, isOnline } = this.props

		const footer = {
			label: `${I18n.t('customerAccount.printAccountStatementLabel')}: ${this.filterString}`,
			datetime: {
				date: moment().format('LL'),
				time: ` ${moment().format('LT')}`,
			},
		}

		const currency = {
			currencySymbol: account.currency.currencySymbol,
			decimalSeparator: account.currency.decimalSeparator,
			groupingSeparator: account.currency.groupingSeparator,
			decimalCurrency: account.decimalCurrency,
		}

		const statementHeader = {
			transaction: Strings.CONTENT_HEADER_TRANSACTION.toUpperCase(),
			balance: Strings.CONTENT_HEADER_BALANCE.toUpperCase(),
			balanceLower: Strings.CONTENT_HEADER_BALANCE,
		}

		const data = {
			receiver,
			customer: { ...customer, info: this.customerInfo },
			store: { ...store, info: this.storeInfo },
			footer,
			currency,
			statementHeader,
			reasonMap: CustomerAccountMovementReason.items,
			userLanguage: account.currency.localeLanguageCode,
		}

		Keyboard.dismiss()
		if (!isOnline) {
			return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: 'OK' }])
		}

		this.props.sendCustomerAccountReceiptByEmail(data, callback)
	}

	takeShot() {
		const viewShot = this.viewShotRef.current
		if (!viewShot) {
			return
		}
		viewShot.capture().then((uri) => {
			Share.open({
				title: '',
				message: '',
				url: uri,
			})
		})
	}

	renderPageHeader() {
		return (
			<View style={styles.contentHorizontalSpace}>
				<TouchableOpacity onPress={() => this.props.navigation.goBack()}>
					<KyteIcon name={'cross-thin'} size={18} />
				</TouchableOpacity>
			</View>
		)
	}

	renderHeader() {
		const { store } = this.props
		const date = moment().format('L')
		const time = moment().format('LT')

		const renderLogo = () => (
			<View style={{ alignSelf: 'flex-start' }}>
				<LeftAlignedImage width={100} height={50} source={{ uri: getImagePath(store.imageURL) }} />
			</View>
		)

		const renderLogoName = () => (
			<View>
				<KyteText pallete={'secondaryBg'} weight={'Semibold'} size={18}>
					{store.name}
				</KyteText>
			</View>
		)

		const renderDatetime = () => {
			const datetimeText = (text) => (
				<KyteText weight={'Medium'} size={13}>
					{text}
				</KyteText>
			)
			return (
				<View style={{ alignItems: 'flex-end' }}>
					{datetimeText(date)}
					{datetimeText(time)}
				</View>
			)
		}

		return (
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
				{store.image ? renderLogo() : renderLogoName()}
				{renderDatetime()}
			</View>
		)
	}

	renderStoreInfo() {
		return (
			<View style={styles.contentHorizontalSpace}>
				<KyteText style={{ lineHeight: 16 }} pallete={'primaryBg'}>
					{this.storeInfo}
				</KyteText>
			</View>
		)
	}

	renderCustomerInfo() {
		const { customer } = this.props
		const customerContent = () => (
			<KyteText style={{ marginTop: 10, lineHeight: 16 }} pallete={'grayBlue'}>
				{this.customerInfo}
			</KyteText>
		)
		return (
			<View style={styles.contentHorizontalSpace}>
				<View style={{ flexDirection: 'row' }}>
					<KyteIcon name={'customer-filled'} size={12} color={colors.primaryBg} />
					<KyteText
						ellipsizeMode={'tail'}
						numberOfLines={1}
						weight={'Semibold'}
						style={{ paddingHorizontal: 5, flex: 1 }}
						size={13}
					>
						{customer.name}
					</KyteText>
					<KyteText size={13} pallete={'secondaryBg'}>
						{`${I18n.t('words.s.balance')}: `}
						<CurrencyText
							value={customer.accountBalance}
							useBalanceSymbol={customer.accountBalance >= 0 ? false : -1}
						/>
					</KyteText>
				</View>
				{this.customerInfo.length ? customerContent() : null}
			</View>
		)
	}

	renderContent() {
		const { accountStatements } = this.props

		const headerLabel = (label) => (
			<KyteText weight={'Medium'} size={14}>
				{label.toUpperCase()}
			</KyteText>
		)
		const renderStatements = (statement, i) => <StatementItem statement={statement} key={i} share />

		return (
			<View style={styles.contentHorizontalSpace}>
				<View style={styles.contentFilterInfo}>
					<KyteText weight={'Semibold'} size={13} style={{ textAlign: 'center' }}>
						{`${I18n.t('customerAccount.printAccountStatementLabel')}: `}
						{this.filterString}
					</KyteText>
				</View>
				<View style={styles.contentHeader}>
					{headerLabel(Strings.CONTENT_HEADER_TRANSACTION)}
					{headerLabel(Strings.CONTENT_HEADER_BALANCE)}
				</View>
				{accountStatements.slice(0, 10).map(renderStatements)}
			</View>
		)
	}

	async printStatements() {
		const { isBluetoothActive } = this.state
		const { customer } = this.props
		const { printer } = this.props
		const bluetoothConnect = 'android.permission.BLUETOOTH_CONNECT'
		const bluetoothScan = 'android.permission.BLUETOOTH_SCAN'

		if (!isBluetoothActive) {
			Alert.alert(I18n.t('words.s.attention'), I18n.t('storePrinterBluetoothOffIos'), [{ text: I18n.t('alertOk') }])
			return
		}

		const reqBluetoothPermissions = await requestBluetoothPermissions()
		if (Platform.OS === 'android' && Platform.Version >= 31) {
			if ((reqBluetoothPermissions[bluetoothConnect] && reqBluetoothPermissions[bluetoothScan]) !== 'granted') {
				return Alert.alert(I18n.t('permissionDeniedAlertTitle'), I18n.t('nearbyDevicesPermissionDenied'), [
					{ text: I18n.t('alertOk') },
				])
			}
		}

		if (!printer.id) {
			Alert.alert(I18n.t('words.s.attention'), I18n.t('storePrinterNoPrinterAdded'), [
				{ text: I18n.t('alertConfirm'), onPress: () => NavigationService.navigate('Config', 'StorePrinter') },
				{ text: I18n.t('alertDismiss') },
			])
			return
		}

		this.props.printCustomerStatements(customer)
	}

	renderOptions() {
		const { navigation, route } = this.props
		const { params = {} } = route
		const { navigate } = navigation
		const { email, share, print } = I18n.t('words.s')
		const { key, remoteKey } = Features.items[Features.PRINTERS]

		const options = [
			{
				title: email,
				subtitle: Strings.OPTIONS_SUBTITLES.complete,
				icon: { icon: 'send', color: '#FFF' },
				onPress: () =>
					navigate('ReceiptSendEmail', {
						key: params.key,
						origin: 'customer-account',
						receiptSender: this.receiptSender.bind(this),
					}),
			},
			{
				title: print,
				subtitle: Strings.OPTIONS_SUBTITLES.last_10,
				icon: { icon: 'printer', color: '#FFF' },
				onPress: () => this.props.checkFeatureIsAllowed(key, () => this.printStatements(), remoteKey),
			},
			{
				title: share,
				subtitle: Strings.OPTIONS_SUBTITLES.last_10,
				icon: { icon: 'share', color: '#FFF' },
				onPress: async () => {
					const hasPermission = await requestPermission(PHOTO_LIBRARY)
					hasPermission && this.takeShot()
				},
			},
		]

		return <ListOptionsWide reverseColor items={options} titleStyle={{ fontSize: 12 }} />
	}

	renderLoader() {
		return <LoadingCleanScreen />
	}

	renderBottomInfo() {
		const { accountStatements } = this.props
		const textStyle = { textAlign: 'center', lineHeight: 16 }

		return (
			<View style={styles.bottomInfo}>
				<KyteText style={textStyle} pallete={'primaryBg'}>
					{I18n.t('customerAccount.shareStatementsBottomInfo1')}
					{` ${accountStatements.length} `}
					{I18n.t('customerAccount.shareStatementsBottomInfo2')}
				</KyteText>
			</View>
		)
	}

	render() {
		return (
			<KyteSafeAreaView style={styles.safeAreaView}>
				<ScrollView>
					<ViewShot
						style={{ backgroundColor: '#FFF' }}
						ref={this.viewShotRef}
						options={{ format: 'png', quality: 0.9, result: 'tmpfile' }}
					>
						{this.renderPageHeader()}
						{this.renderHeader()}
						{this.storeInfo.length ? this.renderStoreInfo() : null}
						{this.renderCustomerInfo()}
						{this.renderContent()}
						{this.renderBottomInfo()}
					</ViewShot>
				</ScrollView>
				{this.renderOptions()}
				{this.props.isLoaderVisible ? this.renderLoader() : null}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	safeAreaView: {
		height: '100%',
	},
	headerContainer: {
		flexDirection: 'row',
	},
	contentFilterInfo: {
		alignItems: 'center',
		paddingBottom: 15,
		borderBottomWidth: 2,
		borderBottomColor: colors.littleDarkGray,
	},
	contentHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 25,
	},
	contentHorizontalSpace: {
		padding: 15,
	},
	bottomInfo: {
		padding: 15,
		backgroundColor: colors.lightBg,
	},
}

const mapStateToProps = ({ auth, customers, preference, common, printer }) => ({
	store: auth.store,
	customer: customers.detail,
	accountStatements: customers.detail.accountStatements,
	account: preference.account,
	isLoaderVisible: common.loader.visible,
	printer,
	isOnline: common.isOnline,
})

export default connect(mapStateToProps, {
	checkFeatureIsAllowed,
	printCustomerStatements,
	sendCustomerAccountReceiptByEmail,
})(CustomerStatementsShare)
