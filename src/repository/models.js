/* eslint-disable no-underscore-dangle */
import Realm from 'realm'
import _ from 'lodash'

import { Sale } from './models/sale-agg/sale'
import {
	SaleItem,
	SaleProduct,
	SaleCustomer,
	SalePayment,
	SalePaymentTransaction,
	SaleTax,
	SaleTimeline,
	SaleItemDiscount,
	SaleStatusInfo,
	ShippingFee,
} from './models/sale-agg/saleProps'
import {
	Product,
	ProductStock,
	ProductVirtual,
	ProductImage,
	Variation,
	ProductVariant,
	VariationOption,
	VariationPhotos,
} from './models/product'
import { ProductCategory } from './models/productCategory'
import { Customer } from './models/customer'
import { Store } from './models/store'
import { Coupon, CouponBenefit, CouponConstraint } from './models/coupon'
import I18n from '../i18n/i18n'
import { CustomerOrigin, SaleOrigin } from '../enums'

let _realm

Object.defineProperty(Realm.Object.prototype, 'clone', {
	value() {
		const result = {}
		// eslint-disable-next-line no-restricted-syntax
		for (const key in this) {
			result[key] = this[key]
		}
		return result
	},
	writable: true,
	configurable: true,
	enumerable: false,
})

const init = () => {
	_realm = new Realm({
		schema: [
			Sale.schema,
			SaleItem.schema,
			SaleProduct.schema,
			SaleCustomer.schema,
			SalePayment.schema,
			SalePaymentTransaction.schema,
			SaleTax.schema,
			SaleTimeline.schema,
			SaleItemDiscount.schema,
			SaleStatusInfo.schema,
			Product.schema,
			ProductCategory.schema,
			ProductImage.schema,
			Customer.schema,
			Store.schema,
			ProductStock.schema,
			ProductVirtual.schema,
			ShippingFee.schema,
			Variation.schema,
			ProductVariant.schema,
			VariationOption.schema,
			VariationPhotos.schema,
			CouponBenefit.schema,
			CouponConstraint.schema,
			Coupon.schema
		],
		schemaVersion: 133,
		migration: (oldRealm, newRealm) => {
			if (oldRealm.schemaVersion < 50) {
				version50(newRealm)
			}
			if (oldRealm.schemaVersion < 51) {
				version51(newRealm)
			}
			if (oldRealm.schemaVersion < 52) {
				version52(newRealm)
			}
			if (oldRealm.schemaVersion < 54) {
				version54(newRealm)
			}
			if (oldRealm.schemaVersion < 70) {
				version70(newRealm)
			}
			if (oldRealm.schemaVersion < 71) {
				version71(newRealm)
			}
			if (oldRealm.schemaVersion < 72) {
				version72(newRealm)
			}
			if (oldRealm.schemaVersion < 76) {
				version76(newRealm, oldRealm)
			}
			if (oldRealm.schemaVersion < 78) {
				version78(newRealm, oldRealm)
			}
			if (oldRealm.schemaVersion < 81) {
				version81(newRealm, oldRealm)
			}
			if (oldRealm.schemaVersion < 86) {
				version86(newRealm, oldRealm)
			}
			if (oldRealm.schemaVersion < 87) {
				version87(newRealm, oldRealm)
			}
			if (oldRealm.schemaVersion < 88) {
				version88(newRealm)
			}
			if (oldRealm.schemaVersion < 89) {
				version89(newRealm, oldRealm)
			}
			if (oldRealm.schemaVersion < 92) {
				version92(newRealm, oldRealm)
			}
			if (oldRealm.schemaVersion < 95) {
				version95(newRealm)
			}
			if (oldRealm.schemaVersion < 101) {
				version101(newRealm)
			}
			if (oldRealm.schemaVersion < 102) {
				version102(newRealm)
			}
			if (oldRealm.schemaVersion < 132) {
				version132(newRealm)
			}
			if (oldRealm.schemaVersion < 133) {
				version133(newRealm)
			}
		},
	})
}

const version50 = (newRealm) => {
	const newSales = newRealm.objects('Sale')
	newSales.forEach((o, i) => {
		newSales[i].isSenderReceipt = false
		if (newSales[i].payments) {
			newSales[i].payments.forEach((p) => {
				p.transaction = null
			})
		}
	})
}

const version51 = (newRealm) => {
	const newSales = newRealm.objects('Sale')
	newSales.forEach((o, i) => {
		newSales[i].aid = newSales[i].uid.substr(0, 14)
		newSales[i].sid = newSales[i].uid.substr(14, 14)
	})

	const newCustomers = newRealm.objects('Customer')
	newCustomers.forEach((o, i) => {
		newCustomers[i].aid = newCustomers[i].uid.substr(0, 14)
	})

	const newProducts = newRealm.objects('Product')
	newProducts.forEach((o, i) => {
		newProducts[i].aid = newProducts[i].uid.substr(0, 14)
	})
}

