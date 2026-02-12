import { Alert, View, Platform, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Icon } from 'react-native-elements'
import { clone, random } from 'lodash'
import { isFree, KyteProLabel, Container } from '@kyteapp/kyte-ui-components'

import {
	productManagementSetValue,
	checkPlanKeys,
	checkFeatureIsAllowed,
	openModalWebview,
} from '../../../stores/actions'
import {
	generateDefaultPROFeatures,
	getPROFeature,
	cropImage,
	openDeviceCamera,
	openDevicePhotoLibrary,
	moveToKyteFolder,
	removeFile,
	localFileExist,
} from '../../../util'
import { ActionButton, DetailPage, KyteModal, ListOptions } from '../../common'
import { gridStyles, colors, scaffolding, msg } from '../../../styles'
import ProductImage from '../image/ProductImage'
import GridPlaceholder from '../../current-sale/product-sale/placeholders/GridPlaceholder'
import I18n from '../../../i18n/i18n'
import KyteImageGallery from '../../common/KyteImageGallery'

const Strings = {
	PAGE_TITLE: I18n.t('words.p.photos'),
	SAVE_BUTTON_TEXT: I18n.t('alertSave'),
	DISMISS_BUTTON_TEXT: I18n.t('alertDismiss'),
	NO_ITEM_ALERT_TITLE: I18n.t('words.s.attention'),
	NO_ITEM_ALERT_MSG: 'Você precisa selecionar a foto principal.',
	ACCESS_OS_CONFIG_MSG: I18n.t('expressions.redirectOsConfig'),
	CROP_ERROR_MSG: I18n.t('expressions.errorWhileSelectingPhoto'),
	PERMISSION_DENIED_IOS: I18n.t('permissionDeniedAlertDescriptionIOS'),
	SAVE_CHANGES: I18n.t('expressions.saveChanges'),
	EXIT_WITHOUT_SAVING: I18n.t('expressions.exitWithoutSavingChanges'),
	EXIT_MESSAGE: I18n.t('expressions.exitWithoutSavingChangesMessage'),

	PRO_LABEL: I18n.t('plansPage.pro.title'),
}

const MAIN_PHOTO = 'main'
const OTHER_PHOTO = 'other'

