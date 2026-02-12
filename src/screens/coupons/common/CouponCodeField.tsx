import React, { useState } from 'react';
import { Controller, useFormState } from 'react-hook-form';
import { connect } from 'react-redux';
import { Input } from '../../../components/common';
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors';
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container';
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText';
import { removeAccents } from '../../../util';
import I18n from '../../../i18n/i18n';
import { IPromotion } from '@kyteapp/kyte-utils';
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding';

const Strings = {
  COUPON_CODE_FIELD_PLACEHOLDER: I18n.t("coupons.codePlaceholder"),
  COUPON_CODE_FIELD_DESCRIPTION: I18n.t("coupons.codeDescription"),
  COUPON_CODE_USED: I18n.t("coupons.codeUsed"),
  LABEL: I18n.t("coupons.codeLabel")
}

interface CouponCodeField {
  formMethods: any
  promotions: IPromotion[]
}

const CouponCodeField = ({ formMethods, promotions }: CouponCodeField) => {
  const [labelDescription, setLabelDescription] = useState(Strings.COUPON_CODE_FIELD_DESCRIPTION);
  const { control, setError } = formMethods
  const { errors } = useFormState({ control })

  const sanitizeInput = (text: string) => {
    let sanitized = removeAccents(text);
    sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, '');
    return sanitized.toUpperCase();
  };

  const handleOnChangeValue = (value: string, onChange: (value: string) => void) => {
    onChange(sanitizeInput(value));
  }

  return(
    <Container padding={16} borderRadius={8} backgroundColor={colors.white} width='100%'>
      <KyteText weight={500} size={16} lineHeight={24}>
        {Strings.LABEL}
      </KyteText>
      <Controller
        control={control}
        name="code"
        rules={{
          required: {
            value: true,
            message: Strings.COUPON_CODE_FIELD_DESCRIPTION,
          }, 
          validate: (val) => {
            const isUsed = Boolean(promotions?.find((promotion: any) => promotion.code === val));
            if(isUsed){
              setError('code', { message: Strings.COUPON_CODE_USED });
              setLabelDescription(Strings.COUPON_CODE_USED);
              return Strings.COUPON_CODE_USED
            }
            setLabelDescription(Strings.COUPON_CODE_FIELD_DESCRIPTION);
            return true
          }}}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input
            placeholder={Strings.COUPON_CODE_FIELD_PLACEHOLDER}
            placeholderColor={colors.gray05}
            maxLength={20}
            minLength={1}
            returnKeyType="done"
            error={(errors.code?.message?.toString() || "")}
            value={value}
            onChangeText={(text) => handleOnChangeValue(text, onChange)}
            onBlur={() => {
              onBlur();
              if(!value) setError('code', { message: Strings.COUPON_CODE_FIELD_DESCRIPTION });
            }}
          />
        )}
      />
      
      {!errors.code && (
        <Padding left={5} right={5}>
          <KyteText
            size={12}
            color={colors.gray04}
          >
            {labelDescription || Strings.COUPON_CODE_FIELD_DESCRIPTION}
          </KyteText>
        </Padding>
      )}
    </Container>
  )
};

export default connect((state) => ({
    promotions: state.auth.promotions,
  }),
)(CouponCodeField)