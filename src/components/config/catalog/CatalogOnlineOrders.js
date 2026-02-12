import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { getFormValues, getFormSyncErrors } from 'redux-form'
import _ from 'lodash'
import { Keyboard, View, Text, Linking, Alert } from 'react-native'
import { DetailPage, LoadingCleanScreen, ActionButton, TextButton, KyteIcon, KyteModal } from '../../common'
import CatalogConfigOrder from './CatalogConfigOrder'
import { storeAccountSave } from '../../../stores/actions'
import I18n from '../../../i18n/i18n'
import { colors, scaffolding, Type } from '../../../styles'
import { kyteCatalogDomain } from '../../../util'
import { PaymentGatewayServiceType } from '../../../enums'
import { logEvent } from '../../../integrations'

const Strings = {
	PAGE_TITLE: I18n.t('catalogOrderAndOthers'),
	ALLOWED_PAYMENTS_EMPTY: I18n.t('catalogConfigAllowedPaymentsEmpty'),
	CATALOG_DELIVER_ALERT: I18n.t('catalogDeliverAlert'),
}

const CatalogOnlineOrders = (props) => {
	const [isLoading, setIsLoading] = useState(false)
	const [showConfirmationModal, setShowConfirmationModal] = useState(false)

	const { form, storeAccount, route, navigation, storeAccountSave: storeAccountSaveAction, isLoaderVisible } = props
	const { params = {} } = route

	const isIndexOrigin = route.key.indexOf('FromIndex') >= 0
	const isOnlinePaymentsOrigin = route.key.indexOf('FromOnlinePayments') >= 0

	useEffect(() => {
		const configType = params.configType || null

		if (configType === 'online-payments') {
			const isOnlineOrdersAllowed = form ? form.onlineOrdersAllowed : storeAccount.catalog.onlineOrdersAllowed
			if (!isOnlineOrdersAllowed) return
		}
	}, [])

	const checkSyncErrors = () => {
		const { formSyncErrors } = props
		return !_.isEmpty(formSyncErrors)
	}

	const getFormValidationData = () => {
		const { checkoutGateways, allowDelivery } = props
		const onlinePaymentsType = PaymentGatewayServiceType.items[PaymentGatewayServiceType.CATALOG].type

		const { whatsappOrder, onlineOrdersAllowed } = form
		const allowLocalPickUp = !!storeAccount.catalog.allowLocalPickUp
		const hasPaymentGateway =
			!!checkoutGateways &&
			!!checkoutGateways.find((cg) => cg.active && !!cg.services.find((s) => s.type === onlinePaymentsType && s.active))
		const allowOtherPayments = !!storeAccount.catalog.allowOtherPayments

		return {
			onlineOrdersAllowed,
			allowDelivery,
			allowLocalPickUp,
			hasPaymentGateway,
			allowOtherPayments,
			whatsappOrder
		}
	}

	const submitForm = () => {
		const { allowDelivery, allowLocalPickUp, onlineOrdersAllowed, whatsappOrder } = getFormValidationData()
		// Always get stockConfig from accountStore
		const { displayNoStockItems, displayNoStockAsUnavailable } = storeAccount.catalog
		const isChangedOnlineOrdersAllowed = onlineOrdersAllowed !== storeAccount.catalog.onlineOrdersAllowed
		const isChangedWhatsappOrder = whatsappOrder !== storeAccount.catalog.whatsappOrder

		if (onlineOrdersAllowed && !allowDelivery && !allowLocalPickUp) {
			return Alert.alert(I18n.t('words.s.attention'), Strings.CATALOG_DELIVER_ALERT)
		}
		

		if (onlineOrdersAllowed && isChangedOnlineOrdersAllowed) {
			logEvent("Catalog Orders Enable")
		}
		if(!onlineOrdersAllowed && isChangedOnlineOrdersAllowed){
			logEvent("Catalog Orders Disable")
		}

		if (whatsappOrder && isChangedWhatsappOrder) {
			logEvent("Catalog Whatsapp Summary Enable")
		}
		if (!whatsappOrder && isChangedWhatsappOrder) {
			logEvent("Catalog Whatsapp Summary Disable", { where: "settings"})
		}

		Keyboard.dismiss()
		setIsLoading(true)

		const catalog = {
			...storeAccount.catalog,
			...form,
			displayNoStockAsUnavailable,
			displayNoStockItems,
		}

		const store = { ...storeAccount, catalog }
		storeAccountSaveAction(store, () => {
			setIsLoading(false)

			if (isOnlinePaymentsOrigin) return navigation.goBack()
			if (!isIndexOrigin) setShowConfirmationModal(true)
			else navigation.popToTop()
		})
	}

	const renderConfirmationModal = () => {
		const { bottomContainer } = scaffolding

		const hideModal = () => setShowConfirmationModal(false)

		return (
			<KyteModal fullPage height="100%" isModalVisible hideFullPage={() => hideModal()}>
				<View style={{ flex: 1, marginBottom: 0 }}>
					<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
						<KyteIcon name="check-inner" size={120} color={colors.actionColor} />
						<Text style={[Type.fontSize(16), Type.SemiBold, { color: colors.primaryBg, textAlign: 'center' }]}>
							{I18n.t('catalogSavedSuccessfully')}
						</Text>

						<TextButton
							color={colors.actionColor}
							size={14}
							title={I18n.t('catalogOpenTitle')}
							onPress={() => Linking.openURL(`https://${storeAccount.urlFriendly}${kyteCatalogDomain}`)}
							style={[{ paddingTop: 40 }, Type.SemiBold]}
						/>
					</View>

					<View style={bottomContainer}>
						<ActionButton
							onPress={() => {
								hideModal()
								navigation.popToTop()
							}}
						>
							OK
						</ActionButton>
					</View>
				</View>
			</KyteModal>
		)
	}

	return (
		<DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()}>
			<CatalogConfigOrder
				onFinish={submitForm}
				backToStoreForm={() => navigation.navigate({ name: 'CatalogStore', key: 'CatalogStoreFromOrderConfig' })}
				checkSyncErrors={checkSyncErrors}
			/>
			{isLoading || isLoaderVisible ? <LoadingCleanScreen /> : null}
			{showConfirmationModal ? renderConfirmationModal() : null}
		</DetailPage>
	)
}

const mapStateToProps = (state) => ({
	form: getFormValues('ConfigStoreOrderForm')(state),
	isLoaderVisible: state.common.loader.visible,
	formSyncErrors: getFormSyncErrors('ConfigStoreOrderForm')(state),
	storeAccount: state.auth.store,
	checkoutGateways: state.auth.store.checkoutGateways || [],
	allowDelivery: state.auth.store.shippingFees ? state.auth.store.shippingFees.active : false,
})

export default connect(mapStateToProps, { storeAccountSave })(CatalogOnlineOrders)
