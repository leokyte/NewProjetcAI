let cachedDrawerNavigator = null

export const getDrawerNavigator = () => {
	if (!cachedDrawerNavigator) {
		// Require lazily so importing Router doesn't immediately load the drawer module/worklets
		const { createDrawerNavigator } = require('@react-navigation/drawer')
		cachedDrawerNavigator = createDrawerNavigator()
	}

	return cachedDrawerNavigator
}
