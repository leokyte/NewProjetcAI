import React, { Component } from 'react';
import moment from 'moment/min/moment-with-locales';
import { connect } from 'react-redux';
import { View, ScrollView } from 'react-native';
import { KyteTableHeader, KyteTableRow, KyteTableInfo, KyteTh, KyteTd, CurrencyText } from '../../../common';
import I18n from '../../../../i18n/i18n';
import { scaffolding, colors } from '../../../../styles';

class SalesTable extends Component {
  setStatusBold(unity) {
    const { dataInfo } = this.props.statistics;
    if (dataInfo.unity === unity) {
      return 'bold';
    }
    return;
  }

  setTheadFirstColumn() {
    const { dateFormat } = this.props;
    if (dateFormat === 'HH') {
      return I18n.t('statisticTabs.hour');
    } else if (dateFormat === 'MMM') {
      return I18n.t('statisticTabs.month');
    }
    return I18n.t('statisticTabs.day');
  }

  renderThs() {
    const thead = [
      { th: this.setTheadFirstColumn(), width: 2 },
      { th: I18n.t('statisticRevenue'), width: 3.1, status: this.setStatusBold('total') },
      { th: I18n.t('statisticSales'), width: 2, status: this.setStatusBold('count'), style: styles.alignCenter },
      { th: I18n.t('statisticAverageTicketShort'), width: 3, status: this.setStatusBold('avg'), style: styles.alignEnd }
    ];

    return thead.map((item, i) => {
      return (
        <KyteTh key={i} width={item.width} status={item.status} style={item.style}>{item.th}</KyteTh>
      );
    });
  }

  renderFirstColumn(value) {
    const { dateFormat } = this.props;
    const weekdays = moment.weekdaysShort();

    if (dateFormat === 'HH') {
      return `${value}h`;
    } else if (dateFormat === 'd') {
      return weekdays[value - 1];
    }
    return moment(value).format(dateFormat);
  }

  renderTableRows() {
    const { data, statistics } = this.props;
    const { dataInfo } = statistics;

    const filterData = data.filter(s => s.total > 0);

    const max = filterData.length <= 0 ? 0 : filterData.reduce((prev, current) => {
      return (prev[dataInfo.unity] > current[dataInfo.unity]) ? prev : current;
    });

    const min = filterData.length <= 0 ? 0 : filterData.reduce((prev, current) => {
      return (prev[dataInfo.unity] < current[dataInfo.unity]) ? prev : current;
    });

    const lowestItems = filterData.filter(s => s[dataInfo.unity] === min[dataInfo.unity]);
    const highestItems = filterData.filter(s => s[dataInfo.unity] === max[dataInfo.unity]);

    return filterData.map((item, i) => {
      const status = () => {
        if (highestItems.find(s => item._id === s._id)) return 'best';
        if (lowestItems.find(s => item._id === s._id)) return 'worst';
      };
      return (
        <KyteTableRow key={i}>
          <KyteTd status={status()} width={2}>{this.renderFirstColumn(item._id)}</KyteTd>
          <KyteTd status={status() || this.setStatusBold('total')} width={3.1}><CurrencyText value={item.total} /></KyteTd>
          <KyteTd status={status() || this.setStatusBold('count')} width={2} style={styles.alignCenter}>{item.count}</KyteTd>
          <KyteTd status={status() || this.setStatusBold('avg')} width={3} style={styles.alignEnd}><CurrencyText value={item.avg} /></KyteTd>
        </KyteTableRow>
      );
    });
  }

  renderTableFooter() {
    const { dateFormat } = this.props;
    const { tableInfoContainer } = styles;

    let labelBest = I18n.t('statisticBestMonth');
    let labelWorst = I18n.t('statisticWorstMonth');

    if (dateFormat === 'HH') {
      labelBest = I18n.t('statisticBestHour');
      labelWorst = I18n.t('statisticWorstHour');
    } else if (dateFormat === 'd' || dateFormat === 'D') {
      labelBest = I18n.t('statisticBestDay');
      labelWorst = I18n.t('statisticWorstDay');
    }

    return (
      <View style={tableInfoContainer}>
        <KyteTableInfo color={colors.actionColor}>{labelBest}</KyteTableInfo>
        <KyteTableInfo color={colors.worstColor}>{labelWorst}</KyteTableInfo>
      </View>
    );
  }

  render() {
    const { outerContainer } = scaffolding;

    return (
      <View style={outerContainer}>
        <ScrollView horizontal style={{ flex: 1 }}>
          <View style={{ width: 410 }}>
            <View style={{ backgroundColor: colors.lightBg }}>
              <KyteTableHeader>
                {this.renderThs()}
              </KyteTableHeader>
            </View>
            {this.renderTableRows()}
          </View>
        </ScrollView>
        {this.renderTableFooter()}
      </View>
    );
  }
}

const styles = {
  tableInfoContainer: {
    flexDirection: 'row'
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
};

const mapStateToProps = ({ statistics }) => ({
  statistics,
  periodRange: statistics.filter.periodRange
});

export default connect(mapStateToProps, null)(SalesTable);
