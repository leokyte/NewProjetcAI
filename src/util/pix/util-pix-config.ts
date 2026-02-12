// ToDo: move to kyte-utils
import { formatCpfOrCnpj, formatPhoneBR, validateCpfOrCpnj } from '../util-common'
import { emailValidate } from '../util-form'

export enum PIX_TYPES {
	DOCUMENT_ID = 'documentId',
	PHONE = 'phone',
	EMAIL = 'email',
	RANDOM = 'random',
}

export function sanitizeText(text: string): string {
	return text.replace(/[^\d+]/g, '');
}

export const validateFormValues = ({ value, pixType }: { value: string; pixType: PIX_TYPES }) => {
	const isDocumentError = pixType === PIX_TYPES.DOCUMENT_ID && !validateCpfOrCpnj(value)
	const isEmailError = Boolean(pixType === PIX_TYPES.EMAIL && Object.keys(emailValidate({ email: value })).length > 0)
	const isPhoneError = pixType === PIX_TYPES.PHONE && value.length < 18

	if (value && (isDocumentError || isEmailError || isPhoneError)) {
		return 'invalidForm'
	}
	return true
}

export const maskValues = ({ value, pixType }: { value: string; pixType: string }) => {
	if (pixType === PIX_TYPES.DOCUMENT_ID) {
		return formatCpfOrCnpj(value)
	}
	if (pixType === PIX_TYPES.PHONE) {
		return formatPhoneBR(value)
	}
	return value
}

export const convertTimeStampToDate = (raw: any) => {
	if (raw instanceof Date) return raw

	if (typeof raw === 'string' || typeof raw === 'number') {
		const date = new Date(raw)
		if (!isNaN(date.getTime())) return date
	}

	if (raw && typeof raw === 'object' && ('_seconds' in raw)) {
		return new Date(raw._seconds * 1000 + (raw._nanoseconds || 0) / 1e6)
	}
}