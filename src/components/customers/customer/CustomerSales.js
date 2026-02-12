import React, { Component } from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { scaffolding, colors, Type } from '../../../styles';
import {
  saleDetail,
  salesSetFilter,
  ordersSetFilter,
  salesClearFilter,
  ordersClearFilter,
  saleFetchById as saleFetchByIdAction,
} from '../../../stores/actions';

import I18n from '../../../i18n/i18n';
import { TransactionEmptyIcon } from '../../../../assets/images';
import KyteSales from '../../sales/KyteSales';
import SalesTotalsBar from '../../sales/auxiliary-components/SalesTotalsBar';
import SalesSearchBar from '../../sales/auxiliary-components/SalesSearchBar';
import KyteOrders from '../../sales/KyteOrders';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

class CustomerSales extends Component {
  constructor(props) {
    super(props);
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
    const { salesType, customer } = this.props;
    if (salesType === 'order') {
      this.props.ordersClearFilter();
      return this.props.ordersSetFilter(customer.id, 'customer');
    }
    this.props.salesClearFilter();
    this.props.salesSetFilter(customer.id, 'customer');
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
    const { salesType, customer } = this.props;
    const componentProps = {
      onItemPress: (item) => this.goToDetail(item.sale),
      emptyComponent: this.renderEmptyContent(),
      customerId: customer.id,
    };
    return salesType === 'order' ? (
      <KyteOrders {...componentProps} />
    ) : (
      <KyteSales {...componentProps} />
    );
  }

  renderSearchBar() {
    const { salesGroups, ordersGroups, salesType } = this.props;
    const dataSource = salesType === 'order' ? ordersGroups : salesGroups;

    return <SalesSearchBar salesType={salesType} disabled={!dataSource.length} />;
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

const mapStateToProps = ({ sales }) => {
  return {
    salesGroups: sales.salesGroupsResult.list,
    ordersGroups: sales.ordersGroupsResult.list,
  };
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      saleDetail,
      salesSetFilter,
      ordersSetFilter,
      ordersClearFilter,
      salesClearFilter,
      saleFetchByIdAction,
    },
    dispatch,
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomerSales);
