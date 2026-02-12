import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { change, reduxForm } from 'redux-form'
import { View, Text } from 'react-native'
import { Margin } from '@kyteapp/kyte-ui-components'
import { DetailPage, ActionButton, LoadingCleanScreen, RadioOption, KyteTagNew } from '../../common'
import InstagramLayout from './layouts/InstagramLayout'
import ListLayout from './layouts/ListLayout'
import GridLayout from './layouts/GridLayout'
import { storeAccountSave } from '../../../stores/actions'
import I18n from '../../../i18n/i18n'
import { colors } from '../../../styles'
import { logEvent } from '../../../integrations'
import { isBetaCatalog, NEW_CATALOG_VERSION } from '../../../util'
import { getForegroundOrNumberColor } from '../../../util/util-color'
import ActivateCatalogBetaModal from '../../common/modals/ActivateCatalogBetaModal'

const Strings = {
	PAGE_TITLE: I18n.t('catalogSelectLayout'),
	TITLE_INSTA: I18n.t('instaViewMode'),
	INFO_INSTA: I18n.t('InstaviewInfo'),
	TITLE_LIST: I18n.t('listViewMode'),
	INFO_LIST: I18n.t('ListviewInfo'),
	TITLE_GRID: I18n.t('gridViewMode'),
	INFO_GRID: I18n.t('GridViewInfo'),
}

const CONTAINER_WIDTH = 400
const CONTAINER_PADDING_HORIZONTAL = (CONTAINER_WIDTH * 0.33) / 2
const CONTAINER_SIZE = CONTAINER_WIDTH - CONTAINER_PADDING_HORIZONTAL * 2
const CARD_SIZE = CONTAINER_SIZE - 10 + 20
const LIST_MODE = 'list'
const INSTA_MODE = 'instaview'
const GRID_MODE = 'list-lg'

