import {
  SET_FORM,
  RESET_FORM,
} from '../actions/types';

const INITIAL_STATE = { };

export default (state = INITIAL_STATE, action) => {
  const { formName, payload } = action;
  switch (action.type) {
    case SET_FORM: {
      return { ...state, [formName]: payload };
    }
    case RESET_FORM: {
      delete state[formName];
      return state;
    }
    default:
      return state;
  }
};
