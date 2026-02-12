import React, { Component } from 'react';
import { ScrollView, View, Text, Platform } from 'react-native';
import moment from 'moment/min/moment-with-locales';
import { connect } from 'react-redux';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import LinearGradient from 'react-native-linear-gradient';
import { BarChart, Grid } from 'react-native-svg-charts';
import _ from 'lodash';

import { logEvent } from '../../../../integrations';
import ChartContainer from '../ChartContainer';
import SalesTable from '../Tables/SalesTable';
import ProfitTable from '../Tables/ProfitTable';
import { scaffolding, colors, Type } from '../../../../styles';
import I18n from '../../../../i18n/i18n';
import { CurrencyText } from '../../../common';
import TaxesTable from '../Tables/TaxesTable';


class MonthTab extends Component {
  constructor(props) {
    super(props);
    this.monthViewShotRef = React.createRef();
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

    const viewShot = this.monthViewShotRef.current;
    if (!viewShot) {
      return;
    }
    viewShot.capture().then(uri => {
      Share.open(selectOs(uri)).then(() => {
        logEvent(`StatisticsDetail${title}Shared`);
      });
    });
  }

  renderBarChart(data) {
    const { currencySymbol, dataInfo, statisticsData } = this.props;
    const countUnity = dataInfo.unity === 'count';
    const { sales } = statisticsData;
    const moreThatOneYear = (moment(sales[0]._id).format('YYYY') - moment(sales[sales.length - 1]._id).format('YYYY') !== 0);
    const keys = () => sales.map((item) => {
      return moment(item._id).format('MMM');
    });

    const dataZebra = () => sales.map((item, index) => {
      let fill = colors.actionColor;
      if (moreThatOneYear) {
        fill = moment(item._id).format('YYYY') % 2 !== 0 ? colors.actionColor : colors.actionDarker;
      }
      return ({
        value: data[index],
        svg: {
          fill
        },
      });
    });

    return (
      <ChartContainer
        currency={!countUnity ? currencySymbol : null}
        data={data}
        keys={keys()}
        xAxisInset={keys().length < 6 ? { left: 28, right: 28 } : { left: 18, right: 18 }}
      >
        <BarChart
          style={styles.chartStyles}
          data={dataZebra()}
          svg={{ fill }}
          spacingInner={0.5}
          spacingOuter={0}
          contentInset={styles.chartInset}
          yAccessor={({ item }) => item.value}
          gridMin={0}
        >
          <Grid svg={{ stroke: '#e6e7e8' }} />
        </BarChart>
      </ChartContainer>
    );
  }

  renderRangeYears() {
    const { statisticsData } = this.props;
    const { sales } = statisticsData;
    const startDate = moment(sales[0]._id).format('YYYY');
    const endDate = moment(sales[sales.length - 1]._id).format('YYYY');

    const rangeYears = () => {
      const arrYears = [];
      for (let index = startDate; index <= endDate; index++) {
        arrYears.push(index);
      }
      return arrYears.map((year, index) => {
        return yearContent(year, index);
      });
    };

    const yearContent = (year, index) => {
      const colorYear = year % 2 !== 0 ? colors.actionColor : colors.actionDarker;
      return (
        <View key={index} style={{ flexDirection: 'row', width: 50 }}>
          <View style={{ borderRadius: 50, height: 10, width: 10, backgroundColor: colorYear, marginHorizontal: 5, marginTop: 4 }} />
          <Text style={[Type.Medium, Type.fontSize(12), { color: colorYear, marginRight: 5 }]}>{year}</Text>
        </View>
      );
    };

    return (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 10 }}>
        {rangeYears()}
      </View>
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
    const { sales } = this.props.statisticsData;
    const { dataInfo } = this.props;
    const chartData = (arr = []) => arr.map((item) => { return item[dataInfo.unity]; });
    const moreThatOneYear = (moment(sales[0]._id).format('YYYY') - moment(sales[sales.length - 1]._id).format('YYYY') !== 0);

    const renderTable = () => {
      if (dataInfo.type === 'profit') {
        return <ProfitTable data={sales} dateFormat={'MMM'} />;
      } else if (dataInfo.type === 'taxes') {
        return <TaxesTable data={sales} dateFormat={'MMM'} />;
      }
      return <SalesTable data={sales} dateFormat={'MMM'} />;
    };

    return (
      <ScrollView style={outerContainer}>
        <ViewShot style={{ flex: 1 }} ref={this.monthViewShotRef} options={{ format: 'png', quality: 0.9, result: 'data-uri' }}>
          {this.renderSubTitle()}
          <LinearGradient colors={['white', colors.lightBg]} style={statisticGraphic}>
            {this.renderBarChart(chartData(sales))}
            {moreThatOneYear ? this.renderRangeYears() : null}
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
  currencySymbol: preference.account.currency.currencySymbol,
});

export default connect(mapStateToProps)(MonthTab);
