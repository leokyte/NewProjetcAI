import { applyMiddleware, createStore, compose } from 'redux';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
import thunk from 'redux-thunk';

import reducers from './stores/reducers';
import { LOGOUT } from './stores/actions/types';
import { internalMiddleware } from './stores/middleware';
let KyteReactotron = null;
if (__DEV__) {
  // Avoid loading Reactotron in release builds to prevent runtime errors when host is unavailable.
  KyteReactotron = require('./ReactotronConfig').default;
}

const persistOptions = {
  blacklist: ['products', 'customers', 'sales', 'form', 'user', 'sync', 'stock', 'lastSale', '_form', 'variants'],
};
const persistCallBack = (store) => {
  setTimeout(() => {
    if (store.getState().auth.isLogged === null) {
      store.dispatch({ type: LOGOUT });
    }
  }, 1200);
};

const configureStore = () => {
  const middlewares = [thunk, internalMiddleware];
  let store = createStore(
    reducers,
    compose(
      applyMiddleware(...middlewares),
      offline({ ...offlineConfig, persistOptions, persistCallback: () => persistCallBack(store) })
    )
  );
  if (__DEV__) {
    if (module.hot) {
      module.hot.accept('./reducers', () => {
        const nextRootReducer = reducers.default;
        store.replaceReducer(nextRootReducer);
      });
    }
    // middlewares.push(logger);
    const reactotronEnhancer = KyteReactotron?.createEnhancer ? KyteReactotron.createEnhancer() : (f) => f;
    store = createStore(
      reducers,
      compose(
        applyMiddleware(...middlewares),
        offline({ ...offlineConfig, persistOptions, persistCallback: () => persistCallBack(store) }),
        reactotronEnhancer
      )
    );
  }
  return store;
};

export default configureStore;
