import { TAXES_FETCH, ACCOUNT_TAX_SAVE } from '../actions/types';

const INITIAL_STATE = [];

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TAXES_FETCH: {
        return action.payload;
    }
    case ACCOUNT_TAX_SAVE: {
      return [action.payload];
    }
    default:
        return state;
    }
};
