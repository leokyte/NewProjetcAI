import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Image, Alert, TouchableOpacity, ScrollView } from 'react-native'
import { TabView, SceneMap } from 'react-native-tab-view'
import moment from 'moment/min/moment-with-locales'
import _ from 'lodash'

import { logEvent } from '../../integrations'
import { KyteToolbar, CurrencyText, KyteSafeAreaView, KyteModal, KyteText } from '../common'
import DayTab from './StatisticsDetail/Tabs/DayTab'
import HourTab from './StatisticsDetail/Tabs/HourTab'
import WeekTab from './StatisticsDetail/Tabs/WeekTab'
import MonthTab from './StatisticsDetail/Tabs/MonthTab'
import YearTab from './StatisticsDetail/Tabs/YearTab'
import DetailRanking from './StatisticsDetail/DetailRanking'
import DetailPie from './StatisticsDetail/DetailPie'
import StatisticsButton from './StatisticsButton'
import { Period, toList, Features } from '../../enums'
import { statisticsFetch, periodNavigate, checkFeatureIsAllowed } from '../../stores/actions'
import { scaffolding, colors, tabStyle, Type, msg } from '../../styles'
import { KyteTabBar } from '../common'
import I18n from '../../i18n/i18n'
import { StatisticEmptyIcon } from '../../../assets/images'
import { billingCheckAnalyticsPeriodDate } from '../../util'
import { Icon } from 'react-native-elements'
import CheckoutButton from '../common/CheckoutButton'
import { getStatisticPanelTitle } from '../../util/util-events'
import { colorsPierChart } from '../../styles'
import { StackedBarChart } from 'react-native-svg-charts'
import LineChartLabels from './StatisticsDetail/LineChartLabels'
import { Container, Margin, Row, TabButton, Padding } from '@kyteapp/kyte-ui-components'
import AccordeonTable from './StatisticsDetail/Tables/Accordeon/AccordeonTable'
import ViewShot from 'react-native-view-shot'

const INITIAL_LAYOUT = { width: Dimensions.get('window').width }

const dayRoutes = [
	{ key: '1', title: I18n.t('statisticTabs.hour').toUpperCase(), type: 'hour' },
	{ key: '2', title: I18n.t('statisticTabs.day').toUpperCase(), type: 'day' },
	{ key: '3', title: I18n.t('statisticTabs.week').toUpperCase(), type: 'week' },
]

// const weekRoutes = [
//   { key: '1', title: I18n.t('statisticTabs.hour').toUpperCase(), type: 'hour' },
//   { key: '2', title: I18n.t('statisticTabs.day').toUpperCase(), type: 'day' },
// ];

const monthRoutes = [
	{ key: '1', title: I18n.t('statisticTabs.hour').toUpperCase(), type: 'hour' },
	{ key: '2', title: I18n.t('statisticTabs.week').toUpperCase(), type: 'week' },
	{ key: '3', title: I18n.t('statisticTabs.month').toUpperCase(), type: 'month' },
]

const yearRoutes = [
	{ key: '1', title: I18n.t('statisticTabs.hour').toUpperCase(), type: 'hour' },
	{ key: '2', title: I18n.t('statisticTabs.week').toUpperCase(), type: 'week' },
	{ key: '3', title: I18n.t('statisticTabs.month').toUpperCase(), type: 'month' },
	//{ key: '3', title: I18n.t('statisticTabs.year').toUpperCase(), type: 'year' },
]

class StatisticsDetail extends Component {
	constructor(props) {
		super(props)
		const { params = {} } = this.props.route
		const { periodRange } = this.props.filter
		const { panel } = params
		const startDate = new moment(periodRange.startDate)
		const endDate = new moment(periodRange.endDate)
		const periodDurationMonth = moment.duration(endDate.diff(startDate)).asMonths().toFixed(1)
		const { key, remoteKey } = Features.items[Features.ANALYTICS]

		this.state = {
			key,
			remoteKey,
			index: periodDurationMonth > 2 ? 2 : 1,
			routes: dayRoutes,
			date: moment(new Date()),
			dateType: 'month',
			detailView: 'chart',
			period: [],
			moreThanTwoYears: false,
			moreThanTwoMonths: false,
			isPeriodThanOneWeek: false,
			panelTitle: panel.panelTitle,
			isHelpModalVisible: false,
			panel,
		}
	}

