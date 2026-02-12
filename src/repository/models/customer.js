import Realm from 'realm';
import moment from 'moment/min/moment-with-locales';


export class Customer extends Realm.Object {}

Customer.schema = {
  name: 'Customer',
  primaryKey: 'id',
  properties: {
    id: 'string',
    uid: 'string',
    aid: 'string',
    name: { type: 'string', indexed: true },
    image: { type: 'string', optional: true },
    documentNumber: { type: 'string', optional: true },
    email: { type: 'string', optional: true },
    phone: { type: 'string', optional: true },
    celPhone: { type: 'string', optional: true },
    address: { type: 'string', optional: true },
    addressComplement: { type: 'string', optional: true },
    observation: { type: 'string', optional: true },
    dateCreation: { type: 'date', default: moment().toDate() },
    active: 'bool',
    totalSalesClosed: { type: 'double', default: 0 },
    totalSalesOpened: { type: 'double', default: 0 },
    salesQuantity: { type: 'int', default: 0 },
    userName: { type: 'string', default: '' },
    origin: { type: 'int', default: 0 },
    accountBalance: { type: 'double', default: 0 },
    allowPayLater: { type: 'bool', default: false, optional: true }
  }
};