const ProductPhotoSelector = (props) => {
	const { events, productMainImage } = props
	const [mainPhoto, setMainPhoto] = useState(productMainImage || props?.productManaging?.productPhoto)
	const [otherPhotos, setOtherPhotos] = useState(props.productManaging.productOtherPhotos.map((pm) => pm.url))
	const [isSettingPhoto, setIsSettingPhoto] = useState(false)
	// this will store which index needs to be replaced for a new photo
	const [currentIndex, setCurrentIndex] = useState(0)

	// that state below isn't only an english mistake
	// it will store the first item to render the '+' signal and prevent double rendering of this
	const [indexFirst, setIndexFirst] = useState(0)

	const [isPhotoZoom, setIsPhotoZoom] = useState(false)
	const [photoZoomIndex, setPhotoZoomIndex] = useState(0)

	const [photoType, setPhotoType] = useState(null)

	const [hasEdition, setHasEdition] = useState(false)

	const [multiPhotos, setMultiPhotos] = useState(generateDefaultPROFeatures('PROMultiPhotos'))

	const getPROFeatures = async () => {
		const featureMultiPhotos = await getPROFeature('PROMultiPhotos')
		featureMultiPhotos && setMultiPhotos(featureMultiPhotos)
	}

	useEffect(() => {
		getPROFeatures()
	}, [])

	useEffect(() => {
		for (let i = 0; i < 6; i++) {
			if (otherPhotos[i] === null || otherPhotos[i] === undefined) {
				setIndexFirst(i)
				break
			}
		}
	}, [otherPhotos])

	// Methods responsible to handle the response from picker
	const handlePhotoSuccess = (response) => {
		cropImage(response.path)
			.then((imageResponse) => {
				const pathSplitted = imageResponse.path.split('/')
				const source = {
					fileName: pathSplitted.length ? pathSplitted[pathSplitted.length - 1] : '',
					path: Platform.OS === 'ios' ? imageResponse.path : imageResponse.path.split('file://')[1],
					uri: response.path,
				}

				moveToKyteFolder(source.fileName, source.path, (filename) =>
					localFileExist(response.path).then((exists) => {
						if (exists) {
							removeFile(response.path)
						}

						if (photoType === MAIN_PHOTO) {
							setMainPhoto(filename)
						}
						if (photoType === OTHER_PHOTO) {
							const newOtherPhotos = clone(otherPhotos)
							for (let i = 0; i < 6; i++) {
								if (i === currentIndex && (newOtherPhotos[i] === null || newOtherPhotos[i] === undefined)) {
									newOtherPhotos[i] = filename
								}
							}
							setOtherPhotos(newOtherPhotos)
						}
						setIsSettingPhoto(false)
						setPhotoType(null)
						setHasEdition(true)
					})
				)
			})
			.catch((error) => {
				console.log(error)
			})
	}

	const handleBackButton = () => {
		const mainPhotoRemoved = props?.isModal && ((!mainPhoto && Boolean(productMainImage)) || (mainPhoto && !productMainImage))

		if (hasEdition || mainPhotoRemoved) {
			events?.alertEvent()
			return Alert.alert(I18n.t('words.s.attention'), Strings.EXIT_MESSAGE, [
				{
					text: Strings.EXIT_WITHOUT_SAVING,
					onPress: () => {
						if (props?.isModal) {
							props?.handleClose()
						} else {
							const { productPhoto, productOtherPhotos } = props.productManaging
							props.productManagementSetValue(productPhoto, 'productPhoto')
							props.productManagementSetValue(productOtherPhotos, 'productOtherPhotos')	
							props.navigation.goBack()
						}
					},
				},
				{ text: Strings.SAVE_CHANGES, onPress: () => (props?.handleExternalSave ? props?.handleExternalSave(mainPhoto) : handleSave()) },
			])
		}
		props?.isModal ? props?.handleClose() : props.navigation.goBack()
	}
	const handleSave = () => {
		if (!mainPhoto && !otherPhotos) {
			props.productManagementSetValue(mainPhoto, 'productPhoto')
			props.productManagementSetValue(otherPhotos, 'productOtherPhotos')
			return props?.isModal ? props?.handleClose() : props.navigation.goBack()
		}

		const filteredOtherPhotos = otherPhotos.filter((o) => o !== null && o !== undefined)
		let finalMainPhoto
		let finalOtherPhotos

		if (mainPhoto) {
			finalMainPhoto = mainPhoto
			finalOtherPhotos = filteredOtherPhotos.map((p) => ({ url: p }))
		} else {
			finalMainPhoto = filteredOtherPhotos.splice(0, 1).pop()
			finalOtherPhotos = filteredOtherPhotos.map((p) => ({ url: p }))
		}

		if(!props?.isModal) props.productManagementSetValue('', 'productPhoto')

		setTimeout(() => {
			if (props?.isModal) { 
				props?.handleClose()
			} else {
				props.productManagementSetValue(finalMainPhoto, 'productPhoto')
				props.productManagementSetValue(finalOtherPhotos, 'productOtherPhotos')
				props.navigation.goBack()
			}
		}, 100)
	}

	const handleOtherPhotoPress = (index) => {
		const { billing } = props

		if (isFree(billing)) {
			return props.openModalWebview(multiPhotos.infoURL)
		}

		if (!mainPhoto) return Alert.alert(I18n.t('words.s.attention'), Strings.NO_ITEM_ALERT_MSG)
		setPhotoType(OTHER_PHOTO)
		setIsSettingPhoto(true)
		setCurrentIndex(index)
	}
	const removeOtherPhoto = (index) => {
		setOtherPhotos(otherPhotos.filter((o, i) => i !== index))
		setHasEdition(true)
	}

	// Sub-components render methods
	const renderMainPhoto = () => {
		if (!mainPhoto) {
			return (
				<GridPlaceholder
					item={{ first: true }}
					useKyteIcon
					iconContainerStyle={{ backgroundColor: colors.borderlight, height: '100%' }}
					addIconSize={25}
					addIconColor={colors.primaryColor}
					addIconName="plus-thin"
					onPress={() => {
						setPhotoType(MAIN_PHOTO)
						setIsSettingPhoto(true)
					}}
					hasNoProduct
					style={styles.customGridStyle}
				/>
			)
		}

		return (
			<TouchableOpacity
				onPress={() => {
					setPhotoZoomIndex(0)
					setIsPhotoZoom(true)
				}}
				style={styles.photoContainer}
				activeOpacity={0.8}
			>
				<ProductImage
					product={{ ...props.product, image: mainPhoto }}
					style={[gridStyles.flexImage, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }]}
					iconName="plus-thin"
					iconColor={colors.primaryColor}
					iconSize={20}
					iconContainerStyle={{ backgroundColor: colors.borderlight }}
					useLargeImage
				/>
			</TouchableOpacity>
		)
	}
	const renderGridPlaceholder = (index) => {
		const { billing } = props
		const proLabelItself = () => {
			if (!isFree(billing)) return
			return renderProLabel(Strings.PRO_LABEL)
		}

		return (
			<View key={index} style={[styles.eachPhotoContainer, { borderColor: colors.borderlight }]}>
				{proLabelItself()}
				<GridPlaceholder
					item={{ first: !!mainPhoto && indexFirst === index }}
					useKyteIcon
					iconContainerStyle={{ backgroundColor: colors.borderlight, margin: 0, height: '100%' }}
					style={{ width: '100%' }}
					addIconSize={25}
					addIconColor={colors.primaryColor}
					addIconName="plus-thin"
					onPress={() => handleOtherPhotoPress(index)}
					hasNoProduct
				/>
			</View>
		)
	}
	const renderOtherPhoto = (index) => (
		<View key={random(0, 99999)} style={styles.eachPhotoContainer}>
			<TouchableOpacity
				onPress={() => removeOtherPhoto(index)}
				style={[msg.messageClose, styles.removeButton]}
				activeOpacity={0.8}
			>
				<Icon name="close" color={colors.primaryColor} size={14} />
			</TouchableOpacity>

			<TouchableOpacity
				onPress={() => {
					setPhotoZoomIndex(index + 1)
					setIsPhotoZoom(true)
				}}
				activeOpacity={0.8}
			>
				<ProductImage
					product={{ ...props.product, image: otherPhotos[index] }}
					style={[gridStyles.flexImage, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }]}
					iconName="plus-thin"
					iconColor={colors.primaryColor}
					iconSize={20}
					iconContainerStyle={{ backgroundColor: colors.borderlight }}
					useLargeImage
				/>
			</TouchableOpacity>
		</View>
	)
	const renderGallery = () => {
		const gallery = []
		for (let i = 0; i < 6; i++) {
			if (otherPhotos[i] === null || otherPhotos[i] === undefined) {
				gallery.push(renderGridPlaceholder(i))
			} else gallery.push(renderOtherPhoto(i))
		}
		return gallery
	}
	const renderMainPhotoRemoveButton = () => (
		<TouchableOpacity
			onPress={() => {
				events?.removeMainPhotoEvent()
				setMainPhoto(null)
				setHasEdition(true)
			}}
			style={[msg.messageClose, styles.removeButton]}
			activeOpacity={0.8}
		>
			<Icon name="close" color={colors.primaryColor} size={14} />
		</TouchableOpacity>
	)
	const renderModalPhoto = () => {
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
				bottomPage
				height="auto"
				title={I18n.t('productAddNewImage')}
				isModalVisible
				hideModal={() => setIsSettingPhoto(false)}
			>
				<ListOptions items={options} />
			</KyteModal>
		)
	}
	const renderPhotoZoom = () => {
		const gallery = []
		if (mainPhoto) gallery.push(mainPhoto)
		if (otherPhotos) otherPhotos.forEach((o) => gallery.push(o))

		return (
			<KyteImageGallery
				product={props.product}
				gallery={gallery}
				initialIndex={photoZoomIndex}
				hideOnBack
				hideModal={() => setIsPhotoZoom(false)}
				onBackButtonPress={() => setIsPhotoZoom(false)}
				isModal
			/>
		)
	}
	const renderProLabel = (label) => (
		<KyteProLabel style={{ position: 'absolute', zIndex: 1, right: 5, top: 5 }} plan={label} />
	)

	return (
		<DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => handleBackButton()}>
			<View style={!mainPhoto ? styles.addMainPhotoContainer : styles.mainPhotoContainer}>
				{mainPhoto ? renderMainPhotoRemoveButton() : null}
				<Container flex={1} maxHeight={382} style={mainPhoto ? styles.contentPhotoContainer : null}>
					{renderMainPhoto()}
				</Container>
			</View>
			{!props?.hideGallery && <View style={styles.otherPhotosContainer}>{renderGallery()}</View>}
			<View style={scaffolding.bottomContainer}>
				<ActionButton onPress={() => (props?.handleExternalSave ? props?.handleExternalSave(mainPhoto) : handleSave())}>
					{Strings.SAVE_BUTTON_TEXT}
				</ActionButton>
			</View>

			{isSettingPhoto ? renderModalPhoto() : null}
			{isPhotoZoom ? renderPhotoZoom() : null}
		</DetailPage>
	)
}

