/* eslint-disable max-classes-per-file */

import Realm from 'realm'
import moment from 'moment/min/moment-with-locales'

export class ProductVirtual extends Realm.Object {}
ProductVirtual.schema = {
	name: 'ProductVirtual',
	properties: {
		stockReserved: { type: 'double', optional: true },
	},
}
export class ProductStock extends Realm.Object {}
ProductStock.schema = {
	name: 'ProductStock',
	properties: {
		initial: { type: 'double', optional: true },
		current: { type: 'double', optional: true },
		minimum: { type: 'double', optional: true },
	},
}

export class ProductImage extends Realm.Object {}
ProductImage.schema = {
	name: 'ProductImage',
	properties: {
		url: 'string',
	},
}

export class VariationPhotos extends Realm.Object { }
VariationPhotos.schema = {
	name: 'VariationPhotos',
	properties: {
		image: { type: 'string', optional: true },
		imageThumb: { type: 'string', optional: true },
		imageLarge: { type: 'string', optional: true },
		imageMedium: { type: 'string', optional: true }
	}
}

export class VariationOption extends Realm.Object {}
VariationOption.schema = {
	name: 'VariationOption',
	properties: {
		title: 'string',
		photos: {
			type: 'object',
			objectType: 'VariationPhotos',
			optional: true,
		},
	},
}

export class Variation extends Realm.Object {}
Variation.schema = {
	name: 'Variation',
	properties: {
		_id: 'string',
		aid: { type: 'string', optional: true },
		uid: { type: 'string', optional: true },
		name: 'string',
		options: { type: 'list', objectType: 'VariationOption' },
		isPrimary: { type: 'bool', optional: true },
	},
}

export class ProductVariant extends Realm.Object {}
ProductVariant.schema = {
	name: 'ProductVariant',
	properties: {
		_id: 'string',
		name: 'string',
		code: { type: 'string', optional: true },
		image: { type: 'string', optional: true },
		isFractioned: 'bool',
		salePrice: 'double',
		salePromotionalPrice: { type: 'double', optional: true },
		saleCostPrice: 'double',
		stockActive: 'bool',
		variations: { type: 'list', objectType: 'Variation' },
	},
}

export class Product extends Realm.Object {
	get virtualCurrentStock() {
		if (!this.stockActive) return null
		const stockReserved = !this.virtual ? 0 : this.virtual.stockReserved
		const stockValue = this.stock.current + stockReserved
		return stockValue % 1 !== 0 ? stockValue.toFixed(3) : stockValue
	}
}
Product.schema = {
	name: 'Product',
	primaryKey: 'id',
	properties: {
		id: 'string',
		_id: { type: 'string', optional: true },
		uid: 'string',
		aid: 'string',
		name: { type: 'string', indexed: true },
		label: 'string',
		image: { type: 'string', optional: true },
		imageThumb: { type: 'string', optional: true },
		gallery: { type: 'list', objectType: 'ProductImage' },
		foreground: { type: 'string', optional: true },
		background: { type: 'string', optional: true },
		salePrice: 'double',
		saleCostPrice: 'double',
		salePromotionalPrice: { type: 'double', optional: true },
		isFractioned: 'bool',
		dateCreation: { type: 'date', default: moment().toDate() },
		active: 'bool',
		userName: { type: 'string', default: '' },
		category: { type: 'object', objectType: 'ProductCategory', optional: true },
		stockActive: { type: 'bool', default: false },
		stock: { type: 'object', objectType: 'ProductStock', optional: true },
		description: { type: 'string', optional: true },
		code: { type: 'string', optional: true },
		virtual: { type: 'object', objectType: 'ProductVirtual', optional: true },
		showOnCatalog: { type: 'bool', default: true },
		pin: { type: 'bool', default: false },
		isParent: { type: 'bool', default: true, optional: true },
		isChildren: { type: 'bool', default: false, optional: true },
		search: { type: 'string', default: '' },
		variations: { type: 'list', objectType: 'Variation' },
		variants: { type: 'list', objectType: 'ProductVariant' },
	},
}
