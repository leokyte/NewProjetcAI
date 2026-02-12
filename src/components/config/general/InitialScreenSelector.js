import React, { useState } from 'react'
import { colors } from '../../../styles'
import ListOptionItem from '../../common/ListOptionItem'
import { Body11, Row, Container, ListTileRadio, Margin, NotificationType } from '@kyteapp/kyte-ui-components'
import I18n from '../../../i18n/i18n'
import { Icon } from 'react-native-elements'
import { KyteModal } from '../../common'
import BottomButton from '../../common/BottomButton'
import { connect } from 'react-redux'
import KyteNotifications from '../../common/KyteNotifications'
import { setInitialRouteName } from '../../../stores/actions'
import { bindActionCreators } from 'redux'
import { logEvent } from '../../../integrations'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Platform } from 'react-native'
import { isCatalogApp } from '../../../util/util-flavors'

const Strings = {
	t_title: I18n.t('initialPage'),
	t_sell: I18n.t('words.s.sell').toUpperCase(),
	t_save: I18n.t('alertSave'),
	t_dashboard_resume: I18n.t('dashboardResume'),
	t_toast_success: I18n.t('homeScreenSuccess'),
	t_toast_error: I18n.t('homeScreenError'),
}

const optionsList = [
	{ label: I18n.t('sideMenu.dashboard'), type: 'Dashboard', logProperty: 'dashboard' },
	{ label: I18n.t('sideMenu.currentSale'), type: 'CurrentSale', logProperty: 'current_sale' },
	{
		label: I18n.t('openOrders'),
		reducedLabel: I18n.t('sideMenu.orders'),
		type: 'OpenedSales',
		logProperty: 'orders',
	},
	{ label: I18n.t('sideMenu.products'), type: 'Products', logProperty: 'products' },
	{ label: I18n.t('sideMenu.customers'), type: 'Customers', logProperty: 'customers' },
	{ label: I18n.t('salesHistory'), reducedLabel: I18n.t('sideMenu.sales'), type: 'Sales', logProperty: 'sales' },
	{ label: I18n.t('sideMenu.statistics'), type: 'Statistics', logProperty: 'statistics' },
]

const InitialScreenSelector = (props) => {
	const pageOptions = isCatalogApp() ? optionsList.filter((item) => item.type !== 'Dashboard') : optionsList
	const initialScreen = props.initialRouteName
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [selectedOption, setSelectedOption] = useState(initialScreen)
	const [toast, setToast] = useState(null)
	const displayOption = pageOptions.find((item) => item.type === initialScreen)
	const insets = useSafeAreaInsets()

	const handleSaveInitialScreen = async () => {
		const timer = 3000
		const removeToast = () => setToast(null)
		const defaultToastProps = { handleClose: removeToast, onAutoDismiss: removeToast }
		const successToast = { ...defaultToastProps, timer, title: Strings.t_toast_success, type: NotificationType.SUCCESS }
		const errorToast = { ...defaultToastProps, timer, title: Strings.t_toast_error, type: NotificationType.ERROR }
		const logProperty = pageOptions.find((item) => item.type === selectedOption)?.logProperty

		try {
			props.setInitialRouteName(selectedOption)
			setToast(successToast)
			logEvent('Start Screen Change', { start_screen: logProperty })
		} catch (error) {
			setToast(errorToast)
		}
		setIsModalVisible(false)
	}

	return (
		<>
			<Container backgroundColor={colors.white} marginBottom={16}>
				<ListOptionItem
					item={{
						title: Strings.t_title,
						onPress: () => setIsModalVisible(true),
						tagNew: {
							textProps: { color: colors.white },
							style: { backgroundColor: colors.actionColor },
						},
						hideChevron: true,
						rightSideContent: (
							<Row alignItems="center">
								<Body11 color={colors.actionDarkColor} marginRight={8} weight={500}>
									{displayOption?.reducedLabel?.toUpperCase() || displayOption?.label?.toUpperCase()}
								</Body11>
								<Icon name="chevron-right" color={colors.primaryDarker} size={21} />
							</Row>
						),
					}}
				/>
			</Container>

			<KyteModal
				bottomPage
				noPadding
				height="auto"
				isModalVisible={isModalVisible}
				hideModal={() => setIsModalVisible(false)}
				topRadius={12}
				title={Strings.t_title}
			>
				<Container borderTopWidth={1} borderColor={colors.disabledIcon} paddingBottom={16} paddingTop={16}>
					{pageOptions.map((item) => (
						<Margin key={item.type} bottom={5} horizontal={5}>
							<ListTileRadio
								title={{
									text: item.label,
									fontWeight: selectedOption === item.type ? 500 : 400,
									size: 14,
								}}
								subtitle={{
									text: item.type === 'Dashboard' ? Strings.t_dashboard_resume : undefined,
									fontWeight: selectedOption === item.type ? 500 : 400,
								}}
								borderBottomWidth={0}
								active={selectedOption === item.type}
								onPress={() => setSelectedOption(item.type)}
							/>
						</Margin>
					))}
				</Container>

				<BottomButton onPress={handleSaveInitialScreen} disabled={selectedOption === initialScreen}>
					{Strings.t_save}
				</BottomButton>
			</KyteModal>

			{Boolean(toast) && (
				<KyteNotifications
					notifications={[toast]}
					containerProps={{
						bottom: Platform.OS === 'android' ? insets.bottom + 30 : 0,
					}}
				/>
			)}
		</>
	)
}

const mapStateToProps = (state) => ({
	onboarding: state.onboarding.sample,
	initialRouteName: state.common.initialRouteName,
})

const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators({ setInitialRouteName }, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(InitialScreenSelector)
