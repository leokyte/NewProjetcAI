import {
  PRODUCT_CATEGORY_FETCH,
  PRODUCT_CATEGORY_GROUP_FETCH,
  PRODUCT_CATEGORY_CLEAR,
  PRODUCT_CATEGORY_DETAIL,
  PRODUCT_CATEGORY_SELECT,
  PRODUCT_CATEGORY_SELECT_CLEAN,
  LOGOUT
} from '../actions/types';

const INITIAL_STATE = {
  list: [],
  selected: { name: 'TUDO', id: null },
  detail: null,
  categoriesGroupResult: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case PRODUCT_CATEGORY_FETCH: {
      return { ...state, list: action.payload };
    }
    case PRODUCT_CATEGORY_GROUP_FETCH: {
      return { ...state, categoriesGroupResult: action.payload };
    }
    case PRODUCT_CATEGORY_CLEAR: case LOGOUT: {
      return { ...INITIAL_STATE };
    }
    case PRODUCT_CATEGORY_DETAIL: {
      return { ...state, detail: action.payload, };
    }
    case PRODUCT_CATEGORY_SELECT: {
      return { ...state, selected: action.payload };
    }
    case PRODUCT_CATEGORY_SELECT_CLEAN: {
      return { ...state, selected: INITIAL_STATE.selected };
    }
    default:
      return state;
  }
};
