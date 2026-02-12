import {
  ACCOUNT_STORE_SAVE,
  STORE_FETCH,
  STORE_SAVE,
} from './types';
import { fetchOneByUID, save, STORE } from './../../repository';
import { kyteFBEUninstallIntegration, kyteTikTokUninstallIntegration, kyteTikTokInstallIntegration } from "../../services";


export const storeFetch = () => {
  return (dispatch) => {
    fetchOneByUID(STORE).then((payload) => {
      dispatch({ type: STORE_FETCH, payload });
    });
  };
};


export const storeSave = (store, cb) => {
  return (dispatch) => {
    save(STORE, store).then(storePersisted => {
      dispatch({ type: STORE_SAVE });
      dispatch({ type: STORE_FETCH, payload: storePersisted });
      if (cb) cb();
    });
  };
};

export const facebookFBEUninstall = (successCallback, errorCallback) => async (dispatch, getState) => {
  const { store, aid } = getState().auth;
  try {
    await kyteFBEUninstallIntegration(aid);
    let integrations = store.integrations || [];
    const fbeIndex = integrations.findIndex(i => i.name === 'fbe');
    if (fbeIndex >= 0) {
      integrations[fbeIndex] = {
        ...integrations[fbeIndex],
        active: false,
      };
      dispatch(updateIntegrations(integrations));
      successCallback();
    }
  } catch (ex) {
    errorCallback();
  }
};

export const tikTokInstall = (auth_code) => async (dispatch, getState) => {
  const { aid } = getState().auth;

  try {
    await kyteTikTokInstallIntegration(aid, auth_code);
  } catch (ex) {
    console.log("##### error:", ex);
  }
};

export const tikTokUninstall = (successCallback, errorCallback) => async (dispatch, getState) => {
  const { store, aid } = getState().auth;

  try {
    await kyteTikTokUninstallIntegration(aid);
    let integrations = store.integrations || [];
    const tikTokIndex = integrations.findIndex(i => i.name === 'tiktok');
    if (tikTokIndex >= 0) {
      integrations[tikTokIndex] = {
        ...integrations[tikTokIndex],
        active: false,
        payload: null,
        value: null,
      };
      dispatch(updateIntegrations(integrations));
      successCallback();
    }
  } catch (ex) {
    errorCallback();
  }
};

export const updateIntegrations = (integrations) => (dispatch, getState) => {
  const { store } = getState().auth;
  dispatch({ type: ACCOUNT_STORE_SAVE, payload: { ...store, integrations } });
};
