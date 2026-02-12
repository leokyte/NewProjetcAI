import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TouchableOpacity, View, Alert, Platform } from 'react-native';
import { change, Field, getFormValues, reduxForm } from 'redux-form';
import {
  DetailPage,
  CenterContent,
  KyteText,
  Calculator,
  CurrencyText,
  ActionButton,
  KyteIcon,
  PaymentMethodsModal,
  KyteModal,
  CustomKeyboardAvoidingView,
  InputTextArea, TextButton,
} from '../../common';
import {
  customerManageNewBalance,
  customerManageActualBalance,
  customerAccountEditPayment,
  customerAccountResetBalance,
  customerAccountEditBalance,
} from '../../../stores/actions';
import { PaymentType } from '../../../enums';
import I18n from '../../../i18n/i18n';
import { scaffolding, colors, Type, colorSet } from '../../../styles';
import { getIsBRAndUseBRL, selectPayments } from '../../../util';
import { accountActions } from './CustomerAccount';

 const translate = {
   t_paymenttype: I18n.t('customerAccount.selectPaymentType'),
   t_newbalance: I18n.t('customerAccount.newBalance'),
   t_paylater: I18n.t('customerAccount.payLater'),
   t_in: I18n.t('customerAccount.paymentIn'),
   t_out: I18n.t('customerAccount.paymentOut'),
   t_actualbalance: I18n.t('customerAccount.editCurrentBalance'),
   t_credittoadd: I18n.t('customerAccount.customerAddCreditHeaderTitle'),
   t_currentbalance: I18n.t('customerAccount.currentBalance').toUpperCase(),
   t_debitpayment: I18n.t('customerAccount.payDebit'),
   t_valuebiggerthandebit: I18n.t('customerAccount.valueBiggerThanBalance'),
   t_balanceadjustment: I18n.t('customerAccount.balanceAdjustment'),
   t_balanceadjustmentin: I18n.t('customerAccount.balanceAdjustmentAddValue'),
   t_balanceadjustmentout: I18n.t('customerAccount.balanceAdjustmentRemValue'),
   t_balanceadjustmentobs: I18n.t('customerAccount.balanceAdjustmentObs'),
   t_balanceadjustmentbtntext: I18n.t('customerAccount.addObs'),
 };

class CustomerAccountEditComponent extends Component {
  constructor(props) {
    super(props);
    const { customer, route } = this.props;
    const { params = {} } = route;

    this.isDebitPayment = params.from === accountActions.DEBIT_PAYMENT;
    this.isBalanceAdjustmentIn = params.from === accountActions.BALANCE_ADJUSTMENT_IN;
    this.isBalanceAdjustmentOut = params.from === accountActions.BALANCE_ADJUSTMENT_OUT;
    this.isAddingCredit = params.from === accountActions.ADD_CREDIT;

    this.state = {
      isPositive: !this.isBalanceAdjustmentOut,
      balance: '',
      initialBalance: customer.accountBalance,
      isModalVisible: false,
      isObservationModalVisible: params.isObservationModalVisible,
    };

    this.willFocusListener = null;
  }

  componentDidMount() {
    // this.willFocusListener = this.props.navigation.addListener('willFocus', payload => {
    //   const { params } = payload.state;
    //   if (params && 'isObservationModalVisible' in params) {
    //     this.setState({ isObservationModalVisible: params.isObservationModalVisible });
    //   }
    // });
  }

  componentWillUnmount() {
    const { customer } = this.props;
    const { actualBalance } = customer.manageCustomerAccount;

    this.props.customerAccountResetBalance(actualBalance);
    // if (this.willFocusListener) {
    //   this.willFocusListener.remove();
    //   this.willFocusListener = null;
    // }
  }

  goToAccountBalance() {
    const { navigate } = this.props.navigation;
    const { params = {} } = this.props.route;
    navigate({ key: 'AccountBalancePage', name: 'CustomerAccountBalance', params: { from: params.from } });
  }

  toggleModalVisibility() {
    const { isModalVisible } = this.state;
    this.setState({ isModalVisible: !isModalVisible });
  }

  accountBalanceNavigationAction() {
    const { customer } = this.props;
    const { accountBalance } = customer;
    const { balance } = this.state;

    const paymentValue = balance || accountBalance;

    const isBalanceAdjustment = this.isBalanceAdjustmentIn || this.isBalanceAdjustmentOut;
    if (isBalanceAdjustment) {
      return this.setState({ isObservationModalVisible: true });
    }

    if (this.isDebitPayment) {
      const maxPaymentValue = accountBalance * -1;
      if (paymentValue > maxPaymentValue) {
        return Alert.alert(I18n.t('words.s.attention'), translate.t_valuebiggerthandebit);
      }
      if (!paymentValue || paymentValue === '0.00') return;
      this.manageAccountBalance( 'add', paymentValue < 0 ? paymentValue * -1 : paymentValue);
    }

    this.toggleModalVisibility();
  }

  selectPaymentType(paymentType) {
    this.props.customerAccountEditPayment(paymentType);
    this.toggleModalVisibility();
    this.goToAccountBalance();
  }

