import React from 'react';
import { Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { SwitchContainer2 } from '../../../components/common';
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors';
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container';
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText';
import I18n from '../../../i18n/i18n';
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding';
import { colorSet, Type } from '../../../styles';
import { IPromotion, isPro } from '@kyteapp/kyte-utils';
import { Features } from '../../../enums';
import { toggleBillingMessage } from '../../../stores/actions';
import { getCouponDisabledInfo } from '../../../util/util-coupon';

const Strings = {
  COUPON_CODE_FIELD_DESCRIPTION: I18n.t('coupons.activeCouponDescription'),
  LABEL: I18n.t('coupons.activeCouponLabel'),
};

interface CouponActiveFieldProps {
  formMethods: any;
  coupon: IPromotion
}

const CouponActiveField = ({ formMethods, coupon, ...props }: CouponActiveFieldProps) => {
  const { control } = formMethods;
  const { billing, toggleBillingMessage, promotions } = props

  const isDisabled = getCouponDisabledInfo({ promotions, billing, coupon })

  const handlePressAction = () => {
    const feature = isPro(billing) ? Features.COUPONS_GROW_PAYWALL : Features.COUPONS_PRO_PAYWALL
    const { remoteKey } = Features.items[feature]
    
    return toggleBillingMessage(true, 'Pro', remoteKey)
  }

  return (
    <Container borderRadius={8} backgroundColor={colors.white} width="100%">
      <Controller
        control={control}
        name="active"
        render={({ field: { onChange, value } }) => (
          <SwitchContainer2
            titleStyle={[Type.fontSize(16), Type.Medium, colorSet(colors.gray02Kyte)]}
            disabled={isDisabled}
            title={Strings.LABEL}
            value={isDisabled ? false : value}
            onPressAction={() => {
              if(isDisabled){
                return handlePressAction()
              }
              onChange(!value)
            }}
            description={(
              <Padding top={8}>
                <KyteText
                  size={12}
                  color={colors.gray04}
                >
                  {Strings.COUPON_CODE_FIELD_DESCRIPTION}
                </KyteText>
              </Padding>  
            )}
          />
        )}
      />
    </Container>
  );
};

export default connect(({ billing, auth }) => 
  ({ 
    billing,
    promotions: auth.promotions
  }), 
{ toggleBillingMessage })
(CouponActiveField);
