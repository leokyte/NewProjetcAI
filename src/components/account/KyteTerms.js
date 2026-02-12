// This file is not used anymore because we remove the kyte terms modal during sign up

import { View } from 'react-native'
import React, { useState, useEffect } from 'react'
import WebView from 'react-native-webview'
import { connect } from 'react-redux'

import { colors } from '../../styles'
import {
	ActionButton,
	CheckItem,
	KyteIcon,
	KyteSafeAreaView,
	KyteText,
	LoadingCleanScreen,
	DetailPage,
} from '../common'
import LoadingScreen from '../common/LoadingScreen'
import I18n from '../../i18n/i18n'
import { acceptKyteTerms } from '../../stores/actions'
import { LoginTracker, APP_TERMS_ACCEPTION_SCREEN, generateTestID } from '../../util'
import { getPolicyUrl, getTermsUrl } from '../../util/util-policies'

const Strings = {
	CONDITIONS_TITLE: I18n.t('generalConditionsTitle'),
	CONDITIONS_TEXT1: I18n.t('generalConditionsText'),
	CONDITIONS_TEXT2: I18n.t('words.s.and'),
	ACCEPT_CONDITIONS: I18n.t('termsOfUseAcception'),
	TERMS: I18n.t('termsOfUse'),
	PRIVACY_POLICY: I18n.t('privacyPolicy'),
	START: I18n.t('words.s.start'),
	ALERT_DESCRIPTION: I18n.t('termsOfUseWarning'),
}

const KyteTerms = (props) => {
	const [isWebViewVisible, setWebViewVisibility] = useState(false)
	const [isTermsAccepted, setTermsAcception] = useState(false)
	const [webViewType, setWebViewType] = useState(null)
	const { isLoaderVisible } = props

	// componentDidMount
	useEffect(() => {
		LoginTracker.trackSuccessEvent(APP_TERMS_ACCEPTION_SCREEN)
	}, [])

	const renderWebView = () => {
		const termsUrl = getTermsUrl()
		const privacyPolicyUrl = getPolicyUrl()

		return (
			<DetailPage headerStyle={{ borderBottomWidth: 0 }} goBack={() => setWebViewVisibility(false)}>
				<WebView
					renderLoading={() => <LoadingScreen reverseColor description={I18n.t('openingScreenMessage')} />}
					startInLoadingState
					source={{ uri: webViewType === 'terms' ? termsUrl : privacyPolicyUrl }}
				/>
			</DetailPage>
		)
	}

	const renderContent = () => (
		<View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
			<KyteIcon name="logo" size={39} color={colors.actionColor} style={{ paddingBottom: 20 }} />
			<KyteText weight="Medium" size={20} pallete="primaryDarker">
				{Strings.CONDITIONS_TITLE}
			</KyteText>

			<KyteText size={14} style={{ paddingTop: 15, paddingHorizontal: 30, lineHeight: 20, textAlign: 'center' }}>
				{Strings.CONDITIONS_TEXT1}
				<KyteText
					{...generateTestID('terms-ta')}
					pallete="actionColor"
					size={14}
					onPress={() => {
						setWebViewType('terms')
						setWebViewVisibility(true)
					}}
				>
					{' '}
					{Strings.TERMS.toLowerCase()}{' '}
				</KyteText>
				<KyteText size={14} style={{ paddingTop: 15 }}>
					{Strings.CONDITIONS_TEXT2}
				</KyteText>
				<KyteText
					{...generateTestID('policy-ta')}
					pallete="actionColor"
					size={14}
					onPress={() => {
						setWebViewType('privacy-policy')
						setWebViewVisibility(true)
					}}
				>
					{' '}
					{Strings.PRIVACY_POLICY.toLowerCase()}{' '}
				</KyteText>
			</KyteText>
		</View>
	)

	return (
		<KyteSafeAreaView style={{ flex: 1 }}>
			{isWebViewVisible ? renderWebView() : renderContent()}
			<View style={styles.buttonContainer}>
				<CheckItem
					title={Strings.ACCEPT_CONDITIONS}
					checked={isTermsAccepted}
					onPress={() => setTermsAcception(!isTermsAccepted)}
					containerStyle={styles.checkboxContainer}
					textStyle={styles.checkboxText}
					testProps={generateTestID('accept-ta')}
				/>
				<ActionButton
					onPress={() => props.acceptKyteTerms()}
					nextArrow
					disabled={!isTermsAccepted}
					alertTitle={I18n.t('words.s.attention')}
					alertDescription={Strings.ALERT_DESCRIPTION}
					style={{ marginTop: 5 }}
					testProps={generateTestID('start-ta')}
				>
					{Strings.START}
				</ActionButton>
			</View>
			{isLoaderVisible ? <LoadingCleanScreen /> : null}
		</KyteSafeAreaView>
	)
}

const styles = {
	buttonContainer: {
		height: 105,
		borderTopWidth: 1,
		borderTopColor: colors.borderlight,
		justifyContent: 'flex-end',
		paddingBottom: 10,
	},
	checkboxContainer: {
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	checkboxText: {
		fontSize: 11,
		color: '#808c9e',
		marginLeft: 2,
	},
}

const mapStateToProps = (state) => ({
	isLoaderVisible: state.common.loader.visible,
})
export default connect(mapStateToProps, { acceptKyteTerms })(React.memo(KyteTerms))
