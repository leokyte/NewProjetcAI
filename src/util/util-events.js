/* eslint-disable import/prefer-default-export */

import { BenefitsType, DiscountType } from '@kyteapp/kyte-utils'
import { paymentsGenericTypes, statusNames } from '.'
import { PaymentType } from '../enums'
import { logEvent } from '../integrations'

const findProductWithVariant = (items) => items.some(item => item?.product?.variations?.length > 0)

export const trackSalePropsEvent = (sale) => {
	const hasFractionedProduct = (item) =>
		item.product && item.product !== undefined && item.product.isFractioned === true

	const hasCoupons = Boolean(sale?.appliedCoupon?.code)
	const coupon = sale?.appliedCoupon
	const couponDiscountType = 
		coupon?.benefits[0]?.discount_type === DiscountType.PERCENTAGE 
		? `${DiscountType.PERCENTAGE} discount` : `${DiscountType.FIXED} discount`
	const couponType = coupon?.benefits[0]?.type === BenefitsType.SHIPPING
		? "free shipping" : couponDiscountType 

	const propertiesTrack = {
		hasSplitPayment: sale?.payments?.length > 1,
		paymentType: paymentsGenericTypes(sale?.payments),
		hasCustomer: !!sale?.customer,
		hasDiscount: sale?.discountValue > 0,
		hasFractionedProduct: sale?.items.filter(hasFractionedProduct).length > 0,
		hasObservation: sale?.observation !== '',
		hasTaxes: sale?.totalTaxes > 0,
		isOnHold: sale?.status === 'opened',
		isQuickSale: sale?.items.filter((item) => item.product === undefined).length > 0,
		totalNet: sale?.totalNet,
		QRCode_create: Boolean(sale?.qrCode),
		hasVariantProduct: findProductWithVariant(sale?.items),
		hasCoupons,
		coupon_object: hasCoupons ? sale.appliedCoupon : null,
		couponType: hasCoupons ? couponType : null
	}

	return propertiesTrack
}

export const trackSaleSavePropsEvent = (sale) => {
	const propertiesTrack = {
		totalGross: sale?.totalGross,
		totalItems: sale?.totalItems,
		totalNet: sale?.totalNet,
		paymentType: PaymentType?.items[sale?.payments[0]?.type]?.description,
		hasCustomer: Boolean(sale?.customer),
		hasDiscount: Boolean(sale?.discountValue || sale?.discountPercent),
		itemsAmount: sale?.items.length,
		isOnHold: sale?.status === sale?.OPENED,
		hasObservation: Boolean(sale?.observation),
		isQuickSale: sale?.items?.some(({ product }) => !product),
		hasFractionedProduct: sale?.items?.some((item) => item?.product?.isFractioned),
		hasTaxes: Boolean(sale?.totalTaxes),
		hasSplitPayment: sale?.payments.length > 1,
		hasChange: (sale?.payBack ?? 0) > 0,
		status: sale?.statusInfo.status || sale?.status,
		QRCode_create: Boolean(sale?.qrCode),
		hasVariantProduct: findProductWithVariant(sale?.items),
	}

	return propertiesTrack
}

export const trackSaleFinishOrSaveEvent = ({ sale, status }) => {
	if (status === statusNames.CLOSED) {
		const propertiesTrack = trackSalePropsEvent(sale)
		logEvent('Sale Finished', propertiesTrack)
	} else {
		const propertiesTrack = trackSaleSavePropsEvent(sale)
		logEvent('Order Save', propertiesTrack)
	}
}

export const getStatisticPanelTitle = (panel) => {
	const statisticPanelTitles = {
		statisticRevenue: 'Revenue',
		statisticSales: 'Sales',
		statisticAverageTicketSize: 'Ticket',
		statisticProfits: 'Profits',
		taxesPageTitle: 'Sale Tax',
		statisticPaymentMethod: 'Payment Method',
		statisticTopProductsByPrice: 'Top Products',
		statisticTopCustomers: 'Top Customers',
		statisticSalesByUser: 'Staff Sales',
	}

	return statisticPanelTitles[panel]
}
