import React, { Component } from 'react';
import { View, Text, Platform } from 'react-native';
import { connect } from 'react-redux';
import { KyteToolbar, Calculator, TextButton, TextCursor, CurrencyText, KyteSafeAreaView, KyteText } from '../../common';
import { scaffolding, colors, colorSet, Type } from '../../../styles';
import { currentSaleRemoveValue, currentSaleUpdateItem, getCurrentSaleTotalItems } from '../../../stores/actions';
import I18n from '../../../i18n/i18n';
import { generateTestID } from '../../../util';
import { logEvent } from '../../../integrations';

class CartItemUpdate extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    const { params = {} } = this.props.route;
    const { item } = params;
    const hasProduct = item.product;
    const baseUnitValue = hasProduct ? hasProduct.unitValue : item.value;

    this.state = {
      item,
      itemId: item.itemId,
      initialQuantity: item.amount,
      initialFraction: item.fraction,
      initialUnitvalue: item.unitValue || baseUnitValue,
      quantity: '',
      fraction: '',
      unitValue: ''
    };
  }

  updateProduct() {
		const { item, quantity, fraction, unitValue, initialQuantity, initialFraction } = this.state

		this.props.currentSaleUpdateItem({
			...item,
			amount: parseInt(quantity) || item.amount,
			fraction: parseFloat(fraction) || item.fraction,
			unitValue: parseFloat(unitValue) || item.unitValue,
    })

		if (initialQuantity < quantity || initialFraction < fraction) {
			logEvent('Checkout Product Add', { quantity: this.props.getCurrentSaleTotalItems(), where: 'cart', isFractioned: item?.product?.isFractioned, isVariant: item?.product?.variations?.length > 0 })
		}

		this.props.navigation.goBack()
	}

  removeProduct() {
    const { params = {} } = this.props.route;
    const { doItemSelection } = params;
    this.props.currentSaleRemoveValue(this.state.itemId);
    doItemSelection('');
    this.props.navigation.goBack();
  }

  renderQuantityValue(item) {
    const { decimalSeparator } = this.props;
    const isFractioned = item.product && item.product.isFractioned;
    const { initialQuantity, quantity, initialFraction, fraction } = this.state;
    const quantityContent = quantity || initialQuantity;
    const fractionContent = (fraction || initialFraction.toFixed(3)).replace('.', decimalSeparator);
    const calculatorValue = isFractioned ? fractionContent : quantityContent;

    return (
      <Text
        style={[
          Type.Light,
          Type.fontSize(32),
          colorSet(colors.primaryColor)
        ]}
        {...generateTestID('prod-qty-uis')}
      >
        {(calculatorValue) ? calculatorValue.toString().substring(0, 7) : calculatorValue}
      </Text>
    );
  }

  renderUnitValue() {
    const { unitValue, initialUnitvalue } = this.state;
    const unitContent = unitValue || initialUnitvalue;

    return (
      <KyteText {...generateTestID('unit-prc-uis')}>
        <CurrencyText
          style={[Type.Light, Type.fontSize(32), colorSet(colors.primaryColor)]}
          value={Number(unitContent)}
        />
      </KyteText>
    );
  }

  renderRemoveProduct() {
    return (
      <TextButton
        onPress={() => this.removeProduct()}
        title={I18n.t('cartItemRemoveButton')}
        color={colors.errorColor}
        size={14}
        testProps={generateTestID('rmv-prod-uis')}
      />
    );
  }

  renderUnitValueInfo() {
    const { infoContainer, infoText } = styles;
    return (
      <View style={infoContainer}>
        <Text
          style={[
            infoText,
            Type.Regular,
            colorSet(colors.primaryGrey),
            Type.fontSize(13)]}
          {...generateTestID('info-prc-uis')}
        >
        {I18n.t('cartItemUpdateInfo')}
        </Text>
      </View>
    );
  }

  render() {
    const { outerContainer } = scaffolding;
    const { topContainer, valueContainer } = styles;
    const { decimalCurrency } = this.props;
    const { goBack } = this.props.navigation;
    const { params = {} } = this.props.route;
    const { item, updateUnitValue } = params;
    const hasProduct = item.product;
    const isFractioned = hasProduct && item.product.isFractioned;

    const limitQuantity = (value) => {
      return value ? value.toString().substring(0, 7) : '';
    };

    const quantityProp = isFractioned ? 'fraction' : 'quantity';
    const quantityState = limitQuantity(isFractioned ? this.state.fraction : this.state.quantity);

    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage
          borderBottom={1}
          headerTitle={hasProduct ? item.product.name : item.description || I18n.t('words.s.noDescr')}
          goBack={() => goBack()}
        />
        <View style={topContainer}>
          <Text
            style={[
              Type.Medium,
              colorSet(colors.primaryColor),
              Type.fontSize(15)]}
          >
              {updateUnitValue ? I18n.t('cartItemUpdatePlaceholder') : `${I18n.t('cartItemQuantityLabel')}:`}
          </Text>
          <View style={valueContainer}>
            {updateUnitValue ? this.renderUnitValue() : this.renderQuantityValue(item)}
            <TextCursor
              cursorStyle={[
                Type.Light,
                Type.fontSize(32),
                colorSet(colors.primaryColor),
                { lineHeight: 30 }
              ]}
            />
          </View>
          {updateUnitValue ? this.renderUnitValueInfo() : this.renderRemoveProduct()}
        </View>
        <View style={{ flex: 1.5 }}>
          <Calculator
            state={this}
            stateProp={updateUnitValue ? 'unitValue' : quantityProp}
            stateValue={updateUnitValue ? this.state.unitValue : quantityState}
            onPressConfirm={() => this.updateProduct()}
            confirmIcon='check'
            valueType={isFractioned || updateUnitValue ? 'decimal' : null}
            valuePrecision={updateUnitValue ? (decimalCurrency ? 2 : 0) : 3}
          />
        </View>
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  valueContainer: {
    width: '70%',
    height: 50,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    borderBottomWidth: 2,
    borderColor: colors.actionColor,
    ...Platform.select({
      ios: {
        height: 35,
      }
    }),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  infoContainer: {
    alignSelf: 'center',
    width: '60%'
  },
  infoText: {
    textAlign: 'center',
    lineHeight: 20
  }
};

const mapStateToProps = ({ preference }) => ({
  decimalCurrency: preference.account.decimalCurrency,
  decimalSeparator: preference.account.currency.decimalSeparator
});

export default connect(mapStateToProps, { currentSaleRemoveValue, currentSaleUpdateItem, getCurrentSaleTotalItems })(CartItemUpdate);
