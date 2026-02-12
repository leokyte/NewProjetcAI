import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import _ from 'lodash';
import { getFormValues } from 'redux-form';

import { logEvent } from '../../../integrations';
import { CenterContent, ActionButton, KyteText, CurrencyText, KyteIcon, LoadingCleanScreen, KyteToolbar, KyteSafeAreaView } from '../../common';
import CustomerImage from '../image/CustomerImage';
import {
  customerAccountEditBalance,
  customersFetch,
  customersFetchStatements,
  startLoading,
  stopLoading,
  mercadoPagoPayment,
  currentSaleAddPayment,
  currentSaleSetStatus,
  currentSaleSplitPayment,
} from '../../../stores/actions';
import I18n from '../../../i18n/i18n';
import {
  CustomerAccountMovementReason,
  CustomerAccountMovementType,
  MercadoPagoPaymentType,
  PaymentType,
} from '../../../enums';
import { scaffolding, gridStyles, colors, Type, colorSet } from '../../../styles';

const Strings = {
  ADD_CREDIT: I18n.t('customerAccount.customerAddCredit'),
  PAY_DEBIT: I18n.t('customerAccount.payDebit'),
  BALANCE_ADJUSTMENT: I18n.t('customerAccount.balanceAdjustment'),
  ADD_CREDIT_BALANCE: I18n.t('customerAccount.paymentIn'),
  PAY_DEBIT_BALANCE: I18n.t('customerAccount.payDebitBalance'),
  BALANCE_ADJUSTMENT_BALANCE_IN: I18n.t('customerAccount.balanceAdjustmentInOut'),
  BALANCE_ADJUSTMENT_BALANCE_OUT: I18n.t('customerAccount.balanceAdjustmentInOut'),
};

const PAY_DEBIT = 'PAY_DEBIT';
const ADD_CREDIT = 'ADD_CREDIT';
const BALANCE_ADJUSTMENT_IN = 'BALANCE_ADJUSTMENT_IN';
const BALANCE_ADJUSTMENT_OUT = 'BALANCE_ADJUSTMENT_OUT';

class CustomerAccountBalance extends Component {
  constructor(props) {
    super(props);

    const { route } = this.props;
    const { params = {} } = route;

    this.isDebitPayment = params.from === 'debit-payment';
    this.isBalanceAdjustmentIn = params.from === 'balance-adjustment-in';
    this.isBalanceAdjustmentOut = params.from === 'balance-adjustment-out';
    this.isAddingCredit = params.from === 'add-credit';

    this.state = {
      localCustomerAccount: props.customer.manageCustomerAccount,
    };
  }

  UNSAFE_componentWillMount() {
    this.updateLocalCustomerAccount();
  }

  updateLocalCustomerAccount() {
    // a little problem is occurring: if you add more than 1 payment of customer account type,
    // the states were not being update. And this is correct, because the payments hasn't been proccessed by backend yet.
    // So, to avoid this problem, just will read the payments redux and do the necessary calculations and update
    // only the local state. :)

    const { payments, saleTotalNet } = this.props;
    const { actualBalance, transactionBalance } = this.state.localCustomerAccount;
    if (payments.length <= 0) {
      return;
    }

    // ok, this search here is needed because app needs to know if this payment is split.
    // we couldn't use 'split' property because the first payment always is 'false'.
    // so, to prevent, checking 'total' property
    const hasCustomerAccountPayment = payments.filter(p => p.type === PaymentType.items[PaymentType.ACCOUNT].type && p.total < saleTotalNet);
    if (hasCustomerAccountPayment.length > 0) {
      const totalCustomerAccountPayments = _.sumBy(hasCustomerAccountPayment, p => p.total);
      const newActualBalance = actualBalance - totalCustomerAccountPayments;
      this.setState({
        localCustomerAccount: {
          ...this.state.localCustomerAccount,
          actualBalance: newActualBalance,
          newBalance: newActualBalance - Math.abs(transactionBalance),
        },
      });
    }
  }

  getTypeAndReason() {
    if (this.isDebitPayment) return {
      type: CustomerAccountMovementType.items[CustomerAccountMovementType.IN].type,
      reason: CustomerAccountMovementReason.items[PAY_DEBIT].key,
    };
    if (this.isAddingCredit) return {
      type: CustomerAccountMovementType.items[CustomerAccountMovementType.IN].type,
      reason: CustomerAccountMovementReason.items[ADD_CREDIT].key,
    };
    if (this.isBalanceAdjustmentIn) return {
      type: CustomerAccountMovementType.items[CustomerAccountMovementType.IN].type,
      reason: CustomerAccountMovementReason.items[BALANCE_ADJUSTMENT_IN].key,
    };
    if (this.isBalanceAdjustmentOut) return {
      type: CustomerAccountMovementType.items[CustomerAccountMovementType.OUT].type,
      reason: CustomerAccountMovementReason.items[BALANCE_ADJUSTMENT_OUT].key,
    };
  }

