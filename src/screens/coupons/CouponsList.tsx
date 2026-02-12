import { IBilling, IPromotion, isPro } from "@kyteapp/kyte-utils"
import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { DetailPage, LoadingCleanScreen } from "../../components/common"
import { colorsPierChart } from "../../styles"
import CouponListItem from "./common/CouponListItem"
import Margin from "@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin"
import Container from "@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container"
import colors from "@kyteapp/kyte-ui-components/src/packages/styles/colors"
import { listPromotion } from "../../stores/actions/CouponsActions"
import { IStore } from "../../types/state/auth"
import { ScrollView, TouchableOpacity } from "react-native"
import I18n from "../../i18n/i18n"
import KyteNotifications from "../../components/common/KyteNotifications"
import { NotificationType } from "@kyteapp/kyte-ui-components/src/packages/enums"
import { NavigationProp, useRoute } from "@react-navigation/native"
import CouponEmptyList from "./common/CouponEmptyList"
import { ListPromotionsProps } from "../../services"
import { logEvent } from "../../integrations"
import { getLastCreatedPromotion, isLastCreatedPromotion } from "../../util/util-coupon"

interface CouponsListProps {
  promotions: IPromotion[]
  store: IStore
  loader: boolean
  navigation: NavigationProp<any>
  isOnline: boolean
  billing: IBilling
  listPromotion: (data: ListPromotionsProps) => void
}

const CouponsList = ({ 
  promotions, 
  store, 
  navigation, 
  listPromotion, 
  loader, 
  isOnline,
  billing 
}: CouponsListProps) => {
  const [toast, setToast] = useState<any>(null)
  const [promotionsState, setPromotionsState] = useState<IPromotion[]>([])
  const toasTimer = 3000
  const removeToast = () => setToast(null)
  const defaultToastProps = { handleClose: removeToast, onAutoDismiss: removeToast }
  const route = useRoute();
  const hasPromotions = promotions && promotions?.length > 0

  const headerButton = [{
    icon: 'plus-cart',
    color: colors.white,
    onPress: () => navigation.navigate("CouponsTypeChoice"),
    iconSize: 14,
    style: { backgroundColor: colors.green03Kyte, marginRight: 8, borderRadius: 8, width: 48, height: 48 }
  }]

  const handleList = () => listPromotion({ aid: store.aid })

  useEffect(() => {
    if(isOnline){
      handleList()
    }
  }, [])

  useEffect(() => {
    if(route.params?.couponCreated){
      setToast({
        ...defaultToastProps,
        timer: toasTimer,
        title: I18n.t("coupons.successCreate"),
        type: NotificationType.SUCCESS,
      })
    }
  }, [route.params])

  useEffect(() => {
    if(route.params?.couponUpdated){
      setToast({
        ...defaultToastProps,
        timer: toasTimer,
        title: I18n.t("coupons.updatedCoupon"),
        type: NotificationType.NEUTRAL,
      })
    }
  }, [route.params])

  useEffect(() => {
    if(route.params?.couponDeleted){
      setToast({
        ...defaultToastProps,
        timer: toasTimer,
        title: I18n.t("coupons.deletedCoupon"),
        type: NotificationType.NEUTRAL,
      })
    }
  }, [route.params])

  useEffect(() => {
    if(!hasPromotions){
      navigation.navigate("CouponsOnBoarding")
    }
  }, [promotions])

  useEffect(() => {
    logEvent("Coupon List View")
  }, [])

  useEffect(() => {
    if (!isPro(billing)) {
      setPromotionsState(promotions);
      return;
    }
    const sorted = [...promotions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const isLastCreatedInactive = !getLastCreatedPromotion(promotions)?.active;

    if(isLastCreatedInactive){
      setPromotionsState(promotions);
      return;
    }
    
    setPromotionsState(sorted);
    return;
  }, [billing, promotions]);

  return(
    <DetailPage 
      pageTitle={I18n.t("coupons.title")} 
      rightButtons={headerButton} 
      goBack={() => navigation.navigate("Dashboard")}
      style={{ backgroundColor: colorsPierChart[9], height: '100%' }}
    >
      {loader && <LoadingCleanScreen />}
      {hasPromotions ? (
        <ScrollView>
          <Container padding={16}>
            {promotionsState.map((promotion) => (
              <>
                <TouchableOpacity key={promotion._id} onPress={() => navigation.navigate('CouponDetail', { promotion })}>
                  <CouponListItem 
                    coupon={promotion} 
                    isNew={
                      Boolean(route.params?.couponCreated) && 
                      isLastCreatedPromotion(promotion._id, promotions)
                    } 
                  />
                </TouchableOpacity>
                <Margin top={16} />
              </>
            ))}
          </Container>
        </ScrollView>
      ) : (
        <CouponEmptyList listPromotion={handleList} />
      )}
      {!!toast && (
        <Container>
          <KyteNotifications notifications={[toast]} />
        </Container>
      )}
    </DetailPage>
  )
}

const mapStateToProps = ({ auth, common, billing }) => ({
  promotions: auth.promotions,
  store: auth.store,
  loader: common.loader.visible,
  isOnline: common.isOnline,
  billing
})

export default connect(mapStateToProps, { listPromotion })(CouponsList as any)