const version52 = (newRealm) => {
	const newSales = newRealm.objects('Sale')
	newSales.forEach((o, i) => {
		newSales[i].did = ''
	})
}

const version54 = (newRealm) => {
	const newSales = newRealm.objects('Sale')
	const newCustomers = newRealm.objects('Customer')
	const newProducts = newRealm.objects('Product')

	newSales.forEach((o, i) => {
		newSales[i].userName = I18n.t('userPermissionAdmin')
	})

	newCustomers.forEach((o, i) => {
		newCustomers[i].userName = I18n.t('userPermissionAdmin')
	})

	newProducts.forEach((o, i) => {
		newProducts[i].userName = I18n.t('userPermissionAdmin')
	})
}

/**
 * Esta versão abrange todas as alterações relacionadas as categorias dos produtos, valor de custo e valor de lucro
 */
const version70 = (newRealm) => {
	const newSales = newRealm.objects('Sale')
	const newSaleItems = newRealm.objects('SaleItem')
	const newSaleProducts = newRealm.objects('SaleProduct')
	const newProducts = newRealm.objects('Product')
	const newProductCategory = newRealm.objects('ProductCategory')

	newSales.forEach((ns, i) => {
		newSales[i].dateClosedLocal = ns.dateClosed ? ns.dateClosed.toString() : null
		newSales[i].totalProfit = ns.totalProfit ? ns.totalProfit : 0
	})

	newSaleItems.forEach((nsi, i) => {
		newSaleItems[i].profitValue = 0
	})

	newSaleProducts.forEach((nsp, i) => {
		newSaleProducts[i].costValue = newSaleProducts[i].unitValue
	})

	newProducts.forEach((np, i) => {
		newProducts[i].category = np.category ? np.category : null
		newProducts[i].saleCostPrice = np.saleCostPrice ? np.saleCostPrice : np.salePrice
	})

	newProductCategory.forEach((npc, i) => {
		newProductCategory[i].productQuantity = npc.productQuantity ? npc.productQuantity : 0
		newProductCategory[i].active = npc.active ? npc.active : true
		newProductCategory[i].order = npc.order ? npc.order : i
	})
}

/*
 * Esta versão abrange a inclusão dos campos DESCRIÇÃO e CÓDIGO no PRODUTO.
 */
const version71 = (newRealm) => {
	const newProducts = newRealm.objects('Product')
	newProducts.forEach((np, i) => {
		newProducts[i].description = np.description ? np.description : null
		newProducts[i].code = np.code ? np.code : null
	})
}

/*
 * Esta versão abrange a inclusão do campo INFORMAÇÕES EXTRAS no STORE.
 */
const version72 = (newRealm) => {
	const newStore = newRealm.objects('Store')
	newStore.forEach((ns, i) => {
		newStore[i].infoExtra = ns.infoExtra ? ns.infoExtra : null
	})
}

/**
 * Esta versão abrange a conversão dos valores dos produtos do tipo FLOAT para DOUBLE
 */
const version76 = (newRealm, oldRealm) => {
	const newProducts = newRealm.objects('Product')
	const oldProducts = oldRealm.objects('Product')

	for (let i = 0; i < oldProducts.length; i++) {
		const oldProduct = oldProducts[i]
		for (let z = 0; z < newProducts.length; z++) {
			const newProduct = newProducts[z]
			if (newProduct.id === oldProduct.id) {
				newProducts[z].salePrice = oldProduct.salePrice
				newProducts[z].saleCostPrice = oldProduct.saleCostPrice ? oldProduct.saleCostPrice : oldProduct.salePrice
			}
		}
	}
}

/**
 * Versão => Implementação de taxas na venda
 */
const version78 = (newRealm) => {
	const newSales = newRealm.objects('Sale')
	newSales.forEach((o, i) => {
		newSales[i].taxes = []
	})
}

/**
 * Versão => Implementação do total de taxas na venda
 */
const version81 = (newRealm) => {
	const newSales = newRealm.objects('Sale')

	newSales.forEach((s, i) => {
		newSales[i].totalTaxes = 0
	})
}

/**
 * Versão => Implementação do stock e virtual em produtos
 */
const version86 = (newRealm) => {
	const newProducts = newRealm.objects('Product')
	const newSaleProducts = newRealm.objects('SaleProduct')

	newProducts.forEach((s, i) => {
		newProducts[i].stockActive = false
		newProducts[i].stock = null
		newProducts[i].virtual = null
	})

	newSaleProducts.forEach((nsp, i) => {
		newSaleProducts[i].stockActive = false
	})
}

/**
 * Esta versão abrange os novos campos do Customer
 */
