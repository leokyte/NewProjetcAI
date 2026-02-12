import { connect } from 'react-redux'
import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import {
	initConnection,
	clearTransactionIOS,
	getSubscriptions,
	getAvailablePurchases,
	purchaseUpdatedListener,
	purchaseErrorListener,
	finishTransaction,
} from 'react-native-iap'
import { IAP_SUBSCRIPTIONS_LIST } from '../../../enums'
import { logError } from '../../../integrations/Firebase-Integration'
import KyteMixpanel from '../../../integrations/Mixpanel'
import {
	handleIAPSubscriptionSuccess,
	setStorePlans,
	toggleBillingErrorMessageVisibility,
} from '../../../stores/actions'
import { sendConfirmationErrorEvents } from '../../../util'
import { kyteApiRegisterInAppPurchase } from '../../../services'

const IAPHandler = ({
	aid,
	setStorePlans: setStorePlansAction,
	toggleBillingErrorMessageVisibility: toggleBillingErrorMessageVisibilityAction,
	handleIAPSubscriptionSuccess: handleIAPSubscriptionSuccessAction,
}) => {
	const [subscriptions, setSubscriptions] = useState([])
	const [availablePurchases, setAvailablePurchases] = useState([])
	const [latestPurchase, setLatestPurchase] = useState(null)
	const [latestError, setLatestError] = useState(null)

	// Clear transactions on iOS
	const cleariOSTransaction = useCallback(async () => {
		if (Platform.OS === 'ios') {
			try {
				// Defensive check for clearTransactionIOS availability
				if (typeof clearTransactionIOS === 'function') {
					await clearTransactionIOS()
				}
			} catch (err) {
				logError(err, '[error] IAPClearTransactionIOS')
			}
		}
	}, [])

	const loadSubscriptions = useCallback(async () => {
		try {
			const response = await getSubscriptions(IAP_SUBSCRIPTIONS_LIST)
			setSubscriptions(response || [])
		} catch (error) {
			logError(error, '[error] IAPGetSubscriptions')
		}
	}, [])

	const loadAvailablePurchases = useCallback(async () => {
		try {
			const purchases = await getAvailablePurchases()
			setAvailablePurchases(purchases || [])

			if (Platform.OS === 'android' && purchases?.length) {
				await Promise.all(
					purchases.map(async (purchase) => {
						try {
							// Only finish purchases that are:
							// 1. Not yet acknowledged
							// 2. In PURCHASED state (purchaseStateAndroid === 1)
							// 3. Have all required Android properties
							const isPurchased = purchase.purchaseStateAndroid === 1
							const isNotAcknowledged = !purchase.isAcknowledgedAndroid
							const hasRequiredProps = purchase.purchaseToken && purchase.productId

							if (isPurchased && isNotAcknowledged && hasRequiredProps) {
								await finishTransaction({ purchase, isConsumable: false })
							}
						} catch (error) {
							logError(error, '[error] IAPPendingPurchaseFinish')
						}
					})
				)
			}
		} catch (error) {
			logError(error, '[error] IAPGetAvailablePurchases')
		}
	}, [finishTransaction])

	// Initialize IAP connection and gets subscriptions
	const IAPInitConnection = useCallback(async () => {
		try {
			// Initialize IAP connection
			await initConnection()

			// Clear any pending transactions
			await cleariOSTransaction()

			// Get subscriptions
			await loadSubscriptions()
			await loadAvailablePurchases()
		} catch (error) {
			logError('[error] IAPInitConnection', error)
		}
	}, [cleariOSTransaction, loadAvailablePurchases, loadSubscriptions])

	// Send error events when listening to subscription errors,
	// only if the error code has changed
	const logIAPSubscriptionError = useCallback(() => {
		if (latestError?.code) {
			sendConfirmationErrorEvents(aid, latestError.message)
		}
	}, [aid, latestError])

	// Adding subscriptions to plans reducer
	const updateStorePlans = useCallback(() => {
		setStorePlansAction(subscriptions)
	}, [setStorePlansAction, subscriptions])

	// Handle IAP subscription success and finish transaction
	const processSubscriptionSuccess = useCallback(() => {
		if (latestPurchase) {
			handleIAPSubscriptionSuccessAction(latestPurchase, finishTransaction)
		}
	}, [handleIAPSubscriptionSuccessAction, latestPurchase])

	// Shows billing error message when message is not at blacklist
	const showBillingErrorMessage = useCallback(() => {
		if (latestError) {
			toggleBillingErrorMessageVisibilityAction(true, latestError.code)
		}
	}, [latestError, toggleBillingErrorMessageVisibilityAction])

	const logCurrentPurchages = useCallback(() => {
		if (availablePurchases?.length || latestPurchase) {
			const payload = {
				currentPurchase: latestPurchase,
				availablePurchases,
			}
			KyteMixpanel.track('IAP Purchase Snapshot', payload)
		}
	}, [availablePurchases, latestPurchase])

	const registerInAppPurchase = useCallback(async () => {
		if ((availablePurchases?.length || latestPurchase) && aid) {
			try {
				await kyteApiRegisterInAppPurchase({ aid, currentPurchase: latestPurchase, availablePurchases })
			} catch (err) {
				logError(err, '[error] IAPRegisterInAppPurchase')
			}
		}
	}, [aid, availablePurchases, latestPurchase])

	useEffect(() => {
		const purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
			setLatestPurchase(purchase)
		})

		const purchaseErrorSubscription = purchaseErrorListener((error) => {
			setLatestError(error)
		})

		return () => {
			purchaseUpdateSubscription.remove()
			purchaseErrorSubscription.remove()
		}
	}, [])

	useEffect(() => {
		IAPInitConnection()
	}, [IAPInitConnection])

	useEffect(() => {
		logIAPSubscriptionError()
	}, [logIAPSubscriptionError])

	useEffect(() => {
		updateStorePlans()
	}, [updateStorePlans])

	useEffect(() => {
		processSubscriptionSuccess()
	}, [processSubscriptionSuccess])

	useEffect(() => {
		showBillingErrorMessage()
	}, [showBillingErrorMessage])

	useEffect(() => {
		logCurrentPurchages()
	}, [logCurrentPurchages])

	useEffect(() => {
		registerInAppPurchase()
	}, [registerInAppPurchase])

	return null
}

const mapStateToProps = ({ auth }) => ({
	aid: auth.aid,
})

export default connect(mapStateToProps, {
	setStorePlans,
	toggleBillingErrorMessageVisibility,
	handleIAPSubscriptionSuccess,
})(IAPHandler)