  setNewBalance(transactionType) {
    const { customer, auth, formValues } = this.props;
    const { transactionBalance, paymentType } = customer.manageCustomerAccount;

    const transaction = {
      aid: auth.aid,
      uid: auth.user.uid,
      userName: auth.user.displayName,
      value: Math.abs(transactionBalance),
      type: this.getTypeAndReason().type,
      reason: this.getTypeAndReason().reason,
      customerId: customer.id,
      paymentType: paymentType.type,
      obs: formValues && formValues.observation ? formValues.observation : null,
    };

    this.props.customerAccountEditBalance(transaction,
      () => this.successCb(transaction),
      () => this.errorAlert()
    );
  }

  addMercadoPagoPayment() {
    const { customer } = this.props;
    const { transactionBalance } = customer.manageCustomerAccount;

    const saleRandomNumber = Math.floor(Math.random() * 99999) + 1;
    this.props.startLoading();
    this.props.mercadoPagoPayment({
      amount: Math.abs(transactionBalance),
      description: `K${saleRandomNumber}`,
      external_reference: saleRandomNumber,
      payer_email: customer ? customer.email : null,
      type: MercadoPagoPaymentType.CUSTOMER_ACCOUNT,
      customerAccountPaymentType: this.getTypeAndReason().type,
      customerAccountReason: this.getTypeAndReason().reason,
    });
  }

  errorAlert() {
    return (
      Alert.alert(
        I18n.t('unsavedChangesTitle'),
        I18n.t('generalErrorTitle'),
        [{ text: I18n.t('alertDiscard') }]
      )
    );
  }

  successCb(transaction) {
    const { navigation } = this.props;

    const eventName = () => {
      if (this.isAddingCredit) return 'add_credit';
      if (this.isDebitPayment) return 'pay_debit';
      if (this.isBalanceAdjustmentIn || this.isBalanceAdjustmentOut) return 'update_balance';
    };

    // Tracking events
    logEvent('CustomerEditBalance', { type: eventName() });

    navigation.pop(2, { tab: 2 });
  }

  concludeCustomerBalanceEdition() {
    const { customer } = this.props;
    const { paymentType } = customer.manageCustomerAccount;
    const isMercadoPago = paymentType.type === 'mercadopago';

    if (isMercadoPago) return this.addMercadoPagoPayment();
    this.setNewBalance();
  }

  concludeTransaction() {
    return this.concludeCustomerBalanceEdition();
  }

  renderLoading() {
    return <LoadingCleanScreen />;
  }

  renderCustomerImage() {
    const { customer } = this.props;
    return (
      <CustomerImage
        customer={customer}
        style={gridStyles.flexImage}
      />
    );
  }

  renderCustomerLabel() {
    const { customer } = this.props;
    const size = 28;
    return <KyteText color={'#FFF'} weight={'Medium'} size={size} uppercase style={{ lineHeight: size }}>{customer.name.substr(0, 2)}</KyteText>;
  }

  generateBalanceText() {
    if (this.isAddingCredit) return Strings.ADD_CREDIT_BALANCE;
    if (this.isDebitPayment) return Strings.PAY_DEBIT_BALANCE;
    if (this.isBalanceAdjustmentIn) return Strings.BALANCE_ADJUSTMENT_BALANCE_IN;
    if (this.isBalanceAdjustmentOut) return Strings.BALANCE_ADJUSTMENT_BALANCE_OUT;
  }

  generateCTAText() {
    if (this.isAddingCredit) return Strings.ADD_CREDIT;
    if (this.isDebitPayment) return Strings.PAY_DEBIT;
    if (this.isBalanceAdjustmentIn || this.isBalanceAdjustmentOut) return Strings.BALANCE_ADJUSTMENT;
  }

  generateValue() {
    const { newBalance } = this.state.localCustomerAccount;
    if (this.isDebitPayment || (this.isBalanceAdjustmentIn || this.isBalanceAdjustmentOut)) return newBalance < 0 ? newBalance.accountBalance * -1 : 0;
    return newBalance;
  }

  renderAdjustBalanceObservation() {
    const { formValues, navigation } = this.props;
    if (!formValues) return null;

    return (
      <TouchableOpacity style={styles.observationContainer} onPress={() => navigation.navigate('CustomerAccountEdit', { isObservationModalVisible: true })}>
        <KyteIcon
          name="observation-right"
          color={colors.grayBlue}
          size={17}
        />
        <KyteText weight="Regular" pallete="grayBlue" size={12} style={{ paddingLeft: 10 }}>
          {formValues.observation}
        </KyteText>
      </TouchableOpacity>
    );
  }

