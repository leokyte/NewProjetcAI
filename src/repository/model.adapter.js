import _ from 'lodash';
import moment from 'moment';

import I18n from '../i18n/i18n';
import { CustomerOrigin, SaleOrigin } from '../enums';

export const adapterObjectToModel = (modelName, data) => {
  let dataToAdapter = { ...data };

  if (!Object.prototype.hasOwnProperty.call(data, 'did')) {
    dataToAdapter = { ...data, did: '' };
  }
  if (!Object.prototype.hasOwnProperty.call(data, 'userName')) {
    dataToAdapter = { ...data, userName: I18n.t('userPermissionAdmin') };
  }

  if (modelName === 'Sale') return adapterSale(dataToAdapter);
  if (modelName === 'Product') return adapterProduct(dataToAdapter);
  if (modelName === 'Customer') return adapterCustomer(dataToAdapter);

  return data;
};

const adapterSale = (data) => {
  const defaultDataAdapter = {
    totalProfit: 0,
    totalTaxes: 0,
    dateClosedLocal: null,
    did: '',
    taxes: [],
    origin: SaleOrigin.APP,
    toDeliver: false,
  };
  const dataAdapter = {
    ...defaultDataAdapter,
    ...data,
    dateClosedLocal: data.dateClosed?.toString?.() ?? null,
    showObservationInReceipt: Boolean(data.taxes),
    taxes: [],
    shippingFee: data.shippingFee || null,
  };

  ['payments', 'items', 'taxes', 'timeline'].forEach((key) => {
    if (_.has(dataAdapter, key)) dataAdapter[key] = _.values(data[key]);
  });

  dataAdapter.items = dataAdapter.items.map((item) => {
    const updatedItem = {
      ...item,
      profitValue: item.profitValue ?? 0,
    };

    if (item.product) {
      updatedItem.product = {
        ...item.product,  
        costValue: item.product.costValue ?? item.product.unitValue,
        stockActive: item.product.stockActive ?? false,
        variations: item.product.variations || [],
      };
    }

    return updatedItem;
  });

  if (!dataAdapter.timeStamp && dataAdapter.timeline && dataAdapter.timeline.length > 0) {
    dataAdapter.timeline = dataAdapter.timeline.map((t) => {
      if (typeof t.timeStamp === 'object' && !(t.timeStamp instanceof Date)) {
        const timeStampValue = t.timeStamp._seconds || t.timeStamp.seconds;
        const timeStamp = moment.unix(timeStampValue).toDate();
        return { ...t, timeStamp };
      }
      return { ...t, timeStamp: t.timeStamp };
    });
  }

  return dataAdapter;
};

const adapterProduct = (data) => {
  let dataAdapter = { ...data, virtual: null };
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'saleCostPrice')) {
    dataAdapter = { ...dataAdapter, saleCostPrice: dataAdapter.salePrice };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'category')) {
    dataAdapter = { ...dataAdapter, category: null };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'description')) {
    dataAdapter = { ...dataAdapter, description: null };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'code')) {
    dataAdapter = { ...dataAdapter, code: null };
  }

  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'stockActive')) {
    dataAdapter = { ...dataAdapter, stockActive: false };
  }

  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'stock')) {
    dataAdapter = { ...dataAdapter, stock: null };
  }

  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'showOnCatalog')) {
    dataAdapter = { ...dataAdapter, showOnCatalog: true };
  }

  if (
    Object.prototype.hasOwnProperty.call(dataAdapter, 'category') &&
    !!dataAdapter.category &&
    typeof dataAdapter.category.dateCreation === 'object'
  ) {
    let dateCreation = dataAdapter.category.dateCreation;
    if (!(dateCreation instanceof Date)) {
      dateCreation = moment
        .unix(
          dataAdapter.category.dateCreation._seconds || dataAdapter.category.dateCreation.seconds,
        )
        .toDate();
    }
    dataAdapter = { ...dataAdapter, category: { ...dataAdapter.category, dateCreation } };
  }

  ['gallery'].forEach((obj) => {
    if (_.has(dataAdapter, obj)) dataAdapter[obj] = _.values(data[obj]);
  });

  return dataAdapter;
};

const adapterCustomer = (data) => {
  let dataAdapter = { ...data };

  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'image')) {
    dataAdapter = { ...dataAdapter, image: null };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'documentNumber')) {
    dataAdapter = { ...dataAdapter, documentNumber: null };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'celPhone')) {
    dataAdapter = { ...dataAdapter, celPhone: null };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'address')) {
    dataAdapter = { ...dataAdapter, address: null };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'addressComplement')) {
    dataAdapter = { ...dataAdapter, addressComplement: null };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'observation')) {
    dataAdapter = { ...dataAdapter, observation: null };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'totalSalesClosed')) {
    dataAdapter = { ...dataAdapter, totalSalesClosed: 0 };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'salesQuantity')) {
    dataAdapter = { ...dataAdapter, salesQuantity: 0 };
  }
  if (!Object.prototype.hasOwnProperty.call(dataAdapter, 'origin')) {
    dataAdapter = { ...dataAdapter, origin: CustomerOrigin.APP };
  }

  return dataAdapter;
};
