import I18n from '../i18n/i18n'
import { isCatalogApp } from '../util/util-flavors'
import { SkuPrefixEnum } from './Flavors'

export const FREE = 'free'
export const PRO = 'pro'
export const GROW = 'grow'
export const PRIME = 'prime'

const SKU_PREFIX = isCatalogApp() ? SkuPrefixEnum.CATALOG : SkuPrefixEnum.POS

export const Plans = {
	Pro: 0,
	Free: 1,
	items: [
		{
			type: PRO,
			features: ['stock', 'analytics', 'multiuser', 'printers', 'taxes', 'openedsales', 'export', 'customeraccount'],
		},
		{ type: FREE, features: ['analytics', 'taxes'] },
	],
}

const PRO_MONTHLY = `${SKU_PREFIX}.monthlyplan`
const PRO_YEARLY = `${SKU_PREFIX}.yearlyplan`
const GROW_MONTHLY = `${SKU_PREFIX}.${GROW}.monthly`
const GROW_YEARLY = `${SKU_PREFIX}.${GROW}.yearly`
const PRIME_MONTH = `${SKU_PREFIX}.${PRIME}.month`
const PRIME_YEARLY = `${SKU_PREFIX}.${PRIME}.yearly`

export const PLAN_MONTHLY = 'monthly'
export const PLAN_YEARLY = 'yearly'

export const PLAN_PRO = {
	id: PRO,
	title: I18n.t('plansPage.pro.title'),
	description: I18n.t('plansPage.pro.description'),
	defaultPlan: false,
	monthly: {
		sku: PRO_MONTHLY,
	},
	yearly: {
		sku: PRO_YEARLY,
	},
}

export const PLAN_GROW = {
	id: GROW,
	title: I18n.t('plansPage.grow.title'),
	description: I18n.t('plansPage.grow.description'),
	defaultPlan: true,
	monthly: {
		sku: GROW_MONTHLY,
	},
	yearly: {
		sku: GROW_YEARLY,
	},
}

export const PLAN_PRIME = {
	id: PRIME,
	title: I18n.t('plansPage.prime.title'),
	description: I18n.t('plansPage.prime.description'),
	defaultPlan: false,
	monthly: {
		sku: PRIME_MONTH,
	},
	yearly: {
		sku: PRIME_YEARLY,
	},
}

export const IAP_SUBSCRIPTIONS_LIST = {
	skus: [PRO_MONTHLY, PRO_YEARLY, GROW_MONTHLY, GROW_YEARLY, PRIME_MONTH, PRIME_YEARLY],
}

export const PLANS_LIST = [PLAN_PRO, PLAN_GROW, PLAN_PRIME]