const version87 = (newRealm, oldRealm) => {
	const newCustomers = newRealm.objects('Customer')
	const oldCustomers = oldRealm.objects('Customer')

	for (let i = 0; i < oldCustomers.length; i++) {
		const oldCustomer = oldCustomers[i]
		for (let z = 0; z < newCustomers.length; z++) {
			const newCustomer = newCustomers[z]
			if (newCustomer.id === oldCustomer.id) {
				newCustomers[z].documentNumber = oldCustomer.documentNumber ? oldCustomer.documentNumber : null
				newCustomers[z].celPhone = oldCustomer.celPhone ? oldCustomer.celPhone : null
				newCustomers[z].address = oldCustomer.address ? oldCustomer.address : null
				newCustomers[z].addressComplement = oldCustomer.addressComplement ? oldCustomer.addressComplement : null
				newCustomers[z].observation = oldCustomer.observation ? oldCustomer.observation : null
				newCustomers[z].image = oldCustomer.image ? oldCustomer.image : null
				newCustomers[z].totalSalesClosed = oldCustomer.totalSalesClosed ? oldCustomer.totalSalesClosed : 0
				newCustomers[z].salesQuantity = oldCustomer.salesQuantity ? oldCustomer.salesQuantity : 0
			}
		}
	}
}

/**
 * Esta versão abrange o campo de 'Exibir observações no recibo' dentro da venda
 */
const version88 = (newRealm) => {
	const newSales = newRealm.objects('Sale')

	newSales.forEach((s, i) => {
		newSales[i].showObservationInReceipt = false
	})
}

/**
 * Esta versão troca o valor da taxa de INT para DOUBLE
   E Adiciona o endereço ao usário na venda
*/
const version89 = (newRealm, oldRealm) => {
	const newCustomers = newRealm.objects('Customer')
	const newSales = newRealm.objects('Sale')
	const oldSales = oldRealm.objects('Sale')

	for (let i = 0; i < newSales.length; i++) {
		const newSale = newSales[i]
		if (newSale.customer) {
			const findCustomer = _.find(newCustomers, (eachCustomer) => eachCustomer.id === newSale.customer.id)
			newSales[i].customer.address = findCustomer ? findCustomer.address : null
		}
	}

	newSales.forEach((ns, i) => {
		if (ns.taxes.length) {
			newSales[i].taxes[0].percent = oldSales[i].taxes[0].percent
		}
	})
}

const version92 = (newRealm) => {
	const customers = newRealm.objects('Customer')
	const sales = newRealm.objects('Sale')

	sales.forEach((eachSale, saleIndex) => {
		if (eachSale.customer) {
			const findCustomer = _.find(customers, (eachCustomer) => eachCustomer.id === eachSale.customer.id)
			sales[saleIndex].customer.image = findCustomer ? findCustomer.image : null
		}
	})
}

const version95 = (newRealm) => {
	const customers = newRealm.objects('Customer')
	const sales = newRealm.objects('Sale')

	sales.forEach((sale, saleIndex) => {
		sales[saleIndex].origin = SaleOrigin.APP
	})
	customers.forEach((customer, customerIndex) => {
		customers[customerIndex].origin = CustomerOrigin.APP
	})
}

const version101 = (newRealm) => {
	const products = newRealm.objects('Product')
	const sales = newRealm.objects('Sale')

	products.forEach((product, i) => {
		products[i].showOnCatalog = true
	})

	sales.forEach((product, i) => {
		sales[i].toDeliver = false
	})
}

const version102 = (newRealm) => {
	// Migrate Product → set all new fields
	const allProducts = newRealm.objects('Product')
	allProducts.forEach((_, i) => {
		// assign remote id
		allProducts[i]._id = allProducts[i].id
		// optional thumbnail (wasn't on old schema)
		allProducts[i].imageThumb = allProducts[i].imageThumb || ''
		// default parent/child flags
		allProducts[i].isParent = true
		allProducts[i].isChildren = false
		// empty search index
		allProducts[i].search = ''
		// new variant collections
		allProducts[i].variations = []
		allProducts[i].variants = []
	})

	// Migrate SaleProduct → initialize its new variations list
	const allSaleProducts = newRealm.objects('SaleProduct')
	allSaleProducts.forEach((_, i) => {
		allSaleProducts[i].variations = []
	})
}

const version132 = (newRealm) => {
	// Migrate fields to optional: generateQRCode, qrCode, isParent, isChildren
	const allSales = newRealm.objects('Sale')
	allSales.forEach((_, i) => {
		allSales[i].generateQRCode = allSales[i].generateQRCode ?? false
		allSales[i].qrCode = allSales[i].qrCode ?? ''
	})

	const allProducts = newRealm.objects('Product')
	allProducts.forEach((_, i) => {
		allProducts[i].isParent = allProducts[i].isParent ?? true
		allProducts[i].isChildren = allProducts[i].isChildren ?? false
	})
}

const version133 = (newRealm) => {
	// Migrate fields to optional: generateQRCode, qrCode, isParent, isChildren
	const allSales = newRealm.objects('Sale')
	allSales.forEach((_, i) => {
		allSales[i].appliedCoupon = allSales[i].appliedCoupon ?? null
		allSales[i].totalCouponDiscount = allSales[i].totalCouponDiscount ?? null
		allSales[i].shippingCouponDiscount = allSales[i].shippingCouponDiscount ?? null
	})
}

init()

export default _realm
