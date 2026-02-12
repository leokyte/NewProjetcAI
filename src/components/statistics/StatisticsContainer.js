import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, ScrollView, Dimensions, Platform, Alert } from 'react-native'
import { LineChart, ProgressCircle } from 'react-native-svg-charts'
import { Circle } from 'react-native-svg'
import * as shape from 'd3-shape'
import moment from 'moment/min/moment-with-locales'
import ViewShot from 'react-native-view-shot'
import Share from 'react-native-share'
import _ from 'lodash'

import { logEvent, remoteConfigGetValue } from '../../integrations'
import StatisticsPanel from './StatisticsPanel'
import { KyteToolbar, LoadingCleanScreen, KyteSafeAreaView, CurrencyText } from '../common'
import StatisticsButton from './StatisticsButton'
import {
	periodNavigate,
	statisticsFetch,
	dataTypeSet,
	periodTypeSet,
	checkFeatureIsAllowed,
	checkPlanKeys,
	salesSetFilter,
	updateQuantitySales
} from '../../stores/actions'
import { scaffolding, colors } from '../../styles'
import { PaymentType, Period, toList, Features } from '../../enums'
import I18n from '../../i18n/i18n'
import { StatisticEmptyIcon } from '../../../assets/images'
import { billingCheckAnalyticsPeriodDate, currencyValueFormatter, getNormalizedLocale, imgUrl } from '../../util'
import OnboardingCarousel from '../common/OnboardingCarousel'
import EmptyState from '../common/EmptyState'

const onboardingCarouselList = [
	{
		title: I18n.t('onboarding.statistics.slide1.title'),
		paragraph: I18n.t('onboarding.statistics.slide1.description'),
	},
	{
		title: I18n.t('onboarding.statistics.slide2.title'),
		paragraph: I18n.t('onboarding.statistics.slide2.description'),
	},
	{
		title: I18n.t('onboarding.statistics.slide3.title'),
		paragraph: I18n.t('onboarding.statistics.slide3.description'),
	},
	{
		title: I18n.t('onboarding.statistics.slide4.title'),
		paragraph: I18n.t('onboarding.statistics.slide4.description'),
	},
	{
		title: I18n.t('onboarding.statistics.slide5.title'),
		paragraph: I18n.t('onboarding.statistics.slide5.description'),
	},
]

class StatisticsContainer extends Component {
	static navigationOptions = () => ({
		header: null,
	})

	constructor(props) {
		super(props)
		const { key, remoteKey } = Features.items[Features.ANALYTICS]

		this.viewShotRef = React.createRef()

		const periods = toList(Period)
		this.state = {
			key,
			remoteKey,
			date: moment(new Date()),
			dateType: 'month',
			periods: periods.slice(1, periods.length),
			loading: true,
			onboardingCarouselImageList: [],
			activeSlide: 0,
		}

		this.statisticsPanels = []
	}

	componentDidMount() {
		const { navigation, route } = this.props
		const { params = {} } = route
		const navigateToDetail = (statisticType) => {
			if (!statisticType || this.statisticsPanels.length <= 0) return

			const findStatistic = _.find(this.statisticsPanels, (s) => s.panelTitle === statisticType)
			if (!findStatistic) return

			this.statisticDetail(findStatistic)
		}

		this.callStatistics()
		this.willFocusListener = navigation.addListener('focus', () => {
			const statisticType = params.statisticType || null
			navigateToDetail(statisticType)
		})
		this.props.updateQuantitySales('closed')

		remoteConfigGetValue(
			'OnboardingCarousel',
			(key) => {
				this.setState({
					onboardingCarouselImageList: key.statistics,
				})
			},
			'json'
		)
	}

	componentWillUnmount() {
		if (this.willFocusListener) this.willFocusListener = null
	}

