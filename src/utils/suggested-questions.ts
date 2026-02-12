import { IUserContext } from '@kyteapp/kyte-utils'
import I18n from '../i18n/i18n'
function getListQuestions() {
	return {
		universal: [
			I18n.t('assistant.questions.universal.sellMore'),
			I18n.t('assistant.questions.universal.promoteProducts'),
			I18n.t('assistant.questions.universal.attractClients'),
			I18n.t('assistant.questions.universal.retainClients'),
			I18n.t('assistant.questions.universal.bestPromotions'),
			I18n.t('assistant.questions.universal.organizeStock'),
			I18n.t('assistant.questions.universal.reduceCosts'),
			I18n.t('assistant.questions.universal.improveMargin'),
			I18n.t('assistant.questions.universal.definePrice'),
			I18n.t('assistant.questions.universal.whatToSell'),
			I18n.t('assistant.questions.universal.planMonth'),
			I18n.t('assistant.questions.universal.useAssistant'),
		],
		hasActiveProducts: [
			I18n.t('assistant.questions.hasActiveProducts.listProducts'),
			I18n.t('assistant.questions.hasActiveProducts.noPhoto'),
			I18n.t('assistant.questions.hasActiveProducts.bestMargin'),
			I18n.t('assistant.questions.hasActiveProducts.promoteMore'),
			I18n.t('assistant.questions.hasActiveProducts.noSales30Days'),
			I18n.t('assistant.questions.hasActiveProducts.putOnSale'),
			I18n.t('assistant.questions.hasActiveProducts.neverSold'),
		],
		hasSales: [
			I18n.t('assistant.questions.hasSales.salesThisWeek'),
			I18n.t('assistant.questions.hasSales.revenueWeek'),
			I18n.t('assistant.questions.hasSales.monthSummary'),
			I18n.t('assistant.questions.hasSales.topProductMonth'),
			I18n.t('assistant.questions.hasSales.topRevenueYesterday'),
			I18n.t('assistant.questions.hasSales.lastMonth'),
			I18n.t('assistant.questions.hasSales.yesterday'),
			I18n.t('assistant.questions.hasSales.bestDayQuarter'),
			I18n.t('assistant.questions.hasSales.bestWeekday'),
			I18n.t('assistant.questions.hasSales.averageMargin'),
			I18n.t('assistant.questions.hasSales.averageTicket'),
			I18n.t('assistant.questions.hasSales.increaseTicket'),
			I18n.t('assistant.questions.hasSales.mostProfitable'),
			I18n.t('assistant.questions.hasSales.topCategory'),
			I18n.t('assistant.questions.hasSales.lastSale'),
			I18n.t('assistant.questions.hasSales.recentGrowth'),
			I18n.t('assistant.questions.hasSales.lowSales'),
			I18n.t('assistant.questions.hasSales.specialDates'),
		],
		isStockManagementActive: [
			I18n.t('assistant.questions.isStockManagementActive.lowStock'),
			I18n.t('assistant.questions.isStockManagementActive.noStock'),
			I18n.t('assistant.questions.isStockManagementActive.replenishFirst'),
			I18n.t('assistant.questions.isStockManagementActive.excessStock'),
			I18n.t('assistant.questions.isStockManagementActive.totalValue'),
			I18n.t('assistant.questions.isStockManagementActive.highlightProducts'),
			I18n.t('assistant.questions.isStockManagementActive.slowTurnover'),
			I18n.t('assistant.questions.isStockManagementActive.topSellersWeek'),
		],
		hasSalesOrOrdersWithCustomers: [
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.loyalCustomers'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.topCustomersWeek'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.recentBuyers'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.frequentBuyers'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.topRevenueYear'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.sameBuyers'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.newCustomersMonth'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.firstTimeBuyersWeek'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.openOrders'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.longestWithoutBuying'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.noOrdersMonth'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.stoppedBuying'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.longestInactive'),
			I18n.t('assistant.questions.hasSalesOrOrdersWithCustomers.couponUsers'),
		],
		hasCatalogOrders: [
			I18n.t('assistant.questions.hasCatalogOrders.catalogSalesMonth'),
			I18n.t('assistant.questions.hasCatalogOrders.openCatalogOrders'),
			I18n.t('assistant.questions.hasCatalogOrders.catalogSalesLately'),
			I18n.t('assistant.questions.hasCatalogOrders.catalogOrdersWeek'),
			I18n.t('assistant.questions.hasCatalogOrders.bestSellersCatalog'),
			I18n.t('assistant.questions.hasCatalogOrders.highlightProductsCatalog'),
		],
		hasCatalogOrdersWithCoupons: [
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.salesWithCoupons'),
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.productsSoldWithDiscount'),
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.totalDiscountsFromCoupons'),
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.couponImpact'),
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.mostUsedCoupon'),
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.customersWithCoupons'),
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.newCustomersCoupons'),
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.daysWithMostCoupons'),
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.campaignSuccess'),
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.productsSoldWithDiscount'),
			I18n.t('assistant.questions.hasCatalogOrdersWithCoupons.totalDiscountsFromCoupons'),
		],
		hasOrders: [
			I18n.t('assistant.questions.hasOrders.newOrdersSinceYesterday'),
			I18n.t('assistant.questions.hasOrders.completedToday'),
			I18n.t('assistant.questions.hasOrders.currentStatus'),
			I18n.t('assistant.questions.hasOrders.openOrders'),
			I18n.t('assistant.questions.hasOrders.awaitingPayment'),
			I18n.t('assistant.questions.hasOrders.awaitingDelivery'),
			I18n.t('assistant.questions.hasOrders.oldestOpen'),
			I18n.t('assistant.questions.hasOrders.needsAttention'),
			I18n.t('assistant.questions.hasOrders.inSeparation'),
			I18n.t('assistant.questions.hasOrders.inDelivery'),
			I18n.t('assistant.questions.hasOrders.awaitingPaymentCount'),
			I18n.t('assistant.questions.hasOrders.inAnalysis'),
		],
		allowPayLater: [
			I18n.t('assistant.questions.allowPayLater.totalReceivable'),
			I18n.t('assistant.questions.allowPayLater.topProductsCredit'),
			I18n.t('assistant.questions.allowPayLater.openBalances'),
			I18n.t('assistant.questions.allowPayLater.usualCreditBuyers'),
			I18n.t('assistant.questions.allowPayLater.longestWithoutPaying'),
			I18n.t('assistant.questions.allowPayLater.paidThisWeek'),
			I18n.t('assistant.questions.allowPayLater.multiplePending'),
			I18n.t('assistant.questions.allowPayLater.receivedThisMonth'),
			I18n.t('assistant.questions.allowPayLater.notReceivedThisMonth'),
		],
		hasCustomSalesStatus: [
			I18n.t('assistant.questions.hasCustomSalesStatus.canceledSales'),
			I18n.t('assistant.questions.hasCustomSalesStatus.completedToday'),
			I18n.t('assistant.questions.hasCustomSalesStatus.mostActiveStatus'),
			I18n.t('assistant.questions.hasCustomSalesStatus.stuckOrders'),
			I18n.t('assistant.questions.hasCustomSalesStatus.customersWithActiveOrders'),
			I18n.t('assistant.questions.hasCustomSalesStatus.reviewToday'),
		],
		hasExpenses: [
			I18n.t('assistant.questions.hasExpenses.spentThisMonth'),
			I18n.t('assistant.questions.hasExpenses.biggestExpenseMonth'),
			I18n.t('assistant.questions.hasExpenses.spentMostThisWeek'),
			I18n.t('assistant.questions.hasExpenses.totalSpendingLastMonth'),
			I18n.t('assistant.questions.hasExpenses.spentMoreThanSold'),
			I18n.t('assistant.questions.hasExpenses.highestExpenseMonth'),
			I18n.t('assistant.questions.hasExpenses.leftAfterExpenses'),
			I18n.t('assistant.questions.hasExpenses.fixedCostsMonth'),
			I18n.t('assistant.questions.hasExpenses.expensesByCategory'),
			I18n.t('assistant.questions.hasExpenses.profitThisMonth'),
			I18n.t('assistant.questions.hasExpenses.expensesIncreased'),
			I18n.t('assistant.questions.hasExpenses.daysSpentMost'),
			I18n.t('assistant.questions.hasExpenses.spentLast7Days'),
			I18n.t('assistant.questions.hasExpenses.costsToCut'),
			I18n.t('assistant.questions.hasExpenses.averageDailyExpense'),
			I18n.t('assistant.questions.hasExpenses.top3Expenses'),
			I18n.t('assistant.questions.hasExpenses.spentMoreThanLastMonth'),
			I18n.t('assistant.questions.hasExpenses.recurringExpense'),
			I18n.t('assistant.questions.hasExpenses.expensesRiseRecentWeeks'),
		],
		hasProductsWithVariants: [
			I18n.t('assistant.questions.hasProductsWithVariants.variantsLessSold'),
			I18n.t('assistant.questions.hasProductsWithVariants.topSellingVariants'),
			I18n.t('assistant.questions.hasProductsWithVariants.productMostVariantsSold'),
			I18n.t('assistant.questions.hasProductsWithVariants.productsMostVariantTypes'),
			I18n.t('assistant.questions.hasProductsWithVariants.worthKeepingAllVariants'),
			I18n.t('assistant.questions.hasProductsWithVariants.soldNewVariantMonth'),
			I18n.t('assistant.questions.hasProductsWithVariants.variantsSoldOnce'),
		],
	}
}

