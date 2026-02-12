import {
  MERCADOPAGO_IS_ACTIVATED,
  MERCADOPAGO_SET_ERROR_DISPLAYED,
  MERCADOPAGO_SET_PROCESSING,
  LOGOUT,
  EXTERNAL_PAYMENTS_ADD_GATEWAY,
  EXTERNAL_PAYMENTS_CLEAR_GATEWAYS,
  EXTERNAL_PAYMENTS_SET_UP,
  EXTERNAL_PAYMENTS_SERVICE_TYPE,
  EXTERNAL_PAYMENTS_COUNTRY_FEES
} from '../actions/types';
import { PaymentGatewayType } from '../../enums';
import { cardGateways, checkoutGateways } from '../../util';

const mercadoPago = {
  key: PaymentGatewayType.items[PaymentGatewayType.MERCADO_PAGO_CARD_READER].type,
  active: 'isActivated',
  isActivated: false,
  errorDisplayed: false,
  processingLastTransaction: false,
};

const INITIAL_STATE = {
  mercadoPago,
  cardReaders: [],
  checkoutGateways: [],
  allGateways: [],
  gatewayServiceType: '',
  countryFees: {}
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    default:
      return state;
    case LOGOUT:
      return { ...INITIAL_STATE };
    case MERCADOPAGO_IS_ACTIVATED:
      return { ...state, mercadoPago: { ...state.mercadoPago, isActivated: action.payload } };
    case MERCADOPAGO_SET_ERROR_DISPLAYED:
      return { ...state, mercadoPago: { ...state.mercadoPago, errorDisplayed: action.payload } };
    case MERCADOPAGO_SET_PROCESSING:
      return { ...state, mercadoPago: { ...state.mercadoPago, processingLastTransaction: action.payload } };
    case EXTERNAL_PAYMENTS_ADD_GATEWAY: {
      const alreadySet = state.checkoutGateways.find(g => g.key === action.payload.key);
      const addGateway = [ ...state.checkoutGateways, { ...action.payload } ];

      return { ...state, checkoutGateways: alreadySet ? state.checkoutGateways : addGateway };
    }
    case EXTERNAL_PAYMENTS_CLEAR_GATEWAYS: {
      return { ...state, checkoutGateways: [] };
    }
    case EXTERNAL_PAYMENTS_SET_UP: {
      const cardReaders = [{ ...mercadoPago, ...state.mercadoPago }];

      return {
        ...state,
        cardReaders,
        allGateways: [
          ...cardGateways(cardReaders),
          ...checkoutGateways(state.checkoutGateways),
        ],
      };
    }
    case EXTERNAL_PAYMENTS_SERVICE_TYPE: {
      return { ...state, gatewayServiceType: action.payload };
    }
    case EXTERNAL_PAYMENTS_COUNTRY_FEES: {
      return { ...state, countryFees: action.payload };
    }
  }
};
