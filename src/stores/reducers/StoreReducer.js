import { STORE_FETCH, STORE_IMAGE_URL, STORE_CLEAR, LOGOUT }
    from '../actions/types';

const INITIAL_STATE = null;

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case STORE_FETCH: {
            return { ...state, ...action.payload };
        }
        case STORE_IMAGE_URL: {
            return { ...state, storeImageUrl: action.payload };
        }
        case STORE_CLEAR: {
          return { ...INITIAL_STATE };
        }
        case LOGOUT: {
          return { ...INITIAL_STATE };
        }
        default:
            return state;
    }
};
