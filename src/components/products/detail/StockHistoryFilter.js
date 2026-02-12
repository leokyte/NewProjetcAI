import React, { Component } from 'react';
import moment from 'moment/min/moment-with-locales';
import { connect } from 'react-redux';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { DetailPage, FilterRangePeriod, ActionButton } from '../../common';
import { productStockHistorySetFilter, productFilterStockHistory } from '../../../stores/actions';
import { scaffolding, colors, formStyle, Type } from '../../../styles';
import { StockHistoryType, toList } from '../../../enums';
import I18n from '../../../i18n/i18n';

class StockHistoryFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasDateFilterActive: false,
    };
  }

  UNSAFE_componentWillMount() {
    const { multiUsers, stockHistoryFilter } = this.props;
    const { historicalTypes, users } = stockHistoryFilter;
    const getUSers = multiUsers.map((user) => ({ title: user.displayName, uid: user.uid, active: false }));

    if (!historicalTypes.length) this.props.productStockHistorySetFilter(toList(StockHistoryType), 'historicalTypes');
    if (!users.length) this.props.productStockHistorySetFilter(getUSers, 'users');
  }

  setStartDate(date) {
    this.setState({
      hasDateFilterActive: true,
    });

    this.props.productStockHistorySetFilter(date, 'startDate');
  }

  setEndDate(date) {
    this.setState({
      hasDateFilterActive: true,
    });

    this.props.productStockHistorySetFilter(date, 'endDate');
  }

  selectStockType(index) {
    const { historicalTypes } = this.props.stockHistoryFilter;

    const setType = () => historicalTypes.map((item, i) => {
      if (i === index) return { ...item, active: !item.active };
      return item;
    });

    this.props.productStockHistorySetFilter(setType(), 'historicalTypes');
  }

  selectUser(index) {
    const { users } = this.props.stockHistoryFilter;

    const setType = () => users.map((item, i) => {
      if (i === index) return { ...item, active: !item.active };
      return item;
    });

    this.props.productStockHistorySetFilter(setType(), 'users');
  }

  clearFilters() {
    const { navigation, product } = this.props;
    const { historicalTypes, users } = this.props.stockHistoryFilter;

    this.setState({
      hasDateFilterActive: false,
    });

    this.props.productStockHistorySetFilter(null, 'startDate');
    this.props.productStockHistorySetFilter(null, 'endDate');
    this.props.productStockHistorySetFilter(historicalTypes.map((i) => ({ ...i, active: false })), 'historicalTypes');
    this.props.productStockHistorySetFilter(users.map((i) => ({ ...i, active: false })), 'users');

    this.props.productFilterStockHistory(product.id, null).then(() => {
      navigation.state.params?.checkIfFilterEnabled?.(this.checkFiltersAtive());
      navigation.goBack();
    });
  }

  checkFiltersAtive() {
    const findTrue = (array) => {
      for (let i = 0; i < array.length; i++) {
        if (array[i].active) return true;
      }
      return;
    };

    const { users, historicalTypes } = this.props.stockHistoryFilter;
    return findTrue(users) || findTrue(historicalTypes) || !!this.state.hasDateFilterActive;
  }

  filterSubmit() {
    const { stockHistoryFilter, navigation, product, route } = this.props;
    const { startDate, endDate, users, historicalTypes } = stockHistoryFilter;
    const activeUsers = users.filter(user => user.active);
    const activeTypes = historicalTypes.filter(type => type.active);

    const uids = activeUsers.map((user) => user.uid);
    const reasons = activeTypes.map((reason) => reason.type);

    const period = {
      init: startDate ? moment(startDate).format('YYYYMMDD') : '',
      end: endDate ? moment(endDate).format('YYYYMMDD') : '',
    };
    const checkLists = { uids, reasons };
    const filter = { ...checkLists, period: startDate || endDate ? period : null };

    this.props.productFilterStockHistory(product.id, filter).then(() => {
      route?.params?.checkIfFilterEnabled?.(this.checkFiltersAtive());
      navigation.goBack();
    });
  }

  checkItem(item, i, method) {
    return (
      <View key={i} style={formStyle.checkListItem}>
        <CheckBox
          containerStyle={formStyle.checkStyles}
          checkedIcon={'check-box'}
          uncheckedIcon={'check-box-outline-blank'}
          iconType={'material'}
          onPress={() => method(i)}
          checkedColor={colors.actionColor}
          checked={item.active}
          title={item.title}
          textStyle={[formStyle.checkboxText, { width: '70%' }]}
        />
      </View>
    );
  }

  listTypes() {
    const { historicalTypes } = this.props.stockHistoryFilter;

    return historicalTypes.map((item, i) => this.checkItem(item, i, this.selectStockType.bind(this)));
  }

  listUsers() {
    const { users } = this.props.stockHistoryFilter;

    return users.map((item, i) => this.checkItem(item, i, this.selectUser.bind(this)));
  }

  renderClearFilters(resetFunction) {
    return (
      <TouchableOpacity onPress={() => resetFunction()} activeOpacity={0.8}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 10
          }}
        >
          <Text style={[Type.regular, { color: colors.actionColor }]}>{I18n.t('salesPeriodClearButton')}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  //{this.checkFiltersAtive() ? this.renderClearFilters() : null}

  render() {
    const { goBack } = this.props.navigation;
    const { startDate, endDate } = this.props.stockHistoryFilter;

    const rightText = {
      text: I18n.t('words.s.clear'),
      onPress: () => this.clearFilters(),
    };

    return (
      <DetailPage goBack={goBack} pageTitle={I18n.t('stockFilterTitle')} rightText={rightText}>
        <ScrollView style={{ flex: 1 }}>
          <FilterRangePeriod
            startDate={startDate}
            endDate={endDate}
            setStartDate={this.setStartDate.bind(this)}
            setEndDate={this.setEndDate.bind(this)}
          />
          <View style={formStyle.checkList}>
            <Text style={formStyle.checkListTitle}>{I18n.t('stockHistoricalFilterCheckListTitleType')}</Text>
            <View style={formStyle.checkLisContent}>
              {this.listTypes()}
            </View>
          </View>
          <View style={formStyle.checkList}>
            <Text style={formStyle.checkListTitle}>{I18n.t('stockHistoricalFilterCheckListTitleSellers')}</Text>
            <View style={formStyle.checkLisContent}>
              {this.listUsers()}
            </View>
          </View>
        </ScrollView>
        <View style={scaffolding.bottomContainer}>
          <ActionButton
            onPress={() => this.filterSubmit()}
          >
            {I18n.t('stockHistoricalFilterButton')}
          </ActionButton>
        </View>
      </DetailPage>
    );
  }
}

const mapStateToProps = ({ auth, products }, ownProps) => ({
  multiUsers: auth.multiUsers,
  stockHistoryFilter: products.stockHistoryFilter,
  product: ownProps?.route?.params?.product ?? products.detail,
});

export default connect(mapStateToProps, { productStockHistorySetFilter, productFilterStockHistory })(StockHistoryFilter);
