export const FirebaseAnalytics = {
	IOS_PAYMENT_CONFIRMATION_SUCCESSFUL: 0,
	IOS_PAYMENT_CONFIRMATION_FAIL: 1,
	ANDROID_PAYMENT_CONFIRMATION_SUCCESS: 2,
	ANDROID_PAYMENT_CONFIRMATION_FAIL: 3,
	USER_SIGN_IN: 4,

	items: [
		{ type: 'IOSPaymentConfirmationSuccess' },
		{ type: 'IOSPaymentConfirmationFail' },
		{ type: 'AndroidPaymentConfirmationSuccess' },
		{ type: 'AndroidPaymentConfirmationFail' },
		{ type: 'UserSignIn' },
	],
}

export const FirebaseUserProperties = {
	NAME: 'name',
	EMAIL: 'email',
	AID: 'aid',
	UID: 'uid',
	DT_LAST_SALE: 'dt_last_created_sale',
	IS_OWNER: 'is_owner',
	IS_CONFIRMED: 'is_confirmed',
	IS_IN_TOLERANCE: 'is_in_tolerance',
	DATE_CREATION: 'date_creation',
	BILLING_END_DATE: 'billing_end_date',
	BILLING_STATUS: 'billing_status',
	BILLING_PLAN: 'billing_plan',
	BILLING_BUY_DATE: 'billing_buy_date',
	CATALOG_URL: 'catalog_url',
	LANGUAGE_OVERRIDE: 'language_override',
	SESSION_START: 'session_start',
	SIGN_UP: 'sign_up',
	FIRST_OPEN: 'first_open',
	LOGIN_PROVIDER: 'login_provider',
	KID: 'kid',
}
