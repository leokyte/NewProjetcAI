import React, { Component } from 'react';
import { View, Text, Alert, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { TabView, SceneMap } from 'react-native-tab-view';
import { isDirty, change } from 'redux-form';
import { bindActionCreators } from 'redux';

import CustomerSave from './CustomerSave';
import CustomerSales from './CustomerSales';
import CustomerAccount from './CustomerAccount';
import HeaderButton from '../../common/HeaderButton';
import { tabStyle, scaffolding, colors, Type } from '../../../styles';
import {
  customerDetailCreate,
  customerDetailUpdate,
  customerRemove,
  customersFetch,
  customerSave,
  salesLengthByCustomer,
  salesSetFilter,
  ordersSetFilter,
  salesClear,
  salesClearFilter,
  ordersClearFilter,
} from '../../../stores/actions';
import I18n from '../../../i18n/i18n';
import { CustomKeyboardAvoidingView, KyteToolbar, KyteSafeAreaView, KyteTabBar } from '../../common';
import { hasFilters } from '../../../util';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const initialLayout = { width: Dimensions.get('window').width };

class CustomerDetail extends Component {
  constructor(props) {
    super(props);
    const { params = {} } = this.props.route;
    const indexParam = params.tab;
    const index = typeof indexParam === 'number' && !Number.isNaN(indexParam) ? indexParam : Number(indexParam) || 0;

    this.state = {
      index,
      routes: [
        { key: '1', title: I18n.t('customerTabDataLabel').toUpperCase() },
        { key: '2', title: I18n.t('customerTabSalesLabel').toUpperCase() },
        { key: '3', title: I18n.t('sideMenu.orders').toUpperCase() },
        { key: '4', title: I18n.t('customerAccount.accountTabTitle').toUpperCase() },
      ],
    };
  }

  componentWillUnmount() {
    const { salesType } = this.props;
    this.props.salesSetFilter(null, 'customer');
    this.props.ordersSetFilter(null, 'customer');

    this.props.salesClear();

    if (salesType === 'order') return this.props.ordersClearFilter();
    this.props.salesClearFilter();
  }

  onRequestChangeTab = index => this.setState({ index });

  openCustomerCreate() {
    const { navigate } = this.props.navigation;
    this.props.customerDetailCreate();
    navigate('CustomerCreate');
  }

  renderHeader = props => (
    <KyteTabBar
      labelTextStyle={Type.fontSize(SMALL_SCREENS ? 11 : 13)}
      tabStyle={tabStyle.tab}
      indicatorStyle={tabStyle.indicator}
      style={tabStyle.base}
      {...props}
    />
  )

  removeCustomer() {
    const { navigation, customerId } = this.props;

    this.props.customerRemove(customerId, () => {
      this.props.customersFetch();
      navigation.goBack();
    });
  }

  showAlert() {
    const { permissions } = this.props.user;
    const { accountBalance, id } = this.props.customer;
    const isAdmin = permissions.isOwner || permissions.isAdmin;
    const customerHasSales = salesLengthByCustomer(id);
    const hasBalance = accountBalance !== 0 || customerHasSales;

    // Denied to remove!
    if (!isAdmin && hasBalance) {
      Alert.alert(
        I18n.t('customerDeleteAlertTitle'),
        I18n.t('customerDeleteAlertDescriptionHasBalanceNotAdmin'),
        [{ text: I18n.t('alertOk') }]
      );
    }

    // Allowed to remove!
    else {
      Alert.alert(
        I18n.t('customerDeleteAlertTitle'),
        hasBalance ?
        I18n.t('customerDeleteAlertDescriptionHasBalanceAdmin') :
        I18n.t('customerDeleteAlertDescription'),
        [
          { text: I18n.t('alertDismiss'), style: 'cancel' },
          { text: I18n.t('alertConfirm'), onPress: () => this.removeCustomer() },
        ]
      );
    }
  }

  renderRightButton() {
    const { customerId, navigation, saleHasFilter, orderHasFilter } = this.props;
    const { index } = this.state;

    if (!customerId) return null;

    const renderFilterButton = () => {
      const salesType = index === 1 ? 'sale' : 'order';
      const navigateTo = () => {
        const customClearFilters = () => {
          if (index === 2) return this.props.ordersSetFilter(customerId, 'customer');
          this.props.salesSetFilter(customerId, 'customer');
        };
        navigation.navigate('SalesPeriod', { salesType, customClearFilters });
      };

      const hasFilter = salesType === 'sale' ? saleHasFilter : orderHasFilter;
      return (
        <HeaderButton
          buttonKyteIcon
          icon={'filter'}
          color={hasFilter ? colors.actionColor : colors.primaryColor}
          onPress={() => navigateTo()}
        />
      );
    };

    return (
      <View style={{ flexDirection: 'row' }}>
        {index === 1 || index === 2 ? renderFilterButton() : null}
        <HeaderButton
          buttonKyteIcon
          icon={'trash'}
          color={colors.primaryColor}
          onPress={() => this.showAlert()}
        />
      </View>
    );
  }

  renderTabs = SceneMap({
      1: () => <CustomerSave navigation={this.props.navigation} hideHeader />,
      2: () => <CustomerSales navigation={this.props.navigation} salesType="sale" customer={this.props.customer} />,
      3: () => <CustomerSales navigation={this.props.navigation} salesType="order" customer={this.props.customer} />,
      4: () => <CustomerAccount navigation={this.props.navigation} />,
  });

  handleGoBack() {
    const { goBack } = this.props.navigation;
    const { dirty, route } = this.props;
    const { params = {} } = route;
    if (dirty) {
      Alert.alert(
        I18n.t('unsavedChangesTitle'),
        I18n.t('unsavedChangesDescription'),
        [
          { text: I18n.t('alertDiscard'), onPress: () => { this.props.customerDetailCreate(); goBack(); } },
          { text: I18n.t('alertSave'), onPress: null },
        ]
      );
      return;
    }

    if (params.goBackHandler) {
      params.goBackHandler();
    }

    this.props.customerDetailCreate();
    goBack();
  }

  render() {
    const { outerContainer } = scaffolding;
    const { navigation, customer } = this.props;

    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage
          borderBottom={0}
          headerTitle={customer.name}
          rightComponent={this.renderRightButton()}
          goBack={() => this.handleGoBack()}
          navigate={navigation.navigate}
          navigation={this.props.navigation}
        />
        <CustomKeyboardAvoidingView style={{ flex: 1 }}>
          <TabView
            initialLayout={initialLayout}
            navigationState={this.state}
            renderScene={this.renderTabs}
            renderTabBar={this.renderHeader}
            onIndexChange={this.onRequestChangeTab}
            lazy
          />
        </CustomKeyboardAvoidingView>
      </KyteSafeAreaView>
    );
  }
}
const mapStateToProps = (state) => {

  return {
    customerId: state.customers.detail.id,
    customer: state.customers.detail,
    dirty: isDirty('CustomerSave')(state),
    user: state.auth.user,
    saleHasFilter: hasFilters(state.sales.filterSales),
    orderHasFilter: hasFilters(state.sales.filterOrders),
  };
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({
    customerDetailCreate,
    customerDetailUpdate,
    customerRemove,
    customersFetch,
    customerSave,
    change,
    ordersSetFilter,
    salesSetFilter,
    salesClear,
    salesClearFilter,
    ordersClearFilter,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomerDetail);
