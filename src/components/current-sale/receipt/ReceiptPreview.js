import React, { Component } from 'react';
import { View, Text, Platform } from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment/min/moment-with-locales';
import _ from 'lodash';
import { Icon } from 'react-native-elements';
import * as RNLocalize from 'react-native-localize';

import { Margin, Container } from '@kyteapp/kyte-ui-components';
import { renderProductVariationsName } from '@kyteapp/kyte-utils';
import { CurrencyText, KyteIcon, KyteText } from '../../common';
import { colors, Type, colorSet } from '../../../styles';
import I18n from '../../../i18n/i18n';
import { currencyFormat, getImagePath, receiptTaxesLabel, generateTestID, renderShippingValue } from '../../../util';
import LeftAlignedImage from '../../common/LeftAlignedImage';
import { PaymentType } from '../../../enums';
import { DiscountCouponTag } from '../../coupons/DiscountCouponTag';

const Strings = {
  BALANCE_LABEL: I18n.t('words.s.balance'),
  NEGATIVE_BALANCE: I18n.t('customerAccount.negativeBalanceInfo'),
  COUPON: I18n.t('coupons.coupon'),
  FREE_PRICE_LABEL: I18n.t("plansAndPrices.freeLabel"),
};

class ReceiptPreview extends Component {
  constructor(props) {
    super(props);

    const { sale } = props;
    const { customer } = sale;
    const hasCustomerAccountPayment = _.find(sale.payments, payment => payment.type === PaymentType.items[PaymentType.ACCOUNT].type);
    const isInvoice = hasCustomerAccountPayment && customer.accountBalance < 0;
    const isOnlyPayLaterPayment = sale.payments.length === 1 && sale.payments?.[0]?.type === PaymentType.PAY_LATER;
    const hasPayLaterPayment = sale.payments.length > 0 ? sale.payments.find(p => p.type === PaymentType.PAY_LATER) : false;

    this.state = {
      isInvoice,
      isOnlyPayLaterPayment,
      hasPayLaterPayment,
    };
  }

  UNSAFE_componentWillMount() {
    const locales = RNLocalize.getLocales();
    moment.locale(locales[0].languageTag);
  }

  renderSaleItems() {
    const { items } = this.props.sale;
    const { listItem, nameContainer, primaryText, secondaryText, borderItem, valueContainer } = styles;
    return items.map((item, i) => {
      const hasProduct = item.product;
      const itemName = hasProduct ? item.product.name : item.description || `(${I18n.t('words.s.noDescr')})`;
      const isFractioned = hasProduct && item.product.isFractioned;

      const originalUnitValue = hasProduct && item.product.originalUnitValue;
      const hasDifferentUnitValue = hasProduct && originalUnitValue !== item.product.unitValue;
      const hasPromotionalValue = originalUnitValue && hasDifferentUnitValue;
      const productValue = hasProduct ? item.product.unitValue : item.unitValue;
      const lineThrough = { textDecorationLine: 'line-through' };
      const shouldShowOldValue = hasPromotionalValue && originalUnitValue > item.unitValue;
      const shouldShowUnitPrice = hasProduct && (shouldShowOldValue || item.amount > 1 || isFractioned);
      const hasVariations = item?.product?.variations?.length > 0;


      const itemQuantity = () => {
        if (item.product) {
          return item.product.isFractioned ? `${item.fraction.toFixed(3)}` : `${item.amount}`;
        }
        return item.amount;
      };

      const grossValue = () => (
          <Text>
            <CurrencyText
              style={[Type.Regular, colorSet(colors.grayBlue), lineThrough]}
              value={item.grossValue}
            />
            <Text style={[Type.Regular, colorSet(colors.errorColor)]}>
              {item?.discount?.discountPercent > 0 ? ` (-${item.discount.discountPercent}%)` : ''}
            </Text>
          </Text>
        );

      const unitPrice = (oldValue, newValue) => (
          <KyteText marginTop={5} pallete="grayBlue" size={13}>
            {shouldShowOldValue ? <CurrencyText style={lineThrough} value={oldValue} /> : null}
            {' '}
            <CurrencyText value={newValue} />
          </KyteText>
      );

      return (
        <View key={i} style={[listItem, borderItem]}>
          <Text style={secondaryText} {...generateTestID(`${i}-qty-item-sr`)}>{`${itemQuantity()}x`}</Text>
          <View style={nameContainer}>
            <Text style={primaryText} {...generateTestID(`${i}-item-name-sr`)}>{itemName}</Text>
            {hasVariations && (
              <Margin top={6}>
                <KyteText color={colors.tipColor} size={11}>{renderProductVariationsName(item.product)}</KyteText>
              </Margin>
            )}
            {
              shouldShowUnitPrice ?
              unitPrice(hasPromotionalValue ? originalUnitValue : productValue, item.unitValue)
              : null
            }
            
             
          </View>
          <View style={valueContainer}>
            <KyteText {...generateTestID(`${i}-unit-price-sr`)}>
              <CurrencyText style={secondaryText} value={item.value}/>
            </KyteText>
            <KyteText {...generateTestID(`${i}-discount-price-sr`)}>
              {item.grossValue && item.grossValue !== item.value ? grossValue(item) : null}
            </KyteText>
          </View>
        </View>
      );
    });
  }

