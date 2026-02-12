import {
	ICatalog,
	IParentProduct,
	IProduct,
	IProductVariant,
	IProductWithVariation,
	isBetaCatalog,
	IStandardProduct,
	IVariation,
	IVariationOption,
} from '@kyteapp/kyte-utils'
import { IVariant, IVariantOption } from '../../stores/variants/variants.types'
import { checkUserPermission } from '../util-common'

export const groupSkusByPrimaryVariation = (skus?: Partial<IProductVariant>[]) => {
	const groupedSkusMap: {
		[key: string]: {
			primaryVariation?: Partial<IVariation>
			primaryKey: string
			skus: Partial<IProductVariant>[]
		}
	} = {}

	skus?.forEach((sku) => {
		const [firstVariation, secondVariation] = sku.variations ?? []
		let primaryVariation = firstVariation
		if (!primaryVariation?.isPrimary && secondVariation?.isPrimary) primaryVariation = secondVariation
		const { title = '' } = primaryVariation?.options?.[0] ?? {}

		const primaryKey = `${primaryVariation?.name}: [[bold]]${title}[[bold]]`

		// Check if the group already exists and add the sku to the group
		const existingGroup = groupedSkusMap[primaryKey]
		if (existingGroup) {
			existingGroup.skus.push(sku)
		} else {
			groupedSkusMap[primaryKey] = { primaryVariation, primaryKey, skus: [sku] }
		}
	})
	const groupedSkus = Object.values(groupedSkusMap)

	// Return e.g:
	// [{ primaryKey: 'Cor: Verde', skus: [{...sku, option: 'Tamanho: P'}, {...sku, option: 'Tamanho: M'}] },

	return groupedSkus
}

/**
 * Process created variants based on wizard state to set primary variations, filter and remove inactive options
 *
 * @param createdVariants - Array of newly created variants that need to be processed
 * @param wizardState - Current wizard state containing variation settings
 * @returns Array of processed variants with isPrimary flags and active options
 *
 * @example
 * // Input:
 * createdVariants = [
 *   { name: 'Color', options: [{title: 'Red'}, {title: 'Blue'}] },
 *   { name: 'Size', options: [{title: 'S'}, {title: 'M'}] }
 * ]
 * wizardState.chosenVariations = [
 *  { name: 'Color', isPrimary: true, options: [{title: 'Red', active: true}, {title: 'Blue', active: false}] },
 * 	{ name: 'Size', options: [{title: 'S', active: false}, {title: 'M', active: true}] }
 * ]
 *
 * // Output:
 * [
 *   { name: 'Color', isPrimary: true, options: [{title: 'Red', active: true}] },
 *   { name: 'Size', isPrimary: false, options: [{title: 'M', active: true}] }
 * ]
 */
export const getPrimaryVariant = (createdVariants: IVariant[], wizardStateVariants: IVariant[]): IVariant[] => {
	// find the primary name, trimmed
	const primaryName = wizardStateVariants.find((v) => Boolean(v.isPrimary))?.name?.trim()
	const isUnique = createdVariants.length === 1

	return createdVariants.map((variant) => {
		// normalize the name
		const name = variant.name.trim()
		// find the matching wizard variant by trimmed name
		const wiz = wizardStateVariants.find((v) => v.name.trim() === name)
		// only keep the active options
		const options = variant.options.filter((opt) => wiz?.options.some((o) => o.title === opt.title && o.active))

		return {
			...variant,
			name,
			options,
			isPrimary: isUnique || name === primaryName,
		}
	})
}

/**
 * Groups variant options by their names and returns an array of objects
 * where each object represents a variant with its name as the key and the
 * title of its first option as the value.
 *
 * @param {IProductVariant} variant - The product variant containing variations to be grouped.
 * @returns {Array<{ [key: string]: string }>} An array of objects representing the grouped variant options.
 * @example [{ Tamanho: 'M' }, { Cor: 'vermelho'} ]
 */
export function groupVariantOptions(variant?: Partial<IProductVariant>) {
	const variations = [...(variant?.variations ?? [])] // variations likely to not be a normal array/collection
	const sortedVariations = variations.sort?.((variation, nextVariation) => (nextVariation.isPrimary ? 1 : -1)) ?? []

	const groupedOptions = sortedVariations.map((variation) => {
		const title = variation?.options?.[0].title ?? ''
		const variationName = variation?.name

		if (variationName) return { [variationName]: title }
	})

	return groupedOptions
}

/**
 * Generates a variant name string for a given product with variations.
 *
 * @param {IProductWithVariation} product - The product object containing variations.
 * @returns {string} The generated variant name string.
 *
 * @example
 * const product = {
 *   variations: [
 *     { color: 'Red' },
 *     { size: 'M' }
 *   ]
 * };
 * const variantName = getVariantName(product);
 * console.log(variantName); // Output: "color: Red, size: M"
 */
export function getVariantName(product: IProductWithVariation) {
	let title = ''
	const options = groupVariantOptions(product)

	options.forEach((option = {}, index) => {
		const [variationName] = Object.keys(option ?? {})
		const shouldPutComma = index !== options?.length - 1

		if (option) {
			title += `${variationName}: ${option[variationName] ?? ''}`

			if (shouldPutComma) {
				title += ', '
			}
		}
	})

	return title
}

