import React, { PureComponent } from 'react';
import { View, Dimensions } from 'react-native';
import _ from 'lodash';

import { AccordeonItem } from './AccordeonItem';
import { KyteTableHeader, KyteTh } from '../../../../common';
import { scaffolding, colors, accordeonStyles } from '../../../../../styles';
import I18n from '../../../../../i18n/i18n';
import { AccordeonItemHeader } from './AccordeonItemHeader';
import { AccordeonItemContent } from './AccordeonItemContent';
import { PaymentDetailType, PaymentType } from '../../../../../enums';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const FONT_SIZE = SMALL_SCREENS ? 10 : 12;
const Strings = {
  PAY_LATER_SALES: I18n.t('customerAccount.reportPayLaterSales'),
  CREDIT_SALES: I18n.t('customerAccount.reportCreditSales'),
};

class AccordeonTable extends PureComponent {
  constructor(props) {
    super(props);
    const { data } = props;

    const dataItems = _(data).map(d => d.items).flatten().value();

    this.state = {
      totalCount: _.sumBy(data, item => item.count),
      totalMoney: _.sumBy(data, item => item.total),
      totalPaymentDetailSales: this.generateTotals(dataItems.filter(c => c.key === PaymentDetailType.items[PaymentDetailType.SALES].key)),
      totalPaymentDetailCredit: this.generateTotals(dataItems.filter(c => c.key === PaymentDetailType.items[PaymentDetailType.CREDIT_ADDED].key)),
      totalPaymentDetailDebitPayment: this.generateTotals(dataItems.filter(c => c.key === PaymentDetailType.items[PaymentDetailType.DEBIT_PAYMENT].key)),
    };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.data !== this.props.data) {
      const dataItems = _(this.props.data).map(d => d.items).flatten().value();

      this.setState({
        totalCount: _.sumBy(this.props.data, item => item.count),
        totalMoney: _.sumBy(this.props.data, item => item.total),
        totalPaymentDetailSales: this.generateTotals(dataItems.filter(c => c.key === PaymentDetailType.items[PaymentDetailType.SALES].key)),
        totalPaymentDetailCredit: this.generateTotals(dataItems.filter(c => c.key === PaymentDetailType.items[PaymentDetailType.CREDIT_ADDED].key)),
        totalPaymentDetailDebitPayment: this.generateTotals(dataItems.filter(c => c.key === PaymentDetailType.items[PaymentDetailType.DEBIT_PAYMENT].key)),
      });
    }
  }

  generateTotals(data) {
    return _(data).flatten().groupBy('key').map((item, index) => {
      const totalMoney = _.sumBy(item, 'total');
      const totalCount = _.sumBy(item, 'count');
      const totalAvg = _.sumBy(item, 'avg');
      return { _id: index, totalMoney, totalCount, totalAvg };
    }).value();
  }

  renderThs() {
    const { alignEnd, alignCenter, fixPaddingTh } = accordeonStyles;
    const { fixFontSize } = styles;

    const thead = [
      { th: I18n.t('statisticType'), width: 3.4, style: [fixFontSize, { paddingHorizontal: 0 }] },
      { th: I18n.t('statisticQTY'), width: 0.8, style: [alignCenter, fixPaddingTh, fixFontSize] },
      { th: I18n.t('statisticAmount'), width: 2.3, style: [alignEnd, fixPaddingTh, fixFontSize], status: 'bold' },
      { th: '%', width: 1, style: [alignEnd, fixPaddingTh, fixFontSize] },
      { th: '', width: 0.5, style: [fixPaddingTh, fixFontSize ] },
    ];

    return thead.map((item, i) => (<KyteTh key={i} width={item.width} status={item.status} style={item.style}>{item.th}</KyteTh>));
  }

  renderAccordeonHeaderRow({ text, count, total, avg, rowStyle, columnStyle, textColor, circleColor }, key) {
    const { currency } = this.props;
    return (
      <AccordeonItemHeader
        key={key}
        item={{ text, count, total, percent: avg }}
        rowStyle={rowStyle}
        columnStyle={columnStyle}
        circleColor={circleColor}
        textColor={textColor}
        currency={currency}
      />
    );
  }

  renderAccordeonItemContent({ text, count, total, avg, rowStyle, columnStyle, circleColor }, itemKey) {
    const { currency } = this.props;
    return (
      <AccordeonItemContent
        key={itemKey}
        item={{ text, count, total, avg }}
        rowStyle={rowStyle}
        columnStyle={columnStyle}
        circleColor={circleColor}
        currency={currency}
      />
    );
  }

  renderAccordeonDetailTotals() {
    const { accordeonItemHeaderStyle } = accordeonStyles;
    const lightBackground = { backgroundColor: colors.lightBg };
    const accordeonContent = this.renderAccordeonHeaderRow(
      {
        text: I18n.t('words.s.total').toUpperCase(),
        count: this.state.totalCount,
        total: this.state.totalMoney,
        avg: 100,
        rowStyle: [accordeonItemHeaderStyle(colors.grayBlue), lightBackground],
        columnStyle: { backgroundColor: colors.lightBg },
        circleColor: null,
      },
      9
    );
    const accordeonChildren = _.map(PaymentDetailType.items, (p, i) => {
      let data;
      if (p.type === 0) { data = this.state.totalPaymentDetailSales[0]; }
      if (p.type === 1) { data = this.state.totalPaymentDetailCredit[0]; }
      if (p.type === 2) { data = this.state.totalPaymentDetailDebitPayment[0]; }

      if (!data) return;
      return this.renderAccordeonItemContent(
        {
          text: p.description,
          count: data.totalCount,
          total: data.totalMoney,
          avg: data.totalAvg,
          rowStyle: [accordeonItemHeaderStyle(colors.grayBlue), lightBackground],
          columnStyle: [lightBackground, { paddingTop: 3, paddingBottom: parseInt(i) === (_.size(PaymentDetailType.items) - 1) ? 10 : 3 }],
          circleColor: null,
        },
        i);
    });

    return (
      <AccordeonItem
        accordeonHeader={accordeonContent}
        accordeonChildren={accordeonChildren}
        iconContainerStyle={lightBackground}
      />
    );
  }

  renderAccordeonTotals() {
    const { additionalData } = this.props;
    const { accordeonItemHeaderStyle } = accordeonStyles;

    if (!additionalData) return null;
    const accordeonHeaders = [PaymentType.items[PaymentType.PAY_LATER], PaymentType.items[PaymentType.ACCOUNT]].map((i, index) => {
      const paymentTypeData = _.find(additionalData, p => p._id === i.type);
      const paymentTypeText = i.type === PaymentType.items[PaymentType.ACCOUNT].type ? Strings.CREDIT_SALES : Strings.PAY_LATER_SALES;

      return this.renderAccordeonHeaderRow({
        text: paymentTypeText,
        count: paymentTypeData ? paymentTypeData.count : 0,
        total: paymentTypeData ? paymentTypeData.total : 0,
        rowStyle: [accordeonItemHeaderStyle(colors.primaryDarker), { backgroundColor: colors.primaryDarker }],
        columnStyle: { backgroundColor: colors.primaryDarker, paddingVertical: 4 },
        textColor: colors.drawerIcon,
        circleColor: null,
      }, index);
    });

    return accordeonHeaders.map((header) => (<AccordeonItem accordeonHeader={header} iconContainerStyle={{ backgroundColor: colors.primaryDarker }} iconColor={colors.primaryDarker} />));
  }

  renderTableRows() {
    const { data, colors: customColors } = this.props;
    const { accordeonStyle, accordeonItemHeaderStyle } = accordeonStyles;
    const percent = (value) => ((value * 100) / this.totalMoney);

    const tableRows = _.sortBy(data, [(item) => item.total]).reverse().map((item, index) => {
      const accordeonHeader = this.renderAccordeonHeaderRow(
        {
          ...item,
          text: PaymentType.items[item._id].description,
          avg: percent(item.total),
          rowStyle: accordeonItemHeaderStyle(customColors[index]),
          circleColor: customColors[index],
        },
        index);

      const items = _(item.items)
        .map(p => ({ ...p, id: _.find(PaymentDetailType.items, type => type.key === p.key).type}))
        .sortBy('id')
        .value();

      const accordeonChildren = items.map((detail, detailIndex) => {
        const paymentType = _.find(PaymentDetailType.items, i => i.key === detail.key) || {};
        return this.renderAccordeonItemContent(
          {
            ...detail,
            text: paymentType.description,
            rowStyle: accordeonItemHeaderStyle(customColors[index]),
            columnStyle: { paddingVertical: 3 },
            circleColor: 'white',
          },
          detailIndex);
      });

      return (<AccordeonItem key={index} accordeonHeader={accordeonHeader} accordeonChildren={accordeonChildren} style={accordeonStyle} />);
    });

    const totalDetails = this.renderAccordeonDetailTotals();
    const totalSales = this.renderAccordeonTotals();
    return [tableRows, totalDetails, totalSales];
  }

  render() {
    const { outerContainer } = scaffolding;
    return (
      <View style={outerContainer}>
        <View style={{ backgroundColor: 'white' }}>
          <KyteTableHeader>
            {this.renderThs()}
          </KyteTableHeader>
          {this.renderTableRows()}
        </View>

      </View>
    );
  }
}

const styles = {
  fixFontSize: {
    fontSize: FONT_SIZE,
  },
};

export default AccordeonTable;
