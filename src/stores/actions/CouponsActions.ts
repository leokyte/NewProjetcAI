import { BenefitsType, DiscountType, IBilling, IPromotion, isFree, isPro } from "@kyteapp/kyte-utils"
import { AnalyticsPromotionsProps, CreatePromotionProps, EditPromotionsProps, kyteAnalyticsPromotions, kyteCreatePromotion, kyteEditPromotion, kyteListPromotions, ListPromotionsProps } from "../../services"
import { startLoading, stopLoading } from "./CommonActions"
import { PROMOTION_CREATE, PROMOTION_EDIT, PROMOTION_LIST } from "./types"
import { logEvent } from "../../integrations"

export const createPromotion = (
  data: CreatePromotionProps, 
  callback: (value?: any) => void
) => async (dispatch: any) => {
  dispatch(startLoading())

  try {
    const res = await kyteCreatePromotion({ ...data })
    const promotion = res?.data
    dispatch({ type: PROMOTION_CREATE, payload: promotion })

    const coupon = promotion?.data
    const couponDiscountType = 
      coupon?.benefits[0]?.discount_type === DiscountType.PERCENTAGE 
      ? `${DiscountType.PERCENTAGE} discount` : `${DiscountType.FIXED} discount`
    const couponType = coupon?.benefits[0]?.type === BenefitsType.SHIPPING
      ? "free shipping" : couponDiscountType 

    logEvent("Coupon Create", {
      couponCode: coupon.code,
      couponType,
      coupon_object: promotion.data
    })
    if (callback) callback()
  } catch (e) {
    if (callback) callback('error')
  } finally {
    dispatch(stopLoading())
  }
}

export const listPromotion = (data: ListPromotionsProps, callback: (value?: any) => void) => async (dispatch: any) => {
  try {
    const res = await kyteListPromotions(data)
    const promotion = res.data
    dispatch({ type: PROMOTION_LIST, payload: promotion })

    if (callback) callback()
  } catch (e) {
    logEvent("Coupon List View Error", { error: e })
    if (callback) callback('error')
  } finally {
    dispatch(stopLoading())
  }
}

export const editPromotion = (data: EditPromotionsProps, callback?: (value?: any) => void) => async (dispatch: any) => {
  dispatch(startLoading())

  try {
    const res = await kyteEditPromotion(data)
    const promotion = res.data
    dispatch({ type: PROMOTION_EDIT, payload: promotion })

    if (callback) callback()
  } catch (e) {
    if (callback) callback('error')
  } finally {
    dispatch(stopLoading())
  }
}

export const getAnalyticsPromotion = (values: AnalyticsPromotionsProps) => async () => {
  try {
    const res = await kyteAnalyticsPromotions(values)
    const { data } = res
    return data
  } catch (e) {
    console.log(e)
    return undefined
  }
}
