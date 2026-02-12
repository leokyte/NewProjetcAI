import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import _ from 'lodash';
import { PaymentType } from '../../../../enums';
import { KyteTableHeader, KyteTableRow, KyteTh, KyteTd, CurrencyText, KyteText } from '../../../common';
import { scaffolding, colors } from '../../../../styles';
import I18n from '../../../../i18n/i18n';

class TypeTable extends Component {
  renderThs() {
    const { type } = this.props;
    const { alignEnd, alignCenter } = styles;
    const isUsers = type === 'users';
    const thead = [
      { th: isUsers ? I18n.t('statisticUser') : I18n.t('statisticType'), width: 1.5 },
      { th: I18n.t('statisticQTY'), width: 0.6, style: alignCenter },
      { th: I18n.t('statisticAmount'), width: 1.7, style: alignEnd, status: 'bold' },
      { th: '%', width: 0.8, style: alignEnd }
    ];

    return thead.map((item, i) => {
      return (
        <KyteTh key={i} width={item.width} status={item.status} style={item.style}>{item.th}</KyteTh>
      );
    });
  }

  renderTableRows() {
    const { data, type, multiUsers, colors: customColors } = this.props;
    const { alignEnd, alignCenter } = styles;
    const owner = _.find(multiUsers, (user) => user.permissions.isOwner);

    const renderPaymentType = (value) => {
      if (type === 'payments') return PaymentType.items[value].description;
      return value || owner.displayName;
    };

    const total = _.sumBy(data, (item) => item.total);
    const percent = (value) => ((value * 100) / total);

    return _.sortBy(data, [(item) => item.total]).reverse().map((item, i) => {
      const colorCircle = customColors[i];
      return (
        <KyteTableRow key={i}>
          <KyteTd width={1.5} colorCircle={colorCircle}>{renderPaymentType(item._id)}</KyteTd>
          <KyteTd width={0.6} style={alignCenter}>
            <KyteText>{item.count}</KyteText>
          </KyteTd>
          <KyteTd status={'bold'} width={1.7} style={alignEnd}>
            <KyteText weight="Medium"><CurrencyText value={item.total} /></KyteText>
          </KyteTd>
          <KyteTd width={0.8} style={alignEnd}><KyteText>{`${percent(item.total).toFixed(1)}%`}</KyteText></KyteTd>
        </KyteTableRow>
      );
    });
  }

  render() {
    const { outerContainer } = scaffolding;

    return (
      <View style={outerContainer}>
        <View style={{ backgroundColor: colors.lightBg }}>
          <KyteTableHeader>
            {this.renderThs()}
          </KyteTableHeader>
        </View>
        {this.renderTableRows()}
      </View>
    );
  }
}

const styles = {
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
};

const mapStateToProps = ({ preference, statistics, auth }) => ({
  currency: preference.account.currency,
  statistics,
  multiUsers: auth.multiUsers
});

export default connect(mapStateToProps, null)(TypeTable);