  renderPayments() {
    const { payments, payBack } = this.props.sale;
    const { secondaryText, cartInfo, changeText } = styles;
    const { currency, decimalCurrency } = this.props;

    const getPayments = () => {
      const paymentItems = payments.map((payment, i) => {
        const maskedValue = currencyFormat(payment.totalPaid || payment.total, currency, decimalCurrency); // preventing break of old version
        const description = payment.receiptDescription || payment.description;
        return <Text style={[secondaryText, { paddingBottom: 5 }]} key={i} {...generateTestID(`${i+1}-pay-sr`)}>{`${description}: ${maskedValue}`}</Text>;
      });
      return paymentItems;
    };

    const getChange = () => {
      const maskedChange = currencyFormat(payBack, currency, decimalCurrency);
      return <Text style={[changeText, { paddingBottom: 5 }]}>{I18n.t('words.s.change')}: {maskedChange}</Text>;
    };

    return (
      <View style={[cartInfo, { alignItems: 'flex-end' }]}>
        {payments.length > 0 ? getPayments() : null}
        {payBack > 0 ? getChange() : null}
      </View>
    );
  }

  renderCouponDiscount() {
    const { appliedCoupon, totalCouponDiscount } = this.props.sale;

    return (
      <View style={styles.cartInfo}>
        <Text style={[Type.Regular, colorSet(colors.errorColor)]}>
          {`${Strings.COUPON} (${appliedCoupon?.code || appliedCoupon.name}): -`}
            <CurrencyText
              style={[Type.Regular, colorSet(colors.errorColor)]}
              value={totalCouponDiscount}
            />
        </Text>
      </View>
    )
  }

  renderDiscount() {
    const { discountValue, discountPercent } = this.props.sale;
    const { cartInfo, paymentInfoText } = styles;
    return (
      <View style={cartInfo}>
        <Text style={paymentInfoText(colors.errorColor)} {...generateTestID('discount-sr')}>
          {`${I18n.t('words.s.discount')}: `}
          {`(${discountPercent}%) `}
          <CurrencyText value={discountValue} />
        </Text>
      </View>

    );
  }

  renderTotalGross() {
    const { totalGross } = this.props.sale;
    const { cartInfo, paymentInfoText } = styles;
    return (
      <View style={cartInfo}>
        <Text style={paymentInfoText()} {...generateTestID('subtotal-sr')}>
          {`${I18n.t('words.s.subtotal')}: `}
          <CurrencyText value={totalGross} />
        </Text>
      </View>
    );
  }

  renderTotalTaxes(isVAT) {
    const { totalTaxes, taxes } = this.props.sale;
    const { cartInfo, paymentInfoText } = styles;
    const tax = taxes[0];

    const renderInfoIcon = () => (<Icon color={colors.inputBorderColor} size={19} name='info-outline' containerStyle={{ paddingRight: 5 }} />);

    return (
      <View style={[cartInfo, { paddingTop: isVAT ? 8 : 0, flexDirection: 'row' }]}>
        {isVAT ? renderInfoIcon() : null}
        <Text style={paymentInfoText()} {...generateTestID('sale-tax-sr')}>
          {receiptTaxesLabel(tax)}
          <CurrencyText value={totalTaxes} />
        </Text>
      </View>
    );
  }