	getOnboardingCarouselData() {
		const { onboardingCarouselImageList } = this.state
		const locale = getNormalizedLocale(I18n.locale)
		return onboardingCarouselList.map((item, index) => {
			const { title, paragraph } = item
			const imagePath = `${imgUrl}/.kyte%2Fonboarding%2F${onboardingCarouselImageList[index]?.[locale]}.png?alt=media&token=6de6d7f6-24ae-4116-b6a8-a2e8a5d1f86c`

			return {
				image: imagePath,
				title,
				paragraph,
			}
		})
	}

	async callStatistics() {
		const { periodRange } = this.props
		const { key } = this.state

		if (await this.props.checkPlanKeys(key)) {
			await this.props.statisticsFetch(periodRange.startDate, periodRange.endDate)
		} else {
			const today = this.state.periods[0]
			const todayFormatted = moment(new Date()).format(this.props.statistics.filter.dateFormat)
			this.props.periodTypeSet(today.type, today.period, false)
			await this.props.statisticsFetch(todayFormatted, todayFormatted)
		}
	}

	shareStatistics() {
		const { date } = this.state
		const selectOs = (uri) => {
			let defaultObject = {
				title: `${I18n.t('statistics')} - ${date.format('MMMM')}`,
				subject: `${I18n.t('statistics')} - ${date.format('MMMM')}`,
				url: uri,
			}
			if (Platform.OS === 'android') {
				defaultObject = { ...defaultObject, message: `${I18n.t('statistics')} - ${date.format('MMMM')}` }
			}
			return defaultObject
		}

		const viewShot = this.viewShotRef.current
		if (!viewShot) {
			return
		}
		viewShot.capture().then((uri) => {
			Share.open(selectOs(uri)).then(() => logEvent('StatisticsShared'))
		})
	}

	filterOnClick(indicator) {
		const { isOnline, statistics } = this.props
		const { filter } = statistics
		const { key, remoteKey } = this.state
		const { periodRange, dateFormat } = filter
		const setPeriod = (period, from) => {
			return moment(periodRange[period])[indicator](1, filter.type)[from](filter.type).format(dateFormat)
		}

		if (!isOnline) {
			return this.offlineAlert()
		}

		const startPeriod = setPeriod('startDate', 'startOf')

		const doPeriodNavigate = () => {
			this.props.periodNavigate(indicator).then(() => {
				this.props.statisticsFetch(startPeriod, setPeriod('endDate', 'endOf'))
				logEvent('StatisticsDateFilterChange')
			})
		}

		if (billingCheckAnalyticsPeriodDate(startPeriod, dateFormat)) {
			doPeriodNavigate()
		} else {
			this.props.checkFeatureIsAllowed(key, () => doPeriodNavigate(), remoteKey)
		}
	}

	titleOnClick() {
		const { isOnline, navigation } = this.props
		if (!isOnline) {
			return this.offlineAlert()
		}
		return navigation.navigate({
			key: 'StatisticsFilterPage',
			name: 'StatisticsFilter',
		})
	}

	maskPanelValue(value, type) {
		const { currency } = this.props

		if (type === 'money') return <CurrencyText value={value} />
		if (type === 'percent') return `${currencyValueFormatter(value, currency, true).replace('.00', '')}%`
		return value
	}

	statisticDetail(panel) {
		const { navigate } = this.props.navigation
		this.props.dataTypeSet(panel.panelDataType)
		navigate({
			key: 'StatisticsDetailPage',
			name: 'StatisticsDetail',
			params: { panel },
		})
	}

	renderFilterButton() {
		const { filter } = this.props.statistics
		return (
			<StatisticsButton
				filter={filter}
				periods={this.state.periods}
				titleOnClick={this.titleOnClick.bind(this)}
				filterOnClick={this.filterOnClick.bind(this)}
			/>
		)
	}

