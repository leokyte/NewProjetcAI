import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';
import { MaskService } from 'react-native-masked-text';
import { KyteToolbar, ActionButton, KyteIcon, KyteSafeAreaView } from '../../common';
import { currentSaleSetStatus } from '../../../stores/actions';
import { scaffolding, colors } from '../../../styles';
import NavigationService from '../../../services/kyte-navigation';
import I18n from '../../../i18n/i18n';

class PaymentOthers extends Component {
  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  goToReceipt() {
    const { popToTop } = this.props.navigation;
    this.props.currentSaleSetStatus(null, this.props.currentSale.status);

    // goBack(routeKey);
    popToTop();
    this.timer = setTimeout(() => {
      NavigationService.reser('Receipt', 'Receipt');
    });
  }

  renderConcludeButton() {
    const { totalNet, currency } = this.props;
    const { currencySymbol, groupingSeparator, decimalSeparator } = currency;
    const convertedTotalNet = MaskService.toMask('money', totalNet.toFixed(2), { unit: `${currencySymbol} `, separator: decimalSeparator, delimiter: groupingSeparator });

    return (
      <ActionButton
        alertTitle=''
        alertDescription={I18n.t('paymentConcludeAlertDescription')}
        onPress={() => this.goToReceipt()}
      >
        {`${I18n.t('paymentConcludeButton')} ${convertedTotalNet}`}
      </ActionButton>
    );
  }

  render() {
    const { navigate, goBack } = this.props.navigation;
    const { outerContainer, bottomContainer } = scaffolding;
    const { contentContainer, contentText, contentSpace } = styles;
    const {
      titleOtherPaymentMethods,
      useThisOptionToRecordPayment,
      titleExampleOtherPaymentMethods,
      exampleOtherPaymentMethods } = I18n.t('otherPaymentMethods');

    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage
          borderBottom={1}
          headerTitle={titleOtherPaymentMethods}
          goBack={() => goBack()}
          navigate={navigate}
          navigation={this.props.navigation}
        />
        <View style={contentContainer}>
          <KyteIcon style={contentSpace} name='others' color={colors.primaryColor} size={100} />
          <Text style={[contentText(), contentSpace]}>{useThisOptionToRecordPayment}</Text>
          <Text style={contentText('bold')}>{titleExampleOtherPaymentMethods}</Text>
          <Text style={contentText()}>{exampleOtherPaymentMethods}</Text>
        </View>
        <View style={bottomContainer}>
          {this.renderConcludeButton()}
        </View>
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingHorizontal: 25
  },
  contentText: (isBold) => ({
    fontFamily: isBold ? 'Graphik-Semibold' : 'Graphik-Regular',
    color: colors.primaryColor,
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center'
  }),
  contentSpace: {
    marginBottom: 35
  }
};

const mapStateToProps = ({ currentSale, preference }) => {
  const { currency } = preference.account;
  const { totalNet } = currentSale;
  return {
    currentSale,
    totalNet,
    currency
  };
};

export default connect(mapStateToProps, { currentSaleSetStatus })(PaymentOthers);
