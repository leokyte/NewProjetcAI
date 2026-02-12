import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { CurrencyText, KyteIcon, KyteText } from '../../common';
import { colors, Type, colorSet } from '../../../styles';
import I18n from '../../../i18n/i18n';
import { checkSyncProductStock } from '../../../repository';
import { generateTestID } from '../../../util';
import { Container } from '@kyteapp/kyte-ui-components';
import { renderProductVariationsName } from '@kyteapp/kyte-utils';

class CartItem extends Component {
  state = {
    showActions: false,
    selected: '',
  }

  toggleActions(itemId) {
    this.props.doItemSelection(itemId);
  }

  checkSyncProductStock() {
    const { item } = this.props;
    return checkSyncProductStock(item);
  }

  checkVariantsAsyncProductStock() { 
    const { item } = this.props;
    const { stockActive, virtualCurrentStock } = item.product;
    const amountToConfirm = item?.product?.isFractioned ? item?.fraction : item?.amount

    if (virtualCurrentStock == null || !stockActive) return true
    
    return virtualCurrentStock > 0 && amountToConfirm <= virtualCurrentStock
  }

  renderQuantity() {
    const { item, decimalSeparator } = this.props;
    return item.product && item.product.isFractioned ? `${item.fraction.toFixed(3).replace('.', decimalSeparator)} ` : `${item.amount} `;
  }

  renderName() {
    const { item } = this.props;
    return item.product ? item.product.name : item.description || `(${I18n.t('words.s.noDescr')})`;
  }

  renderUnitPrice(oldValue, newValue) {
    const isDiff = oldValue !== newValue;
    return (
      <>
        {isDiff ? 
          <KyteText testProps={generateTestID('prod-price-ct')} >
            <CurrencyText style={[styles.unitPrice, styles.lineThrough]} value={oldValue} /> 
          </KyteText> : null
        }
        <KyteText testProps={generateTestID('unit-promo-ct')} >
          <CurrencyText style={styles.unitPrice} value={newValue} />
        </KyteText>
      </>
    );
  }

