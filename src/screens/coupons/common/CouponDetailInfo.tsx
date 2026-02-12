import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container';
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText';
import { BenefitsType, DiscountType, ICurrency, IPromotion } from '@kyteapp/kyte-utils';
import React from 'react';
import { colors } from '../../../styles';
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row';
import { TouchableOpacity } from 'react-native';
import { CurrencyText, KyteIcon } from '../../../components/common';
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin';
import I18n from '../../../i18n/i18n';
import { getCouponInfo } from '../../../util/util-coupon';
import { connect } from 'react-redux';

interface CouponInfoCardProps {
  coupon: IPromotion
  isCouponActive: boolean
  currency: ICurrency
  handleCopyCode: () => void
}

const Strings = {
  CODE: I18n.t("coupons.code"),
  DISCOUNT: I18n.t("coupons.discountOnCartDetail"),
  LIMIT: I18n.t("coupons.limitOnSaleValue"),
  MINIMUN_VALUE: I18n.t("coupons.minimunValueOnSale"),
}

const CouponDetailInfo = ({ coupon, isCouponActive, handleCopyCode, currency }: CouponInfoCardProps) => {
  const {
    isShippingCoupon,
    benefitsValue,
    isPercentageCoupon,
    code,
    contraintValue,
    maxDiscount,
    isToShowLimitOrMinimunValue
  } = getCouponInfo(currency, coupon)

  return (
    <Container padding={16} backgroundColor={colors.white} borderRadius={8}>
      <Row alignItems='center' justifyContent='space-between' style={{ width: '100%' }}>
        <Container>
          <KyteText size={14} weight={500}>{Strings.CODE}</KyteText>
          <Margin top={4} />
          <KyteText size={14}>{code}</KyteText>
        </Container>

        {isCouponActive ? (
          <TouchableOpacity onPress={handleCopyCode} style={{ padding: 8 }}>
            <KyteIcon name="copy-web" color={colors.actionColor} size={20} />
          </TouchableOpacity>
        ) : <Container />}
      </Row>


      {!isShippingCoupon && (
        <Container>
          <Margin top={16} />
          <KyteText size={14} weight={500}>{Strings.DISCOUNT}</KyteText>
          <Margin top={4} />
          {isPercentageCoupon ? 
            <KyteText size={14}>{`${benefitsValue}%`}</KyteText>
            : <CurrencyText value={benefitsValue} style={{ fontSize: 14, color: colors.primaryBlack }} />
          }
        </Container>
      )}


      {isToShowLimitOrMinimunValue && (
        <Container>
          <Margin top={16} />
          <KyteText size={14} weight={500}>
            {(isPercentageCoupon && !isShippingCoupon) ? Strings.LIMIT : Strings.MINIMUN_VALUE}
          </KyteText>
          <Margin top={4} />
          <CurrencyText 
            value={(isPercentageCoupon && !isShippingCoupon) ? maxDiscount : contraintValue} 
            style={{ fontSize: 14, color: colors.primaryBlack }} 
          />
        </Container>
      )}
    </Container>
  );
};

export default connect(({ preference }) => ({
  currency: preference.account.currency,
}))(CouponDetailInfo)