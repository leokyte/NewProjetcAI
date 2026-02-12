import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import I18n from "../../i18n/i18n"
import { ActionButton, CenterContent, DetailPage, KyteIcon, LoadingCleanScreen } from "../../components/common"
import { ScrollView, TouchableOpacity } from "react-native"
import Container from "@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container"
import { colors, colorsPierChart } from "../../styles"
import { useRoute } from "@react-navigation/native"
import Row from "@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row"
import KyteText from "@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText"
import { CouponAnalyticCard, CouponAnalyticCardProps } from "./common/CouponAnalyticCard"
import Margin from "@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin"
import { useForm } from "react-hook-form"
import CouponActiveField from "./common/CouponActiveField"
import { editPromotion, getAnalyticsPromotion } from "../../stores/actions/CouponsActions"
import KyteNotifications from "../../components/common/KyteNotifications"
import Clipboard from '@react-native-clipboard/clipboard';
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums';
import { SimpleModal } from "../../components/common/modals/SimpleModal"
import { kyteCatalogDomain } from "../../util"
import ViewShot from "react-native-view-shot"
import { getCouponDisabledInfo, getCouponInfo, handleShareCoupon } from "../../util/util-coupon"
import CouponMockup from "./common/CouponMockup"
import CouponDetailInfo from "./common/CouponDetailInfo"
import { logEvent } from "../../integrations"
import { IPromotion } from "@kyteapp/kyte-utils/types"

const Strings = {
	SAVE_BUTTON: I18n.t('alertSave'),
	TOAST_TITLE: I18n.t('coupons.errorOnUpdateCoupon'),
	TOAST_TITLE_DELETE: I18n.t('coupons.errorOnDeleteCoupon'),
	TOAST_SUBTITLE: I18n.t('letsTryAgain'),
	MODAL_TITLE: I18n.t('coupons.excludeCoupon'),
	MODAL_SUBTITLE: I18n.t('coupons.excludeCouponWarning'),
	MODAL_CONFIRM_BUTTON: I18n.t('coupons.excludeCoupon'),
	SHARE_COUPON_PART1: I18n.t('coupons.shareCoupon.part1'),
	SHARE_COUPON_PART2: I18n.t('coupons.shareCoupon.part2'),
	SHARE_COUPON_PART3: I18n.t('coupons.shareCoupon.part3'),
	SHARE_COUPON_PART4: I18n.t('coupons.shareCoupon.part4'),
}

