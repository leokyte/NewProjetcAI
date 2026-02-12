import _ from 'lodash'
import { calculeValuePercent, calculePercent, isFixedTax } from '../../util'
import { CurrentSaleDiscountType } from '../../enums'
// Current Sale Business Methods
// example entry:
// entry: { amount: 1, fraction: 1, product: {}, value: 26, unitValue: value, discount: {  } }

// Builders
export const buildItem = (current, entry, cartItems) => {
	const item = current ? { ...current } : { ...entry }
	const isUpdate = entry.itemId
	const initDiscount = { discountValue: 0, discountPercent: 0, discountType: '' }
	const initUnitVale = entry.product ? entry.product.unitValue : entry.value

	item.itemId = current ? current.itemId : randomizeId()
	item.amount = isUpdate ? entry.amount : calculateAmount(current, entry.amount)
	item.fraction = entry.fraction || 1
	item.description = entry.description || ''
	item.unitValue = entry.unitValue || initUnitVale
	item.grossValue = calculateFinalValue(item.amount, item.unitValue, initDiscount, entry)
	item.discount = entry.discount ? calculateDiscount(item.grossValue, entry.discount) : initDiscount
	item.value = calculateFinalValue(item.amount, item.unitValue, item.discount, entry)
	item.profitValue = calculateProfit(item)
	item.currentStock = item.product ? calculateCurrentStock(item, cartItems) : 0
	if (entry?.product?.parentId) {
		item.parentId = entry.parentId
	}

	return item
}

const updateItemProfit = (entry, discount) => {
	const item = { ...entry }
	item.profitValue = item.profitValue ? calculateProfit(item, discount) : 0

	return item
}

const updateItemCurrentStock = (entry, items, entryIndex) => {
	const item = { ...entry }
	item.currentStock = item.product ? calculateCurrentStock(item, items, entryIndex) : 0

	return item
}

//------------------------------------------------------------------------

// Export Methods
export const addNewItem = (items, entryItem) => {
	if (!entryItem.product) return [...items, buildItem(undefined, entryItem)]

	let cartItems
	const current = items.find(
		(item) => item.product && !item.product.isFractioned && item.product.prodId === entryItem.product.prodId
	)
	const filteredItems = items.filter((item) => item !== current)

	cartItems = updateItemsProfit(filteredItems, 0)
	cartItems = updateItemsReservedStock(filteredItems)

	return [...cartItems, buildItem(current, entryItem, cartItems)]
}

export const updateItem = (items, entryItem) => {
	let cartItems
	const current = items.find((item) => item.itemId === entryItem.itemId)
	const filteredItems = items.filter((item) => item !== current)

	cartItems = updateItemsProfit(filteredItems, 0)
	cartItems = updateItemsReservedStock(filteredItems)

	return [...cartItems, buildItem(current, entryItem, cartItems)]
}

export const removeItem = (items, entryId) => {
	let cartItems
	const filteredItems = items.filter((item) => item.itemId !== entryId)

	cartItems = updateItemsProfit(filteredItems, 0)
	cartItems = updateItemsReservedStock(filteredItems)
	return cartItems
}

export const updateTotals = ({ items,
	 	taxes,
	 	useSaleTaxes,
	 	discount,
	 	totalPay,
	 	shippingFee,
		totalCouponDiscount,
		shippingCouponDiscount
	}) => calculateTotals({
		items,
		taxes,
		useSaleTaxes,
		discount,
		totalPay,
		shippingFee: shippingFee || { value: 0 },
		totalCouponDiscount: totalCouponDiscount || 0,
		shippingCouponDiscount: shippingCouponDiscount || 0,
	})

export const updateDiscount = (total, discount) => {
	const entryDiscount = calculateDiscount(total, discount)
	return { ...entryDiscount }
}

export const updateItemsProfit = (items, discount) => items.map((item) => updateItemProfit(item, discount))

export const updateItemsReservedStock = (items) => items.map((item, i, arr) => updateItemCurrentStock(item, arr, i))

// Não esta sendo usado.
export const checkTaxIntegrity = (taxes) => {
	if (!taxes.length) return taxes
	const tax = taxes[0]
	return tax.percent ? taxes : []
}

//------------------------------------------------------------------------

// Calculation Methods
const calculateAmount = (current = { amount: 0 }, entryAmount) => current.amount + entryAmount

const calculateFinalValue = (itemAmount, itemValue, itemDiscount, entry) => {
	const {product} = entry
	const multiplier = product && product.isFractioned ? entry.fraction : itemAmount
	const value = multiplier * itemValue
	const discountedValue = parseFloat((value - itemDiscount.discountValue).toFixed(2))

	return discountedValue
}

