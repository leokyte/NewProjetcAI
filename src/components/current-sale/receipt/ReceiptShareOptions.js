import { View, ScrollView, Alert, Platform, TouchableOpacity, FlatList } from 'react-native'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ViewShot from 'react-native-view-shot'
import Share from 'react-native-share'
import { BleManager } from 'react-native-ble-plx'
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import RNFetchBlob from 'rn-fetch-blob'
import FileViewer from 'react-native-file-viewer'
import { PHOTO_LIBRARY, Features, PaymentType, OrderStatus, SaleOrigin, CONTACTS } from '../../../enums'

import {
	ListOptionsWide,
	KyteToolbar,
	LoadingCleanScreen,
	KyteSafeAreaView,
	KyteIcon,
	KyteText,
	KyteAlertV2,
} from '../../common'
import { scaffolding, colors } from '../../../styles'
import ReceiptPreview from './ReceiptPreview'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'
import { receiptMailTo, printSaleReceipt, checkFeatureIsAllowed, checkPlanKeys } from '../../../stores/actions'
import {
	generateReceiptPDF,
	formatCustomerInformation,
	formatStoreInformation,
	checkUserPermission,
	generateTestID,
} from '../../../util'
import { requestPermission } from '../../../util/util-permissions'

class ReceiptShareOptions extends Component {
	constructor(props) {
		super(props)
		const { params = {} } = props.route
		const { sale = props.lastSale } = params

		this.state = {
			receiptImage: '',
			isPrinting: false,
			isLoading: false,
			printerKey: Features.items[Features.PRINTERS].key,
			printerRemoteKey: Features.items[Features.PRINTERS].remoteKey,
			isPlanAllowed: false,
			haveInternet: props.isOnline,
			storeLogoBase64: null,
			storeLabel: '',
			customerLabel: '',
			virtualSale: {},
			isBluetoothActive: false,
			sale,
			permissionModal: false,
			permissionModalContent: [],
		}

		this.manager = new BleManager()
		this.bluetoothStatusSubscription = null

		this.fromConfig = props.route.key.indexOf('FromConfig') >= 0
		this.isAdmin = checkUserPermission(props.user.permissions).isAdmin

		this.viewShared = React.createRef()
	}

	UNSAFE_componentWillMount() {
		const { sale } = this.state

		this.props.receiptMailTo(sale.customer)
		this.checkPlanKeys()
		this.generateFormatedInfos()
		this.checkCustomerIn()
	}

	componentDidUpdate(prevProps) {
		if (this.props.store.customerExtra !== prevProps.store.customerExtra) {
			this.checkCustomerIn()
		}
	}

	componentDidMount() {
		this.bluetoothStatusSubscription = this.manager.onStateChange(
			(state) => this.setState({ isBluetoothActive: state === 'PoweredOn' }),
			true
		)
		this.fetchStoreLogoBase64()
	}

	componentWillUnmount() {
		if (this.bluetoothStatusSubscription) {
			this.bluetoothStatusSubscription.remove()
			this.bluetoothStatusSubscription = null
		}
	}

	checkCustomerIn() {
		const { sale } = this.state
		const { store } = this.props
		const { customerExtra } = store
		const { customer, payments } = sale

		const checkPayments = () => payments.find((p) => p.type === PaymentType.ACCOUNT)

		let customerIn = false
		if (customerExtra && customer) customerIn = true
		else if (checkPayments()) customerIn = true // Ifs separado para não varrer o array de pagamentos em vão.

		const hasPayments = () => {
			const hasChosenPayment = sale.origin === SaleOrigin.CATALOG && payments.length
			const isPaid = sale.status === OrderStatus.items[OrderStatus.PAID].status
			const isClosed = sale.status === 'closed' // TODO: point to OrderStatus enum
			return Boolean(payments.find((p) => p.transaction) || isPaid || isClosed || hasChosenPayment)
		}

		const clonedSale = sale.clone ? { ...sale.clone() } : sale

		this.setState({
			virtualSale: {
				...clonedSale,
				customer: customerIn ? sale.customer : null,
				payments: hasPayments() ? sale.payments : [],
			},
		})
	}

	generateFormatedInfos() {
		const { sale } = this.state
		const { store } = this.props

		if (store) {
			this.setState({
				storeLabel: formatStoreInformation(store.address, store.addressComplement, store.phone, store.headerExtra),
			})
		}
		if (sale.customer) {
			const { customer } = sale
			this.setState({
				customerLabel: formatCustomerInformation(
					customer.address,
					customer.addressComplement,
					customer.celPhone || customer.phone
				),
			})
		}
	}

