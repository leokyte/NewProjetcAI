import React from "react"
import Row from "@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row"
import { CurrencyText, KyteIcon } from "../../../components/common"
import KyteText from "@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText"
import I18n from "../../../i18n/i18n"
import { getCouponInfo } from "../../../util/util-coupon"
import { connect } from "react-redux"
import { DiscountType, ICurrency, IPromotion } from "@kyteapp/kyte-utils"
import { View } from "react-native"
import { colors } from "../../../styles"

interface CouponSubtitleInfoProps {
  currency: ICurrency
  coupon?: IPromotion
  couponForm?: {
    isShippingCouponForm: boolean
    type?: string
    benefitsCouponValue: number
    contraintValue?: number
    maxDiscount?: number
    constraintMustHaveMaximum?: boolean
    benefitsMaxDiscount?: boolean
  }
}

const Strings = {
  LIMIT: I18n.t("coupons.maxDiscount"),
  MINIMUN_VALUE: I18n.t("coupons.startingFrom"),
  SHIPPING_COUPON: I18n.t("freeShipping"),
  DISCOUNT_COUPON: I18n.t("coupons.discountOnCart"),
}

const CouponSubtitleInfo = ({ currency, coupon, couponForm }: CouponSubtitleInfoProps) => {
  const {
    isShippingCoupon,
    isPercentageCoupon,
    contraintValue,
    maxDiscount,
    benefitsValue,
    isToShowLimitOrMinimunValue
  } = getCouponInfo(currency, coupon)

  const isToShowLimit = (isPercentageCoupon && !isShippingCoupon) || 
    (!couponForm?.isShippingCouponForm && couponForm?.type === DiscountType.PERCENTAGE)
  
  const isToShowMaxForm = (Boolean(couponForm?.maxDiscount && couponForm?.maxDiscount > 0) && couponForm?.benefitsMaxDiscount)
  const isToShowMinForm = Boolean(couponForm?.contraintValue && couponForm?.contraintValue > 0) && couponForm?.constraintMustHaveMaximum
  const isToShowLimitOrMinimunValueForm =  isToShowMaxForm || isToShowMinForm 

  return(
    <View>
      <Row alignItems="center" justifyContent="center" style={styles.row}>
        {isShippingCoupon || couponForm?.isShippingCouponForm  ? (
          <>
            <KyteIcon name="truck" size={16} style={{ transform: [{ rotateY: '180deg' }] }} />
            <KyteText size={12} style={styles.text} weight={500}>
              {Strings.SHIPPING_COUPON}
            </KyteText>
          </>
        ) : (
          <>
            <KyteIcon name="discount" size={16} />
            <KyteText size={12} style={styles.text} weight={500}>
              {coupon ? (
                <>
                  {isPercentageCoupon ? 
                    <KyteText size={12} weight={500}>{`${benefitsValue}%`}</KyteText>
                    : <CurrencyText value={benefitsValue} />
                  }
                </>
              ) : (
                couponForm?.benefitsCouponValue && (
                  couponForm?.type === DiscountType.PERCENTAGE ? 
                    <KyteText size={12} weight={500}>{`${couponForm?.benefitsCouponValue}%`}</KyteText>
                    : <CurrencyText value={couponForm?.benefitsCouponValue} />
                )
              )}
              {` ${couponForm?.isShippingCouponForm ? Strings.SHIPPING_COUPON : Strings.DISCOUNT_COUPON}`}
            </KyteText>
          </>
        )}
      </Row>
      {(isToShowLimitOrMinimunValue || isToShowLimitOrMinimunValueForm) && (
        <Row alignItems="center" justifyContent="center" style={styles.row}>
          <KyteIcon name="dollar-sign" size={16} />
          <KyteText size={12} style={styles.text}>
            {isToShowLimit ? Strings.LIMIT : Strings.MINIMUN_VALUE}{" "}
            <CurrencyText 
              value={isToShowLimit ? maxDiscount || couponForm?.maxDiscount : contraintValue || couponForm?.contraintValue} 
              style={{ fontSize: 12, fontWeight: '500', color: colors.primaryBlack }} 
            />
          </KyteText>
        </Row>
      )}
    </View>

  )
}

const styles = {
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
  infoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
}

export default connect(({ preference }) => ({
  currency: preference.account.currency,
}))(CouponSubtitleInfo)