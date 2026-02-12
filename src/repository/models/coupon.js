import Realm from 'realm'

export class CouponBenefit extends Realm.Object {}
CouponBenefit.schema = {
	name: 'CouponBenefit',
	properties: {
		type: 'string',
		discount_type: { type: 'string', optional: true },
		value: { type: 'double', optional: true },
		max_discount: { type: 'double', optional: true },
	},
}

export class CouponConstraint extends Realm.Object {}
CouponConstraint.schema = {
	name: 'CouponConstraint',
	properties: {
		type: 'string',
		value: { type: 'double', optional: true },
	},
}

export class Coupon extends Realm.Object {}
Coupon.schema = {
	name: 'Coupon',
	properties: {
		_id: { type: 'string', default: '' },
		aid: { type: 'string', default: '' },
		uid: { type: 'string', default: '' },
		name: { type: 'string', default: '' },
		code: { type: 'string', optional: true },
		active: { type: 'bool', default: true },
		deleted: { type: 'bool', default: false },
		trigger: { type: 'string', default: '' },
		benefits: { type: 'list', objectType: 'CouponBenefit' },
		constraints: { type: 'list', objectType: 'CouponConstraint' },
		created_at: { type: 'date', optional: true },
		updated_at: { type: 'date', optional: true },
	},
}
