import React, { Component } from 'react';
import { View, Keyboard, TouchableOpacity, Text, Platform } from 'react-native';
import { connect } from 'react-redux';
import { KyteSwitch } from '@kyteapp/kyte-ui-components';
import { KyteToolbar, Input, ActionButton, CustomKeyboardAvoidingView, KyteSafeAreaView } from '../../common';
import { scaffolding, colors } from '../../../styles';
import { currentSaleAddDescription, productSaveByQuickSale } from '../../../stores/actions';
import { checkUserPermission, generateTestID } from '../../../util';
import I18n from '../../../i18n/i18n';

class ItemDescription extends Component {
 constructor(props) {
    super(props);
    const { description, saveFromQuickSale } = this.props;

    this.state = {
      itemDescription: description,
      switchStatus: saveFromQuickSale
    };
  }

  setDescription(description) {
    if (!description) this.props.productSaveByQuickSale(false);
    this.props.currentSaleAddDescription(description);
  }

  addDescription() {
    const { description } = this.props;
    const { goBack } = this.props.navigation;

    Keyboard.dismiss();
    this.props.currentSaleAddDescription(description);
    goBack();
  }

  createProductSwitch(value) {
    const { saveFromQuickSale } = this.props;
    this.props.productSaveByQuickSale(value || !saveFromQuickSale);
  }

  render() {
    const { outerContainer, bottomContainer } = scaffolding;
    const { inputContainer, switchContainer, switchText } = styles;
    const { description, user } = this.props;
    const { goBack } = this.props.navigation;

    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage
          borderBottom={1}
          headerTitle={I18n.t('descriptionPageTitle')}
          goBack={() => goBack()}
        />
        <CustomKeyboardAvoidingView style={{ flex: 1 }}>
          <View style={inputContainer}>
            <Input
              placeholder={I18n.t('descriptionPlaceholder')}
              placeholderColor={colors.fadePrimary}
              value={description}
              onChangeText={(text) => this.setDescription(text)}
              autoFocus
              style={Platform.select({ ios: { height: 32 } })}
              autoCorrect
              testProps={generateTestID('desc-adck')}
            />
          {
            checkUserPermission(user.permissions).allowProductsRegister ? (
              <TouchableOpacity disabled={!description} onPress={() => this.createProductSwitch()} activeOpacity={0.8}>
                <View style={switchContainer}>
                    <Text style={[switchText, { opacity: description ? 1 : 0.4 }]}>{I18n.t('descriptionCreateProduct')}</Text>
                    <KyteSwitch
                      onValueChange={(value) => this.createProductSwitch(value)}
                      active={this.props.saveFromQuickSale}
                      disabled={!description}
                    />
                </View>
              </TouchableOpacity>
            ) : null
          }
          </View>
          <View style={bottomContainer}>
            <ActionButton
              onPress={() => this.addDescription()}
              testProps={generateTestID('ok-adck')}
            >
              OK
            </ActionButton>
          </View>
        </CustomKeyboardAvoidingView>
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  inputContainer: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'center'
  },
  switchContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  switchText: {
    flex: 1,
    fontFamily: 'Graphik-Regular',
    fontSize: 16,
    color: colors.primaryBg
  },
};

const mapStateToProps = ({ currentSale, products, auth }) => {
  const { description } = currentSale;
  const { saveFromQuickSale } = products;
  const { user } = auth;
  return { description, saveFromQuickSale, user };
};

export default connect(mapStateToProps, { currentSaleAddDescription, productSaveByQuickSale })(ItemDescription);
