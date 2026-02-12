import React, { Component } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment/min/moment-with-locales';
import _ from 'lodash';
import { CheckBox } from 'react-native-elements';
import { KyteToolbar, FilterRangePeriod, FilterPeriod, KyteText, KyteIcon, KyteModal, KyteList, ActionButton, KyteSafeAreaView } from '../../common';
import {
  customersSetAccountFilter,
  customersClearAccountFilter,
  customerAccountGetStatements,
  customersFetchStatements,
  customersSetAccountGeneralFilter,
  customersClearAccountGeneralFilter
} from '../../../stores/actions';
import { Period, toList } from '../../../enums';
import { colors, Type } from '../../../styles';
import I18n from '../../../i18n/i18n';

const Strings = {
  HEADER_TITLE: I18n.t('stockFilterTitle'),
  TRANSACTION_TYPE_TITLE: I18n.t('statisticType'),
  TRANSACTION_TYPE_DEBIT: I18n.t('customerAccount.customerDetailFilterReceivables'),
  TRANSACTION_TYPE_CREDIT: I18n.t('customerAccount.customerDetailFilterAccountCredits'),
  SELLERS_TITLE: I18n.t('salesPeriodSellersTitle'),
  SELLERS_PLACEHOLDER: I18n.t('salesPeriodSellersSelector'),
  SELLERS_OPTION_CLEAN_TITLE: I18n.t('salesPeriodSelectSellersPlaceholder'),
  BUTTON_LABEL: I18n.t('salesPeriodApplyButton'),
};

class CAF extends Component {
  constructor(props) {
      super(props);

      const { filter, setFilter, clearFilter } = this.chooseFilter(props);
      const startDate = filter.days.start ? moment(filter.days.start).toDate() : null;
      const endDate = filter.days.end ? moment(filter.days.end).toDate() : null;

      this.state = {
        filter,
        setFilter,
        clearFilter,
        startDate,
        endDate,
        periodsList: [],
        showSellersModal: false,
        cleanBtn: {
          text: I18n.t('words.s.clear'),
          onPress: () => clearFilter()
        }
      };
  }

  UNSAFE_componentWillMount() {
    const periodsList = toList(Period);
    this.setState({ periodsList });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { filter } = this.chooseFilter(nextProps);
    this.setState({ filter });
  }

  chooseFilter(props) {
    const { accountFilter, accountFilterGeneral } = props;
    const { params = {} } = this.props.route;

    switch (params.origin) {
      case 'CustomerStatements':
        return {
          filter: accountFilterGeneral,
          setFilter: this.props.customersSetAccountGeneralFilter,
          clearFilter: this.props.customersClearAccountGeneralFilter
        };

      default:
        return {
          filter: accountFilter,
          setFilter: this.props.customersSetAccountFilter,
          clearFilter: this.props.customersClearAccountFilter
        };
    }
  }

  setStartDate(date) {
    const { days } = this.state.filter;
    this.state.setFilter({ ...days, start: date }, 'days');
    this.state.setFilter(null, 'period');
  }
  setEndDate(date) {
    const { days } = this.state.filter;
    this.state.setFilter({ ...days, end: date }, 'days');
    this.state.setFilter(null, 'period');
  }

  setPeriod(type, selected) {
    this.state.setFilter(selected, 'period');
    this.state.setFilter({}, 'days');
  }

  renderFilterRangePeriod() {
    const { days } = this.state.filter;

    return (
        <FilterRangePeriod
          startDate={days.start}
          endDate={days.end}
          setStartDate={this.setStartDate.bind(this)}
          setEndDate={this.setEndDate.bind(this)}
        />
    );
  }

  renderFilterShortcuts() {
    const { period } = this.state.filter;
    return (
      <FilterPeriod
        selectedPeriod={period}
        periods={this.state.periodsList}
        onPress={this.setPeriod.bind(this)}
      />
    );
  }

  renderContainerTitle(title) {
    return <KyteText pallete={'secondaryBg'} size={18} weight={'Medium'}>{title}</KyteText>;
  }

