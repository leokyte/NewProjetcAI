import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Linking, Platform, ScrollView } from 'react-native'
import _ from 'lodash'

import { KyteIcon, KyteModal, ListOptions, CenterContent, KyteText } from '../../common'
import { Type, colorSet, colors, scaffolding } from '../../../styles'
import I18n from '../../../i18n/i18n'
import { avoidDoubleClick } from '../../../util'

class DetailCustomer extends Component {
	constructor(props) {
		super(props)

		this.state = {
			isMapsSelectorVisible: false,
		}
	}

	_onPressIcon(linkingURL) {
		if (linkingURL) Linking.openURL(linkingURL)
	}

	renderClientName() {
		const { customer } = this.props
		return (
			<View style={{ marginTop: 10 }}>
				<Text style={[Type.Light, colorSet(colors.secondaryBg), { fontSize: 28 }]}>{customer.name}</Text>
			</View>
		)
	}

	renderGoToClient() {
		return (
			<TouchableOpacity onPress={() => avoidDoubleClick(() => this.props.goToCustomer())}>
				<View style={{ backgroundColor: '#FFFFFF', marginTop: 15 }}>
					<Text
						style={[
							Type.Medium,
							colorSet(colors.actionColor),
							{ fontSize: 14, paddingHorizontal: 20, paddingVertical: 20 },
						]}
					>
						{I18n.t('goToCustomer')}
					</Text>
				</View>
			</TouchableOpacity>
		)
	}

	renderGuestCustomerInfo() {
		return (
			<CenterContent backgroundColor={colors.primaryDarker}>
				<KyteText color="white" size={15} weight="Semibold">
					{I18n.t('guestCustomerInfo')}
				</KyteText>
			</CenterContent>
		)
	}

	renderIcons() {
		const { customer, shippingFee } = this.props
		const { bottomIconsWrapperText, shippingFeeContainer } = styles
		const whatsApp = customer.celPhone ? `+${customer.celPhone.replace(' ', '').replace('+', '')}` : null

		const renderShippingFee = () => (
			<View style={shippingFeeContainer}>
				<KyteText>
					{`${I18n.t('words.s.delivery')}: `}
					<KyteText weight="Medium">{shippingFee.name}</KyteText>
				</KyteText>
			</View>
		)

		const renderAddress = () => (
			<View>
				<Text style={[bottomIconsWrapperText, Type.Regular, { paddingTop: 15 }]}>{customer.address}</Text>
				{customer.addressComplement ? (
					<Text style={[bottomIconsWrapperText, Type.Regular, { paddingTop: 15 }]}>{customer.addressComplement}</Text>
				) : null}
			</View>
		)
		const renderIconContainer = (iconName, label, value, linkingURL = '', index, isLastItem, customAction) => (
			<TouchableOpacity key={index} onPress={customAction || (() => this._onPressIcon(linkingURL))}>
				<View style={[styles.bottomIconWrapper, { borderBottomWidth: isLastItem ? 0 : 1 }]}>
					<View style={{ flex: 1, paddingHorizontal: 20, flexDirection: 'row' }}>
						<KyteIcon name={iconName} color={colors.secondaryBg} size={18} />
						<View style={{ flexDirection: 'column', flex: 1 }}>
							<Text style={bottomIconsWrapperText}>{label}</Text>
							{value ? renderAddress(value) : null}
						</View>
					</View>
					{shippingFee && iconName === 'pin' ? renderShippingFee() : null}
				</View>
			</TouchableOpacity>
		)

		const geolocationSchema = () => {
			const schema = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' })
			return schema + customer.address
		}

		const renderIcons = () => {
			const icons = [
				{
					type: 'whatsapp',
					text: I18n.t('customerButtonsOptions.whatsapp'),
					url: `https://wa.me/${whatsApp}`,
					hasValue: !!customer.celPhone,
				},
				{
					type: 'phone',
					text: customer.phone ? `${I18n.t('customerButtonsOptions.phoneLabel')} ${customer.phone}` : null,
					url: `tel://${customer.phone}`,
					hasValue: !!customer.phone,
				},
				{
					type: 'pin',
					text: I18n.t('customerButtonsOptions.addressLabel'),
					value: customer.address,
					url: geolocationSchema(),
					hasValue: !!customer.address,
					customAction: () => this.setState({ isMapsSelectorVisible: true }),
				},
			]
			const actionIcons = _.filter(icons, (icon) => icon.hasValue)
			return _.map(actionIcons, (icon, index) =>
				renderIconContainer(
					icon.type,
					icon.text,
					icon.value,
					icon.url,
					index,
					index === actionIcons.length - 1,
					icon.customAction
				)
			)
		}

		return <View style={styles.bottomIcons}>{renderIcons()}</View>
	}

	renderMapsSelector() {
		const { customer } = this.props
		const options = [
			{
				title: 'Google Maps',
				onPress: () => {
					this.setState({ isMapsSelectorVisible: false })
					Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURI(customer.address)}`)
				},
			},
			{
				title: 'Waze',
				onPress: () => {
					this.setState({ isMapsSelectorVisible: false })
					Linking.openURL(`https://waze.com/ul?q=${encodeURI(customer.address)}`)
				},
			},
		]

		return (
			<KyteModal
				title={I18n.t('customerMapsSelectorTitle')}
				bottomPage
				height="auto"
				isModalVisible
				hideModal={() => this.setState({ isMapsSelectorVisible: false })}
			>
				<View>
					<ListOptions items={options} hideChevron />
				</View>
			</KyteModal>
		)
	}

	render() {
		const { inputContainer, customerName } = styles
		const { customer, saleCustomer } = this.props
		const { bottomContainer } = scaffolding
		const { isMapsSelectorVisible } = this.state

		return (
			<View style={inputContainer}>
				<ScrollView>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							paddingVertical: 20,
							paddingHorizontal: 20,
							backgroundColor: '#FFFFFF',
						}}
					>
						<KyteIcon name="person" size={30} color={colors.secondaryBg} />
						<View style={{ flex: 1 }}>
							<Text style={customerName}>{customer.name}</Text>
						</View>
					</View>
					{this.renderIcons()}
				</ScrollView>
				<View style={bottomContainer}>
					{saleCustomer?.isGuest || saleCustomer?.isGuest === null
						? this.renderGuestCustomerInfo()
						: this.renderGoToClient()}
				</View>
				{isMapsSelectorVisible ? this.renderMapsSelector() : null}
			</View>
		)
	}
}

const styles = {
	inputContainer: {
		height: '100%',
		backgroundColor: colors.lightBg,
	},
	bodyInfo: {
		paddingVertical: 10,
		paddingHorizontal: 15,
	},
	bottomIcons: {
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
	},
	bottomIconWrapper: {
		width: '100%',
		flexDirection: 'column',
		borderColor: colors.borderlight,
		paddingVertical: 20,
	},
	bottomIconsWrapperText: [
		Type.Medium,
		Type.fontSize(13),
		colorSet(colors.primaryBg),
		{ lineHeight: 16, paddingHorizontal: 10 },
	],
	customerName: [
		Type.Light,
		colorSet(colors.secondaryBg),
		Type.fontSize(30),
		{
			paddingLeft: 10,
			...Platform.select({ ios: { paddingTop: 10 } }),
		},
	],
	shippingFeeContainer: {
		marginTop: 10,
		marginHorizontal: 25,
		padding: 15,
		backgroundColor: colors.lightBg,
		borderRadius: 5,
	},
}

export default DetailCustomer
