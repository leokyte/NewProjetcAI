import { CardServiceConfigError } from '../enums/CardServiceConfigError'

export function checkIsCardServiceCustomized(cardServiceConfig) {
	const isCustomDebitCardConfigActive = Boolean(cardServiceConfig?.credit?.active)
	const isCustomCreditCardConfigActive = Boolean(cardServiceConfig?.debit?.active)
	const isCardServiceConfigCustomized = isCustomDebitCardConfigActive || isCustomCreditCardConfigActive

	return isCardServiceConfigCustomized
}

export function getCardServiceFormInitialValues(cardServiceConfig) {
	const { debit = {}, credit = {} } = cardServiceConfig ?? {}
	const DEFAULT_PERIOD_TYPE = 'days'
	const updatedCreditConfig = {
		active: Boolean(credit?.active && (credit?.settlementPeriod || credit?.serviceFee)) || false,
		settlementPeriod: Number(credit?.settlementPeriod) ?? 0,
		serviceFee: Number(credit?.serviceFee) ?? 0,
		settlementPeriodType: credit?.settlementPeriodType ?? DEFAULT_PERIOD_TYPE,
	}
	const updatedDebitConfig = {
		active: Boolean(debit?.active && (debit?.settlementPeriod || debit?.serviceFee)) || false,
		settlementPeriod: Number(debit?.settlementPeriod) ?? 0,
		serviceFee: Number(debit?.serviceFee) ?? 0,
		settlementPeriodType: debit?.settlementPeriodType ?? DEFAULT_PERIOD_TYPE,
	}

	if (!credit?.active) {
		updatedCreditConfig.settlementPeriod = 0
		updatedCreditConfig.serviceFee = 0
	}

	if (!debit?.active) {
		updatedDebitConfig.settlementPeriod = 0
		updatedDebitConfig.serviceFee = 0
	}

	return { credit: updatedCreditConfig, debit: updatedDebitConfig }
}

export function validateCardServiceConfig(cardServiceConfig) {
	const { debit, credit } = cardServiceConfig
	const getErrorType = (config) => {
		if (config?.active) {
			const settlementPeriod = Number.isNaN(Number(config?.settlementPeriod)) ? 0 : Number(config?.settlementPeriod)
			const serviceFee = Number.isNaN(Number(config?.serviceFee)) ? 0 : Number(config?.serviceFee)

			if (!settlementPeriod && !serviceFee) return CardServiceConfigError.NO_PERIOD_AND_FEE
			if (!settlementPeriod) return CardServiceConfigError.NO_PERIOD
			if (!serviceFee) return CardServiceConfigError.NO_FEE
		}

		return undefined
	}

	const errorType = getErrorType(debit) || getErrorType(credit)

	return errorType
}
