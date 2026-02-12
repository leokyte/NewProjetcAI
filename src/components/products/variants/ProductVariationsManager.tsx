import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { IParentProduct } from '@kyteapp/kyte-utils'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import I18n from '../../../i18n/i18n'
import { DetailPage } from '../../common/scaffolding/DetailPage'
import ProductVariationsManagerUI from './ProductVariationsManagerUI'
import ConsentModal from '../../common/modals/ConsentModal'
import { connect } from 'react-redux'
import { removeProductVariations, getProductOnline } from '../../../stores/actions'
import { LoadingCleanScreen } from '../../common'
import { RootState } from '../../../types/state/RootState'
import { KyteNotificationProps } from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import KyteNotifications from '../../common/KyteNotifications'
import { logEvent } from '../../../integrations'
import { showOfflineAlert } from '../../../util/util-common'
import { getVariations } from '../../../stores/variants/actions/wizard-variation.async.actions'
import {
	getProductVariants,
	updateProductVariantOptions,
	updateVariation,
} from '../../../stores/variants/actions/product-variant.async.actions'
import {
	setVariantsNotification,
	setVariantsNeedsRefresh,
} from '../../../stores/variants/actions/wizard-variation.actions'
import { IVariant, IVariantOption } from '../../../stores/variants/variants.types'
import VariationCard from './VariantionCard'
import { Margin } from '@kyteapp/kyte-ui-components'
import { UnsavedChangesModal } from '../../common/modals/UnsavedChangesModal'

type RouteParams = {
	params: {
		product: IParentProduct
	}
}

type StateProps = ReturnType<typeof mapStateToProps>

type ActionProps = {
	removeProductVariations: typeof removeProductVariations
	getVariations: typeof getVariations
	getProductVariants: typeof getProductVariants
	setVariantsNotification: typeof setVariantsNotification
	setVariantsNeedsRefresh: typeof setVariantsNeedsRefresh
	updateProductVariantOptions: typeof updateProductVariantOptions
	updateVariation: typeof updateVariation
	getProductOnline: typeof getProductOnline
}

type RouteProps = { route: RouteParams }

type Props = ActionProps & StateProps & RouteProps

const Strings = {
	t_title: I18n.t('variants.productVariations'),
	t_consent_modal: {
		title: I18n.t('variants.removeProductVariations'),
		description: I18n.t('variants.removeVariationsAlertDescription'),
		btnConsent: I18n.t('understandDeleteAction'),
		btnConfirm: I18n.t('understoodAndConfirmRemoval'),
		btnCancel: I18n.t('alertDismiss'),
	},
	t_error_notification: I18n.t('variants.failRemovingVariations'),
	t_alert_message: I18n.t('variants.alertMessage'),
	t_btn_cancel: I18n.t('alertDismiss'),
	t_btn_confirm: I18n.t('leaveAnyway'),
	t_unsaved_changes_title: I18n.t('words.s.attention'),
	t_unsaved_changes_description: I18n.t('alert.unsavedVariationsWarning'),
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.gray10,
	},
})

