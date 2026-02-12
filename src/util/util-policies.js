import I18n from '../i18n/i18n'

export const getTermsUrl = () => {
	switch (I18n.t('locale')) {
		case 'pt-br':
			return 'https://www.kyte.com.br/termos-de-uso'
		case 'es':
		case 'es-ES':
			return 'https://www.appkyte.com/terminos-de-uso'
		default:
		case 'en':
			return 'https://www.kyteapp.com/terms-of-use'
	}
}

export const getPolicyUrl = () => {
	switch (I18n.t('locale')) {
		case 'pt-br':
			return 'https://www.kyte.com.br/politica-de-privacidade'
		case 'es':
		case 'es-ES':
			return 'https://www.appkyte.com/politica-de-privacidad'
		default:
		case 'en':
			return 'https://www.kyteapp.com/privacy-policy'
	}
}
