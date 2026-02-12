import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import _ from 'lodash';
import moment from 'moment/min/moment-with-locales';
import { KyteText, KyteIcon, CurrencyText, GatewayLogo, Tag } from '../common';
import DetailItems from './sale-detail/DetailItems';
import { colors } from '../../styles';
import I18n from '../../i18n/i18n';

class SaleQuickView extends Component {
  renderGateway(gateway) {
    const container = { paddingLeft: 8, marginLeft: 8, borderLeftWidth: 1, borderColor: colors.disabledIcon };

    return (
      <View style={container}>
        <GatewayLogo
          gateway={gateway}
          resizeMode={gateway === 'stripe-connect' ? 'contain' : null}
        />
      </View>
    );
  }

  renderCustomer() {
    const { content: sale } = this.props;
    return (
      <View style={[styles.sectionTd, styles.rightAlignment]}>
        <Tag
          info={_.map(sale.customer.name.split(' '), _.upperFirst).join(' ')}
          color={colors.primaryColor}
          icon="customer"
          onPress={null}
          padding={12}
        />
      </View>
    );
  }

  render() {
    const { content: sale } = this.props;
    const payment = _.find(sale.payments, p => p.transaction);
    const hasTransaction = payment && payment.transaction.gateway;
    const Capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const statusInfo = sale.statusInfo || {};

    // Status from notification
    const notificationStatus = I18n.t(hasTransaction ? 'words.s.confirmed' : 'words.s.pending');
    const notifiationColor = hasTransaction ? colors.actionColor : colors.primaryColor;

    // Status from saale model
    const status =  Capitalize(statusInfo.alias || notificationStatus);
    const statusColor = statusInfo.color || notifiationColor;
    const statusIcon = sale.status === 'opened' ? 'clock-stroke-small' : 'clock-small';

    return (
      <View style={styles.flexContainer}>
          {/* <View style={[styles.sectionRow(), styles.header]}>
            <View style={styles.sectionTd}>
              <KyteText weight="Medium" size={14} lineThrough={sale.isCancelled}>
                {moment(sale.dateCreation).format('l, LT')}
              </KyteText>
            </View>
            {sale.customer ? this.renderCustomer() : null}
          </View> */}
        <View style={styles.topContainer}>
          <View style={styles.sectionRow(20)}>
            <View style={styles.sectionTd}>
              <KyteText size={22} lineThrough={sale.isCancelled}>
                <CurrencyText value={sale.totalNet} />
              </KyteText>
            </View>
            <View style={[styles.sectionTd, styles.rightAlignment]}>
              <KyteText weight="Medium">
                {`#${sale.number}`}
              </KyteText>
              <KyteText size={13} weight="Medium">
                {sale.userName}
              </KyteText>
            </View>
          </View>
          <View style={styles.sectionRow(5)}>
            <View style={[styles.sectionTd, styles.leftColumn]}>
              <KyteIcon
                style={styles.icon}
                size={16}
                name={statusIcon}
                color={statusColor}
              />
              <KyteText ellipsizeMode="tail" weight={500} numberOfLines={1} size={13}>
                {status}
              </KyteText>
              {hasTransaction ? this.renderGateway(payment.transaction.gateway) : null}
            </View>
            <View style={[styles.sectionTd, styles.rightColumn]}>
              <KyteIcon style={styles.icon} name={sale.toDeliver ? 'pin' : 'store'} size={15} color={colors.primaryBg} />
              <KyteText weight="Medium" pallete="primaryBg">
                {I18n.t(sale.toDeliver ? 'catalogOrderDelivery' : 'words.s.withdrawal')}
              </KyteText>
            </View>
          </View>
        </View>
        <View style={styles.flexContainer}>
          <ScrollView>
            <DetailItems onPress={this.props.onPress} sale={sale} />
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = {
  topContainer: {
    backgroundColor: colors.lightBg,
    padding: 15,
  },
  header: {
    padding: 15,
    backgroundColor: colors.white
  },
  sectionRow: (paddingBottom = 15) => ({
    flexDirection: 'row',
    paddingBottom,
  }),
  sectionTd: {
    flex: 1,
    justifyContent: 'center',
   },
  rightAlignment: {
    alignItems: 'flex-end',
  },
  flexContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  rightColumn: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  leftColumn: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
    position: 'relative',
  },
};


export default SaleQuickView;
