import React, { useState } from 'react'
import { connect } from 'react-redux'
import { ActionButton, CenterContent, DetailPage, TextButton } from '../../../common'
import { Alert, Image, Linking, ScrollView, View } from 'react-native'
import { colors, colorsPierChart } from '../../../../styles'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import I18n from '../../../../i18n/i18n'
import { MPAutomaticPaymentPageImgEN, MPAutomaticPaymentPageImgES, MPAutomaticPaymentPageImgPT } from '../../../../../assets/images/gateways/mp_automatic_payment_page'
import { StripeAutomaticPaymentPageImgEN, StripeAutomaticPaymentPageImgES, StripeAutomaticPaymentPageImgPT } from '../../../../../assets/images/gateways/stripe_automatic_payment_page'
import { GatewayPaymentTypeEnum } from '../../../../enums'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import { MercadoPago, StripeConnect } from '../../../../../assets/images'
import KyteIcon from '@kyteapp/kyte-ui-components/src/packages/icons/KyteIcon/KyteIcon'
import TooltipContainer from '../../../common/utilities/TooltipContainer'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import { getNormalizedLocale, renderBoldText, toggleGateway } from '../../../../util'
import { ConfigOnlinePaymentsBrands } from './ConfigOnlinePaymentsBrands'
import AccordionFaqItem from '../../../products/variants/wizard/AccordionFaqItem'
import { ConfigOnlinePaymentsFaq } from './ConfigOnlinePaymentsFaq'
import { bindActionCreators } from 'redux'
import { storeAccountSave, updatePaymentGateways } from '../../../../stores/actions'
import StripeBottomMessageModal from './StripeBottomMessageModal'
import { LocaleCodeType } from '@kyteapp/kyte-utils'



type GatewayImgLanguage = {
  [gateway: string]: Record<LocaleCodeType, string>;
};

const gatewayImgLanguage: GatewayImgLanguage = {
  [GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE as string]: {
    ES: MPAutomaticPaymentPageImgES,
    EN: MPAutomaticPaymentPageImgEN,
    PT: MPAutomaticPaymentPageImgPT
  },
  [GatewayPaymentTypeEnum.STRIPE_CONNECT as string]: {
    ES: StripeAutomaticPaymentPageImgES,
    EN: StripeAutomaticPaymentPageImgEN,
    PT: StripeAutomaticPaymentPageImgPT
  }
};

const Strings = {
  PAGE_TITLE: I18n.t('automaticPaymentsPage.title'),
  TITLE: I18n.t('automaticPaymentsPage.boostYourSales'),
  DESCRIPTION: I18n.t('automaticPaymentsPage.turnYourStoreInto'),
  BUTTON_TITLE: I18n.t('automaticPaymentsPage.button'),
  FIRST_CARD: {
    [GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE]: {
      TITLE: I18n.t('automaticPaymentsPage.mercadoPago.firstCard.title'),
      DESCRIPTION: I18n.t('automaticPaymentsPage.mercadoPago.firstCard.description'),
    },
    [GatewayPaymentTypeEnum.STRIPE_CONNECT]: {
      TITLE: I18n.t('automaticPaymentsPage.stripe.firstCard.title'),
      DESCRIPTION: I18n.t('automaticPaymentsPage.stripe.firstCard.description'),
    }
  },
  SECOND_CARD: {
    [GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE]: {
      TITLE: I18n.t('automaticPaymentsPage.secondCard.title'),
      DESCRIPTION: I18n.t('automaticPaymentsPage.mercadoPago.secondCard.description'),
    },
    [GatewayPaymentTypeEnum.STRIPE_CONNECT]: {
      TITLE: I18n.t('automaticPaymentsPage.secondCard.title'),
      DESCRIPTION: I18n.t('automaticPaymentsPage.stripe.secondCard.description'),
    }
  },
  THIRD_CARD: {
    [GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE]: {
      TITLE: I18n.t('automaticPaymentsPage.thirdCard.title'),
      DESCRIPTION: I18n.t('automaticPaymentsPage.mercadoPago.thirdCard.description'),
    },
    [GatewayPaymentTypeEnum.STRIPE_CONNECT]: {
      TITLE: I18n.t('automaticPaymentsPage.thirdCard.title'),
      DESCRIPTION: I18n.t('automaticPaymentsPage.stripe.thirdCard.description'),
    }
  },
  EXTRA_CARD_MP: {
    [GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE]: {
      TITLE: I18n.t('automaticPaymentsPage.extraCardMP.title'),
      DESCRIPTION: I18n.t('automaticPaymentsPage.extraCardMP.description'),
      LINK: I18n.t('automaticPaymentsPage.extraCardMP.link'),
    }
  },
  CHECK_TERMS: {
    TITLE: I18n.t('automaticPaymentsPage.checkTheTerms'),
    FEE: {
      TITLE: I18n.t('automaticPaymentsPage.fee'),
      [GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE]: {
        DESCRIPTION: I18n.t('automaticPaymentsPage.feeDescriptionMP'),
      },
      [GatewayPaymentTypeEnum.STRIPE_CONNECT]: {
        DESCRIPTION: I18n.t('automaticPaymentsPage.feeDescriptionStripe'),
      },
    },
    PAYOUT_TIME: {
      TITLE: I18n.t('automaticPaymentsPage.payoutTime'),
      [GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE]: {
        DESCRIPTION: I18n.t('automaticPaymentsPage.payoutDescriptionMP'),
      },
      [GatewayPaymentTypeEnum.STRIPE_CONNECT]: {
        DESCRIPTION: I18n.t('automaticPaymentsPage.payoutDescriptionStripe'),
      },
    },
    ACCEPTED_TYPES: {
      TITLE: I18n.t('automaticPaymentsPage.acceptedPaymentTypes'),
      [GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE]: {
        DESCRIPTION: I18n.t('automaticPaymentsPage.acceptedPaymentTypesDescriptionMP'),
      },
      [GatewayPaymentTypeEnum.STRIPE_CONNECT]: {
        DESCRIPTION: I18n.t('automaticPaymentsPage.acceptedPaymentTypesDescriptionStripe'),
      },
    },
    INSTALLMENTS: {
      TITLE: I18n.t('automaticPaymentsPage.installments'),
      [GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE]: {
        DESCRIPTION: I18n.t('automaticPaymentsPage.installmentsDescription'),
      },
    }
  }
}

