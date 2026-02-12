import { colors, Container, Divider } from '@kyteapp/kyte-ui-components'
import { IParentProduct, IProductVariant, IVariation } from '@kyteapp/kyte-utils'
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import useFetchProductVariants from '../../../../hooks/useFetchProductVariants'
import I18n from '../../../../i18n/i18n'
import { setProductVariantDetail } from '../../../../stores/variants/actions/product-variant.actions'
import {
	getProductVariantDetail,
	getProductVariants,
} from '../../../../stores/variants/actions/product-variant.async.actions'
import {
	setVariantsNotification,
	setVariantsNeedsRefresh,
} from '../../../../stores/variants/actions/wizard-variation.actions'
import { IVariantsState } from '../../../../stores/variants/variants.types'
import { RootState } from '../../../../types/state/RootState'
import {
	CustomKeyboardAvoidingView,
} from '../../../common'
import KyteBaseButton from '../../../common/buttons/KyteBaseButton'
import KyteNotifications from '../../../common/KyteNotifications'
import GroupedSKUs from './product-skus/GroupedSKUs'
import GroupedSKUsHeader from './product-skus/GroupedSKUsHeader'
import GroupedSKUsItem from './product-skus/GroupedSKUsItem'
import GroupedVariationsHeader from './product-skus/GroupedVariationsHeader'
import ModalProductPhoto from '../../image/ModalProductPhoto'
import ProductPrice from '../../ProductPrice'
import { setSelectedVariationForPhotoEdit } from '../../../../stores/actions'
import { getVariantImage } from '../../../../util/products/util-variants'
import VariantPhotoSelectorModal from './product-skus/VariantPhotoSelectorModal'
import { logEvent } from '../../../../integrations'
const KyteNotificationsIgnoredType: any = KyteNotifications

interface ProductVariantsProps {
	product?: IParentProduct
	productVariants?: IVariantsState['productVariants']
	isFocused?: boolean
	isLoading: boolean
	navigation?: NavigationProp<any>
	isOnline?: boolean
	setProductVariantDetail: typeof setProductVariantDetail
	getProductVariants: typeof getProductVariants
	notificationsState: IVariantsState['notifications']
	setVariantsNotification: typeof setVariantsNotification
	getProductVariantDetail: typeof getProductVariantDetail
	setSelectedVariationForPhotoEdit: typeof setSelectedVariationForPhotoEdit
	setVariantsNeedsRefresh: typeof setVariantsNeedsRefresh
	needsRefresh?: boolean
}

const Strings = {
	t_continue: I18n.t('common.backToProductList'),
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.gray10 },
})