  renderFilterTransactionType() {
    const { transactionType } = this.state.filter;
    const options = [
      {
        label: Strings.TRANSACTION_TYPE_DEBIT,
        icon: 'arrow-out',
        iconColor: colors.errorColor,
        active: transactionType.debit,
        action: () => this.state.setFilter({ ...transactionType, debit: !transactionType.debit }, 'transactionType')
      },
      {
        label: Strings.TRANSACTION_TYPE_CREDIT,
        icon: 'arrow-in',
        iconColor: colors.actionColor,
        active: transactionType.credit,
        action: () => this.state.setFilter({ ...transactionType, credit: !transactionType.credit }, 'transactionType')
      },
    ];

    const renderOption = (op, i) => (
      <TouchableOpacity
        key={i}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: i ? 5 : 0 }}
        onPress={() => op.action()}
      >
        <View style={{ height: 30, width: 30, borderWidth: 3, borderColor: colors.borderlight, borderRadius: 3, alignItems: 'center', justifyContent: 'center' }}>
          {op.active ? <KyteIcon name='check' size={14} /> : null}
        </View>
        <KyteIcon name={op.icon} size={20} color={op.iconColor} style={{ marginHorizontal: 10 }} />
        <View style={{ flex: 1 }}>
          <KyteText pallete={'secondaryBg'} size={16}>{op.label}</KyteText>
        </View>
      </TouchableOpacity>
    );

    return (
      <View style={style.container}>
        {this.renderContainerTitle(Strings.TRANSACTION_TYPE_TITLE)}
        <View style={[style.containerContent, { flexDirection: 'row' }]}>
          {options.map((op, i) => renderOption(op, i))}
        </View>
      </View>
    );
  }

  toggleSeller({ name, uid, title }) {
    const { selectedSellers } = this.state.filter;
    let _selectedSellers = selectedSellers.concat([]); // just to create new object

    const checked = _.remove(_selectedSellers, s => s.uid === uid).length; // returns object removed
    if (!checked) _selectedSellers.push({ name: name || title, uid });

    this.state.setFilter(_selectedSellers, 'selectedSellers');
  }

  renderSalesModal() {
    const { multiUsers } = this.props;
    const { showSellersModal } = this.state;
    const { selectedSellers } = this.state.filter;

    const hideModal = () => this.setState({ showSellersModal: false });
    const renderCheckBox = (index, checked, user) => {
      return (
        <CheckBox
          key={index}
          containerStyle={style.checkStyles}
          checkedIcon={'check-box'}
          uncheckedIcon={'check-box-outline-blank'}
          iconType={'material'}
          onPress={() => this.toggleSeller({ name: user.displayName, uid: user.uid })}
          checkedColor={colors.actionColor}
          checked={!!checked}
          iconRight
        />
      );
    };

    let data = [];
    multiUsers.forEach((eachUser, i) => {
      if (eachUser.active) {
        const checked = !!selectedSellers.find(s => s.uid === eachUser.uid);
        data.push({
          title: eachUser.displayName,
          leftContent: eachUser.displayName,
          rightContent: true,
          rightContentStyle: { fontFamily: Type.Medium, color: colors.actionColor },
          customComponent: renderCheckBox(i, checked, eachUser),
          uid: eachUser.uid,
          hideChevron: true,
          active: true,
        });
      }
      return 1;
    });

    return (
      <KyteModal
        fullPage
        height={'100%'}
        title={Strings.SELLERS_TITLE}
        hideModal={() => hideModal()}
        isModalVisible={showSellersModal}
      >
        <KyteList data={data} onItemPress={this.toggleSeller.bind(this)} />
      </KyteModal>
    );
  }

  renderSellers() {
    const { selectedSellers } = this.state.filter;

    const renderSellersNames = () => selectedSellers.reduce((final, s, i) => final += i === selectedSellers.length - 1 ? s.name : `${s.name}, `, '');

    return (
      <View style={style.container}>
        {this.renderContainerTitle(Strings.SELLERS_TITLE)}
        <View style={style.containerContent}>
          <TouchableOpacity
            style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.lightGrey, paddingBottom: 8 }}
            onPress={() => this.setState({ showSellersModal: true })}
          >
            <KyteText pallete={'secondaryBg'} size={14}>{selectedSellers.length ? renderSellersNames() : Strings.SELLERS_PLACEHOLDER}</KyteText>
            <KyteIcon name='nav-arrow-down' size={12} style={{ marginRight: 5 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderBottomPage() {
    const { customer, aid } = this.props;
    const { period, days } = this.state.filter;
    const enable = period || (days.start && days.end);

    const action = () => {
      const { goBack } = this.props.navigation;
      const { params = {} } = this.props.route;

      switch (params.origin) {
        case 'CustomerStatements':
          this.props.customersFetchStatements(aid);
          break;

        default:
          this.props.customerAccountGetStatements(customer.id);
      }

      goBack();
    };

    return (
      <View style={{ marginBottom: 10, marginTop: 20 }}>
        <ActionButton
          onPress={() => action()}
          disabled={!enable}
          noDisabledAlert
        >
          {Strings.BUTTON_LABEL}
        </ActionButton>
      </View>
    );
  }

  render() {
    const { navigation } = this.props;
    const { showSellersModal, cleanBtn } = this.state;

    const renderDivision = () => (
      <View style={{ height: 20, backgroundColor: colors.borderlight }} />
    );

    return (
      <KyteSafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <KyteToolbar
          innerPage
          borderBottom={1}
          headerTitle={Strings.HEADER_TITLE}
          goBack={() => navigation.goBack()}
          rightText={cleanBtn}
          showCloseButton
        />
        <ScrollView>
          {this.renderFilterRangePeriod()}
          {this.renderFilterShortcuts()}
          {renderDivision()}
          {this.renderFilterTransactionType()}
          {renderDivision()}
          {this.renderSellers()}
          {this.renderBottomPage()}
        </ScrollView>
        {showSellersModal ? this.renderSalesModal() : null}
      </KyteSafeAreaView>
    );
  }
}

const style = {
  container: {
    padding: 25
  },
  containerContent: {
    marginTop: 20
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
  }
};

const mapStateToProps = ({ customers, auth }) => ({
  accountFilter: customers.accountFilter,
  accountFilterGeneral: customers.accountFilterGeneral,
  multiUsers: auth.multiUsers,
  customer: customers.detail,
  aid: auth.user.aid
});

export default connect(mapStateToProps, {
  customersSetAccountGeneralFilter,
  customersClearAccountGeneralFilter,
  customersSetAccountFilter,
  customersClearAccountFilter,
  customerAccountGetStatements,
  customersFetchStatements
})(CAF);
