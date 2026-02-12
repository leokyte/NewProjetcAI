import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { Icon } from 'react-native-elements'
import { KyteModal, ListOptions, DetailPage, SwitchContainer, CheckList } from '../../common'
import { logEvent } from '../../../integrations/Firebase-Integration'
import { colors } from '../../../styles'
import {
	productsFetch,
	preferenceSetCanceledSale,
	preferenceSetDecimalCurrency,
	preferenceSetCheckoutSort,
	updateQuantitySales,
	// saveHelperStep, // removed in core actions refactor
} from '../../../stores/actions'
import I18n from '../../../i18n/i18n'
import { checkUserPermission } from '../../../util'
import { KyteSwitch } from '@kyteapp/kyte-ui-components'
import InitialScreenSelector from './InitialScreenSelector'

class StorePreferences extends Component {
	// static navigationOptions = () => ({ header: null })

	constructor(props) {
		super(props)
		const { canceledSales } = I18n.t('configGeneralOptions')

		this.state = {
			notifyDaily: true,
			notifyWeekly: true,
			isModalVisible: false,
			canceledSalesInfo: {
				title: canceledSales.title,
				options: [
					{ title: canceledSales.showCanceled, onPress: () => this.setSaleVisibility(true) },
					{ title: canceledSales.hideCanceled, onPress: () => this.setSaleVisibility(false) },
				],
			},
			checkoutSortInfo: {
				title: I18n.t('configGeneralOptions.checkoutSort.title'),
				options: [
					{
						title: I18n.t('configGeneralOptions.checkoutSort.dateCreation'),
						onPress: () => this.setCheckoutSort('dateCreation'),
					},
					{
						title: I18n.t('configGeneralOptions.checkoutSort.name'),
						onPress: () => this.setCheckoutSort('name'),
					},
				],
			},
			modalInfoName: 'canceledSalesInfo',
		}
	}
	componentDidMount() {
		logEvent('General Config View')
	}

	setSaleVisibility(value) {
		this.props.preferenceSetCanceledSale(value, () => {
			this.props.updateQuantitySales()
		})
		this.hideModal()
	}

	setCheckoutSort(value) {
		const { selectedCategory } = this.props
		const sort = { key: value, isDesc: false }

		this.props.preferenceSetCheckoutSort(value)
		this.props.productsFetch(sort, null, selectedCategory, { limit: 40, length: 0 }, 'reboot')
		this.hideModal()
	}

	goToCurrency() {
		const { navigate } = this.props.navigation
		const { isOnline } = this.props

		if (!isOnline) {
			return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
		}

		navigate('StoreCurrency')
	}

	toggleDailyNotification(value) {
		const { notifyDaily } = this.state
		this.setState({ notifyDaily: value || !notifyDaily })
	}

	toggleWeeklyNotification(value) {
		const { notifyWeekly } = this.state
		this.setState({ notifyWeekly: value || !notifyWeekly })
	}

	hideModal() {
		this.setState({ isModalVisible: false })
	}

	showModal(modalInfoName) {
		this.setState({ isModalVisible: true, modalInfoName })
	}

	alertDecimalCurrency() {
		const currencyExemple = !this.props.decimalCurrency ? '$ 12.99' : '$ 12'
		const setDecimalCurrency = () => {
			const { decimalCurrency, selectedCategory, checkoutSort } = this.props
			const sort = { key: checkoutSort, isDesc: false }

			this.props.preferenceSetDecimalCurrency(!decimalCurrency)
			this.props.productsFetch(sort, null, selectedCategory, { limit: 40, length: 0 }, 'reboot')
		}

		Alert.alert(
			I18n.t('configGeneralOptions.decimalSeparator.title'),
			`${I18n.t('configGeneralOptions.decimalSeparator.confirmText1')}\n\n${I18n.t(
				'configGeneralOptions.decimalSeparator.confirmText2'
			)} ${currencyExemple}`,
			[
				{
					text: I18n.t('alertDismiss').toUpperCase(),
				},
				{
					text: I18n.t('alertOk').toUpperCase(),
					onPress: setDecimalCurrency,
				},
			]
		)
	}

	renderDropDownModal() {
		const { modalInfoName } = this.state
		const info = this.state[modalInfoName]
		return (
			<KyteModal bottomPage height="auto" title={info.title} isModalVisible hideModal={() => this.hideModal()}>
				<ListOptions items={info.options} hideChevron />
			</KyteModal>
		)
	}

	renderDropDownItem(info, placeholderIndex, modalInfoName) {
		const { selectContent, selectText, selectArrow, actionItem, actionTitle } = styles
		return (
			<TouchableOpacity style={actionItem} onPress={() => this.showModal(modalInfoName)}>
				<Text style={actionTitle}>{info.title}</Text>
				<View style={selectContent}>
					<View style={{ flex: 1 }}>
						<Text style={selectText}>{info.options[placeholderIndex].title}</Text>
					</View>
					<Icon
						containerStyle={selectArrow}
						name="ios-arrow-down"
						type="ionicon"
						size={12}
						color={colors.primaryColor}
					/>
				</View>
			</TouchableOpacity>
		)
	}

	renderChecklist(info, checkIndex) {
		return (
			<View style={styles.actionItem()}>
				<Text style={styles.actionTitle}>{info.title}</Text>
				<View style={styles.actionCheckListContainer}>
					<CheckList
						options={info.options.map((o) => ({
							description: o.title,
						}))}
						onPress={(i) => info.options[i].onPress()}
						selected={checkIndex}
						noPaddingHorizontal
					/>
				</View>
			</View>
		)
	}

