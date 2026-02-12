import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { View, Alert, Platform } from 'react-native';
import { isEqual as lodashIsEqual } from 'lodash';
import {
  KyteText,
  CenterContent,
  CurrencyText,
  ActionButton,
  KyteIcon,
  TextButton,
  KyteModal,
  KyteModalAlert,
} from '../../common';
import {
  checkFeatureIsAllowed,
} from '../../../stores/actions';
import { colors, Type, colorSet, scaffolding } from '../../../styles';
import { checkUserPermission } from '../../../util';
import I18n from '../../../i18n/i18n';
import { Features } from '../../../enums';
import { CustomerAccountChangeAnalytics as alertImage } from '../../../../assets/images';

const Strings = {
  SALDO_ATUAL: I18n.t('customerAccount.currentBalance').toUpperCase(),
  ADD_CREDIT: I18n.t('customerAccount.customerAddCredit'),
  NO_STATEMENT: I18n.t('customerAccount.customerWithNoStatement'),
  NO_PERMISSION: I18n.t('customerAccount.notAllowToEditBalance'),
  NO_STATEMENTS_FILTERING_TITLE: I18n.t('customerAccount.noResultsTitle'),
  NO_STATEMENTS_FILTERING_INFO: I18n.t('customerAccount.noResultsDescription'),
  NO_STATEMENTS_FILTERING_CLEAR: I18n.t('salesPeriodClearButton'),
  BALANCE_ADJUSTMENT: I18n.t('customerAccount.balanceAdjustment'),
  ACCOUNT_STATEMENTS: I18n.t('customerAccount.printAccountStatementLabel'),
  PAY_DEBIT: I18n.t('customerAccount.payDebit'),
  BALANCE_ADJUSTMENT_ADD: I18n.t('customerAccount.balanceAdjustmentAdd'),
  BALANCE_ADJUSTMENT_REMOVE: I18n.t('customerAccount.balanceAdjustmentRem'),
  UPDATE_BALANCE_TIP: I18n.t('customerAccount.updateBalanceTip'),
};

export const accountActions = {
  ADD_CREDIT: 'add-credit',
  DEBIT_PAYMENT: 'debit-payment',
  BALANCE_ADJUSTMENT_IN: 'balance-adjustment-in',
  BALANCE_ADJUSTMENT_OUT: 'balance-adjustment-out',
};

