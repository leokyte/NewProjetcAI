import I18n from '../i18n/i18n';
import { colors } from '../styles';

const {
  pix,
  money,
  debitCard,
  creditCard,
  payChek,
  voucher,
  others,
  customerAccount,
  payLater,
  link,
  payLaterAlternative,
} = I18n.t('paymentMethods');

export const PaymentType = {
  // TYPE numbers (NOT index)
  MONEY: 0,
  DEBIT: 1,
  CREDIT: 2,
  PAYCHECK: 3,
  VOUCHER: 4,
  OTHERS: 5,
  ACCOUNT: 6,
  PAY_LATER: 7,
  LINK: 8,
  PIX: 9,
  items: {
    0: { type: 0, position: 'a', description: money, icon: 'money' },
    1: {
      type: 1,
      position: 'b',
      description: debitCard,
      icon: 'debit-card',
      off: ['mercadoPago'],
    },
    2: {
      type: 2,
      position: 'c',
      description: creditCard,
      icon: 'credit-card',
      off: ['mercadoPago'],
    },
    3: { type: 3, position: 'g', description: payChek, icon: 'pay-check' },
    4: { type: 4, position: 'e', description: voucher, icon: 'voucher', off: ['disabled'] },
    5: { type: 5, position: 'i', description: others, icon: 'others' },
    6: { type: 6, position: 'd', description: customerAccount, icon: 'customer-account' },
    7: {
      type: 7,
      position: 'h',
      description: payLater,
      alternativeDescription: payLaterAlternative,
      receiptDescription: I18n.t('customerAccount.debtCreated'),
      icon: 'arrow-out',
      iconColor: colors.barcodeRed,
      off: ['disabled'],
    },
    8: { type: 8, position: 'f', description: link, icon: 'link', noFill: true }, // new: true
    9: { type: 9, position: 'j', description: pix, icon: 'pix' },
  },
};
