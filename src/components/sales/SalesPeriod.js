import React, { Component } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clone, find, remove } from 'lodash';

import { colors, scaffolding, Type, colorSet } from '../../styles';
import { ActionButton, FilterPeriod, FilterPaymentMethods, FilterRangePeriod, DetailPage, CheckItem } from '../common';
import { Period, toList } from '../../enums';
import I18n from '../../i18n/i18n';
import { salesReplaceFilter, ordersReplaceFilter, salesClearFilter, ordersClearFilter } from '../../stores/actions';
import { logEvent } from '../../integrations';
import { paymentsGenericTypes, paymentsTypesEvents } from '../../util';

class SalesPeriod extends Component {
  static navigationOptions = () => {
    return {
      header: null,
    };
  };

  constructor(props) {
    super(props);

    const { params } = this.props.route;
    const { salesStatus, salesType } = params;

    this.state = {
      startDate: '',
      endDate: '',
      salesStatus,
      salesType,
      localFilters: salesType === 'order' ? props.filterOrders : props.filterSales,
    };
  }

  setStartDate(date) {
    const { localFilters } = this.state;
    const { days } = localFilters;
    this.setState({ localFilters: { ...localFilters, days: { ...days, start: date }, period: null } });
  }
  setEndDate(date) {
    const { localFilters } = this.state;
    const { days } = localFilters;
    this.setState({ localFilters: { ...localFilters, days: { ...days, end: date }, period: null } });
  }

  toggleCancelledSales() {
    const { localFilters } = this.state;
    const { cancelledSales } = localFilters;
    this.setState({ localFilters: { ...localFilters, cancelledSales: !cancelledSales } });
  }

  toggleUser({ name, uid, title }) {
    const { localFilters } = this.state;
    const { users } = localFilters;
    const selectedUsers = clone(users);

    const checkUser = find(selectedUsers, s => { return s.uid === uid; });
    if (checkUser) {
      remove(selectedUsers, s => { return s.uid === checkUser.uid; });
    } else {
      selectedUsers.push({ name: name || title, uid });
    }
    this.setState({ localFilters: { ...localFilters, users: selectedUsers } });
  }

  salesApplyFilter() {
    const { localFilters, salesType } = this.state;
    const { goBack } = this.props.navigation;
    const { period, days, paymentMethods, cancelledSales, gatewayMethods } = localFilters;

    logEvent(`${salesType === 'order' ? 'Order' : 'Sale'} Filter`, {
      selected_period: days.start ? "custom" : period,
      selected_payment_type: paymentsTypesEvents(paymentMethods),
      only_online_payment_sales: Boolean(gatewayMethods.length),
      only_canceled_sales: cancelledSales, 
    })
    if (salesType === 'order') {
      this.props.ordersReplaceFilter(localFilters);
      return goBack();
    }
    this.props.salesReplaceFilter(localFilters);

    goBack();
  }

  clearFilters() {
    const { salesType } = this.state;
    const { filterOrders, filterSales, navigation, route } = this.props;
    const { goBack } = navigation;
    const { params = {} } = route;
    const filters = salesType === 'order' ? filterOrders : filterSales;
    this.setState({ localFilters: filters }, () => {
      const customClearFilters = params.customClearFilters;

      if (salesType === 'order') {
        this.props.ordersClearFilter();
        if (customClearFilters) customClearFilters();
        return goBack();
      }
      this.props.salesClearFilter();
      if (customClearFilters) customClearFilters();
      goBack();
    });
  }

  selectSalePeriod(period) {
    const { localFilters } = this.state;
    this.setState({ localFilters: { ...localFilters, days: {} , period } });
  }

  setPaymentMethods(paymentType) {
    const { localFilters } = this.state;
    const { paymentMethods } = localFilters;
    const index = paymentMethods.indexOf(paymentType);
    const newPM = paymentMethods.concat([]); // create new obj

    if (index < 0) newPM.push(paymentType); // insert paymentType
    else newPM.splice(index, 1); // remove paymentType

    newPM.sort();
    this.setState({ localFilters: { ...localFilters, paymentMethods: newPM } });
  }

  setPaymentGateway(gateway, isActive) {
    const { localFilters } = this.state;
    const { gatewayMethods } = localFilters;
    const addFilter = [...gatewayMethods, gateway.type];
    const removeFilter = gatewayMethods.filter(g => g !== gateway.type);

    this.setState({ localFilters: { ...localFilters, gatewayMethods: !isActive ? addFilter : removeFilter } });
  }

  renderPeriodChoices() {
    const { period } = this.state.localFilters;
    const periods = toList(Period);

    return (
      <FilterPeriod
        selectedPeriod={period}
        periods={periods}
        onPress={(type, period) => this.selectSalePeriod(period)}
      />
    );
  }

