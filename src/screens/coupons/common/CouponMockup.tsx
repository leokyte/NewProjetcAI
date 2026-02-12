import React from "react"
import { Dimensions, View } from "react-native"
import KyteText from "@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText"
import { colorGrid, colors } from "../../../styles"
import I18n from "../../../i18n/i18n"
import { ICurrency, IPromotion, IStore } from "@kyteapp/kyte-utils"
import { CouponSVG } from "../../../../assets/images/coupons/coupon"
import Margin from "@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin"
import { getCouponInfo } from "../../../util/util-coupon"
import { connect } from "react-redux"
import CouponSubtitleInfo from "./CouponSubtitleInfo"

interface CouponMockupProps {
  coupon?: IPromotion
  store: IStore
  currency: ICurrency
  isToEdit?: boolean
  couponForm?: {
    type?: string
    benefitsCouponValue: number
    codeValue: string
    contraintValue?: number
    maxDiscount?: number
    isFromShippingCoupon?: boolean
    constraintMustHaveMaximum?: boolean
    benefitsMaxDiscount?: boolean
  }
}

const Strings = {
  CODE: I18n.t("coupons.code"),
  DISCOUNT: I18n.t("coupons.discountOnCartDetail"),
  COUPON_NAME: I18n.t("coupons.couponName")
}

const CouponMockup = ({
  coupon,
  couponForm,
  store,
  currency,
}: CouponMockupProps) => {
  const screenWidth = Dimensions.get('window').width

  const themeColor = colorGrid[store.catalog?.color || 0].foreground
  const mainThemeColor = store?.catalog?.themeColor 
    && Boolean(Number(store.catalog?.themeColor))
   ? themeColor : store.catalog?.themeColor

  const { code } = getCouponInfo(currency, coupon)
  const placeholder = Strings.COUPON_NAME.toUpperCase().replace(/\s+/g, '');

  const isIPad = screenWidth > 600
  const iPadWidth = 400
  const smartphoneWidth = screenWidth - 30

  return (
    <View style={styles.shadowWrapper}>
      <CouponSVG 
        color={colors.white} 
        sideColor={mainThemeColor} 
        sideWidth={isIPad ? 80 : 50} 
        width={isIPad ? iPadWidth : smartphoneWidth} 
      />

      {/* coupon content */}
      <View style={styles.contentOverlay}>
        <View style={styles.codeContainer(mainThemeColor ?? "")}>
          <KyteText
            size={15.5}
            weight={700}
            color={mainThemeColor}
            style={styles.codeText}
          >
            {code || couponForm?.codeValue || placeholder}
          </KyteText>
        </View>

        <Margin top={12} />

        <CouponSubtitleInfo 
          coupon={coupon}
          couponForm={couponForm} 
        />
      </View>
    </View>
  )
}

const styles = {
  shadowWrapper: {
    alignSelf: "center",
    position: "relative",
    backgroundColor: "transparent",
    borderRadius: 16,
  },
  codeText: {
    textAlign: "center",
    flexWrap: "nowrap",
  },
  contentOverlay: {
    position: "absolute",
    top: 0,
    left: 30,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  codeContainer: (themeColor: string) => ({
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: themeColor,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 20,
    textAlign: "center",
  }),
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 1,
    marginHorizontal: 6,
    marginVertical: 6,
  },
  text: {
    marginLeft: 6,
    textAlign: "center",
  },
}

export default connect(({ auth, preference }) => ({
  currency: preference.account.currency,
  store: auth.store
}))(CouponMockup)