import Realm from 'realm'
import moment from 'moment/min/moment-with-locales'

export class ProductCategory extends Realm.Object {}
ProductCategory.schema = {
	name: 'ProductCategory',
	primaryKey: 'id',
	properties: {
		id: 'string',
		uid: 'string',
		aid: 'string',
		name: { type: 'string', indexed: true },
		dateCreation: { type: 'date', default: moment().toDate() },
		userName: { type: 'string', default: '' },
		productQuantity: { type: 'int', optional: true, default: 0 },
		active: 'bool',
		order: { type: 'int', optional: true, default: 0 },
		search: { type: 'string', default: '' },
	},
}