	fetchStoreLogoBase64() {
		const { store, isOnline } = this.props
		if (!store.imageURL || !isOnline) return

		const { fs } = RNFetchBlob
		let imagePath = null

		RNFetchBlob.config({
			fileCache: true,
		})
			.fetch('GET', store.imageURL)
			.then((response) => {
				imagePath = response.path()
				return response.readFile('base64')
			})
			.then(
				(storeLogoBase64) => this.setState({ storeLogoBase64 }),
				() => fs.unlink(imagePath)
			)
			.catch((error) => {
				/* just to prevent app crashes */
			})
	}

	async checkPlanKeys() {
		const { printerKey } = this.state
		this.setState({ isPlanAllowed: await this.props.checkPlanKeys(printerKey) })
	}

	async takeShot() {
		try {
			const uri = await this.viewShared.current.capture()
			Share.open({
				title: '',
				message: '',
				url: uri,
			})
		} catch (err) {
			console.log(err)
		}
	}

	toggleLoading(status) {
		this.setState({ isPrinting: status })
	}

	async printReceipt() {
		const { navigate } = this.props.navigation
		const { printer, store } = this.props
		const { virtualSale, isBluetoothActive } = this.state

		if (!isBluetoothActive) {
			Alert.alert(I18n.t('words.s.attention'), I18n.t('storePrinterBluetoothOffIos'), [{ text: I18n.t('alertOk') }])
			return
		}

		if (!printer.id) {
			Alert.alert(I18n.t('words.s.attention'), I18n.t('storePrinterNoPrinterAdded'), [
				{
					text: I18n.t('alertConfirm'),
					onPress: () => navigate({ key: 'ConfigReceiptPage', name: 'ConfigReceipt' }),
				},
				{ text: I18n.t('alertDismiss') },
			])
			return
		}
		this.toggleLoading(true)
		for (let i = 0; i < printer.repeatPrint; i++) {
			await this.props
				.printSaleReceipt(virtualSale, { ...store, customerExtra: !!virtualSale.customer })
				.then(() => this.toggleLoading(false))
				.catch((ex) => this.toggleLoading(false))
		}
	}

	async generatePDF() {
		const { store, user, multiUsers, currency, decimalCurrency } = this.props
		const { haveInternet, storeLogoBase64, virtualSale } = this.state
		const { status } = this.props.billing
		const shouldShowCTA = Boolean(status === 'trial')

		if (!storeLogoBase64) await this.fetchStoreLogoBase64()

		const isAndroid = Platform.OS === 'android'
		const { doc, receiptName } = generateReceiptPDF(
			virtualSale,
			{ ...store, imageBase64: storeLogoBase64 },
			user,
			multiUsers,
			currency,
			decimalCurrency,
			haveInternet,
			isAndroid,
			shouldShowCTA
		)
		const options = {
			html: doc,
			fileName: receiptName,
			directory: 'Documents',
		}

		// START Loading
		this.setState({ isLoading: true })

		const file = await RNHTMLtoPDF.convert(options)

		// Transfer PDF to File System
		const { dirs } = RNFetchBlob.fs
		const FILE_NAME = `${receiptName}.pdf`
		const DIST_DIR = isAndroid ? dirs.DownloadDir : `${dirs.DocumentDir}/Kyte`
		const FILE_PATH = `${DIST_DIR}/${FILE_NAME}`

		// Mv File Promise
		const mvFile = () =>
			RNFetchBlob.fs
				.mv(file.filePath, FILE_PATH)
				.then(() => {
					if (isAndroid) RNFetchBlob.fs.scanFile([{ path: FILE_PATH, mime: 'application/pdf' }])
				})
				// END Loading
				.finally(() => {
					this.setState({ isLoading: false })
					FileViewer.open(FILE_PATH)
				})

		// Overwrite ON in Android - We just move the file
		if (isAndroid) mvFile()
		// Overwrite OFF in iOS - We first remove old file then move the new one
		else {
			RNFetchBlob.fs.unlink(FILE_PATH).then(() => mvFile())
		}
	}

