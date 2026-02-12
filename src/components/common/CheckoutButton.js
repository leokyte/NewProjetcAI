import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TouchableOpacity, Text, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import { CurrencyText } from '../common';
import { colors } from '../../styles';
import I18n from '../../i18n/i18n';
import { currencyFormat, generateTestID } from '../../util';

class CheckoutButton extends Component {
  constructor(props) {
    super(props);
    this.checkoutButtonRef = React.createRef();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.totalValue !== nextProps.totalValue) {
      this.timer = setTimeout(() => {
        if (this.props.totalValue > 0) {
          const checkoutButton = this.checkoutButtonRef.current;
          checkoutButton?.pulse(320);
        }
      }, this.props.duration);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  showAlert() {
    Alert.alert(
      I18n.t('emptyCartAlertTitle'),
      I18n.t('emptyCartAlertDescription'),
      [{ text: I18n.t('alertOk') }]
    );
  }

  enableButton() {
    this.setState({ disableButton: false });
  }

  formatCurrency() {
    const { decimalCurrency, currency } = this.props;
    return currencyFormat(0, currency, decimalCurrency);
  }

  renderText() {
    const { totalItems, totalValue, customText } = this.props;
    const { fontStyle } = styles;
    if (customText) {
      return (
        <Text allowFontScaling={false} style={fontStyle('#FFF')} {...generateTestID('go-cart-text-ck')}>
          {customText}
        </Text>
      );
    }

    if (totalItems === 0) {
      return (
        <Text allowFontScaling={false} style={fontStyle(colors.actionColor)} {...generateTestID('go-cart-text-ck')}>
          {I18n.t('emptyCheckoutButton')}
        </Text>
      );
    }

    return (
      <Text allowFontScaling={false} style={fontStyle('#FFF')} {...generateTestID('go-cart-text-ck')}>
          {totalItems} {totalItems > 1 ? I18n.t('words.p.item') : I18n.t('words.s.item')} = <CurrencyText value={totalValue} />
      </Text>
    );
  }

  render() {
    const { totalItems, onPress, customText } = this.props;
    const buttonDisabled = () => {
      return totalItems <= 0;
    };
    const { buttonStyles, buttonStyleDisabled, buttonStyleActive } = styles;

    return (
      <TouchableOpacity
        onPress={!customText && buttonDisabled() ? () => this.showAlert() : onPress}
        activeOpacity={0.8}
      >
        <Animatable.View
          ref={this.checkoutButtonRef}
          style={[
            buttonStyles, !customText && buttonDisabled() ? buttonStyleDisabled : buttonStyleActive,
            this.props.style
          ]}{...generateTestID('go-cart-ck')}
        >
          {this.renderText()}
          {customText ? null : <Icon name="chevron-right" color="#FFF" />}
        </Animatable.View>
      </TouchableOpacity>
    );
  }
}

const styles = {
  buttonStyles: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 6,
    paddingHorizontal: 10,
    margin: 10,
  },
  buttonStyleActive: {
    backgroundColor: colors.actionColor,
  },
  buttonStyleDisabled: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: colors.actionColor,
  },
  fontStyle: (color) => {
    return {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'Graphik-Medium',
      fontSize: 18,
      paddingLeft: 15,
      color,
      bottom: 1.5,
    };
  },
};

const mapStateToProps = ({ currentSale, preference }) => {
  const { totalItems } = currentSale;
  const { currency, decimalCurrency } = preference.account;
  return { totalItems, currency, decimalCurrency };
};

export default connect(mapStateToProps)(CheckoutButton);
