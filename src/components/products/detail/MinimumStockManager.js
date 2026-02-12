import React, { Component } from 'react';
import { connect } from 'react-redux';
import { MaskService } from 'react-native-masked-text';
import _ from 'lodash';
import { View, Text, TouchableOpacity } from 'react-native';
import ItemListGrid from '../items/ItemListGrid';
import { productManagementSetValue } from '../../../stores/actions';
import { DetailPage, Calculator, ActionButton } from '../../common';
import { scaffolding, colors } from '../../../styles';
import I18n from '../../../i18n/i18n';
import { checkIsVariant } from '../../../util/products/util-variants';
import { variantManagementSetValue } from '../../../stores/variants/actions/product-variant.actions';

class MinimumStockManager extends Component {
  constructor(props) {
    super(props);
    const { productManaging } = this.props;
    const { minimumStock, isFractioned } = productManaging;
    const stockInitialValue = isFractioned ? '0.000' : 0;

    this.state = {
      rows: _.chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3),
      actualStock: minimumStock,
      stateStock: stockInitialValue,
      showCalculator: false,
      touched: false
    };
  }

  setminimumStock() {
    const { stateStock, touched } = this.state;
    const { fromBarcodeReader, callback, navigation } = this.props;
    if (touched) this.productManagementSetValue(stateStock || 0, 'minimumStock');
    if (fromBarcodeReader) {
      callback(); return;
    }
    navigation.goBack();
  }

  productManagementSetValue(...params) {
      const  { product } = this.props
      const setValue = checkIsVariant(product) ? this.props?.variantManagementSetValue : this.props?.productManagementSetValue

      return setValue(...params)
  }

  setActualStock(value) {
    this.setState({ actualStock: value });
  }

  openCalculator() {
    this.setState({ showCalculator: true });
  }

  touchedCalculator() {
    this.setState({ touched: true });
  }

  renderMinStockInfo() {
    const { product } = this.props;
    const { stockInfo, infoContainer, productContainer } = styles;
    const fakeValues = { name: I18n.t('productNamePlaceholder'), label: I18n.t('productLabelPlaceholder'), salePrice: 0 };
    const exampleProduct = product.id ? product : fakeValues;

    const p = {
      ...exampleProduct,
      virtualCurrentStock: 2,
      stock: { minimum: 5 },
      stockActive: true
    };

    const renderProductTip = () => (
      <ItemListGrid onPress={this.openCalculator.bind(this)} product={p} roundedBorders noAnimation />
    );

    return (
      <TouchableOpacity style={infoContainer} onPress={() => this.openCalculator()}>
        <Text style={stockInfo}>{I18n.t('stockMinimumManagerInfo')}</Text>
        <View style={productContainer}>
          {renderProductTip()}
        </View>
      </TouchableOpacity>
    );
  }

  renderCalculator() {
    const { productManaging } = this.props;
    const { stateStock } = this.state;

    return (
      <View style={{ flex: 1.3 }}>
        <Calculator
          state={this}
          stateProp={'stateStock'}
          valueType={productManaging.isFractioned ? 'decimal' : ''}
          stateValue={stateStock}
          onPressNumber={() => this.touchedCalculator()}
          valuePrecision={productManaging.isFractioned ? 3 : false}
          noConfirm
        />
      </View>
    );
  }

  render() {
    const { productManaging, currency, product, fromBarcodeReader, callback, navigation } = this.props;
    const { decimalSeparator, groupingSeparator } = currency;
    const { stateStock, showCalculator, actualStock, touched } = this.state;
    const { bottomContainer } = scaffolding;
    const { stockContainer, stockNumber, numberContainer } = styles;
    const stockInitialValue = productManaging.isFractioned ? '0.000' : 0;
    const firstManage = !product.stock && stateStock === stockInitialValue;

    const renderValue = (value) => {
      const formattedValue = MaskService.toMask(
        'money',
        Number(value),
        {
          unit: '',
          separator: decimalSeparator,
          delimiter: groupingSeparator,
          precision: 3
        }
      );

      return productManaging.isFractioned ? formattedValue : value;
    };

    return (
      <DetailPage
        goBack={fromBarcodeReader ? () => callback() : () => navigation.goBack()}
        pageTitle={I18n.t('stockMinimum')}
      >
        <View style={stockContainer}>
          <TouchableOpacity onPress={() => this.openCalculator()} style={numberContainer}>
            <Text style={stockNumber(colors.primaryColor)}>
              {renderValue(touched ? stateStock : actualStock) || 0}
            </Text>
          </TouchableOpacity>
        </View>
        {firstManage && !showCalculator ? this.renderMinStockInfo() : this.renderCalculator()}
        <View style={bottomContainer}>
          <ActionButton
            onPress={() => this.setminimumStock()}
            alertDescription={I18n.t('addAValue')}
            disabled={firstManage && !showCalculator}
          >
            OK
          </ActionButton>
        </View>
      </DetailPage>
    );
  }
}

const styles = {
  stockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  stockNumber: (color) => ({
    color,
    fontFamily: 'Graphik-Light',
    fontSize: 70
  }),
  numberContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.primaryColor
  },
  entryContainer: {
    flexDirection: 'row',
    marginTop: 20
  },
  entryStyle: (fontFamily) => ({
    fontFamily,
    fontSize: 16,
    color: colors.primaryColor
  }),
  infoContainer: {
    flex: 1.3,
    flexDirection: 'column',
    alignItems: 'center'
  },
  stockInfo: {
    alignSelf: 'flex-start',
    fontFamily: 'Graphik-Regular',
    color: colors.grayBlue,
    fontSize: 15,
    lineHeight: 28,
    paddingHorizontal: 15,
    marginBottom: 40,
    textAlign: 'center'
  },
  productContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
  },
  stockCircle: {
    position: 'absolute',
    zIndex: 50,
    top: -8,
    right: -8,
    backgroundColor: colors.warningColor,
    width: 25,
    height: 25,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: 'white'
  }
};

const mapStateToProps = ({ products, preference, variants }, ownProps) => {
  const product = ownProps?.route?.params?.product ?? products.detail
  const { productManaging }  = checkIsVariant(product) ? variants  : products

return {
  product,
  productManaging,
  currency: preference.account.currency
} 
};

export default connect(mapStateToProps, { productManagementSetValue, variantManagementSetValue })(MinimumStockManager);
