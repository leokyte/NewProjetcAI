import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import { InjectedFormProps } from 'redux-form'
import { findVariantOption, IParentProduct, IProductVariant, IVariation, SelectedOption } from '@kyteapp/kyte-utils'
import { Container, KyteText, Row, KyteIcon, Padding } from '@kyteapp/kyte-ui-components'
import VariantAccordion from './VariantAccordion'
import { Pressable } from 'react-native'
import VariantCheckoutItem from './VariantCheckoutItem'
import I18n from '../../../i18n/i18n'
import { colors } from '../../../styles'
import { CONTENT_BOX_PADDING } from '../../products/variants/tab/product-skus/constants'
import { generateTestID } from '../../../util'
import { ActionButton, CurrencyText, KyteSafeAreaView } from '../../common'
import { useVariantSelection } from '../../../hooks/use-variant-selection'
import { logEvent } from '../../../integrations'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { totalOptionsCount } from '../../../util/products/util-variants'

const Strings = {
	CART_ITEMS_PLURAL: I18n.t('words.p.item'),
	CART_ITEM_SINGULAR: I18n.t('words.s.item'),
	VARIANT_OPTIONS_TITLE: I18n.t('words.p.option'),
	CONTINUE_SALE_BUTTON: I18n.t('expressions.continueSale'),
}

interface VariantSaleModalProps {
	checkoutProduct: IParentProduct
	onCloseModal: () => void
	addProductToCart: (product: Partial<IProductVariant>, fraction?: number) => void
	currentSale: any
}

type Props = VariantSaleModalProps & InjectedFormProps<VariantSaleModalProps>

