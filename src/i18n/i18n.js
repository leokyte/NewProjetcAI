import I18n from 'react-native-i18n'

import en from './langs/en.js'
import pt_BR from './langs/pt_BR.js'
import es from './langs/es.js'
import es_ES from './langs/es_ES.js'

I18n.fallbacks = true

I18n.translations = {
	en,
	'pt-BR': pt_BR,
	'pt-PT': pt_BR,
	es,
	'es-ES': es_ES,
}

export function getLocale() {
	const locale = I18n.t('locale') ?? ''
	const updatedLocale = locale.substring(0, 2)

	return updatedLocale
}

export default I18n
