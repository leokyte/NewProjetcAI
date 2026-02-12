import { LAST_SALE_SET, LOGOUT, CLEAR_LAST_SALE } from '../actions/types';

const INITIAL_STATE = {
  totalNet: 0,
  totalGross: 0,
  totalPay: 0,
  payBack: 0,
  totalSplit: 0,
  paymentRemaining: 0,
  discountValue: 0,
  discountPercent: 0,
  discountType: null,
  taxes: [],
  items: [],
  totalItems: 0,
  totalProfit: 0,
  totalTaxes: 0,
  useSaleTaxes: true,
  payments: [],
  observation: '',
  showObservationInReceipt: true,
  description: '',
  did: '',
  statusInfo: {},
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case LAST_SALE_SET: {
            return action.payload;
        }
        case LOGOUT: case CLEAR_LAST_SALE: {
          return INITIAL_STATE;
        }
        default:
            return state;
    }
};
