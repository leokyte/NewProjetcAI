import React, { useState } from 'react'
import FastImage from 'react-native-fast-image'
import { ScrollView } from 'react-native'
import { KyteBox, KyteText, KyteBaseButton, KyteButtonV2, KyteBottomBar, KyteSwitch } from '@kyteapp/kyte-ui-components'
import { colors } from '../../../../../styles'
import I18n from '../../../../../i18n/i18n'
import { SwitchContainer, KyteAlertV2 } from '../../../../common'
import { generateTestID } from '../../../../../util'

const EditPage = ({ showModal, remove, saveBanner, initialPhoto, toggleBanner, bannerDoc }) => {
	const [showModalAlert, setShowModalAlert] = useState(false)

	const removePhoto = async () => {
		await remove()
		setShowModalAlert(false)
	}

	return (
		<>
			<ScrollView keyboardShouldPersistTaps="handled">
				<KyteBox ph={5} pv={4}>
					<KyteBox>
						<KyteBaseButton type="blank" onPress={showModal} testProps={generateTestID('banner-edit-ea')}>
							<KyteBox overflow="hidden" borderRadius={8} h={120} w="100%">
								<FastImage
									style={{ flex: 1 }}
									source={{
										uri: bannerDoc.filepath || bannerDoc.URL,
									}}
									resizeMode="contain"
								/>

								<KyteBox height={45} position="absolute" bottom={0} left={0} w="100%" justify="center" align="center">
									<KyteBox bg={colors.secondaryGrey} opacity={0.9} position="absolute" w="100%" h="100%" />
									<KyteText color={colors.white} size={14} weight={500}>
										{I18n.t('catalog.banner.buttonEdit')}
									</KyteText>
								</KyteBox>
							</KyteBox>
						</KyteBaseButton>

						{(bannerDoc.URL || bannerDoc.filepath) && (
							<KyteButtonV2
								type="secondary"
								onPress={() => setShowModalAlert(true)}
								startIcon="close-navigation"
								circle
								size="xs"
								style={{ position: 'absolute', right: 10, top: 10, zIndex: 2 }}
							/>
						)}
					</KyteBox>
				</KyteBox>

				<SwitchContainer
					title={I18n.t('catalog.banner.showBanner')}
					onPress={toggleBanner}
					style={{ borderBottomWidth: 0, borderTopWidth: 1 }}
				>
					<KyteSwitch
						onValueChange={toggleBanner}
						active={bannerDoc.active}
					/>
				</SwitchContainer>
			</ScrollView>

			<KyteBottomBar
				title={I18n.t('descriptionSaveButton')}
				type="primary"
				onPress={saveBanner}
				disabled={
					initialPhoto?.URL === bannerDoc.URL &&
					initialPhoto?.active === bannerDoc.active &&
					initialPhoto?.filepath === bannerDoc.filepath
				}
				testProps={generateTestID('save-ea')}
			/>

			<KyteAlertV2
				isModalVisible={showModalAlert}
				hideModal={() => setShowModalAlert(false)}
				contentModal={{
					titleHeader: I18n.t('catalog.banner.modal.title'),
					description: I18n.t('catalog.banner.modal.text'),
					labelButton: I18n.t('alertConfirm'),
					actionButton: removePhoto,
				}}
			/>
		</>
	)
}

export { EditPage }
