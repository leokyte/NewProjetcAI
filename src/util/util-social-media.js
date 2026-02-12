export const generateFeedUrl = async (partner) => {
	const store = (await import('../App')).store.getState()
	const { urlFriendly } = store.auth.store

	return `https://${urlFriendly}.kyte.site/feed/${partner}`
}
