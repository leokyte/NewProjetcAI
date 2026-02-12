import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { View, ScrollView } from 'react-native'
import { KytePro, KyteText, Row, isFree } from '@kyteapp/kyte-ui-components'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { DetailPage, LoadingCleanScreen, KyteTagNew, Tag, KyteIcon } from '../../common'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { generateDefaultPROFeatures, getPROFeature, isBetaCatalog } from '../../../util'
import {
	openModalWebview,
	goBackToCatalogVersion2,
	setEnabledDrawerSwipe,
	setCatalogColor,
} from '../../../stores/actions'
import CatalogBetaActiveModal from '../../common/modals/CatalogBetaActiveModal'
import { logEvent } from '../../../integrations'
import { getInitialColor, isColorCloseToWhite } from '../../../util/util-color'
import { CatalogMenuOptions } from '../../../enums'

const Strings = {
	PAGE_TITLE: I18n.t('CatalogThemePageTitile'),
	THEME_LABEL: I18n.t('CatalogThemeLabel'),
	LAYOUT_LABEL: I18n.t('CatalogColorTemplateLabel'),
	NO_STOCK_LABEL: I18n.t('catalogStockConfigTitle'),
	BANNER_LABEL: I18n.t('catalog.banner.title'),
}

const CatalogTheme = ({ betaCatalogActive, ...props }) => {
	const { navigation, billing } = props
	const [banner, setBanner] = useState(generateDefaultPROFeatures('PROBanner'))
	const [showCatalogBetaActiveModal, setShowCatalogBetaActiveModal] = useState(false)
	const [optionClicked, setOptionClicked] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const colorToUse = getInitialColor(props.catalog, betaCatalogActive, isFree(billing))

	useEffect(() => {
		getPROFeatures()
		props.setEnabledDrawerSwipe(true)
	}, [])

	const getPROFeatures = async () => {
		const bannerFeature = await getPROFeature('PROBanner')
		bannerFeature && setBanner(bannerFeature)
	}

	const renderMenuSelectorExtra = () => {
		const isBordered = isColorCloseToWhite(colorToUse)
		const size = 10
		const style = {
			width: size,
			height: size,
			borderRadius: 50,
			backgroundColor: colorToUse,
			borderWidth: isBordered ? 0.3 : 0,
			borderColor: isBordered ? colors.lightGrey : 'transparent',
		}

		return <View style={style} />
	}

	const navigateTo = (name) => {
		navigation.navigate({
			name,
			key: `${name}FromIndex`,
		})
	}

	const renderItemLabel = ({ isFreeUser, label, renderExtraInfo, onPress, isPaid = false }) => (
		<View style={{ flex: 1 }}>
			<Row alignItems="center">
				<KyteText pallete="primaryDarker" size={styles.labelTextSize} weight="Semibold">
					{label}
				</KyteText>
				{isPaid && isFreeUser && <Tag style={{ marginLeft: 8, borderRadius: 10 }} info="PRO" onPress={onPress} />}
			</Row>

			{renderExtraInfo ? renderExtraInfo() : null}
		</View>
	)

	const renderItems = ({ name, label, PROFeature, testProps }) => {
		const { billing } = props
		const isPaid = PROFeature?.isPaid
		const isFreeUser = isFree(billing)
		const isFreeAndPaid = isFreeUser && isPaid

		const renderOnoff = (isFree) => {
			const tagProActive = PROFeature && isFree

			return (
				<KyteText pallete={!tagProActive ? 'actionColor' : 'grayBlue'} size={styles.labelTextSize - 2} weight="Medium">
					{!tagProActive ? Strings.CATALOG_ON : Strings.CATALOG_OFF}
				</KyteText>
			)
		}

		const renderCatalogOnLabel = () => (
			<KytePro component={(isFree) => renderOnoff(isFree)} billing={billing} feature={PROFeature || {}} />
		)

		return (
			<TouchableOpacity
				testProps={testProps}
				onPress={() => (isFreeAndPaid ? props.openModalWebview(PROFeature?.infoURL) : navigateTo(name))}
				style={{ ...styles.itemContainer, opacity: isFreeAndPaid ? 0.4 : 1 }}
				key={Math.random(100)}
			>
				{renderItemLabel({ isFreeUser, label, isPaid: PROFeature?.isPaid })}
				{renderCatalogOnLabel()}
				<View style={styles.iconsContent}>
					{name === CatalogMenuOptions.CATALOG_COLOR_TEMPLATE && renderMenuSelectorExtra()}
					{!isFreeAndPaid && <KyteIcon name="arrow-cart" size={10} style={{ marginLeft: 20 }} />}
				</View>
			</TouchableOpacity>
		)
	}

	const menuList = [
		{ label: Strings.LAYOUT_LABEL, name: CatalogMenuOptions.CATALOG_COLOR_TEMPLATE, color: colorToUse },
		{ label: Strings.THEME_LABEL, name: CatalogMenuOptions.CATALOG_LAYOUT },
		{ label: Strings.NO_STOCK_LABEL, name: CatalogMenuOptions.CATALOG_ORDER_STOCK },
		{
			label: Strings.BANNER_LABEL,
			name: CatalogMenuOptions.CATALOG_BANNER,
			PROFeature: banner,
			testProps: 'banner-do',
		},
	]

	// This code below could be removed when Orders in Catalog 3.0 is released
	const renderCatalogBetaActiveModal = () => {
		const { goBackToCatalogVersion2: goBackToCatalogVersion2Action, catalog } = props
		const option = optionClicked === CatalogMenuOptions.CATALOG_COLOR_TEMPLATE ? 'color' : 'layout'
		const eventProp = optionClicked === CatalogMenuOptions.CATALOG_COLOR_TEMPLATE ? 'app_color' : 'app_view_modes'

		const hideModal = () => {
			setShowCatalogBetaActiveModal(false)
			logEvent('Catalog 3 Beta Stay', { where: eventProp })
		}

		const handleSecondaryButton = () => {
			setShowCatalogBetaActiveModal(false)
			setIsLoading(true)
			goBackToCatalogVersion2Action((e) => {
				if (e) return setIsLoading(false)
				setIsLoading(false)
				logEvent('Catalog 3 Beta Opt Out', { where: eventProp, catalog_orders_enabled: catalog.onlineOrdersAllowed })
				navigateTo({ name: optionClicked })
			})
		}

		return (
			<CatalogBetaActiveModal
				title={I18n.t(`catalogBetaActiveModal.${option}.title`)}
				infoPart1={I18n.t(`catalogBetaActiveModal.${option}.info.part1`)}
				infoPart2={I18n.t(`catalogBetaActiveModal.${option}.info.part2`)}
				infoPart3={I18n.t(`catalogBetaActiveModal.${option}.info.part3`)}
				mainButtonTitle={I18n.t(`catalogBetaActiveModal.${option}.mainButtonTitle`)}
				secondaryButtonTitle={I18n.t(`catalogBetaActiveModal.${option}.secondaryButtonTitle`)}
				onPress={() => hideModal()}
				secondaryButtonOnPress={() => handleSecondaryButton()}
				hideModal={() => hideModal()}
			/>
		)
	}

	return (
		<DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()}>
			<ScrollView>
				<View style={{ flex: 1 }}>{menuList.map(renderItems)}</View>
			</ScrollView>
			{isLoading ? <LoadingCleanScreen /> : null}
			{showCatalogBetaActiveModal ? renderCatalogBetaActiveModal() : null}
		</DetailPage>
	)
}

const styles = {
	itemContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderlight,
		width: '100%',
		justifyContent: 'space-between',
	},
	labelTextSize: 16,
	iconsContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
}

export default connect(
	({ auth, billing, common }) => ({
		billing,
		betaCatalogActive: isBetaCatalog(auth.store.catalog?.version),
		catalog: auth.store.catalog,
		enabledDrawerSwipe: common.enabledDrawerSwipe,
	}),
	{
		openModalWebview,
		goBackToCatalogVersion2,
		setEnabledDrawerSwipe,
		setCatalogColor,
	}
)(CatalogTheme)
