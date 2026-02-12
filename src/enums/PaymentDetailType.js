import I18n from '../i18n/i18n';

export const PaymentDetailType = {
  SALES: 0,
  CREDIT_ADDED: 1,
  DEBIT_PAYMENT: 2,
  items: {
    0: { type: 0, description: I18n.t('customerTabSalesLabel'), key: 'SALES' },
    1: { type: 1, description: I18n.t('customerAccount.paymentIn'), key: 'ADD_CREDIT' },
    2: { type: 2, description: I18n.t('customerAccount.payDebitBalance'), key: 'PAY_DEBIT' },
  },
};
