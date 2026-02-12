import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { ReceiptError } from '../../../../assets/images/receipt-error'
import { KyteIcon, KyteModal } from '..'
import I18n from '../../../i18n/i18n'

const ApiGenericErrorModal = ({ hideModal, isModalVisible, errorText, errorTitle, textStyles }) => (
	<View style={styles.containerView}>
		<KyteModal bottomPage isModalVisible={isModalVisible} height="auto" hideModal={hideModal}>
			<View style={styles.closeContainer}>
				<TouchableOpacity onPress={hideModal} style={styles.closeIcon}>
					<KyteIcon name="close-navigation" size={16} />
				</TouchableOpacity>
			</View>
			<View style={styles.icon}>
				<Image source={{ uri: ReceiptError }} style={{ height: 90, width: 82 }} />
			</View>
			<View style={styles.container}>
				<Text style={styles.container.title}>{errorTitle || I18n.t('somethingWentWrong')}</Text>
				<Text style={textStyles}>{errorText || I18n.t('weAreHavingTrouble')}</Text>
			</View>
		</KyteModal>
	</View>
)

const styles = {
	containerView: {
		height: '100%',
		backgroundColor: 'rgba(54, 63, 77, 1)',
	},
	container: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: (0, 40, 40, 40),
		title: {
			fontSize: 18,
			fontWeight: 'bold',
			paddingBottom: 20,
		},
	},
	icon: {
		paddingTop: 30,
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeIcon: {
		fontWeight: 500,
		padding: 10,
	},
	closeContainer: {
		width: '100%',
		display: 'flex',
		alignItems: 'flex-end',
	},
}

export default ApiGenericErrorModal