const calculateProfit = (entry, discount = 0) => {
	const {product} = entry
	const multiplier = product && product.isFractioned ? entry.fraction : entry.amount
	const appliedDiscount = calculeValuePercent(entry.value, discount)

	const profitByProduct = () => entry.value - product.costValue * multiplier - appliedDiscount

	return product ? profitByProduct() : 0
}

const calculateCurrentStock = (entry, cartItems, entryIndex) => {
	const { product } = entry
	const totalFraction = () => {
		const items = cartItems.filter((item) => item.product && item.product.prodId === product.prodId)
		const itemsUpdate = cartItems.filter(
			(item, i) => item.product && item.product.prodId === product.prodId && i < entryIndex
		)

		return _.sumBy(entryIndex !== undefined ? itemsUpdate : items, (i) => Number(i.fraction.toFixed(3)))
	}

	const operator = product.isFractioned ? totalFraction() + entry.fraction : entry.amount
	const stockValue = () => product.virtualCurrentStock - operator

	return product.virtualCurrentStock !== null ? stockValue() : 0
}

const calculateTotals = ({
	items,
	taxes,
	useSaleTaxes,
	discount = { value: 0, type: null },
	totalPay,
	shippingFee,
	totalCouponDiscount,
	shippingCouponDiscount
}) => {
	const itemsValue = parseFloat(_.sumBy(items, (o) => Number(o.value.toFixed(2))))
	const totalGross = parseFloat(_.sumBy(items, (o) => Number(o.grossValue.toFixed(2))))
	const totalProfit = parseFloat(_.sumBy(items, (o) => Number(o.profitValue.toFixed(2))))
	const totalItems = _.sumBy(items, (i) => i.amount)

	const entryDiscount = calculateDiscount(itemsValue, discount)
	let totalNet = parseFloat((itemsValue - entryDiscount.discountValue - totalCouponDiscount - shippingCouponDiscount).toFixed(2))

	const { totalSaleTaxes, totalProductTaxes } = calculateTaxes(taxes, useSaleTaxes, totalNet)
	const totalTaxes = totalSaleTaxes || totalProductTaxes
	const totalDiscounts = { ...entryDiscount, discountPercent: Number(entryDiscount.discountPercent.toFixed(2)) }

	totalNet = Number((totalNet + totalSaleTaxes + shippingFee.value).toFixed(2))

	return {
		totalGross,
		totalProfit: totalProfit - totalCouponDiscount,
		totalItems,
		totalNet,
		totalPay: totalPay || totalNet,
		totalTaxes,
		...totalDiscounts,
	}
}

const calculateTaxes = (taxes, useSaleTaxes, totalNet) => {
	if (!taxes || !taxes.length) return { totalSaleTaxes: 0, totalProductTaxes: 0 }

	const getOneTaxOfEachType = () => {
		const filterBy = (type) => (tax) => tax.active && tax.type === type
		const saleTax = taxes.find(filterBy('sale-tax'))
		const productTax = taxes.find(filterBy('product-tax'))
		return { saleTax, productTax }
	}

	const { saleTax, productTax } = getOneTaxOfEachType()

	const calculateSaleTax = (tax) => {
		if (!tax) return 0

		const taxValue = !isFixedTax(tax) ? calculeValuePercent(totalNet, tax.percent) : tax.percent

		return taxValue
	}

	const calculateProductTax = (tax) => {
		if (!tax) return 0

		const originalValue = !isFixedTax(tax) ? (totalNet / (tax.percent / 100 + 1)).toFixed(2) : tax.percent

		return Number((totalNet - originalValue).toFixed(2))
	}

	return {
		totalSaleTaxes: useSaleTaxes ? calculateSaleTax(saleTax) : 0,
		totalProductTaxes: calculateProductTax(productTax),
	}
}

const calculateDiscount = (total, discount) => {
	const { type, value, discountValue, discountPercent, discountType } = discount
	const hasDiscount = discountValue >= 0
	let calculateValue = 0
	let calculatePercent = 0

	if (type === CurrentSaleDiscountType.Percent) {
		calculatePercent = value < 100 ? value : 100
		calculateValue = Number(calculeValuePercent(total, calculatePercent).toFixed(2))
	} else {
		calculateValue = value < total ? value : total
		calculatePercent = Number(calculePercent(total, calculateValue).toFixed(2))
	}

	return {
		discountValue: hasDiscount ? discountValue : calculateValue,
		discountPercent: hasDiscount ? discountPercent : calculatePercent,
		discountType: hasDiscount ? discountType : type,
	}
}

const randomizeId = () => Math.floor(Math.random() * 10000)