	UNSAFE_componentWillMount() {
		this.setState({ periods: toList(Period) })
		this.setPeriodDuration()
	}

	UNSAFE_componentWillReceiveProps() {
		this.setPeriodDuration()
	}

	componentDidMount() {
		const { params = {} } = this.props?.route
		const { panel } = params

		const statisticPanel = getStatisticPanelTitle(panel?.panelTitle)

		if (Boolean(statisticPanel)) logEvent(`Statistics ${statisticPanel} View`, { is_empty: !panel?.panelValue })
	}

	onRequestChangeTab = (index) => this.setState({ index })

	setPeriodDuration() {
		const { periodRange } = this.props.filter
		const startDate = new moment(periodRange.startDate)
		const endDate = new moment(periodRange.endDate)
		const periodDurationMonth = moment.duration(endDate.diff(startDate)).asMonths().toFixed(1)
		// const periodDurationWeek = moment.duration(endDate.diff(startDate)).asWeeks().toFixed(1);

		const changeState = (moreThanTwoYears, moreThanTwoMonths, isPeriodThanOneWeek, routes) => {
			this.setState({ moreThanTwoYears, moreThanTwoMonths, isPeriodThanOneWeek, routes })
		}

		if (periodDurationMonth > 24) return changeState(true, false, false, yearRoutes)
		if (periodDurationMonth > 2 && periodDurationMonth <= 24) return changeState(false, true, false, monthRoutes)
		// if (periodDurationWeek === '0.9') return changeState(false, false, true, weekRoutes, 1);
		return changeState(false, false, false, dayRoutes)
	}

	shareMethod() {
		const { index, routes } = this.state
		const { panel } = this.state
		const tab = routes[index].type

		if (!this.props.statisticsData) return
		if (!this[tab]) return this[panel.panelDetailType].shareStatistics()
		this[tab].shareStatistics()
	}

	filterOnClick(indicator) {
		const { key, remoteKey } = this.state
		const { filter, isOnline } = this.props
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

		navigation.navigate('StatisticsFilter')
	}

	renderFilterButton() {
		const { filter } = this.props
		return (
			<StatisticsButton
				filter={filter}
				periods={this.state.periods}
				titleOnClick={this.titleOnClick.bind(this)}
				filterOnClick={this.filterOnClick.bind(this)}
			/>
		)
	}

	renderNumberText(value, panel) {
		const { statisticsData } = this.props
		const { statisticHeaderValue } = styles
		const isPercent = panel.panelChartType === 'PieChart'

		if (isPercent) {
			const count = _.sumBy(statisticsData[panel.panelDetailType], (item) => {
				return item.count
			})
			const total = _.sumBy(statisticsData[panel.panelDetailType], (item) => {
				return item.total
			})
			return (
				<Text style={statisticHeaderValue}>
					{count.toFixed(0)} / <CurrencyText value={total} />
				</Text>
			)
		}
		return <Text style={statisticHeaderValue}>{`${value.toFixed(0)}`}</Text>
	}

	renderMoneyText(value) {
		const { statisticHeaderValue } = styles
		return <CurrencyText value={value} style={statisticHeaderValue} />
	}