  manageAccountBalance(type, number) {
    const { params } = this.props.route;
    const editBalance = params && params.from === 'actual-balance';
    const n = Number(number);

    if (editBalance) return this.props.customerManageActualBalance(type, n);
    this.props.customerManageNewBalance(type, n);
  }

  renderPaymentsModal() {
    const { mercadoPago, currency } = this.props;
    const blackList = getIsBRAndUseBRL(currency) ? [PaymentType.ACCOUNT, PaymentType.LINK] : [PaymentType.ACCOUNT, PaymentType.LINK, PaymentType.PIX];
    const payments = selectPayments(mercadoPago.isActivated, blackList);

    return (
      <PaymentMethodsModal
        hideModal={this.toggleModalVisibility.bind(this)}
        onPress={this.selectPaymentType.bind(this)}
        payments={payments}
      />
    );
  }

  renderValue() {
    const { customer } = this.props;
    const { balance, isPositive } = this.state;
    const { actualBalanceContainer } = styles;

    const generateValue = () => {
      if (balance) return balance;
      if (this.isDebitPayment) return customer.accountBalance * -1;
      if (this.isAddingCredit || this.isBalanceAdjustmentIn || this.isBalanceAdjustmentOut) return '';
    };

    const renderError = () => {
      const { errorContainer } = styles;
      return (
         <View style={errorContainer}>
           <KyteText
             size={11}
             pallete="barcodeRed"
             style={{ textAlign: 'center', lineHeight: 16 }}
           >
             {translate.t_valuebiggerthandebit}
           </KyteText>
        </View>
      );
    };

    return (
      <View style={actualBalanceContainer}>
        <CurrencyText
          value={generateValue()}
          currencyColor={!isPositive ? colors.barcodeRed : colors.actionColor}
          numberColor={!isPositive ? colors.barcodeRed : colors.actionColor}
          isSplitted
          useBalanceSymbol={!isPositive ? -1 : generateValue()}
        />
        {this.isDebitPayment && parseFloat(balance) > (customer.accountBalance * -1) ? renderError() : null}
      </View>
    );
  }

  renderOriginalValue() {
    const { customer } = this.props;
    const generateValue = () => {
      if (this.isDebitPayment) return customer.accountBalance * -1;
      return '';
    };

    return (
      <TouchableOpacity onPress={() => this.setState({ balance: '' })}>
        <View style={styles.originalValueContainer}>
          <CenterContent>
            <KyteText size={16} weight="Semibold" style={{ color: colors.primaryDarker }}>
              <CurrencyText value={generateValue()} />
            </KyteText>
          </CenterContent>
        </View>
      </TouchableOpacity>
    );
  }

  renderTextareaField(field) {
    return (
      <InputTextArea
        {...field.input}
        style={field.style}
        onChangeText={field.input.onChange}
        value={field.input.value}
        placeholder={field.placeholder}
        placeholderColor={field.placeholderColor}
        autoFocus={field.autoFocus}
        multiline={field.multiline}
        textAlignVertical={field.textAlignVertical}
        noBorder={field.noBorder}
        hideLabel={field.hideLabel}
        shrinkSection={field.shrinkSection}
        flex={field.flex}
        autoCorrect={field.autoCorrect}
        maxLength={field.maxLength}
        numberOfLines={field.numberOfLines}
      />
    );
  }

  renderObsModal() {
    const { bottomContainer } = scaffolding;
    const { formValues } = this.props;

    const hasObservationText = formValues && formValues.observation;

    const rightButtons = [{
      title: I18n.t('words.s.clear'),
      onPress: () => this.props.change('observation', ''),
      disabled: !hasObservationText,
      color: !hasObservationText ? colors.lightColor : null,
    }];

    const renderSkipButton = () => (
      <View style={{ alignItems: 'center' }}>
        <TextButton
          onPress={() => this.setState({ isObservationModalVisible: false }, () => this.goToAccountBalance())}
          title={I18n.t('words.s.skip')}
          style={[Type.Medium, { fontSize: 15 }]}
          color={colors.actionColor}
        />
      </View>
    );

    return (
      <KyteModal
        height="100%"
        fullPage
        fullPageTitle={`${I18n.t('customerObservationPlaceholder')} (${I18n.t('words.s.optional')})`}
        fullPageTitleIcon="back-navigation"
        hideFullPage={() => this.setState({ isObservationModalVisible: false })}
        isModalVisible
        rightButtons={rightButtons}
      >
        <CustomKeyboardAvoidingView style={{ flex: 1 }}>
          <Field
            placeholder={translate.t_balanceadjustmentobs}
            placeholderColor={colors.primaryGrey}
            name="observation"
            component={this.renderTextareaField}
            autoFocus
            multiline
            textAlignVertical="top"
            noBorder
            hideLabel
            flex
            autoCorrect
            style={{ paddingTop: 20 }}
            maxLength={140}
            numberOfLines={4}
          />

        {!hasObservationText ? renderSkipButton() : null}

          <View style={[bottomContainer, Platform.select({ ios: { marginBottom: 5 } })]}>
            <ActionButton
              onPress={() => {
                this.props.change('observation', formValues.observation || '');
                this.setState({ isObservationModalVisible: false }, () => this.goToAccountBalance());
              }}
              disabled={!formValues}
              noDisabledAlert
              nextArrow={hasObservationText}
            >
              {translate.t_balanceadjustmentbtntext}
            </ActionButton>
          </View>
        </CustomKeyboardAvoidingView>
      </KyteModal>
    );
  }