const ProductVariationsManager: React.FC<Props> = ({
	isLoading,
	product,
	isOnline,
	variants,
	auth,
	getVariations,
	getProductVariants,
	getProductOnline,
	...props
}) => {
	const navigation = useNavigation()

	const [isModalVisible, setIsModalVisible] = useState(false)
	const [variationChanges, setVariationChanges] = useState<Record<string, any>>({})
	const [isUpdating, setIsUpdating] = useState(false)
	const [isWaitingForUpdate, setIsWaitingForUpdate] = useState(false)
	const [forceUpdateCounter, setForceUpdateCounter] = useState(0)
	const [isUnsavedChangesModalVisible, setIsUnsavedChangesModalVisible] = useState<boolean>(false)

	const showRemoveVariationsModal = useCallback(() => {
		setIsModalVisible(true)
	}, [])

	const removeVariations = useCallback(() => {
		setIsModalVisible(false)
		props.removeProductVariations(product, (error) => {
			if (!error) {
				logEvent('Product Variants Remove')
				navigation.goBack()
			}
			if (error) {
				const notification: KyteNotificationProps = {
					title: Strings.t_error_notification,
					type: NotificationType.ERROR,
					timer: 3000,
				}
				const updatedNotifications = [...(variants.notifications || []), notification]
				props.setVariantsNotification(updatedNotifications)
			}
		})
	}, [product, variants.notifications, props])

	const onPressVariationsManagementBtn = useCallback(() => {
		navigation.navigate('VariationsManager')
	}, [])

	const closeModal = useCallback(() => setIsModalVisible(false), [])

	const handleVariationChange = useCallback((variationId: string, changes: any) => {
		setVariationChanges((prev) => ({
			...prev,
			[variationId]: changes,
		}))
	}, [])

	const hasSignificantChanges = useMemo(() => {
		return (
			Object.keys(variationChanges).length > 0 && Object.values(variationChanges).some((change) => change.hasChanges)
		)
	}, [variationChanges])

	const handleUpdateVariations = useCallback(async () => {
		if (!hasSignificantChanges || isUpdating) return

		setIsUpdating(true)

		try {
			for (const variationId of Object.keys(variationChanges)) {
				if (!variationChanges[variationId].hasChanges) continue

				const change = variationChanges[variationId]
				const variation = product.variations.find((v) => v._id === variationId)
				const globalVariant = variants.list.find((v: IVariant) => v._id === variationId)

				if (!variation || !globalVariant) continue

				const newOptions =
					change.temporaryOptions?.filter((tempOption: IVariantOption) => {
						return !globalVariant.options?.some(
							(globalOption: IVariantOption) =>
								globalOption?.title?.toLowerCase()?.trim() === tempOption?.title?.toLowerCase()?.trim()
						)
					}) || []

				if (newOptions.length > 0) {
					const updatedGlobalVariant = {
						...globalVariant,
						options: [
							...(globalVariant.options || []),
							...newOptions.map((opt: any) => ({
								title: opt.title,
								photos: opt.photos || null,
							})),
						],
					}

					await new Promise((resolve, reject) => {
						props.updateVariation({
							variation: updatedGlobalVariant,
							callback: (error, response) => {
								if (error) {
									console.error('Error updating global variant:', error)
									reject(error)
								} else {
									resolve(response)
								}
							},
						})
					})
				}
			}

			const variationsToUpdate = product.variations.map((variation) => {
				const variationId = String(variation._id)
				const change = variationChanges[variationId]
				const hasChanges = change?.hasChanges || false

				const updateData: any = {
					_id: variationId,
					aid: auth?.aid,
					uid: auth?.user?.uid,
					name: variation.name,
					isPrimary: variation.isPrimary || false,
					options: hasChanges
						? change.temporaryOptions?.map((option: any) => ({
								title: option.title,
						  })) || []
						: variation.options?.map((option: any) => ({
								title: option.title,
						  })) || [],
				}

				return updateData
			})

			if (variationsToUpdate.length > 0) {
				props.updateProductVariantOptions({
					productId: product._id || '',
					variations: variationsToUpdate,
				})

				props.setVariantsNeedsRefresh(true)
				setIsWaitingForUpdate(true)

				setTimeout(() => {
					if (getVariations && auth?.aid) {
						getVariations(auth.aid, () => {
							if (product && product._id) {
								// @ts-ignore
								getProductOnline(product._id, (updatedProduct) => {
									if (updatedProduct && getProductVariants) {
										getProductVariants(updatedProduct, false)
									}
									setTimeout(() => {
										setVariationChanges({})
										setForceUpdateCounter((prev) => prev + 1)
										setIsWaitingForUpdate(false)
										setIsUpdating(false)
									}, 100)
								})
							}
						})
					} else if (product && product._id) {
						// @ts-ignore
						getProductOnline(product._id, (updatedProduct) => {
							if (updatedProduct && getProductVariants) {
								getProductVariants(updatedProduct, false)
							}
							setTimeout(() => {
								setVariationChanges({})
								setForceUpdateCounter((prev) => prev + 1)
								setIsWaitingForUpdate(false)
								setIsUpdating(false)
							}, 100)
						})
					}
				}, 500)
			}
		} catch (error) {
			console.error('Error updating variations:', error)
			setIsUpdating(false)
			setIsWaitingForUpdate(false)
		}
	}, [
		hasSignificantChanges,
		isUpdating,
		variationChanges,
		product,
		auth,
		variants.list,
		props,
		getVariations,
		getProductVariants,
	])

	const renderVariationCards = () => {
		const sortedVariations = [...product.variations].sort((a, b) => {
			if (a.isPrimary && !b.isPrimary) return -1
			if (!a.isPrimary && b.isPrimary) return 1
			return 0
		})

		return sortedVariations.map((variation, index) => {
			const variationId = String(variation._id)
			const hasChanges = variationChanges[variationId]?.hasChanges
			const temporaryOptions = variationChanges[variationId]?.temporaryOptions

			const variationToRender =
				hasChanges && temporaryOptions
					? {
							...variation,
							name: variation.name,
							_id: variation._id,
							options: temporaryOptions,
					  }
					: variation

			return (
				<Margin key={`${String(variation._id)}-${forceUpdateCounter}-${index}`} top={index === 0 ? 0 : 16}>
					<VariationCard
						variants={variants}
						variation={variationToRender}
						originalVariation={variation}
						onVariationChange={handleVariationChange}
					/>
				</Margin>
			)
		})
	}

	const handleUnsavedChangesDiscard = useCallback(() => {
		setIsUnsavedChangesModalVisible(false)
		navigation.goBack()
	}, [navigation])

	const handleUnsavedChangesCancel = useCallback(() => {
		setIsUnsavedChangesModalVisible(false)
	}, [])

	const handleSave = useCallback(async () => {
		setIsUnsavedChangesModalVisible(false)
		await handleUpdateVariations()
		navigation.goBack()
	}, [handleUpdateVariations])

	const handleGoBack = useCallback(() => {
		if (!hasSignificantChanges) {
			navigation.goBack()
			return
		}

		setIsUnsavedChangesModalVisible(true)
	}, [hasSignificantChanges])

	useEffect(() => {
		getVariations(auth?.aid)
	}, [auth?.aid, getVariations])

	useEffect(() => {
		return () => {
			setVariationChanges({})
			setIsUnsavedChangesModalVisible(false)
		}
	}, [])

	useFocusEffect(
		useCallback(() => {
			if (product) {
				getProductVariants(product, false)
			}
		}, [product])
	)

	return (
		<DetailPage pageTitle={Strings.t_title} goBack={handleGoBack} style={styles.container}>
			<ProductVariationsManagerUI
				variants={variants}
				onPressRemoveVariationsBtn={isOnline ? showRemoveVariationsModal : showOfflineAlert}
				onPressVariationsManagementBtn={onPressVariationsManagementBtn}
				renderVariationCards={renderVariationCards}
				hasSignificantChanges={hasSignificantChanges}
				isUpdating={isUpdating || isWaitingForUpdate}
				onUpdateVariations={handleUpdateVariations}
			/>
			<ConsentModal
				onCancel={closeModal}
				onConfirm={removeVariations}
				texts={Strings.t_consent_modal}
				isVisible={isModalVisible}
			/>
			{isLoading && <LoadingCleanScreen />}
			<KyteNotifications notifications={variants.notifications || []} />

			{/* Unsaved Changes Modal */}
			<UnsavedChangesModal
				isVisible={isUnsavedChangesModalVisible}
				onConfirm={handleSave}
				onCancel={handleUnsavedChangesCancel}
				onDiscard={handleUnsavedChangesDiscard}
			/>
		</DetailPage>
	)
}

const mapStateToProps = (state: RootState) => ({
	isOnline: Boolean(state.common.isOnline),
	isLoading: Boolean(state.common.loader.visible),
	product: state.products.detail as IParentProduct,
	variants: state.variants,
	auth: state.auth,
})
export default connect(mapStateToProps, {
	removeProductVariations,
	getVariations,
	getProductVariants,
	setVariantsNotification,
	setVariantsNeedsRefresh,
	updateProductVariantOptions,
	updateVariation,
	getProductOnline,
})(ProductVariationsManager)
