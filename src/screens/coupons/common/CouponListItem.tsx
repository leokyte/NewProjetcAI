
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container';
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row';
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors';
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText';
import { IBilling, ICurrency, IPromotion, IStore } from '@kyteapp/kyte-utils';
import React, { useRef, useEffect } from 'react'
import { Animated } from "react-native";
import { connect } from 'react-redux';
import { CurrencyText, KyteIcon } from '../../../components/common';
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin';
import { TouchableOpacity } from 'react-native';
import I18n from '../../../i18n/i18n';
import { getCouponInfo, handleShareCoupon } from '../../../util/util-coupon';
import ViewShot from 'react-native-view-shot';
import { kyteCatalogDomain } from '../../../util';
import CouponMockup from './CouponMockup';

interface CouponListItemProps {
  coupon: IPromotion
  currency: ICurrency
  store: IStore
  billing: IBilling
  promotions: IPromotion[]
  isNew?: boolean
}

const Strings = {
  COUPON_DESCRIPTION_DISCOUNT: I18n.t("coupons.discountOnCart"),
  COUPON_DESCRIPTION_SHIPPING: I18n.t("coupons.freeShippingList"),
  COUPON_STARTING_FOR: I18n.t("coupons.startingFrom"),
  DEACTIVATED: I18n.t("catalogBarDeactivated"),
  LIMIT: I18n.t("coupons.maxDiscount"),
  SHARE_COUPON_PART1: I18n.t("coupons.shareCoupon.part1"),
  SHARE_COUPON_PART2: I18n.t("coupons.shareCoupon.part2"),
  SHARE_COUPON_PART3: I18n.t("coupons.shareCoupon.part3"),
  SHARE_COUPON_PART4: I18n.t("coupons.shareCoupon.part4")
}

const CouponListItem = ({ coupon, currency, store, billing, promotions, isNew }: CouponListItemProps) => {
  const {
    valueDescriptionAccordingType,
    isShippingCoupon,
    contraintValue,
    maxDiscount
  } = getCouponInfo(currency, coupon)

  const valueDescription = `${valueDescriptionAccordingType} ${Strings.COUPON_DESCRIPTION_DISCOUNT}`
  
  const viewShotRef = useRef<any>(null);
  const animationNewCoupon = useRef(new Animated.Value(0)).current;

  const isActive = coupon.active

  const handleShare =  () => {
    const catalogURL = `https://${store?.urlFriendly}${kyteCatalogDomain}/`;
    const couponMessageValue = isShippingCoupon ? `${Strings.SHARE_COUPON_PART4}` : `${valueDescriptionAccordingType} ${Strings.SHARE_COUPON_PART3}`
    const message = `${Strings.SHARE_COUPON_PART1} "${coupon.code}" ${Strings.SHARE_COUPON_PART2} ${couponMessageValue} ${catalogURL}`
    
    handleShareCoupon({ viewShotRef, message, where: "list" });
  };

  const animatedBackground = animationNewCoupon.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [colors.green06, "#CAF0E6", colors.white],
  });

  const animatedTranslateY = animationNewCoupon.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  useEffect(() => {
    if (isNew) {
      animationNewCoupon.setValue(0);

      Animated.timing(animationNewCoupon, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [isNew]);

  return(
    <Animated.View
      style={{
        backgroundColor: isNew ? animatedBackground : colors.white,
        transform: [{ translateY: isNew ? animatedTranslateY : 0 }],
        borderRadius: 8,
        paddingTop: 16,
        paddingRight: 12,
        paddingBottom: 12,
        paddingLeft: 16,
        opacity: isActive ? 1 : 0.5,
      }}
    >
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1 }}
        style={{
          position: "absolute",
          top: -9999,
          left: -9999,
        }}
      >
        <CouponMockup coupon={coupon} />
      </ViewShot>
      <Row alignItems='center' justifyContent='space-between' style={{ width: '100%' }}>
        <Row alignItems='center'>
          <KyteText 
            size={22} 
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ maxWidth: isActive ? 275 : "70%" }} 
            weight={500}
          >
            {coupon.code}
          </KyteText>
          {!isActive && (
            <>
              <Margin left={8} />
              <Container padding={8} borderRadius={24}   backgroundColor="rgba(21, 24, 30, 0.04)">
                <KyteText color='#8C8C8C' weight={500}>
                  {Strings.DEACTIVATED.toUpperCase()}
                </KyteText>
              </Container>
            </>
          )}
        </Row>
        {isActive && (
          <TouchableOpacity onPress={handleShare}>
            <KyteIcon name="share" size={18} />
          </TouchableOpacity>
        )}
      </Row>
      <Margin top={8} />
      <Row alignItems='center'>
        <KyteIcon name={isShippingCoupon ? "truck" : "discount"}  style={isShippingCoupon ? { transform: [{ rotateY: '180deg' }] } : {}} size={18} />
        <Margin right={4} />
        <KyteText size={12} weight={500}>
          {isShippingCoupon ? Strings.COUPON_DESCRIPTION_SHIPPING : valueDescription}
        </KyteText>
      </Row>

      <Margin top={4} />
      {Boolean(contraintValue) && (
        <Row alignItems='center'>
          <KyteIcon name='dollar-sign' size={18} />
          <Margin right={4} />
          <KyteText size={12} weight={400}>
            {Strings.COUPON_STARTING_FOR}
          </KyteText>
          <Margin right={2} />
          <CurrencyText value={contraintValue} style={{ fontWeight: '500' }} />
        </Row>
      )}
      {Boolean(maxDiscount) && (
        <Row alignItems='center'>
          <KyteIcon name='dollar-sign' size={18} />
          <Margin right={4} />
          <KyteText size={12} weight={400}>
            {Strings.LIMIT}
          </KyteText>
          <Margin right={2} />
          <CurrencyText value={maxDiscount} style={{ fontWeight: '500' }} />
        </Row>
      )}
    </Animated.View>
  )
};

export default connect(({ auth, preference, billing }) => ({
  currency: preference.account.currency,
  store: auth.store,
  billing,
  promotions: auth.promotions,
}))(CouponListItem)