const ProductVariants: React.FC<ProductVariantsProps> = ({
	product,
	isFocused,
	isLoading,
	notificationsState,
	isOnline,
	...props
}) => {
	const [isVisiblePhotoSelector, setIsVisiblePhotoSelector] = useState(false)
	const [isVisiblePhotoModal, setIsVisiblePhotoModal] = useState(false)
	const [selectedVariation, setSelectedVariation] = useState<Partial<IVariation> | undefined>()
	const [variantImage, setVariantImage] = useState<string | undefined>(undefined)
	const BOTTOM_SHEET_SPACING = 16
	const navigation = useNavigation()
	const productVariants = props?.productVariants === null ? product?.variants : props?.productVariants

	const goToProduct = (productVariant: Partial<IProductVariant>) => {
		const hasVariantDetails = [productVariant?.isChildren, productVariant.parentId].some((prop) => prop != null)

		if (hasVariantDetails) {
			props?.setProductVariantDetail(productVariant as IProductVariant)
			navigation?.navigate({ key: 'ProductVariantDetails', name: 'ProductVariantDetails' })
		} else {
			props?.getProductVariantDetail({
				productId: productVariant._id ?? '',
				callback: (_err, updatedProductVariant) => {
					if (updatedProductVariant)
						navigation?.navigate({ key: 'ProductVariantDetails', name: 'ProductVariantDetails' })
				},
			})
		}
	}

	const notifications = useMemo(() => {
		const notificationWithHandler = notificationsState?.map((notification) => ({
			...notification,
			handleClose: () => setVariantsNotification([]),
		}))

		return notificationWithHandler
	}, [notificationsState])

	const handleOpenImage = (variation?: Partial<IVariation>, image?: string) => {
		logEvent('Product Option Photo Add Click')
		setSelectedVariation(variation)
		if (!!image) {
			props?.setSelectedVariationForPhotoEdit(variation)
			setVariantImage(image)
			setIsVisiblePhotoSelector(true)
			return
		}
		setIsVisiblePhotoModal(true)
	}

	useEffect(() => {
		const removeNotifications = () => {
			setVariantsNotification([])
		}

		return removeNotifications
	}, [])

	useFocusEffect(
		useCallback(() => {
			if (product && isFocused && props.needsRefresh) {
				props.getProductVariants(product)

				props.setVariantsNeedsRefresh(false)
			}
		}, [product, isFocused, props.needsRefresh, props.getProductVariants, props.setVariantsNeedsRefresh])
	)

	useFetchProductVariants({ product, productVariants, isFocused, getProductVariants: props.getProductVariants })

	if (!isFocused) return null

	return (
		<CustomKeyboardAvoidingView style={styles.container}>
			<Container style={styles.container}>
				<Container position="relative" flex={1}>
					<GroupedVariationsHeader
						onPress={() => navigation.navigate('ProductVariationsManager', { product })}
						product={product}
					/>
					<GroupedSKUs
						skus={productVariants ?? []}
						renderGroupHeader={(group) => {
							const hasOnlyOneVariation = (product?.variants?.[0]?.variations?.length ?? 0) === 1
							const { primaryVariation, skus } = group ?? {}
							const [productVariant] = skus ?? []
							const image = getVariantImage(product, primaryVariation)

							return (
								<GroupedSKUsHeader
									rightElement={
										hasOnlyOneVariation && (
											<ProductPrice
												salePrice={productVariant?.salePrice ?? 0}
												salePromotionalPrice={productVariant?.salePromotionalPrice}
											/>
										)
									}
									image={image}
									uid={product?.uid}
									primaryKey={group.primaryKey}
									onPress={hasOnlyOneVariation ? () => goToProduct(productVariant) : undefined}
									onPressImageBtn={() => handleOpenImage(primaryVariation, image)}
									disabled={!hasOnlyOneVariation}
								/>
							)
						}}
						renderSKUItem={(params) => {
							return (
								<GroupedSKUsItem
									{...params}
									key={params.sku._id || params.sku.id || params.index}
									rightElement={
										<ProductPrice
											salePrice={params?.sku?.salePrice ?? 0}
											salePromotionalPrice={params?.sku?.salePromotionalPrice}
										/>
									}
									onPress={() => goToProduct(params?.sku)}
								/>
							)
						}}
					/>

					<Container>
						<KyteNotificationsIgnoredType notifications={notifications} />
					</Container>
				</Container>
				<Divider backgroundColor={colors.gray07} />
				<Container backgroundColor={colors.white} padding={BOTTOM_SHEET_SPACING}>
					<KyteBaseButton onPress={() => navigation?.goBack()} type="disabled">
						{Strings.t_continue}
					</KyteBaseButton>
				</Container>
			</Container>
			{}
			<ModalProductPhoto
				selectedVariation={selectedVariation}
				isVisible={isVisiblePhotoModal}
				onCloseModal={setIsVisiblePhotoModal}
				handleOpenPhotoSelector={() => setIsVisiblePhotoSelector(true)}
			/>
			<VariantPhotoSelectorModal
				variantImage={variantImage}
				product={product}
				isVisible={isVisiblePhotoSelector}
				onClose={() => {
					setIsVisiblePhotoSelector(false)
					setVariantImage(undefined)
				}}
			/>
		</CustomKeyboardAvoidingView>
	)
}

const mapStateToProps = ({ variants, common, products }: RootState) => ({
	productVariants: variants.productVariants,
	notificationsState: variants.notifications,
	isLoading: Boolean(common.loader.visible),
	isOnline: common.isOnline,
	selectedVariationForPhotoEdit: products.selectedVariationForPhotoEdit,
	needsRefresh: variants.needsRefresh,
})

export default connect(mapStateToProps, {
	setProductVariantDetail,
	setVariantsNotification,
	getProductVariants,
	getProductVariantDetail,
	setSelectedVariationForPhotoEdit,
	setVariantsNeedsRefresh,
})(ProductVariants)
