import { USER_DETAIL } from '../actions/types';

const INITIAL_STATE = {
  detail: null,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    default:
      return state;
    case USER_DETAIL: {
      return {...state, detail: action.payload};
    }
  }
};
