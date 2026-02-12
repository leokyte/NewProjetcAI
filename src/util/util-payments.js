import _ from 'lodash';
import { toList, PaymentType } from '../enums';
import I18n from '../i18n/i18n';

export const selectPayments = (mercadoPagoON, blacklist = []) => {
  // Initialize payments
  const payments = toList(PaymentType).filter((item) => {
    const { type, off = [] } = item;

    const conditionals = [
      // take off blacklisted types
      blacklist.indexOf(type) >= 0,

      // take off disabled strategy
      off.indexOf('disabled') >= 0,

      // take off Mercado Pago blocked
      mercadoPagoON && off.indexOf('mercadoPago') >= 0
    ];

    return !conditionals.some(c => c);
  });

  // Mercado Pago only
  if (mercadoPagoON) payments.splice(1, 0, mercadoPagoPayment);

  // return :)
  return _.orderBy(payments, ['position'], ['asc']);
};


const mercadoPagoPayment = {
  type: 'mercadopago',
  description: I18n.t('paymentMethods.creditOrDebitCard'),
  icon: 'mercadopago',
  doubleSized: true,
  noFill: true
};

export const paymentsGenericTypes = (payments) => {
  const type = payments.length > 1 ? 'split' : payments[0]?.type;

  switch (type) {
    case 0: return 'cash';
    case 1: return 'debit_card';
    case 2: return 'credit_card';
    case 3: return 'pay_check';
    case 4: return 'voucher';
    case 5: return 'others';
    case 6: return 'customer_account';
    case 7: return 'pay_later';
    case 9: return 'pix';
    case 'split': return 'split';
    default: return '';
  }
};

export const paymentsTypesEvents = (payments) => {
  const types = payments.map(type => {
    switch (type) {
      case 0: return 'cash';
      case 1: return 'debit_card';
      case 2: return 'credit_card';
      case 3: return 'pay_check';
      case 4: return 'voucher';
      case 5: return 'others';
      case 6: return 'customer_account';
      case 7: return 'pay_later';
      case 9: return 'pix';
      default: return '';
    }
  })
  return types;
};
