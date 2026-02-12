import { useEffect } from 'react'
import { IProductVariant, IProductWithVariation } from '@kyteapp/kyte-utils'
import { getProductVariants } from '../stores/variants/actions/product-variant.async.actions'

interface UseFetchProductVariantsProps {
	product?: IProductWithVariation
	productVariants?: Partial<IProductVariant>[] | null
	isFocused?: boolean
	getProductVariants: typeof getProductVariants
}

const useFetchProductVariants = ({
	product,
	productVariants,
	isFocused,
	getProductVariants,
}: UseFetchProductVariantsProps) => {
	useEffect(() => {
		const hasProductVariants = Boolean(productVariants)
		const shouldFetchVariants = isFocused && !!product && !hasProductVariants

		if (shouldFetchVariants) getProductVariants(product)
	}, [product, isFocused, productVariants, getProductVariants])
}

export default useFetchProductVariants
