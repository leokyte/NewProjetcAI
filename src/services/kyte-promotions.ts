import { IBenefits, IConstraint, IPromotion, PromotionTrigger } from "@kyteapp/kyte-utils";
import { apiPromotionGateway, apiWebGateway } from "./kyte-api-gateway"

export interface CreatePromotionProps {
  code: string;
  active?: boolean;
  deleted?: false;
  benefits?: IBenefits[];
  constraints?: IConstraint[];
  aid: string;
  uid: string;
}

export interface ListPromotionsProps {
  aid: string;
  page?: number;
  limit?: number;
}

export interface EditPromotionsProps {
  coupon: IPromotion
  aid: string
  uid: string
  id: string
  isToDelete?: boolean
}

export interface AnalyticsPromotionsProps {
  couponId: string
  aid: string
}

export const kyteCreatePromotion = ({
  code,
  benefits,
  constraints,
  aid,
  uid
}: CreatePromotionProps) => apiPromotionGateway.post('/promotions',
	{ 
    code,
    name: code,
    trigger: PromotionTrigger.MANUAL,
    benefits,
    constraints
	},
  {
    headers: {
      uid,
      aid,
    },
  }
)

export const kyteEditPromotion = ({
  coupon,
  aid,
  uid,
}: EditPromotionsProps) => apiPromotionGateway.put(`/promotions/${coupon._id}`,
	{ ...coupon },
  {
    headers: {
      uid,
      aid,
    },
  }
)

export const kyteListPromotions = ({
  aid,
  page,
  limit = 100
}: ListPromotionsProps) => apiPromotionGateway.get('/promotions', {
  params: {
    aid,
    page,
    limit
  }
})

export const kyteAnalyticsPromotions = ({
  aid,
  couponId,
}: AnalyticsPromotionsProps) => apiWebGateway.get(`/stats/coupon/${aid}`, {
  params: {
    couponId
}})
