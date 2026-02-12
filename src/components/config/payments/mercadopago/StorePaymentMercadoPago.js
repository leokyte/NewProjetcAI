import React, { Component } from 'react'
import { View, Text, Alert, Dimensions, Image, Linking } from 'react-native'
import { connect } from 'react-redux'
import { ActionButton, TextButton, DetailPage } from '../../../common'
import { colors, scaffolding, Type, colorSet } from '../../../../styles'
import { activateMercadoPago } from '../../../../stores/actions'
import I18n from '../../../../i18n/i18n'
import { PaymentMachineMercadoPago, PaymentMachineMercadoPagoOk } from '../../../../../assets/images'
import { logEvent } from '../../../../integrations'

class StorePaymentMercadoPago extends Component {
	static navigationOptions = () => ({
		header: null,
	})

	constructor(props) {
		super(props)

		this.state = {
			rightButtons: [
				{
					icon: 'trash',
					color: colors.secondaryBg,
					onPress: () => this.changeMercadoPagoStatus(false),
					iconSize: 20,
				},
			],
			cameFromConfig: true,
		}
	}

	componentDidMount() {
		logEvent('Card Reader Config View', { card_reader: 'mercado pago' })
	}

	changeMercadoPagoStatus(newStatus) {
		if (!newStatus) {
			return Alert.alert(I18n.t('words.s.attention'), I18n.t('paymentMachines.integration.mercadoPago.removePairing'), [
				{ text: I18n.t('alertDismiss') },
				{
					text: I18n.t('alertConfirm'),
					onPress: () => {
						this.props.activateMercadoPago(newStatus)
						logEvent('Card Reader Config Uninstall', { card_reader: 'mercado pago' })
					}
				},
			])
		}
		logEvent('Card Reader Config Complete', { card_reader: 'mercado pago' })
		this.props.activateMercadoPago(newStatus)
		this.setState({ cameFromConfig: false })
	}

	renderNotIntegratedContent() {
		const { topContainer, svgImage } = styles
		const { bottomContainer } = scaffolding

		return (
			<View style={{ flex: 1 }}>
				<View style={topContainer}>
					<Image style={svgImage} source={{ uri: PaymentMachineMercadoPago }} />

					<Text
						style={[
							Type.Regular,
							Type.fontSize(13),
							colorSet(colors.secondaryBg),
							{ textAlign: 'center', lineHeight: 20 },
						]}
					>
						{I18n.t('paymentMachines.integration.mercadoPago.explanationText')}
					</Text>

					<TextButton
						onPress={() => Linking.openURL('https://www.mercadopago.com/mp-brasil/point/lojas')}
						title={I18n.t('paymentMachines.integration.mercadoPago.dontHaveMachine')}
						color={colors.actionColor}
						style={[Type.SemiBold, { paddingTop: 20 }]}
						size={13}
					/>
				</View>

				<View style={bottomContainer}>
					<ActionButton
						onPress={() => {
							logEvent('Card Reader Config Start', { card_reader: 'mercado pago' })
							this.changeMercadoPagoStatus(true)
						}}
					>
						{I18n.t('paymentMachines.integration.startIntegrationButton')}
					</ActionButton>
				</View>
			</View>
		)
	}

	renderIntegratedContent() {
		const { pop } = this.props.navigation
		const { topContainer, infoStyle, svgImage } = styles
		const { bottomContainer } = scaffolding
		const { cameFromConfig } = this.state

		return (
			<View style={{ flex: 1 }}>
				<View style={topContainer}>
					<Image style={svgImage} source={{ uri: PaymentMachineMercadoPagoOk }} />

					<Text style={[infoStyle, { paddingTop: 20 }]}>
						{cameFromConfig
							? I18n.t('paymentMachines.integration.mercadoPago.successfulConnection')
							: I18n.t('paymentMachines.integration.mercadoPago.successfulConfig')}
					</Text>
				</View>
				<View style={bottomContainer}>
					<ActionButton cancel onPress={() => pop(2)}>
						{I18n.t('paymentMachines.integration.returnToSettings')}
					</ActionButton>
				</View>
			</View>
		)
	}

	render() {
		const { navigation, mercadoPago } = this.props
		const { rightButtons } = this.state

		return (
			<DetailPage
				pageTitle={I18n.t('paymentMachines.integration.mercadoPago.titleIntegration')}
				goBack={navigation.goBack}
				rightButtons={mercadoPago.isActivated ? rightButtons : null}
			>
				{mercadoPago.isActivated ? this.renderIntegratedContent() : this.renderNotIntegratedContent()}
			</DetailPage>
		)
	}
}

const styles = {
	topContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	infoStyle: [Type.SemiBold, Type.fontSize(18), colorSet(colors.secondaryBg), { textAlign: 'center' }],
	svgImage: {
		resizeMode: 'contain',
		width: Dimensions.get('window').width * 0.5,
		height: Dimensions.get('window').height * 0.35,
	},
}

const mapStateToProps = ({ externalPayments }) => {
	return { mercadoPago: externalPayments.mercadoPago }
}

export default connect(mapStateToProps, { activateMercadoPago })(StorePaymentMercadoPago)
