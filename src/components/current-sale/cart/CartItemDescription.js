import React, { Component } from 'react';
import { View, Text, Keyboard, Switch } from 'react-native';
import { connect } from 'react-redux';
import { ActionButton, KyteToolbar, Input, TextButton, SwitchContainer, KyteSafeAreaView, CustomKeyboardAvoidingView } from '../../common';
import { colors, scaffolding, formStyle } from '../../../styles';
import { currentSaleRemoveValue, currentSaleUpdateItem, productSave } from '../../../stores/actions';
import I18n from '../../../i18n/i18n';
import { convertMoneyToDecimal, checkUserPermission, generateTestID } from '../../../util';
import { KyteSwitch } from '@kyteapp/kyte-ui-components';

class CartItemDescription extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    const { params = {} } = this.props.route;
    const { item } = params;
    this.state = {
      item,
      itemId: item.itemId,
      itemDescription: item.description,
      createProduct: false,
      shrinkContent: false,
      productColor: {
        foreground: colors.primaryBg,
        background: colors.secondaryBg
      }
    };
  }

  UNSAFE_componentWillMount() {
    this.KeyboardShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow.bind(this)
    );
    this.KeyboardHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide.bind(this)
    );
  }

  componentWillUnmount() {
    this.KeyboardShowListener.remove();
    this.KeyboardHideListener.remove();
  }

  keyboardDidShow() {
   this.setState({ shrinkContent: true });
  }

  keyboardDidHide() {
   this.setState({ shrinkContent: false });
  }

  toggleSwitch(value) {
    const { createProduct } = this.state;

    this.setState({ createProduct: value || !createProduct });
  }

  removeProduct() {
    const { goBack } = this.props.navigation;
    this.props.currentSaleRemoveValue(this.state.itemId);
    goBack();
  }

  updateItem(p = {}) {
    const { params = {} } = this.props.route;
    const { doItemSelection } = params;
    const { item, itemDescription } = this.state;
    if (p.id) {
      this.props.currentSaleRemoveValue(item.itemId);
      doItemSelection('');
    }

    const product = {
      prodId: p.id,
      name: p.name,
      isFractioned: p.isFractioned,
      unitValue: p.salePrice,
      costValue: p.salePrice,
      stockActive: p.stockActive
    };

    const updatedItem = {
      ...item,
      itemId: p.id || item.itemId,
      product: Object.keys(p).length ? product : null, // check if productSave!
      description: !p.id ? itemDescription : ''
    };
    this.props.currentSaleUpdateItem(updatedItem);
    this.props.navigation.goBack();
  }

  saveProduct() {
    const { itemDescription, productColor, item } = this.state;
    const { currencySymbol } = this.props.currency;
    const { foreground, background } = productColor;

    const label = itemDescription.toString().substring(0, 6);
    const product = {
      name: itemDescription,
      label,
      foreground,
      background,
      isFractioned: false,
      salePrice: convertMoneyToDecimal(item.unitValue, currencySymbol),
    };

    this.props.productSave(product, (productSaved) => this.updateItem(productSaved));
  }

  renderRemoveButton() {
    const { pageVerticalItem } = scaffolding;
    return (
      <View style={pageVerticalItem}>
        <TextButton
          onPress={() => this.removeProduct()}
          title={I18n.t('cartItemRemoveButton')}
          color={colors.errorColor}
          size={14}
          style={{ textAlign: 'center' }}
        />
      </View>
    );
  }

  renderBottom() {
    const { bottomContainer } = scaffolding;
    const { createProduct } = this.state;
    return (
      <View style={bottomContainer}>
        <ActionButton
          onPress={createProduct ? () => this.saveProduct() : () => this.updateItem()}
          testProps={generateTestID('save-btn-fss')}
        >
          {I18n.t('cartItemSaveButton')}
        </ActionButton>
      </View>
    );
  }

  render() {
    const {
      outerContainer,
      pageVertical,
      pageVerticalItem,
      verticalItemTitle } = scaffolding;
    const { inputMd } = formStyle;
    const { inputDescription, innerContainer } = styles;
    const { goBack } = this.props.navigation;
    const { createProduct } = this.state;
    const { user } = this.props;

    return (
      <KyteSafeAreaView style={outerContainer}>
        <CustomKeyboardAvoidingView style={{ flex: 1 }}>
          <KyteToolbar
            innerPage
            borderBottom={1}
            headerTitle={this.state.itemDescription || `${I18n.t('productLabelPlaceholder')}`}
            goBack={() => goBack()}
          />
          <View style={[pageVertical, innerContainer]}>
            <View style={pageVerticalItem}>
              <Text style={verticalItemTitle}>{I18n.t('productLabelPlaceholder')}</Text>
              <Input
                autoFocus
                style={[inputMd, inputDescription]}
                placeholder={I18n.t('cartItemDescriptionPlaceholder')}
                value={this.state.itemDescription}
                onChangeText={(text) => this.setState({ itemDescription: text })}
                hideLabel
                autoCorrect
                height={60}
                testProps={generateTestID('input-fss')}
              />
            </View>
          </View>
          <View style={pageVerticalItem}>
            {checkUserPermission(user.permissions).allowProductsRegister ? (
              <SwitchContainer
                title={I18n.t('descriptionCreateProduct')}
                onPress={() => this.toggleSwitch()}
                testProps={generateTestID('create-new-prdct-fss')}>
                <KyteSwitch
                  onValueChange={(value) => this.toggleSwitch(value)}
                  active={createProduct}
                />
              </SwitchContainer>
            ) : null}
          </View>
          {this.renderBottom()}
        </CustomKeyboardAvoidingView>
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  innerContainer: {
    paddingVertical: 20
  },
  inputDescription: {
    width: '80%',
    alignSelf: 'center'
  },
  inputValue: {
    width: '50%',
    alignSelf: 'center'
  }
};

const mapStateToProps = ({ preference, auth }) => ({
    currency: preference.account.currency,
    user: auth.user,
});

export default connect(mapStateToProps, { currentSaleRemoveValue, currentSaleUpdateItem, productSave })(CartItemDescription);
