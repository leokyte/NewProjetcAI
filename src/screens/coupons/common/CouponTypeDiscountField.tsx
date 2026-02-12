import React, { useState } from 'react';
import { Controller, useFormState } from 'react-hook-form';
import { connect } from 'react-redux';
import { KyteButton, MaskedInput } from '../../../components/common';
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container';
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText';
import { DiscountType, ICurrency } from '@kyteapp/kyte-utils';
import I18n from '../../../i18n/i18n';
import Row from '@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row';
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin';
import { colors  } from '../../../styles';
import { TextInputMask } from 'react-native-masked-text';

const Strings = {
  COUPON_CODE_FIELD_DESCRIPTION: I18n.t('coupons.typeDiscountDescription'),
  LABEL: I18n.t('coupons.typeDiscountLabel'),
  FIXED_VALUE:  I18n.t('coupons.fixedValue'),
  PERCENT_VALUE: I18n.t('coupons.percentageValue'),
};

interface CouponTypeDiscountFieldProps {
  formMethods: any;
  currency: ICurrency;
}

const CouponTypeDiscountField = ({ currency, formMethods }: CouponTypeDiscountFieldProps) => {
  const [placeholder, setPlaceholder] = useState<string | undefined>(currency.currencySymbol);
  const { control, setError, setValue, watch, clearErrors } = formMethods;
  const [isFocused, setIsFocused] = useState(false);
  const { errors } = useFormState({ control });
  const type = watch("benefitsDiscountType")
  const isFixedType = type === DiscountType.FIXED
  const { groupingSeparator, decimalSeparator } = currency;

  const handlePressButton = (type: string) => {
    setValue("benefitsDiscountType", type)
    clearErrors("benefitsValue")
  }

  return (
    <Container borderRadius={8} padding={16} backgroundColor={colors.white} width="100%">
      <KyteText size={16} weight={500}>
        {Strings.LABEL}
      </KyteText> 
      <Margin top={8} />
      <KyteText size={12} style={{ opacity: 0.5 }}>
        {Strings.COUPON_CODE_FIELD_DESCRIPTION}
      </KyteText> 
      <Margin top={16} />
      <Row alignItems="center">
        <KyteButton 
          onPress={() => handlePressButton(DiscountType.FIXED)} 
          type="secondary"
          borderWidth={1}
          borderRadius={8}
          borderColor={isFixedType ? colors.actionColor : colors.littleDarkGray}
          style={{
            padding: 8,
            height: 34,
          }}
        >
           <KyteText size={12} color={isFixedType? colors.darkGreen : undefined}>
            {Strings.FIXED_VALUE}
           </KyteText>
        </KyteButton>
        <Margin right={8} />
        <KyteButton 
          onPress={() => handlePressButton(DiscountType.PERCENTAGE)} 
          type="secondary"
          borderWidth={1}
          borderRadius={8}
          borderColor={!isFixedType ? colors.actionColor : colors.littleDarkGray}
          style={{
            padding: 8,
            height: 34,
          }}
        >
           <KyteText size={12} color={!isFixedType ? colors.darkGreen : undefined}>
              {Strings.PERCENT_VALUE}
           </KyteText>
        </KyteButton>
      </Row>
      <Margin top={16} />

      <Controller
        control={control}
        name="benefitsValue"
        rules={{
          required: {
            value: true,
            message: " ",
          },
          validate: (val) => {
            const value = Number(val);
            if (!value || value === 0) {
              return " ";
            }

            if (type === DiscountType.PERCENTAGE && value > 100) {
              return " ";
            }

            return true;
          },
        }}
        render={({ field: { onChange, value, onBlur } }) => (
          isFixedType ? (
            <MaskedInput
              style={{ borderBottomColor: errors.benefitsValue ? colors.errorColor : colors.littleDarkGray, borderBottomWidth: 3 }}
              keyboardType="numeric"
              type="money"
              value={value}
              placeholder={value || value === 0 ? undefined : placeholder}
              error={(errors.benefitsValue?.message?.toString() || "")}
              onChangeText={onChange}
              onFocus={() => setPlaceholder(undefined)}
              returnKeyType="done"
              onBlur={() => {
                onBlur();
                if(!value || value === 0) {
                  setError('benefitsValue', { message: " " });
                }
              }}
            />
          ) : (
            <Row 
              style={
                {
                  ...styles.inputContainer,
                  borderBottomColor: errors.benefitsValue
                  ? colors.errorColor
                  : isFocused
                  ? colors.actionColor
                  : colors.lightColor,
                  borderBottomWidth: isFocused ? 2 : 1
                }
              } 
              justifyContent='space-between' 
              alignItems='center'
            >
              <TextInputMask
                style={{ 
                  width: '100%', 
                  fontSize: 16, 
                  color: colors.primaryColor 
                }}
                onFocus={() => setIsFocused(true)}
                value={value}
                placeholderTextColor={colors.primaryColor}
                keyboardType='numeric'
                type='only-numbers'
                maxLength={3}
                onChangeText={onChange}
                onBlur={() => {
                  onBlur();
                  setIsFocused(false);
                  if(value == '0' || !value || value > 100) {
                    setError('benefitsValue');
                  }
                }}
                options={{ unit: '', separator: decimalSeparator, delimiter: groupingSeparator }}
              />
              <KyteText size={13} color={colors.tipColor}>%</KyteText>
            </Row>
          )
        )}
      />
    </Container>
  );
};

const styles = {
  inputContainer: {
    marginTop: 20,
    borderBottomWidth: 1,
    paddingBottom: 2,
    paddingHorizontal: 8,
    height: 30
  }
}

export default connect(({ preference }) => ({
  currency: preference.account.currency,
}))(CouponTypeDiscountField);
