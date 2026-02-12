import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import {
	Container,
	KyteText,
	SelectMenu,
	generatePreviewUrl,
	generateCatalogVersionImageURL,
	useViewport,
	Viewports,
} from '@kyteapp/kyte-ui-components'
import { Dimensions, Linking, Platform, ScrollView, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import FastImage from 'react-native-fast-image'
import I18n, { getLocale } from '../../../i18n/i18n'
import { ActionButton, DetailPage, LoadingCleanScreen } from '../../common'
import { storeAccountSave } from '../../../stores/actions'
import { logEvent, remoteConfigGetValue } from '../../../integrations'
import { colorsPierChart } from '../../../styles'
import { isBetaCatalog } from '../../../util'
import StackCarousel from '../../common/StackCarousel'
import { TABLET_CONTAINER_WIDTH } from '../../../kyte-constants'

const Strings = {
	PAGE_TITLE: I18n.t('catalogMenus.version.label'),
	MENU_NEW_VERSION: I18n.t('catalogVersionDetails.newVersionMenu'),
	MENU_CLASSIC_VERSION: I18n.t('catalogVersionDetails.classicVersionMenu'),
	PREVIEW_LABEL: I18n.t('catalogVersionDetails.previewLabel'),
	BUTTON_LABEL: I18n.t('catalogVersionDetails.buttonLabel'),
}

const CatalogVersion = ({ ...props }) => {
	const { store: authStore } = props.auth
	const isAndroid = Platform.OS === 'android'
	const screenWidth = Dimensions.get('window').width
	const locale = getLocale()
	const { navigation } = props
	const { catalog } = authStore
	const [versionSelected, setVersionSelected] = useState(catalog?.version)
	const [activeSlide, setActiveSlide] = useState(0)
	const [loading, setLoading] = useState(false)
	const [classicImages, setClassicImages] = useState([''])
	const [newImages, setNewImages] = useState([''])
	const [imagesLoading, setImagesLoading] = useState(!!isAndroid)
	const previewUrl = generatePreviewUrl(versionSelected, authStore.urlFriendly)
	const imageMargin = 46
	const calculatedImageSize = screenWidth - imageMargin - 32 // 32 is the padding of the Container and 46 is the image margin
	const imageSize = Math.min(calculatedImageSize, 350)
	const viewport = useViewport()
	const isMobile = viewport === Viewports.Mobile

	const selectVersion = (version) => {
		logEvent('Catalog Version Click', { catalog_version: version })
		setVersionSelected(version)
		if (isAndroid) {
			isBetaCatalog(version) ? setActiveSlide(newImages.length - 1) : setActiveSlide(classicImages.length - 1)
		} else {
			setActiveSlide(0)
		}
	}

	const menuItems = [
		{
			text: Strings.MENU_NEW_VERSION,
			onPress: () => selectVersion(3),
			active: isBetaCatalog(versionSelected),
			showIcon: isBetaCatalog(catalog?.version),
		},
		{
			text: Strings.MENU_CLASSIC_VERSION,
			onPress: () => selectVersion(2),
			active: !isBetaCatalog(versionSelected),
			showIcon: !isBetaCatalog(catalog?.version),
		},
	]

	const handleCatalogVersion = () => {
		setLoading(true)
		const isBeta = isBetaCatalog(versionSelected)
		const isGridTheme = catalog.theme === 'list-lg'
		const whatsResumeAllow = catalog?.onlineOrdersAllowed && !!authStore?.whatsapp

		props.storeAccountSave(
			{
				...authStore,
				catalog: {
					...catalog,
					version: versionSelected,
					whatsappOrder: isBeta ? whatsResumeAllow : false,
					theme: !isBeta && isGridTheme ? 'list' : catalog.theme,
				},
			},
			() => {
				setLoading(false)
				logEvent('Catalog Version Change', { where: null, catalog_version: versionSelected, index: activeSlide + 1 })
				if (!isBeta && catalog.whatsappOrder) logEvent('Catalog Whatsapp Summary Disable', { where: 'beta_opt_out' })
				navigation.goBack()
			}
		)
	}

	const renderItem = useCallback(
		({ item }) => (
			<Container
				style={isAndroid && { transform: [{ scaleX: -1 }] }}
				backgroundColor="white"
				height={imageSize}
				borderRadius={8}
				shadowColor="#000"
				shadowOffset={{ width: 0, height: 4 }}
				shadowOpacity={0.1}
				shadowRadius={8}
				alignItems="center"
				justifyContent="center"
			>
				<FastImage
					source={{
						uri: generateCatalogVersionImageURL(isBetaCatalog(versionSelected) ? 'new' : 'classic', item[locale]),
						priority: FastImage.priority.high,
						cache: FastImage.cacheControl.immutable, // Força o cache da imagem
					}}
					style={{ width: imageSize, height: imageSize }}
				/>
			</Container>
		),
		[versionSelected, locale, screenWidth]
	)

	useEffect(() => {
		remoteConfigGetValue(
			'CatalogVersionCarousel',
			(k) => {
				const filteredClassicImages = k?.classic.filter((item) => Object.prototype.hasOwnProperty.call(item, locale))
				const filteredNewImages = k?.new.filter((item) => Object.prototype.hasOwnProperty.call(item, locale))

				setClassicImages(isAndroid ? filteredClassicImages.reverse() : filteredClassicImages)
				setNewImages(isAndroid ? filteredNewImages.reverse() : filteredNewImages)
				if (isAndroid) {
					setActiveSlide(
						isBetaCatalog(versionSelected) ? filteredNewImages.length - 1 : filteredClassicImages.length - 1
					)
				}
				setImagesLoading(false)
			},
			'json'
		)
	}, [])

	return (
		<DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()}>
			<ScrollView
				style={{
					flex: 1,
					backgroundColor: colorsPierChart[9],
				}}
				contentContainerStyle={{
					flexGrow: 1,
				}}
			>
				<Container flex={1} justifyContent="space-between">
					<Container padding={16}>
						<SelectMenu items={menuItems} />
					</Container>
					<Container>
						{/* This loader is required to load the carousel in reverse order on Android platforms */}
						{!imagesLoading && (
							<StackCarousel
								key={isBetaCatalog(versionSelected) ? 'carouselVersion3' : 'carouselVersion2'}
								data={isBetaCatalog(versionSelected) ? newImages : classicImages}
								renderItem={renderItem}
								sliderWidth={isMobile ? screenWidth : TABLET_CONTAINER_WIDTH}
								itemWidth={isMobile ? screenWidth - imageMargin : undefined}
								layoutCardOffset="23"
								slideStyle={{ padding: 16 }}
								onSnapToItem={(index) => {
									logEvent('Catalog Carousel Swipe', {
										index: index + 1,
										catalog_version: versionSelected,
										app_platform: 'mobile',
									})
									setActiveSlide(index)
								}}
								activeDotIndex={activeSlide}
							/>
						)}
					</Container>
					<TouchableOpacity
						style={{
							padding: 16,
							paddingBottom: 24,
						}}
						onPress={() => {
							logEvent('Catalog Version Preview', { catalog_version: versionSelected })
							Linking.openURL(previewUrl)
						}}
					>
						<KyteText size={14} weight={500} textAlign="center" color="#2FC79F">
							{Strings.PREVIEW_LABEL}
						</KyteText>
					</TouchableOpacity>
				</Container>
			</ScrollView>
			<View style={{ paddingVertical: 16 }}>
				<ActionButton onPress={handleCatalogVersion} disabled={versionSelected === catalog?.version} noDisabledAlert>
					{Strings.BUTTON_LABEL}
				</ActionButton>
			</View>
			{loading ? <LoadingCleanScreen /> : null}
		</DetailPage>
	)
}

const mapStateToProps = ({ auth, billing }) => ({
	auth,
	billing,
})

export default connect(mapStateToProps, { storeAccountSave })(CatalogVersion)