const styles = {
	contentPhotoContainer: {
		borderWidth: 1,
		borderRadius: 5,
		borderColor: colors.littleDarkGray,
	},
	mainPhotoContainer: {
		flex: 1,
		marginHorizontal: 10,
		marginVertical: 10,
	},
	addMainPhotoContainer: {
		flex: 1,
		marginHorizontal: 5,
		marginVertical: 10,
		paddingBottom: 15,
	},
	photoContainer: {
		flex: 1,
	},
	otherPhotosContainer: {
		paddingHorizontal: 9,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	removeButton: {
		backgroundColor: colors.littleDarkGray,
		width: 20,
		height: 20,
		right: 4,
		top: 4,
	},
	eachPhotoContainer: {
		width: '32%',
		height: 120,
		borderWidth: 1,
		borderColor: colors.littleDarkGray,
		borderRadius: 4,
		margin: 0,
		marginVertical: 4,
	},
	proLabelContainer: {
		backgroundColor: colors.primaryDarker,
		position: 'absolute',
		zIndex: 100,
		padding: 4,
		borderWidth: 1,
		borderColor: colors.primaryDarker,
		borderRadius: 3,
		margin: 4,
	},
	customGridStyle: {
		width: '100%',
		height: '100%',
		flex: 1,
		paddingHorizontal: 5,
	},
}

const ProductPhotoSelectorComponent = connect(
	(state) => ({
		product: state.products.detail,
		selectedVariationForPhotoEdit: state.products.selectedVariationForPhotoEdit,
		productManaging: state.products.productManaging,
		billing: state.billing,
	}),
	{
		productManagementSetValue,
		checkPlanKeys,
		checkFeatureIsAllowed,
		openModalWebview,
	}
)(ProductPhotoSelector)

export default React.memo(ProductPhotoSelectorComponent)
