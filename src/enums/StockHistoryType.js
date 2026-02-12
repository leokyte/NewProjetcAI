import I18n from '../i18n/i18n';

const { insert, sale, deduct, canceledSale } = I18n.t('stockHistoricalFilter');


export const StockHistoryType = {
  IN: 0,
  SALE: 1,
  OUT: 2,
  SALE_CANCELLED: 3,
  items: {
    0: { type: 'IN', title: insert, active: false },
    1: { type: 'SALE', title: sale, active: false },
    2: { type: 'OUT', title: deduct, active: false },
    3: { type: 'SALE_CANCELLED', title: canceledSale, active: false }
  }
};
