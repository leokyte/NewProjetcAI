import React, { Component } from 'react';
import { View, Dimensions, Image, Text } from 'react-native';
import { connect } from 'react-redux';
import NavigationService from '../../services/kyte-navigation';
import _ from 'lodash';

import { scaffolding, colors, Type, colorSet } from '../../styles';
import { SearchBar, ActionButton, KyteIcon, KyteText, FilterLabel, CurrencyText, KyteSafeAreaView } from '../common';
import CustomerNav from './common/CustomerNav';
import {
  customersFetch,
  customersFetchByTerm,
  customerDetailUpdate,
  customerDetailCreate,
  checkUserReachedLimit,
  customersSetFilterTabs,
  customersClear,
  salesSetFilter,
  ordersSetFilter,
  salesClear,
  salesClearFilter,
  ordersClearFilter,
} from '../../stores/actions';
import I18n from '../../i18n/i18n';
import { Schedule } from '../../../assets/images';
import CustomerList from './customer/CustomerList';
import { xor } from '../../util';
import { bindActionCreators } from 'redux';
import { logEvent } from '../../integrations/Firebase-Integration';

const Strings = {
  TOTAL_DEBIT_LABEL: I18n.t('customerAccount.receivableBalance'),
  TOTAL_CREDIT_LABEL: I18n.t('customerAccount.accountCreditsBalance'),
};

class CustomerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasCustomer: props.customers.length > 0,
      customers: props.customers,
      isSearchBarVisible: false,
      searchTerm: '',
    };
  }

  componentDidMount() {
    logEvent('Customer List View')
    this.props.customersFetch();
  }

  componentWillUnmount() {
    this.props.customersClear();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.customers, this.state.customers)) {
      this.setState({ customers: nextProps.customers, hasCustomers: nextProps.customers.length > 0 });
    }
  }

  setFilterTabs(type) {
    const { filterTabs } = this.props;
    this.props.customersSetFilterTabs({ ...filterTabs, [type]: !filterTabs[type] });
  }

  goToCustomer(customer) {
    const { navigate } = this.props.navigation;

    this.props.salesClear();
    this.props.salesClearFilter();
    this.props.ordersClearFilter();

    this.props.salesSetFilter(customer.id, 'customer');
    this.props.ordersSetFilter(customer.id, 'customer');
    this.props.customerDetailUpdate(customer);
    navigate({ key: 'CustomerDetailPage', name: 'CustomerDetail' });
  }

  openCustomerCreate() {
    const { navigate } = this.props.navigation;
    // checking if user has reached their limit
    const { userHasReachedLimit } = this.props;
    this.props.checkUserReachedLimit();

    if (userHasReachedLimit) {
      NavigationService.reset('Confirmation', 'SendCode', { origin: 'user-blocked', previousScreen: 'Customers' });

      return;
    }

    this.props.customerDetailCreate();

    navigate({ key: 'CustomerCreatePage', name: 'CustomerCreate' });
  }

  closeSearch() {
    this.setState({ isSearchBarVisible: false });
    this.searchCustomersByTerm('');
  }

  searchCustomersByTerm(text) {
    this.setState({ searchTerm: text.toLowerCase() });
  }

  toggleSearch() {
    const { isSearchBarVisible } = this.state;
    this.setState({ isSearchBarVisible: !isSearchBarVisible });
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

  renderStatementTotals(totals = this.props.balanceTotals) {
    const { filterTabs } = this.props;
    const { debit, credit, firstPurchase } = filterTabs;
    const { statementContainer, statementValues, statementTitle } = styles;
    // Show single total only for debit XOR credit (not for firstPurchase alone)
    const filtering = xor(credit, debit) && !firstPurchase;

    return (
      <View style={statementContainer}>
        <View style={statementValues()}>
          {
            filtering ? (
              <KyteText style={statementTitle} weight={'Semibold'} size={15} color={'white'}>
                {credit ? Strings.TOTAL_CREDIT_LABEL : Strings.TOTAL_DEBIT_LABEL}
              </KyteText>
            ) : (
              <>
                <KyteText style={statementTitle} weight={'Semibold'} size={15} color={'white'}>
                  {Strings.TOTAL_DEBIT_LABEL}
                </KyteText>
                <KyteText weight={'Semibold'} size={15} pallete={'barcodeRed'}>
                  <CurrencyText value={totals.debit} />
                </KyteText>
              </>
            )
          }
        </View>
        <View style={[statementValues('flex-end'), { flex: 1.2 }]}>
          {
            filtering ? (
              <KyteText weight={'Semibold'} size={15} pallete={credit ? 'actionColor' : 'barcodeRed'}>
                <CurrencyText value={credit ? totals.credit : totals.debit} />
              </KyteText>
            ) : (
              <>
                <KyteText style={statementTitle} weight={'Semibold'} size={15} color={'white'}>
                  {Strings.TOTAL_CREDIT_LABEL}
                </KyteText>
                <KyteText weight={'Semibold'} size={15} pallete={'actionColor'}>
                  <CurrencyText value={totals.credit} />
                </KyteText>
              </>
            )
          }
        </View>
      </View>
    );
  }

  renderFilterLabels() {
    const { filterTabs } = this.props;
    const { filterLabelsContainer } = styles;
    const filterLabels = [
      { name: I18n.t('customerAccount.customerFilterFirstPurchase'), type: 'firstPurchase' },
      { name: I18n.t('customerAccount.customerFilterReceivables'), type: 'debit' },
      { name: I18n.t('customerAccount.customerFilterAccountCredits'), type: 'credit' },
    ];

    return (
      <View style={filterLabelsContainer}>
        {filterLabels.map((f, i) => (
          <FilterLabel
            key={i}
            active={filterTabs[f.type]}
            onPress={() => this.setFilterTabs(f.type)}
          >
            {f.name.toUpperCase()}
          </FilterLabel>
        ))}
      </View>
    );
  }

  renderContent() {
    const { debit, credit, firstPurchase } = this.props.filterTabs;
    const { customers, searchTerm } = this.state;
    const { balanceTotals } = this.props;
    const applyFilter = debit || credit || firstPurchase;
    const searchMethod = (customer, property) => {
      return customer[property] && customer[property].toLowerCase().includes(searchTerm);
    };

    const finalCustomers = [];
    customers.forEach(eachCustomer => {
      if (!searchTerm || searchMethod(eachCustomer, 'name') || searchMethod(eachCustomer, 'celPhone') || searchMethod(eachCustomer, 'phone') || searchMethod(eachCustomer, 'email')) {
        // check filter
        if (applyFilter) {
          // apply for first purchase
          if (firstPurchase && eachCustomer.salesQuantity === 1) finalCustomers.push(eachCustomer);
          // apply for debit
          else if (debit && eachCustomer.accountBalance < 0) finalCustomers.push(eachCustomer);
          // apply for credit
          else if (credit && eachCustomer.accountBalance > 0) finalCustomers.push(eachCustomer);

          // apply all
        } else {
          finalCustomers.push(eachCustomer);
        }
      }
    });

    // Calculate totals from filtered customers
    const filteredTotals = finalCustomers.reduce((acc, customer) => {
      if (customer.accountBalance < 0) {
        acc.debit += Math.abs(customer.accountBalance);
      } else if (customer.accountBalance > 0) {
        acc.credit += customer.accountBalance;
      }
      return acc;
    }, { debit: 0, credit: 0 });

    return (
      <View style={{ flex: 1 }}>
        {this.renderSearchBar()}
        {balanceTotals ? this.renderFilterLabels() : null}
        <CustomerList
          data={finalCustomers}
          onPress={(customer) => this.goToCustomer(customer)}
        />
        {this.renderStatementTotals(applyFilter ? filteredTotals : balanceTotals)}
      </View>
    );
  }

  renderEmptyContent() {
    const { bottomContainer } = scaffolding;
    const { topContainer, infoStyle, svgImage } = styles;
    const { navigate } = this.props.navigation; 

    return (
      <View style={{ flex: 1 }}>
        <View style={topContainer}>
          <Image style={svgImage} source={{ uri: Schedule }} />
          <Text style={infoStyle}>
            {I18n.t('customerEmptyListDescription')}
          </Text>
        </View>

        <View style={[bottomContainer, { justifyContent: 'flex-end' }]}>
          <ActionButton leftIcon={<KyteIcon name={'import'} color={colors.secondaryBg} size={20} />}
            onPress={() => navigate('CustomerImport')} cancel>
            {I18n.t('customerImportContactsEmptyContentButton')}
          </ActionButton>
        </View>
        
        <View style={bottomContainer}>
          <ActionButton
            rightIcon={<KyteIcon name={'plus-cart'} color={colors.lightBg} size={20} />}
            onPress={() => this.openCustomerCreate()}
          >
            {I18n.t('customerEmptyListNewClient')}
          </ActionButton>
        </View>
      </View>
    );
  }

  render() {
    const { outerContainer } = scaffolding;
    const { customers, navigation } = this.props;
    const hasCustomer = customers.length > 0;

    return (
      <KyteSafeAreaView style={outerContainer}>
        <CustomerNav navigation={navigation} />
        {hasCustomer ? this.renderContent() : this.renderEmptyContent()}
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  topContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  infoStyle: [
    Type.Regular,
    Type.fontSize(14),
    colorSet(colors.secondaryBg),
    { textAlign: 'center', lineHeight: 25, paddingHorizontal: 20 },
  ],
  svgImage: {
    resizeMode: 'contain',
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').height * 0.35,
  },
  statementContainer: {
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: colors.secondaryBg,
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    width: '100%',
  },
  statementValues: (alignItems = 'flex-start') => ({
    flex: 1,
    flexDirection: 'column',
    alignItems,
  }),
  statementTitle: {
    marginBottom: 7,
  },
  filterLabelsContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
};

const mapStateToProps = (state) => ({
  customers: state.customers.list,
  balanceTotals: state.customers.balanceTotals,
  user: state.auth.user,
  filterTabs: state.customers.filterTabs,
  userHasReachedLimit: state.common.userHasReachedLimit,
});

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    customersFetch,
    customersFetchByTerm,
    customerDetailUpdate,
    customerDetailCreate,
    checkUserReachedLimit,
    customersSetFilterTabs,
    customersClear,
    salesSetFilter,
    ordersSetFilter,
    salesClear,
    salesClearFilter,
    ordersClearFilter,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomerContainer);