  render() {
    const { customer, loader, navigation } = this.props;
    const { transactionBalance } = customer.manageCustomerAccount;
    const { actualBalance, newBalance } = this.state.localCustomerAccount;

    const { bottomContainer } = scaffolding;
    const positiveTransaction = transactionBalance > 0;
    const arrowColor = transactionBalance > 0 ? 'actionColor' : 'errorColor';
    const isBalanceAdjustment = this.isBalanceAdjustmentIn || this.isBalanceAdjustmentOut;

    const valueColor = (value) => {
      if (value === 0) return 'primaryColor';
      return value < 0 ? 'errorColor' : 'actionColor';
    };

    return (
      <KyteSafeAreaView style={styles.outerContainer}>
        <KyteToolbar
          innerPage
          headerTitle={I18n.t('customerAccount.customerAccountBalanceTitle')}
          borderBottom={1}
          goBack={() => navigation.navigate('CustomerAccountEdit', { isObservationModalVisible: false })}
        />
        <ScrollView>
          <CenterContent style={{ backgroundColor: colors.lightBg, paddingVertical: 55 }}>
            <View style={styles.customerCircle}>
              {customer.image ? this.renderCustomerImage() : this.renderCustomerLabel()}
            </View>
            <KyteText ellipsizeMode={'tail'} numberOfLines={1} size={20} weight={'Semibold'} style={{ color: colors.primaryDarker }}>
              {customer.name}
            </KyteText>
          </CenterContent>
          <View style={styles.balanceContainer}>
            <View style={styles.balanceRow}>
              <KyteText style={styles.balanceLabel} size={15} weight={'Regular'}>{I18n.t('customerAccount.currentBalance')}</KyteText>
              <KyteText size={15} pallete={valueColor(actualBalance)} weight={'Semibold'}>
                <CurrencyText value={actualBalance} useBalanceSymbol={actualBalance} />
              </KyteText>
            </View>
            <View style={styles.balanceRow}>
              <View style={styles.balanceLabel}>
                <KyteIcon size={17} color={colors[arrowColor]} style={styles.arrowStyle} name={positiveTransaction ? 'arrow-in' : 'arrow-out'} />
                <KyteText size={15} weight={'Regular'}>{this.generateBalanceText()}</KyteText>
              </View>
              <KyteText size={15} pallete={valueColor(transactionBalance)} weight={'Semibold'}>
                <CurrencyText value={transactionBalance} useBalanceSymbol={transactionBalance} />
              </KyteText>
            </View>
            <View style={[styles.balanceRow, { borderBottomWidth: 0 }]}>
              <KyteText style={styles.balanceLabel} size={17} weight={'Medium'}>{I18n.t('customerAccount.newBalance')}</KyteText>
              <KyteText size={17} pallete={valueColor(newBalance)} weight={'Semibold'}><CurrencyText value={newBalance} useBalanceSymbol={newBalance || 1}/></KyteText>
            </View>
          </View>
          {isBalanceAdjustment ? this.renderAdjustBalanceObservation() : null}
        </ScrollView>
        <View style={bottomContainer}>
          <ActionButton
            alertTitle={I18n.t('words.s.attention')}
            alertDescription={'alertDescription'}
            onPress={() => this.concludeTransaction()}
            disabled={false}
            color={colors.actionColor}
          >
            {this.generateCTAText()}
          </ActionButton>
        </View>
      {loader.visible ? this.renderLoading() : null}
      </KyteSafeAreaView>
    );
  }
}

const styles = {
  outerContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  balanceContainer: {
    flex: 1,
    // padding: 15
  },
  balanceRow: {
    padding: 20,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.littleDarkGray,
  },
  balanceLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStyle: { marginLeft: 15 },
  grayRow: { backgroundColor: colors.littleDarkGray },
  header: { height: 260 },
  customerCircle: {
    width: 90,
    height: 90,
    borderRadius: 75,
    backgroundColor: colors.primaryDarker,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowStyle: {
    paddingRight: 15,
  },
  currencyStyle: [
    Type.Medium,
    Type.fontSize(13),
    colorSet(colors.primaryDarker),
  ],
  observationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
    flexDirection: 'row',
  },
};

const mapStateToProps = (state) => {
  const { customers, auth, common, currentSale, externalPayments, preference } = state;
  return {
    customer: customers.detail,
    auth,
    loader: common.loader,
    payments: currentSale.payments,
    saleTotalNet: currentSale.totalNet,
    mercadoPago: externalPayments.mercadoPago,
    currency: preference.account.currency,
    currentSale,
    formValues: getFormValues('CustomerAccountEdit')(state),
  };
};

export default connect(mapStateToProps, {
  customerAccountEditBalance,
  customersFetch,
  customersFetchStatements,
  startLoading,
  stopLoading,
  mercadoPagoPayment,
  currentSaleAddPayment,
  currentSaleSetStatus,
  currentSaleSplitPayment,
})(CustomerAccountBalance);
