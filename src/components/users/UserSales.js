import React, { Component } from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { scaffolding, colors, Type } from '../../styles';
import {
  saleDetail,
  salesClear,
  salesSetFilter,
  ordersSetFilter,
  salesClearFilter,
  ordersClearFilter,
  salesResetGroup,
  saleFetchById as saleFetchByIdAction,
} from '../../stores/actions';
import I18n from '../../i18n/i18n';
import { TransactionEmptyIcon } from '../../../assets/images';
import KyteSales from '../sales/KyteSales';
import SalesTotalsBar from '../sales/auxiliary-components/SalesTotalsBar';
import KyteOrders from '../sales/KyteOrders';
import SalesSearchBar from '../sales/auxiliary-components/SalesSearchBar';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

class UserSales extends Component {
  constructor(props) {
    super(props);

    const { salesType, filterOrders, filterSales } = props;
    const filter = salesType === 'order' ? filterOrders : filterSales;

    this.state = {
      filter: { ...filter, search: '' },
    };
  }

  goToDetail(sale) {
    const { navigation, saleFetchByIdAction: saleFetchById } = this.props;
    const { navigate } = navigation;

    saleFetchById(sale.id, (fetchedSale) => {
      navigate({
        key: 'SaleDetailPage',
        name: 'SaleDetail',
        params: { sale: fetchedSale, keepReducer: true },
      });
    });
  }

  clearFilters() {
    const { salesType, user } = this.props;
    if (salesType === 'order') {
      this.props.ordersClearFilter();
      return this.props.ordersSetFilter([user], 'users');
    }
    this.props.salesClearFilter();
    this.props.salesSetFilter([user], 'users');
  }

  renderEmptyContent() {
    const { emptyContainer, svgImage } = styles;

    return (
      <View style={emptyContainer}>
        <Image style={svgImage} source={{ uri: TransactionEmptyIcon }} />
        <Text style={[Type.Regular, { color: colors.primaryColor, marginTop: 15 }]}>
          {I18n.t('salesEmpty')}
        </Text>
      </View>
    );
  }

  renderSalesList() {
    const { salesType, user } = this.props;
    const componentProps = {
      onItemPress: (item) => this.goToDetail(item.sale),
      emptyComponent: this.renderEmptyContent(),
      userId: user.uid,
    };
    return salesType === 'order' ? (
      <KyteOrders {...componentProps} />
    ) : (
      <KyteSales {...componentProps} />
    );
  }

  renderSearchBar() {
    const { salesGroups, ordersGroups, salesType } = this.props;
    const { search } = this.state.filter;

    const dataSource = salesType === 'order' ? ordersGroups : salesGroups;
    return (
      <SalesSearchBar
        salesType={salesType}
        disabled={this.showOrderHelper || (!dataSource.length && !search)}
      />
    );
  }

  render() {
    const { outerContainer } = scaffolding;
    const { salesType } = this.props;

    return (
      <View style={outerContainer}>
        {this.renderSearchBar()}
        {this.renderSalesList()}
        <SalesTotalsBar salesType={salesType} onPressClear={() => this.clearFilters()} />
      </View>
    );
  }
}

const styles = {
  emptyContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgImage: {
    resizeMode: 'contain',
    width: SMALL_SCREENS
      ? Dimensions.get('window').width * 0.3
      : Dimensions.get('window').width * 0.25,
    height: SMALL_SCREENS
      ? Dimensions.get('window').width * 0.3
      : Dimensions.get('window').height * 0.25,
  },
};

const mapStateToProps = ({ sales, auth }) => {
  return {
    salesGroups: sales.salesGroupsResult.list,
    ordersGroups: sales.ordersGroupsResult.list,
    salesTotal: sales.salesGroupsResult ? sales.salesGroupsResult.total : 0,
    ordersTotal: sales.ordersGroupsResult ? sales.ordersGroupsResult.total : 0,
    salesAmount: sales.salesGroupsResult ? sales.salesGroupsResult.amount : 0,
    ordersAmount: sales.ordersGroupsResult ? sales.ordersGroupsResult.amount : 0,
    filter: sales.filterSales,
    currentUser: auth.user,
  };
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      saleDetail,
      salesClear,
      salesSetFilter,
      ordersSetFilter,
      salesClearFilter,
      ordersClearFilter,
      salesResetGroup,
      saleFetchByIdAction,
    },
    dispatch,
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserSales);
