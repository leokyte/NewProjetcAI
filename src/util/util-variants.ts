import {
	checkIsVariant,
	getProductPrice,
	IParentProduct,
	IParentProductWithoutVariants,
	IProduct,
	IProductVariant,
	IVariantsPrice,
	IVariation,
} from '@kyteapp/kyte-utils'

export function generateVariantPageTitle(variations: Partial<IVariation>[] = []) {
	const sortedAttributes = variations.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))

	const title = sortedAttributes.map((attr) => `${attr.name}: ${attr.options?.[0]?.title ?? ''}`).join(', ')

	return title
}

/**
 * Sorts an array of product variants based on the order of variant IDs
 * specified in the given product's `variants` property.
 *
 * @param product - The product object containing a `variants` property
 *                  which is an array of objects with `id` or `_id` fields.
 * @param variants - The array of product variants to be sorted.
 * @returns The sorted array of product variants. If sorting cannot be performed,
 *          the original `variants` array is returned.
 */
export function sortVariants(product: IParentProduct, variants: IProductVariant[]) {
	// --- Helpers ---
	function cartesianProduct<T>(arrays: T[][]): T[][] {
		return arrays.reduce<T[][]>((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [[]])
	}

	function getCombinationKey(options: { title?: string }[]): string {
		return options.map((opt) => opt.title?.toLowerCase?.() ?? '').join('-')
	}

	type GetVariantKeyParams = {
		variant: IProductVariant
		primaryVariation: IVariation
		nonPrimaryVariations: IVariation[]
	}

	function getVariantKey({ variant, primaryVariation, nonPrimaryVariations }: GetVariantKeyParams): string {
		const optionObjects: { title?: string }[] = []
		const primaryFound = variant.variations?.find((v) => v._id === primaryVariation._id)
		optionObjects.push(primaryFound?.options?.[0] ?? { title: '' })
		for (const variation of nonPrimaryVariations) {
			const found = variant.variations?.find((v) => v._id === variation._id)
			optionObjects.push(found?.options?.[0] ?? { title: '' })
		}
		return getCombinationKey(optionObjects)
	}

	// --- Main logic ---
	const primaryVariation = product.variations.find((v) => v.isPrimary) ?? product.variations[0]
	const nonPrimaryVariations = product.variations.filter((v) => v._id !== primaryVariation._id)

	function buildOptionIndexMap(): Record<string, number> {
		const map: Record<string, number> = {}
		let idx = 0
		for (const option of primaryVariation.options) {
			if (nonPrimaryVariations.length) {
				const nonPrimaryOptionsArrays = nonPrimaryVariations.map((v) => v.options)
				for (const nonPrimaryCombo of cartesianProduct(nonPrimaryOptionsArrays)) {
					const key = getCombinationKey([option, ...nonPrimaryCombo])
					map[key] = idx++
				}
			} else {
				const key = getCombinationKey([option])
				map[key] = idx++
			}
		}
		return map
	}

	const optionIndexMap = buildOptionIndexMap()

	function getVariantSortIndex(variant: IProductVariant): number {
		const key = getVariantKey({ variant, primaryVariation, nonPrimaryVariations })
		return optionIndexMap[key] ?? Number.MAX_SAFE_INTEGER
	}

	return variants.slice().sort((a, b) => getVariantSortIndex(a) - getVariantSortIndex(b))
}

export const getVariantsPrice = (product: IParentProduct): IVariantsPrice => {
	const parentProductPrice = getProductPrice(product)
	const variantsPrice: IVariantsPrice = { highest: parentProductPrice, lowest: parentProductPrice }
	const variants = Array(...(product?.variants ?? [])) ?? []

	variants.forEach((variant, index) => {
		const price = getProductPrice(variant)
		const isLowest = index === 0 || price < variantsPrice.lowest
		const isHighest = index === 0 || price > variantsPrice.highest

		if (isLowest) variantsPrice.lowest = price
		if (isHighest) variantsPrice.highest = price
	})

	return variantsPrice
}

export const adaptParentProduct = (product: IParentProduct): IParentProductWithoutVariants => ({
	...product,
	variantsPrice: getVariantsPrice(product),
	variants: [],
})

export const checkIsProductAVariant = (product: IProduct) =>
	checkIsVariant(product) || Boolean((product as IProductVariant)?.variations?.length)
