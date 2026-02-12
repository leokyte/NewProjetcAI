import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
import { Body16, Container, Margin, IconButton } from '@kyteapp/kyte-ui-components'
import { KyteModal } from '../../common'
import { KyteButton } from '../../common/KyteButton'
import { colors } from '../../../styles'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import I18n from '../../../i18n/i18n'

interface DiscardAiDescriptionModalProps {
	isVisible: boolean
	onClose: () => void
	onDiscard: () => void
}

const Strings = {
	TITLE: I18n.t('discardSuggestion'),
	SUBTITLE: I18n.t('discardAiDescriptionModal.description'),
	DISCARD_BUTTON: I18n.t('words.s.discard'),
	CANCEL_BUTTON: I18n.t('alertDismiss'),
}

const DiscardAiDescriptionModal: FC<DiscardAiDescriptionModalProps> = ({ isVisible, onClose, onDiscard }) => {
	return (
		<KyteModal
			isModalVisible={isVisible}
			hideModal={onClose}
			height="auto"
			containerStyle={{ borderRadius: 16 }}
			noPadding
		>
			<Container>
				<Container padding={16} paddingBottom={0}>
					<IconButton
						name="close-navigation"
						size={18}
						onPress={onClose}
						containerStyles={{
							alignSelf: 'flex-end',
						}}
					/>
					<KyteText weight={500} size={20} textAlign="center" marginTop={10}>
						{Strings.TITLE}
					</KyteText>

					<Body16 textAlign="center" marginTop={8} lineHeight={22}>
						{Strings.SUBTITLE}
					</Body16>
				</Container>

				<Container
					padding={16}
					marginTop={24}
					borderWidth={2}
					style={{
						borderTopColor: colors.disabledIcon,
					}}
				>
					<KyteButton
						onPress={() => {
							onDiscard()
							onClose()
						}}
						background={colors.barcodeRed}
						height={48}
						width="100%"
					>
						<Body16 weight={500} color={colors.white}>
							{Strings.DISCARD_BUTTON}
						</Body16>
					</KyteButton>

					<Margin top={16} />

					<KyteButton onPress={onClose} color={colors.primaryColor} height={48} size={16} background={colors.lightBg}>
						<Body16 weight={500}>{Strings.CANCEL_BUTTON}</Body16>
					</KyteButton>
				</Container>
			</Container>
		</KyteModal>
	)
}

const styles = StyleSheet.create({
	cancelButtonContainer: {
		marginTop: 16,
	},
})

export default DiscardAiDescriptionModal
