import I18n from '../i18n/i18n';

const { balanceAdjustment, payDebitBalance, balanceUsed, salePayLater, balanceAddCredit } = I18n.t('customerAccount');

export const CustomerAccountMovementReason = {
  items: {
    SALE_CUSTOMER_ACCOUNT: { type: 0, key: 'SALE_CUSTOMER_ACCOUNT', title: balanceUsed },
    SALE_PAY_LATER: { type: 1, key: 'SALE_PAY_LATER', title: salePayLater },
    BALANCE_ADJUSTMENT_IN: { type: 2, key: 'BALANCE_ADJUSTMENT_IN', title: balanceAdjustment },
    BALANCE_ADJUSTMENT_OUT: { type: 3, key: 'BALANCE_ADJUSTMENT_OUT', title: balanceAdjustment },
    PAY_DEBIT: { type: 4, key: 'PAY_DEBIT', title: payDebitBalance },
    ADD_CREDIT: { type: 5, key: 'ADD_CREDIT', title: balanceAddCredit },
    SALE_CANCELLED: { type: 6, key: 'SALE_CANCELLED', title: I18n.t('stockHistoricalFilter.canceledSale') },
  },
};
