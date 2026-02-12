import React from 'react';
import { connect } from 'react-redux';
import { View, Switch } from 'react-native';
import { KyteSwitch } from '@kyteapp/kyte-ui-components';
import { DetailPage, SwitchContainer, ActionButton, KyteIcon, KyteText } from '../../common';
import CustomerImage from '../../customers/image/CustomerImage';
import { logEvent } from '../../../integrations';
import { customerSave, currentSaleAddCustomer, customerFetchById, customerManageNewBalance, currentSaleAddPayment, customerDetailUpdate } from '../../../stores/actions';
import { generateTestID } from '../../../util';
import { PaymentType } from '../../../enums';
import { Type, colorSet, colors } from '../../../styles';
import I18n from '../../../i18n/i18n';

const Strings = {
  PAGE_TITLE: I18n.t('customerAccount.allowPayLater'),
  SWITCH_LABEL: I18n.t('customerAccount.allowPayLaterBuy'),
  PAGE_INFO: I18n.t('customerAccount.allowPayLaterPageInfo'),
  SWITCH_TRUE_WARNING_1: I18n.t('customerAccount.allowPayLaterSwitchText1'),
  SWITCH_TRUE_WARNING_2: I18n.t('customerAccount.allowPayLaterSwitchText2'),
  SWITCH_TRUE_WARNING_3: I18n.t('customerAccount.allowPayLaterSwitchText3'),
};

class AllowPayLater extends React.Component {
  constructor(props) {
    super(props);

    const { params } = props.route;
    this.state = {
      customer: params.customer,
      allowPayLater: params.customer.allowPayLater,
    };
  }

  goToCustomerBalance(customer) {
    const { navigate } = this.props.navigation;
    const { params = {} } = this.props.route;
    const {useSplit} = params;
    const {payment} = params;
    const { customerDetail } = this.props;
    const { totalNet, paymentRemaining, payments } = this.props.currentSale;
    const chargedValue = useSplit ? paymentRemaining : totalNet;
    const acountPayment = PaymentType.items[PaymentType.ACCOUNT];
    const hasAccountPayment = payments.find(p => p.type === acountPayment.type);


    this.props.customerFetchById(customer.id);
    if (hasAccountPayment) this.props.customerDetailUpdate({ ...customerDetail, accountBalance: 0 });
    this.props.customerManageNewBalance('remove', chargedValue);

    navigate({
      key: 'CustomerAccountBalancePage',
      name: 'CustomerSaleAccountBalance',
      params: { useSplit, payment, useRemaining: useSplit, split: useSplit },
    });
  }

  save() {
    const { params } = this.props.route;
    const { customer, allowPayLater } = this.state;
    const { totalNet } = this.props.currentSale;
    const payment = params && params.payment;
    const useSplit = params && params.useSplit;

    this.props.customerSave(
      { id: customer.id, allowPayLater },
      () => {
        this.props.currentSaleAddCustomer({ ...customer, allowPayLater });
        if (payment && !useSplit) this.props.currentSaleAddPayment(payment.type, payment.description, totalNet);
        this.goToCustomerBalance(customer);

        // Tracking events
        logEvent('Allow Customer Paylater', { allowPayLater, customerName: customer.name, customerId: customer.id });
      }
    );
  }

  renderCustomerInfo() {
    const { customer } = this.state;
    const imageSize = 85;

    const renderCustomerAvatar = () => (
      <View style={{ marginBottom: 25 }}>
        <CustomerImage customer={customer} style={{ height: imageSize, width: imageSize, borderRadius: 50 }} />
      </View>
    );

    const renderCustomerLabel = () => (
      <View style={styles.customerCircle}>
        <KyteText color="#FFF" weight="Medium" size={28} uppercase style={{ lineHeight: 28 }}>{customer.name.substr(0, 2)}</KyteText>
      </View>
    );

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25 }}>
        {customer.image ? renderCustomerAvatar() : renderCustomerLabel()}
        <KyteText weight="Semibold" size={22} style={{ textAlign: 'center' }} {...generateTestID('cust-name-plcc')}>
          {customer.name}
        </KyteText>
        <KyteText size={16} style={{ textAlign: 'center', lineHeight: 20, paddingHorizontal: 20, marginTop: 20 }}>
          {Strings.PAGE_INFO}
        </KyteText>
      </View>
    );
  }

  renderPayLatterSwitch() {
    const { allowPayLater } = this.state;

    const switchPayLater = () => this.setState({ allowPayLater: !allowPayLater });

    const renderWarning = () => (
      <View style={{ position: 'absolute', right: 0, left: 0, top: -55, paddingHorizontal: 40 }}>
        <KyteText style={{ textAlign: 'center', color: '#808C9E', lineHeight: 18 }} size={14}>
          {Strings.SWITCH_TRUE_WARNING_1}
          <KyteText weight="Semibold" style={{ color: '#808C9E' }}>
            {Strings.SWITCH_TRUE_WARNING_2}
          </KyteText>
          {Strings.SWITCH_TRUE_WARNING_3}
        </KyteText>
      </View>
    );

    return (
      <View style={{ paddingHorizontal: 15 }}>
        <SwitchContainer
          title={Strings.SWITCH_LABEL}
          onPress={() => switchPayLater()}
          style={{ paddingHorizontal: 0, borderBottomWidth: 0 }}
          titleStyle={[Type.fontSize(16), Type.SemiBold, colorSet(colors.secondaryBg)]}
          testProps={generateTestID('allow-option-plcc')}
        >
          <KyteSwitch
            onValueChange={() => switchPayLater()}
            active={allowPayLater}
          />
        </SwitchContainer>
        {allowPayLater ? renderWarning() : null}
      </View>
    );
  }

  renderActionButton() {
    const { allowPayLater, customer } = this.state;
    const disabled = allowPayLater === customer.allowPayLater;

    return (
      <View style={{ paddingVertical: 10 }}>
        <ActionButton
          onPress={() => this.save()}
          disabled={disabled}
          rightIcon={<KyteIcon name='arrow-cart' color={disabled ? colors.actionColor : 'white'} size={15} />}
          noDisabledAlert
          testProps={generateTestID('next-plcc')}
        >
          {I18n.t('words.s.proceed')}
        </ActionButton>
      </View>
    );
  }

  render() {
    const { navigation } = this.props;
    return (
      <DetailPage
        pageTitle={Strings.PAGE_TITLE}
        goBack={navigation.goBack}
      >
        {this.renderCustomerInfo()}
        {this.renderPayLatterSwitch()}
        {this.renderActionButton()}
      </DetailPage>
    );
  }
}

const styles = {
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
};

const mapStateToProps = ({ currentSale, customers }) => ({ currentSale, customerDetail: customers.detail });

export default connect(mapStateToProps, { customerSave, currentSaleAddCustomer, customerFetchById, customerManageNewBalance, currentSaleAddPayment, customerDetailUpdate })(AllowPayLater);
