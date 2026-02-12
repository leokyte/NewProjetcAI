import React from 'react';
import { Controller, useFormState } from 'react-hook-form';
import { connect } from 'react-redux';
import { MaskedInput, SwitchContainer2 } from '../../../components/common';
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors';
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container';
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText';
import I18n from '../../../i18n/i18n';
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding';
import { colorSet, Type } from '../../../styles';

const Strings = {
  COUPON_CODE_FIELD_DESCRIPTION: I18n.t('coupons.limitDiscountDescription'),
  LABEL: I18n.t('coupons.limitDiscountLabel'),
};

interface CouponLimitDiscountFieldProps {
  formMethods: any;
}

const CouponLimitDiscountField = ({ formMethods }: CouponLimitDiscountFieldProps) => {
  const { control, setError } = formMethods;
  const { errors } = useFormState({ control })

  return (
    <Container borderRadius={8} backgroundColor={colors.white} width="100%">
      <Controller
        control={control}
        name="benefitsMaxDiscount"
        render={({ field: { onChange, value } }) => (
          <SwitchContainer2
            titleStyle={[Type.fontSize(16), Type.Medium, colorSet(colors.gray02Kyte)]}
            title={Strings.LABEL}
            disabled={false}
            value={value}
            onPressAction={onChange}
            description={
              value ? (
                <Container>
                  <Controller
                    control={control}
                    name="benefitsMaxDiscountValue"
                    rules={{
                      required: {
                        value: true,
                        message: Strings.COUPON_CODE_FIELD_DESCRIPTION,
                      },
                      validate: (val) => {
                        const value = Number(val);
                        if (!value || value === 0) {
                          return Strings.COUPON_CODE_FIELD_DESCRIPTION;
                        }

                        return true;
                      },
                    }}
                    render={({ field: { onChange, value, onBlur } }) => (
                      <MaskedInput
                        keyboardType="numeric"
                        style={{ color: errors.benefitsMaxDiscountValue ? colors.error : colors.gray02Kyte,  }}
                        type="money"
                        error={(errors.benefitsMaxDiscountValue?.message?.toString() || "")}
                        value={value}
                        onChangeText={onChange}
                        returnKeyType="done"
                        onBlur={() => {
                          onBlur();
                          if(!value || value === '0') {
                            setError('benefitsMaxDiscountValue', { message: Strings.COUPON_CODE_FIELD_DESCRIPTION });
                          }
                        }}
                      />
                    )}
                  />

                  {!errors.benefitsMaxDiscountValue && (
                    <Padding left={5} right={5}>
                      <KyteText
                        size={12}
                        color={colors.gray04}
                      >
                        {Strings.COUPON_CODE_FIELD_DESCRIPTION}
                      </KyteText>
                    </Padding>
                  )}
                </Container>
              ) : null
            }
          />
        )}
      />
    </Container>
  );
};

export default connect()(CouponLimitDiscountField);
