import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Platform, ScrollView, View, Text } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { Grid, LineChart } from 'react-native-svg-charts';
import { logEvent } from '../../../../integrations';
import ChartContainer from '../ChartContainer';
import SalesTable from '../Tables/SalesTable';
import ProfitTable from '../Tables/ProfitTable';
import TaxesTable from '../Tables/TaxesTable';
import { scaffolding, colors } from '../../../../styles';
import { listIndex } from '../../../../util';
import I18n from '../../../../i18n/i18n';
import { CurrencyText } from '../../../common';

class HourTab extends Component {
  constructor(props) {
    super(props);
    this.hourViewShotRef = React.createRef();
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
        defaultObject = { ...defaultObject, message: `${I18n.t(title)} ${currencySymbol} ${dashboardData[dataInfo.type].toFixed(2)}` };
      }
      return defaultObject;
    };

    const viewShot = this.hourViewShotRef.current;
    if (!viewShot) {
      return;
    }
    viewShot.capture().then(uri => {
      Share.open(selectOs(uri)).then(() => logEvent('StatisticsDetailShared'));
    });
  }

  renderLineChart(chartData) {
    const { salesByHours } = this.props.statisticsData;
    const { currencySymbol, dataInfo } = this.props;
    const countUnity = dataInfo.unity === 'count';
    // const isEven = (number) => { return (salesByHours.length % 2 === 0 ? number % 2 === 0 : number % 3 === 0); };

    // const keys = salesByHours.map((item, index) => {
    //   const isFirstOrLast = index === 0 || index === (salesByHours.length - 1);
    //   if (!isEven(item._id) && !isFirstOrLast) { return ''; }
    //   return `${item._id}h`;
    // });

    const listIndexData = listIndex(salesByHours.length);
    const keys = () => salesByHours.map((item) => {
      return `${item._id}h`;
    });

    const keysSliced = () => {
      return keys().map((item, index) => {
        if (listIndexData.indexOf(index) >= 0) return item;
        return '';
      });
    };

    const Decorator = ({ x, y, data }) => {
      return data.map((value, index) => {
        if (data.length === 1) {
          return (
            <Circle
              key={index}
              cx={x(index)}
              cy={y(value)}
              r={4}
              stroke={'rgb(46, 209, 172)'}
              fill={'rgb(46, 209, 172)'}
            />
          );
        }
        return null;
      });
    };

    return (
      <ChartContainer
        currency={!countUnity ? currencySymbol : null}
        data={chartData}
        keys={keysSliced()}
        xAxisInset={{ left: 13, right: 13 }}
      >
        <LineChart
          style={styles.chartStyles}
          data={chartData}
          contentInset={styles.chartInset}
          svg={{ strokeWidth: 3, stroke: fill }}
          gridMin={0}
        >
          <Grid svg={{ stroke: '#e6e7e8' }} />
          <Decorator />
        </LineChart>
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
    const { salesByHours } = this.props.statisticsData;
    const { dataInfo } = this.props;
    const chartData = (arr = []) => arr.map((item) => { return item[dataInfo.unity]; });

    const renderTable = () => {
      if (dataInfo.type === 'profit') {
        return <ProfitTable data={salesByHours} dateFormat={'HH'} />;
      } else if (dataInfo.type === 'taxes') {
        return <TaxesTable data={salesByHours} dateFormat={'HH'} />;
      }
      return <SalesTable data={salesByHours} dateFormat={'HH'} />;
    };

    return (
      <ScrollView style={outerContainer}>
        <ViewShot style={{ flex: 1 }} ref={this.hourViewShotRef} options={{ format: 'png', quality: 0.9, result: 'data-uri' }}>
          {this.renderSubTitle()}
          <LinearGradient colors={['white', colors.lightBg]} style={statisticGraphic}>
            {this.renderLineChart(chartData(salesByHours))}
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

export default connect(mapStateToProps)(HourTab);
