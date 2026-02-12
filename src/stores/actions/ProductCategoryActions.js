import _ from 'lodash';
import {
  PRODUCT_CATEGORY_FETCH,
  PRODUCT_CATEGORY_GROUP_FETCH,
  PRODUCT_CATEGORY_DETAIL,
  PRODUCT_CATEGORY_SAVE,
  PRODUCT_CATEGORY_CHANGE_QUANTITY,
  PRODUCT_CATEGORY_SELECT,
  PRODUCT_CATEGORY_SELECT_CLEAN,
  PRODUCT_CATEGORY_REORDER,
} from "./types";
import {
  PRODUCT_CATEGORY,
  PRODUCT,
  fetch,
  fetchFilter,
  remove,
  save,
  update,
  fetchByName,
} from '../../repository';
import { kyteApiWebUpdateCategory } from '../../services';
import { startLoading, stopLoading } from './CommonActions';

export const productCategoryFetch = (sort, cb) => {
  const sameSort = { key: 'order', isDesc: false };
  return (dispatch) => {
    fetch(PRODUCT).then((payload) => {
      const categories = _(payload)
        .filter((eachProduct) => !!eachProduct.category)
        .groupBy((eachProduct) => eachProduct.category.id)
        .map((eachProduct) => ({
            id: eachProduct[0].category.id,
            name: eachProduct[0].category.name,
            order: eachProduct[0].category.order,
          }))
        .orderBy(['order'], ['asc'])
        .value();

      dispatch({ type: PRODUCT_CATEGORY_GROUP_FETCH, payload: categories });
      // if (cb) cb(payload[payload.length - 1]);
    });

    fetch(PRODUCT_CATEGORY, { sort: sameSort }).then((payload) => {
      dispatch({ type: PRODUCT_CATEGORY_FETCH, payload });
      if (cb) cb(payload);
    });
  };
};

export const productCategoryFetchByName = (text, sort) => (dispatch) => {
    fetchByName(PRODUCT_CATEGORY, text, { sort }).then((payload) => {
      dispatch({ type: PRODUCT_CATEGORY_FETCH, payload });
    });
  };

export const productCategoryDetailCreate = () => ({ type: PRODUCT_CATEGORY_DETAIL, payload: null });

export const productCategoryDetailUpdate = (productCategory) => ({
  type: PRODUCT_CATEGORY_DETAIL,
  payload: productCategory,
});

export const productCategorySave = (category, callback) => async (dispatch, getState) => {
    let sameCategory = _.clone(category);
    if (!category.id) {
      sameCategory = { ...category, order: getState().productCategory.list.length };
    }

    save(PRODUCT_CATEGORY, sameCategory).then(async (categorySaved) => {
      const { isOnline } = getState().common;

      if (isOnline) {
        dispatch(startLoading());
        try {
          await kyteApiWebUpdateCategory(categorySaved.clone());
        } catch (error) {
          // Keep UX responsive even if the sync request fails
          console.warn('productCategorySave sync error', error);
        } finally {
          dispatch(stopLoading());
        }
      }

      dispatch({ type: PRODUCT_CATEGORY_SAVE });
      if (callback) callback(categorySaved);
    });
  };

export const productCategoryReorder = (categories) => (dispatch, getState) => new Promise((resolve) => {
  categories.forEach(async (category) => {
      dispatch(startLoading());
      await save(PRODUCT_CATEGORY, category).then(async (categorySaved) => { 
        const { isOnline } = getState().common;

        if (isOnline) {
          await kyteApiWebUpdateCategory(categorySaved.clone());
        }
      });
      dispatch(stopLoading());
    });
    dispatch({ type: PRODUCT_CATEGORY_REORDER });
    resolve();
  });

export const productCategorySelectedClean = () => ({ type: PRODUCT_CATEGORY_SELECT_CLEAN });

export const productCategoryRemove = (id, callback) => async (dispatch, getState) => {
  await fetchFilter(PRODUCT, [`category.id = '${id}'`]).then((products) => {
    if (products.length > 0) {
      products.forEach((eachProduct) => {
        update(PRODUCT, eachProduct.id, { ...eachProduct.clone(), category: null });
      });
    }
  });
  const selectedCategory = getState().productCategory.selected;
  if (selectedCategory.id === id) {
    dispatch({ type: PRODUCT_CATEGORY_SELECT_CLEAN });
  }
  await remove(PRODUCT_CATEGORY, id);
  dispatch(productCategoryFetch());
  callback();
};

export const productCategoryChangeQuantity = (id, type) => (dispatch) => {
  fetchFilter(PRODUCT_CATEGORY, [`id = '${id}'`]).then((productCategory) => {
    if (productCategory.length > 0) {
      const newQuantity =
        type === 'increase'
          ? productCategory[0].productQuantity + 1
          : productCategory[0].productQuantity - 1;
      const sameProductCategory = { ...productCategory[0], productQuantity: newQuantity };
      save(PRODUCT_CATEGORY, sameProductCategory);
    }
  });
  dispatch({ type: PRODUCT_CATEGORY_CHANGE_QUANTITY });
};

export const productCategorySelect = (category) => (dispatch) => {
  dispatch({ type: PRODUCT_CATEGORY_SELECT, payload: category });
};