	renderGraphic(statisticsPanel) {
		if (statisticsPanel.panelChartType === 'LineChart') {
			const Decorator = ({ x, y, data }) => {
				return data.map((value, index) => {
					if (data.length > 1 && (data.length - 1 === index || index === 0)) {
						return (
							<Circle
								key={index}
								cx={x(index)}
								cy={y(value)}
								r={4}
								stroke={'rgb(46, 209, 172)'}
								fill={'rgb(46, 209, 172)'}
							/>
						)
					}
					return null
				})
			}

			return (
				<LineChart
					style={{ height: 50 }}
					data={statisticsPanel.panelData}
					curve={shape.curveNatural}
					contentInset={{ top: 10, bottom: 10, left: 5, right: 5 }}
					svg={{
						strokeWidth: 3,
						stroke: 'rgba(46, 209, 172, 0.8)',
					}}
				>
					<Decorator />
				</LineChart>
			)
		}
		return (
			<ProgressCircle
				style={{ height: 50 }}
				contentInset={{ left: 5, right: 5 }}
				progress={statisticsPanel.panelData}
				progressColor={'rgba(46, 209, 172, 0.8)'}
				strokeWidth={3}
			/>
		)
	}

	createStatisticsData() {
		const { statistics, periodRange } = this.props
		const startDate = new moment(periodRange.startDate)
		const endDate = new moment(periodRange.endDate)
		const periodDuration = moment.duration(endDate.diff(startDate)).asMonths().toFixed(1)
		const { sales, salesByHours } = statistics.statisticsData
		const isSameDay = moment(periodRange.startDate).isSame(periodRange.endDate, 'day')

		const setData = () => {
			return isSameDay ? salesByHours : sales
		}
		const salesData = setData() || []
		const {
			income,
			salesTotal,
			averageTicket,
			paymentMetod,
			profit,
			taxes,
			topPaymentMetod,
			topProduct,
			topUser,
			topCustomer,
			topIncome,
			topSales,
			topAvg,
			topProfit,
			topTaxes,
		} = statistics.dashboardData

		const chartData = (type) =>
			salesData.map((data) => {
				return data[type]
			})
		const dateSubtitle = (property) => {
			if (!property) return I18n.t('statisticNoDataForThisPeriod')
			if (periodDuration > 2) return `${I18n.t('statisticBestMonth')}: ${moment(property._id).format('MMMM')}`
			return `${I18n.t('statisticBestDay')}: ${moment(property._id).format('DD MMM')}`
		}
		const paymentSubTitle = (type) => {
			const prefix = () => {
				if (type === 0) return I18n.t('statisticPaymentMethod.paidIn')
				if (type === 5) return I18n.t('statisticPaymentMethod.used')
				return I18n.t('statisticPaymentMethod.paidBy')
			}
			const paymentType = PaymentType.items[type] || {}
			return `${prefix()} ${paymentType.description}`
		}
		this.statisticsPanels = [
			{
				panelTitle: 'statisticRevenue',
				panelValue: income,
				panelValueType: 'money',
				panelSubtitle: dateSubtitle(topIncome),
				panelData: chartData('total'),
				panelChartType: 'LineChart',
				panelDetailType: 'sales',
				panelDataType: { type: 'income', unity: 'total' },
				panelHasHelp: true,
			},
			{
				panelTitle: 'statisticSales',
				panelValue: salesTotal,
				panelValueType: 'number',
				panelSubtitle: dateSubtitle(topSales),
				panelData: chartData('count'),
				panelChartType: 'LineChart',
				panelDetailType: 'sales',
				panelDataType: { type: 'salesTotal', unity: 'count' },
			},
			{
				panelTitle: 'statisticAverageTicketSize',
				panelValue: averageTicket,
				panelValueType: 'money',
				panelSubtitle: dateSubtitle(topAvg),
				panelData: chartData('avg'),
				panelChartType: 'LineChart',
				panelDetailType: 'sales',
				panelDataType: { type: 'averageTicket', unity: 'avg' },
			},
			{
				panelTitle: 'statisticProfits',
				panelValue: profit,
				panelValueType: 'money',
				panelSubtitle: dateSubtitle(topProfit),
				panelData: chartData('totalProfit'),
				panelChartType: 'LineChart',
				panelDetailType: 'sales',
				panelDataType: { type: 'profit', unity: 'totalProfit' },
			},
			{
				panelTitle: 'taxesPageTitle',
				panelValue: taxes,
				panelValueType: 'money',
				panelSubtitle: dateSubtitle(topTaxes),
				panelData: chartData('totalTaxes'),
				panelChartType: 'LineChart',
				panelDetailType: 'sales',
				panelDataType: { type: 'taxes', unity: 'totalTaxes' },
			},
			{
				panelTitle: 'statisticPaymentMethod',
				panelValue: !!paymentMetod ? paymentMetod.toFixed(2) : null,
				panelValueType: 'percent',
				panelSubtitle: topPaymentMetod ? paymentSubTitle(topPaymentMetod._id) : I18n.t('statisticNoDataForThisPeriod'),
				panelData: paymentMetod / 100,
				panelChartType: 'PieChart',
				panelDetailType: 'receipts',
				panelDataType: { type: 'paymentMetod', unity: 'total' },
				panelHasHelp: true,
			},
			{
				panelTitle: 'statisticTopProductsByPrice',
				panelValue: topProduct ? topProduct._id : '',
				panelValueType: 'text',
				panelSubtitle: topProduct ? `${I18n.t('statisticFirstInSales')} ` : I18n.t('statisticNoDataForThisPeriod'),
				panelSubtitleMoney: topProduct ? this.maskPanelValue(topProduct.total || 0, 'money') : null,
				panelData: null,
				panelChartType: 'Ranking',
				panelDetailType: 'products',
				panelDataType: { type: 'ranking', unity: '' },
			},
			{
				panelTitle: 'statisticTopCustomers',
				panelValue: topCustomer ? topCustomer._id : '',
				panelValueType: 'text',
				panelSubtitle: topCustomer
					? `${I18n.t('statisticFirstInPurchases')} `
					: I18n.t('statisticNoSalesLinkedToCustomers'),
				panelSubtitleMoney: topCustomer ? this.maskPanelValue(topCustomer.total || 0, 'money') : null,
				panelData: null,
				panelChartType: 'Ranking',
				panelDetailType: 'customers',
				panelDataType: { type: 'ranking', unity: '' },
			},
			{
				panelTitle: 'statisticSalesByUser',
				panelValue: topUser ? topUser._id : '',
				panelValueType: 'text',
				panelSubtitle: topUser ? `${I18n.t('statisticFirstInSales')} ` : I18n.t('statisticNoDataForThisPeriod'),
				panelSubtitleMoney: topUser ? this.maskPanelValue(topUser.total || 0, 'money') : null,
				panelData: null,
				panelChartType: 'PieChart',
				panelDetailType: 'users',
				panelDataType: { type: 'income', unity: 'total' },
			},
		]
	}

