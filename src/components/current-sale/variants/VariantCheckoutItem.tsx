import { Container, Row, KyteText, KyteIcon } from '@kyteapp/kyte-ui-components'
import { getCartAmount, IProductVariant, ISale, IVariation, IVariationOption } from '@kyteapp/kyte-utils'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import CartCounter from './CartCounter'
import { connect } from 'react-redux'
import I18n from '../../../i18n/i18n'
import { CONTENT_BOX_PADDING } from '../../products/variants/tab/product-skus/constants'
import { colors } from '../../../styles'
import { CurrencyText } from '../../common'
import ProductImage from '../../products/image/ProductImage'

const Strings = {
	CODE_PREFIX: I18n.t('words.s.codeAbbr'),
	STOCK_LABEL: I18n.t('stockContainerTitle'),
}

interface IVariantCheckoutItemProps {
	option: IVariationOption
	variantType: Partial<IVariation>
	handleSelectVariant: (selectedOption: { type: string; option: string }) => void
	index: number
	isPrimary?: boolean
	variantItem?: Partial<IProductVariant>
	currentSale: ISale
	testProps?: any
	isSelected?: boolean
	uid?: string
}

const VariantCheckoutItem: React.FC<IVariantCheckoutItemProps> = ({
	option,
	variantType,
	handleSelectVariant,
	index,
	isPrimary,
	variantItem,
	currentSale,
	testProps,
	isSelected,
	uid,
}) => {
	const isFractioned = variantItem?.isFractioned
	const imageSize = 56
	const productId = variantItem?._id || variantItem?.id || ''
	const price = variantItem?.salePromotionalPrice ?? variantItem?.salePrice
	const cartAmount = getCartAmount({ currentSale, productId: productId ?? '', isFractioned })
	const hasActiveStockLoaded = variantItem?.stockActive && variantItem?.stock
	const currentStock = variantItem?.stock?.current ?? 0
	const photos = option?.photos?.image
		? {
				image: option?.photos?.image,
				imageThumb: option?.photos?.image,
				uid: uid,
		  }
		: undefined

	return (
		<TouchableOpacity
			{...testProps}
			key={option.title}
			onPress={() => handleSelectVariant({ type: variantType?.name ?? '', option: option.title })}
		>
			<Row
				justifyContent="space-between"
				paddingTop={CONTENT_BOX_PADDING}
				paddingBottom={CONTENT_BOX_PADDING}
				paddingLeft={CONTENT_BOX_PADDING}
				paddingRight={CONTENT_BOX_PADDING}
				borderBottomWidth={(variantType?.options?.length ?? 0) - 1 === index ? 0 : 1}
				borderBottomColor={colors.littleDarkGray}
				alignItems="center"
			>
				<Row>
					{isPrimary ? (
						<Container
							alignItems="center"
							justifyContent="center"
							width={imageSize}
							height={imageSize}
							borderRadius={4}
							marginRight={CONTENT_BOX_PADDING}
							overflow="hidden"
						>
							<Container
								padding={photos?.image ? 0 : 8}
								width={imageSize}
								height={imageSize}
								backgroundColor={colors.secondaryBg}
								justifyContent="center"
							>
								<Container zIndex={20} position="absolute" right={0} top={0}>
									<CartCounter isFractioned={isFractioned} amount={cartAmount} />
								</Container>
								{photos?.image ? (
									<ProductImage
										{...({} as any)}
										product={photos}
										style={{
											width: imageSize,
											height: imageSize,
										}}
										resizeMode="cover"
									/>
								) : (
									<KyteText
										textAlign="center"
										color={colors.white}
										size={12}
										weight={500}
										numberOfLines={1}
										ellipsizeMode="clip"
									>
										{option.title}
									</KyteText>
								)}
							</Container>
						</Container>
					) : cartAmount ? (
						<Container marginRight={16}>
							<CartCounter isFractioned={isFractioned} amount={cartAmount} />
						</Container>
					) : null}

					<Container justifyContent="center">
						<Row justifyContent="space-between" alignItems="center">
							<KyteText
								weight={500}
								color={isSelected ? colors.green01 : colors.primaryDarker}
								size={14}
								lineHeight={20}
								marginRight={8}
							>
								{option.title}
							</KyteText>
							{isSelected && <KyteIcon color={colors.green01} name="check" size={12} />}
						</Row>
						{Boolean(variantItem?.code) && (
							<KyteText
								color={colors.tipColor}
								size={11}
								lineHeight={CONTENT_BOX_PADDING}
								style={{ flexShrink: 1, wordBreak: 'break-all', maxWidth: 180 }}
							>
								{Strings.CODE_PREFIX}: {variantItem?.code}
							</KyteText>
						)}
					</Container>
				</Row>
				{variantItem && (
					<Container alignItems="flex-end">
						{variantItem?.salePromotionalPrice != null && (
							<KyteText color={colors.tipColor} size={9} textDecorationLine="line-through">
								<CurrencyText value={variantItem?.salePrice} />
							</KyteText>
						)}
						<CurrencyText
							style={{
								fontSize: 11,
								color: colors.primaryDarker,
								lineHeight: 20,
							}}
							value={price}
						/>
						{hasActiveStockLoaded && (
							<KyteText
								color={currentStock > 0 ? colors.primaryDarker : colors.barcodeRed}
								size={13}
								weight={500}
								lineHeight={CONTENT_BOX_PADDING}
							>
								{Strings.STOCK_LABEL}: {currentStock}
							</KyteText>
						)}
					</Container>
				)}
			</Row>
		</TouchableOpacity>
	)
}

const mapStateToProps = (state: any) => ({
	currentSale: state.currentSale,
	uid: state?.auth?.user?.uid,
})

export default connect(mapStateToProps, null)(VariantCheckoutItem)