	renderEmptyContent() {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 }}>
				<Image style={styles.svgImage} source={{ uri: StatisticEmptyIcon }} />
				<Text style={[Type.Medium, Type.fontSize(16), { color: colors.primaryColor }]}>
					{I18n.t('statisticNoDataForThisPeriod')}
				</Text>
			</View>
		)
	}

	renderHeader = (props) => (
		<KyteTabBar
			labelTextStyle={tabStyle.customLabel(undefined, 12)}
			inactiveColor={colors.grayBlue}
			tabStyle={tabStyle.tab}
			indicatorStyle={tabStyle.indicator}
			style={tabStyle.base}
			{...props}
		/>
	)

	renderDayTabs = SceneMap({
		1: () => (
			<HourTab onRef={(ref) => (this.hour = ref)} title={this.state.panelTitle} panel={this.props.route.params.panel} />
		),
		2: () => (
			<DayTab onRef={(ref) => (this.day = ref)} title={this.state.panelTitle} panel={this.props.route.params.panel} />
		),
		3: () => (
			<WeekTab onRef={(ref) => (this.week = ref)} title={this.state.panelTitle} panel={this.props.route.params.panel} />
		),
	})

	renderWeekTabs = SceneMap({
		1: () => (
			<HourTab onRef={(ref) => (this.hour = ref)} title={this.state.panelTitle} panel={this.props.route.params.panel} />
		),
		2: () => (
			<DayTab onRef={(ref) => (this.day = ref)} title={this.state.panelTitle} panel={this.props.route.params.panel} />
		),
	})

	renderMonthTabs = SceneMap({
		1: () => (
			<HourTab onRef={(ref) => (this.hour = ref)} title={this.state.panelTitle} panel={this.props.route.params.panel} />
		),
		2: () => (
			<WeekTab onRef={(ref) => (this.week = ref)} title={this.state.panelTitle} panel={this.props.route.params.panel} />
		),
		3: () => (
			<MonthTab
				onRef={(ref) => (this.month = ref)}
				title={this.state.panelTitle}
				panel={this.props.route.params.panel}
			/>
		),
	})

	renderYearTabs = SceneMap({
		1: () => (
			<HourTab onRef={(ref) => (this.hour = ref)} title={this.state.panelTitle} panel={this.props.route.params.panel} />
		),
		2: () => (
			<WeekTab onRef={(ref) => (this.week = ref)} title={this.state.panelTitle} panel={this.props.route.params.panel} />
		),
		3: () => (
			<YearTab onRef={(ref) => (this.year = ref)} title={this.state.panelTitle} panel={this.props.route.params.panel} />
		),
	})

	renderStatisticsTabView() {
		const { moreThanTwoYears, moreThanTwoMonths, isPeriodThanOneWeek } = this.state

		const setScene = () => {
			if (moreThanTwoMonths) {
				return this.renderMonthTabs
			} else if (isPeriodThanOneWeek) {
				return this.renderWeekTabs
			} else if (moreThanTwoYears) {
				return this.renderYearTabs
			}
			return this.renderDayTabs
		}

		return (
			<View style={{ flex: 1 }}>
				<TabView
					initialLayout={INITIAL_LAYOUT}
					navigationState={this.state}
					renderScene={setScene()}
					renderTabBar={this.renderHeader}
					onIndexChange={this.onRequestChangeTab}
				/>
			</View>
		)
	}

	renderDetailTitle(title) {
		const { statisticHeaderValue } = styles
		const { panel } = this.state

		if (panel.panelValueType === 'money') return this.renderMoneyText(title)
		if (['percent', 'number', 'text'].indexOf(panel.panelValueType) >= 0) return this.renderNumberText(title, panel)
		return <CurrencyText value={title} style={statisticHeaderValue} />
	}

	renderSubTitle() {
		const { statisticHeader, statisticHeaderTitle } = styles
		const { dashboardData, dataInfo, statisticsData, route } = this.props
		const { panel } = this.state
		const isRanking = panel.panelChartType === 'Ranking'
		const isPie = panel.panelChartType === 'PieChart'

		if (!isRanking && statisticsData) {
			return (
				<View style={[statisticHeader(0), { paddingTop: 15 }]}>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<Text style={statisticHeaderTitle}>
							{isPie ? `${I18n.t('statisticPaymentMethod.total')}:  ` : `${I18n.t('words.s.total')}:  `}
							{this.renderDetailTitle(dashboardData[dataInfo.type])}
						</Text>
					</View>
				</View>
			)
		}
		return null
	}

	offlineAlert() {
		Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
	}

	renderHelpModal() {
		const { panel } = this.state
		const { type } = panel.panelDataType
		const { modalContainer, textModalContainer, textModalStyle, modalButtonContainer } = styles

		const closeHelpModal = () => this.setState({ isHelpModalVisible: false })
		const title =
			typeof I18n.t(panel.panelTitle) === 'string' ? I18n.t(panel.panelTitle) : I18n.t(panel.panelTitle).title
		const text = () => {
			switch (type) {
				case 'income':
					return I18n.t('statisticsHelpIncomeText')
				case 'paymentMetod':
					return I18n.t('statisticsHelpPaymentMethodText')
				case 'storeReceiptsTotal':
					return I18n.t('statisticsHelpStoreReceiptsText')
			}
		}

		return (
			<KyteModal
				height={'30%'}
				title={''}
				isModalVisible
				noPadding
				noEdges
				hideModal={() => closeHelpModal()}
				hideOnBack={() => closeHelpModal()}
			>
				<TouchableOpacity
					onPress={() => closeHelpModal()}
					style={[msg.messageClose, { backgroundColor: '#F5F5F5', width: 30, height: 32 }]}
				>
					<Icon name={'close'} color={colors.primaryColor} size={18} />
				</TouchableOpacity>

				<View style={modalContainer}>
					<View style={textModalContainer}>
						<KyteText style={textModalStyle()} weight="Medium" size={18} pallete="secondaryBg">
							{title}
						</KyteText>
						<KyteText style={textModalStyle(10)} weight="Regular" size={14} pallete="secondaryBg">
							{text()}
						</KyteText>
					</View>

					<View style={modalButtonContainer}>
						<CheckoutButton customText={I18n.t('alertOk')} buttonFlex onPress={() => closeHelpModal()} />
					</View>
				</View>
			</KyteModal>
		)
	}

	renderSalesDateModeSwitch() {
		const { panel } = this.state

		return (
			<Container
				backgroundColor={colors.borderlight}
				borderRadius={24}
				padding={8}
				marginBottom={16}
				style={{
					alignSelf: 'center',
				}}
			>
				<Row>
					<TabButton
						label={I18n.t('saleDate').toUpperCase()}
						isFocused={panel?.panelDetailType === 'receipts'}
						onPress={() => {
							logEvent('Statistics Date Type Change', { where: 'Payment Method', date_type: 'sale date' })
							this.setState({ panel: this.props?.route?.params?.panel ?? this.state.panel })
						}}
					/>
					<Margin left={5} />
					<TabButton
						label={I18n.t('receiptDate').toUpperCase()}
						isFocused={panel?.panelDetailType === 'receiptsByDateReceived'}
						onPress={() => {
							const updatedPanel = {
								...this.state.panel,
								panelChartType: 'BarChart',
								panelDetailType: 'receiptsByDateReceived',
							}

							logEvent('Statistics Date Type Change', { where: 'Payment Method', date_type: 'receveid date' })
							this.setState({ panel: updatedPanel })
						}}
					/>
				</Row>
			</Container>
		)
	}

	render() {
		const { isHelpModalVisible } = this.state
		const { outerContainer } = scaffolding
		const { periodRange } = this.props.filter
		const { goBack } = this.props.navigation
		const { key, remoteKey } = this.state

		const { panel } = this.state
		const { statisticsData, isOnline, currency } = this.props
		const isSameDay = moment(periodRange.startDate).isSame(periodRange.endDate, 'day')
		const title =
			typeof I18n.t(panel.panelTitle) === 'string' ? I18n.t(panel.panelTitle) : I18n.t(panel.panelTitle).title
		const renderOnlyHours = () => (
			<HourTab
				onRef={(ref) => (this[panel.panelDetailType] = ref)}
				title={this.state.panelTitle}
				panel={this.props.route.params.panel}
			/>
		)

		const shouldRenderSalesDateModeSwitch =
			Boolean(statisticsData?.receiptsByDateReceived) &&
			['receipts', 'receiptsByDateReceived'].includes(panel.panelDetailType)

		const renderContent = (type) => {
			switch (type) {
				case 'Ranking':
					return (
						<DetailRanking
							statistic={panel}
							onRef={(ref) => (this[panel.panelDetailType] = ref)}
							title={this.state.panelTitle}
						/>
					)
				case 'PieChart':
					return (
						<DetailPie
							data={statisticsData[panel.panelDetailType]}
							type={panel.panelDetailType}
							onRef={(ref) => (this[panel.panelDetailType] = ref)}
							title={this.state.panelTitle}
							subTitle={this.renderSubTitle()}
						/>
					)
				case 'BarChart': {
					const data = statisticsData[panel.panelDetailType] ?? []
					const sortedData = _.sortBy(data, [(item) => item.total]).reverse()
					const barChartData = {}
					const barChartColors = sortedData?.map((item, index) => {
						const color = colorsPierChart[index] ?? `#${Math.floor(Math.random() * 16777216).toString(16)}`
						barChartData[index] = item.avg

						return color
					})

					return (
						<ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
							<ViewShot style={{ flex: 1 }} options={{ format: 'png', quality: 0.9, result: 'data-uri' }}>
								<Padding top={8} bottom={24}>
									<StackedBarChart
										colors={barChartColors}
										style={{ height: 30 }}
										keys={Object.keys(barChartData)}
										data={[barChartData]}
										contentInset={{ right: 24, left: 24, bottom: 20 }}
										horizontal
									>
										<LineChartLabels colors={barChartColors} />
									</StackedBarChart>
								</Padding>
								<Container style={{ flexGrow: 0 }}>
									<AccordeonTable
										data={sortedData}
										type="receipts"
										currency={currency}
										additionalData={statisticsData.customerAccountsSalesPayments}
										colors={barChartColors}
									/>
								</Container>
							</ViewShot>
						</ScrollView>
					)
				}

				default:
					return isSameDay ? renderOnlyHours() : this.renderStatisticsTabView()
			}
		}

		const rightButtons = [
			{
				icon: 'no-internet',
				color: colors.grayBlue,
				onPress: () => this.offlineAlert(),
				iconSize: 20,
				isHidden: isOnline,
			},
			// { icon: 'help-filled', color: colors.primaryColor, onPress: () => this.setState({ isHelpModalVisible: true }), iconSize: 20, isHidden: !panel.panelHasHelp },
			{
				icon: 'share',
				color: colors.primaryColor,
				onPress: () => this.props.checkFeatureIsAllowed(key, () => this.shareMethod(), remoteKey),
				iconSize: 20,
			},
		]

		return (
			<KyteSafeAreaView style={outerContainer}>
				<KyteToolbar
					innerPage
					borderBottom={panel.panelChartType === 'LineChart' && !isSameDay ? 0 : 1.5}
					headerTitle={title}
					rightButtons={rightButtons}
					goBack={() => goBack()}
				/>
				{this.renderFilterButton()}
				{shouldRenderSalesDateModeSwitch && this.renderSalesDateModeSwitch()}
				{statisticsData ? renderContent(panel.panelChartType) : this.renderEmptyContent()}
				{isHelpModalVisible ? this.renderHelpModal() : null}
			</KyteSafeAreaView>
		)
	}
}

