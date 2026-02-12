/* eslint-disable react/prefer-stateless-function */
import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import paymentMachineBase64 from '../../../../../assets/images/payment-machine'
import EmptyState from '../../../common/EmptyState'
import { KyteSafeAreaView } from '../../../common/KyteSafeAreaView'
import { KyteToolbar } from '../../../common/KyteToolbar'
import i18n from '../../../../i18n/i18n'
import { logEvent } from '../../../../integrations'

const Strings = {
	t_page_title: i18n.t('deadlineAndFeesTitle'),
	t_title: i18n.t('deadlineAndFees.emptyState.title'),
	t_description_1: i18n.t('deadlineAndFees.emptyState.description1'),
	t_description_2: i18n.t('deadlineAndFees.emptyState.description2'),
	t_description_3: i18n.t('deadlineAndFees.emptyState.description3'),
	t_submit_button: i18n.t('deadlineAndFees.emptyState.btnSubmit'),
	t_help: i18n.t('deadlineAndFees.emptyState.help'),
}
const styles = StyleSheet.create({
	outerContainer: {
		flex: 1,
	},
})

const CardServiceConfigEmptyState = () => {
	const navigation = useNavigation()

	const onPressConfigurationBtn = () => {
		navigation.replace('CardServiceConfigContainer')
	}

	useEffect(() => {
		logEvent('Inflow Payment Config View', { is_empty: true })
	}, [])

	return (
		<KyteSafeAreaView style={styles.outerContainer}>
			<KyteToolbar innerPage headerTitle={Strings.t_page_title} goBack={navigation.goBack} />
			<EmptyState
				image={{ source: { uri: paymentMachineBase64, width: 140, height: 140 } }}
				onPressSubmitBtn={onPressConfigurationBtn}
				strings={{
					title: Strings.t_title,
					description: [
						Strings.t_description_1,
						{ text: Strings.t_description_2, props: { weight: 600 } },
						Strings.t_description_3,
					],
					btnSubmit: Strings.t_submit_button,
					btnDescription: Strings.t_help,
				}}
				onPressDescriptionBtn={() => navigation.navigate('CardServiceHelp')}
			/>
		</KyteSafeAreaView>
	)
}

export default CardServiceConfigEmptyState
