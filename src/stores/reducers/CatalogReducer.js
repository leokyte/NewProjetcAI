import {
  SET_CATALOG_COLOR,
  SET_INPUT_ERROR_COLOR
} from '../actions/types';

const INITIAL_STATE = {
  color: '',
  inputError: false,
};

export default (state = INITIAL_STATE, action) => {
  const { payload } = action;
  switch (action.type) {
    case SET_CATALOG_COLOR: {
      return { ...state, color: payload };
    }
    case SET_INPUT_ERROR_COLOR: {
      return { ...state, inputError: payload };
    }
    default:
      return state;
  }
};