const ConfigOnlinePaymentsWizard = ({ ...props }) => {
  const [isBottomMessageModalVisible, setIsBottomMessageModalVisible] = useState(false)
  const { navigation } = props
  const { params = {} } = props.route
  const { type = 'catalog', gateway = GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE } = params
  const isGatewayMP = gateway === GatewayPaymentTypeEnum.MERCADO_PAGO_ONLINE
  const isStripe = gateway === GatewayPaymentTypeEnum.STRIPE_CONNECT
  const urlMPLink = "https://www.mercadopago.com.br/ajuda/33392"
  const tooltipContentStyle = { width: 280, flexWrap: "wrap", lineHeight: 18 }
  const lang = getNormalizedLocale(I18n.locale).toUpperCase()

  const cards = [
    {
      title: Strings.FIRST_CARD[gateway].TITLE,
      description: renderBoldText(Strings.FIRST_CARD[gateway].DESCRIPTION),
      icon: <Image 
        source={{ 
          uri: isGatewayMP ? MercadoPago : StripeConnect, 
          width: 26,
          height: isGatewayMP ? 18 : 11
        }} 
      />
    },
    {
      title: Strings.SECOND_CARD[gateway].TITLE,
      description: renderBoldText(Strings.SECOND_CARD[gateway].DESCRIPTION),
      icon: <KyteIcon name="language" color={colors.actionColor} size={20} />
    },
    {
      title: Strings.THIRD_CARD[gateway].TITLE,
      description: (
        <KyteText 
          lineHeight={18}
        >
          {`${Strings.THIRD_CARD[gateway].DESCRIPTION} \n`}
        </KyteText>
      ),
      icon: <KyteIcon name="dollar-sign" color={colors.actionColor} size={20} />,
      link: (
        <ConfigOnlinePaymentsBrands isGatewayMP={isGatewayMP} />
      )
    },
  ]

  const onlyMPCard = {
    title: Strings.EXTRA_CARD_MP[gateway]?.TITLE,
    description: isGatewayMP ? renderBoldText(Strings.EXTRA_CARD_MP[gateway]?.DESCRIPTION) : <View />,
    icon: <KyteIcon name="star-stroke" color={colors.actionColor} size={20} />,
    link: <TextButton
            onPress={() => Linking.openURL(urlMPLink)}
            title={Strings.EXTRA_CARD_MP[gateway]?.LINK}
            color={colors.actionColor}
            size={11}
          />
  }

  const faqTerms = [
    {
      title: Strings.CHECK_TERMS.FEE.TITLE,
      description: Strings.CHECK_TERMS.FEE[gateway].DESCRIPTION,
    },
    {
      title: Strings.CHECK_TERMS.PAYOUT_TIME.TITLE,
      description: Strings.CHECK_TERMS.PAYOUT_TIME[gateway].DESCRIPTION,
    },
    {
      title: Strings.CHECK_TERMS.ACCEPTED_TYPES.TITLE,
      description: Strings.CHECK_TERMS.ACCEPTED_TYPES[gateway].DESCRIPTION,
    },
  ]

  const onlyMPFaqTerm = {
    title: Strings.CHECK_TERMS.INSTALLMENTS.TITLE,
    description: Strings.CHECK_TERMS.INSTALLMENTS[gateway]?.DESCRIPTION,
  }

  const handleToggleGateway = () => {
    const payments = props.store.catalog.payments || [];
    const hasOtherPaymentsActive = payments.some(p => p.active);

    const selectOneAlert = (text: string) => {
      Alert.alert(I18n.t('words.s.attention'), text || I18n.t('catalogConfig.noPaymentsAlert'), [{ text: I18n.t('alertOk') }])
    }

    if(isStripe){
      setIsBottomMessageModalVisible(false)
    }

    toggleGateway({
      gatewayKey: gateway,
      store: props.store,
      hasOtherPaymentsActive,
      selectOneAlert,
      storeAccountSave: props.storeAccountSave,
      updatePaymentGateways: props.updatePaymentGateways,
      serviceType: type
    });
  }

  return(
    <DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()}>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: colorsPierChart[9],
        }}
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <Container flex={1} justifyContent="space-between">
          <CenterContent>
            <Image source={{ 
                uri: gatewayImgLanguage[gateway][lang as LocaleCodeType],
                width: 265,
                height: 220
              }} 
            />
            <Margin top={16} />
            <KyteText size={20} lineHeight={28} weight={500} textAlign='center'>
              {Strings.TITLE}
            </KyteText>
            <Margin top={16} />
            <KyteText size={14} weight={400} lineHeight={21} color={colors.grayBlue} textAlign='center'>
              {Strings.DESCRIPTION}
            </KyteText>
            <Margin top={16} />

            <Container flex={1} justifyContent="space-between" paddingLeft={10} paddingRight={10}>
              {(isGatewayMP ? [
                  ...cards.slice(0, 2),
                  onlyMPCard,
                  ...cards.slice(2),
                ] : cards
              ).map((card, index) => (
                <View key={index}>
                  <TooltipContainer
                    containerBg={colors.white}
                    leftComponent={card.icon}
                    titleStyle={{...tooltipContentStyle}}
                    descriptionStyle={{...tooltipContentStyle}}
                    terms={{
                      title: card.title,
                      description: [
                        card.description,
                      ],
                    }}
                    descriptionComponent={card.link}
                  />

                  <Margin bottom={16} />
                </View>
              ))}
            </Container>
            <Margin top={16} />
          </CenterContent>
          
        </Container>

        <Container flex={1} paddingLeft={8} paddingRight={10} marginBottom={16}>
          <AccordionFaqItem
            title={Strings.CHECK_TERMS.TITLE}
            content={<ConfigOnlinePaymentsFaq data={isGatewayMP ? [...faqTerms, onlyMPFaqTerm] : faqTerms} isMP={isGatewayMP} />}
          />
        </Container>
      </ScrollView>
      {isBottomMessageModalVisible ? 
        <StripeBottomMessageModal 
          isGatewayMP={isGatewayMP} 
          onClose={() => setIsBottomMessageModalVisible(false)}
          handleToggleGateway={handleToggleGateway}
          type={type}
        /> 
      : null}

      <Container padding={16} borderTopWidth={1} borderColor={colors.lightBorder}>
        <ActionButton
          onPress={() => isStripe ? setIsBottomMessageModalVisible(true) : handleToggleGateway()}
          full
        >
          {Strings.BUTTON_TITLE}
        </ActionButton>
      </Container>
    </DetailPage>
  )
}

const mapStateToProps = ({ auth }) => ({
  store: auth.store,
})

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      storeAccountSave,
      updatePaymentGateways
    },
    dispatch
  ),
})

export default connect(mapStateToProps, mapDispatchToProps)(ConfigOnlinePaymentsWizard)