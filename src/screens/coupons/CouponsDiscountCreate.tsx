import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { colorsPierChart } from "../../styles"
import { ActionButton, DetailPage, LoadingCleanScreen } from "../../components/common"
import Container from "@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container"
import KyteNotifications from "../../components/common/KyteNotifications"
import colors from "@kyteapp/kyte-ui-components/src/packages/styles/colors"
import CouponCodeField from "./common/CouponCodeField"
import CouponMinimumValueField from "./common/CouponMinimumValueField"
import Margin from "@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin"
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { NotificationType } from "@kyteapp/kyte-ui-components/src/packages/enums"
import { useForm } from "react-hook-form"
import I18n from "../../i18n/i18n"
import CouponTypeDiscountField from "./common/CouponTypeDiscountField"
import { BenefitsType, ConstraintType, DiscountType } from "@kyteapp/kyte-utils"
import { createPromotion } from "../../stores/actions/CouponsActions"
import CouponLimitDiscountField from "./common/CouponLimitDiscountField"
import { SaveCouponPayload } from "../../types/coupons"
import CouponMockup from "./common/CouponMockup"
import { CouponOrderWarning } from "./common/CouponOrderWarning"
import { logEvent } from "../../integrations"

const Strings = {
  PAGE_TITLE: I18n.t("coupons.discountCouponTitle"),
  SAVE_BUTTON: I18n.t("alertSave"),
  API_ERROR: I18n.t("apiErrorTryAgain"),
}

const CouponsDiscountCreate = ({ ...props }) => {
  const [toast, setToast] = useState<any>(null)
  const toasTimer = 3000
	const removeToast = () => setToast(null)
	const defaultToastProps = { handleClose: removeToast, onAutoDismiss: removeToast }
  
  const { navigation, store, createPromotion, uid, loader, promotions, billing } = props
  const formMethods = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      code: "",
      constraintValue: undefined,
      constraintMustHaveMaximum: false,
      benefitsDiscountType: DiscountType.FIXED,
      benefitsValue: undefined,
      benefitsMaxDiscount: false,
      benefitsMaxDiscountValue: undefined
    }
  })

  const type = formMethods.watch("benefitsDiscountType")
  const code = formMethods.watch("code")
  const benefitsCouponValue = formMethods.watch("benefitsValue")
  const maxDiscount = formMethods.watch("benefitsMaxDiscountValue")
  const contraintValue = formMethods.watch("constraintValue")
  const constraintMustHaveMaximum = formMethods.watch("constraintMustHaveMaximum")
  const benefitsMaxDiscount = formMethods.watch("benefitsMaxDiscount")

  const isFixedType = type === DiscountType.FIXED

  const handleSave = ({
    data
  }: {
    data: SaveCouponPayload
  }) => {
    const { 
      code, 
      constraintMustHaveMaximum, 
      constraintValue, 
      benefitsDiscountType, 
      benefitsValue, 
      benefitsMaxDiscount, 
      benefitsMaxDiscountValue 
    } = data
    
    const benefits = [
      {
        type: BenefitsType.SUBTOTAL,
        discount_type: benefitsDiscountType,
        value: Number(benefitsValue),
        max_discount: benefitsMaxDiscount ? benefitsMaxDiscountValue : undefined
      }
    ]
    const constraints = Boolean(constraintMustHaveMaximum) ? [
      {
        type: ConstraintType.MIN_ORDER_VALUE,
        value: constraintValue
      }
    ] : [];
  
    createPromotion(
      {
        code,
        constraints,
        benefits,
        uid,
        aid: store.aid,
      },
      (error: any) => {
        if (error) {
          setToast({
            ...defaultToastProps,
            timer: toasTimer,
            title: Strings.API_ERROR,
            type: NotificationType.ERROR,
          })
          return
        }
        navigation.replace("CouponsList", { couponCreated: true })
      }
    )
  }

  useEffect(() => {
    logEvent('New Coupon View')
  }, [])

  return(
    <DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()} style={styles.pageStyle}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Container flex={1} flexDirection='column' alignItems='center' padding={16}>
            <CouponMockup 
              couponForm={{
                benefitsCouponValue,
                type,
                codeValue: code,
                contraintValue,
                maxDiscount,
                isShippingCouponForm: false,
                benefitsMaxDiscount,
                constraintMustHaveMaximum
              }}
            />
            <Margin top={24} />
            <CouponCodeField formMethods={formMethods} />
            <Margin top={24} />
            <CouponTypeDiscountField formMethods={formMethods} />
            <Margin top={24} />
            {isFixedType ? <CouponMinimumValueField formMethods={formMethods} /> : <CouponLimitDiscountField formMethods={formMethods} />}
            <Margin top={24} />
            <CouponOrderWarning />
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
      <Container padding={16} backgroundColor={colors.white}>
        <ActionButton 
          full
          noDisabledAlert
          onPress={formMethods.handleSubmit((data) => handleSave({ data }))} 
          disabled={!formMethods.formState.isDirty}
        >
          {Strings.SAVE_BUTTON}
        </ActionButton>
      </Container>
      {!!toast && (
        <Container>
          <KyteNotifications notifications={[toast]} />
        </Container>
      )}
      {loader && <LoadingCleanScreen />}
    </DetailPage>
  )
}

const styles = {
	pageStyle: {
		backgroundColor: colorsPierChart[9]
	}
}

export default connect(({ auth, common, billing }) => ({ 
  store: auth.store, uid: auth.user.uid,
  loader: common.loader.visible,
  promotions: auth.promotions,
  billing
}), 
{ createPromotion })
(CouponsDiscountCreate)