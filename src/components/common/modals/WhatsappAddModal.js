import React, { useState } from 'react'
import { View, ScrollView, Dimensions, Image, Platform } from 'react-native'
import { KyteText, KyteButton, Margin, Padding, Container } from '@kyteapp/kyte-ui-components'
import { KyteModal } from '../KyteModal'
import { colors } from '../../../styles'
import { renderBoldText } from '../../../util'
import I18n from '../../../i18n/i18n'
import { PhoneInput } from '../PhoneInput'
import { CustomKeyboardAvoidingView } from '../CustomKeyboardAvoidingView'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

const Strings = {
	t_cancel: I18n.t('whatsappAddModal.cancelButton'),
	t_add_whatsapp: I18n.t('whatsappAddModal.button'),
	t_title: I18n.t('whatsappAddModal.title'),
	t_subtitle: I18n.t('whatsappAddModal.subtitle'),
}

const modalStyles = {
	titleView: {
		paddingHorizontal: 30,
	},
	infoView: {
		paddingHorizontal: 10,
	},
}
const WhatsappAddModal = ({ hideModal, onPress, isVisible, imageUri }) => {
  const [whatsapp, setWhatsapp] = useState('')
  
  const setWhatsappField = (text) => {
    const regex = /(?![0-9])./g;
    const number = text.replace(regex, '');
    setWhatsapp(!number.length ? number : `+${number}`)
  }

	const renderFields = () => (
		<View style={styles.fieldContainer}>
			<PhoneInput
				isWhatsApp
				value={whatsapp}
				onChangeText={(text) => setWhatsappField(text)}
				placeholder={I18n.t('storeInfoWhatsappPlaceholder')}
			/>
		</View>
	)
	return (
		<KyteModal
			height={SMALL_SCREENS ? '100%' : 'auto'}
			title=" "
			isModalVisible={isVisible}
			noEdges
			hideModal={() => hideModal()}
		>
			<ScrollView>
				<View>
					<Image source={{ uri: imageUri }} style={{ height: 117, width: 157, alignSelf: 'center' }} />
				</View>

				<Margin top={20} />

				<View style={modalStyles.titleView}>
					<KyteText
						size={24}
						lineHeight={33}
						weight={500}
						color={colors.actionDarkColor}
						style={{ textAlign: 'center' }}
					>
						{Strings.t_title}
					</KyteText>
				</View>

				<Margin top={25} />

				<View style={modalStyles.infoView}>
					<KyteText size={18} lineHeight={25} style={{ textAlign: 'center' }}>
						{renderBoldText(Strings.t_subtitle, { size: 18, lineHeight: 25 })}
					</KyteText>
				</View>
			</ScrollView>

			<CustomKeyboardAvoidingView
				keyboardVerticalOffset={80}
				behavior={Platform.OS === 'ios' ? "position" : null}
			>
				<Container backgroundColor={colors.white}>
					<Margin top={20} />
						{renderFields()}
					<Margin top={42} />
				</Container>
				
				<Padding bottom={20}>
				<View>
					<KyteButton
						width="100%"
						onPress={() => onPress(whatsapp)}
						type="primary"
						size="default"
						textStyle={{ paddingHorizontal: 5 }}
					>
						<KyteText size={16} lineHeight={20} weight={500} color={colors.white}>
							{Strings.t_add_whatsapp}
						</KyteText>
					</KyteButton>

					<Margin top={16}>
						<View>
							<KyteButton
								onPress={() => hideModal()}
								backgroundColor="#F7F7F8"
								type="primary"
								borderColor='#F7F7F8'
							>
								<KyteText size={16} lineHeight={20} weight={500}>
									{Strings.t_cancel}
								</KyteText>
							</KyteButton>
						</View>
					</Margin>
				</View>
			</Padding>
			</CustomKeyboardAvoidingView>
		</KyteModal>
	)
}

const styles = {
	mainContainer: {
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	fieldContainer: {
		marginTop: 10,
		backgroundColor: colors.white
	},
	phoneContainer: {
		flexDirection: 'row',
	},
	socialMediaIntegrationContainer: {
		marginTop: 25,
	},
}

export default WhatsappAddModal
