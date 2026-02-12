import { ICategory, IGallery, IProduct } from '@kyteapp/kyte-utils'
import { IAuthState } from '../../types/state/auth'
import { colors } from '../../styles'

export type IProductManaging = {
	initialStock: number
	currentStock: number
	minimumStock: number
	productPhoto: string
	productOtherPhotos: IGallery[]
	productColor: {
		foreground: string
		background: string
	}
	category: ICategory & { clone: () => ICategory }
	isFractioned: boolean
	isStockEnabled: boolean
	contentHasChanged: boolean
}

/**
 * Common function to build product data following the same pattern as ProductDetail's formSubmit method.
 * This is the default way of saving/updating products in the application.
 * It handles all required fields and formatting needed for a product, including:
 * - Stock configuration
 * - Category date adaptation
 * - Image and gallery management
 * - Required fields validation
 *
 * @param productFormValues - Partial product data from the form
 * @param productStateManagement - Product management state containing stock and additional data.
 * These values come from the products.productManaging reducer state.
 * @param auth - Authentication state containing user data
 * @returns The formatted product object ready to be saved
 */
export const buildProductRequiredFields = (
	productFormValues: Partial<IProduct>,
	productStateManagement: IProductManaging,
	auth: IAuthState
): Partial<IProduct> => {
	const {
		productPhoto,
		productOtherPhotos,
		productColor,
		isFractioned,
		category,
	} = productStateManagement

	// Colors
	const defaultColor = {
		foreground: colors.primaryBg,
		background: colors.secondaryBg,
	}

	// Categories
	const categoryClone = { ...category?.clone(), search: category?.search || '' }

	// Build product based on Form Values and Product Management State
	const adaptedProduct = {
		...productFormValues,
		id: productFormValues.id || undefined,
		_id: productFormValues.id || undefined,
		uid: productFormValues.uid || auth.user.uid,
		aid: auth.aid,
		userName: auth.user.displayName,
		foreground: productColor ? productColor.foreground : productFormValues.foreground || defaultColor.foreground,
		background: productColor ? productColor.background : productFormValues.background || defaultColor.background,
		image: productPhoto || undefined,
		gallery: productOtherPhotos,
		label: productFormValues.label || productFormValues.name?.substring(0, 6),
		category: category ? categoryClone : null,
		saleCostPrice: productFormValues.saleCostPrice || productFormValues.salePrice,
		isFractioned,
		code: '',
		search: productFormValues.search || '',
		showOnCatalog: productFormValues.showOnCatalog || true,
		stockActive: false,
		stock: null,
		active: true,
	}

	return adaptedProduct
}
