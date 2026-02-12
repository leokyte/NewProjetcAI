import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { View, Platform, ScrollView } from 'react-native'
// eslint-disable-next-line import/no-cycle
import { useRoute } from '@react-navigation/native'
import {
	DetailPage,
	Input,
	ActionButton,
	KyteText,
	KyteIcon,
	LoadingCleanScreen,
	CustomKeyboardAvoidingView,
	Tip,
	WizardProgressBar,
} from '../../common'
import I18n from '../../../i18n/i18n'
import { colors } from '../../../styles'
import { kyteCatalogDomain, urlFriendlyClearStr, removerAcentos, formatCatalogUrl } from '../../../util'
import { storeAccountSave, hasCatalog } from '../../../stores/actions'
import { CATALOG_WIZARD_TOTAL_STEPS } from '../../../kyte-constants'
import { logEvent } from '../../../integrations'

const commonStyles = {
	flex: 1,
	justifyContent: 'center',
}

const styles = {
	image: {
		top: 10,
		...commonStyles,
	},
	tipContainer: {
		alignItems: 'center',
		top: 32,
		...commonStyles,
	},
	inputContainer: {
		top: 20,
		padding: 20,
		...commonStyles,
	},
	warningIcon: {
		position: 'absolute',
		left: 16,
	},
	additionalTipContainer: {
		backgroundColor: colors.lightBg,
		margin: 20,
		top: 18,
		padding: 16,
		...commonStyles,
	},
	auxURLProtocol: {
		position: 'absolute',
		top: 28,
		left: 5
	}
}