const VariantSaleModal: React.FC<Props> = ({ checkoutProduct, onCloseModal, addProductToCart, currentSale }) => {
	// Height of the content above the Accordion, used to calculate the maximum height of the Accordion without exceeding the screen size
	const reservedContentHeight = 328
	const { totalGross, totalItems } = currentSale
	const { variants, variations, name } = checkoutProduct
	const insets = useSafeAreaInsets()
	const orderedVariations = useMemo(() => {
		return [...variations].sort((a, b) => {
			if (b.isPrimary && !a.isPrimary) return 1
			if (a.isPrimary && !b.isPrimary) return -1
			return 0
		})
	}, [variations])
	const [openAccordion, setOpenAccordion] = useState<string | undefined>(() => orderedVariations[0]?.name)
	const containerStyle = {
		flex: 1,
		position: 'absolute',
		bottom: 0,
		left: 0,
		width: '100%',
		height: '100%',
		justifyContent: 'flex-end',
	}

	const { handleSelectVariant, variantOptions, selectedOptions, shouldCloseModal } = useVariantSelection({
		productVariants: variants,
		variations: orderedVariations,
		addProductToCart,
	})

	const handleSelectVariantOption = (selectedOption: SelectedOption) => {
		const updatedSelections = selectedOptions.filter((option) => option.type !== selectedOption.type)
		updatedSelections.push(selectedOption)

		const nextVariantToOpen = orderedVariations.find(
			(variant) => !updatedSelections.some((option) => option.type === variant.name)
		)

		setOpenAccordion(nextVariantToOpen?.name ?? selectedOption.type)

		handleSelectVariant(selectedOption)
	}

	useEffect(() => {
		if (shouldCloseModal) {
			onCloseModal()
		}
	}, [shouldCloseModal])

	useEffect(() => {
		logEvent('Checkout Variants Select View', {
			variations: variations?.length,
			variants: variants?.length,
			options: totalOptionsCount(variations),
		})
	}, [])

	return (
		<Container style={containerStyle}>
			<Pressable
				onPress={onCloseModal}
				style={{ flex: 1, position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%' }}
			>
				<Container backgroundColor={colors.primaryBlack} width="100%" height="100%" style={{ opacity: 0.8 }} />
			</Pressable>
			<Container backgroundColor={colors.white} borderRadius={CONTENT_BOX_PADDING}>
				<Container borderBottomWidth={1} borderColor={colors.disabledIcon}>
					<Padding vertical={8} horizontal={CONTENT_BOX_PADDING}>
						<Row justifyContent="space-between" alignItems="center">
							<KyteText
								color={colors.primaryDarker}
								size={CONTENT_BOX_PADDING}
								weight={500}
								numberOfLines={4}
								ellipsizeMode="tail"
								style={{ flexShrink: 1, wordBreak: 'break-all' }}
							>
								{Strings.VARIANT_OPTIONS_TITLE} {name}
							</KyteText>
							<Pressable {...generateTestID('close-variant-sale-modal')} onPress={onCloseModal}>
								<Container width={36} height={36} justifyContent="center" alignItems="center">
									<KyteIcon name="close-navigation" size={CONTENT_BOX_PADDING} />
								</Container>
							</Pressable>
						</Row>
					</Padding>
				</Container>

				{orderedVariations.map((variantType, index) => {
					const selectedOptionTitle = selectedOptions?.find((option) => {
						return option.type === variantType?.name
					})
					const hasSelectedOption = selectedOptions?.some((option) => {
						return option.type === variantType?.name
					})
					return (
						<Container key={variantType._id} borderBottomWidth={1} borderColor={colors.disabledIcon}>
							<VariantAccordion
								testProps={generateTestID(`variation-${index}-bottom-sheet`)}
								isOpen={openAccordion === variantType?.name}
								onToggle={() => setOpenAccordion(openAccordion === variantType?.name ? undefined : variantType?.name)}
								title={variantType?.name ?? ''}
								selectedOptionTitle={selectedOptionTitle?.option}
								reservedSpace={reservedContentHeight}
							>
								<Container>
									{variantType?.options?.map((option, optionIndex) => (
										<VariantCheckoutItem
											isSelected={selectedOptions?.some((selectedOption) => selectedOption.option === option.title)}
											key={option.title}
											testProps={generateTestID(`option-vr${index}-${optionIndex}`)}
											option={option}
											variantType={variantType}
											handleSelectVariant={handleSelectVariantOption}
											index={optionIndex}
											isPrimary={orderedVariations?.length === 1 ? true : variantType?.isPrimary}
											variantItem={findVariantOption(hasSelectedOption, variantOptions, option)}
											currentSale={currentSale}
										/>
									))}
								</Container>
							</VariantAccordion>
						</Container>
					)
				})}
				<Row
					padding={CONTENT_BOX_PADDING}
					paddingBottom={CONTENT_BOX_PADDING + insets.bottom}
					alignItems="center"
					justifyContent="space-between"
				>
					{totalItems > 0 && (
						<Container alignItems="flex-end">
							<CurrencyText
								style={{
									fontSize: 12,
									color: colors.primaryDarker,
									lineHeight: 20,
									fontWeight: '500',
								}}
								value={totalGross}
							/>
							<KyteText size={12} color={colors.primaryDarker}>
								<KyteText size={12} color={colors.primaryDarker} weight={500}>
									{totalItems}{' '}
								</KyteText>
								{totalItems > 1 ? Strings.CART_ITEMS_PLURAL : Strings.CART_ITEM_SINGULAR}
							</KyteText>
						</Container>
					)}
					<ActionButton
						testProps={generateTestID('continue-variant-sale')}
						containerStyle={{
							flex: 1,
						}}
						borderedGreen
						onPress={onCloseModal}
						full
					>
						{Strings.CONTINUE_SALE_BUTTON}
					</ActionButton>
				</Row>
			</Container>
		</Container>
	)
}

const mapStateToProps = (state: any) => ({
	checkoutProduct: state.variants.checkoutProduct,
	currentSale: state.currentSale,
})

export default connect(mapStateToProps, null)(VariantSaleModal)