	renderStatisticsPanel() {
		this.createStatisticsData()
		return this.statisticsPanels.map((statisticsPanel, i) => {
			return (
				<StatisticsPanel
					key={i}
					onPress={() => this.statisticDetail(statisticsPanel)}
					panelTitle={statisticsPanel.panelTitle}
					panelValue={this.maskPanelValue(statisticsPanel.panelValue, statisticsPanel.panelValueType)}
					panelSubtitle={statisticsPanel.panelSubtitle}
					panelSubtitleMoney={statisticsPanel.panelSubtitleMoney}
				>
					{statisticsPanel.panelData ? this.renderGraphic(statisticsPanel) : null}
				</StatisticsPanel>
			)
		})
	}

	renderEmptyContent() {
		const { navigation } = this.props

		return (
			<EmptyState
				image={{ source: { uri: StatisticEmptyIcon, width: 210, height: 210 }, style: { width: 210, height: 210 } }}
				strings={{
					title: I18n.t('statisticNoDataForThisPeriod'),
					description: [I18n.t('statisticsEmptyStateDescription')],
					btnDescription: I18n.t('openedSalesHelper'),
					btnSubmit: I18n.t('onboarding.buttons.addSale'),
				}}
				titleProps={{ size: 18, textAlign: 'center' }}
				leftIcon="plus-thin"
				onPressSubmitBtn={() => navigation.navigate('CurrentSale')}
				onPressDescriptionBtn={() => navigation.navigate('Helpcenter')}
			/>
		)
	}

