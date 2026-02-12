import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Dimensions, View, Platform, ScrollView } from 'react-native'
import { SceneMap, TabView } from 'react-native-tab-view'
import { Container, Padding, KyteText, isFree } from '@kyteapp/kyte-ui-components'
import { change } from 'redux-form'
import {
	DetailPage,
	LoadingCleanScreen,
	CustomKeyboardAvoidingView,
	WizardProgressBar,
	KyteTabBar,
} from '../../common'
import { hasCatalog, setCatalogColor, setEnabledDrawerSwipe, storeAccountSave } from '../../../stores/actions'
import { colors, colorsPierChart, tabStyle } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'
import MockColor from './layouts/MockColor'
import { isBetaCatalog, NEW_CATALOG_VERSION, renderBoldText } from '../../../util'
import { getForegroundOrNumberColor, getInitialColor, isColorDefault, isHexString } from '../../../util/util-color'
import ActivateCatalogBetaModal from '../../common/modals/ActivateCatalogBetaModal'
import { CustomColorModal } from '../../../../assets/images/catalog/custom-color-modal'
import CatalogColorPicker from '../../common/CatalogColorPicker'
import SaveColorButton from './layouts/SaveColorButton'
import DefaultColorsLayout from './layouts/DefaultColorsLayout'
import { CATALOG_WIZARD_TOTAL_STEPS } from '../../../kyte-constants'

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const COLORS_CONTAINER_HEIGHT = 178;
const TAB_VIEW_MIN_HEIGHT = COLORS_CONTAINER_HEIGHT + 60;
const initialLayout = { width: Dimensions.get('window').width };

const Strings = {
	DEFAULT_COLORS: I18n.t('CustomColor.defaultColors'),
	CUSTOM_COLORS: I18n.t('CustomColor.customColors'),
	CATALOG_COLOR_TEMPLATE_LABEL: I18n.t('CatalogColorTemplateLabel'),
	CUSTOMIZATION: I18n.t('words.p.customization'),
	MODAL_SUBTITLE: 'CustomColor.modal.subtitle',
	WIZARD_SUBTITLE: I18n.t('letsChooseYourCatalogColor'),
}

