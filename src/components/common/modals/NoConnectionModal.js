
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { CloudOffline } from '../../../../assets/images/cloud-offline';
import { KyteIcon, KyteModal } from '..';
import I18n from '../../../i18n/i18n'

const NoConnectionModal = ({ hideModal, isModalVisible }) => (
    <KyteModal 
        bottomPage
        isModalVisible={isModalVisible} 
        height="auto" 
        onClose={hideModal} 
        hideModal={hideModal}
    >
        <View style={styles.closeContainer}>
            <TouchableOpacity onPress={hideModal} style={styles.closeIcon}>
                <KyteIcon name="close-navigation" size={16} />
            </TouchableOpacity>
        </View>
        <View style={styles.iconNoConnection}>
            <Image source={{ uri: CloudOffline }} style={{ height: 82, width: 115 }} />
        </View>
        <View style={styles.container}>
            <Text style={styles.container.title}>{I18n.t('noInternetConnection')}</Text>
            <Text>{I18n.t('isNotPossibleChangeOrder')}</Text>
        </View>
    </KyteModal>
)

const styles = {
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

        float: 'right'
    },
	iconNoConnection: {
		justifyContent: 'center',
		alignItems: 'center',
	},
    closeContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
    },
}

export default NoConnectionModal;
