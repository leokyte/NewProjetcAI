import React from 'react'
import { connect } from 'react-redux'
import { Image, Linking, Platform } from 'react-native'
import { KyteBox, KyteBottomBar, KyteText } from '@kyteapp/kyte-ui-components'

import { android, ios, CatalogToPOS, POSToCatalog } from '../../../assets/images'
import I18n from '../../i18n/i18n'
import { KyteModal } from '.'
import { toggleBlockManagePlan } from '../../stores/actions'
import { isCatalogApp } from '../../util/util-flavors'
import { isDifferentAppSubscription } from '../../util/util-plans'

const BlockManagePlanComponent = ({ billing, ...props }) => {
	const blockType = {
		differentOS: {
			android: {
				img: ios,
				title: I18n.t('BlockManagePlan.ios.title'),
				text1: I18n.t('BlockManagePlan.ios.text1'),
				text2: I18n.t('BlockManagePlan.ios.text2'),
			},
			ios: {
				img: android,
				title: I18n.t('BlockManagePlan.android.title'),
				text1: I18n.t('BlockManagePlan.android.text1'),
				text2: I18n.t('BlockManagePlan.android.text2'),
				button: I18n.t('BlockManagePlan.android.button'),
				uri: 'http://play.google.com/store/account/subscriptions',
			},
		},
		differentApp: {
			img: !isCatalogApp() ? POSToCatalog: CatalogToPOS,
			title: I18n.t('BlockManagePlan.differentApp.title'),
			text1Slim1: I18n.t('BlockManagePlan.differentApp.text1.slim1'),
			text1Slim2: I18n.t('BlockManagePlan.differentApp.text1.slim2'),
			appName: !isCatalogApp()
				? I18n.t('BlockManagePlan.differentApp.Catalog')
				: I18n.t('BlockManagePlan.differentApp.POS'),
			button: '',
		},
	}

	const renderDifferentAppSubscriptionAlert = (
		<KyteBox ph={5}>
			<KyteBox mb={6}>
				<Image
					style={{ width: '100%', height: 105 }}
					source={{ uri: blockType.differentApp.img }}
					resizeMode="contain"
				/>
			</KyteBox>
			<KyteText textAlign="center" size={19} w={600} marginBottom={24}>
				{blockType.differentApp.title} {blockType.differentApp.appName}
			</KyteText>
			<KyteText textAlign="center" size={16} marginBottom={24}>
				{blockType.differentApp.text1Slim1} {blockType.differentApp.appName} {blockType.differentApp.text1Slim2}
			</KyteText>
		</KyteBox>
	)

	const renderDifferentOSSubscriptionAlert = (
		<>
			<KyteBox ph={5}>
				<KyteBox mb={6}>
					<Image
						style={{ width: '100%', height: 105 }}
						source={{ uri: blockType.differentOS[Platform.OS].img }}
						resizeMode="contain"
					/>
				</KyteBox>
				<KyteText textAlign="center" size={19} w={600} marginBottom={24}>
					{blockType.differentOS[Platform.OS].title}
				</KyteText>
				<KyteText textAlign="center" size={16} marginBottom={24}>
					{blockType.differentOS[Platform.OS].text1}
				</KyteText>
				<KyteText textAlign="center" size={16} marginBottom={28}>
					{blockType.differentOS[Platform.OS].text2}
				</KyteText>
			</KyteBox>
			{blockType.differentOS[Platform.OS]?.button && (
				<KyteBottomBar
					type="primary"
					title={blockType.differentOS[Platform.OS].button}
					onPress={() => {
						Linking.openURL(blockType.differentOS[Platform.OS].uri)
						props.toggleBlockManagePlan()
					}}
				/>
			)}
		</>
	)

	const renderModalContent = () => {
		const isDifferentApp = isDifferentAppSubscription(billing?.planInfo?.planId)
		return isDifferentApp ? renderDifferentAppSubscriptionAlert : renderDifferentOSSubscriptionAlert
	}

	return (
		<KyteModal
			bottomPage
			height="auto"
			hideModal={() => props.toggleBlockManagePlan()}
			title=" "
			isModalVisible={billing.showBlockManagePlan}
			topRadius={12}
		>
			<KyteBox ph={5} />
			{renderModalContent()}
		</KyteModal>
	)
}

const mapStateToProps = ({ billing }) => ({
	billing,
})

const BlockManagePlan = connect(mapStateToProps, { toggleBlockManagePlan })(BlockManagePlanComponent)
export { BlockManagePlan }
