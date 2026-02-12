/** Enum for blocked test emails */
export enum BlackListedTestEmail {
	Google = '@google.com',
	Apple = '@apple.com',
	CloudTestLab = 'cloudtestlabaccounts.com',
}

/** Enum for core app actions */
export enum CoreAction {
	FirstSale = 'first-sale',
	FirstProduct = 'first-product',
	FirstCustomer = 'first-customer',
	PublishCatalog = 'publish-catalog',
	InviteUsers = 'invite-users',
	ShareCatalog = 'share-catalog',
	ConfigReceipt = 'config-receipt',
}

/** Enum for subscription bypass experiments */
export enum ByPassSubscriptionExperiment {
	ByPassEnabled = 'web',
	ByPassDisabled = 'loja',
	ByPassIgnore = 'ignore',
}

/** Enum for trial magic registration experiments */
export enum TrialMagicRegistrationExperiment {
	TrialMagicEnabled = 'true',
	TrialMagicDisabled = 'false',
}
