import React from 'react'
import { View, ScrollView, Dimensions } from 'react-native'
import { KyteText, KyteIcon, KyteButton } from '@kyteapp/kyte-ui-components'
import { KyteModal } from '../KyteModal'
import { colors } from '../../../styles'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

const modalStyles = {
	warningIcon: {
		alignSelf: 'center',
		marginBottom: 30,
	},
	titleView: {
		paddingHorizontal: 30,
		marginBottom: 10,
	},
	infoView: {
		paddingHorizontal: 10,
		marginTop: 10,
		marginBottom: 60,
	},
}
const CatalogBetaActiveModal = ({
	hideModal,
	title,
	infoPart1,
	infoPart2,
	infoPart3,
	mainButtonTitle,
	secondaryButtonTitle,
	onPress,
	secondaryButtonOnPress,
	customContent,
}) => (
	<KyteModal height={SMALL_SCREENS ? '100%' : 'auto'} title=" " isModalVisible noEdges hideModal={() => hideModal()}>
		<ScrollView>
			<View>
				<KyteIcon name="warning" size={50} style={modalStyles.warningIcon} />
			</View>
			<View style={modalStyles.titleView}>
				<KyteText size={20} lineHeight={33} weight={500} color={colors.actionDarkColor} style={{ textAlign: 'center' }}>
					{title}
				</KyteText>
			</View>
			<View style={modalStyles.infoView}>
				{customContent || (
					<>
						<KyteText size={16} lineHeight={25} weight={400} style={{ textAlign: 'center' }}>
							{infoPart1}
						</KyteText>
						<KyteText size={16} lineHeight={25} weight={400} style={{ top: 20, textAlign: 'center' }}>
							{infoPart2}
						</KyteText>
						<KyteText size={16} lineHeight={25} weight={400} style={{ top: 40, textAlign: 'center' }}>
							{infoPart3}
						</KyteText>
					</>
				)}
			</View>
		</ScrollView>
		<View style={{ paddingBottom: 10 }}>
			{onPress && (
				<KyteButton
					width="100%"
					onPress={() => onPress()}
					type="primary"
					size="default"
					textStyle={{ paddingHorizontal: 5 }}
				>
					<KyteText size={16} lineHeight={20} weight={500} color={colors.white}>
						{mainButtonTitle}
					</KyteText>
				</KyteButton>
			)}
			{secondaryButtonOnPress && (
				<View style={{ marginTop: 16 }}>
					<KyteButton
						onPress={() => {
							secondaryButtonOnPress()
							hideModal()
						}}
						backgroundColor="#F7F7F8"
						type="primary"
						borderColor='#F7F7F8'
					>
						<KyteText size={16} lineHeight={20} weight={500}>
							{secondaryButtonTitle}
						</KyteText>
					</KyteButton>
				</View>
			)}
		</View>
	</KyteModal>
)

export default CatalogBetaActiveModal