  renderShippingFee() {
    const { shippingFee, shippingCouponDiscount, appliedCoupon } = this.props.sale;

    return (
      <View style={styles.cartInfo}>
        <Text style={styles.paymentInfoText()} {...generateTestID('delivery-sr')}>
          {`${I18n.t('catalogOrderDelivery')} (${shippingFee.name}): `}
          {renderShippingValue({
            shippingFee: shippingFee?.value,
            shippingCouponDiscount,
            renderCurrency: (value) =>  <CurrencyText value={value} /> 
          })}
        </Text>
        {!!shippingCouponDiscount && (
          <Container marginTop={8} flexDirection="row" alignItems="center" justify="center">
            <Text style={styles.paymentInfoText()}>
              {`${I18n.t('coupons.coupon')}: `}
            </Text>
            <DiscountCouponTag title={appliedCoupon?.code || appliedCoupon?.name} />
          </Container>
        )}
      </View>
    );
  }

  renderLogo() {
    const { companyLogo } = this.props;
    const { imageURL } = this.props.store;
    const receiptImg = companyLogo || imageURL;

    return (
      <View style={styles.logoContainer}>
        <LeftAlignedImage width={120} height={60} source={{ uri: getImagePath(receiptImg) }} />
      </View>
    );
  }

  renderLogoName() {
    const { store } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <KyteText pallete="secondaryBg" weight="Semibold" size={18}>{store.name}</KyteText>
      </View>
    );
  }

  renderTotalSaleItems() {
    const { items } = this.props.sale;
    const itemsCount = items.length;
    const itemsQuantity = _.sum(items.map((item) => {
      if (item.product) {
        return (item.product.isFractioned) ? 1 : item.amount;
      }
      return item.amount;
    }));
    return `${itemsCount} ${(itemsCount > 1 ? I18n.t('words.p.item') : I18n.t('words.s.item'))} (${I18n.t('words.s.qty')}: ${itemsQuantity})`;
  }

  renderObservation() {
    const { observation } = this.props.sale;
    const defaultStyle = {
      ...Type.SemiBold,
      color: colors.secondaryBg
    };
    return (
      <View style={styles.observationView}>
        <Text style={[defaultStyle, { fontSize: 12, lineHeight: 17 }]}>{observation}</Text>
      </View>
    );
  }

  renderReceiptHeader() {
    const { store, storeEditing, companyLogo, sale } = this.props;
    const { isInvoice, isOnlyPayLaterPayment } = this.state;
    const { image } = storeEditing || store || {};
    const receiptImg = companyLogo || image;
    const isIos = Platform.OS === 'ios';
    const iconSize = 17;
    const iconStyle = { paddingTop: isIos ? 0 : 7, marginRight: 5 };

    const receiptType = () => {
      if (sale.status === 'closed') {
        return <Text style={styles.headerNumber}>{isInvoice ? I18n.t('words.s.invoice').toUpperCase() : I18n.t('words.s.receipt').toUpperCase()}</Text>;
      }
      return null;
    };

    const renderSaleNumber = () => {
      const { multiUsers } = this.props;
      if (multiUsers && multiUsers.length > 1) {
        return (`#${sale.did || 0}-${sale.number}`);
      }
      return (`#${sale.number}`);
    };

    const renderTitle = () => (
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <View style={{ flexDirection: 'row' }}>
          {!isOnlyPayLaterPayment ? receiptType() : null}
          <Text style={styles.headerNumber} {...generateTestID('number-sr')}>{renderSaleNumber()}</Text>
        </View>
      </View>
    );

    return (
      <View style={{ flexDirection: 'row' }}>
        {receiptImg ? this.renderLogo() : this.renderLogoName()}
        {renderTitle()}
      </View>
    );
  }

  renderStoreCustomerInfo() {
    const { hasPayLaterPayment } = this.state;
    const { sale, storeLabel, customerLabel, storeEditing, companyLogo } = this.props;
    const store = this.props.storeEditing || this.props.store;
    const { image } = storeEditing || store || {};
    const receiptImg = companyLogo || image;
    const { customer, payments } = sale;
    const accountPaymentType = PaymentType.items[PaymentType.ACCOUNT].type;
    const lineHeight = 17;
    const fontSize = 12;

    const renderStoreInfo = () => (
      <View style={[styles.headerColumn, customer ? { paddingRight: 10 } : null]}>
        {receiptImg ? <Text style={{ ...styles.storeInfoTitle, lineHeight }}{...generateTestID('store-sr')}>{store.name}</Text> : null}
        {storeLabel ? <Text style={{ ...styles.secondaryText, lineHeight, fontSize }} {...generateTestID('adress-sr')}>{storeLabel}</Text> : null}
      </View>
    );

    const renderCustomerAccountBalance = () => {
      const checkCustomerNameLength = customer?.name?.length > 25 ? '\n' : ''
      return (
        <Text style={{ ...styles.customerAccountBalance, lineHeight }}>
          {`${Strings.BALANCE_LABEL}:  ${checkCustomerNameLength}`}
          <CurrencyText value={customer.accountBalance} useBalanceSymbol={customer.accountBalance >= 0 ? false : -1} />
        </Text>
      );
    };
    const renderCustomerIcon = () => <KyteIcon name="customer-filled" color={colors.primaryColor} size={12} />;

    const renderCustomerInfo = () => (
      <View style={[styles.headerColumn, store ? { marginTop: 20 } : null]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ ...styles.storeInfoTitle, lineHeight }} numberOfLines={1} {...generateTestID('customer-sr')}>{renderCustomerIcon()}{`  ${customer.name}`}</Text>
          {payments.filter(p => p.type === accountPaymentType).length || hasPayLaterPayment ? renderCustomerAccountBalance() : null}
        </View>
        {customerLabel ? <Text style={{ ...styles.secondaryText, lineHeight, fontSize }} {...generateTestID('cstmr-address-sr')}>{customerLabel}</Text> : null}
      </View>
    );

    return (
      <View style={{ marginTop: 20 }}>
        {store ? renderStoreInfo() : null}
        {customer ? renderCustomerInfo() : null}
      </View>
    );
  }

  renderCustomerAccountNegativeBalance() {
    const { sale } = this.props;
    const { previousAccountBalance } = sale.customer;
    const customerAccountPayment = _.find(sale.payments, payment => payment.type === PaymentType.items[PaymentType.ACCOUNT].type).total;
    const negativeBalance = previousAccountBalance > 0 ? Math.abs(previousAccountBalance) - Math.abs(customerAccountPayment) : customerAccountPayment;
    return (
      <View style={{ backgroundColor: colors.barcodeRed, alignItems: 'center', marginTop: 25, paddingVertical: 6 }}>
        <KyteText weight="Medium" size={10} pallete="drawerIcon">
          {Strings.NEGATIVE_BALANCE}<CurrencyText value={Math.abs(negativeBalance)} />
        </KyteText>
      </View>
    );
  }

  render() {
    const { store, storeEditing, sale } = this.props;
    // const { isInvoice } = this.state;
    const { totalNet, discountValue, dateCreation, customer, totalTaxes, taxes, shippingFee, totalCouponDiscount } = sale;
    const { footerExtra } = storeEditing || store || {};
    // const isOrder = status !== 'closed';
    const tax = taxes.length && taxes[0];
    const saleTax = tax.type === 'sale-tax';
    const productTax = tax.type === 'product-tax';
    const hasPayment = sale.payments.length > 0;

    const {
      container,
      receiptContainer,
      tableHeader,
      tableFooter,
      listItem,
      primaryText,
      secondaryText,
      centeredText,
      paymentInfoContainer,
      totalText,
      cartInfo
    } = styles;

    return (
      <View style={container}>
        <View style={receiptContainer}>
          {this.renderReceiptHeader()}
          {customer || store || storeEditing ? this.renderStoreCustomerInfo() : null}
          {sale.showObservationInReceipt && sale.observation ? this.renderObservation() : null}
          <View style={tableHeader}>
            <View style={[listItem, { height: 'auto' }]}>
              <Text style={primaryText}  {...generateTestID('qty-items-sr')}>
                {this.renderTotalSaleItems()}
              </Text>
            </View>
          </View>
          <View>
            {this.renderSaleItems()}
            <View style={paymentInfoContainer}>
              {discountValue || totalTaxes ? this.renderTotalGross() : null}
              {discountValue ? this.renderDiscount() : null}
              {!!totalCouponDiscount && this.renderCouponDiscount()}
              {totalTaxes && saleTax ? this.renderTotalTaxes() : null}
              {shippingFee ? this.renderShippingFee() : null}
              <View style={{ marginTop: 15, marginBottom: hasPayment ? 15 - cartInfo.marginTop : 0 }}>
                <Text style={totalText}  {...generateTestID('total-sr')}>
                  {`${I18n.t('words.s.total')}: `}
                  <CurrencyText value={totalNet} />
                </Text>
              </View>
              {hasPayment ? this.renderPayments() : null}
              {totalTaxes && productTax ? this.renderTotalTaxes(true) : null}
            </View>
          </View>
        </View>
        <View style={tableFooter(!hasPayment)}>
          {footerExtra ? <Text style={[primaryText, centeredText, { paddingTop: 15 }]}>{footerExtra}</Text> : null}
          <Text style={[secondaryText, centeredText, { paddingTop: 5 }]} {...generateTestID('date-sr')}>{moment(dateCreation).format('LLL')}</Text>
        </View>
      </View>

    );
  }
}

