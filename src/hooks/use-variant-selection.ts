import { useEffect, useState } from 'react'
import {
	IVariation,
	IProductVariant,
	SelectedOption,
	findMatchingProductVariant,
	getUpdatedSelections,
	filterMatchingVariants,
} from '@kyteapp/kyte-utils'
import { useNavigation } from '@react-navigation/native'

interface UseVariantSelectionProps {
	productVariants: Partial<IProductVariant>[]
	variations: Partial<IVariation>[]
	addProductToCart: (product: Partial<IProductVariant>, fraction?: number) => void
}

interface UseVariantSelectionReturn {
	shouldCloseModal: boolean
	selectedOptions: SelectedOption[]
	variantOptions: Partial<IProductVariant>[]
	handleSelectVariant: (selectedOption: SelectedOption) => void
}

/**
 * Custom hook to manage the selection of product variants.
 *
 * @param {UseVariantSelectionProps} props - The properties required for the hook.
 * @returns {Object} - The state and handlers for managing variant selection.
 */
export function useVariantSelection({
	productVariants,
	variations,
	addProductToCart,
}: UseVariantSelectionProps): UseVariantSelectionReturn {
	const navigation = useNavigation()
	const totalOptionsRequired = variations.length
	const [shouldCloseModal, setShouldCloseModal] = useState(false)
	const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([])
	const [variantOptions, setVariantOptions] = useState<Partial<IProductVariant>[]>(
		totalOptionsRequired <= 1 ? productVariants : []
	)

	// The total number of options required to fully define a product variant.

	/**
	 * Navigates to the fractioned quantity screen for a selected variant.
	 *
	 * @param {Partial<IProductVariant>} selectedVariant - The selected product variant.
	 */
	function navigateToFractionedQuantity(selectedVariant: Partial<IProductVariant>) {
		navigation.navigate('QuantityFractioned', {
			products: selectedVariant,
			SaleAddProduct: addProductToCart,
		})
		setShouldCloseModal(true)
	}

	/**
	 * Handles the selection of a product variant option.
	 *
	 * @param {SelectedOption} selectedOption - The selected variant option object.
	 */
	function handleSelectVariant(selectedOption: SelectedOption) {
		// Update the list of selected options
		const updatedSelections = getUpdatedSelections(selectedOptions, selectedOption)

		// Filter variants when all but one option is selected
		if (updatedSelections.length === totalOptionsRequired - 1) {
			const filteredVariants = filterMatchingVariants(productVariants, updatedSelections)
			setVariantOptions(filteredVariants)
		}

		// Add product to cart when all options are selected
		if (updatedSelections.length === totalOptionsRequired) {
			const selectedVariant = findMatchingProductVariant({
				selectedOptions: updatedSelections,
				variants: productVariants,
			})

			if (selectedVariant?.isFractioned) {
				navigateToFractionedQuantity(selectedVariant)
				return
			}

			if (selectedVariant) {
				addProductToCart(selectedVariant)
			}

			return
		}

		// Update the state with the new selections
		setSelectedOptions(updatedSelections)
	}

	useEffect(() => {
		if (totalOptionsRequired <= 1) {
			setVariantOptions(productVariants)
		}
	}, [productVariants])

	return {
		shouldCloseModal,
		selectedOptions,
		variantOptions,
		handleSelectVariant,
	}
}
