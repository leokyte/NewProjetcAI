import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { isFree, isPro, isGrow, isPrime, PLAN_FREE, PLAN_PRO, PLAN_GROW, PLAN_PRIME } from '@kyteapp/kyte-ui-components'

import {
	userUpdateDetail,
	updateMultiUser,
	cleanUserForm,
	salesSetFilter,
	ordersSetFilter,
	salesClear,
	salesClearFilter,
	ordersClearFilter,
	openModalWebview,
} from '../../stores/actions'
import { KyteToolbar, KyteList, SearchBar, LoadingCleanScreen, KyteSafeAreaView } from '../common'
import { generateDefaultPROFeatures, getPROFeature, checkUserPermission } from '../../util'
import I18n from '../../i18n/i18n'
import { colors, scaffolding, Type } from '../../styles'
import CreatePasswordHelper from './helpers/CreatePasswordHelper'
import { logEvent } from '../../integrations/Firebase-Integration'

const UsersList = ({ navigation, auth, isFocused, loader, isOnline, filterSales, filterOrders, billing, ...props }) => {
	const [isSearchBarVisible, setIsSearchBarVisible] = useState(false)
	const [users, setUsers] = useState(auth.multiUsers || [])
	const [searchTerm, setSearchTerm] = useState('')
	const [lastEditUserClick, setLastEditUserClick] = useState(new Date('1999'))
	const [userLimit, setUserLimit] = useState(generateDefaultPROFeatures('PROUserLimit'))

	const { permissions, psw } = auth.user
	const isAdmin = permissions && (permissions.isOwner || permissions.isAdmin)
	const hasntPassword = isAdmin && isFocused && !psw

	useEffect(() => {
		const hasOnlyOneUser = Boolean(users.length === 1)
		logEvent('User List View', { is_empty: hasOnlyOneUser })
	}, [])

	const toggleSearch = () => {
		setIsSearchBarVisible(!isSearchBarVisible)

		if (isSearchBarVisible) {
			setUsers(auth.multiUsers || [])
			setSearchTerm('')
		}
	}

	const searchUsersByTerm = (text) => {
		setSearchTerm(text)
	}

	const closeSearch = () => {
		toggleSearch()
		searchUsersByTerm('')
	}

	const trackUserViewEvent = (user) => {
		const { isAdmin: isAdminUser, isOwner } = checkUserPermission(user.permissions)
		let userType = ''

		if (isOwner) {
			userType = 'owner'
		} else if (isAdminUser && !isOwner) {
			userType = 'admin'
		} else {
			userType = 'regular'
		}

		logEvent('User View', { user_type: userType })
	}

	const verifyConnection = (goToNavigate, params = null) => {
		const { navigate } = navigation

		if (!isOnline) {
			return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: I18n.t('alertOk') }])
		}

		props.cleanUserForm().then(() => {
			props.salesClear()
			props.salesClearFilter()
			props.ordersClearFilter()

			props.userUpdateDetail(params && params.user ? params.user : null)
			if (params && params.user) {
				props.salesSetFilter([...filterSales.users, params.user], 'users')
				props.ordersSetFilter([...filterOrders.users, params.user], 'users')
			}

			if (goToNavigate === 'UserEdit') {
				trackUserViewEvent(params?.user)
			}

			navigate(goToNavigate, params)
		})
	}

	const findUser = (multiUsers, uid) => {
		return _.find(multiUsers, (eachUser) => {
			return eachUser.uid === uid
		})
	}

	const editUser = ({ uid }) => {
		if (new Date().getTime() <= lastEditUserClick.getTime() + 1000) return

		setLastEditUserClick(new Date())

		if (permissions && (permissions.isAdmin || permissions.isOwner) && !psw) {
			return verifyConnection('UserConfirmPassword', {
				origin: 'users-list',
				showLoading: true,
				user: auth.user,
			})
		}

		const user = findUser(auth.multiUsers, uid)
		if (permissions.isAdmin || permissions.isOwner) {
			return verifyConnection('UserEdit', { user })
		}
	}

	const renderUsersListHelper = () => {
		return <CreatePasswordHelper onPress={() => editUser(auth.user.uid)} />
	}

	const goToUserAdd = () => {
		if (new Date().getTime() <= lastEditUserClick.getTime() + 1000) return

		setLastEditUserClick(new Date())

		const ownerHavePassword = () => {
			return _.find(auth.multiUsers, (eachUser) => {
				return eachUser.permissions && eachUser.permissions.isOwner && eachUser.psw
			})
		}

		if (ownerHavePassword()) {
			props.userUpdateDetail(null)
			verifyConnection('UserAdd')
		} else {
			Alert.alert(I18n.t('userAlertNeedCreatePasswordTitle'), I18n.t('userAlertNeedCreatePasswordMsg'), [
				{ text: I18n.t('alertOk') },
			])
		}
	}

	const addUser = () => {
		const verifyPlan = (plan) => {
			return auth.multiUsers.length >= userLimit.innerFeatures.find((i) => i.plan === plan).limit
		}

		if (
			(isFree(billing) && verifyPlan(PLAN_FREE)) ||
			(isPro(billing) && verifyPlan(PLAN_PRO)) ||
			(isGrow(billing) && verifyPlan(PLAN_GROW)) ||
			(isPrime(billing) && verifyPlan(PLAN_PRIME))
		) {
			props.openModalWebview(userLimit.infoURL)
			logEvent('User Add Attempt')
			return
		}

		goToUserAdd()
	}

	const renderUserList = () => {
		const rightContentLabel = (eachUser) => {
			const eachUserIsAdmin = eachUser.permissions && (eachUser.permissions.isOwner || eachUser.permissions.isAdmin)
			if (eachUserIsAdmin && eachUser.psw) {
				return 'Admin'
			}
			if (eachUserIsAdmin && !eachUser.psw) {
				return isAdmin && isFocused && !psw ? '--' : I18n.t('userHelperPasswordLabel')
			}
			return null
		}

		const rightContentStyle = (eachUser) => {
			const eachUserIsAdmin = eachUser.permissions && (eachUser.permissions.isOwner || eachUser.permissions.isAdmin)
			if (eachUserIsAdmin && eachUser.psw) {
				return { color: colors.secondaryColor }
			}
			if (eachUserIsAdmin && !eachUser.psw) {
				return { fontFamily: Type.Medium, color: colors.actionColor }
			}
		}

		const data = []
		if (users) {
			users.forEach((eachUser) => {
				if (searchTerm && !eachUser.displayName.includes(searchTerm) && !eachUser.email.includes(searchTerm)) {
					return
				}

				data.push({
					title: eachUser.displayName,
					subtitle: eachUser.email,
					leftContent: eachUser.displayName,
					rightContent: rightContentLabel(eachUser),
					rightContentStyle: rightContentStyle(eachUser),
					uid: eachUser.uid,
					active: eachUser.active,
				})
			})
		}

		return <KyteList data={data} onItemPress={(i) => editUser({ uid: i.uid })} />
	}

	const getPROFeatures = async () => {
		const newUserLimit = await getPROFeature('PROUserLimit')
		newUserLimit && setUserLimit(newUserLimit)
	}

	useEffect(() => {
		setUsers(auth.multiUsers)
	}, [auth.multiUsers])

	useEffect(() => {
		if (permissions && (permissions.isAdmin || permissions.isOwner) && psw) {
			props.updateMultiUser(true)
		}
		getPROFeatures()
	}, [])

	return (
		<KyteSafeAreaView style={scaffolding.outerContainer}>
			<KyteToolbar
				borderBottom={1.5}
				headerTitle={I18n.t('sideMenu.users')}
				rightButtons={[
					{
						icon: 'plus-calculator',
						color: colors.actionColor,
						onPress: () => addUser(),
						iconSize: 18,
					},
				]}
				navigate={navigation.navigate}
				navigation={navigation}
			/>
			<SearchBar
				isOpened={isSearchBarVisible}
				openedPlaceholder={I18n.t('userSearchPlaceholderActive')}
				closedPlaceholder={I18n.t('userSearchPlaceholder')}
				toggleSearch={() => toggleSearch()}
				closeSearchAction={() => closeSearch()}
				searchAction={() => searchUsersByTerm()}
			/>
			{renderUserList()}
			{hasntPassword && renderUsersListHelper()}

			{loader.visible && <LoadingCleanScreen />}
		</KyteSafeAreaView>
	)
}

const mapStateToProps = ({ auth, common, sales, billing }) => ({
	auth,
	loader: common.loader,
	isOnline: common.isOnline,
	filterSales: sales.filterSales,
	filterOrders: sales.filterOrders,
	billing,
})

const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators(
		{
			userUpdateDetail,
			updateMultiUser,
			cleanUserForm,
			salesSetFilter,
			ordersSetFilter,
			salesClear,
			salesClearFilter,
			ordersClearFilter,
			openModalWebview,
		},
		dispatch
	),
})

export default connect(mapStateToProps, mapDispatchToProps)(UsersList)