	render() {
		const { goBack, navigate } = this.props.navigation
		const { notifyDaily, notifyWeekly, isModalVisible, canceledSalesInfo, checkoutSortInfo } = this.state
		const { countryCode, currencySymbol } = this.props.currency
		const { decimalCurrency, showCanceledSales, checkoutSort, permissions } = this.props
		const { isOwner } = checkUserPermission(permissions)
		const { currency, notifications } = I18n.t('configGeneralOptions')
		const {
			contentContainer,
			actionItem,
			actionTitle,
			actionContent,
			actionContentText,
			actionSmallText,
			optionList,
			optionItem,
			optionText,
		} = styles

		return (
			<DetailPage pageTitle={I18n.t('configGeneralPageTitle')} goBack={goBack}>
				<ScrollView style={contentContainer}>
					<InitialScreenSelector />

					<View style={actionItem(true)}>
						<Text style={actionTitle}>{currency}</Text>
						<View style={actionContent}>
							<TouchableOpacity onPress={() => this.goToCurrency()}>
								<Text style={actionContentText}>
									{countryCode ? `${countryCode} - ${currencySymbol}` : I18n.t('configGeneralOptions.chooseCurrency')}
								</Text>
							</TouchableOpacity>
						</View>
					</View>

					<SwitchContainer
						style={actionItem(true)}
						title={I18n.t('configGeneralOptions.decimalSeparator.title')}
						onPress={() => this.alertDecimalCurrency()}
					>
						<KyteSwitch onValueChange={() => this.alertDecimalCurrency()} active={decimalCurrency} />
					</SwitchContainer>

					{this.renderChecklist(canceledSalesInfo, showCanceledSales ? 0 : 1)}
					{this.renderChecklist(checkoutSortInfo, checkoutSort === 'dateCreation' ? 0 : 1)}

					<View style={[actionItem(true), { display: 'none' }]}>
						<Text style={actionTitle}>{notifications.title}</Text>
						<View style={optionList}>
							<TouchableOpacity onPress={() => this.toggleDailyNotification()}>
								<View style={optionItem}>
									<Text style={optionText}>{notifications.notifyDaily}</Text>
									<KyteSwitch onValueChange={(value) => this.toggleDailyNotification(value)} active={notifyDaily} />
								</View>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => this.toggleWeeklyNotification()}>
								<View style={optionItem}>
									<Text style={optionText}>{notifications.notifyWeekly}</Text>
									<KyteSwitch onValueChange={(value) => this.toggleWeeklyNotification(value)} active={notifyWeekly} />
								</View>
							</TouchableOpacity>
						</View>
					</View>

					{isOwner ? (
						<View style={actionItem(true)}>
							<View>
								<TouchableOpacity onPress={() => navigate('StoreReset')}>
									<Text style={actionSmallText}>{I18n.t('eraseTransactionsPageTitle')}</Text>
								</TouchableOpacity>
							</View>
						</View>
					) : null}
				</ScrollView>
				{isModalVisible ? this.renderDropDownModal(canceledSalesInfo) : null}
			</DetailPage>
		)
	}
}

const styles = {
	contentContainer: {
		backgroundColor: colors.lightBg,
	},
	actionItem: (paddingBottom = false) => {
		return {
			flexDirection: 'column',
			borderBottomWidth: 1,
			borderColor: colors.borderColor,
			paddingTop: 22,
			paddingBottom: paddingBottom ? 22 : 0,
			paddingHorizontal: 15,
			backgroundColor: 'white',
			marginBottom: 15,
		}
	},
	actionTitle: {
		fontFamily: 'Graphik-Medium',
		fontSize: 15,
		color: colors.primaryColor,
	},
	actionCheckListContainer: {
		paddingTop: 20,
	},
	actionContent: {
		paddingTop: 10,
	},
	selectContent: {
		borderColor: colors.primaryColor,
		flexDirection: 'row',
		paddingTop: 10,
		paddingBottom: 5,
		paddingRight: 10,
		alignSelf: 'flex-start',
	},
	selectText: {
		fontFamily: 'Graphik-Regular',
		fontSize: 14,
		color: colors.primaryColor,
	},
	actionContentText: {
		fontFamily: 'Graphik-Light',
		fontSize: 25,
		color: colors.primaryColor,
	},
	actionSmallText: {
		fontFamily: 'Graphik-Regular',
		fontSize: 14,
		color: colors.errorColor,
		textAlign: 'center',
	},
	optionList: {
		paddingTop: 5,
	},
	optionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 10,
	},
	optionText: {
		fontFamily: 'Graphik-Regular',
		color: colors.primaryColor,
		fontSize: 14,
		flex: 1,
	},
	selectArrow: {
		marginLeft: 20,
	},
}

const mapStateToProps = ({ preference, common, auth, productCategory }) => ({
	currency: preference.account.currency,
	decimalCurrency: preference.account.decimalCurrency,
	showCanceledSales: preference.account.showCanceledSales,
	checkoutSort: preference.account.checkoutSort,
	isOnline: common.isOnline,
	permissions: auth.user.permissions,
	selectedCategory: productCategory.selected,
})

export default connect(mapStateToProps, {
	productsFetch,
	preferenceSetCanceledSale,
	preferenceSetDecimalCurrency,
	preferenceSetCheckoutSort,
	updateQuantitySales,
})(StorePreferences)
