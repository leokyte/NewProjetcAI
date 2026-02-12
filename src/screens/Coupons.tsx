import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { connect } from 'react-redux'
import { TabletScreenContainer } from '../components/common'
import { IPromotion, isBetaCatalog, IStore } from '@kyteapp/kyte-utils'
import CouponsOnBoarding from './coupons/CouponsOnBoarding'
import CouponsTypeChoice from './coupons/CouponsTypeChoice'
import CouponsShippingCreate from './coupons/CouponsShippingCreate'
import CouponsDiscountCreate from './coupons/CouponsDiscountCreate'
import CouponsList from './coupons/CouponsList'
import CouponDetail from './coupons/CouponDetail'
import { hasCatalog, setShowNeedConfigureCatalogModalForCoupons } from '../stores/actions'
import CatalogConfigIndex from '../components/config/catalog/CatalogConfigIndex'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

const CouponsStack = ({ isDrawerNavigation = false, store, ...props }: 
  { 
    isDrawerNavigation?: boolean, 
    store?: IStore, 
    showNeedConfigureCatalogModalForCoupons: boolean, 
    setShowNeedConfigureCatalogModalForCoupons: (value: boolean) => void
    promotions: IPromotion[]
    hasCatalog: any
  }
) => {
  const itHasCoupon = props?.promotions && props?.promotions?.length  > 0

  const itHasNewCatalog = isBetaCatalog(store?.catalog?.version)
  const routeIfHasCoupon = itHasCoupon ? 'CouponsList' : 'CouponsOnBoarding'

  return (
    <TabletScreenContainer maxHeight={680}>
        <Stack.Navigator
          initialRouteName={itHasNewCatalog ? routeIfHasCoupon : 'CatalogConfigIndex'}
          screenOptions={screenOptions}
        >
           <Stack.Screen
            name="CatalogConfigIndex"
            component={CatalogConfigIndex}
            initialParams={{ origin: 'coupon', isDrawerNavigation }}
          />
          <Stack.Screen name="CouponsTypeChoice" component={CouponsTypeChoice} initialParams={{
            isDrawerNavigation,
          }} />
          <Stack.Screen name="CouponsOnBoarding" component={CouponsOnBoarding} initialParams={{
            isDrawerNavigation,
          }} />
          <Stack.Screen name="CouponsShippingCreate" component={CouponsShippingCreate} />
          <Stack.Screen name="CouponsDiscountCreate" component={CouponsDiscountCreate} />
          <Stack.Screen name="CouponsList" component={CouponsList} />
          <Stack.Screen name="CouponDetail" component={CouponDetail} />
        </Stack.Navigator>
    </TabletScreenContainer>
  )
}

const mapStateToProps = ({ auth, common }) => ({
  store: auth.store,
  showNeedConfigureCatalogModalForCoupons: common.showNeedConfigureCatalogModalForCoupons,
  promotions: auth.promotions
})

export default connect(mapStateToProps, { setShowNeedConfigureCatalogModalForCoupons, hasCatalog })(CouponsStack);
