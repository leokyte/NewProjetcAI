import React, { Component } from 'react';
import { View } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import NavigationService from '../../../services/kyte-navigation';
import I18n from '../../../i18n/i18n';
import { convertMoneyToDecimal, textSizeFill, generateTestID } from '../../../util';
import {
  KyteToolbar,
  Calculator,
  CurrencyText,
  TextCursor,
  TextButton,
  ActionButton,
  KyteIcon,
  KyteButton,
  KyteSafeAreaView,
} from '../../common';
import {
  currentSaleAddValue,
  currentSaleAddProduct,
  currentSaleAddDescription,
  checkUserReachedLimit,
  productSave,
  productsFetch,
  productSaveByQuickSale,
} from '../../../stores/actions';
import { colors, scaffolding } from '../../../styles';
import { logEvent } from '../../../integrations';

class QuickSaleContainer extends Component {
  state = {
    rows: _.chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3),
    saleValue: '0',
    showHelpInfo: true,
    sort: { key: 'dateCreation', isDesc: false },
    productColor: {
      foreground: colors.primaryBg,
      background: colors.secondaryBg,
    },
  };

  addToCart() {
    const { goBack } = this.props.navigation;
    const { saleValue, sort } = this.state;
    const { description, user, saveFromQuickSale, products, productCategory } = this.props;
    const { authVerified } = user;

    if (!authVerified && this.props.checkUserReachedLimit()) {
      NavigationService.navigate('Confirmation', 'SendCode', {
        origin: 'user-blocked',
        previousScreen: 'CurrentSale',
      });
      return;
    }

    if (saveFromQuickSale) {
      this.saveProduct();
      this.props.productsFetch(
        sort,
        null,
        productCategory.selected,
        { limit: products.length + 1, length: 0 },
        'reboot',
      );
      logEvent('Product Create', {
        where: 'quick-sale',
        hasVariants: false,
        variations: 0,
        variants: 0,
        options: 0,
      })
    } else {
      this.props.currentSaleAddValue(parseFloat(saleValue), description);
    }
    logEvent('Checkout Quick Sale Add', {
      created_product: saveFromQuickSale
    })
    this.props.currentSaleAddDescription('');
    this.props.productSaveByQuickSale(false);
    goBack();
  }

  saveProduct() {
    const { description, currency } = this.props;
    const { currencySymbol } = currency;
    const { saleValue } = this.state;
    const { foreground, background } = this.state.productColor;

    const label = description.toString().substring(0, 6);
    const product = {
      name: description,
      label,
      foreground,
      background,
      isFractioned: false,
      salePrice: convertMoneyToDecimal(saleValue, currencySymbol),
    };

    const addToCart = (savedProduct) => {
      const { id, isFractioned, salePrice, salePromotionalPrice, name, saleCostPrice } = savedProduct;
      const hasPromotionalPrice = Number.isFinite(salePromotionalPrice);

      this.props.currentSaleAddProduct(
        id,
        isFractioned,
        hasPromotionalPrice ? salePromotionalPrice : salePrice,
        name,
        1,
        1,
        saleCostPrice
      );
    };

    this.props.productSave(product, (savedProduct) => addToCart(savedProduct));
  }

  goToItemDescription() {
    const { navigate } = this.props.navigation;
    navigate({ key: 'ItemDescriptionPage', name: 'ItemDescription' });
  }

  renderCleanDescription() {
    const { removeStyles } = styles;
    return (
      <KyteButton
        width={40}
        height={40}
        onPress={() => this.props.currentSaleAddDescription('')}
        style={removeStyles}
        testProps={generateTestID('remo-desc-fsck')}
      >
        <KyteIcon name="close-navigation" size={12} color={colors.secondaryBg} />
      </KyteButton>
    );
  }

  render() {
    const { outerContainer, screenContainer, inputStyle, valueContainer, descriptionContainer } =
      styles;
    const { decimalCurrency } = this.props;
    const { bottomContainer } = scaffolding;
    const { goBack } = this.props.navigation;
    const { saleValue } = this.state;
    const { description } = this.props.currentSale;
    const emptyValue = saleValue === '0.00';

    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage
          borderBottom={1}
          headerTitle={I18n.t('calculatorHelper')}
          goBack={() => goBack()}
        />
        <View style={screenContainer}>
          <View style={valueContainer}>
            <View style={{ flexDirection: 'row' }} {...generateTestID('price-fsck')}>
              <CurrencyText
                currencySize={24}
                style={inputStyle(
                  saleValue.length,
                  !emptyValue ? colors.actionColor : colors.primaryColor,
                )}
                value={saleValue}
              />
              <TextCursor
                cursorStyle={{
                  fontSize: textSizeFill(saleValue.length),
                  lineHeight: textSizeFill(saleValue.length),
                  fontFamily: 'Graphik-Extralight',
                  color: colors.primaryColor,
                }}
              />
            </View>
            <View style={descriptionContainer}>
              <TextButton
                onPress={() => this.goToItemDescription()}
                testProps={generateTestID('add-desc-fsck')}
                color={colors.actionColor}
                title={description || I18n.t('addDescriptionButton')}
                size={18}
                style={{ textAlign: 'center', paddingLeft: description ? 40 : 0 }}
              />
              {description ? this.renderCleanDescription() : null}
            </View>
          </View>
        </View>
        <View style={{ flex: 1.3 }}>
          <Calculator
            state={this}
            stateProp="saleValue"
            stateValue={this.state.saleValue}
            noConfirm
            valueType={decimalCurrency ? 'decimal' : null}
          />
        </View>
        <View style={bottomContainer}>
          <ActionButton
            onPress={() => this.addToCart()}
            alertDescription={I18n.t('addAValue')}
            disabled={emptyValue}
            testProps={generateTestID('cart-btn-fsck')}
          >
            {I18n.t('sendToCart')}
          </ActionButton>
        </View>
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  inputStyle: (length, color) => ({
    fontSize: textSizeFill(length),
    lineHeight: textSizeFill(length),
    fontFamily: 'Graphik-Light',
    paddingVertical: 10,
    color,
  }),
  outerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'column',
    backgroundColor: '#FFF',
  },
  numbersContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightBg,
    paddingHorizontal: 15,
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    flexDirection: 'row',
    paddingBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeStyles: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    top: 1,
  },
};

const mapStateToProps = ({ currentSale, auth, preference, products, productCategory }) => ({
  currentSale,
  user: auth.user,
  currency: preference.account,
  decimalCurrency: preference.account.decimalCurrency,
  description: currentSale.description,
  saveFromQuickSale: products.saveFromQuickSale,
  products: products.list,
  productCategory,
});

export default connect(mapStateToProps, {
  currentSaleAddValue,
  currentSaleAddProduct,
  currentSaleAddDescription,
  checkUserReachedLimit,
  productSave,
  productsFetch,
  productSaveByQuickSale,
})(QuickSaleContainer);