const CouponDetail = ({ ...props }) => {
	const { navigation, editPromotion, store, uid, loader, getAnalyticsPromotion, currency, billing, promotions } = props
	const [analyticsData, setAnalyticsData] = useState<CouponAnalyticCardProps['values'] | undefined>({
		count: 0,
		total: 0,
	})
	const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false)
	const [copyToast, setCopyToast] = useState<any>(null)
	const [editToast, setEditToast] = useState<any>(null)
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

	const viewShotRef = useRef<any>(null)

	const toasTimer = 3000
	const removeToast = () => {
		setCopyToast(null)
		setEditToast(null)
	}
	const defaultToastProps = { handleClose: removeToast, onAutoDismiss: removeToast }

  const route = useRoute()
  const promotion = ((route.params as any)?.promotion || {}) as IPromotion

	const formMethods = useForm({
		defaultValues: {
			active: promotion.active,
		},
	})
  const isCouponActive = formMethods.watch("active")
  const isDisabled = getCouponDisabledInfo({ promotions, billing, coupon: promotion })



	const headerButton = [
		{
			icon: 'trash',
			onPress: () => setShowDeleteModal(true),
			iconSize: 18,
			style: { marginRight: 8, width: 48, height: 48, padding: 8 },
		},
	]

	const handleSave = ({ data }: { data: { active: boolean } }) => {
		const { active } = data
		editPromotion(
			{
				coupon: {
					...promotion,
					active,
				},
				uid,
				aid: store.aid,
			},
			(error: any) => {
				if (error) {
					setEditToast({
						...defaultToastProps,
						timer: toasTimer,
						title: Strings.TOAST_TITLE,
						subtitle: Strings.TOAST_SUBTITLE,
						type: NotificationType.ERROR,
					})
					return
				}
				logEvent('Coupon Save', { coupon_status: active })
				navigation.replace('CouponsList', { couponUpdated: true })
			}
		)
	}

	const handleDeleteCoupon = () => {
		setShowDeleteModal(false)
		editPromotion(
			{
				coupon: {
					...promotion,
					deleted: true,
					active: false,
				},
				uid,
				aid: store.aid,
			},
			(error: any) => {
				if (error) {
					setEditToast({
						...defaultToastProps,
						timer: toasTimer,
						title: Strings.TOAST_TITLE_DELETE,
						subtitle: Strings.TOAST_SUBTITLE,
						type: NotificationType.ERROR,
					})
					return
				}
				logEvent('Coupon Delete')
				navigation.replace('CouponsList', { couponDeleted: true })
			}
		)
	}

	const handleShare = () => {
		const catalogURL = `https://${store?.urlFriendly}${kyteCatalogDomain}/`

		const { isShippingCoupon, code, valueDescriptionAccordingType } = getCouponInfo(currency, promotion)

		const couponMessageValue = isShippingCoupon
			? `${Strings.SHARE_COUPON_PART4}`
			: `${valueDescriptionAccordingType} ${Strings.SHARE_COUPON_PART3}`
		const message = `${Strings.SHARE_COUPON_PART1} "${code}" ${Strings.SHARE_COUPON_PART2} ${couponMessageValue} ${catalogURL}`

		handleShareCoupon({ viewShotRef, message, where: 'detail' })
	}

	const handleCopyCode = () => {
		Clipboard.setString(promotion.code)
		logEvent('Coupon Code Copy')
		setCopyToast({
			...defaultToastProps,
			timer: toasTimer,
			title: I18n.t('words.s.copied'),
			type: NotificationType.NEUTRAL,
			leftElement: <KyteIcon name="check" size={16} color={colors.white} />,
		})
	}

	const getAnalyticsData = async () => {
		setLoadingAnalytics(true)
		const data = await getAnalyticsPromotion({ aid: store.aid, couponId: promotion._id })
		setLoadingAnalytics(false)
		setAnalyticsData(data)
	}

	useEffect(() => {
		getAnalyticsData()
	}, [])

	useEffect(() => {
		logEvent('Coupon Detail View')
	}, [])

	return (
		<DetailPage pageTitle={promotion.code} goBack={() => navigation.goBack()} rightButtons={headerButton}>
			{loader && <LoadingCleanScreen />}
			<ScrollView style={{ backgroundColor: colorsPierChart[9], position: 'relative' }}>
				<Container padding={16}>
					<CenterContent>
						<ViewShot
							ref={viewShotRef}
							options={{ format: 'png', quality: 1 }}
							style={{ backgroundColor: 'transparent', alignSelf: 'center' }}
						>
							<CouponMockup coupon={promotion} />
						</ViewShot>

						<Margin top={24} />
						{isCouponActive && !isDisabled && (
							<>
								<TouchableOpacity onPress={() => handleShare()}>
									<Row alignItems="center" style={{ padding: 16 }}>
										<KyteText size={16} weight={500} color={colors.actionColor}>
											{I18n.t('words.s.share')}
										</KyteText>
										<Margin right={12} />
										<KyteIcon name="share" size={18} color={colors.actionColor} />
									</Row>
								</TouchableOpacity>
							</>
						)}

						<Margin top={24} />

						<CouponAnalyticCard values={analyticsData} isLoading={loadingAnalytics} onRefresh={getAnalyticsData} />

						<Margin top={16} />

						<CouponDetailInfo isCouponActive={isCouponActive} coupon={promotion} handleCopyCode={handleCopyCode} />

						<Margin top={24} />

						<CouponActiveField formMethods={formMethods} coupon={promotion} />
					</CenterContent>
				</Container>
			</ScrollView>
			<Container padding={16} backgroundColor={colors.white}>
				<ActionButton
					full
					noDisabledAlert
					onPress={formMethods.handleSubmit((data) => handleSave({ data }))}
					disabled={!formMethods.formState.isDirty}
				>
					{Strings.SAVE_BUTTON}
				</ActionButton>
			</Container>

			<SimpleModal
				visible={showDeleteModal}
				confirmButtonText={Strings.MODAL_CONFIRM_BUTTON}
				title={`${Strings.MODAL_TITLE} ${promotion.code}?`}
				subtitle={Strings.MODAL_SUBTITLE}
				onCancel={() => setShowDeleteModal(false)}
				onConfirm={handleDeleteCoupon}
			/>

			{!!copyToast && (
				<Container>
					<KyteNotifications notifications={[copyToast]} />
				</Container>
			)}
			{!!editToast && (
				<Container>
					<KyteNotifications notifications={[editToast]} />
				</Container>
			)}
		</DetailPage>
	)
}

export default connect(({ auth, common, preference, billing }) => ({ 
  store: auth.store, 
  uid: auth.user.uid,
  loader: common.loader.visible,
  currency: preference.account.currency,
  billing,
  promotions: auth.promotions
}), 
{ editPromotion, getAnalyticsPromotion })(CouponDetail)
