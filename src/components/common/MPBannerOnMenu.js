import React, { useState } from 'react'
import { Image } from 'react-native'
import { connect } from 'react-redux'
import { KyteButton, KyteText, Container, Padding, Margin } from '@kyteapp/kyte-ui-components'
import { colors } from '../../styles'
import { PaymentGatewayType, RemoteConfigDefaults } from '../../enums'
import { logEvent, remoteConfigGetValue } from '../../integrations'
import { mpMenuBanner } from '../../../assets/images'
import { checkIsBr } from '../../util'

const MPBannerOnMenu = ({ title, subtitle, buttonTitle, navigation, ...props }) => {
	const [bannerRemoteVisibility, setBannerRemoteVisibility] = useState(RemoteConfigDefaults.MPBannerOnMenu)
	remoteConfigGetValue('MPBannerOnMenu', (k) => setBannerRemoteVisibility(k), 'boolean')

	const MERCADO_PAGO_ONLINE_TYPE = PaymentGatewayType.items[PaymentGatewayType.MERCADO_PAGO_ONLINE].type
	const STRIPE_CONNECT_TYPE = PaymentGatewayType.items[PaymentGatewayType.STRIPE_CONNECT].type

	const { store } = props
	const isBrazil = checkIsBr()

	const checkoutGateways = store?.checkoutGateways || []
	const hasGateway =
		checkoutGateways.length > 0
			? checkoutGateways.find((c) => c.key === MERCADO_PAGO_ONLINE_TYPE || STRIPE_CONNECT_TYPE)
			: null
	const hasActiveGateway = !!hasGateway && hasGateway?.active

	return bannerRemoteVisibility && isBrazil && !hasActiveGateway ? (
		<Container>
			<Container alignItems="center" position="absolute" zIndex={1} height={30} top={20} left={0} right={0}>
				<Image style={styles.image} source={{ uri: mpMenuBanner }} />
			</Container>
			<Padding top={95} bottom={16} horizontal={16}>
				<Container flexDirection="column" backgroundColor={colors.secondaryGrey} borderRadius={8} alignItems="center">
					<Padding top={20} bottom={16} horizontal={12}>
						<KyteText style={{ textAlign: 'center' }} color={colors.white} weight={500} lineHeight={20} size={13}>
							{title}
						</KyteText>
						<KyteText style={{ textAlign: 'center' }} color={colors.white} weight={400} lineHeight={20} size={13}>
							{subtitle}
						</KyteText>
						<Container>
							<Margin top={12}>
								<Padding horizontal={0}>
									<KyteButton
										onPress={() => {
											navigation.navigate('Config', { screen: 'ConfigIntegratedPayments' })
											logEvent('Menu Banner Click', { content: 'payment_integration' })
										}}
										size="small"
										type="primary"
										textStyle={{ paddingHorizontal: 2 }}
									>
										<KyteText weight={500} size={12} textAlign="center">
											{buttonTitle}
										</KyteText>
									</KyteButton>
								</Padding>
							</Margin>
						</Container>
					</Padding>
				</Container>
			</Padding>
		</Container>
	) : null
}

const styles = {
	image: {
		resizeMode: 'contain',
		width: 83,
		height: 89,
	},
}

const mapStateToProps = (state) => {
	const { store } = state.auth

	return {
		store,
	}
}

export default connect(mapStateToProps)(MPBannerOnMenu)
