import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { ScrollView, View, Linking, TouchableOpacity } from 'react-native'
import { DetailPage, ActionButton, KyteText, LoadingCleanScreen, CenterContent, WizardProgressBar } from '../../common'
import { screenDm } from '../../../util'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { publishCatalog, setInitialRouteName } from '../../../stores/actions'
import { CATALOG_WIZARD_TOTAL_STEPS } from '../../../kyte-constants'
import { logEvent } from '../../../integrations'
import { isCatalogApp } from '../../../util/util-flavors'

const liChar = '●'

const strings = {
	PAGE_TITLE: I18n.t('SecurityLabel'),
	TITLE: I18n.t('TermsAndConditionsTitle'),
	TITLE_2: I18n.t('TermsAndConditionsTitle2'),
	TOPIC_1: `${liChar}  ${I18n.t('TermsAndConditionsTopic1')}`,
	TOPIC_2: `${liChar}  ${I18n.t('TermsAndConditionsTopic2')}`,
	TOPIC_2_BREAK: I18n.t('TermsAndConditionsTopic2Break'),
	TOPIC_3: `${liChar}  ${I18n.t('TermsAndConditionsTopic3')}`,
	TOPIC_4: `${liChar}  ${I18n.t('TermsAndConditionsTopic4')}`,
	TOPIC_4_BREAK_1: I18n.t('TermsAndConditionsTopic4Break1'),
	TOPIC_4_BREAK_2: I18n.t('TermsAndConditionsTopic4Break2'),
	AGREEMENT_LABEL: I18n.t('AgreementLabel'),
	TERMS_OF_USE_LINK: I18n.t('termsOfUseLink'),
	PRIVACY_POLICY_LINK: I18n.t('privacyPolicyLink'),
	RESTRICTED_PRODUCTS_LINK: I18n.t('restrictedProductsLink'),
}

const CatalogTermsAndConditions = (props) => {
	// local states
	const [isLoading, setIsLoading] = useState(false)
	const [agree, setAgree] = useState(false)
	const { navigation } = props

	useEffect(() => {
		logEvent('Catalog Terms View')
	}, [])

	//
	// FUNCTIONS methods
	//

	const ctaAction = () => {
		setIsLoading(true)
		props.publishCatalog((e) => {
			if (e) return setIsLoading(false)
			
			// set initialRouteName to "CurrentSale" after catalog is created for CatalogAPP	
			if (isCatalogApp()) props.setInitialRouteName('CurrentSale')

			return navigation.reset({
				index: 0,
				routes: [{ name: 'CatalogConfigIndex' }],
			})
		})
	}

	//
	// RENDER methods
	//

	const renderTitle = () => (
		<View style={styles.titleContainer}>
			<KyteText pallete="primaryDarker" size={22} lineHeight={30} textAlign="center" weight={500}>
				{strings.TITLE}
			</KyteText>
		</View>
	)

	const renderTopic = (topic) => (
		<View style={styles.topicContainer}>
			<KyteText style={styles.topicTextStyle}>{topic}</KyteText>
		</View>
	)

	const renderTopics = () => {
		const splitBreak = (text) => text.split('{break}')

		const topicLink = (text, url) => (
			<KyteText onPress={() => Linking.openURL(url)} style={[styles.topicTextStyle, { color: colors.actionColor }]}>
				{text}
			</KyteText>
		)

		// Topic 2
		let t_split = splitBreak(strings.TOPIC_2)
		const topic_2 = (
			<>
				{t_split[0]}
				{topicLink(strings.TOPIC_2_BREAK, strings.RESTRICTED_PRODUCTS_LINK)}
				{t_split[1]}
			</>
		)

		// Topic 4
		t_split = splitBreak(strings.TOPIC_4)
		const topic_4 = (
			<>
				{t_split[0]}
				{topicLink(strings.TOPIC_4_BREAK_1, strings.TERMS_OF_USE_LINK)}
				{t_split[1]}
				{topicLink(strings.TOPIC_4_BREAK_2, strings.PRIVACY_POLICY_LINK)}
				{t_split[2]}
			</>
		)

		return (
			<View style={styles.topicsContainer}>
				{renderTopic(strings.TOPIC_1)}
				{renderTopic(topic_2)}
				{renderTopic(strings.TOPIC_3)}
				{renderTopic(topic_4)}
			</View>
		)
	}

	const renderAgreementButton = () => {
		const renderLabel = () => <KyteText style={styles.agreementLabel}>{strings.AGREEMENT_LABEL}</KyteText>

		const renderCheckButton = () => {
			const size = 23
			const markSize = size - 11
			const color = colors.actionColor
			const containerStyle = {
				height: size,
				width: size,
				borderColor: color,
				borderWidth: 2,
				marginRight: 15,
				borderRadius: 7,
				flex: 0,
			}
			const checkMarkStyle = {
				height: markSize,
				width: markSize,
				backgroundColor: color,
				borderRadius: 2,
			}
			return <CenterContent style={containerStyle}>{agree ? <View style={checkMarkStyle} /> : null}</CenterContent>
		}

		return (
			<TouchableOpacity onPress={() => setAgree(!agree)}>
				<CenterContent style={styles.agreementContainer}>
					{renderCheckButton()}
					{renderLabel()}
				</CenterContent>
			</TouchableOpacity>
		)
	}

	const renderPublishButton = () => (
		<View style={styles.publishButtonContainer}>
			<ActionButton onPress={() => ctaAction()} disabled={!agree} noDisabledAlert>
				{I18n.t('catalogBarPublishCatalog')}
			</ActionButton>
		</View>
	)

	return (
		<DetailPage pageTitle={strings.PAGE_TITLE} goBack={() => props.navigation.goBack()}>
			<WizardProgressBar currentStep={5} totalSteps={CATALOG_WIZARD_TOTAL_STEPS} />
			<ScrollView contentContainerStyle={styles.mainContainer}>
				{renderTitle()}
				{renderTopics()}
			</ScrollView>
			{renderAgreementButton()}
			{renderPublishButton()}
			{isLoading ? <LoadingCleanScreen /> : null}
		</DetailPage>
	)
}

const styles = {
	mainContainer: {
		justifyContent: 'center',
		marginVertical: 25,
	},
	titleContainer: {
		alignItems: 'center',
	},
	topicsContainer: {
		marginTop: 40,
		paddingHorizontal: screenDm.HEIGHT * 0.05,
	},
	topicContainer: {
		marginBottom: 20,
	},
	topicTextStyle: {
		color: colors.tipColor,
		fontSize: 15,
		lineHeight: 22,
	},
	agreementContainer: {
		flex: 0,
		flexDirection: 'row',
		paddingBottom: 36,
	},
	agreementLabel: {
		color: colors.tipColor,
		fontSize: 11,
		lineHeight: 11,
		paddingTop: 4,
	},
	publishButtonContainer: {
		paddingBottom: 10,
	},
}

export default connect(null, { publishCatalog, setInitialRouteName })(CatalogTermsAndConditions)