const CatalogColorTemplate = (props) => {
	const { storeAccount, storeAccountSave, change, setCatalogColor, billing } = props
	const { catalog } = storeAccount
	const [isLoading, setIsLoading] = useState(false)
	const [showActiveBetaModal, setShowActiveBetaModal] = useState(false)
	const isBetaActive = isBetaCatalog(catalog?.version)
	const initialColor = getInitialColor(catalog, isBetaActive, isFree(billing))
	const isInitialColorDefault = isColorDefault(initialColor)
	const [tabIndex, setTabIndex] = useState(isInitialColorDefault ? 0 : 1)
	const itHasCatalog = props.hasCatalog()
	const { navigation } = props
	const where = { where: itHasCatalog ? "settings" : "wizard" }
	
	const tabValues = {
		index: tabIndex,
		routes: [
			{ key: '0', title: Strings.DEFAULT_COLORS.toUpperCase() },
			{ key: '1', title: Strings.CUSTOM_COLORS.toUpperCase(), acessible: itHasCatalog },
		],
	}

	const scenes = {
		'0': () => renderDefaultColors(),
		'1': () => renderCustomColors(),
	};

	const goBackPage = () => {
		navigation.goBack()
		props.setEnabledDrawerSwipe(true)
	}

	const renderWizardLayout = () => (
		<Container backgroundColor={colorsPierChart[9]} >
			<WizardProgressBar currentStep={3} totalSteps={CATALOG_WIZARD_TOTAL_STEPS} />
			<KyteText marginTop={16} textAlign='center' size={16}>{renderBoldText(Strings.WIZARD_SUBTITLE, { size: 16 })}</KyteText>
		</Container>
	)

	const handleConfirmModal = () => {
		setIsLoading(true)
		setShowActiveBetaModal(false)

		const store = {
			...storeAccount, 
			catalog: { ...catalog, version: NEW_CATALOG_VERSION }
		}

		change('catalog', catalog)
		storeAccountSave(store, () => {
				setIsLoading(false)
				setTabIndex(1)
				setCatalogColor(isHexString(catalog?.themeColor) ? catalog?.themeColor : getForegroundOrNumberColor(store.catalog, true))
				logEvent('Catalog Version Change', { where: "app_color", catalog_version: NEW_CATALOG_VERSION })
			}
		)
	}

	const renderDefaultColors = () => (
		<View style={styles.colorsContainer}>
			<View style={styles.defaultColorsContainer}>
				<DefaultColorsLayout setTabIndex={setTabIndex} handleShowActiveBetaModal={handleShowActiveBetaModal} />
			</View>
		</View>
	)

	const renderCustomColors = () => (
		<View style={styles.colorsContainer}>
			<CatalogColorPicker 
			where={where}
			initialColor={initialColor}
			catalog={catalog}
			/>
		</View>
	);
  
	const renderScenes = SceneMap(scenes)

	const renderLabel = ({ route, labelText, focused, color }) => {
		const { actionColor, primaryColor } = colors
		const finalColor = color || (focused ? actionColor : primaryColor)
		const title = route?.title || labelText
		return (
			<View style={tabStyle.labelContainer}>
				<KyteText
					style={[
						tabStyle.customLabel(finalColor, SMALL_SCREENS ? 11 : 13)
					]}
				>
					{title}
				</KyteText>
			</View>
		);
	}

	const renderTabBar = (props) => (
		<KyteTabBar
			tabStyle={tabStyle.tab}
			style={tabStyle.base}
			indicatorStyle={tabStyle.indicator}
			renderLabel={renderLabel}
			{...props}
		/>
	)
	
	const handleChangeTabIndex = (index) => {
		logEvent(`Catalog ${index === 0 ? "Preset" : "Custom"} Color Click`, where)
		if(isBetaActive || !itHasCatalog){
			return setTabIndex(index)
		}
		return handleShowActiveBetaModal()
	}

	const renderContent = () => (
		<Container backgroundColor="#FFF" flex={1} style={styles.tabViewWrapper}>
			<TabView
				initialLayout={initialLayout}
				navigationState={tabValues}
				renderScene={renderScenes}
				renderTabBar={(props) => renderTabBar(props)}
				onIndexChange={(index) => handleChangeTabIndex(index)}
				swipeEnabled={false}
				lazy
				style={styles.tabView}
			/>
		</Container>
	)

	const handleShowActiveBetaModal = () => {
		setShowActiveBetaModal(!showActiveBetaModal)
		logEvent('Catalog Version Exclusive Feature', { where: "app_color" })
	}

	useEffect(() => {
		props.setCatalogColor(initialColor)
		logEvent("Catalog Color View", { ...where, color_type: isColorDefault(initialColor) ? "preset" : "custom" })
	}, [])

	return (
		<DetailPage
			pageTitle={itHasCatalog ? Strings.CATALOG_COLOR_TEMPLATE_LABEL : Strings.CUSTOMIZATION}
			goBack={goBackPage}
		>

			<ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: colorsPierChart[9] }}>
				{!itHasCatalog && renderWizardLayout()}
				<Container flex={1}>
					<Padding top={16} bottom={16}>
						<MockColor where={where} />
					</Padding>
				</Container>
				<CustomKeyboardAvoidingView
					style={styles.tabViewWrapper}
					keyboardVerticalOffset={110}
					behavior={Platform.OS === 'ios' ? "position" : null}
				>
					{ renderContent() }
				</CustomKeyboardAvoidingView>
			</ScrollView>
			
			<SaveColorButton setIsLoading={setIsLoading} navigation={navigation} />
			{isLoading ? <LoadingCleanScreen /> : null}
			<ActivateCatalogBetaModal 
				isVisible={showActiveBetaModal} 
				hideModal={() => setShowActiveBetaModal(false)} 
				image={CustomColorModal}
				imgStyles={{ width: 145, height: 145 }}
				subtitle={Strings.MODAL_SUBTITLE}
				onPress={handleConfirmModal}
			/>
		</DetailPage>
	)
}

const styles = {
	colorsContainer: {
		height: COLORS_CONTAINER_HEIGHT,
		justifyContent: 'center',
		alignSelf: 'center',
		width: '100%',
	},
	defaultColorsContainer: {
		flex: 1,
		justifyContent: 'center',
	},
	colorsMap: {
		width: '100%', 
		flexDirection: 'row', 
		flexWrap: 'wrap', 
		justifyContent: 'center',
	},
	tabViewWrapper: {
		flex: 1,
		minHeight: TAB_VIEW_MIN_HEIGHT,
	},
	tabView: {
		flex: 1,
	},
};

export default connect(
	(state) => ({
		storeAccount: state.auth.store,
		products: state.products.list,
		billing: state.billing,
	}),
	{ change, hasCatalog, setEnabledDrawerSwipe, setCatalogColor, storeAccountSave }
)(CatalogColorTemplate)
