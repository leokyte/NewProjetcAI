import React, { Component } from 'react'
import { View, ScrollView, Text, Platform, Easing, Animated, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import _ from 'lodash'
import { BleManager } from 'react-native-ble-plx'
import RNBluetoothClassic from 'react-native-bluetooth-classic'
import { AnimatedCircularProgress } from 'react-native-circular-progress'

import { colors, scaffolding } from '../../../styles'
import { setDevice } from '../../../stores/actions'
import { DetailPage, ListOptions, KyteIcon, ActionButton } from '../../common'
import I18n from '../../../i18n/i18n'
import { logEvent } from '../../../integrations'

class StorePrinter extends Component {
	static navigationOptions = () => ({
		header: null,
	})

	constructor(props) {
		super(props)
		this.state = {
			bleDevices: [],
			classicPairedDevices: [],
			classicUnpairedDevices: [],
			scanActive: true,
			fill: 0,
		}
		this.manager = new BleManager()
		this.spinValue = new Animated.Value(0)
		Animated.timing(this.spinValue, {
			toValue: 1,
			duration: 3000,
			easing: Easing.linear,
		}).start()
	}

	UNSAFE_componentWillMount() {
		const subscription = this.manager.onStateChange((state) => {
			if (state === 'PoweredOn') {
				this.scanAndList()
				subscription.remove()
			}
		}, true)
	}

	componentDidMount() {
		logEvent('Print Confirmed', null)
		this.circularProgress.animate(100, 6000, Easing.quad)
		Animated.loop(
			Animated.timing(this.spinValue, {
				toValue: 1,
				duration: 1000,
				easing: Easing.linear,
				useNativeDriver: true,
			})
		).start()
	}

	componentWillUnmount() {
		this.manager.stopDeviceScan()
		clearTimeout(this.timer)
		if (Platform.OS === 'android') {
			RNBluetoothClassic.cancelDiscovery().catch(() => {})
		}
	}

	async scanAndList() {
		let bleDevices = []
		let classicPairedDevices = []
		let classicUnpairedDevices = []

		if (Platform.OS === 'android') {
			try {
				const bondedDevices = await RNBluetoothClassic.getBondedDevices()
				if (bondedDevices.length > 0) {
					bondedDevices.forEach((device) => {
						const deviceId = device.address || device.id
						if (!deviceId) {
							return
						}
						const checkExistenceBle = _.find(bleDevices, (eachPrinter) => eachPrinter.id === deviceId)
						const checkExistenceClassicPaired = _.find(
							classicPairedDevices,
							(eachPrinter) => eachPrinter.id === deviceId
						)
						const checkExistenceClassicUnpaired = _.find(
							classicUnpairedDevices,
							(eachPrinter) => eachPrinter.id === deviceId
						)
						if (!checkExistenceBle && !checkExistenceClassicPaired && !checkExistenceClassicUnpaired && device.name) {
							classicPairedDevices.push({
								id: deviceId,
								name: device.name,
								type: 'classic',
							})
						}
					})
				}
				this.setState({ classicPairedDevices })
			} catch (error) {
				console.warn('Failed to list bonded Bluetooth devices', error)
			}

			try {
				await RNBluetoothClassic.cancelDiscovery().catch(() => {})
				const unpairedDevices = await RNBluetoothClassic.startDiscovery()
				if (unpairedDevices.length > 0) {
					unpairedDevices.forEach((device) => {
						const deviceId = device.address || device.id
						if (!deviceId || !device.name) {
							return
						}
						const checkExistenceBle = _.find(bleDevices, (eachPrinter) => eachPrinter.id === deviceId)
						const checkExistenceClassicPaired = _.find(
							classicPairedDevices,
							(eachPrinter) => eachPrinter.id === deviceId
						)
						const checkExistenceClassicUnpaired = _.find(
							classicUnpairedDevices,
							(eachPrinter) => eachPrinter.id === deviceId
						)
						if (!checkExistenceBle && !checkExistenceClassicPaired && !checkExistenceClassicUnpaired) {
							classicUnpairedDevices.push({
								id: deviceId,
								name: device.name,
								type: 'classic',
							})
						}
					})
				}
				this.setState({ classicUnpairedDevices })
			} catch (error) {
				console.warn('Failed to discover Bluetooth devices', error)
			} finally {
				this.spinValue.setValue(0)
				this.spinValue.stopAnimation()
			}
			return
		}

		this.manager.startDeviceScan(null, null, (error, device) => {
			const checkExistenceBle = _.find(bleDevices, (eachPrinter) => {
				return device && eachPrinter.id === device.id
			})
			const checkExistenceClassicPaired = _.find(classicPairedDevices, (eachPrinter) => {
				return device && eachPrinter.id === device.id
			})
			const checkExistenceClassicUnpaired = _.find(classicUnpairedDevices, (eachPrinter) => {
				return device && eachPrinter.id === device.id
			})
			if (
				!checkExistenceBle &&
				!checkExistenceClassicPaired &&
				!checkExistenceClassicUnpaired &&
				device &&
				device.name
			) {
				bleDevices.push({
					id: device.id,
					name: device.name,
					type: 'ble',
				})
			}
			this.setState({ bleDevices })
		})
	}

	pairWithDevice(device) {
		const { navigate } = this.props.navigation
		this.props.setDevice(device.id, device.name, device.type)
		const pairing = { id: device.id, name: device.name, type: device.type }
		navigate('StorePrinterConfirm', { pairing })
	}

	renderPrintersList() {
		const { bleDevices, classicPairedDevices, classicUnpairedDevices } = this.state
		const renderScrollView = (pages) => {
			return (
				<ScrollView>
					<ListOptions items={pages} />
				</ScrollView>
			)
		}
		const renderNegativeSearch = () => {
			const { topContainer, infoContainer, infoStyle } = styles
			const { bottomContainer } = scaffolding
			const { goBack } = this.props.navigation
			return (
				<View style={{ flex: 1 }}>
					<View style={{ flex: 1, justifyContent: 'center' }}>
						<View style={topContainer}>
							<KyteIcon name="warning" size={100} color={colors.warning} />
						</View>
						<View style={infoContainer}>
							<Text style={infoStyle}>{I18n.t('storePrinterNoPrinterFound')} :(</Text>
						</View>
					</View>
					<View style={bottomContainer}>
						<ActionButton onPress={() => goBack()}>{I18n.t('sumUp.integration.returnToSettings')}</ActionButton>
					</View>
				</View>
			)
		}

		let pages = []
		if (bleDevices.length > 0) {
			for (let i = 0; i < bleDevices.length; i++) {
				const eachPrinter = bleDevices[i]
				pages.push({
					title: eachPrinter.name,
					onPress: () => {
						this.pairWithDevice(eachPrinter)
					},
				})
			}
		}

		if (classicPairedDevices.length > 0) {
			for (let i = 0; i < classicPairedDevices.length; i++) {
				const eachPrinter = classicPairedDevices[i]
				pages.push({
					title: eachPrinter.name,
					onPress: () => {
						this.pairWithDevice(eachPrinter)
					},
				})
			}
		}

		if (classicUnpairedDevices.length > 0) {
			for (let i = 0; i < classicUnpairedDevices.length; i++) {
				const eachPrinter = classicUnpairedDevices[i]
				pages.push({
					title: eachPrinter.name,
					onPress: () => {
						this.pairWithDevice(eachPrinter)
					},
				})
			}
		}

		return pages.length > 0 ? renderScrollView(pages) : renderNegativeSearch()
	}

	renderScan() {
		const { topContainer, infoContainer, infoStyle } = styles
		this.timer = setTimeout(() => {
			this.manager.stopDeviceScan()
			this.setState({ scanActive: false })
			if (Platform.OS === 'ios') {
				this.spinValue.setValue(0)
				this.spinValue.stopAnimation()
			}
		}, 8000)

		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<View style={topContainer}>
					<AnimatedCircularProgress
						ref={(ref) => (this.circularProgress = ref)}
						size={110}
						width={3}
						fill={this.state.fill}
						tintColor={colors.actionColor}
						backgroundColor={colors.lightBg}
					>
						{(fill) => {
							return <KyteIcon name="search" size={40} color={colors.secondaryBg} />
						}}
					</AnimatedCircularProgress>
				</View>
				<View style={infoContainer}>
					<Text style={infoStyle}>{I18n.t('storePrinterLookingFor')}</Text>
				</View>
			</View>
		)
	}

	renderKyteIcon() {
		const { scanActive } = this.state
		const spin = this.spinValue.interpolate({
			inputRange: [0, 1],
			outputRange: ['360deg', '0deg'],
		})
		const btnAction = () => {
			if (!scanActive) {
				Animated.loop(
					Animated.timing(this.spinValue, {
						toValue: 1,
						duration: 1000,
						easing: Easing.linear,
						useNativeDriver: true,
					})
				).start()
				this.timer = setTimeout(() => {
					this.manager.stopDeviceScan()
					this.setState({ scanActive: false })
					if (Platform.OS === 'ios') {
						this.spinValue.setValue(0)
						this.spinValue.stopAnimation()
					}
				}, 8000)
				this.scanAndList()
			}
		}

		return (
			<Animated.View
				style={[
					{ transform: [{ rotate: spin }] },
					{ alignItems: 'center', justifyContent: 'center', marginRight: 15, marginTop: 3 },
				]}
			>
				<TouchableOpacity onPress={() => btnAction()} activeOpacity={0.8}>
					<KyteIcon name="refresh" size={24} color={colors.actionColor} />
				</TouchableOpacity>
			</Animated.View>
		)
	}

	render() {
		const { scanActive } = this.state
		const { goBack } = this.props.navigation

		return (
			<DetailPage
				pageTitle={I18n.t('configMenus.printer')}
				goBack={goBack}
				rightComponent={!scanActive ? this.renderKyteIcon() : null}
			>
				{scanActive ? this.renderScan() : this.renderPrintersList()}
			</DetailPage>
		)
	}
}

const styles = {
	topContainer: {
		flex: 0.4,
		justifyContent: 'center',
		alignItems: 'center',
	},
	infoContainer: {
		flex: 0.1,
		justifyContent: 'flex-start',
		paddingTop: 15,
	},
	infoStyle: {
		fontFamily: 'Graphik-Medium',
		fontSize: 15,
		textAlign: 'center',
		color: colors.primaryColor,
	},
	icon: {
		width: 110,
		height: 110,
		borderRadius: 100,
		backgroundColor: colors.actionColor,
		alignItems: 'center',
		justifyContent: 'center',
	},
}

export default connect(null, { setDevice })(StorePrinter)
