import React, { Component } from 'react';
import { connect } from 'react-redux';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import { Platform, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { logEvent } from '../../../integrations';
import TypeTable from './Tables/TypeTable';
import { KytePieChart } from '../../common';
import { scaffolding, colors, colorsPierChart } from '../../../styles';
import I18n from '../../../i18n/i18n';
import AccordeonTable from './Tables/Accordeon/AccordeonTable';

class DetailPie extends Component {
  constructor(props) {
    super(props);
    this.pieViewShotRef = React.createRef();
    this.colors = props.data.map((d, index) => index < 10 ? colorsPierChart[index] : `#${Math.floor(Math.random() * 16777216).toString(16)}`);
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(null);
  }

  shareStatistics() {
    const { title } = this.props;
    const titleShare = typeof I18n.t(title) === 'string' ? I18n.t(title) : I18n.t(title).title;

    const viewShot = this.pieViewShotRef.current;
    if (!viewShot) {
      return;
    }
    viewShot.capture().then(uri => {
      const selectOs = (uri) => {
        let defaultObject = { title: titleShare, subject: titleShare, url: uri };
        if (Platform.OS === 'android') {
          defaultObject = { ...defaultObject, message: titleShare };
        }
        return defaultObject;
      };

      Share.open(selectOs(uri)).then(() => logEvent(`StatisticsDetail${title}Shared`, null));
    });
  }

  renderPieChart(data) {
    return (
      <KytePieChart
        style={{ height: 230 }}
        data={data}
        colors={this.colors}
        innerRadius={68}
        outerRadius={80}
        labelRadius={100}
        padAngle={0}
        currency={this.props.currency}
      />
    );
  }

  renderTable() {
    const { data, total, type, currency, statisticsData } = this.props;
    if (type === 'receipts') return (<AccordeonTable total={total} data={data} type={type} currency={currency} additionalData={statisticsData.customerAccountsSalesPayments} colors={this.colors} />);
    return (<TypeTable total={total} data={data} type={type} colors={this.colors} />);
  }

  render() {
    const { outerContainer } = scaffolding;
    const { statisticGraphic } = styles;
    const { dataInfo, data, subTitle } = this.props;
    const chartData = (arr = []) => arr.map((item) => item[dataInfo.unity]);
    return (
      <ScrollView style={outerContainer}>
        <ViewShot style={{ flex: 1 }} ref={this.pieViewShotRef} options={{ format: 'png', quality: 0.9, result: 'data-uri' }}>
          {subTitle}
          <LinearGradient colors={['white', colors.lightBg]} style={statisticGraphic}>
            {this.renderPieChart(chartData(data))}
          </LinearGradient>
          {this.renderTable()}
        </ViewShot>
      </ScrollView>
    );
  }
}

const styles = {
  statisticGraphic: {
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
    padding: 15
  },
  chartStyles: {
    flex: 1,
    marginLeft: 20,
    borderBottomWidth: 1,
    borderColor: colors.pimaryLighter
  },
  chartInset: { top: 15, bottom: 15, right: 10, left: 10 },
  containerBg: {
    backgroundColor: '#FFF',
  }
};

const mapStateToProps = ({ statistics, preference }) => ({
  statisticsData: statistics.statisticsData,
  dataInfo: statistics.dataInfo,
  currency: preference.account.currency,
});

export default connect(mapStateToProps)(DetailPie);
