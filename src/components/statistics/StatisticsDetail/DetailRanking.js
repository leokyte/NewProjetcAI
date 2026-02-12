import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, ScrollView, Dimensions, Platform } from 'react-native';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import _ from 'lodash';
import { logEvent } from '../../../integrations';
import { KyteTableHeader, KyteTableRow, KyteTh, KyteTd, CurrencyText } from '../../common';
import { scaffolding, colors } from '../../../styles';
import I18n from '../../../i18n/i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SMALLEST_SCREENS = SCREEN_WIDTH <= 450;

class DetailRanking extends Component {
  constructor(props) {
    super(props);
    this.rankingViewShotRef = React.createRef();
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(null);
  }

  shareStatistics() {
    const { title } = this.props;
    const viewShot = this.rankingViewShotRef.current;
    if (!viewShot) {
      return;
    }
    viewShot.capture().then(uri => {
      const selectOs = (uri) => {
        let defaultObject = { title: title, subject: title, url: uri };
        if (Platform.OS === 'android') {
          defaultObject = { ...defaultObject, message: title };
        }
        return defaultObject;
      };

      Share.open(selectOs(uri)).then(() => logEvent('StatisticsDetailShared'));
    });
  }

  tableData(panelDetailType, statisticsData) {
    return (
      _.filter(
        _.sortBy(
          _.filter(statisticsData[panelDetailType],
            (item) => { return item._id ? item : null; }
          ), 'total'
        ).reverse(),
        (item, i) => { return i <= 199 ? item : null; }
      )
    );
  }

  renderThs() {
    const { panelDetailType } = this.props.statistic;
    const { alignCenter, alignEnd } = styles;
    const isProductsType = (panelDetailType === 'products');
    const thead = [
      { th: I18n.t('statisticName'), width: 1.25, colspan: 2 },
      { th: I18n.t('statisticAmount'), width: 0.5, status: 'bold', style: alignEnd },
      { th: isProductsType ? I18n.t('statisticQTY') : I18n.t('statisticPurchases'), width: 0.8, style: alignCenter },
      // { th: I18n.t('statisticProfits'), width: 1.5, style: alignEnd }
    ];

    return thead.map((item, i) => {
      return (
        <KyteTh key={i} width={item.width} colspan={item.colspan} status={item.status} style={item.style}>{item.th}</KyteTh>
      );
    });
  }

  renderProfit(profit, totalProfit) {
    let percentProfit = 0;
    if (profit > 0) {
      percentProfit = ((profit * 100) / totalProfit).toFixed(1);
    }
    return (
      <Text>
        <CurrencyText value={profit} /> ({percentProfit}%)
      </Text>
    );
  }

  renderTableRows() {
    const { alignCenter, alignCenterVertical, alignEnd } = styles;
    const { statistic, statisticsData } = this.props;
    const { panelDetailType } = statistic;
    return this.tableData(panelDetailType, statisticsData).map((item, i) => {
      return (
        <KyteTableRow key={i}>
          <KyteTd width={0.35} style={[alignCenter, alignCenterVertical, { paddingHorizontal: 2.5 }]}>{i+1}</KyteTd>
          <KyteTd width={0.9} numberOfLines={3} style={[alignCenterVertical, { paddingHorizontal: 5 }]}>{item._id}</KyteTd>
          <KyteTd width={1.2} status={'bold'} style={[alignCenterVertical, alignEnd]}><CurrencyText value={item.total} style={{ fontSize: 12 }} /></KyteTd>
          <KyteTd width={0.8} style={[alignCenterVertical, alignCenter]}>{item.count}</KyteTd>
        </KyteTableRow>
      );
    });
  }

  render() {
    const { outerContainer } = scaffolding;
    const { statisticHeader, statisticGraphicTitle } = styles;
    const titleHeaderRanking = () => {
      return (
        <View style={statisticHeader(25)}>
          <Text style={statisticGraphicTitle}>{I18n.t('statisticRanking')}</Text>
        </View>
      );
    };

    return (
      <ScrollView>
        <View style={outerContainer}>
          {titleHeaderRanking()}
          <ScrollView horizontal>
            <ViewShot style={{ flex: 1 }} ref={this.rankingViewShotRef} options={{ format: 'png', quality: 0.9, result: 'data-uri' }}>
              <View style={{ width: SMALLEST_SCREENS ? 450 : SCREEN_WIDTH, maxWidth: SCREEN_WIDTH  }}>
                <View style={{ backgroundColor: colors.lightBg}}>
                  <KyteTableHeader>
                    {this.renderThs()}
                  </KyteTableHeader>
                </View>
                {this.renderTableRows()}
              </View>
            </ViewShot>
          </ScrollView>
        </View>
      </ScrollView>
    );
  }
}

const styles = {
  statisticHeader: (padding) => ({
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: padding || 15,
    flexDirection: 'row'
  }),
  statisticGraphicTitle: {
    fontFamily: 'Graphik-Medium',
    color: colors.primaryColor,
    fontSize: 16,
  },
  tableInfoContainer: {
    flexDirection: 'row'
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignCenterVertical: {
    justifyContent: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
};

const mapStateToProps = ({ preference, statistics }) => ({
  currency: preference.account.currency,
  statisticsData: statistics.statisticsData,
});

export default connect(mapStateToProps, null)(DetailRanking);
