import React, { useCallback } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { KyteToolbar } from '../../../common/KyteToolbar'
import { KyteSafeAreaView } from '../../../common/KyteSafeAreaView'
import { useNavigation } from '@react-navigation/native'
import i18n, { getLocale } from '../../../../i18n/i18n'
import {
	Body14,
	Container,
	Divider,
	KyteButton,
	KyteIcon,
	LinkButton,
	Margin,
	Row,
	colors,
} from '@kyteapp/kyte-ui-components'
import EmptyState from '../../../common/EmptyState'
import { kytePOSIntoKyteControl } from '../../../../../assets/images/kyte-pos-into-kyte-control'
import TooltipContainer from '../../../common/utilities/TooltipContainer'
import { openAppUrl } from '../../../../util'
import { BundleEnum, KYTE_CONTROL_APP_ID } from '../../../../enums'
import { KYTE_CONTROL_APP_URL } from '../../../../kyte-constants'

const styles = StyleSheet.create({
	outerContainer: {
		flex: 1,
	},
	innerContainer: {
		backgroundColor: colors.white,
		flex: 1,
		paddingTop: 16,
	},
})

const Strings = {
	t_page_title: i18n.t('deadlineAndFees.emptyState.title'),
	t_empty_state_title: i18n.t('deadlineAndFees.emptyState.help'),
	t_btn_ok: i18n.t('okUnderstood'),
	t_tooltip_title: i18n.t('deadlineAndFees.helpPage.tooltipTitle'),
	t_btn_kyte_control: i18n.t('deadlineAndFees.help.button'),
	t_help_description1: i18n.t('deadlineAndFees.helpPage.helpDescription1'),
	t_help_description2: i18n.t('deadlineAndFees.helpPage.helpDescription2'),
	t_help_description3: i18n.t('deadlineAndFees.helpPage.helpDescription3'),
	t_help_description4: i18n.t('deadlineAndFees.helpPage.helpDescription4'),
	t_help_description5: i18n.t('deadlineAndFees.helpPage.helpDescription5'),
	t_tooltip_description1: i18n.t('deadlineAndFees.helpPage.tooltipDescription1'),
	t_tooltip_description2: i18n.t('deadlineAndFees.helpPage.tooltipDescription2'),
	t_tooltip_description3: i18n.t('deadlineAndFees.helpPage.tooltipDescription3'),
}

const CardServiceHelp = () => {
	const { goBack } = useNavigation()

	const onPressKyteControlBtn = useCallback(() => {
		const locale = getLocale()

		openAppUrl(KYTE_CONTROL_APP_URL, {
			locale,
			playStoreId: BundleEnum.CONTROL_ANDROID,
			appStoreId: KYTE_CONTROL_APP_ID,
		})
	}, [])

	return (
		<KyteSafeAreaView style={styles.outerContainer}>
			<KyteToolbar innerPage borderBottom={1} headerTitle={Strings.t_page_title} goBack={goBack} />
			<ScrollView style={styles.innerContainer}>
				<EmptyState
					image={{
						source: { uri: kytePOSIntoKyteControl, width: 180, height: 55 },
						style: { width: 180, height: 55 },
						width: 180,
						height: 55,
						resizeMode: 'contain',
					}}
					strings={{
						title: Strings.t_empty_state_title,
						description: [
							`${Strings.t_help_description1} `,
							{ text: Strings.t_help_description2, props: { weight: 600 } },
							` ${Strings.t_help_description3} `,
							{ text: Strings.t_help_description4, props: { weight: 600 } },
							Strings.t_help_description5,
						],
					}}
				/>
				<Margin top={16} right={16} left={16}>
					<TooltipContainer
						leftIcon="stats"
						terms={{
							title: Strings.t_tooltip_title,
							description: [
								`${Strings.t_tooltip_description1} `,
								{ text: Strings.t_tooltip_description2, props: { weight: 600 } },
								` ${Strings.t_tooltip_description3}`,
							],
						}}
					/>
				</Margin>

				<Margin top={16}>
					<Row justifyContent="center">
						<LinkButton weight={500} onPress={onPressKyteControlBtn}>
							<Row alignItems="center">
								<KyteIcon name="cell-phone" color={colors.green03Kyte} size={20} />
								<Margin left={6}>
									<Body14 color={colors.green03Kyte} weight={500}>
										{Strings.t_btn_kyte_control}
									</Body14>
								</Margin>
							</Row>
						</LinkButton>
					</Row>
				</Margin>
				<Margin bottom={50} />
			</ScrollView>
			<Divider />
			<Container padding={16} backgroundColor={colors.white}>
				<KyteButton
					onPress={goBack}
					type="primary"
					textStyle={{ fontWeight: '600', fontSize: 16, color: colors.white }}
				>
					{Strings.t_btn_ok}
				</KyteButton>
			</Container>
		</KyteSafeAreaView>
	)
}

export default CardServiceHelp