  renderActions() {
    const { item, decimalSeparator } = this.props;
    const { itemActions, actionContainer, actionTouch, middleBorder, iconStyle } = styles;
    const hasProduct = item.product;
    const isFractioned = hasProduct && item.product.isFractioned;
    const actionWidth = hasProduct ? '33.3%' : '50%';
    const hasDiscount = item.discount && item.discount.discountValue;
    const baseUnitValue = hasProduct ? hasProduct.unitValue : item.value;
    const unitValue = item.unitValue || baseUnitValue;
    const iconSize = 20;

    const actionItem = (action, icon, content, color, border, lines = 1) => {
      if (!action) return null;
      const disabled = action === 'disabled';
      return (
        <View style={[actionContainer(actionWidth, disabled ? 0.3 : 1), border ? middleBorder : null]}>
          <TouchableOpacity activeOpacity={0.8} style={actionTouch} onPress={!disabled ? action : null} {...generateTestID(`${icon}-ct`)}>
            <KyteIcon style={iconStyle} size={iconSize} name={icon} color={color} />
            <Text ellipsizeMode={'tail'} numberOfLines={lines} style={[Type.Medium, colorSet(color), { textAlign: 'center' }]}>
              {content}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <View style={itemActions}>
        {actionItem(
          this.props.goToQuantity,
          'box-stock',
          `${isFractioned ? item.fraction.toString().replace('.', decimalSeparator) : item.amount} ${item.amount > 1 ? I18n.t('words.p.item') : I18n.t('words.s.item')}`,
          colors.primaryColor)}
        {!item.product ? actionItem(
          this.props.goToDescription,
          'typografy',
          item.description || `(${I18n.t('words.s.noDescr')})`,
          colors.primaryColor,
          'border') : null}
        {actionItem(
          this.props.goToValue,
          'dollar-sign',
          <Text>
            <CurrencyText value={unitValue} />
            {'\n'}
            <Text style={[Type.Medium, Type.fontSize(12), colorSet(colors.grayBlue)]}>{I18n.t('words.s.unit')}</Text>
          </Text>,
          colors.primaryColor,
          'border', 2)}
        {actionItem(
          this.props.goToDiscount,
          'discount',
          hasDiscount ? <CurrencyText value={item.discount.discountValue} /> : I18n.t('words.s.discount').toUpperCase(),
          colors.errorColor,
          {...generateTestID('prod-disc-ct')})}
      </View>
    );
  }

  render() {
    const { item, isStockAllowed, selected } = this.props;
    const { cartItemContainer, itemContainer, productName, price, priceContainer, productNameContainer, stockInfo, subtitleContainer, quantityContainer } = styles;
    const fade = selected && selected !== item.itemId;
    const hasDiscount = item.discount && item.discount.discountValue;
    const hasProduct = item.product;
    const differentUnitValue = () => item.unitValue && item.unitValue !== item.product.unitValue;
    const isFractioned = () => item.product.isFractioned;
    const hasMoreThanOne = item.amount > 1;
    const itemValue = hasProduct ? item.product.unitValue : item.unitValue;
    const originalValue = hasProduct && item.product.originalUnitValue;
    const hasPromotionalValue = hasProduct && item.product.costValue !== item.product.unitValue;
    const hasVariation = item?.product?.variations && item?.product?.variations?.length > 0;

    const renderStockInfo = () => (
      <View>
        <Text ellipsizeMode={'tail'} numberOfLines={1} style={stockInfo}>{I18n.t('stockInsufficient')}</Text>
      </View>
    );

    const checkStock = hasVariation ? this.checkVariantsAsyncProductStock() : this.checkSyncProductStock();

    const stockOk = isStockAllowed ? checkStock : true;

    return (
      <TouchableOpacity onPress={() => this.toggleActions(item.itemId)} activeOpacity={0.8}>
        <View style={[cartItemContainer, this.props.style, fade ? { opacity: 0.4 } : null]}>
          <View style={itemContainer}>

              <View style={quantityContainer}>
                <Text {...generateTestID('qty-prod-ct')} style={[Type.Medium, colorSet(colors.secondaryBg), { fontSize: 16 }]}>{this.renderQuantity()}</Text>
                <Text style={[Type.Regular, colorSet(colors.grayBlue)]}>{'X '}</Text>
              </View>

              <View style={productNameContainer}>
                <View>
                  <Text {...generateTestID('prod-name-ct')} ellipsizeMode='tail' numberOfLines={1} style={productName}>{this.renderName()}</Text>
                </View>
                {hasVariation && (
                  <Container height={20} justifyContent='center'>
                    <KyteText color={colors.tipColor} size={12} weight={500} {...generateTestID('variation-name-ct')}>{renderProductVariationsName(item.product)}</KyteText>
                  </Container>
                )}
                
                <View style={subtitleContainer}>
                  {
                    hasMoreThanOne || (hasProduct && (differentUnitValue() || isFractioned() || hasPromotionalValue)) ?
                    this.renderUnitPrice(hasPromotionalValue ? originalValue : itemValue, item.unitValue)
                    : null
                  }
                </View>
                {!stockOk && isStockAllowed ? renderStockInfo() : null}
              </View>

              <View style={priceContainer}>
                {hasDiscount ? <KyteIcon size={14} name={'discount'} color={colors.errorColor} testProps={generateTestID('disc-tag-ct')} /> : null}
                <KyteText testProps={generateTestID('final-price-ct')} >
                  <CurrencyText style={price} value={item.value} />
                </KyteText>
              </View>
          </View>
          {selected === item.itemId ? this.renderActions() : null}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = {
  cartItemContainer: {
    flexDirection: 'column',
    borderColor: colors.borderColor,
    borderBottomWidth: 1,
    justifyContent: 'center'
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16
  },
  itemActions: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  actionContainer: (width, opacity = 1) => ({ width, opacity }),
  actionTouch: {
    paddingHorizontal: 10,
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderColor
  },
  middleBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.borderColor
  },
  iconStyle: { paddingBottom: 5 },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productName: {
    fontFamily: 'Graphik-Regular',
    color: colors.primaryDarker,
    fontSize: 15,
  },
  price: {
    fontFamily: 'Graphik-Medium',
    fontSize: 15,
    color: colors.secondaryBg,
    marginLeft: 10
  },
  unitPrice: {
    fontFamily: 'Graphik-Regular',
    fontSize: 12,
    color: colors.grayBlue,
    marginRight: 10
  },
  productNameContainer: {
    flex: 1,
    paddingHorizontal: 10
    // marginLeft: 5,
  },
  stockInfo: {
    fontFamily: 'Graphik-Regular',
    fontSize: 12,
    color: colors.errorColor,
  },
  subtitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  lineThrough: {
    textDecorationLine: 'line-through'
  }
};

const mapStateToProps = ({ preference }) => ({
  decimalSeparator: preference.account.currency.decimalSeparator
})

export default connect(mapStateToProps)(CartItem);
