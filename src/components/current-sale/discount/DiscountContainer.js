import React, { Component } from 'react';
import { View, Text, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { TextInputMask } from 'react-native-masked-text';
import { currentSaleDiscount, currentSaleSet } from '../../../stores/actions';
import { CurrentSaleDiscountType } from '../../../enums';
import { colors, scaffolding, formStyle } from '../../../styles';
import {
  CurrencyText,
  DetailPage,
  CustomKeyboardAvoidingView,
  KyteIcon,
  TextButton,
  ActionButton } from '../../common';
import I18n from '../../../i18n/i18n';
import { currencyFormat, generateTestID } from '../../../util';

class DiscountContainer extends Component {
  static navigationOptions = () => ({
    header: null,
  })

  constructor(props) {
    super(props);
    const { params } = props.route;

    this.discountPercentViewRef = React.createRef();
    this.discountViewRef = React.createRef();

    this.state = {
      shrinkContent: false,
      previousCartState: params.previousCartState
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

  calculatePercentage() {
    const discountPercentInput = this.discountPercentViewRef.current;
    const rawValue = discountPercentInput ? discountPercentInput.getRawValue() : undefined;
    this.props.currentSaleDiscount(rawValue, CurrentSaleDiscountType.Percent);
  }
  calculateValue() {
    const discountValueInput = this.discountViewRef.current;
    const rawValue = discountValueInput ? discountValueInput.getRawValue() : undefined;
    this.props.currentSaleDiscount(rawValue, CurrentSaleDiscountType.ByValue);
  }

  addDiscount() {
    const { goBack } = this.props.navigation;
    goBack();
    Keyboard.dismiss();
  }

  removeDiscount() {
    const { goBack } = this.props.navigation;

    this.props.currentSaleDiscount(0, null);
    goBack();
  }

  backAction() {
    const { goBack } = this.props.navigation;
    const { previousCartState } = this.state;

    this.props.currentSaleSet(previousCartState);
    goBack();
  }

  renderRemoveDiscount() {
    return (
      <TextButton
        onPress={() => this.removeDiscount()}
        title={I18n.t('discountRemoveButton')}
        color={colors.actionColor}
        size={14}
        style={{ textAlign: 'center', marginTop: 5 }}
      />
    );
  }

  renderTotal() {
    const { totalContainer, totalStyle, totalLabelStyle, whiteBg } = styles;
    const { totalNet, totalGross, discountType } = this.props;

    return (
      <View style={[totalContainer, whiteBg]}>
        <Text style={totalLabelStyle(discountType ? colors.primaryColor : colors.lightColor)}>
          {!discountType ? `${I18n.t('discountFinalTotalLabel')}:` : `${I18n.t('discountTotalLabel')}:`}
        </Text>
        <CurrencyText
          style={totalStyle(discountType ? colors.primaryColor : colors.lightColor)}
          value={totalNet}
          testProps={generateTestID('final-prc-idsc')}
        />
        {discountType ?
        <CurrencyText
          style={[totalLabelStyle(colors.grayBlue), { textDecorationLine: 'line-through' }]}
          value={totalGross}
          testProps={generateTestID('origin-prc-idsc')}
        /> : null}
      </View>
    );
  }

  renderCheckIcon() {
    const { checkIcon } = styles;
    return (
      <KyteIcon
        style={checkIcon}
        name='check'
        color={colors.actionColor}
        size={16}
      />
    );
  }

  render() {
    const { inputWidth, verticalSpace, contentContainer, whiteBg, inputBottomBorder } = styles;
    const {
      bottomContainer,
      pageVertical,
      pageVerticalItem,
      verticalItemTitle,
      inputContainer } = scaffolding;
    const { inputMd } = formStyle;

    const { totalGross, discountPercent, discountValue, discountType, currency, decimalCurrency } = this.props;
    const { currencySymbol, groupingSeparator, decimalSeparator } = currency;
    const { shrinkContent } = this.state;
    const clearBtn = { text: I18n.t('words.s.clear'), onPress: () => this.removeDiscount() };

    const convertedTotalGross = currencyFormat(totalGross, currency, decimalCurrency);

    let formattedDiscountValue = '';
    if (discountValue > 0 && decimalCurrency) formattedDiscountValue = discountValue.toFixed(2);
    else if (discountValue > 0 && !decimalCurrency) formattedDiscountValue = discountValue;

    return (
      <DetailPage
        pageTitle={`${I18n.t('discountPageTitle')} ${convertedTotalGross}`}
        goBack={this.backAction.bind(this)}
        rightText={clearBtn}
        showCloseButton={shrinkContent}
      >
        <CustomKeyboardAvoidingView style={contentContainer}>
          <View style={[pageVertical, verticalSpace(shrinkContent ? 10 : 25)]}>
            <View style={pageVerticalItem}>
              <Text style={verticalItemTitle}>{I18n.t('discountMoneyLabel')}</Text>
              <View style={inputContainer}>
                <TextInputMask
                  style={[inputMd, inputWidth, inputBottomBorder(discountType === 'by-value' ? colors.actionColor : colors.inputBorderColor)]}
                  placeholderTextColor={colors.primaryColor}
                  value={formattedDiscountValue}
                  placeholder={I18n.t('discountMoneyPlaceholder')}
                  keyboardType='numeric'
                  type='money'
                  ref={this.discountViewRef}
                  onChangeText={(v) => this.calculateValue(v)}
                  options={{
                    unit: `${currencySymbol} `,
                    separator: decimalSeparator,
                    delimiter: groupingSeparator,
                  }}
                  {...generateTestID('cd-input-idsc')}
                />
                {discountType === 'by-value' ? this.renderCheckIcon() : null}
              </View>

            </View>
            <View style={pageVerticalItem}>
              <Text style={verticalItemTitle}>{I18n.t('discountPercentageLabel')}</Text>
              <View style={inputContainer}>
              <TextInputMask
                style={[inputMd, inputWidth, inputBottomBorder(discountType === 'percent' ? colors.actionColor : colors.inputBorderColor)]}
                placeholderTextColor={colors.primaryColor}
                value={discountPercent > 0 ? parseFloat(discountPercent).toFixed(2) : ''}
                placeholder={I18n.t('discountPercentagePlaceholder')}
                keyboardType='numeric'
                type={'money'}
                ref={this.discountPercentViewRef}
                onChangeText={(value) => this.calculatePercentage(value)}
                options={{ unit: '', separator: decimalSeparator, delimiter: groupingSeparator }}
                {...generateTestID('pd-input-idsc')}
              />
                {discountType === 'percent' ? this.renderCheckIcon() : null}
              </View>
            </View>
          </View>
          {!shrinkContent ? this.renderTotal() : null}
          <View style={[bottomContainer, whiteBg]}>
            <ActionButton
              alertTitle=''
              alertDescription={I18n.t('discountApplyAlertDescription')}
              onPress={() => this.addDiscount()}
              disabled={!discountType}
              testProps={generateTestID('apply-disc-idsc')}
            >
              {I18n.t('discountApplyButton')}
            </ActionButton>
          </View>
        </CustomKeyboardAvoidingView>
      </DetailPage>

    );
  }
}

const styles = {
  verticalSpace: (paddingVertical) => {
    return {
      paddingVertical
    };
  },
  contentContainer: {
    backgroundColor: colors.lightBg,
    flex: 1
  },
  whiteBg: {
    backgroundColor: '#FFF'
  },
  totalContainer: {
    paddingVertical: 25,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.borderColor
  },
  inputContainer: {
    flexDirection: 'row',
    position: 'relative'
  },
  checkIcon: {
    position: 'absolute',
    right: '15%',
    top: 15
  },
  totalStyle: (color) => {
    return {
      fontSize: 32,
      fontFamily: 'Graphik-Light',
      marginVertical: 5,
      color
    };
  },
  totalLabelStyle: (color) => {
    return {
      fontSize: 15,
      fontFamily: 'Graphik-Medium',
      color
    };
  },
  fieldsContainer: {
    paddingHorizontal: 15
  },
  inputWidth: {
    width: '70%',
    alignSelf: 'center',
    height: 55
  },
  inputBottomBorder: (borderBottomColor) => {
    return {
      borderBottomWidth: 2,
      borderBottomColor
    };
  }
};

const mapStateToProps = ({ currentSale, preference }) => {
  const { currency, decimalCurrency } = preference.account;
  const { totalNet, totalGross, discountValue, discountPercent, discountType } = currentSale;
  return {
    totalNet,
    totalGross,
    discountValue,
    discountPercent,
    discountType,
    currency,
    decimalCurrency
  };
};

export default connect(
  mapStateToProps, { currentSaleDiscount, currentSaleSet }
)(DiscountContainer);