	renderShareOptions() {
		const { navigate } = this.props.navigation
		const { params, key } = this.props.route
		const { origin } = params
		const { email, share, print } = I18n.t('words.s')
		const { decimalCurrency } = this.props
		const { printerKey, printerRemoteKey, isPlanAllowed, storeLabel, customerLabel, virtualSale } = this.state

		const options = [
			{
				title: 'PDF',
				icon: { icon: 'pdf', color: '#FFF' },
				onPress: () => {
					this.props.checkFeatureIsAllowed(
						printerKey,
						async () => {
							const hasPermission = await requestPermission(PHOTO_LIBRARY)

							if (hasPermission) {
								this.generatePDF()
							}
						},
						printerRemoteKey
					)
				},
			},
			{
				title: email,
				icon: { icon: 'send', color: '#FFF' },
				onPress: () =>
					navigate('ReceiptSendEmail', {
						sale: { ...virtualSale, storeLabel, customerLabel, decimalCurrency },
						origin,
						routeKey: key,
					}),
			},
			{
				title: print,
				icon: { icon: 'printer', color: '#FFF' },
				onPress: () => this.props.checkFeatureIsAllowed(printerKey, () => this.printReceipt(), printerRemoteKey),
				shareOptionsProLabel: !isPlanAllowed,
			},
			{
				title: share,
				icon: { icon: 'share', color: '#FFF' },
				onPress: async () => {
					const hasPermission = await requestPermission(CONTACTS)

					if (hasPermission) {
						this.takeShot()
						logEvent('CustomerAccountReceiptShared')
					}
				},
			},
		]

		return <ListOptionsWide reverseColor items={options} titleStyle={{ fontSize: 12 }} />
	}

	renderLoader(text) {
		return <LoadingCleanScreen text={text} />
	}

	renderConfigStripe() {
		if (this.fromConfig) return null

		const color = colors.primaryDarker
		const navigate = () => this.props.navigation.navigate({ key: 'ConfigReceiptPage', name: 'ConfigReceipt' })
		return (
			<TouchableOpacity
				style={styles.configStripeContainer}
				onPress={() => navigate()}
				{...generateTestID('edit-receipt')}
			>
				<KyteIcon name="edit" color={color} size={16} style={{ marginRight: 10 }} />
				<KyteText color={color} size={12} weight="Medium">
					{I18n.t('EditMyReceiptLabel')}
				</KyteText>
			</TouchableOpacity>
		)
	}

	render() {
		const { containerStyles, containerBg } = styles
		const { outerContainer } = scaffolding
		const { goBack } = this.props.navigation
		const { params = {} } = this.props.route
		const { storeEditing, companyLogo } = params
		const { isPrinting, isLoading, storeLabel, customerLabel, virtualSale, permissionModal, permissionModalContent } =
			this.state

		return (
			<KyteSafeAreaView style={outerContainer}>
				{this.isAdmin ? this.renderConfigStripe() : null}
				<KyteToolbar
					showCloseButton
					innerPage={!params.isOuterPage}
					borderBottom={0}
					headerTitle=""
					goBack={() => goBack()}
				/>
				<View style={containerStyles}>
					<ScrollView>
						<ViewShot
							style={containerBg}
							ref={this.viewShared}
							options={{ format: 'png', quality: 0.9, result: 'tmpfile' }}
						>
							<ReceiptPreview
								sale={virtualSale}
								storeEditing={storeEditing}
								companyLogo={companyLogo}
								storeLabel={storeLabel}
								customerLabel={customerLabel}
							/>
						</ViewShot>
					</ScrollView>
					{this.renderShareOptions()}
				</View>
				{isPrinting ? this.renderLoader(I18n.t('storePrinterPrinting')) : null}
				{isLoading ? this.renderLoader(I18n.t('words.s.loading')) : null}
				<KyteAlertV2
					hideModal={() => this.setState({ permissionModal: false })}
					isModalVisible={permissionModal}
					contentModal={{
						oneButton: true,
						titleHeader: I18n.t('permissionModal.title'),
						description: I18n.t('permissionModal.description'),
						children: (
							<FlatList
								data={permissionModalContent}
								renderItem={({ item, index }) => (
									<KyteText weight={500} style={{ marginTop: index === 0 ? 15 : 5 }} size={14}>
										- {item}
									</KyteText>
								)}
							/>
						),
					}}
				/>
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	containerStyles: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	kyteIconSpacing: {
		marginRight: 15,
		marginLeft: 8,
	},
	libIconSpacing: {
		marginRight: 14,
		marginLeft: 7,
	},
	containerBg: {
		backgroundColor: '#FFF',
	},
	configStripeContainer: {
		backgroundColor: colors.littleDarkGray,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 13,
		paddingBottom: 10,
	},
}

const mapStateToProps = (state) => ({
	printer: state.printer,
	billing: state.billing,
	store: state.auth.store,
	user: state.auth.user,
	multiUsers: state.auth.multiUsers,
	currency: state.preference.account.currency,
	decimalCurrency: state.preference.account.decimalCurrency,
	isOnline: state.common.isOnline,
	lastSale: state.lastSale,
})

export default connect(mapStateToProps, {
	receiptMailTo,
	printSaleReceipt,
	checkFeatureIsAllowed,
	checkPlanKeys,
})(ReceiptShareOptions)
