import React from "react"
import Container from "@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container"
import { KyteIcon } from "../../../common"
import { Image, View } from "react-native"
import VisaSVG from "../../../../../assets/images/payment-brands/visa"
import { MastercardImg } from "../../../../../assets/images/payment-brands/mastercard"
import { colors, colorsPierChart } from "../../../../styles"
import KyteText from "@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText"
import I18n from "../../../../i18n/i18n"
import { GooglePayImg } from "../../../../../assets/images/payment-brands/google-pay"
import { ApplePayImg } from "../../../../../assets/images/payment-brands/apple-pay"

export const ConfigOnlinePaymentsBrands = ({ isGatewayMP }: { isGatewayMP: boolean }) => {
  return(
    <View style={{ 
      flexDirection: "row", 
      flexWrap: 'wrap', 
      alignItems: "center", 
    }}>
      {isGatewayMP && 
        <Container justifyContent="center" backgroundColor={colorsPierChart[9]} borderRadius={4} padding={8} marginRight={4}>
          <KyteIcon name="pix-fill" color={colors.pixColor} />
        </Container>
      }
      <Container justifyContent="center" backgroundColor={colorsPierChart[9]} borderRadius={4} padding={8} marginRight={4} marginLeft={isGatewayMP ? 4 : 0}>
        <VisaSVG width={30} height={20} />
      </Container>
      <Container justifyContent="center" backgroundColor={colorsPierChart[9]} borderRadius={4} padding={8} marginRight={4} marginLeft={4}>
        <Image source={{ uri: MastercardImg, width: 30, height: 20 }} />
      </Container>
      <Image source={{ uri: ApplePayImg, width: 40, height: 36 }} style={{ marginRight: 4, marginLeft: 4, resizeMode: "contain" }} />
      <Container width={45} height={36} borderRadius={4} marginRight={4} marginLeft={4}>
        <Image source={{ uri: GooglePayImg }} style={{ width: 45, height: 36, resizeMode: "contain" }} />
      </Container>
      <Container 
        justifyContent="center" 
        height={28} 
        backgroundColor={colorsPierChart[9]} 
        borderRadius={4} 
        padding={4} 
        marginRight={4}  
        marginTop={isGatewayMP ? 8 : 2}
        marginLeft={isGatewayMP ? 0 : 4}
      >
        <KyteText weight={500} size={9}>
          {I18n.t("automaticPaymentsPage.mainBrands").toUpperCase()}
        </KyteText>
      </Container>
    </View>
  )
}