const styles = {
	statisticHeader: (padding) => ({
		backgroundColor: '#FFF',
		paddingHorizontal: 15,
		paddingTop: 0,
		paddingBottom: padding || 15,
		flexDirection: 'row',
	}),
	statisticHeaderTitle: {
		fontFamily: 'Graphik-Medium',
		color: colors.primaryColor,
		fontSize: 14,
	},
	statisticHeaderValue: {
		fontFamily: 'Graphik-Medium',
		color: colors.primaryColor,
		fontSize: 16,
	},
	switchButtonsContainer: {
		flexDirection: 'row',
	},
	switchButton: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	svgImage: {
		resizeMode: 'contain',
		width: Dimensions.get('window').width * 0.6,
		height: Dimensions.get('window').height * 0.2,
		marginBottom: 15,
	},
	modalContainer: {
		flex: 1,
	},
	textModalContainer: {
		flex: 1,
		justifyContent: 'center',
	},
	textModalHeader: {
		flex: 2,
		justifyContent: 'flex-start',
	},
	textModalStyle: (paddingTop = 20) => ({
		paddingHorizontal: 40,
		textAlign: 'center',
		paddingTop,
	}),
	modalButtonContainer: {
		flex: 1,
		justifyContent: 'flex-end',
	},
}

const mapStateToProps = ({ statistics, common, preference }) => ({
	filter: statistics.filter,
	statisticsData: statistics.statisticsData,
	dashboardData: statistics.dashboardData,
	dataInfo: statistics.dataInfo,
	isOnline: common.isOnline,
	currency: preference.account.currency,
})

export default connect(mapStateToProps, { statisticsFetch, periodNavigate, checkFeatureIsAllowed })(StatisticsDetail)
