import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'
import RNFetchBlob from 'rn-fetch-blob'
import { KyteModal, ListOptions } from '../../common'
import { colors } from '../../../styles'
import { moveToKyteFolder, openDeviceCamera, openDevicePhotoLibrary } from '../../../util'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'
import { RootState } from '../../../types/state/RootState'
import { aiProcessProductImage } from '../../../stores/actions'
import { NavigationProp } from '@react-navigation/native'
import { getFormValues } from 'redux-form'
import { IProduct } from '@kyteapp/kyte-utils'

const Strings = {
	t_modal_title: I18n.t('productAddNewImage'),
	t_take_picture: I18n.t('productTakePicture'),
	t_browse_image: I18n.t('productBrowseImage'),
	t_error_title: I18n.t('words.s.attention'),
	t_error_message: I18n.t('aiProductSuggestionsError'),
	t_ok: I18n.t('alertOk'),
}

interface AIProductRegistrationProps {
	shouldShowModal: boolean
	navigation: NavigationProp<any>
  parentRouteKey?: string
	closeModal: () => void
	onError: () => void
	onStartProcessing: () => void
	onFinishProcessing: () => void
}

export interface AIProductRegistrationRef {
	startFlow: () => void
}

const mapStateToProps = (state: RootState) => ({
	user: state.auth.user,
	aiSuggestions: state.products.aiSuggestions,
	loader: state.common.loader,
	productManaging: state.products.productManaging,
	formValues: getFormValues('ProductSave')(state as any),
})

const mapDispatchToProps = {
	aiProcessProductImage,
}

type StateProps = ReturnType<typeof mapStateToProps>

type ActionProps = typeof mapDispatchToProps

type Props = AIProductRegistrationProps & StateProps & ActionProps

const MAX_GALLERY_PHOTOS = 6

const AIProductRegistration: React.FC<Props> = ({
	navigation,
	user,
	aiSuggestions,
	loader,
	shouldShowModal,
	aiProcessProductImage,
	closeModal,
	productManaging,
	onError,
	formValues,
  parentRouteKey,
	onStartProcessing,
	onFinishProcessing,
}) => {
  const hasNavigatedRef = useRef(false)
	const [productImage, setProductImage] = useState<string | null>(null)

	const extractFileName = useCallback((path: string): string => {
		const pathSplitted = path.split('/')
		return pathSplitted.length ? pathSplitted[pathSplitted.length - 1] : ''
	}, [])

	const convertImageToBase64 = useCallback(async (imagePath: string): Promise<string | null> => {
		try {
			const normalizedPath = imagePath.replace('file://', '')
			const base64 = await RNFetchBlob.fs.readFile(normalizedPath, 'base64')
			return `data:image/jpeg;base64,${base64}`
		} catch (error) {
			console.log('[error] AIProductRegistration.convertImageToBase64', error)
			return null
		}
	}, [])

	const processImageWithAI = useCallback(
		async (imagePath: string) => {
			try {
				onStartProcessing()

				const language = I18n.t('locale')

				const imageBase64 = await convertImageToBase64(imagePath)
				if (!imageBase64) {
					onFinishProcessing()
					onError()
					return
				}

				aiProcessProductImage({ image: imageBase64, language }, (error?: Error) => {
					if (error) {
						logEvent('AI Product Suggestions Error', { error: error.message })
						logEvent('Product AI Autofill From Image Error')
						onError()
						onFinishProcessing()
						return
					}
					setProductImage(imagePath)
					closeModal()
					onFinishProcessing()
				})
			} catch (error) {
				onFinishProcessing()
				onError()
			}
		},
		[user, aiProcessProductImage, convertImageToBase64, onError, closeModal, onStartProcessing, onFinishProcessing]
	)

	const handlePhotoResponse = useCallback(
		async (response: any) => {
			try {
				if (response.didCancel || response.error) {
					closeModal()
					return
				}

				const imagePath = response.path
				const value = (formValues || {}) as Partial<IProduct>

				const getPath = () => {
					return Platform.OS === 'ios' ? imagePath : imagePath?.split('file://')[1]
				}

				const source = {
					fileName: extractFileName(getPath()),
					path: getPath(),
					uri: getPath(),
				}

				if (!source.fileName || !source.path) {
					return
				}

				const gallery = productManaging.productOtherPhotos.filter(Boolean)
				const hasMainPhoto = Boolean(productManaging?.productPhoto)
				const shouldPersistImage = !hasMainPhoto || gallery.length < MAX_GALLERY_PHOTOS
				const pathWithProtocol = Platform.OS === 'android' ? `file://${source.path}` : source.path

				const handleProcess = (filePath: string) => {
					closeModal()
					processImageWithAI(filePath)
				}

				logEvent('Product AI Autofill From Image Request', {
					has_store_info: !!user?.store?.description,
					has_store_name: !!user?.store?.name,
					has_name: !!value?.name,
					has_price: typeof value?.salePrice === 'number',
					has_category: !!value?.category,
					has_description: !!value?.description,
				})
				if (shouldPersistImage) {
					moveToKyteFolder(source.fileName, source.path, handleProcess)
				} else {
					handleProcess(pathWithProtocol)
				}
			} catch (error) {
				console.log('[error] AIProductRegistration.handlePhotoResponse', error)
				closeModal()
			}
		},
		[extractFileName, processImageWithAI, productManaging, closeModal]
	)

  useEffect(() => {
		if (aiSuggestions.name && !loader.visible && !hasNavigatedRef.current) {
			hasNavigatedRef.current = true
			navigation.navigate('AIProductSuggestions', { productImage, parentRouteKey })
		}

		if (!aiSuggestions.name) {
			hasNavigatedRef.current = false
		}
	}, [aiSuggestions, loader.visible, productImage, parentRouteKey])

	// Navigate to suggestions screen when suggestions are received
	useEffect(() => {
		if (aiSuggestions.name && !loader.visible) {
			navigation.navigate('AIProductSuggestions', { productImage })
		}
	}, [aiSuggestions, loader.visible])

	const options = [
		{
			title: Strings.t_take_picture,
			onPress: () => openDeviceCamera((event: any) => handlePhotoResponse(event)),
			leftIcon: { icon: 'square-camera', color: colors.secondaryBg },
			hideChevron: true,
		},
		{
			title: Strings.t_browse_image,
			onPress: () => openDevicePhotoLibrary((event: any) => handlePhotoResponse(event)),
			leftIcon: { icon: 'square-gallery', color: colors.secondaryBg },
			hideChevron: true,
		},
	]

	return (
		<KyteModal
			bottomPage
			height="auto"
			title={Strings.t_modal_title}
			isModalVisible={shouldShowModal}
			hideModal={closeModal}
		>
			<ListOptions {...({ items: options } as any)} />
		</KyteModal>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(AIProductRegistration)