const CL = (props) => {
	const { route, products, storeAccount, change, storeAccountSave, navigation } = props
	const { catalog } = storeAccount
	const { active: hasCatalog, theme: catalogTheme } = catalog

	const isBetaActive = isBetaCatalog(catalog?.version)
	const isIndexOrigin = route.key.indexOf('FromIndex') >= 0
	const defaultTheme = 'list'
	const themeIfBetaInactive = !isBetaActive && catalogTheme === GRID_MODE ? defaultTheme : catalogTheme
	const [theme, setTheme] = useState(hasCatalog ? themeIfBetaInactive : defaultTheme)
	const [isLoading, setIsLoading] = useState(false)
	const [showCatalogBetaActiveModal, setShowCatalogBetaActiveModal] = useState(false)

	useEffect(() => {
		logEvent('Catalog Display Mode View', { display_mode: theme === GRID_MODE ? 'grid' : theme })
	}, [])

	const saveTheme = (isToSaveNewVersion, theme) => {
		setIsLoading(true)

		const valuesToSave = isToSaveNewVersion ? { version: NEW_CATALOG_VERSION, theme } : { theme }

		const catalog = { ...storeAccount.catalog, ...valuesToSave }
		change('catalog', catalog)

		const store = { ...storeAccount, catalog }

		storeAccountSave(store, () => {
			setIsLoading(false)

			logEvent('Catalog Display Mode Update', { display_mode: theme === GRID_MODE ? 'grid' : theme })

			if (!isToSaveNewVersion) {
				if (isIndexOrigin) navigation.goBack()
				else navigation.navigate({ name: 'CatalogOnlineOrders', key: 'CatalogOnlineOrdersPage' })
			}
		})
	}

	const modes = [
		{ label: Strings.TITLE_LIST, name: LIST_MODE, subtitle: Strings.INFO_LIST, onPress: () => setTheme(LIST_MODE) },
		{
			label: Strings.TITLE_GRID,
			name: GRID_MODE,
			subtitle: Strings.INFO_GRID,
			tagNew: true,
			onPress: () => handlePressGrid(),
		},
		{ label: Strings.TITLE_INSTA, name: INSTA_MODE, subtitle: Strings.INFO_INSTA, onPress: () => setTheme(INSTA_MODE) },
	]

	const handleShowCatalogBetaActiveModal = () => {
		setShowCatalogBetaActiveModal(true)
		logEvent('Catalog Version Exclusive Feature', { where: 'app_view_modes' })
	}

	const handlePressGrid = () => {
		if (isBetaActive) {
			return setTheme(GRID_MODE)
		}
		return handleShowCatalogBetaActiveModal()
	}

	const renderItemLabel = ({ label, subtitle, active, tagNew }) => {
		const getTextStyle = () => [
			{ fontSize: 16, marginRight: 10 },
			{ color: colors.darkGrey },
			{ fontWeight: active ? '600' : '400' },
		]

		return (
			<View style={styles.radioTextArea}>
				<View style={styles.radioLabelContent}>
					<Text style={getTextStyle()}>{label}</Text>
					{tagNew && !isBetaActive && <KyteTagNew isFromNewCatalog />}
				</View>
				<Margin top={12} />
				<Text
					style={{
						color: colors.darkGrey,
						fontSize: 13,
					}}
				>
					{subtitle}
				</Text>
			</View>
		)
	}

	const renderItems = ({ name, subtitle, label, tagNew, onPress }) => (
		<RadioOption
			onPress={onPress}
			selected={theme === name}
			key={name}
			item={{
				extraContent: () => renderItemLabel({ label, subtitle, active: theme === name, tagNew }),
			}}
			revert
		/>
	)

	const renderCard = (themeProp, isFromModal) => {
		const themeToUse = themeProp || theme

		const colorToUse = getForegroundOrNumberColor(catalog, isBetaActive)
		const colorSelected = hasCatalog ? colorToUse : 0

		const themes = {
			[LIST_MODE]: ListLayout,
			[INSTA_MODE]: InstagramLayout,
			[GRID_MODE]: GridLayout,
		}

		const Layout = themes[themeToUse]

		const product = products?.find((product) => product.image) || { image: '' }

		return (
			<View style={styles.cardContainer}>
				<View style={styles.circleIndependent(isFromModal)} />
				<View style={styles.circleOverflow(isFromModal)}>
					<View style={styles.imageContainer(isFromModal)}>
						<Layout product={product} colorSelected={colorSelected} />
					</View>
				</View>
			</View>
		)
	}

	const renderSaveButton = () => {
		const style = {
			container: { paddingVertical: 15 },
		}

		return (
			<View style={style.container}>
				<ActionButton
					noDisabledAlert
					onPress={() => saveTheme(false, theme)}
					nextArrow={!isIndexOrigin}
					disabled={theme === catalog.theme}
				>
					{isIndexOrigin ? I18n.t('descriptionSaveButton') : I18n.t('words.s.proceed')}
				</ActionButton>
			</View>
		)
	}

	const handleConfirmModal = () => {
		setTheme(GRID_MODE)
		saveTheme(true, catalog.theme)
		logEvent('Catalog Version Change', { where: 'app_view_modes', catalog_version: NEW_CATALOG_VERSION })
		setShowCatalogBetaActiveModal(false)
	}

	return (
		<DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()}>
			<View style={styles.mainContainer}>
				{renderCard()}
				<Margin top={20} />
				<View>{modes.map(renderItems)}</View>
			</View>
			{renderSaveButton()}
			{isLoading ? <LoadingCleanScreen /> : null}

			<ActivateCatalogBetaModal
				isVisible={showCatalogBetaActiveModal}
				hideModal={() => setShowCatalogBetaActiveModal(false)}
				image={renderCard(GRID_MODE, true)}
				imgStyles={{ width: 145, height: 145 }}
				subtitle="DisplayMode.subtitleModal"
				onPress={handleConfirmModal}
			/>
		</DetailPage>
	)
}

const BORDER_WIDTH = 6

const styles = {
	mainContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 20,
		borderColor: colors.lightBg,
		borderWidth: 1,
	},
	cardContainer: {
		backgroundColor: colors.lightBg,
		borderRadius: 150,
	},
	circleIndependent: (isFromModal) => ({
		overflow: 'hidden',
		width: isFromModal ? 250 : CARD_SIZE,
		height: isFromModal ? 250 : CARD_SIZE,
		borderRadius: 150,
		backgroundColor: colors.disabledIcon,
		top: BORDER_WIDTH / 2,
		left: BORDER_WIDTH / 2,
	}),
	circleOverflow: (isFromModal) => ({
		position: 'absolute',
		overflow: 'hidden',
		width: isFromModal ? 250 : CARD_SIZE,
		height: isFromModal ? 250 : CARD_SIZE,
		borderBottomLeftRadius: 150,
		borderBottomRightRadius: 150,
		backgroundColor: 'transparent',
		top: BORDER_WIDTH / 2,
		left: BORDER_WIDTH / 2,
	}),
	imageContainer: (isFromModal) => ({
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		width: isFromModal ? 250 : CARD_SIZE,
		height: CARD_SIZE,
		top: 10,
	}),
	radioLabelContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	radioTextArea: {
		width: '90%',
		paddingVertical: 10,
	},
}

const CatalogLayout = reduxForm({
	form: 'ConfigStoreForm',
	destroyOnUnmount: false,
})(CL)

export default connect(
	(state) => ({
		storeAccount: state.auth.store,
		products: state.products.list,
	}),
	{ storeAccountSave, change }
)(CatalogLayout)
