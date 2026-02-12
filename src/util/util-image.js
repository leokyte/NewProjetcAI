import { Platform } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import I18n from '../i18n/i18n'
import { initUtilFile, requestPermission } from '.'
import { PHOTO_LIBRARY, CAMERA } from '../enums'

const croppingOptions = {
	cropperToolbarTitle: '',
	loadingLabelText: I18n.t('words.s.loading'),
	cropperChooseText: I18n.t('words.s.choose'),
	cropperCancelText: I18n.t('alertDismiss'),
	avoidEmptySpaceAroundImage: false,
	mediaType: 'photo',
	freeStyleCropEnabled: true,
	compressImageQuality: 0.8,
}

const croppingSizeDefault = {
	width: 1008,
	height: 840,
}

/* NOVO OPEN DEVICE PHOTO LIBRARY */
const openPicker = async (callbackSuccess) => {
	try {
		const pickerResponse = await ImagePicker.openPicker(croppingOptions)
		callbackSuccess(pickerResponse)
	} catch (error) {
		if (error.code !== 'E_PICKER_CANCELLED') await requestPermission(PHOTO_LIBRARY)
	}
}

export const openDevicePhotoLibrary = (callbackSuccess) => {
	try {
		initUtilFile()
		openPicker(callbackSuccess)
	} catch (error) {
		console.log('[error] openDevicePhotoLibrary', error)
	}
}

const openCamera = async (callbackSuccess) => {
	try {
		const pickerResponse = await ImagePicker.openCamera(croppingOptions)
		callbackSuccess(pickerResponse)
	} catch (error) {
		if (error.code !== 'E_PICKER_CANCELLED') await requestPermission(CAMERA)
		console.log('[error] openCamera', error)
	}
}

export const openDeviceCamera = (callbackSuccess) => {
	try {
		initUtilFile()
		openCamera(callbackSuccess)
	} catch (error) {
		console.log('[error] openDeviceCamera', error)
	}
}

export const cropImage = async (imagePath, crop) => {
	try {
		const imageResponse = await ImagePicker.openCropper({
			...croppingOptions,
			...Platform.select({
				ios: {
					width: crop?.width || croppingSizeDefault.width,
					height: crop?.height || croppingSizeDefault.height,
				},
			}),
			defaultCropWidth: crop?.width || croppingSizeDefault.width,
			defaultCropHeight: crop?.height || croppingSizeDefault.height,
			path: imagePath,
		})

		return imageResponse
	} catch (error) {
		console.log('[error] cropImage', error)
	}
}

/**
 * Updates the photo of a specific variation option within a list of variations.
 * 
 * This function iterates through the `variations` array to find the variation that matches
 * the `selectedVariationForPhotoEdit` by its `_id`. Once the matching variation is found,
 * it further iterates through its `options` array to locate the option that matches the
 * selected option's title. The `photos.image` property of the matching option is then updated
 * with the provided `image`.
 * 
 * The purpose of this function is to update the photo of a specific variation option while
 * leaving the rest of the variations and options unchanged.
 * 
 * @param {IVariation<Array>} variations - The array of variation objects to be updated, or undefined.
 * @param {Object} selectedVariationForPhotoEdit - The variation object containing the selected option for photo editing.
 * @param {string} image - The new image URL or path to update in the selected option.
 * 
 * @returns {Array} A new array of variations with the updated photo for the selected option.
 */
export const updateVariationPhoto = ({ variations, selectedVariationForPhotoEdit, image }) => variations.map((variation) => {
		const plainVariation = JSON.parse(JSON.stringify(variation));

    // Check if the current variation matches the selected variation for photo editing
    if (plainVariation._id === selectedVariationForPhotoEdit._id) {
      return {
        ...plainVariation,
        options: plainVariation.options.map((option) => {
          // Check if the current option matches the selected option
          if (option.title === selectedVariationForPhotoEdit.options[0].title) {
            return {
              ...option,
              photos: {
                ...option?.photos,
                image, // Update the `photos.image` field with the new image
              },
            };
          }
          return option; // Return the option unchanged if it doesn't match
        }),
      };
    }
    return plainVariation; // Return the variation unchanged if it doesn't match
  });
