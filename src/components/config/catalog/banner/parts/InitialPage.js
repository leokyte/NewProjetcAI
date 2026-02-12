import React, { useEffect } from 'react'
import { Image, ScrollView } from 'react-native'
import { KyteBox, KyteBottomBar, isFree, KyteText } from '@kyteapp/kyte-ui-components'

import { ImgUri, listFeatures } from '.'
import { colors } from '../../../../../styles'
import I18n from '../../../../../i18n/i18n'
import { generateTestID } from '../../../../../util'
import { logEvent } from '../../../../../integrations'

const InitialPage = ({ showModal, billing }) => {
	useEffect(() => {
		logEvent('BannerOnboardingView')
	}, [])

	return (
		<>
			<ScrollView keyboardShouldPersistTaps="handled">
				<KyteBox ph={5} pv={4}>
					<KyteBox align="center" mb={17}>
						<Image
							style={{ height: 270, width: 270 }}
							source={{
								uri: ImgUri,
							}}
						/>

						<KyteText textAlign="center" color={colors.primaryDarker} size={14} weight={500} marginBottom={4}>
							{I18n.t('catalog.banner.mainTitle')}
						</KyteText>
						<KyteText textAlign="center" color={colors.primaryDarker} size={12}>
							{I18n.t('catalog.banner.mainDescription')}
						</KyteText>
					</KyteBox>

					{listFeatures.map((item, index) => (
						<KyteBox bg={colors.borderlight} ph={4} pv={2} borderRadius={6} mt={4} key={index}>
							<KyteText color={colors.secondaryBg} size={12} weight={500}>
								{item.title}
							</KyteText>
							{item.description}
						</KyteBox>
					))}
				</KyteBox>
			</ScrollView>

			<KyteBottomBar
				title={I18n.t('catalog.banner.buttonUpload')}
				type="primary"
				onPress={showModal}
				disabled={isFree(billing)}
				testProps={generateTestID('uploud-ba')}
			/>
		</>
	)
}

export { InitialPage }
