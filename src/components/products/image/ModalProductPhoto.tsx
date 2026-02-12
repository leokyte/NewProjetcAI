import React from 'react'
import I18n from '../../../i18n/i18n'
import { KyteModal, ListOptions } from '../../common'
import { cropImage, moveToKyteFolder, openDeviceCamera, openDevicePhotoLibrary } from '../../../util'
import { colors } from '../../../styles'
import { Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { productManagementSetValue, setSelectedVariationForPhotoEdit } from '../../../stores/actions'
import { connect } from 'react-redux'
import { IVariation } from '@kyteapp/kyte-utils'
const ListOptionsIgnoredType: any = ListOptions

interface ModalProductPhotoProps {
	isVisible: boolean
	onCloseModal: (value: boolean) => void
	productManagementSetValue: typeof productManagementSetValue
	selectedVariation?: Partial<IVariation>
	setSelectedVariationForPhotoEdit: typeof setSelectedVariationForPhotoEdit
	handleOpenPhotoSelector?: () => void
}

const ModalProductPhoto: React.FC<ModalProductPhotoProps> = ({
	isVisible,
	onCloseModal,
	productManagementSetValue,
	setSelectedVariationForPhotoEdit,
	selectedVariation,
	handleOpenPhotoSelector
}: ModalProductPhotoProps) => {
	const navigation = useNavigation()

	const extractFileName = (path: string) => {
		const pathSplitted = path.split('/')
		return pathSplitted.length ? pathSplitted[pathSplitted.length - 1] : ''
	}

	const photoResponse = async (response: any) => {
		try {
			const imageResponse = await cropImage(response.path)
			onCloseModal(false)

			const getPath = () => {
				const path = (imageResponse?.path || imageResponse) as string
				return Platform.OS === 'ios' ? path : path?.split('file://')[1]
			}
			const setPhoto = (fileName: any) => {
				const productPhoto = Platform.OS === 'ios' ? source.uri : fileName
				productManagementSetValue(productPhoto, 'productPhoto')
				setSelectedVariationForPhotoEdit(selectedVariation)
				if (handleOpenPhotoSelector) setTimeout(() => handleOpenPhotoSelector(), 500)
				else navigation.navigate('ProductPhotoSelector')
			}

			const source = {
				fileName: extractFileName(getPath()),
				path: getPath(),
				uri: getPath(),
			}

			if (!source?.fileName || !source?.path) {
				return
			}

			moveToKyteFolder(source.fileName, source.path, setPhoto)
		} catch (error) {
			console.log('[error] photoResponse', error)
		}
	}

	const options: any = [
		{
			title: I18n.t('productTakePicture'),
			onPress: () => openDeviceCamera((event: any) => photoResponse(event)),
			leftIcon: { icon: 'square-camera', color: colors.secondaryBg },
			hideChevron: true,
		},
		{
			title: I18n.t('productBrowseImage'),
			onPress: () => openDevicePhotoLibrary((event: any) => photoResponse(event)),
			leftIcon: { icon: 'square-gallery', color: colors.secondaryBg },
			hideChevron: true,
		},
	]
	return (
		<KyteModal
			bottomPage
			height="auto"
			title={I18n.t('productAddNewImage')}
			isModalVisible={isVisible}
			hideModal={() => onCloseModal(false)}
		>
			<ListOptionsIgnoredType items={options} />
		</KyteModal>
	)
}

export default connect(null, { productManagementSetValue, setSelectedVariationForPhotoEdit })(ModalProductPhoto)
