import React, { FC } from 'react'
import { KyteIcon, KyteModal } from '../../common'
import { Image, ScrollView } from 'react-native'
import { Margin, Body16, Body13, Body12, Row, Padding } from '@kyteapp/kyte-ui-components'
import { aiDescriptionTipImage } from '../../../../assets/images/ai-description-tip-pt'
import { aiDescriptionTipEsImage } from '../../../../assets/images/ai-description-tip-es'
import { aiDescriptionTipEnImage } from '../../../../assets/images/ai-description-tip-en'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import { renderBoldText } from '../../../util'
import { colors } from '../../../styles'
import BottomButton from '../../common/BottomButton'
import I18n from '../../../i18n/i18n'

interface AiDescriptionTipModalProps {
	isVisible: boolean
	onClose: () => void
}

const Strings = {
	TITLE: I18n.t('aiTipModal.title'),
	DESCRIPTION: I18n.t('aiTipModal.description'),
	CLEAR_PRODUCT_NAME: I18n.t('aiTipModal.clearProductName'),
	DEFINED_CATEGORY: I18n.t('aiTipModal.definedCategory'),
	STORE_DESCRIPTION: I18n.t('aiTipModal.storeDescription'),
	PRODUCT_DESCRIPTION: I18n.t('aiTipModal.productDescription'),
	FOOTER_TIP_TITLE: I18n.t('aiTipModal.footerTitle'),
	FOOTER_TIP_DESCRIPTION: I18n.t('aiTipModal.footerDescription'),
	BUTTON_TEXT: I18n.t('okUnderstood'),
}


const AiDescriptionTipModal: FC<AiDescriptionTipModalProps> = ({ isVisible, onClose }) => {
	const getImage = () => {
		const locale = I18n.t('locale')
		if (locale.startsWith('pt')) {
			return aiDescriptionTipImage
		}
		if (locale.startsWith('es')) {
			return aiDescriptionTipEsImage
		}

		return aiDescriptionTipEnImage
	}

	return (
		<KyteModal
			height="100%"
			fullPage
			fullPageTitle={Strings.TITLE}
			fullPageTitleIcon="back-navigation"
			hideFullPage={onClose}
			isModalVisible={isVisible}
			headerTitleStyle={{ fontSize: 16 }}
		>
			<ScrollView>
				<Padding horizontal={16} style={{ backgroundColor: colors.lightBg }}>
					<Container alignItems="center">
						<Image source={{ uri: getImage() }} style={{ width: '80%', height: 307 }} />

						<Body16 lineHeight={24} marginTop={10} textAlign="center">
							{renderBoldText(Strings.DESCRIPTION, { size: 16 })}
						</Body16>

						<Container
							backgroundColor={colors.littleDarkGray}
							borderRadius={8}
							padding={16}
							width="100%"
							marginTop={16}
						>
							<Row alignItems="center">
								<KyteIcon name="filter" size={24} />

								<Container marginLeft={12}>
									<Body13 weight={500}>Informações que ajudam a IA:</Body13>
									<Container marginLeft={8} marginTop={4}>
										{[
											Strings.CLEAR_PRODUCT_NAME,
											Strings.DEFINED_CATEGORY,
											Strings.STORE_DESCRIPTION,
											Strings.PRODUCT_DESCRIPTION,
										].map((item) => (
											<Body12 lineHeight={18} key={item}>{`\u2022 ${item}`}</Body12>
										))}
									</Container>
								</Container>
							</Row>
						</Container>

						<Container backgroundColor={colors.green08} padding={16} borderRadius={8} width="100%" marginTop={16}>
							<Row alignItems="center">
								<KyteIcon name="ai" size={24} color={colors.green01} />

								<Container marginLeft={13}>
									<Body13 weight={500}>{Strings.FOOTER_TIP_TITLE}</Body13>

									<Body12 marginTop={4} lineHeight={17}>
										{Strings.FOOTER_TIP_DESCRIPTION}
									</Body12>
								</Container>
							</Row>
						</Container>
					</Container>
				</Padding>
				<Margin top={24} />
			</ScrollView>

			<BottomButton onPress={onClose}>{Strings.BUTTON_TEXT}</BottomButton>
		</KyteModal>
	)
}

export default AiDescriptionTipModal