  render() {
    const { isModalVisible, isObservationModalVisible, initialBalance, balance } = this.state;
    const { decimalCurrency, customer } = this.props;
    const { goBack } = this.props.navigation;
    const { bottomContainer } = scaffolding;
    const { currentBalanceContainer } = styles;
    const debitWithBiggerValue = this.isDebitPayment && parseFloat(balance) > (customer.accountBalance * -1);
    const isInAdjustment = this.isBalanceAdjustmentIn || this.isBalanceAdjustmentOut;
    const isZero = (balance === '0.00' || balance === '0');
    const balanceIsStringZero = (isZero || (isInAdjustment && !balance));
    const alertDescription = debitWithBiggerValue ? translate.t_valuebiggerthandebit : I18n.t('customerAccount.addCreditNoValue');

    const generatePageTitle = () => {
      if (this.isDebitPayment) return translate.t_debitpayment;
      if (this.isBalanceAdjustmentIn) return `${translate.t_balanceadjustment}: ${translate.t_balanceadjustmentin}`;
      if (this.isBalanceAdjustmentOut) return `${translate.t_balanceadjustment}: ${translate.t_balanceadjustmentout}`;
      return I18n.t('customerAccount.customerAddCredit');
    };

    const showTotalHelpers = (balance && Number(balance) !== initialBalance);
    const type = (this.isAddingCredit || this.isBalanceAdjustmentIn || this.isDebitPayment) ? 'add' : 'remove';
    const valueColor = (value) => {
      if (value === 0) return 'primaryColor';
      return value < 0 ? 'errorColor' : 'actionColor';
    };

    return (
      <DetailPage pageTitle={generatePageTitle()} goBack={goBack}>
        <CenterContent>
          <View style={currentBalanceContainer}>
            <KyteText size={12} weight="Regular" pallete="grayBlue" style={{ lineHeight: 14, paddingBottom: 3 }}>{translate.t_currentbalance}</KyteText>
            <CurrencyText
              value={initialBalance}
              style={[colorSet(colors[valueColor(initialBalance)]), Type.Medium]}
              useBalanceSymbol={initialBalance}
            />
          </View>
          {this.renderValue()}
        </CenterContent>
        {showTotalHelpers && this.isDebitPayment ? this.renderOriginalValue() : null}
        <View style={{ flex: 1.3 }}>
          <Calculator
            state={this}
            stateProp="balance"
            stateValue={balance}
            valueType={decimalCurrency ? 'decimal' : null}
            onPressNumber={(number) => this.manageAccountBalance(type, number)}
            noConfirm
          />
        </View>
        <View style={bottomContainer}>
          <ActionButton
            alertTitle={I18n.t('words.s.attention')}
            alertDescription={alertDescription}
            onPress={() => this.accountBalanceNavigationAction()}
            rightIcon={<KyteIcon name="arrow-cart" color="white" size={15} />}
            disabled={(this.isAddingCredit && !balance) || debitWithBiggerValue || balanceIsStringZero}
          >
            {I18n.t('words.s.proceed')}
          </ActionButton>
        </View>
        {isModalVisible ? this.renderPaymentsModal() : null}
        {isObservationModalVisible ? this.renderObsModal() : null}
      </DetailPage>
    );
  }
}

const styles = {
  actualBalanceContainer: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBalanceContainer: {
    paddingVertical: 15,
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.borderColor,
  },
  cursorStyle: {
    fontFamily: 'Graphik-Light',
    fontSize: 50,
    color: colors.primaryColor,
    position: 'relative',
    top: -2,
  },
  currentBalanceContainer: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    paddingBottom: 15,
    paddingHorizontal: 50,
  },
  originalValueContainer: {
    backgroundColor: colors.lightBg,
    height: 35,
  },
};

const CustomerAccountEdit = reduxForm({
  form: 'CustomerAccountEdit',
})(CustomerAccountEditComponent);


const mapStateToProps = (state) => {
  const { preference, customers, externalPayments } = state;
  return {
    currency: preference.account,
    decimalCurrency: preference.account.decimalCurrency,
    customer: customers.detail,
  mercadoPago: externalPayments.mercadoPago,
    formValues: getFormValues('CustomerAccountEdit')(state),
  };
};

export default connect(
  mapStateToProps,
  {
    customerManageNewBalance,
    customerManageActualBalance,
    customerAccountEditPayment,
    customerAccountResetBalance,
    customerAccountEditBalance,
    change,
  })(CustomerAccountEdit);
