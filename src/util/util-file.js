import { Platform, Image } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'
import { imgUrl } from './env'
import { Amway } from '../../assets/images'
import { logEvent } from '../integrations'

const KYTE_PICTURE_ROOT =
	Platform.OS === 'ios' ? `${RNFetchBlob.fs.dirs.DocumentDir}/Kyte` : `${RNFetchBlob.fs.dirs.PictureDir}/Kyte`
const mime = 'image/jpg'
const cacheDir = RNFetchBlob.fs.dirs.CacheDir

export const initUtilFile = () => {
	RNFetchBlob.fs.isDir(KYTE_PICTURE_ROOT).then((isDir) => {
		if (!isDir) RNFetchBlob.fs.mkdir(KYTE_PICTURE_ROOT)
	})
}

export const moveToKyteFolder = (fileName, pathFile, cb) => {
	try {
		if (pathFile.indexOf(KYTE_PICTURE_ROOT) !== -1) {
			cb(`file://${pathFile}`)
			return
		}

		const kytePathFile = getKytePathFile(fileName)

		RNFetchBlob.fs
			.mv(pathFile, kytePathFile)
			.then(() => {
				if (Platform.OS === 'android') scanFile(kytePathFile)
				cb(`file://${kytePathFile}`)
			})
			.catch((error) => {
				console.log('Move to Kyte Folder Error:', {
					fileName,
					pathFile,
					kytePathFile,
					errorMessage: error.message,
					errorStack: error.stack,
				})
				logEvent('CopyPhotoError', {
					error: error.message || 'No error message was provided.',
					details: {
						fileName,
						pathFile,
						kytePathFile,
					},
				})
			})
	} catch (generalError) {
		console.error('General Error in moveToKyteFolder:', generalError)
		logEvent('GeneralMoveError', { error: generalError.message })
	}
}

export const moveToCacheDir = (from, file, cb) => {
	const to = `file://${cacheDir}/${file}`

	RNFetchBlob.fs
		.mv(from, to)
		.then(() => {
			if (Platform.OS === 'android') scanFile(to)
			if (cb) cb(`file://${to}`)
		})
		.catch((error) => logEvent('MoveToCacheError', { error: error.message || 'No error message was provided.' }))
}

export const removeFile = (image) => RNFetchBlob.fs.unlink(image)
export const localFileExist = (file) => RNFetchBlob.fs.exists(file)

const getKytePathFile = (fileName) => `${KYTE_PICTURE_ROOT}/${fileName}`

const scanFile = (kytePathFile) => {
	RNFetchBlob.fs.scanFile([{ path: kytePathFile, mime }])
}

export const getImagePath = (file) => {
	const isHttp = file.indexOf('http') === 0
	if (isHttp) return file

	const arr = file.split('/')
	const filePath =
		Platform.OS === 'ios'
			? `${KYTE_PICTURE_ROOT}/${arr[arr.length - 1]}`
			: `file://${KYTE_PICTURE_ROOT}/${arr[arr.length - 1]}`
	return filePath
}

export const extractFileName = (path) => {
	if (!path) return ''
	const pathSplitted = path.split('/')
	return pathSplitted.length ? pathSplitted[pathSplitted.length - 1] : ''
}

/**
 * Extracts the file name and query parameters from a URL.
 * If the URL contains "%2F", the file name is taken from after the last occurrence of "%2F".
 * Otherwise, it uses the text after the last "/".
 *
 * @param {string} url - The input URL or file path.
 * @returns {{ fileName: string, params: string }} An object containing the fileName and any query parameters.
 */
export const extractFileNameAndParams = (url) => {
	if (typeof url !== 'string') return { fileName: '', params: '' }

	const [base, query] = url.split('?')
	// Check for "%2F", if found take substring after last occurrence; else use last "/"
	const percentIndex = base.lastIndexOf('%2F')
	const fileName = percentIndex !== -1 ? base.substring(percentIndex + 3) : base.substring(base.lastIndexOf('/') + 1)
	const params = query ? `?${query}` : ''
	return { fileName, params }
}

/**
 * Prepares a variation object by extracting and formatting file names for its options' photos.
 *
 * This function processes the `options` array of a variation object, updating the `photos` property
 * of each option. Specifically, it extracts the file name from the `image` property (and optionally
 * other image-related properties like `imageThumb`, `imageLarge`, and `imageMedium` if uncommented).
 *
 * The purpose of this function is to ensure that the variation object is formatted correctly for
 * further processing or API requests, where only the file name (without query parameters or full paths)
 * is required.
 *
 * @param {Object} variation - The variation object to be processed.
 * @returns {Object} A new variation object with updated file names in the `photos` property of each option.
 */
export const prepareVariationFileNames = (variation) => {
	const plainVariation = JSON.parse(JSON.stringify(variation))

	return {
		...plainVariation,
		options: plainVariation?.options?.map((option) => ({
			...option,
			photos: {
				image: extractFileNameAndParams(option?.photos?.image)?.fileName,
			},
		})),
	}
}

/**
 * Prepares the file names from a product object.
 * This function replaces the image, imageThumb, and gallery properties of the product
 * with their respective file names and parameters.
 * the way the product save API (PUT) expects.
 *
 * @param {Object} product - The product object containing image properties.
 * @return {Object} A new product object with cleared file names.
 *
 */
export const prepareProductFileNames = (product) => ({
	...product,
	image: extractFileNameAndParams(product?.image)?.fileName,
	imageThumb: extractFileNameAndParams(product?.imageThumb)?.fileName,
	gallery: product?.gallery?.map((image) => ({
		...image,
		url: extractFileNameAndParams(image?.url)?.fileName,
	})),
	variations: product?.variations?.map((variation) => prepareVariationFileNames(variation)),
})

export const fileExists = (imageUrl, existCb, notExistCb) => {
	Image.getSize(imageUrl, existCb, notExistCb)
}

export const getImageUrl = (doc, imageType = '') =>
	`${imgUrl}/${doc.uid}%2F${imageType}${extractFileName(doc.image)}?alt=media`

export const getServerImageUrl = (imagePath = '') => `${imgUrl}${imagePath}`

export const imageHasAltMedia = (image) => {
	if (!image || typeof image !== 'string') return false
	return image.includes('alt=media')
}

export const writePartnerLogo = async (partner) => {
	let fileToBeWritten = ''
	switch (partner) {
		default:
		case 'amway':
			fileToBeWritten = Amway.replace(/^data:image\/png;base64,/, '')
	}
	const fileWritten = await RNFetchBlob.fs
		.writeFile(`${KYTE_PICTURE_ROOT}/logo_amway.png`, fileToBeWritten, 'base64')
		.then(() => getImagePath(`${KYTE_PICTURE_ROOT}/logo_amway.png`))
	// console.log('fileWritten', fileWritten);
	return fileWritten
}
