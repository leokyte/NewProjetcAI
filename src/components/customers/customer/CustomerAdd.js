import React, { Component } from 'react';
import { View, Dimensions, Image, Text, Alert } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import {
  customersFetch,
  currentSaleAddCustomer,
  currentSaleRemoveCustomer,
  customerDetailBySale,
  customersFetchByTerm,
  checkUserReachedLimit,
  customerFetchById,
  customerManageNewBalance,
  currentSaleSplitPayment,
  currentSaleClearAccountPayments,
} from '../../../stores/actions/index';
import { colors, colorSet, scaffolding, Type } from '../../../styles';
import { ActionButton, SearchBar, DetailPage, KyteIcon } from '../../common';
import { checkUserPermission, generateTestID } from '../../../util';
import I18n from '../../../i18n/i18n';
import { logEvent } from '../../../integrations';
import { Schedule } from '../../../../assets/images';
import NavigationService from '../../../services/kyte-navigation';
import CustomerList from './CustomerList';

// Codesplit declaration
import CustomerPayLaterDeniedAlert from '../../current-sale/payments/alerts/CustomerPayLaterDeniedAlert';
import CustomerPositiveBalanceAlert from '../../current-sale/payments/alerts/CustomerPositiveBalanceAlert';
import NoCreditAvailableAlert from '../../current-sale/payments/alerts/NoCreditAvailableAlert';

const Strings = {
  permissionAlertTitle: I18n.t('customerAccount.customerWithoutMoneyTitle'),
  permissionAlertDescription: I18n.t('customerAccount.customerWithoutMoneyDescription'),
};

class CustomerAdd extends Component {
  static navigationOptions = () => {
    return {
      header: null
    };
  };

  constructor(props) {
    super(props);
    const { permissions } = props.user;

    this.state = {
      hasCustomer: props.customers.length > 0,
      customers: props.customers,
      isSearchBarVisible: false,
      searchTerm: '',
      shrinkSection: false,
      showPayLaterModal: false,
      showCustomerPositiveBalanceAlert: false,
      showNoCreditAvailableAlert: false,
      allowCustomerInDebt: checkUserPermission(permissions).allowCustomerInDebt
    };
  }