const CatalogUrlFriendly = ({
	authStore,
	isLoading,
	storeAccountSave: storeAccountSaveAction,
	hasCatalog: hasCatalogAction,
	navigation,
}) => {
	const [name, setName] = useState(authStore.name || '')
	const [urlFriendly, setUrlFriendly] = useState(authStore.urlFriendly || '')
	const [urlFriendlyError, setUrlFriendlyError] = useState(false)
	const hasCatalogFlag = hasCatalogAction()
	const route = useRoute();
	const { isDrawerNavigation } = route.params;
	const canGoBack = navigation.canGoBack() && isDrawerNavigation

	const validateFields = () => urlFriendly.length && name.trim().length

	useEffect(() => {
		logEvent('New Catalog View', { where: hasCatalogFlag ? 'catalog_settings' : 'catalog_wizard' })
	}, [])

	const handleNameChange = (newName) => {
		if (!hasCatalogFlag) {
			const rawUrlFriendly = removerAcentos(newName.trim().replace(/ /g, '-'))
			const processedUrlFriendly = urlFriendlyClearStr(rawUrlFriendly)
			setUrlFriendly(processedUrlFriendly)
		}

		setName(newName)
	}

	const saveForm = () => {
		const store = {
			...authStore,
			name: name.trim(),
			urlFriendly: urlFriendly.trim(),
		}

		storeAccountSaveAction(store, (e) => {
			if (e) {
				logEvent('Catalog URL Taken Error', { url: store?.urlFriendly })
				return setUrlFriendlyError(I18n.t('UrlFriendlyAlredyUsed'))
			}

			if (hasCatalogFlag) {
				return navigation.goBack()
			}
			logEvent('Store Name Add', { where: 'catalog_wizard' })
			return navigation.navigate('CatalogStoreLogo', {})
		})
	}

	const renderSaveButton = () => {
		const s = {
			container: { paddingVertical: 15 },
		}

		return (
			<CustomKeyboardAvoidingView>
				<View style={s.container}>
					<ActionButton onPress={() => saveForm()} disabled={!validateFields()} noDisabledAlert>
						{hasCatalogFlag ? I18n.t('descriptionSaveButton') : I18n.t('words.s.proceed')}
					</ActionButton>
				</View>
			</CustomKeyboardAvoidingView>
		)
	}

	const renderStoreNameField = () => (
		<Input
			placeholder={I18n.t('storeAccountNamePlaceholder')}
			placeholderColor={colors.primaryGrey}
			value={name}
			onChangeText={handleNameChange}
			maxLength={43}
		/>
	)

	const renderUrlFriendlyField = () => {
		const iconOn = hasCatalogFlag && urlFriendly === authStore.urlFriendly
		const auxTextStyle = { position: 'absolute', top: 28, right: iconOn ? 30 : 5 }
		const renderKyteCatalogDomain = () => (
			<>
				<KyteText style={styles.auxURLProtocol} pallete="grayBlue" size={14}>
					https://
				</KyteText>
				<KyteText style={auxTextStyle} pallete="grayBlue" size={14}>
					{kyteCatalogDomain}
				</KyteText>
			</>
		)

		const iconStyle = { position: 'absolute', top: 26, right: 2 }
		const renderIcon = () => <KyteIcon name="check" size={16} color={colors.actionColor} style={iconStyle} />
		const handleChangeInput = (text) => {
			const formattedCatalogUrl = formatCatalogUrl(text)
			setUrlFriendly(formattedCatalogUrl)
		}

		return (
			<View>
				{iconOn ? renderIcon() : null}
				<Input
					placeholderColor={colors.primaryGrey}
					value={urlFriendly}
					placeholder={I18n.t('storeUrlFriendlyPlaceholder')}
					onChangeText={handleChangeInput}
					maxLength={43}
					error={urlFriendlyError}
					style={{ paddingLeft: 55, paddingRight: iconOn ? 95 : 70 }}					
					autoCapitalize="none"
					keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
				/>
				{renderKyteCatalogDomain()}
			</View>
		)
	}

	const renderImage = () => (
		<View style={styles.image}>
			<Tip image="CatalogMobileDesktop" type={1} />
		</View>
	)

	const renderTip = () => (
		<View style={styles.tipContainer}>
			<KyteText size={19} weight={500} lineHeight={26}>
				{I18n.t('catalog.urlFriendly.tips.text1.part1')}
			</KyteText>
			<KyteText size={19} weight={400} lineHeight={26}>
				{I18n.t('catalog.urlFriendly.tips.text1.part2')}
			</KyteText>
		</View>
	)

	const renderAdditionalTip = () => (
		<View style={styles.additionalTipContainer}>
			<KyteIcon name="warning" size={16} style={styles.warningIcon} />
			<KyteText weight={500} lineHeight={19} size={13} textAlign="left" style={{ left: 28, paddingRight: 20 }}>
				{I18n.t('catalog.urlFriendly.tips.text2.part1')}{' '}
				<KyteText weight={400} lineHeight={19} size={13} textAlign="left" style={{ left: 28 }}>
					{I18n.t('catalog.urlFriendly.tips.text2.part2')}
				</KyteText>
			</KyteText>
		</View>
	)

	return (
		<DetailPage
			style={{ flex: 1 }}
			pageTitle={!hasCatalogFlag ? I18n.t('catalogBarOnlineCatalog') : I18n.t('sideMenu.onlineCatalog')}
			goBack={() => navigation.goBack()}
			outerPage={!hasCatalogFlag && canGoBack}
			navigation={navigation}
		>
			<ScrollView>
				<CustomKeyboardAvoidingView style={{ flex: 1 }} behavior="position" keyboardVerticalOffset={80}
				>
					{!hasCatalogFlag ? (
						<>
							<WizardProgressBar currentStep={1} totalSteps={CATALOG_WIZARD_TOTAL_STEPS} />
							{renderImage()}
							{renderTip()}
						</>
					) : null}
					<View style={styles.inputContainer}>
						{renderStoreNameField()}
						{renderUrlFriendlyField()}
					</View>
					{renderAdditionalTip()}
				</CustomKeyboardAvoidingView>
			</ScrollView>
			{isLoading ? <LoadingCleanScreen /> : null}
			{renderSaveButton()}
		</DetailPage>
	)
}

const mapStateToProps = ({ auth, common }) => ({
	authStore: auth.store,
	isLoading: common.loader.visible,
})

export default connect(mapStateToProps, { storeAccountSave, hasCatalog })(CatalogUrlFriendly)
