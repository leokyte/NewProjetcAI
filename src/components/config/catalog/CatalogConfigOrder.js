import React, { useState, useEffect } from 'react'
import { View, ScrollView, Platform, Text } from 'react-native'
import { change, getFormValues, reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import { KytePro, KyteSwitch, NotificationType } from '@kyteapp/kyte-ui-components'
import _ from 'lodash'
import I18n from '../../../i18n/i18n'
import {
	generateDefaultPROFeatures,
	getPROFeature,
	isBetaCatalog,
	renderBoldText,
	NEW_CATALOG_VERSION,
} from '../../../util'
import { startLoading, openModalWebview, goBackToCatalogVersion2, storeAccountSave } from '../../../stores/actions'
import { colors, colorSet, Type } from '../../../styles'
import { ActionButton, LoadingCleanScreen, SwitchContainer, KyteText } from '../../common'
import NavigationService from '../../../services/kyte-navigation'
import ConfigMenuItem from '../general/ConfigMenuItem'
import ActivateCatalogBetaModal from '../../common/modals/ActivateCatalogBetaModal'
import { ActiveBetaPostOrderImg } from '../../../../assets/images/catalog/post-order-active-beta-modal'
import ActiveBetaWhatsappResumeImg from '../../../../assets/images/catalog/whatsapp-resume-active-beta-modal'
import WhatsappAddModal from '../../common/modals/WhatsappAddModal'
import WhatsappAddImg from '../../../../assets/images/catalog/whatsapp-add-modal'
import { logEvent } from '../../../integrations'
import NeedDeliveryMethodModal from '../../common/modals/NeedDeliveryMethodModal'
import { ActiveDelivery } from '../../../../assets/images'
import KyteNotifications from '../../common/KyteNotifications'

const Strings = {
	GUEST_DISABLED_TITLE: I18n.t('guestDisabled.title'),
	GUEST_DISABLED_DESC: I18n.t('guestDisabled.desc'),
	ALLOW_GUEST_CHECKOUT_TITLE: I18n.t('AllowGuestCheckout.title'),
	ALLOW_GUEST_CHECKOUT_DESC1: I18n.t('AllowGuestCheckout.desc1'),
	ALLOW_GUEST_CHECKOUT_DESC2: I18n.t('AllowGuestCheckout.desc2'),
	ALLOW_GUEST_CHECKOUT_DESC3: I18n.t('AllowGuestCheckout.desc3'),
	OFF: I18n.t('words.s.off'),
	ON: I18n.t('words.s.on'),
	DELIVERY_LABEL: I18n.t('words.p.deliver'),
	SHIPPING_FEES_LABEL: I18n.t('ShippingFees.NewPageTitle'),
	PICKUP_LABEL: I18n.t('words.s.withdrawal'),
	TAX_LABEL: I18n.t('words.s.tax'),
	PAYMENT_METHODS: I18n.t('catalogPaymentMethods.orderTitle'),
	PAYMENT_METHODS_DESCRIPTION: I18n.t('catalogPaymentMethods.orderSubtitle'),
	ONLINE_PAYMENTS_LABEL: I18n.t('catalogConfig.onlinePayments.label'),
	ALLOWED_PAYMENTS_EMPTY: I18n.t('catalogConfigAllowedPaymentsEmpty'),
	CATALOG_DELIVER_ALERT: I18n.t('catalogDeliverAlert'),
	PAYMENTS_ALERT: I18n.t('catalogConfig.noPaymentsAlert'),
	WHATSAPP_RESUME_TITLE: I18n.t('catalogConfig.whatsappOrderTitle'),
	WHATSAPP_RESUME_TEXT: I18n.t('catalogConfig.whatsappOrderText'),
	WHATSAPP_SUCCESS_MESSAGE: I18n.t('catalogConfig.whatsappSuccessMessage'),
	POST_ORDER: I18n.t('postOrderOrientation.pageTitle'),
}

const CatalogConfigOrder = ({ ...props }) => {
	const { storeState, catalogConfig, billing, betaCatalogActive, onFinish, storeWhatsapp, storeAccountSave } = props

	const [onlineOrdersAllowed, setOnlineOrdersAllowed] = useState(catalogConfig.onlineOrdersAllowed || false)
	const [whatsappOrder, setWhatsappOrder] = useState(catalogConfig.whatsappOrder || false)
	const [allowGuestCheckout, setAllowGuestCheckout] = useState(catalogConfig.allowGuestCheckout || false)
	const [isLoading, setIsLoading] = useState(true)
	const [PROFeatures, setPROFeatures] = useState(generateDefaultPROFeatures('PROOnlineOrders'))
	const [showPostOrderCatalogBetaActiveModal, setShowPostOrderCatalogBetaActiveModal] = useState(false)
	const [showWhatsAppResumeCatalogBetaActiveModal, setShowWhatsAppResumeCatalogBetaActiveModal] = useState(false)
	const [showWhatsappAddModal, setShowWhatsappAddModal] = useState(false)
	const [showDeliveryModal, setShowDeliveryModal] = useState(false)
	const [toast, setToast] = useState(null)
	const toasTimer = 3000
	const removeToast = () => setToast(null)
	const defaultToastProps = { handleClose: removeToast, onAutoDismiss: removeToast }

	const getPROFeatures = async () => {
		setIsLoading(true)
		const PROOnlineOrders = await getPROFeature('PROOnlineOrders')
		setPROFeatures({ PROOnlineOrders })
		setIsLoading(false)
	}

	const validateInfo = () => {
		const { formValues, allowDelivery } = props

		const {
			whatsappOrder: whatsappOrderValue,
			allowGuestCheckout: allowGuestCheckoutValue,
			onlineOrdersAllowed: isOnlineOrdersAllowed,
		} = formValues
		const { allowLocalPickUp } = catalogConfig
		return { isOnlineOrdersAllowed, allowDelivery, allowLocalPickUp, whatsappOrderValue, allowGuestCheckoutValue }
	}

	useEffect(() => {
		getPROFeatures()
	}, [billing.toleranceEndDate, billing.endDate, billing.status])

	useEffect(() => {
		getPROFeatures()
		props.change('onlineOrdersAllowed', !!catalogConfig.onlineOrdersAllowed)
		props.change('whatsappOrder', !!catalogConfig.whatsappOrder)
		props.change('displayNoStockItems', !!catalogConfig.displayNoStockItems)
		props.change('allowGuestCheckout', !!catalogConfig.allowGuestCheckout)
	}, [])

	const renderSwitchSection = (sectionDetails, containerStyle, isFree) => {
		const {
			title,
			titleStyle,
			description,
			descriptionStyle,
			onPressAction,
			stateListener,
			feature = null,
			disabled = false,
			tagNew = false,
		} = sectionDetails

		const tagProActive = feature?.isPaid && isFree

		return (
			<View style={styles.switchSection}>
				<SwitchContainer
					isFree={isFree}
					title={title}
					titleStyle={[styles.switchTitleStyle, titleStyle]}
					description={description}
					descriptionStyle={descriptionStyle}
					onPress={onPressAction}
					style={[styles.switchSectionContainer, containerStyle]}
					disabled={disabled}
					tagNew={tagNew}
					betaCatalogActive={betaCatalogActive}
				>
					{!tagProActive && <KyteSwitch onValueChange={onPressAction} active={stateListener} disabled={disabled} />}
				</SwitchContainer>
			</View>
		)
	}

	const renderOnlineOrders = () => {
		const { catalog } = storeState
		const { onlineOrderDescription } = styles

		const catalogOnlineOrdersAllowText = (
			<KyteText style={onlineOrderDescription(colors.primaryBg)}>
				{`${I18n.t('catalogOnlineOrdersAllowText1')} `}
				<KyteText weight="Medium">{`${_.upperFirst(I18n.t('words.p.pending'))} `}</KyteText>
				{`${I18n.t('catalogOnlineOrdersAllowText2')} `}
				<KyteText weight="Medium">{_.upperFirst(I18n.t('words.p.confirmed'))}</KyteText>.
				{`\n${I18n.t('catalogOnlineOrdersAllowText3')} `}
				<KyteText weight="Medium">{_.upperFirst(I18n.t('defaultStatus.paid'))}</KyteText>.
			</KyteText>
		)

		const onlineOrder = {
			title: I18n.t('catalogOnlineOrdersAllow'),
			description: betaCatalogActive ? (
				<KyteText style={onlineOrderDescription(colors.primaryBg)}>
					{renderBoldText(I18n.t('newCatalogOnlineOrdersAllowText'))}
				</KyteText>
			) : (
				catalogOnlineOrdersAllowText
			),
			onPressAction: () => {
				if (!catalog?.allowLocalPickUp && !storeState?.shippingFees?.active) {
					setShowDeliveryModal(!showDeliveryModal)
				} else {
					setOnlineOrdersAllowed(!onlineOrdersAllowed)
					props.change('onlineOrdersAllowed', !onlineOrdersAllowed)
					if (!onlineOrdersAllowed && storeWhatsapp && betaCatalogActive) {
						setWhatsappOrder(true)
						props.change('whatsappOrder', true)
					} else {
						setWhatsappOrder(false)
						props.change('whatsappOrder', false)
					}
				}
			},
			stateListener: onlineOrdersAllowed,
			feature: PROFeatures.PROOnlineOrders,
		}

		return (
			<KytePro
				billing={billing}
				feature={PROFeatures.PROOnlineOrders}
				component={(isFree) => renderSwitchSection(onlineOrder, null, isFree)}
				onPressFree={() => props.openModalWebview(onlineOrder.feature.infoURL)}
			/>
		)
	}

	const renderWhatsResume = () => {
		const { onlineOrderDescription } = styles
		const { isOnlineOrdersAllowed } = validateInfo()

		const whatsResume = {
			title: Strings.WHATSAPP_RESUME_TITLE,
			description: (
				<KyteText style={[onlineOrderDescription(colors.primaryBg), { opacity: onlineOrdersAllowed ? 1 : 0.4 }]}>
					{renderBoldText(Strings.WHATSAPP_RESUME_TEXT)}
				</KyteText>
			),
			onPressAction: () => {
				if (betaCatalogActive) {
					if (storeWhatsapp) {
						if (!isOnlineOrdersAllowed && !whatsappOrder) {
							setOnlineOrdersAllowed(true)
							props.change('onlineOrdersAllowed', true)
						}
						setWhatsappOrder(!whatsappOrder)
						props.change('whatsappOrder', !whatsappOrder)
					} else {
						setShowWhatsappAddModal(true)
					}
				} else {
					setShowWhatsAppResumeCatalogBetaActiveModal(true)
				}
			},
			stateListener: whatsappOrder,
			feature: PROFeatures.PROOnlineOrders,
			tagNew: true,
		}

		return (
			<KytePro
				billing={billing}
				feature={PROFeatures.PROOnlineOrders}
				component={(isFree) => renderSwitchSection(whatsResume, null, isFree)}
				onPressFree={() => props.openModalWebview(whatsResume.feature.infoURL)}
			/>
		)
	}

	const renderNeedActiveCatalogBetaModal = (modalType) => {
		const modalSettings = {
			postOrder: {
				setModalDescative: () => setShowPostOrderCatalogBetaActiveModal(false),
				isVisible: showPostOrderCatalogBetaActiveModal,
				image: ActiveBetaPostOrderImg,
				subtitle: 'postOrderActiveBetaModal.subtitle',
				onSave: () => {
					NavigationService.navigate(null, 'PostOrder')
				},
				imageStyles: { height: 191, width: 174 },
				logEventParams: { where: 'order_message' },
			},
			whatsappResume: {
				setModalDescative: () => setShowWhatsAppResumeCatalogBetaActiveModal(false),
				isVisible: showWhatsAppResumeCatalogBetaActiveModal,
				image: ActiveBetaWhatsappResumeImg,
				subtitle: 'whatsappResumeActiveBetaModal.subtitle',
				onSave: () => {
					if (storeState.whatsapp) {
						if (!onlineOrdersAllowed) {
							setOnlineOrdersAllowed(true)
							props.change('onlineOrdersAllowed', true)
						}
						setWhatsappOrder(true)
						props.change('whatsappOrder', true)
					} else setShowWhatsappAddModal(true)
				},
				imageStyles: { height: 189, width: 164 },
				logEventParams: { where: 'whatsapp_summary' },
			},
		}

		logEvent('Catalog Version Exclusive Feature', modalSettings[modalType].logEventParams)

		const handleConfirmModal = () => {
			modalSettings[modalType].setModalDescative()

			storeAccountSave({ ...storeState, catalog: { ...catalogConfig, version: NEW_CATALOG_VERSION } }, () => {
				logEvent('Catalog Version Change', {
					...modalSettings[modalType].logEventParams,
					catalog_version: NEW_CATALOG_VERSION,
				})
				modalSettings[modalType].onSave()
			})
		}

		const handleCancelModal = () => {
			modalSettings[modalType].setModalDescative()
		}

		return (
			<ActivateCatalogBetaModal
				onPress={handleConfirmModal}
				hideModal={handleCancelModal}
				isVisible={modalSettings[modalType].isVisible}
				image={modalSettings[modalType].image}
				subtitle={modalSettings[modalType].subtitle}
				imgStyles={modalSettings[modalType].imageStyles}
			/>
		)
	}

	const rendeWhatsappAddModal = () => {
		const handleConfirmModal = (whatsapp) => {
			setShowWhatsappAddModal(false)
			props.storeAccountSave({ ...storeState, whatsapp }, () => {
				setToast({
					...defaultToastProps,
					timer: toasTimer,
					title: Strings.WHATSAPP_SUCCESS_MESSAGE,
					type: NotificationType.SUCCESS,
				})
				setWhatsappOrder(!whatsappOrder)
				props.change('whatsappOrder', !whatsappOrder)
				if (!onlineOrdersAllowed) {
					setOnlineOrdersAllowed(true)
					props.change('onlineOrdersAllowed', true)
				}
				logEvent('WhatsApp Number Add', { where: 'whatsapp_summary' })
			})
		}

		const handleCancelModal = () => setShowWhatsappAddModal(false)

		return (
			<WhatsappAddModal
				onPress={handleConfirmModal}
				hideModal={handleCancelModal}
				isVisible={showWhatsappAddModal}
				imageUri={WhatsappAddImg}
			/>
		)
	}

	const renderConfigMenu = () => {
		const { allowDelivery } = props
		const { allowLocalPickUp, allowOnlineTax, allowOtherPayments } = catalogConfig

		const Pickup = PROFeatures.PROOnlineOrders.innerFeatures.find((i) => i.name === 'OnlineOrders_Pickup')
		const Fee = PROFeatures.PROOnlineOrders.innerFeatures.find((i) => i.name === 'OnlineOrders_Fee')
		const Delivery = PROFeatures.PROOnlineOrders.innerFeatures.find((i) => i.name === 'OnlineOrders_DeliveryRates')

		const PaymentMethods = PROFeatures.PROOnlineOrders.innerFeatures.find(
			(i) => i.name === 'OnlineOrders_PaymentMethods'
		)

		const handleActionPostOrder = () => {
			if (betaCatalogActive) {
				return NavigationService.navigate(null, 'PostOrder')
			}
			setShowPostOrderCatalogBetaActiveModal(true)
		}

		const menus = [
			{
				index: 1,
				type: 'post-order',
				badge: true,
				label: Strings.POST_ORDER,
				status: betaCatalogActive,
				action: () => handleActionPostOrder(),
				feature: PROFeatures.PROOnlineOrders,
				isNewCatalogFeature: !betaCatalogActive,
			},
			{
				index: 2,
				type: 'delivery',
				label: Strings.SHIPPING_FEES_LABEL,
				subtitle: allowDelivery ? Strings.ON : Strings.OFF,
				status: !!allowDelivery,
				action: () => NavigationService.navigate(null, 'ShippingFees', { who: 'delivery' }),
				feature: { ...PROFeatures.PROOnlineOrders, infoType: Delivery.infoType, infoURL: Delivery.infoURL },
			},
			{
				index: 3,
				type: 'pick-up',
				label: Strings.PICKUP_LABEL,
				subtitle: allowLocalPickUp ? Strings.ON : Strings.OFF,
				status: !!allowLocalPickUp,
				feature: {
					...PROFeatures.PROOnlineOrders,
					infoType: Pickup.infoType,
					infoURL: Pickup.infoURL,
				},
				renderTagPro: PROFeatures.PROOnlineOrders.isPaid,
				action: () => NavigationService.navigate(null, 'CatalogOnlineOrderSettings', { who: 'pick-up' }),
			},
			{
				index: 4,
				type: 'tax',
				label: Strings.TAX_LABEL,
				subtitle: allowOnlineTax ? Strings.ON : Strings.OFF,
				status: !!allowOnlineTax,
				feature: { ...PROFeatures.PROOnlineOrders, infoType: Fee.infoType, infoURL: Fee.infoURL },
				renderTagPro: PROFeatures.PROOnlineOrders.isPaid,
				action: () => NavigationService.navigate(null, 'CatalogOnlineOrderSettings', { who: 'tax' }),
			},
			{
				index: 5,
				type: 'other-payments',
				label: Strings.PAYMENT_METHODS,
				description: `${Strings.PAYMENT_METHODS_DESCRIPTION}.`,
				status: !!allowOtherPayments,
				feature: {
					...PROFeatures.PROOnlineOrders,
					infoType: PaymentMethods.infoType,
					infoURL: PaymentMethods.infoURL,
				},
				renderTagPro: PROFeatures.PROOnlineOrders.isPaid,
				action: () => NavigationService.navigate(null, 'CatalogOrderPayments', { who: 'other-payments' }),
			},
		]

		return menus.filter((menu) => !menu.isDisabled).map((menu) => ConfigMenuItem(menu, billing, props.openModalWebview))
	}

	const renderAllowGuestCheckout = () => {
		const GuestOrders = PROFeatures.PROOnlineOrders.innerFeatures.find((i) => i.name === 'OnlineOrders_GuestOrders')

		const allowGuestCheckoutDesc = (
			<KyteText style={styles.onlineOrderDescription(colors.primaryBg)}>
				{Strings.ALLOW_GUEST_CHECKOUT_DESC1}
				<KyteText weight="Medium">{Strings.ALLOW_GUEST_CHECKOUT_DESC2}</KyteText>
				{Strings.ALLOW_GUEST_CHECKOUT_DESC3}
			</KyteText>
		)
		const allowGuest = {
			title: Strings.ALLOW_GUEST_CHECKOUT_TITLE,
			description: allowGuestCheckoutDesc,
			onPressAction: () => {
				setAllowGuestCheckout(!allowGuestCheckout)
				props.change('allowGuestCheckout', !allowGuestCheckout)
			},
			stateListener: allowGuestCheckout,
			feature: {
				...PROFeatures.PROOnlineOrders,
				infoType: GuestOrders.infoType,
				infoURL: GuestOrders.infoURL,
			},
		}

		const renderDisabledComponent = (isFree) => (
			<View style={styles.itemContainer}>
				<View style={{ opacity: 0.4 }}>
					<Text style={[styles.switchTitleStyle, { marginBottom: 8 }]}>{Strings.GUEST_DISABLED_TITLE}</Text>
					<KyteText style={[styles.onlineOrderDescription(colors.primaryBg), { paddingRight: isFree ? 90 : 0 }]}>
						{renderBoldText(Strings.GUEST_DISABLED_DESC)}
					</KyteText>
				</View>
			</View>
		)

		return (
			<KytePro
				billing={billing}
				feature={allowGuest.feature}
				component={(isFree) =>
					betaCatalogActive ? renderDisabledComponent(isFree) : renderSwitchSection(allowGuest, null, isFree)
				}
				onPressFree={() => props.openModalWebview(allowGuest.feature.infoURL)}
			/>
		)
	}

	const validateMissingInfos = () => {
		const { isOnlineOrdersAllowed, allowDelivery, allowLocalPickUp, whatsappOrderValue, allowGuestCheckoutValue } =
			validateInfo()
		const { onlineOrdersAllowed, whatsappOrder, allowGuestCheckout } = catalogConfig

		const isOnlineOrdersChanged = isOnlineOrdersAllowed !== onlineOrdersAllowed
		const isWppOrdersChanged = whatsappOrderValue !== whatsappOrder
		const isAllowGuestChanged = allowGuestCheckoutValue !== allowGuestCheckout

		return (
			!!(isOnlineOrdersAllowed && !allowDelivery && !allowLocalPickUp) ||
			(!isOnlineOrdersChanged && !isWppOrdersChanged && !isAllowGuestChanged)
		)
	}

	const getErrorMessage = () => {
		const { isOnlineOrdersAllowed, allowDelivery, allowLocalPickUp } = validateInfo()

		if (isOnlineOrdersAllowed && !allowDelivery && !allowLocalPickUp) {
			return Strings.CATALOG_DELIVER_ALERT
		}

		return I18n.t('enterAllfields')
	}

	const renderNeedDeliveryMethodModal = () => {
		const strings = {
			t_first_button: I18n.t('needDeliveryMethodModal.configureDelivery'),
			t_second_button: I18n.t('needDeliveryMethodModal.configurePickUp'),
			t_title: I18n.t('justLittleLeft'),
			t_subtitle: I18n.t('needDeliveryMethodModal.subtitle'),
		}

		const hideModal = () => setShowDeliveryModal(!showDeliveryModal)

		const handleClickPickUp = () => {
			NavigationService.navigate(null, 'CatalogOnlineOrderSettings', { who: 'pick-up' })
			hideModal()
		}

		const handleClickDelivery = () => {
			NavigationService.navigate(null, 'ShippingFees', { who: 'delivery' })
			hideModal()
		}

		return (
			<NeedDeliveryMethodModal
				strings={strings}
				hideModal={hideModal}
				onPressFirstButton={handleClickDelivery}
				onPressSecondButton={handleClickPickUp}
				isVisible={showDeliveryModal}
				imageURI={ActiveDelivery}
			/>
		)
	}

	return (
		<View style={styles.container}>
			<ScrollView>
				{renderOnlineOrders()}
				{renderWhatsResume()}
				{renderConfigMenu()}
				{!betaCatalogActive && renderAllowGuestCheckout()}
			</ScrollView>

			<ActionButton
				style={{ marginBottom: 10 }}
				onPress={() => onFinish()}
				alertTitle={I18n.t('words.s.attention')}
				alertDescription={getErrorMessage()}
				disabled={validateMissingInfos()}
			>
				{I18n.t('descriptionSaveButton')}
			</ActionButton>
			{Boolean(toast) && <KyteNotifications notifications={[toast]} />}
			{isLoading ? <LoadingCleanScreen /> : null}
			{showPostOrderCatalogBetaActiveModal && renderNeedActiveCatalogBetaModal('postOrder')}
			{showWhatsAppResumeCatalogBetaActiveModal && renderNeedActiveCatalogBetaModal('whatsappResume')}
			{showWhatsappAddModal && rendeWhatsappAddModal()}
			{showDeliveryModal && renderNeedDeliveryMethodModal()}
		</View>
	)
}

const styles = {
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	infoContainer: {
		backgroundColor: colors.lightBg,
		marginHorizontal: 20,
		marginVertical: 20,
		borderRadius: 5,
		padding: 16,
	},
	switchSection: {
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 20,
		borderBottomColor: colors.borderlight,
		borderBottomWidth: 1,
	},
	switchSectionContainer: {
		paddingHorizontal: 0,
		borderBottomWidth: 0,
		borderBottomColor: colors.primaryGrey,
	},
	switchTitleStyle: [Type.fontSize(14), Type.SemiBold, colorSet(colors.secondaryBg)],
	onlineOrderDescription: (color) => [
		Type.fontSize(12),
		Type.Regular,
		colorSet(color || colors.grayBlue),
		{ lineHeight: Platform.OS === 'ios' ? 16 : 20, paddingRight: 90 },
	],
	itemContainer: {
		paddingVertical: 20,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderlight,
		justifyContent: 'center',
	},
	innerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	labelTextSize: 14,
}

const ConfigStoreOrderForm = reduxForm({
	form: 'ConfigStoreOrderForm',
})(CatalogConfigOrder)

export default connect(
	(state) => {
		const { auth, billing } = state
		return {
			storeWhatsapp: auth.store.whatsapp,
			catalogConfig: auth.store.catalog || {},
			storeState: auth.store,
			formValues: getFormValues('ConfigStoreOrderForm')(state) || {},
			checkoutGateways: auth.store.checkoutGateways || [],
			allowDelivery: auth.store.shippingFees ? auth.store.shippingFees.active : false,
			billing,
			betaCatalogActive: isBetaCatalog(auth.store.catalog?.version),
		}
	},
	{ change, startLoading, openModalWebview, goBackToCatalogVersion2, storeAccountSave }
)(ConfigStoreOrderForm)