  componentDidMount() {
    const { params } = this.props.route;

    const isPayLater = params && params.origin === 'pay-later';
    const isCustomerAccount = params && params.origin === 'customer-account';
    if (isPayLater || isCustomerAccount) {
      return this.props.customersFetch(null, params.origin);
    }
    this.props.customersFetch();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.customers, this.state.customers)) {
      this.setState({ customers: nextProps.customers });
    }
  }

  toggleSearch() {
    const { isSearchBarVisible } = this.state;
    this.setState({ isSearchBarVisible: !isSearchBarVisible });
  }

  alertPermissionToDebit() {
    Alert.alert(
      Strings.permissionAlertTitle,
      Strings.permissionAlertDescription,
      [{ text: I18n.t('alertOk') }]
    );
  }

  closeSearch() {
    this.setState({ isSearchBarVisible: false });
    this.searchCustomersByTerm('');
  }

  renderSearchBar() {
    return (
      <SearchBar
        isOpened={this.state.isSearchBarVisible}
        openedPlaceholder={I18n.t('customerSearchPlaceholderActive')}
        closedPlaceholder={I18n.t('customerSearchPlaceholder')}
        toggleSearch={this.toggleSearch.bind(this)}
        closeSearchAction={this.closeSearch.bind(this)}
        searchAction={this.searchCustomersByTerm.bind(this)}
      />
    );
  }

  removeCustomer() {
    const { goBack } = this.props.navigation;
    const { params } = this.props.route;
    const splitPaymentOrigin = params && params.origin === 'split-payment';
    const clearAccountPayments = params && params.clearAccountPayments;

    this.props.currentSaleRemoveCustomer();

    if (splitPaymentOrigin || clearAccountPayments)   {
        this.props.currentSaleClearAccountPayments();
        this.props.currentSaleSplitPayment();
      }
    goBack();
  }

  searchCustomersByTerm(text) {
    this.setState({ searchTerm: text.toLowerCase() });
  }

  renderRemoveButton() {
    const { bottomContainer } = scaffolding;
    return (
      <View style={bottomContainer} >
        <ActionButton
          testProps={generateTestID('remove-nck')}
          onPress={() => this.removeCustomer()}
          cancel
        >
          {I18n.t('customerUnattachButton')}
        </ActionButton>
      </View>
    );
  }

  goToCustomerBalance(customer, isPayLater) {
    const { navigate } = this.props.navigation;
    const { params } = this.props.route;
    const { totalNet, paymentRemaining } = this.props.currentSale;
    const useCredit = isPayLater ? false : totalNet > customer.accountBalance;
    const chargedValue = useCredit ? customer.accountBalance : totalNet;
    const payment = params && params.payment;
    const useSplit = params && params.useSplit;
    const useRemaining = useSplit && (customer.accountBalance > paymentRemaining);

    // Fetch customer to manage new balance from customers.detail
    this.props.customerFetchById(customer.id);
    this.props.currentSaleAddCustomer(customer);
    this.props.customerManageNewBalance('remove', useRemaining ? paymentRemaining : chargedValue);

    navigate({
      key: 'CustomerAccountBalancePage',
      name: 'CustomerSaleAccountBalance',
      params: { split: params.split || false, useSplit: useSplit || useCredit, payment, useRemaining },
    });
  }

  goToAddCustomer() {
    const { navigate } = this.props.navigation;
    const { params = {} } = this.props.route;
    const { origin = false } = params;
    const payLaterOrigin = origin === 'pay-later';

    // checking if user has reached their limit
    const { userHasReachedLimit, user } = this.props;
    this.props.checkUserReachedLimit();
    if (userHasReachedLimit) {
      logEvent('UserReachedLimit', user);
      NavigationService.reset('Confirmation', 'SendCode', { origin: 'user-blocked', previousScreen: 'CurrentSale' });
      return;
    }
    
    this.props.customerDetailBySale();
    navigate('CustomerCreate', { payLaterOrigin });
  }

  openCustomerImport() {
    const { navigate } = this.props.navigation;
    // checking if user has reached their limit
    const { userHasReachedLimit, user } = this.props;
    this.props.checkUserReachedLimit();
    if (userHasReachedLimit) {
      logEvent('UserReachedLimit', user);
      NavigationService.reset('Confirmation', 'SendCode', { origin: 'user-blocked', previousScreen: 'Customers' });
      return;
    }
    logEvent('Customer Import Start')
    
    navigate('CustomerImport');
  }

  goToPaymentEdition(customer) {
    const { navigate } = this.props.navigation;
    const { payments } = this.props.currentSale;
    const { params = {} } = this.props.route;

    const paramPayment = params.payment;
    const payment = paramPayment || payments[0];
    const backPage = { key: 'PaymentPage', name: 'Payment' };

    this.props.currentSaleAddCustomer(customer);
    navigate({ key: 'PaymentEditionPage', name: 'PaymentEdition', params: { payment, split: this.useSplit, page: backPage } });
  }

  renderContent() {
    //const { permissions } = this.props.user;
    const { customers, searchTerm, allowCustomerInDebt } = this.state;
    const { goBack, navigate } = this.props.navigation;
    const { params = {} } = this.props.route;
    const { origin = false } = params;
    const payLaterOrigin = origin === 'pay-later';
    const splitPaymentOrigin = origin === 'split-payment';

    const isCustomerAccount = params.useCustomerAccount;
    const disableUseCredit = params.disableCredit;
    const disableUseDebit = params.disableDebit;
    const clearAccountPayments = params.clearAccountPayments;

    const onPressCustomerSelected = (customer) => {
      // Reset Payments
      if (clearAccountPayments) {
        this.props.currentSaleClearAccountPayments();
        this.props.currentSaleSplitPayment();
      }

      if (isCustomerAccount) {
        if (disableUseDebit && customer.accountBalance <= 0) return this.setState({ showNoCreditAvailableAlert: true });
        logEvent('Checkout Customer Add', {
          where: 'store-credit'
        })
        return this.goToCustomerBalance(customer);
      }

      // Check if PayLater material
      else if (payLaterOrigin) {
        // Check if user have credit
        if (disableUseCredit && customer.accountBalance > 0) return this.setState({ showCustomerPositiveBalanceAlert: true });

        // Check if customer not allowed to pay later
        else if (!customer.allowPayLater) {
          // Navigate to allow customer to use Pay Later OR just shows a warning
          if (allowCustomerInDebt) return navigate({ key: 'AllowPayLaterPage', name: 'AllowPayLater', params: { customer } });
          return this.setState({ showPayLaterModal: customer.name });
        }

        // if customer is allowed to pay later (y)
        logEvent('Checkout Customer Add', {
          where: 'paylater'
        })
        return this.goToCustomerBalance(customer, true);
      }

      logEvent('Checkout Customer Add', {
        where: origin
      })
      this.props.currentSaleAddCustomer(customer);

      if (splitPaymentOrigin) {
        if (!customer.allowPayLater) return params.goToAllowCustomerInDebit(customer, params.payment);
        return params.customerBalanceFromSplit(params.payment, customer);
      }
      this.props.customerFetchById(customer.id);
      goBack();
    };

    let finalCustomers = [];
    customers.forEach(eachCustomer => {
      if (!searchTerm || (eachCustomer.name && eachCustomer.name.toLowerCase().includes(searchTerm)) || (eachCustomer.celPhone && eachCustomer.celPhone.includes(searchTerm)) || (eachCustomer.phone && eachCustomer.phone.includes(searchTerm))) {
        finalCustomers.push(eachCustomer);
      }
    });

    const disableOptions = {
      disableWithCredit: disableUseCredit,
      disableWithoutCredit: disableUseDebit,
    };

    return (
      <View style={{ flex: 1 }}>
        {this.renderSearchBar()}
        <CustomerList
          data={finalCustomers}
          onPress={onPressCustomerSelected.bind(this)}
          disableOptions={disableOptions}
        />
      </View>
    );
  }

  renderEmptyContent() {
    const { bottomContainer } = scaffolding;
    const { topContainer, infoStyle, svgImage } = styles;
    const { navigate } = this.props.navigation;
    const { params = {} } = this.props.route;
    const { origin = false } = params;
    const payLaterOrigin = origin === 'pay-later';

    return (
      <View style={{ flex: 1 }}>
        <View style={topContainer}>
          <Image style={svgImage} source={{ uri: Schedule }} />

          <Text style={infoStyle}>
            {I18n.t('customerEmptyListDescription')}
          </Text>
        </View>
        <View style={[bottomContainer, { justifyContent: 'flex-end' }]}>
          <ActionButton
            testProps={generateTestID('import-bnck')}
            leftIcon={<KyteIcon name={'import'} color={colors.secondaryBg} size={20} />}
            onPress={() => navigate('CustomerImport')}
            cancel
          >
            {I18n.t('customerImportContactsEmptyContentButton')}
          </ActionButton>
        </View>
        <View style={bottomContainer}>
          <ActionButton
            testProps={generateTestID('new-cust-csr')}
            rightIcon={<KyteIcon name={'plus-cart'} color={colors.lightBg} size={20} />}
            onPress={() => navigate('CustomerCreate', { payLaterOrigin })}
          >
            {I18n.t('customerEmptyListNewClient')}
          </ActionButton>
        </View>
      </View>
    );
  }

  renderPayLaterModal() {
    const { showPayLaterModal } = this.state;
    const hideModal = () => this.setState({ showPayLaterModal: false });

    return (
      <CustomerPayLaterDeniedAlert
        hideModal={() => hideModal()}
        customerName={showPayLaterModal}
      />
    );
  }

  showCustomerPositiveBalanceAlert() {
    const hideModal = () => this.setState({ showCustomerPositiveBalanceAlert: false });
    return <CustomerPositiveBalanceAlert hideModal={() => hideModal()} />;
  }

  showNoCreditAvailableAlert() {
    const hideModal = () => this.setState({ showNoCreditAvailableAlert: false });
    return <NoCreditAvailableAlert hideModal={() => hideModal()} />;
  }

  render() {
    const { navigation, currentSaleCustomer, customers, user, route} = this.props;
    const { showPayLaterModal, showNoCreditAvailableAlert, showCustomerPositiveBalanceAlert } = this.state;
    const { params = {} } = route;
    const hasCustomer = customers.length > 0;
    this.useSplit = params.split;
    this.allowToUseDebit = checkUserPermission(user.permissions).allowCustomerInDebt;

    return (
      <DetailPage
        pageTitle={I18n.t('customerSavePageTitle')}
        goBack={navigation.goBack}
        rightButtons={[
          { icon: 'import', color: colors.secondaryBg, onPress: () => this.openCustomerImport(), iconSize: 20, testProps: generateTestID('import-sml-nck')},
          { icon: 'plus-calculator', color: colors.actionColor, onPress: () => this.goToAddCustomer(), iconSize: 18, testProps: generateTestID('add-customers')},
        ]}
      >
        {hasCustomer ? this.renderContent() : this.renderEmptyContent()}
        {currentSaleCustomer ? this.renderRemoveButton() : null}
        {showPayLaterModal ? this.renderPayLaterModal() : null}
        {showCustomerPositiveBalanceAlert ? this.showCustomerPositiveBalanceAlert() : null}
        {showNoCreditAvailableAlert ? this.showNoCreditAvailableAlert() : null}
      </DetailPage>
    );
  }
}

const styles = {
  buttonStyle: {
    borderWidth: 1,
    borderColor: colors.lightColor
  },
  topContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  infoStyle: [
    Type.Regular,
    Type.fontSize(14),
    colorSet(colors.secondaryBg),
    { textAlign: 'center', lineHeight: 25, paddingHorizontal: 20 }
  ],
  svgImage: {
    resizeMode: 'contain',
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').height * 0.35
  }
};

const mapStateToProps = (state) => ({
  customers: state.customers.list,
  currentSaleCustomer: state.currentSale.customer,
  user: state.auth.user,
  userHasReachedLimit: state.common.userHasReachedLimit,
  currentSale: state.currentSale
});

export default connect(mapStateToProps, {
  customersFetch,
  currentSaleAddCustomer,
  currentSaleRemoveCustomer,
  customerDetailBySale,
  customersFetchByTerm,
  checkUserReachedLimit,
  customerFetchById,
  customerManageNewBalance,
  currentSaleSplitPayment,
  currentSaleClearAccountPayments,
})(CustomerAdd);
