import { Divider, ListTileSwitch } from '@kyteapp/kyte-ui-components'
import { StockStatus, StockStatusColors } from '@kyteapp/kyte-ui-components/src/packages/enums'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import { colors } from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import Body16 from '@kyteapp/kyte-ui-components/src/packages/text/typography/body16/Body16'
import { IParentProduct, IProductVariant, IStock, IUser } from '@kyteapp/kyte-utils'
import { useNavigation } from '@react-navigation/native'
import React, { FC, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import useFetchProductVariants from '../../../../hooks/useFetchProductVariants'
import i18n from '../../../../i18n/i18n'
import { setProductVariantDetail } from '../../../../stores/variants/actions/product-variant.actions'
import {
	getProductVariants,
	setParentProductStockActive,
} from '../../../../stores/variants/actions/product-variant.async.actions'
import { setVariantsNotification } from '../../../../stores/variants/actions/wizard-variation.actions'
import { IVariantsState } from '../../../../stores/variants/variants.types'
import { RootState } from '../../../../types/state/RootState'
import { checkStockValueStatus } from '../../../../util'
import { CustomKeyboardAvoidingView } from '../../../common'
import KyteBaseButton from '../../../common/buttons/KyteBaseButton'
import KyteNotifications from '../../../common/KyteNotifications'
import GroupedSKUs from './product-skus/GroupedSKUs'
import GroupedSKUsHeader from './product-skus/GroupedSKUsHeader'
import GroupedSKUsItem from './product-skus/GroupedSKUsItem'
import EmptyState from '../../../common/EmptyState'
import { CloudOffline } from '../../../../../assets/images/cloud-offline'
import { CONTENT_HORIZONTAL_SPACING } from './product-skus/constants'
import { getVariantImage } from '../../../../util/products/util-variants'
import { logEvent } from '../../../../integrations'

export interface StockVariantsProps {
	product?: IParentProduct
	productVariants?: IVariantsState['productVariants']
	notifications?: IVariantsState['notifications']
	user: IUser
	isLoading: boolean
	isFocused?: boolean
	setProductVariantDetail: typeof setProductVariantDetail
	getProductVariants: typeof getProductVariants
	setParentProductStockActive: typeof setParentProductStockActive
	setVariantsNotification: typeof setVariantsNotification
}

const style = StyleSheet.create({
	containerStyle: { flex: 1, backgroundColor: colors.gray10 },
})

const Strings = {
	t_save: i18n.t('productSaveButton'),
	t_goBack: i18n.t('common.backToProductList'),
	t_error_title: i18n.t('generalErrorTitle'),
	t_error_subtitle: i18n.t('variants.failFetchingVariantsStock'),
	t_error_btn: i18n.t('stockConnectivityStatusButtonIfo'),
}

const SPACING = 16

const StockVariants: FC<StockVariantsProps> = ({
	product,
	user,
	productVariants,
	notifications,
	isFocused,
	isLoading,
	...props
}) => {
	const navigation = useNavigation()
	const shouldShowErrorMessage = productVariants === null
	const isStockActive = useMemo(() => {
		const checkIsStockActive = (product: IProductVariant) => Boolean(product.stockActive)
		const isStockActivated = Boolean(productVariants?.some(checkIsStockActive))

		return isStockActivated
	}, [productVariants])

	const notificationsWithHandler: typeof notifications = useMemo(() => {
		return (
			notifications?.map((notification, index) => ({
				...notification,
				handleClose: () => {
					const updatedNotifications = [...notifications]
					updatedNotifications.splice(index, 1)

					props.setVariantsNotification(updatedNotifications)
				},
			})) ?? []
		)
	}, [notifications])

	const getStockColor = (stock?: IStock, productVariant?: Partial<IProductVariant> | null) => {
		let updatedStock = stock ?? { current: 0, minimum: 0 }
		const stockStatus = checkStockValueStatus(
			updatedStock.current,
			updatedStock,
			productVariant as IProductVariant
		) as keyof typeof StockStatusColors
		const color = StockStatusColors[stockStatus] ?? StockStatusColors[StockStatus.Unavailable]

		return color
	}

	const renderStockIndicator = (productVariant?: Partial<IProductVariant> | null) => {
		const { stock } = productVariant ?? {}
		const stockCurrent = stock?.current ?? 0

		return <Body16 color={getStockColor(stock ?? undefined, productVariant)}>{stockCurrent}</Body16>
	}

	const navigateToStockDetail = (productVariant?: Partial<IProductVariant>) => {
		if (productVariant) {
			navigation.navigate('VariantStockDetail', { product: productVariant })

			props?.setProductVariantDetail(productVariant as IProductVariant)
		}
	}

	const toggleStockActive = () => {
		const active = !isStockActive

		if (product) {
			props?.setParentProductStockActive({ product, active, user })
			if (active) {
				logEvent('Product Stock Enabled', {
					hasVariants: Boolean(product?.variants?.length),
				})
			}
		}
	}

	const renderContent = () => {
		return (
			<>
				<Container position="relative" flex={1}>
					<Container backgroundColor={colors.white}>
						<ListTileSwitch
							title={{ text: i18n.t('stockAtivateTitle') }}
							padding={CONTENT_HORIZONTAL_SPACING}
							active={isStockActive}
							onPress={toggleStockActive}
						/>
					</Container>
					<GroupedSKUs
						skus={(productVariants as any) ?? []}
						renderGroupHeader={(group) => {
							const { skus = [], primaryVariation } = group ?? {}
							const [variant] = skus ?? []
							const hasOnlyOneVariation = (product?.variants?.[0]?.variations?.length ?? 0) === 1
							const image = getVariantImage(product, primaryVariation)

							return (
								<GroupedSKUsHeader
									rightElement={hasOnlyOneVariation && renderStockIndicator(isStockActive ? variant : undefined)}
									primaryKey={group.primaryKey}
									image={image}
									onPress={hasOnlyOneVariation ? () => navigateToStockDetail(variant) : undefined}
									onPressImageBtn={hasOnlyOneVariation ? () => navigateToStockDetail(variant) : undefined}
									variationTitle={primaryVariation?.options?.[0]?.title}
									uid={product?.uid}
								/>
							)
						}}
						renderSKUItem={(params) => (
							<GroupedSKUsItem
								{...params}
								onPress={() => navigateToStockDetail(params.sku)}
								rightElement={renderStockIndicator(isStockActive ? params?.sku : undefined)}
								disabled={!isStockActive}
							/>
						)}
					/>
					{!isStockActive && (
						<Container position="absolute" top={0} bottom={0} right={0} left={0}>
							<Container backgroundColor={colors.white}>
								<ListTileSwitch
									title={{ text: i18n.t('stockAtivateTitle') }}
									padding={SPACING}
									active={isStockActive}
									onPress={toggleStockActive}
								/>
							</Container>
							<Container backgroundColor={colors.gray10} style={{ opacity: 0.7 }} flex={1} />
						</Container>
					)}
				</Container>
				<Divider backgroundColor={colors.gray07} />
				<Container padding={SPACING} backgroundColor={colors.white}>
					<KyteBaseButton onPress={navigation?.goBack} type="disabled">
						{Strings.t_goBack}
					</KyteBaseButton>
				</Container>
			</>
		)
	}

	useFetchProductVariants({ product, productVariants, isFocused, getProductVariants: props.getProductVariants })

	if (!isFocused) return null

	return (
		<CustomKeyboardAvoidingView style={style.containerStyle}>
			<Container style={style.containerStyle}>
				{shouldShowErrorMessage ? (
					<EmptyState
						image={{ source: { uri: CloudOffline }, style: { width: 200 } }}
						strings={{
							title: Strings.t_error_title,
							description: [Strings.t_error_subtitle],
							btnSubmit: Strings.t_error_btn,
						}}
						onPressSubmitBtn={product ? () => props.getProductVariants?.(product) : undefined}
					/>
				) : (
					renderContent()
				)}
				<KyteNotifications notifications={notificationsWithHandler ?? []} containerProps={{}} />
			</Container>
		</CustomKeyboardAvoidingView>
	)
}

const mapStateToProps = ({ products, variants, auth, common }: RootState) => ({
	product: products.detail,
	productVariants: variants.productVariants,
	notifications: variants.notifications ?? [],
	user: auth.user,
	isLoading: Boolean(common.loader.visible),
})

export default connect(mapStateToProps, {
	setProductVariantDetail,
	getProductVariants,
	setParentProductStockActive,
	setVariantsNotification,
})(StockVariants)
