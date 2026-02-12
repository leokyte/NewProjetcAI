import Realm from 'realm';

export class SaleItemDiscount extends Realm.Object {}
SaleItemDiscount.schema = {
  name: 'SaleItemDiscount',
  properties: {
    discountValue: { type: 'double', default: 0 },
    discountPercent: { type: 'double', default: 0 },
    discountType: { type: 'string', default: '' },
  },
};

export class SaleItem extends Realm.Object {}
SaleItem.schema = {
  name: 'SaleItem',
  properties: {
    value: 'double',
    amount: 'int',
    fraction: { type: 'double', default: 1 },
    description: { type: 'string', optional: true },
    unitValue: { type: 'double', optional: true },
    grossValue: { type: 'double', optional: true },
    discount: {
      type: 'object',
      objectType: 'SaleItemDiscount',
      optional: true,
    },
    product: { type: 'object', objectType: 'SaleProduct' },
    profitValue: { type: 'double', optional: true },
  },
};

export class SaleProduct extends Realm.Object {}
SaleProduct.schema = {
  name: 'SaleProduct',
  properties: {
    prodId: 'string',
    name: 'string',
    unitValue: { type: 'double', optional: true },
    costValue: { type: 'double', optional: true },
    originalUnitValue: { type: 'double', optional: true },
    isFractioned: { type: 'bool', default: false },
    stockActive: { type: 'bool', optional: true },
    image: { type: 'string', optional: true },
    imagePath: { type: 'string', optional: true },
    description: { type: 'string', optional: true },
    code: { type: 'string', optional: true },
    variations: {
      type: 'list',
      objectType: 'Variation',
    },
  },
};

export class Variation extends Realm.Object {}
Variation.schema = {
  name: 'Variation',
  properties: {
    _id: 'string',
    aid: 'string',
    name: 'string',
    options: {
      type: 'list',
      objectType: 'VariationOption',
    },
    isPrimary: { type: 'bool', default: false },
  },
};

export class VariationOption extends Realm.Object {}
VariationOption.schema = {
  name: 'VariationOption',
  properties: {
    title: 'string',
    photo: {type:'string', optional: true},
  },
};

export class SaleCustomer extends Realm.Object {}
SaleCustomer.schema = {
  name: 'SaleCustomer',
  properties: {
    id: 'string',
    uid: { type: 'string', optional: true },
    name: { type: 'string', indexed: true },
    email: { type: 'string', optional: true },
    phone: { type: 'string', optional: true },
    celPhone: { type: 'string', optional: true },
    address: { type: 'string', optional: true },
    addressComplement: { type: 'string', optional: true },
    image: { type: 'string', optional: true },
    accountBalance: { type: 'double', optional: true },
    previousAccountBalance: { type: 'double', optional: true, default: 0 },
    isGuest: { type: 'bool', optional: true },
  },
};

export class SalePayment extends Realm.Object {}
SalePayment.schema = {
  name: 'SalePayment',
  properties: {
    type: 'int',
    description: 'string',
    receiptDescription: { type: 'string', optional: true },
    total: 'double',
    totalPaid: { type: 'double', optional: true, default: 0 },
    transaction: {
      type: 'object',
      objectType: 'SalePaymentTransaction',
      optional: true,
    },
  },
};

export class SalePaymentTransaction extends Realm.Object {}
SalePaymentTransaction.schema = {
  name: 'SalePaymentTransaction',
  properties: {
    cardType: 'string',
    cardLast4Digits: 'string',
    currency: 'string',
    installments: 'int',
    type: 'string',
    transactionId: 'string',
    gateway: { type: 'string', optional: true, default: '' },
  },
};

export class SaleTax extends Realm.Object {}
SaleTax.schema = {
  name: 'SaleTax',
  properties: {
    name: 'string',
    type: 'string',
    typePercentFixed: { type: 'string', optional: true },
    percent: 'double',
    optional: 'bool',
    active: { type: 'bool', optional: true },
  },
};

export class SaleTimeline extends Realm.Object {}
SaleTimeline.schema = {
  name: 'SaleTimeline',
  properties: {
    status: 'string',
    timeStamp: 'date',
    alias: { type: 'string', optional: true },
    color: { type: 'string', optional: true },
    active: { type: 'bool', optional: true },
    isDefault: { type: 'bool', optional: true },
  },
};

export class SaleStatusInfo extends Realm.Object {}
SaleStatusInfo.schema = {
  name: 'SaleStatusInfo',
  properties: {
    status: 'string',
    alias: { type: 'string', optional: true },
    color: { type: 'string', optional: true },
    active: { type: 'bool', optional: true },
    isDefault: { type: 'bool', optional: true },
  },
};

export class ShippingFee extends Realm.Object {}
ShippingFee.schema = {
  name: 'ShippingFee',
  properties: {
    name: 'string',
    value: 'double',
    description: 'string',
  },
};