	renderLoader() {
		return <LoadingCleanScreen />
	}

	renderContent() {
		const { listContainer, containerBg } = styles
		const { statisticsData } = this.props.statistics
		const { hasSalesInAccount, navigation } = this.props

		return (
			<View style={{ flex: 1 }}>
				{hasSalesInAccount ? (
					<>
						{this.renderFilterButton()}
						<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
							<ViewShot
								style={containerBg}
								ref={this.viewShotRef}
								options={{ format: 'png', quality: 0.9, result: 'data-uri' }}
							>
								<View style={listContainer}>
									{statisticsData ? this.renderStatisticsPanel() : this.renderEmptyContent()}
								</View>
							</ViewShot>
						</ScrollView>
					</>
				) : (
					<OnboardingCarousel
						textButton={I18n.t('onboarding.buttons.addSale')}
						data={this.getOnboardingCarouselData()}
						onPress={() => navigation.navigate('CurrentSale')}
						activeSlide={this.state.activeSlide}
						handleSnapItem={(index) => this.setState({ activeSlide: index })}
					/>
				)}
			</View>
		)
	}

	offlineAlert() {
		Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
	}

	render() {
		const { outerContainer } = scaffolding
		const { isOnline, navigation, isLoaderVisible, hasSalesInAccount } = this.props
		const { key, remoteKey } = this.state
		const rightButtons = [
			{
				icon: 'no-internet',
				color: colors.grayBlue,
				onPress: () => this.offlineAlert(),
				iconSize: 20,
				isHidden: isOnline,
			},
			hasSalesInAccount
				? {
						icon: 'share',
						color: colors.primaryColor,
						onPress: () => this.props.checkFeatureIsAllowed(key, () => this.shareStatistics(), remoteKey),
						iconSize: 20,
				  }
				: {},
		]
		return (
			<KyteSafeAreaView style={outerContainer}>
				<KyteToolbar
					borderBottom={1.5}
					headerTitle={`${I18n.t('sideMenu.statistics')}`}
					rightButtons={rightButtons}
					navigate={navigation.navigate}
					navigation={navigation}
				/>
				{this.renderContent()}
				{isLoaderVisible ? this.renderLoader() : null}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	listContainer: {
		flex: 1,
	},
	containerBg: {
		backgroundColor: '#FFF',
		flex: 1,
	},
	svgImage: {
		resizeMode: 'contain',
		width: Dimensions.get('window').width * 0.6,
		height: Dimensions.get('window').height * 0.2,
		marginBottom: 15,
	},
}

const mapStateToProps = ({ preference, statistics, common, onboarding, sales }) => ({
	currency: preference.account.currency,
	decimalCurrency: preference.account.decimalCurrency,
	statistics,
	periodRange: statistics.filter.periodRange,
	isLoaderVisible: common.loader.visible,
	isOnline: common.isOnline,
	hasSalesInAccount: !!sales.closedSalesQuantity || onboarding?.helper?.steps?.[1]?.completed,
})

export default connect(mapStateToProps, {
	periodNavigate,
	statisticsFetch,
	dataTypeSet,
	periodTypeSet,
	checkFeatureIsAllowed,
	checkPlanKeys,
	salesSetFilter,
	updateQuantitySales
})(StatisticsContainer)
