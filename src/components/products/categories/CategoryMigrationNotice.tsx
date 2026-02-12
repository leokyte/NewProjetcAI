import React from 'react'
import { migrationNotice } from '../../../../assets/images/migration-notice/index.js'
import { useNavigation } from '@react-navigation/native'
import { View, Image, StyleSheet } from 'react-native'
import { ActionButton } from '../../common'
import { Type } from '../../../styles'

import { KyteText, colors, KyteBox, Divider } from '@kyteapp/kyte-ui-components'
import I18n from '../../../i18n/i18n'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container.js'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding.js'

export const CategoryMigrationNotice: React.FC = () => {
	const navigation = useNavigation()

	const handleNavigateToCategories = () => {
		navigation.navigate('Config', {
			screen: 'ProductCategories',
		})
	}

	return (
		<View style={styles.container}>
			<Container flex={1} justifyContent="center">
				<Image style={styles.image} source={{ uri: migrationNotice }} />
				<KyteBox style={styles.box}>
					<KyteText style={styles.text} allowFontScaling={false}>
						{I18n.t('categoryMigrationNotice.title1')}{' '}
						<KyteText style={styles.bold}>{I18n.t('categoryMigrationNotice.title2')}</KyteText>
					</KyteText>
				</KyteBox>
			</Container>
			<Divider />
			<Container flex={0} backgroundColor={colors.white}>
				<Padding vertical={16} horizontal={10}>
					<ActionButton full onPress={() => handleNavigateToCategories()}>
						{I18n.t('goToCategories')}
					</ActionButton>
				</Padding>
			</Container>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'space-between',
	},
	content: {
		justifyContent: 'center',
	},
	image: {
		width: 250,
		height: 250,
		alignSelf: 'center',
	},
	text: {
		color: colors.gray02Kyte,
		...Type.Regular,
		fontSize: 15,
		lineHeight: 24,
		textAlign: 'center',
	},
	bold: {
		...Type.Medium,
		fontSize: 15,
		lineHeight: 24,
		textAlign: 'center',
	},
	box: {
		paddingHorizontal: 14,
	},
})
