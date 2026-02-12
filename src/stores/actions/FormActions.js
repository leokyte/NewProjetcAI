import {
  SET_FORM,
  RESET_FORM,
} from './types';

export const set_form = (formName, payload) => (dispatch) => dispatch({
  type: SET_FORM,
  formName,
  payload,
});

export const reset_form = (formName) => (dispatch) => dispatch({
  type: RESET_FORM,
  formName,
});
