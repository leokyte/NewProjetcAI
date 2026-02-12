import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { ActionButton, DetailPage, LoadingCleanScreen } from '../../components/common'
import I18n from '../../i18n/i18n'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import { useForm } from 'react-hook-form'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { colorsPierChart } from '../../styles'
import CouponCodeField from './common/CouponCodeField'
import CouponMinimumValueField from './common/CouponMinimumValueField'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import KyteNotifications from '../../components/common/KyteNotifications'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import { createPromotion } from '../../stores/actions/CouponsActions'
import { BenefitsType, ConstraintType, DiscountType } from '@kyteapp/kyte-utils'
import { SaveCouponPayload } from '../../types/coupons'
import CouponMockup from './common/CouponMockup'
import { CouponOrderWarning } from './common/CouponOrderWarning'
import { logEvent } from '../../integrations'

const Strings = {
  PAGE_TITLE: I18n.t("coupons.freeShippingCouponTitle"),
  SAVE_BUTTON: I18n.t("alertSave"),
  API_ERROR: I18n.t("apiErrorTryAgain")
}

const CouponsShippingCreate = ({ ...props }) => {
  const [toast, setToast] = useState<any>(null)
  const toasTimer = 3000
	const removeToast = () => setToast(null)
	const defaultToastProps = { handleClose: removeToast, onAutoDismiss: removeToast }
  
  const { navigation, store, createPromotion, uid, loader } = props
  const formMethods = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      code: "",
      constraintValue: undefined,
      constraintMustHaveMaximum: false
    }
  })

  const handleSave = ({
    data
  }: {
    data: SaveCouponPayload
  }) => {
    const { code, constraintMustHaveMaximum, constraintValue } = data
    const benefits = [
      {
        type: BenefitsType.SHIPPING,
        discount_type: DiscountType.PERCENTAGE,
        value: 100,
        max_discount: undefined
      }
    ]
    const constraints = Boolean(constraintMustHaveMaximum) ? [
      {
        type: ConstraintType.MIN_ORDER_VALUE,
        value:  constraintValue
      }
    ] : [];

    createPromotion(
      {
        code,
        constraints,
        benefits,
        storeId: store.id,
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

  const code = formMethods.watch("code")
  const couponValue = formMethods.watch("constraintValue")
  const contraintValue = formMethods.watch("constraintValue")
  const constraintMustHaveMaximum = formMethods.watch("constraintMustHaveMaximum")

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
                benefitsCouponValue: couponValue,
                codeValue: code,
                contraintValue,
                isShippingCouponForm: true,
                constraintMustHaveMaximum
              }}
            />
            <Margin top={24} />
            <CouponCodeField formMethods={formMethods} />
            <Margin top={24} />
            <CouponMinimumValueField formMethods={formMethods} />
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

export default connect(({ auth, common }) => ({ 
  store: auth.store, uid: auth.user.uid,
  loader: common.loader.visible,
}), 
{ createPromotion }
)(CouponsShippingCreate)