function getRandomQuestions(questions: string[], count: number): string[] {
	if (questions.length === 0) return []
	if (questions.length <= count) return [...questions]

	const shuffled = [...questions].sort(() => Math.random() - 0.5)
	return shuffled.slice(0, count)
}

/**
 * Get a random set of suggested questions for the user based on their context
 * @param userContext User's business context (optional)
 * @param count Number of questions to return (default: 3)
 * @returns Array of random questions
 */
export function getSuggestedQuestions(userContext: IUserContext | null = null, count: number = 3): string[] {
	const QUESTIONS = getListQuestions()
	const availableQuestions: string[] = [...QUESTIONS.universal]

	// Add questions based on active contexts
	if (userContext?.hasActiveProducts) {
		availableQuestions.push(...QUESTIONS.hasActiveProducts)
	}

	if (userContext?.hasSales) {
		availableQuestions.push(...QUESTIONS.hasSales)
	}

	if (userContext?.isStockManagementActive) {
		availableQuestions.push(...QUESTIONS.isStockManagementActive)
	}

	if (userContext?.hasSalesOrOrdersWithCustomers) {
		availableQuestions.push(...QUESTIONS.hasSalesOrOrdersWithCustomers)
	}

	if (userContext?.hasCatalogOrders) {
		availableQuestions.push(...QUESTIONS.hasCatalogOrders)
	}

	if (userContext?.hasCatalogOrdersWithCoupons) {
		availableQuestions.push(...QUESTIONS.hasCatalogOrdersWithCoupons)
	}

	if (userContext?.hasOrders) {
		availableQuestions.push(...QUESTIONS.hasOrders)
	}

	if (userContext?.allowPayLater) {
		availableQuestions.push(...QUESTIONS.allowPayLater)
	}

	if (userContext?.hasCustomSalesStatus) {
		availableQuestions.push(...QUESTIONS.hasCustomSalesStatus)
	}

	// TODO: descomentar para a versão 2.5.3
	// if (userContext?.hasExpenses) {
	// 	availableQuestions.push(...QUESTIONS.hasExpenses)
	// }

	// if (userContext?.hasProductsWithVariants) {
	// 	availableQuestions.push(...QUESTIONS.hasProductsWithVariants)
	// }

	return getRandomQuestions(availableQuestions, count)
}