class CustomerAccount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdjustmentOptionsVisible: false,
      showAccountEditAlert: false,
    };
  }

  // This function is used to check if User already have used CustomerAccount Balance
  checkBalanceTotalsNotEmpty() {
    const emptyTotals = { debit: 0, credit: 0 };
    const { balanceTotals = emptyTotals } = this.props;

    return !lodashIsEqual(emptyTotals, balanceTotals);
  }

  // This function is used to trigger the CustomerAccount tip first time, if required.
  checkFirstCustomerAccountAction(from) {
    const haveUsed = this.checkBalanceTotalsNotEmpty();

    if (haveUsed) return this.goToCustomerAccountEdit(from);

    this.setState({
      isAdjustmentOptionsVisible: false,
      showAccountEditAlert: from,
    });
  }

  goToCustomerAccountEdit(from) {
    const { permissions, navigation, isOnline } = this.props;
    const { navigate } = navigation;
    const isBalanceAdjustment = (from === accountActions.BALANCE_ADJUSTMENT_IN || from === accountActions.BALANCE_ADJUSTMENT_OUT);
    const isDebitPayent = from === accountActions.DEBIT_PAYMENT;
    const { key, remoteKey } = Features.items[Features.CUSTOMER_ACCOUNT];

    const getPermissions = checkUserPermission(permissions);
    if (isBalanceAdjustment && !getPermissions.allowCustomerInDebt) {
      Alert.alert(I18n.t('words.m.restrictedAccess'), Strings.NO_PERMISSION, [{ text: I18n.t('alertOk') }]);
      return;
    }

    if (isDebitPayent) {
       if (!isOnline) return Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'));
       navigate({ key: 'CustomerAccountEditPage', name: 'CustomerAccountEdit', params: { from } });
       return;
    }

    this.props.checkFeatureIsAllowed(
      key,
      () => {
        if (!isOnline) return Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'));
        if (isBalanceAdjustment) return this.setState({ isAdjustmentOptionsVisible: false }, () => navigate({ key: 'CustomerAccountEditPage', name: 'CustomerAccountEdit', params: { from } }));
        navigate({ key: 'CustomerAccountEditPage', name: 'CustomerAccountEdit', params: { from } });
      },
      remoteKey
    );
  }

  goToCustomerStatements() {
    const { isOnline, navigation } = this.props;
    const { navigate } = navigation;

    if (!isOnline) return Alert.alert(I18n.t('customersOfflineWarningTitle'), I18n.t('words.m.noInternet'));
    // alert('TODO: CTA customer statements');
    navigate({ key: 'CustomerStatementsPage', name: 'CustomerStatements'});
  }

  renderAddCredit() {
    const { customer } = this.props;
    const { addCreditsCTAContainer, addCreditsCTAText } = styles;
    const emptyValue = !customer.accountBalance || customer.accountBalance === '0.00';

    return (
      <Fragment>
        <CurrencyText
          value={customer.accountBalance}
          currencyColor={!emptyValue ? colors.actionColor : colors.primaryColor}
          numberColor={!emptyValue ? colors.actionColor : colors.primaryColor}
          useBalanceSymbol={customer.accountBalance}
          isSplitted
        />
        <ActionButton
          onPress={() => this.checkFirstCustomerAccountAction(accountActions.ADD_CREDIT)}
          style={addCreditsCTAContainer}
          textStyle={[Type.Regular, Platform.OS === 'ios' ? { paddingTop: 5 } : null, addCreditsCTAText]}
          buttonSmall
        >
          {Strings.ADD_CREDIT}
        </ActionButton>
      </Fragment>
    );
  }

  renderPayDebit() {
    const { customer } = this.props;
    const { addCreditsCTAContainer, addCreditsCTAText } = styles;
    const emptyValue = !customer.accountBalance || customer.accountBalance === '0.00';
    return (
      <Fragment>
        <CurrencyText
          value={customer.accountBalance}
          currencyColor={colors.barcodeRed}
          numberColor={colors.barcodeRed}
          useBalanceSymbol={customer.accountBalance}
          isSplitted
        />
        <ActionButton
          onPress={() => this.checkFirstCustomerAccountAction(accountActions.DEBIT_PAYMENT)}
          style={[addCreditsCTAContainer, { backgroundColor: colors.barcodeRed }]}
          textStyle={[Type.Regular, Platform.OS === 'ios' ? { paddingTop: 5 } : null, addCreditsCTAText]}
          buttonSmall
        >
          {Strings.PAY_DEBIT}
        </ActionButton>
      </Fragment>
    );
  }

  renderBalanceAdjustmentOptions() {
    const tipContainer = { paddingHorizontal: 15, paddingBottom: 15 };

    return (
      <KyteModal
        bottomPage
        height={'auto'}
        title={Strings.BALANCE_ADJUSTMENT}
        isModalVisible
        hideModal={() => this.setState({ isAdjustmentOptionsVisible: false })}
      >
        <View style={tipContainer}>
          <KyteText pallete={'primaryGrey'} size={14}>{Strings.UPDATE_BALANCE_TIP}</KyteText>
        </View>
        <ActionButton
          onPress={() => this.checkFirstCustomerAccountAction(accountActions.BALANCE_ADJUSTMENT_IN)}
          leftIcon={<KyteIcon color={colors.actionColor} name={'arrow-in'} size={18} />}
          style={styles.balanceAdjustmentButton}
          textStyle={styles.balanceAdjustmentButtonText}
        >
          {Strings.BALANCE_ADJUSTMENT_ADD}
        </ActionButton>

        <ActionButton
          onPress={() => this.checkFirstCustomerAccountAction(accountActions.BALANCE_ADJUSTMENT_OUT)}
          leftIcon={<KyteIcon color={colors.barcodeRed} name={'arrow-out'} size={18} />}
          style={[styles.balanceAdjustmentButton, { marginBottom: 15 }]}
          textStyle={styles.balanceAdjustmentButtonText}
        >
          {Strings.BALANCE_ADJUSTMENT_REMOVE}
        </ActionButton>
      </KyteModal>
    );
  }

  openAdjustmentOptions() {
    const { key, remoteKey } = Features.items[Features.CUSTOMER_ACCOUNT];
    this.props.checkFeatureIsAllowed(
      key,
      () =>   this.setState({ isAdjustmentOptionsVisible: true }),
      remoteKey
    );
  }

  renderAccountEditAlert() {
    const { showAccountEditAlert: from } = this.state;

    let title = '';
    switch (from) {
      case accountActions.ADD_CREDIT:
        title = 'customerAccount.customerAddCredit'; break;
      case accountActions.PAY_DEBIT:
        title = 'customerAccount.payDebit'; break;
      case accountActions.BALANCE_ADJUSTMENT_IN:
        title = 'customerAccount.balanceAdjustmentAdd'; break;
      default:
        title = 'customerAccount.balanceAdjustmentRem';
    }

    return (
      <KyteModalAlert
        image={alertImage}
        imageHeightProportion={0.714}
        title={I18n.t(title)}
        info={I18n.t('customerAddCreditTipText')}
        hideModal={() => {
            this.setState({ showAccountEditAlert: false });
            this.goToCustomerAccountEdit(from);
        }}
      />
    );
  }

  render() {
    const { customer } = this.props;
    const { isAdjustmentOptionsVisible, showAccountEditAlert } = this.state;
    const { accountStatementsCTA, adjustBalanceCTA } = styles;
    const { bottomContainer } = scaffolding;

    return (
      <View style={styles.outerContainer}>
        <View style={{ height: '100%' }}>
          <CenterContent style={{ paddingVertical: 50 }}>
            <KyteText size={10} weight={'Regular'} pallete={'grayBlue'} style={{ paddingVertical: 20 }}>{Strings.SALDO_ATUAL}</KyteText>
            {customer.accountBalance >= 0 ? this.renderAddCredit() : this.renderPayDebit()}
            <TextButton
              size={13}
              color={colors.grayBlue}
              style={adjustBalanceCTA}
              onPress={() => this.openAdjustmentOptions()}
            >
              {Strings.BALANCE_ADJUSTMENT}
            </TextButton>
          </CenterContent>
          <View style={bottomContainer}>
            <ActionButton
              leftIcon={<KyteIcon name={'receipt-complete'} color={colors.secondaryBg} size={20} />}
              onPress={() => this.goToCustomerStatements()}
              style={{ borderColor: colors.primaryDarker }}
              textStyle={accountStatementsCTA}
              cancel
            >
              {Strings.ACCOUNT_STATEMENTS}
            </ActionButton>
          </View>
        </View>
        {isAdjustmentOptionsVisible ? this.renderBalanceAdjustmentOptions() : null}
        {showAccountEditAlert ? this.renderAccountEditAlert() : null}
      </View>
    );
  }
}

const styles = {
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  accountStatementsCTA: [
    // Type.Medium,
    // Type.fontSize(13),
    colorSet(colors.primaryDarker),
  ],
  addCreditsCTAContainer: {
    borderRadius: 4,
    marginTop: 15,
  },
  addCreditsCTAText: [
    Type.Medium,
    Type.fontSize(16),
    colorSet(colors.drawerIcon),
  ],
  adjustBalanceCTA: [
    Type.Medium,
    { paddingTop: 25 },
  ],
  balanceAdjustmentButton: {
    backgroundColor: colors.drawerIcon,
    borderColor: colors.disabledIcon,
    borderWidth: 1,
    marginVertical: 5,
  },
  balanceAdjustmentButtonText: [
    Type.Medium,
    Type.fontSize(13),
    colorSet(colors.primaryDarker),
  ],
};

const mapStateToProps = ({ customers, auth, common }) => ({
  balanceTotals: customers.balanceTotals,
  customer: customers.detail,
  permissions: auth.user.permissions,
  isOnline: common.isOnline,
});
export default connect(mapStateToProps, { checkFeatureIsAllowed })(CustomerAccount);
