import { destroy } from 'redux-form';
import { USER_DETAIL } from './types';

export const userUpdateDetail = (user) => ({
  type: USER_DETAIL,
  payload: user,
});

export const cleanUserForm = () => (dispatch) => {
  return new Promise((resolve) => {
    dispatch(destroy('UserForm'));
    resolve();
  });
};