  renderPaymentMethodsChoices() {
    const { filterSession, filterSessionTitle } = styles;
    const { paymentMethods } = this.state.localFilters;
    return (
      <View style={filterSession}>
        <Text style={filterSessionTitle}>{I18n.t('statisticPaymentMethod.title')}</Text>
        <FilterPaymentMethods
          paymentMethods={paymentMethods}
          onPress={type => this.setPaymentMethods(type)}
        />
      </View>
    );
  }

  renderPaymentGatewaysChoices() {
    const { filterSession, filterSessionTitle } = styles;
    const { allGateways } = this.props;
    const { gatewayMethods } = this.state.localFilters;
    const gatewayList = allGateways.filter(g => g.active);
    const active = (gateway) => gatewayMethods.find(g => g === gateway.type);

    return (
      <View style={filterSession}>
        <Text style={filterSessionTitle}>{I18n.t('expressions.paidWith')}</Text>
        {gatewayList.map(g => {
          const isActive = Boolean(active(g));
          return (
            <CheckItem
              key={g.type}
              title={g.description}
              checked={isActive}
              onPress={() => this.setPaymentGateway(g, isActive)}
            />
          );
        })}
      </View>
    );
  }

  renderSelectedUsers() {
    const { filter } = this.props;
    const { selectedUSersContainer } = styles;
    const users = filter.users.map((user, i) => {
      const useComma = i !== 0;
      return (
        <Text key={i} style={[Type.Regular, colorSet(colors.primaryColor)]}>
          {`${useComma ? ', ' : ''}${user.name}`}
        </Text>
      );
    });

    return <View style={selectedUSersContainer}>{users}</View>;
  }

  renderPickerTitle() {
    const { pickerTitle } = styles;
    return (
      <Text style={[Type.Regular, pickerTitle]}>
        {I18n.t('salesPeriodSellersSelector')}
      </Text>
    );
  }

  render() {
    const { bottomContainer } = scaffolding;
    const { periodOuter, filterSession } = styles;
    const { navigation, allGateways } = this.props;
    const { salesType, localFilters } = this.state;
    const { search, period, cancelledSales, days, users } = localFilters;
    const { start, end } = days;
    const misEnd = start && !end;
    const misStart = !start && end;
    const invalidDate = misEnd || misStart;
    const clearBtn = { text: I18n.t('words.s.clear'), onPress: () => this.clearFilters() };
    const isOrder = salesType === 'order';
    const gatewayList = allGateways.filter(g => g.active);

    // checking if there's any filter
    const filtersArr = [ search, period, cancelledSales, days.start, users.length ];
    const hasFilters = filtersArr.some(f => f);

    return (
      <DetailPage
        pageTitle={I18n.t('words.s.filter')}
        goBack={() => navigation.goBack()}
        navigate={navigation.navigate}
        navigation={this.props.navigation}
        rightText={hasFilters ? clearBtn : null}
        showCloseButton
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={periodOuter}>
            <FilterRangePeriod
              startDate={start}
              endDate={end}
              setStartDate={date => this.setStartDate(date)}
              setEndDate={date => this.setEndDate(date)}
            />
          </View>
          {this.renderPeriodChoices()}
          {this.renderPaymentMethodsChoices()}
          {gatewayList.length ? this.renderPaymentGatewaysChoices() : null}
          <View style={filterSession}>
            <View>
              <CheckItem
                onPress={() => this.toggleCancelledSales()}
                checked={localFilters.cancelledSales}
                title={isOrder ? I18n.t('salesPeriodCanceledOrdersOnly') : I18n.t('salesPeriodCanceledSalesOnly')}
              />
            </View>
          </View>
        </ScrollView>
        <View style={bottomContainer}>
          <ActionButton
            alertTitle={''}
            alertDescription={I18n.t('salesPeriodEmptyAlertDescription')}
            onPress={() => this.salesApplyFilter()}
            disabled={invalidDate}
          >
            {I18n.t('salesPeriodApplyButton')}
          </ActionButton>
        </View>
      </DetailPage>
    );
  }
}

const styles = {
  pickerInner: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.primaryGrey,
  },
  pickerTitle: {
    flex: 1,
    color: colors.primaryColor,
    paddingTop: 5,
  },
  periodOuter: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  checkStyles: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  filterSession: {
    borderTopWidth: 15,
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
    paddingVertical: 25,
    paddingHorizontal: 15,
  },
  filterSessionTitle: {
    fontFamily: 'Graphik-Medium',
    color: colors.primaryColor,
    fontSize: 18,
    marginBottom: 10,
  },
  selectedUSersContainer: {
    flex: 1,
    flexDirection: 'row',
  },
};

const mapStateToProps = ({ auth, sales, externalPayments, common }) => ({
  auth,
  filterOrders: sales.filterOrders,
  filterSales: sales.filterSales,
  allGateways: externalPayments.allGateways,
  isOnline: common.isOnline,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({
    salesReplaceFilter,
    ordersReplaceFilter,
    salesClearFilter,
    ordersClearFilter,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SalesPeriod);
