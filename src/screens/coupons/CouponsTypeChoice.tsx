import React, { useEffect } from 'react'
import { connect } from "react-redux"
import { DetailPage, KyteIcon, KyteText, TextButton } from "../../components/common"
import { colors, colorsPierChart } from '../../styles'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import I18n from '../../i18n/i18n'
import { Platform, TouchableOpacity } from 'react-native'
import { logEvent } from '../../integrations'

const Strings = {
  PAGE_TITLE: I18n.t("coupons.typeChoiceTitle"),
  SHIPPING_COUPON: I18n.t("freeShipping"),
  DISCOUNT_COUPON: I18n.t("words.s.discount"),
}

type CouponButtonType = {
	title: string
	icon: string
	onPress: () => void
	iconStyle?: object
}

const CouponsTypeChoice = ({ ...props }) => {
  const { navigation } = props

	const couponsTypes: CouponButtonType[] = [
		{
			title: Strings.SHIPPING_COUPON,
			icon: "truck",
			onPress: () => navigation.navigate('CouponsShippingCreate'),
			iconStyle: { transform: [{ scaleX: -1 }] }
		},
		{
			title: Strings.DISCOUNT_COUPON,
			icon: "discount",
			onPress: () => navigation.navigate('CouponsDiscountCreate')
		},
	]

	useEffect(() => {
		logEvent('New Coupon Benefit View')
	}, [])

  return(
    <DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()} style={styles.pageStyle}>
			<Container flex={1} flexDirection='column' alignItems='center' padding={16}>
				<Row>
					{couponsTypes.map((couponType, index) => (
						<TouchableOpacity onPress={couponType.onPress}>
							<Container 
								key={index} 
								flexDirection='column'
								backgroundColor={colors.white}
								padding={16}
								borderWidth={1}
								borderRadius={8}
								height={92}
								alignItems='center'
								justifyContent='center'
								minWidth={173}
								marginLeft={index === couponsTypes.length - 1 ? 16 : 0}
							>
								<Container alignItems='center' justifyContent='center'>
									<KyteIcon name={couponType.icon} size={18} style={couponType.iconStyle} />
									<Margin top={Platform.OS === 'ios' ? 16 : 12} />
									<KyteText lineThrough={undefined} weight="Medium" size={16} pallete="primaryDarker">
										{couponType.title}
									</KyteText>
								</Container>
							</Container>
						</TouchableOpacity>
					))}
				</Row>
			</Container>
    </DetailPage>
  )
}

const styles = {
	buttonStyle: {
		backgroundColor: colors.white,
		padding: 16,
		borderWidth: 1,
		borderColor: colors.primaryDarker,
		borderRadius: 8,
		height: 92,
		alignItems: 'center'
	},
	pageStyle: {
		backgroundColor: colorsPierChart[9]
	},
	textButtonStyle: {
		width: '100%',
		height: '100%',
		backgroundColor: 'blue',
		display: 'flex',
		flex: 1
	}
}

export default connect()(CouponsTypeChoice)