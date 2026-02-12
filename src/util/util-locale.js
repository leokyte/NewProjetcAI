export const getNormalizedLocale = (locale) => {
	if (locale.startsWith('es')) {
		return 'es'
	}

	if (locale.startsWith('pt')) {
		return 'pt'
	}

	if (locale.startsWith('en')) {
		return 'en'
	}

	return locale
}
