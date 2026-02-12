export interface SaveCouponPayload {
  code: string
  constraintValue?: number
  constraintMustHaveMaximum?: boolean,
  benefitsMaxDiscount?: boolean,
  benefitsMaxDiscountValue?: number,
  benefitsDiscountType?: string,
  benefitsValue?: number
}