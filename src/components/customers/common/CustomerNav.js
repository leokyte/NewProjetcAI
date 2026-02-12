import React from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'
import NavigationService from '../../../services/kyte-navigation'
import { customerDetailCreate, checkUserReachedLimit } from '../../../stores/actions'
import { KyteToolbar, KyteSafeAreaView } from '../../common'
import { checkUserPermission } from '../../../util'
import I18n from '../../../i18n/i18n'
import { colors } from '../../../styles'
import { requestPermission } from '../../../util/util-permissions'
import { CONTACTS, CustomerPagesEnum } from '../../../enums'

const CustomerNav = ({
	user,
	customers,
	navigation,
	userHasReachedLimit,
	checkUserReachedLimit: checkUserReachedLimitAction,
	customerDetailCreate: customerDetailCreateAction,
	testProps,
}) => {
	const { isAdmin, isOwner } = checkUserPermission(user.permissions)
	const hasPermission = (isAdmin || isOwner) && user.authVerified

	const rightButtons = [
		{
			icon: 'export',
			onPress: () => navigation.navigate('DataExport', { selected: { customers: true } }),
			color: colors.primaryColor,
			isHidden: !hasPermission,
		},
		{
			icon: 'import',
			color: colors.secondaryBg,
			onPress: () => headerButtonAction(CustomerPagesEnum.IMPORT),
			iconSize: 20,
		},
		{
			icon: 'plus-calculator',
			color: colors.actionColor,
			onPress: () => headerButtonAction(CustomerPagesEnum.CREATE),
			iconSize: 18,
		},
	]

	const handleUserLimitReached = () => {
		NavigationService.navigate('Confirmation', 'SendCode', {
			origin: 'user-blocked',
			previousScreen: 'Customers',
		})
	}

	const headerButtonAction = async (page) => {
		const { navigate } = navigation

		if (page === CustomerPagesEnum.IMPORT) {
			const hasContactsPermission = await requestPermission(CONTACTS)
			if (!hasContactsPermission) return
		}

		checkUserReachedLimitAction()
		if (userHasReachedLimit) {
			handleUserLimitReached()
			return
		}

		customerDetailCreateAction()
		navigate({ key: `${page}Page`, name: page })
	}

	return (
		<KyteToolbar
			borderBottom={0}
			headerTitle={`${I18n.t('sideMenu.customers')} (${customers.length})`}
			rightButtons={customers.length ? rightButtons : []}
			navigate={navigation.navigate}
			navigation={navigation}
			testProps={testProps}
		/>
	)
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
	customers: state.customers.list,
	userHasReachedLimit: state.common.userHasReachedLimit,
})

export default connect(mapStateToProps, { customerDetailCreate, checkUserReachedLimit })(CustomerNav)
