import React from 'react'

import { KyteModal, ListOptions } from '.'
import I18n from '../../i18n/i18n'
import { cropImage, openDeviceCamera, openDevicePhotoLibrary } from '../../util'
import { colors } from '../../styles'

export const KyteUploadPhoto = ({ isVisible, setBannerPhoto, setShowModalPhoto, crop }) => {
	const handlePhotoSuccess = async (response) => {
		try {
			const imageResponse = await cropImage(response.path, crop)
			setBannerPhoto(imageResponse.path)
		} catch (error) {
			console.log(error)
		} finally {
			setShowModalPhoto(false)
		}
	}

	const options = [
		{
			title: I18n.t('productTakePicture'),
			onPress: () => openDeviceCamera(handlePhotoSuccess),
			leftIcon: { icon: 'square-camera', color: colors.secondaryBg },
			hideChevron: true,
		},
		{
			title: I18n.t('productBrowseImage'),
			onPress: () => openDevicePhotoLibrary(handlePhotoSuccess),
			leftIcon: { icon: 'square-gallery', color: colors.secondaryBg },
			hideChevron: true,
		},
	]

	return (
		<KyteModal
			topRadius={14}
			bottomPage
			height="auto"
			title={I18n.t('productAddNewImage')}
			isModalVisible={isVisible}
			hideModal={() => setShowModalPhoto(false)}
		>
			<ListOptions items={options} />
		</KyteModal>
	)
}

export default KyteUploadPhoto
