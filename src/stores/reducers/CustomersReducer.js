import {
  CUSTOMERS_FETCH,
  CUSTOMERS_FETCH_STATEMENTS,
  CUSTOMER_DETAIL,
  CUSTOMERS_CLEAR,
  CUSTOMERS_GET_CONTACTS,
  CUSTOMERS_SELECT_CONTACT,
  CUSTOMERS_SELECT_ALL_CONTACTS,
  CUSTOMERS_CLEAN_CONTACTS,
  CUSTOMER_MANAGE_NEW_BALANCE,
  CUSTOMER_MANAGE_ACTUAL_BALANCE,
  CUSTOMER_ACCOUNT_EDIT_BALANCE,
  CUSTOMER_ACCOUNT_EDIT_PAYMENT,
  CUSTOMER_ACCOUNT_GET_STATEMENTS,
  CUSTOMER_ACCOUNT_RESET_BALANCE,
  CUSTOMER_ACCOUNT_UPDATE_BALANCE,
  CUSTOMERS_ACCOUNT_GENERAL_FILTER_SET,
  CUSTOMERS_ACCOUNT_GENERAL_FILTER_CLEAR,
  CUSTOMERS_ACCOUNT_FILTER_SET,
  CUSTOMERS_ACCOUNT_FILTER_CLEAR,
  CUSTOMERS_FILTER_TABS_SET,
  CUSTOMERS_SET_BALANCE_TOTALS,
  CUSTOMER_DETAIL_SET_LOADING,
} from '../actions/types';
import { Period } from '../../enums';

const accountFilter = {
  type: '',
  status: [],
  search: null,
  period: Period.LAST_30_DAYS,
  days: { start: '', end: '' },
  transactionType: { debit: false, credit: false },
  selectedSellers: [], // { uid: '', displayName: '', email: '' }
};

