import Realm from 'realm';
import moment from 'moment/min/moment-with-locales';

export class Store extends Realm.Object {}
Store.schema = {
  name: 'Store',
  primaryKey: 'id',
  properties: {
    id: 'string',
    uid: 'string',
    name: { type: 'string', indexed: true },
    email: { type: 'string', optional: true },
    phone: { type: 'string', optional: true },
    image: { type: 'string', optional: true },
    extra: { type: 'string', optional: true },
    infoExtra: { type: 'string', optional: true },
    dateCreation: { type: 'date', default: moment().toDate() },
    active: { type: 'bool', default: true },
  }
};
