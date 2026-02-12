import { IBenefits, IBilling, IConstraint, ICurrency, IPromotion, isFree, isPro } from '@kyteapp/kyte-utils';
import Share from 'react-native-share'
import { logEvent } from '../integrations';

export  const handleShareCoupon = async (
  { viewShotRef, message, where  }:
  { viewShotRef: any, message: string, where?: "detail" | "list" }
) => {
  try {
    const uri = await viewShotRef.current.capture();
    logEvent("Coupon Share", { where })
    await Share.open({
      title: '',
      message,
      url: uri,
      type: 'image/png',
    });
  } catch (error) {
    console.error("Share coupon error:", error);
  }
};

export const getCouponInfo = (currency: ICurrency, coupon?: IPromotion) => {
  const { 
    discount_type: benefitsDiscountType, 
    type: benefitsType, 
    value: benefitsValue, 
    max_discount: maxDiscount 
  } = coupon?.benefits?.[0] || {} as IBenefits
  const { value: contraintValue } = coupon?.constraints?.[0] || {} as IConstraint

  const isShippingCoupon = benefitsType === "shipping"
  const isPercentageCoupon = benefitsDiscountType === "percentage"
  const valueDescriptionAccordingType = `${isPercentageCoupon ? "" : currency.currencySymbol}${benefitsValue}${isPercentageCoupon ? '%' : ""}`
  const isToShowLimitOrMinimunValue = Boolean(maxDiscount && maxDiscount > 0) || Boolean(contraintValue && contraintValue > 0)

  return {
    isShippingCoupon,
    benefitsDiscountType,
    benefitsType,
    benefitsValue,
    isPercentageCoupon,
    valueDescriptionAccordingType,
    contraintValue,
    code: coupon?.code,
    maxDiscount,
    isToShowLimitOrMinimunValue
  }
}

export const getCouponDisabledInfo = (
  { promotions, billing, coupon }: 
  { promotions: IPromotion[], billing: IBilling, coupon: IPromotion }
) => {
  const isCouponActive = Boolean(coupon?.active)
  const hasAnyActivePromotion = promotions?.some(promotion => promotion.active) || false

  const isDisabledForFree = isFree(billing) && !isCouponActive
  const isDisabledForPro = isPro(billing) && !isCouponActive && hasAnyActivePromotion
  const isDisabled = isDisabledForFree || isDisabledForPro

  return isDisabled
}

export const getLastCreatedPromotion = (promotions: IPromotion[]) => {
  if (promotions?.length === 0) return undefined;

  const sorted = [...promotions]?.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return sorted?.[0];
}

export const isLastCreatedPromotion = (
  id: string,
  promotions: IPromotion[]
): boolean => {
  if (promotions?.length === 0) return false;

  const lastCreated = getLastCreatedPromotion(promotions);

  return lastCreated?._id === id;
}
