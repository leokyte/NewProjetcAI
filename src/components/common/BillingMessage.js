import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { WebView } from 'react-native-webview'
import { View, ScrollView, Image, ImageBackground, Linking, Platform, StyleSheet, Text } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { KyteBottomBar, isFree, PLAN_FREE } from '@kyteapp/kyte-ui-components'

import { messageOutOfTrial, messagePattern } from '../../../assets/images'
import { KyteModal, TextButton, ListOptions, defaultScreenInformation } from '.'
import LoadingScreen from './LoadingScreen'
import { redirectToSubscription, toggleBillingMessage, toggleBlockManagePlan } from '../../stores/actions'
import { msg, colors } from '../../styles'
import I18n from '../../i18n/i18n'
import { generateTestID, shouldRedirectToSubscription } from '../../util'
import { logEvent } from '../../integrations'

const DefaultRender = React.memo(({ message, plan, billing }) => {
	const [showOpacityGradient, setShowOpacityGradient] = useState(true)
	const [scrollHeight, setScrollHeight] = useState(0)
	const Content = message.content
	const Title = message.title

	const renderFeatureList = () => {
		const defaultScreenValuesIteration = defaultScreenInformation.map((values) => ({
			title: values.title,
			leftIcon: { icon: values.icon, color: colors.primaryColor },
			subtitle: values.subtitle,
			hideChevron: true,
			rightside: true,
		}))

		return (
			<View style={styles.defaultScreenView}>
				<ListOptions items={defaultScreenValuesIteration} billingList paddingHorizontal />
				<View>
					<TextButton
						onPress={() => Linking.openURL('https://www.kyteapp.com/terms-of-use')}
						title={I18n.t('termsOfUse')}
						color={colors.actionColor}
						size={16}
						style={styles.defaultScreenPrivacyText}
					/>
					<TextButton
						onPress={() => Linking.openURL('https://www.kyteapp.com/privacy-policy')}
						title={I18n.t('privacyPolicy')}
						color={colors.actionColor}
						style={styles.defaultScreenPrivacyText}
						size={16}
					/>
				</View>
			</View>
		)
	}

	const renderOpacityGradient = () => {
		const gradientStyle = {
			height: 200,
			position: 'absolute',
			bottom: 0,
			right: 0,
			left: 0,
		}

		return <LinearGradient colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 1)']} style={gradientStyle} />
	}

	return (
		<View onStartShouldSetResponder={() => true}>
			<ScrollView
				onScroll={({ nativeEvent }) => {
					const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
					const showGradient = layoutMeasurement.height + contentOffset.y >= contentSize.height - 1 // -1 to avoid imperfect screen height
					setShowOpacityGradient(!showGradient)
				}}
				onContentSizeChange={(w, h) => setScrollHeight(h)}
				onLayout={({ nativeEvent }) => {
					if (nativeEvent.layout.height >= scrollHeight) {
						setShowOpacityGradient(false)
					}
				}}
			>
				<ImageBackground source={{ uri: messagePattern }} resizeMode="repeat" style={msg.messageHeader}>
					<View style={msg.messageImageContainer(message?.image?.size)}>
						<Image
							style={msg.messageImage}
							source={{ uri: message?.image?.src ? message.image.src(billing) : messageOutOfTrial }}
						/>
					</View>
				</ImageBackground>
				<View style={msg.messageContainer()}>
					{message.title && typeof message.title !== 'string' ? (
						<Title billing={billing} plan={plan} />
					) : !message?.title ? (
						<Text style={msg.title}>{I18n.t('billingMessages.free.title')}</Text>
					) : (
						<Text style={msg.title}>
							{I18n.t('billingMessages.paid.title').replace('PRO', billing.plan.toUpperCase())}
						</Text>
					)}

					{message.content && <Content billing={billing} plan={plan} />}
					{!message.hideFeatures && renderFeatureList()}
				</View>
			</ScrollView>
			{showOpacityGradient && Platform.OS === 'android' && renderOpacityGradient()}
		</View>
	)
})

