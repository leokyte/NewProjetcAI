import React, { Component } from 'react';
import moment from 'moment/min/moment-with-locales';
import { connect } from 'react-redux';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import { Platform, ScrollView, View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BarChart, Grid } from 'react-native-svg-charts';
import { logEvent } from '../../../../integrations';
import ChartContainer from '../ChartContainer';
import SalesTable from '../Tables/SalesTable';
import ProfitTable from '../Tables/ProfitTable';
import TaxesTable from '../Tables/TaxesTable';
import { scaffolding, colors } from '../../../../styles';
import I18n from '../../../../i18n/i18n';
import { CurrencyText } from '../../../common';
import _ from 'lodash';

class WeekTab extends Component {
  constructor(props) {
    super(props);
    this.weekViewShotRef = React.createRef();
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(null);
  }

  shareStatistics() {
    const { dashboardData, dataInfo, currencySymbol, title } = this.props;
    const selectOs = (uri) => {
      let defaultObject = { title: I18n.t(title), subject: `${I18n.t(title)} ${currencySymbol} ${dashboardData[dataInfo.type].toFixed(2)}`, url: uri };
      if (Platform.OS === 'android') {
        defaultObject = { ...defaultObject, message: `${I18n.t(title)} ${currencySymbol} ${dashboardData[dataInfo.type].toFixed(2)}`, };
      }
      return defaultObject;
    };
    const viewShot = this.weekViewShotRef.current;
    if (!viewShot) {
      return;
    }
    viewShot.capture().then(uri => {
      Share.open(selectOs(uri)).then(() => logEvent('StatisticsDetailShared'));
    });
  }

  renderBarChart(data) {
    const { currencySymbol, dataInfo } = this.props;
    const countUnity = dataInfo.unity === 'count';

    return (
      <ChartContainer
        currency={!countUnity ? currencySymbol : null}
        data={data}
        keys={moment.weekdaysShort()}
        xAxisInset={{ left: 20, right: 21 }}
      >
        <BarChart
          style={styles.chartStyles}
          data={data}
          svg={{ fill }}
          spacingInner={0.5}
          spacingOuter={0}
          gridMin={0}
          contentInset={styles.chartInset}
        >
          <Grid svg={{ stroke: '#e6e7e8' }} />
        </BarChart>
      </ChartContainer>
    );
  }

  renderNumberText(value, panel) {
    const { statisticsData } = this.props;
    const { statisticHeaderValue } = styles;
    const isPercent = panel.panelChartType === 'PieChart';

    if (isPercent) {
      const count = _.sumBy(statisticsData[panel.panelDetailType], (item) => { return item.count; });
      const total = _.sumBy(statisticsData[panel.panelDetailType], (item) => { return item.total; });
      return (
        <Text style={statisticHeaderValue}>{count.toFixed(0)} / <CurrencyText value={total} /></Text>
      );
    }
    return (
      <Text style={statisticHeaderValue}>{`${value.toFixed(0)}`}</Text>
    );
  }

  renderMoneyText(value) {
    const { statisticHeaderValue } = styles;
    return <CurrencyText value={value} style={statisticHeaderValue} />;
  }

  renderDetailTitle(title) {
    const { statisticHeaderValue } = styles;
    const { panel } = this.props;
    if (panel.panelValueType === 'money') return this.renderMoneyText(title);
    if (['percent', 'number', 'text'].indexOf(panel.panelValueType) >= 0) return this.renderNumberText(title, panel);
    return <CurrencyText value={title} style={statisticHeaderValue} />;
  }

  renderSubTitle() {
    const { statisticHeader, statisticHeaderTitle } = styles;
    const { dashboardData, dataInfo, statisticsData, panel } = this.props;
    const isRanking = (panel.panelChartType === 'Ranking');

    if (!isRanking && statisticsData) {
      return (
        <View style={[statisticHeader(0), { paddingTop: 15 }]}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Text style={statisticHeaderTitle}>
              {`${I18n.t('words.s.total')}:  `}
              {this.renderDetailTitle(dashboardData[dataInfo.type])}
            </Text>
          </View>
        </View>
      );
    }
    return null;
  }

  render() {
    const { outerContainer } = scaffolding;
    const { statisticGraphic } = styles;
    const { salesByDayOfWeek } = this.props.statisticsData;
    const { dataInfo } = this.props;
    const chartData = (arr = []) => arr.map((item) => { return item[dataInfo.unity]; });

    const renderTable = () => {
      if (dataInfo.type === 'profit') {
        return <ProfitTable data={salesByDayOfWeek} dateFormat={'d'} />;
      }else if (dataInfo.type === 'taxes') {
        return <TaxesTable data={salesByDayOfWeek} dateFormat={'d'} />;
      }
      return <SalesTable data={salesByDayOfWeek} dateFormat={'d'} />;
    };

    return (
      <ScrollView style={outerContainer}>
      <ViewShot style={{ flex: 1 }} ref={this.weekViewShotRef} options={{ format: 'png', quality: 0.9, result: 'data-uri' }}>
        {this.renderSubTitle()}
        <LinearGradient colors={['white', colors.lightBg]} style={statisticGraphic}>
          {this.renderBarChart(chartData(salesByDayOfWeek))}
        </LinearGradient>
        {renderTable()}
      </ViewShot>
      </ScrollView>
    );
  }
}

const fill = 'rgba(46, 209, 172)';
const styles = {
  statisticGraphic: {
    paddingHorizontal: 15,
    paddingBottom: 15
  },
  chartStyles: {
    flex: 1,
    marginLeft: 20,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderColor: colors.pimaryLighter
  },
  chartInset: { top: 6, bottom: 0, right: 10, left: 10 },
  containerBg: {
    backgroundColor: '#FFF',
  },
  statisticHeader: (padding) => ({
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: padding || 15,
    flexDirection: 'row'
  }),
  statisticHeaderTitle: {
    fontFamily: 'Graphik-Medium',
    color: colors.primaryColor,
    fontSize: 14,
  },
  statisticHeaderValue: {
    fontFamily: 'Graphik-Medium',
    color: colors.primaryColor,
    fontSize: 16
  },
};

const mapStateToProps = ({ statistics, preference }) => ({
  statisticsData: statistics.statisticsData,
  dashboardData: statistics.dashboardData,
  dataInfo: statistics.dataInfo,
  currencySymbol: preference.account.currency.currencySymbol
});

export default connect(mapStateToProps)(WeekTab);
