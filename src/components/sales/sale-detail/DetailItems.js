import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { map } from 'lodash';

import { renderProductVariationsName } from '@kyteapp/kyte-utils';
import { CurrencyText } from '../../common';
import I18n from '../../../i18n/i18n';
import { Type, colors, colorSet } from '../../../styles';
import { DetailOrigin } from '../../../enums';
import ProductQuickView from '../../products/quick-view/ProductQuickView';
import { fetchOneByID, PRODUCT } from '../../../repository';

export default class DetailItems extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
      selectedProduct: null,
      isQuickViewVisible: false,
    };
  }

  amountValue(item) {
    if (item.product) {
      return item.product.isFractioned ? item.fraction.toFixed(3) : item.amount;
    }
    return item.amount;
  }

  itemCode(product) {
    const { codeStyle } = styles;
    const codeLabel = I18n.t('productCodeLabel').substring(0, 3).toUpperCase();
    return (
      <Text style={codeStyle}>
        {codeLabel}: {product.code}
      </Text>
    );
  }

  grossValue(item) {
    return (
      <Text>
        <CurrencyText
          style={[Type.Regular, colorSet(colors.grayBlue), { textDecorationLine: 'line-through' }]}
          value={item.grossValue}
        />
        {item?.discount?.discountPercent > 0 && (
					<Text style={[Type.Regular, colorSet(colors.errorColor)]}>{` (-${item.discount.discountPercent}%)`}</Text>
				)}
      </Text>
    );
  }

  renderSaleItems() {
    const { saleItem, itemValueContainer, itemAmountContainer, itemNameContainer, itemName } =
      styles;
    const { sale, onPress } = this.props;

    return map(sale.items, (item, i) => {
      const hasVariations = item?.product?.variations?.length > 0;
      const product = () => {
        if (item.product) {
          const realmProduct = fetchOneByID(PRODUCT, item.product.prodId);
          return realmProduct?.clone?.() || realmProduct;
        }
        return { name: item.description };
      };
      
      const viewProduct = () => {
        const productToSet = hasVariations ? JSON.parse(JSON.stringify(item.product)) : product()
        this.setState({
          isQuickViewVisible: true,
          selectedProduct: { ...productToSet, salePrice: item.product.originalUnitValue },
        });
      }
    
      return (
        <TouchableOpacity
          style={saleItem}
          key={i}
          onPress={onPress || viewProduct}
          activeOpacity={0.8}
        >
          <View style={itemAmountContainer}>
            <Text style={[Type.Regular, Type.fontSize(18), colorSet(colors.secondaryBg)]}>
              {this.amountValue(item)}{' '}
            </Text>
            <Text style={[Type.Regular, Type.fontSize(18), colorSet(colors.lightenerColor)]}>
              X
            </Text>
          </View>
          <View style={itemNameContainer}>
            <Text style={[itemName, Type.SemiBold]}>
              {item.product ? item.product.name : item.description || I18n.t('words.s.noDescr')}
            </Text>
            {hasVariations && (
              <Text style={[Type.Regular, Type.fontSize(12), colorSet(colors.tipColor)]}>
                {renderProductVariationsName(item.product)}
              </Text>
            )}
            {item.product && item.product.code ? this.itemCode(item.product) : null}
          </View>
          <View style={itemValueContainer}>
            <CurrencyText style={[Type.Regular, colorSet(colors.primaryBg)]} value={item.value} />
            {item.grossValue && item.grossValue !== item.value ? this.grossValue(item) : null}
          </View>
        </TouchableOpacity>
      );
    });
  }

  renderQuickView() {
    const { selectedProduct } = this.state;

    return (
      <ProductQuickView
        isQuickViewVisible
        hideQuickView={() => this.setState({ isQuickViewVisible: false })}
        product={selectedProduct}
        navigation={this.props.navigation}
        origin={DetailOrigin.BY_SALE}
        disableButtons
      />
    );
  }

  render() {
    const { outerContainer } = styles;
    const { isQuickViewVisible } = this.state;

    return (
      <ScrollView style={outerContainer}>
        {this.renderSaleItems()}
        {isQuickViewVisible ? this.renderQuickView() : null}
      </ScrollView>
    );
  }
}

const styles = {
  outerContainer: {
    flex: 1,
  },
  saleItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 60,
    paddingVertical: 4,
  },
  itemNameContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 15,
  },
  itemAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemValueContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  itemName: [Type.Medium, { color: colors.primaryColor, paddingVertical: 5 }],
  codeStyle: [Type.Regular, Type.fontSize(11), colorSet(colors.grayBlue)],
};
