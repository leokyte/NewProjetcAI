import React, { useCallback, useEffect } from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'
import { requestTrackingPermission, requestNotificationPermission } from '../../util/util-permissions'

const PermissionsHandler = ({ isLogged }) => {
	// Requests iOS tracking permission when the app starts
	const requestiOSTrackingPermissionHandler = useCallback(() => {
		if (Platform.OS === 'ios') {
			requestTrackingPermission()
		}
	}, [])

	// Requests notification permission when user is logged in
	const requestNotificationPermissionHandler = useCallback(() => {
		if (isLogged) {
			requestNotificationPermission()
		}
	}, [isLogged])

	useEffect(() => {
		requestiOSTrackingPermissionHandler()
	}, [requestiOSTrackingPermissionHandler])
	useEffect(() => {
		requestNotificationPermissionHandler()
	}, [requestNotificationPermissionHandler])

	return null
}

const mapStateToProps = ({ auth }) => ({
	isLogged: auth.isLogged,
})

export default connect(mapStateToProps)(PermissionsHandler)