const styles = {
  container: {
    paddingTop: 15,
    paddingBottom: 30
  },
  receiptContainer: {
    paddingHorizontal: 20
  },
  headerContainer: {
    flexDirection: 'row'
  },
  headerNumber: {
    fontFamily: 'Graphik-Semibold',
    color: colors.primaryColor,
    fontSize: 20,
  },
  headerColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  storeInfoTitle: {
    fontFamily: 'Graphik-Semibold',
    color: colors.primaryColor,
    fontSize: 13
  },
  customerAccountBalance: {
    color: colors.secondaryBg,
    fontSize: 13
  },
  logoContainer: {
    width: 120,
    height: 60,
    justifyContent: 'center',
    flex: 1
  },
  companyInfo: [
    Type.Regular,
    Type.fontSize(11),
    colorSet(colors.grayBlue),
    { paddingVertical: 5 }
  ],
  saleStatus: {
    fontFamily: 'Graphik-Semibold',
    color: colors.primaryColor,
    fontSize: 16,
    textAlign: 'right'
  },
  totalText: {
    fontFamily: 'Graphik-Semibold',
    color: colors.primaryColor,
    fontSize: 16,
  },
  tableHeader: {
    marginTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryDarker
  },
  tableFooter: (setMargin) => ({
    marginTop: setMargin ? 25 : 0,
    borderTopWidth: 2,
    borderTopColor: colors.primaryDarker
  }),
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  valueContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginLeft: 3
  },
  listSingle: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    marginTop: 19
  },
  nameContainer: {
    flex: 1,
    marginLeft: 10
  },
  primaryText: {
    fontFamily: 'Graphik-Semibold',
    fontSize: 13,
    color: colors.primaryColor,
  },
  secondaryText: {
    fontFamily: 'Graphik-Regular',
    fontSize: 13,
    color: colors.primaryColor
  },
  paymentInfoText: (color = colors.primaryColor) => ({
      fontFamily: 'Graphik-Regular',
      fontSize: 13,
      color
    }),
  changeText: {
    fontFamily: 'Graphik-Regular',
    fontSize: 13,
    color: colors.primaryColor
  },
  borderItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor
  },
  alignRight: {
    justifyContent: 'flex-end'
  },
  alignCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  separator: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryDarker
  },
  graySeparator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.littleDarkGray,
    marginHorizontal: 20
  },
  cartInfo: {
    marginTop: 5,
    alignItems: 'flex-end'
  },
  paymentInfoContainer: {
    marginVertical: 15,
    alignItems: 'flex-end',
  },
  centeredText: {
    textAlign: 'center'
  },
  RightText: {
    textAlign: 'right'
  },
  observationContainer: {
    paddingVertical: 10
  },
  observationText: [
    Type.Regular,
    Type.fontSize(12),
    colorSet(colors.secondaryBg),
    { lineHeight: 17 }
  ],
  statusContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  customerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  customerInfoContainer: {
    flexDirection: 'row'
  },
  customerName: [
    Type.Medium,
    Type.fontSize(12),
    colorSet(colors.secondaryBg),
    {
      flex: 2,
      alignItems: 'flex-start',
      lineHeight: 13,
      paddingBottom: 5
    }
  ],
  customerPhone: [
    Type.Regular,
    Type.fontSize(12),
    colorSet(colors.secondaryBg),
    { flex: 1, alignItems: 'flex-end', textAlign: 'right', lineHeight: 13 }
  ],
  customerAddress: [
    Type.Regular,
    Type.fontSize(12),
    colorSet(colors.secondaryBg),
    {
      lineHeight: 14,
      paddingVertical: 10
    }
  ],
  observationView: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primaryDarker,
    padding: 10,
    marginTop: 20
  }
};

const mapStateToProps = (state) => {
  const { store, multiUsers } = state.auth;
  const { currency, decimalCurrency } = state.preference.account;

  return { store, currency, decimalCurrency, multiUsers };
};

export default connect(mapStateToProps, null)(ReceiptPreview);