const WebviewRender = React.memo(({ message, setFallbackToDefault, webview, billing }) => {
	const webviewLink = () => {
		const { plan } = billing
		const baseUri = 'https://www.kyte.link'
		const defaultLink = 'feature-base'
		const isDefault = !webview?.length
		const planUri = isFree(billing) ? PLAN_FREE : plan

		const final = `${baseUri}/${webview}-${planUri}`

		switch (I18n.t('locale')) {
			case 'pt-br':
				return isDefault ? `${baseUri}/webview/pt/${defaultLink}` : `${final}-pt`
			case 'es':
			case 'es-ES':
				return isDefault ? `${baseUri}/webview/es/${defaultLink}` : `${final}-es`
			default:
				return isDefault ? `${baseUri}/webview/en/${defaultLink}` : `${final}-en`
		}
	}

	const webviewLoadingState = () => {
		const loadingStyle = {
			...StyleSheet.absoluteFillObject,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: colors.lightBg,
		}

		return (
			<LoadingScreen
				hideLogo
				reverseColor
				styles={loadingStyle}
				description={message.loading || I18n.t('words.s.loading')}
			/>
		)
	}

	return (
		<View>
			<View style={msg.messageContainer(0, 0)} onStartShouldSetResponder={() => true}>
				<View style={styles.defaultScreenView} {...generateTestID('modal-visible')}>
					<WebView
						renderLoading={webviewLoadingState}
						onError={() => setFallbackToDefault(true)}
						startInLoadingState
						source={{ uri: webviewLink() }}
						showsHorizontalScrollIndicator={false}
						bounces={false}
					/>
				</View>
			</View>
		</View>
	)
})

const BillingMessageComponent = ({ ...props }) => {
	const [fallbackToDefault, setFallbackToDefault] = useState(false)

	const msgTemplates = {
		default: <DefaultRender message={props.message} plan={props.plan} billing={props.billing} />,
		webview: (
			<WebviewRender
				message={props.message}
				setFallbackToDefault={setFallbackToDefault}
				webview={props.webview}
				billing={props.billing}
			/>
		),
	}
	const showAsWebview = props.webview !== 'default' ? 'webview' : 'default'
	const messageType = !fallbackToDefault && showAsWebview

	const renderBottomBar = () => {
		const onPress = () => {
			const aiRegisterWebview = 'restrictions/ai-register'
			if (props.billing.webview === aiRegisterWebview) {
				logEvent('Paywall CTA Click', { feature: 'ProductAIAutofillFromImage' })
			}

			logEvent('Click To Purchase', {
				plan: props.billing.plan,
				payment_status: props.billing.status,
				message: props.billing.webview,
			})
			props.toggleBillingMessage(false)
			setTimeout(() => {
				props.toggleBlockManagePlan()
			}, 500)
		}

		return <KyteBottomBar type="primary" title={I18n.t('billingMessages.linkDefault')} onPress={onPress} />
	}

	useEffect(() => {
		props.isMessageVisible &&
			logEvent('Conversion Message View', {
				plan: props.billing.plan,
				payment_status: props.billing.status,
				message: props.billing.webview,
			})
	}, [props.isMessageVisible])

	return (
		<KyteModal
			bottomPage
			propagateSwipe
			noPadding
			noEdges
			useSlider
			height="90%"
			isModalVisible={props.isMessageVisible}
			hideModal={() => props.toggleBillingMessage(false)}
			onSwipeComplete={() => props.toggleBillingMessage(false)}
			swipeDirection={['down']}
			topRadius={12}
		>
			<View style={styles.flex}>
				<View style={styles.flex}>{msgTemplates[messageType]}</View>
				{!props.message.hideCta && renderBottomBar()}
			</View>
		</KyteModal>
	)
}

const styles = {
	flex: {
		flex: 1,
	},
	contentModal: {
		height: 'auto',
		backgroundColor: colors.lightBg,
		opacity: 1,
		paddingTop: 15,
		paddingVertical: 15,
	},
	defaultScreenView: {
		width: '100%',
		height: '100%',
	},
	defaultScreenPrivacyText: {
		textAlign: 'center',
		fontWeight: 'bold',
	},
}

const mapStateToProps = ({ billing, auth }) => ({
	billing,
	isMessageVisible: billing.isMessageVisible,
	message: billing.message,
	plan: billing.planInfo,
	webview: billing.webview,
	account: auth.account,
})

const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators(
		{
			toggleBillingMessage,
			toggleBlockManagePlan,
			redirectToSubscription,
		},
		dispatch
	),
})

const BillingMessage = connect(mapStateToProps, mapDispatchToProps)(BillingMessageComponent)
export { BillingMessage }