/**
 * Checks if the given product is a variant.
 * A variant is a product's child, meaning it has a parentId.
 *
 * @param product - The product to check, which can be of type IProduct, IProductWithVariation, or IProductVariant.
 * @returns A boolean indicating whether the product is a variant.
 */
export function checkIsVariant(
	product: IProduct | IProductWithVariation | IProductVariant
): product is IProductVariant {
	const castedProduct = product as IProductVariant
	const hasVariations = Boolean(castedProduct?.variations?.length)
	const hasVariants = Boolean((castedProduct as any)?.variants?.length)
	const isVariant = Boolean(castedProduct?.isChildren || (hasVariations && !hasVariants)) // TODO: use only product.isChildren

	return isVariant
}

/**
 * Generates a map of product variants grouped by their unique identifier.
 *
 * @param products - An array of products to process. Defaults to an empty array.
 * @returns An object where the keys are product IDs and the values are arrays of product variants.
 *
 * @remarks
 * - The function checks if each product is a variant using the `checkIsVariant` function.
 * - If a product is identified as a variant, it is added to the corresponding key in the map.
 * - The key is determined by the product's `_id`, `id`, or defaults to `'ble'` if neither is available.
 */
export function getVariantsMap(products: IProduct[] = []) {
	const variantsMap: { [key: string]: IProductVariant[] } = {}
	products?.forEach?.((product) => {
		const isVariant = checkIsVariant(product)

		if (isVariant) {
			const key = product.parentId

			variantsMap[key] = [...(variantsMap[key] ?? []), product]
		}
	})

	return variantsMap
}

/**
 * Filters and returns a list of new variant options that should be persisted.
 *
 * This function takes a variant and a list of variant options, and filters out
 * the options that are either inactive or already exist in the variant's options.
 *
 * @param variant - The variant object containing existing options.
 * @param options - The list of variant options to filter.
 * @returns A filtered array of variant options that are active and not already present in the variant.
 */
export function getVariantNewOptions(variant: IVariant, options: IVariantOption[]): IVariantOption[] {
	const newOptions =
		options.filter((variantOption) => {
			if (!variantOption.active) return false
			const wasNotCreated = !variant?.options.some((option) => option.title === variantOption.title)
			const shouldPersistOption = variantOption.active && wasNotCreated

			return shouldPersistOption
		}) ?? []

	return newOptions
}

/**
 * Updates the `variants` property of a parent product with a new or modified variant
 * and returns a new updated parent product object.
 *
 * @param {IParentProduct} parentProduct - The parent product containing the variants to be updated.
 * @param {IProductVariant} variant - The variant to update or add in the parent product's variants list.
 * @returns {IParentProduct} A new parent product object with the updated `variants` property.
 *
 * @remarks
 * - If the parent product has no variants, the original parent product is returned.
 * - The function replaces the existing variant in the `variants` array if it matches by `_id` or `id`.
 */
export function getParentProductWithUpdatedVariants(
	parentProduct: IParentProduct,
	variant: IProductVariant
): IParentProduct {
	if (!parentProduct.variants?.length) return parentProduct

	const updatedVariants = [...parentProduct.variants]
	const index = updatedVariants.findIndex((item) => (item._id || item.id) === (variant.id || variant._id))
	updatedVariants.splice(index, 1, variant)

	return {
		...parentProduct,
		variants: updatedVariants,
	}
}

export function getVariantImage(product?: IParentProduct, primaryVariation?: Partial<IVariation>) {
	const photos = product?.variations
		.find((variation: IVariation) => variation._id === primaryVariation?._id)
		?.options?.find((option: IVariationOption) => option.title === primaryVariation?.options?.[0]?.title)?.photos

	return photos?.image
}

export function getActiveOptionsCount(variants: IVariant[]) {
	const quantity = variants.reduce((acc, variation) => {
		const activeOptions = variation.options.filter((option) => option.active)

		return activeOptions.length * acc
	}, 1)

	return quantity
}

export const totalOptionsCount = (variations?: IVariation[]) =>
	variations ? variations?.reduce((acc, item) => acc + item.options.length, 0) : 0
export function checkShouldShowCatalogVersionWarning(catalog?: ICatalog) {
	const shouldShow = Boolean(catalog) && !isBetaCatalog(catalog?.version)

	return shouldShow
}

export function getGroupedVariationsNames(variations?: Partial<IVariation>[], separator = ', '): string {
	const groupedVariationsNames =
		variations
			?.filter(Boolean)
			?.map((variation) => variation?.name || '')
			?.join(separator) ?? ''

	return groupedVariationsNames
}

export function getProductWithoutVariants(product: IProduct): IStandardProduct {
	let updatedProduct = { ...product } as any

	delete updatedProduct.variants
	delete updatedProduct.variations
	delete updatedProduct.isParent
	delete updatedProduct.isChildren

	return updatedProduct
}

export function checkHasVariantsPermission(permissions: Parameters<typeof checkUserPermission>[0]) {
	const { isOwner, isAdmin } = checkUserPermission(permissions)
	const hasVariantsPermission = Boolean(isOwner || isAdmin)

	return hasVariantsPermission
}
