import { useCallback, useEffect, useState } from 'react'
import { getImageUrl, getServerImageUrl, imageHasAltMedia } from '../util'

const useProductImageUrl = (product, useLegacyImage = false) => {
	// Uses image path or build it if it is not available
	const builtInPath = imageHasAltMedia(product.image)
	const buildImagePath = getImageUrl(product, useLegacyImage ? '' : 'thumb_280_')
	const imgUrl = getServerImageUrl(product.imageThumb)
	const image = builtInPath ? imgUrl : buildImagePath

	const [imageUrl, setImageUrl] = useState(image)

	// Check if image thumb exists otherwise use full image
	const checkImageThumbExists = useCallback(async () => {
		await fetch(imageUrl, { method: 'HEAD' }).then((res) => {
			if (res.ok) return
			setImageUrl(getImageUrl(product))
		})
	}, [product, imageUrl])

	useEffect(() => {
		// If user preference is to use legacy image, we don't need to check if thumb exists
		if (useLegacyImage) return
		checkImageThumbExists()
	}, [checkImageThumbExists, useLegacyImage])

	return imageUrl
}

export default useProductImageUrl