const INITIAL_STATE = {
  list: [],
  statements: [],
  allStatemetnsLoading: true,
  detail: {},
  detailOrigin: null,
  contacts: [],
  balanceTotals: {
    debit: 0,
    credit: 0
  },
  accountFilterGeneral: {
    type: '',
    status: [],
    search: null,
    period: Period.LAST_30_DAYS,
    days: { start: '', end: '' },
    transactionType: { debit: false, credit: false },
    selectedSellers: [] // { uid: '', displayName: '', email: '' }
  },
  accountFilter,
  accountFilterInitial: accountFilter,
  filterTabs: { debit: false, credit: false, firstPurchase: false }
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CUSTOMERS_FETCH: {
      return { ...state, list: action.payload };
    }
    case CUSTOMERS_FETCH_STATEMENTS: {
      return { ...state, statements: action.payload, allStatemetnsLoading: false };
    }
    case CUSTOMERS_CLEAR: {
      return { ...INITIAL_STATE, detail: state.detail };
    }
    case CUSTOMER_DETAIL: {
      const customer = action.payload.customer;
      const manageCustomerAccount = {
        actualBalance: customer ? customer.accountBalance : 0,
        transactionBalance: 0,
        newBalance: 0,
        paymentType: '',
      };

      return {
        ...state,
        detail: {
          ...customer,
          manageCustomerAccount,
          accountStatements: [],
          statementsLoading: true
        },
        detailOrigin: action.payload.detailOrigin,
      };
    }
    case CUSTOMER_DETAIL_SET_LOADING: {
      return { ...state, detail: { ...state.detail, statementsLoading: action.payload } };
    }
    case CUSTOMER_MANAGE_NEW_BALANCE: {
      // types: 'add' (adiciona crédito) | 'remove'(adiciona débito)
      // value: valor a ser creditado/debitado

      const { type, value } = action.payload;
      const { manageCustomerAccount } = state.detail;
      const actualBalance = manageCustomerAccount.actualBalance;
      const add = type === 'add';

      return {
        ...state,
        detail: {
          ...state.detail,
          manageCustomerAccount: {
            actualBalance,
            transactionBalance: add ? (+value) : (-value),
            newBalance: add ? (actualBalance + value) : (actualBalance - value),
            paymentType: '',
          },
        },
      };
    }
    case CUSTOMER_MANAGE_ACTUAL_BALANCE: {
      const { type, value } = action.payload;
      const { manageCustomerAccount } = state.detail;
      const actualBalance = manageCustomerAccount.actualBalance;
      const add = type === 'add';

      // diff é calculado apenas no type 'remove' (débito ao cliente)
      const calculateDiff = () => {
        const negativeBalance = actualBalance < 0;
        const diff = (actualBalance + Math.abs(value));
        if (negativeBalance) return (Math.abs(actualBalance) - value);
        return (-diff);
      };

      return {
        ...state,
        detail: {
          ...state.detail,
          manageCustomerAccount: {
            actualBalance,
            transactionBalance: add ? (value - actualBalance) : calculateDiff(),
            newBalance: add ? (+value) : (-value),
            paymentType: ''
          }
        }
      };
    }
    case CUSTOMER_ACCOUNT_EDIT_BALANCE: {
      const manageCustomerAccount = {
        actualBalance: action.payload.accountBalance,
        transactionBalance: 0,
        newBalance: 0,
        paymentType: ''
      };

      return {
        ...state,
        detail: {
          ...action.payload,
          statementsLoading: false,
          manageCustomerAccount,
        }
      };
    }
    case CUSTOMER_ACCOUNT_EDIT_PAYMENT: {
      return {
        ...state,
        detail: {
          ...state.detail,
          manageCustomerAccount: {
            ...state.detail.manageCustomerAccount,
            paymentType: action.payload
          }
        }
      };
    }
    case CUSTOMER_ACCOUNT_RESET_BALANCE: {
      const manageCustomerAccount = {
        actualBalance: action.payload,
        transactionBalance: 0,
        newBalance: 0,
        paymentType: ''
      };

      return {
        ...state,
        detail: {
          ...state.detail,
          manageCustomerAccount
        }
      };
    }
    case CUSTOMER_ACCOUNT_UPDATE_BALANCE: {
      return {
        ...state,
        detail: {
          ...state.detail,
          accountBalance: action.payload
        }
      };
    }
    case CUSTOMER_ACCOUNT_GET_STATEMENTS: {
      return { ...state, detail: { ...state.detail, accountStatements: action.payload, statementsLoading: false } };
    }
    case CUSTOMERS_GET_CONTACTS: {
      return { ...state, contacts: action.payload };
    }
    case CUSTOMERS_SELECT_CONTACT: {
      const finalContacts = state.contacts.map((eachContact) => {
        let contact = eachContact;
        if (eachContact.id === action.payload.id) {
          contact = { ...eachContact, selected: !eachContact.selected };
        }
        return contact;
      });
      return { ...state, contacts: finalContacts };
    }

    case CUSTOMERS_SELECT_ALL_CONTACTS: {
      return { ...state, contacts: action.payload };
    }
    case CUSTOMERS_CLEAN_CONTACTS: {
      return { ...state, contacts: [] };
    }

    case CUSTOMERS_ACCOUNT_GENERAL_FILTER_SET: {
      const { property, value } = action.payload;
      return { ...state, accountFilterGeneral: { ...state.accountFilterGeneral, [property]: value } };
    }
    case CUSTOMERS_ACCOUNT_GENERAL_FILTER_CLEAR: {
      return { ...state, accountFilterGeneral: INITIAL_STATE.accountFilterGeneral };
    }

    case CUSTOMERS_ACCOUNT_FILTER_SET: {
      const { property, value } = action.payload;
      return { ...state, accountFilter: { ...state.accountFilter, [property]: value } };
    }
    case CUSTOMERS_ACCOUNT_FILTER_CLEAR: {
      return { ...state, accountFilter: INITIAL_STATE.accountFilter };
    }

    case CUSTOMERS_FILTER_TABS_SET: {
      return { ...state, filterTabs: action.payload };
    }

    case CUSTOMERS_SET_BALANCE_TOTALS: {
      return { ...state, balanceTotals: action.payload };
    }

    default:
      return state;
  }
};
