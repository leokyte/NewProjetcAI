import React from 'react'
import { ActionButton, DetailPage, KyteSafeAreaView } from '../../../common'
import { useNavigation } from '@react-navigation/native'
import { ScrollView } from 'react-native'
import { Container, KyteText, Padding, Margin, Row } from '@kyteapp/kyte-ui-components'
import I18n from '../../../../i18n/i18n'
import { colors } from '../../../../styles'
import { renderBoldText } from '../../../../util'
import FastImage from 'react-native-fast-image'
import CreatVariantTipImage from '../../../../../assets/images/variants/create-variant-tip'
import SampleAlert from '../../../common/SampleAlert'
import AccordionFaqItem from './AccordionFaqItem'

const Strings = {
  t_title: I18n.t("variantsWizard.tip.title"),
  t_understand: I18n.t("okUnderstood"),
  t_tip_opening_title: I18n.t("variantsWizard.tip.openingTitle"),
  t_tip_opening_subtitle: I18n.t("variantsWizard.tip.openingSubtitle"),
  t_tip_saved_variations_text: I18n.t("variantsWizard.tip.savedVariationsText"),
  t_tip_variant_limit_text: I18n.t("variantsWizard.tip.variantLimitText"),
  t_tip_example_variations_sub: I18n.t("variantsWizard.tip.exampleVariationsSub"),
  t_size_variation_example: I18n.t("variantsWizard.tip.sizeVariationExample"),
  t_color_variation_example: I18n.t("variantsWizard.tip.colorVariationExample"),
  t_nail_polish_example: I18n.t("variantsWizard.tip.nailPolishExample"),
  t_ice_cream_example: I18n.t("variantsWizard.tip.iceCreamExample"),
  t_phone_case_example: I18n.t("variantsWizard.tip.phoneCaseExample"),
  t_variant_stock_title_faq: I18n.t("variantsWizard.tip.variantStockTitleFaq"),
  t_variant_stock_management_faq: I18n.t("variantsWizard.tip.variantStockManagementFaq"),
  t_catalog_display_title_faq: I18n.t("variantsWizard.tip.catalogDisplayTitleFaq"),
  t_catalog_display_faq: I18n.t("variantsWizard.tip.catalogDisplayFaq"),
  t_variant_creation_editing_title_faq: I18n.t("variantsWizard.tip.variantCreationEditingTitleFaq"),
  t_variant_creation_editing_faq: I18n.t("variantsWizard.tip.variantCreationEditingFaq"),
}

interface ProductVariantTipsProps {}

const ProductVariantTips: React.FC<ProductVariantTipsProps> = ({ }) => {
  const PADDING_SIZE = 16
  const FONT_MEDIUM_SIZE = 16
  const navigation = useNavigation()
  const variationsExample = [
    Strings.t_size_variation_example,
    Strings.t_color_variation_example
  ]

  const quantityExample = [
    Strings.t_nail_polish_example,
    Strings.t_ice_cream_example,
    Strings.t_phone_case_example
  ]

  const faqData = [
    {
      title: Strings.t_variant_stock_title_faq,
      content: Strings.t_variant_stock_management_faq
    },
    {
      title: Strings.t_catalog_display_title_faq,
      content: Strings.t_catalog_display_faq
    },
    {
      title: Strings.t_variant_creation_editing_title_faq,
      content: Strings.t_variant_creation_editing_faq
    }
  ]

	return (
		<DetailPage
			goBack={navigation.goBack}
			navigate={navigation.navigate}
			navigation={navigation}
			pageTitle={Strings.t_title}
		>
        <Container style={{ flex: 1 }} backgroundColor={colors.lightBg}>
          <ScrollView>
            <Padding vertical={PADDING_SIZE} horizontal={PADDING_SIZE}>
              <FastImage
                source={{
                  uri: CreatVariantTipImage,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={{ width: 250, height: 250, alignSelf: 'center' }}
              />
              <KyteText
                color={colors.primaryDarker}
                size={20}
                textAlign="center"
                weight={500}
                lineHeight={20 * 1.4}
              >
                {Strings.t_tip_opening_title}
                
              </KyteText>
              <Margin bottom={PADDING_SIZE} />
              <KyteText
                color={colors.primaryDarker}
                size={FONT_MEDIUM_SIZE}
                textAlign="center"
                lineHeight={FONT_MEDIUM_SIZE * 1.5}
              >
                {renderBoldText(Strings.t_tip_opening_subtitle, {
                  size: FONT_MEDIUM_SIZE,
                })}
              </KyteText>
              <Margin bottom={PADDING_SIZE} />
              <SampleAlert
                data={variationsExample}
                subtitle={Strings.t_tip_example_variations_sub}
              />
              <Margin bottom={PADDING_SIZE} />
              <KyteText
                color={colors.primaryDarker}
                size={FONT_MEDIUM_SIZE}
                textAlign="center"
                lineHeight={FONT_MEDIUM_SIZE * 1.5}
              >
                {renderBoldText(Strings.t_tip_saved_variations_text, {
                  size: FONT_MEDIUM_SIZE,
                })}
              </KyteText>
              <Margin bottom={PADDING_SIZE} />
              <KyteText
                color={colors.primaryDarker}
                size={FONT_MEDIUM_SIZE}
                textAlign="center"
                lineHeight={FONT_MEDIUM_SIZE * 1.5}
              >
                {renderBoldText(Strings.t_tip_variant_limit_text, {
                  size: FONT_MEDIUM_SIZE,
                })}
              </KyteText>
              <Margin bottom={PADDING_SIZE} />
              <SampleAlert
                data={quantityExample}
              />
              <Margin bottom={PADDING_SIZE} />
              {faqData.map((item, index) => (
                <React.Fragment key={item.title}>
                  <AccordionFaqItem
                    title={item.title}
                    description={item.content}
                  />
                  <Margin bottom={8} />
                </React.Fragment>
              ))}
              
            </Padding>
          </ScrollView>
        </Container>
        
        <Container paddingTop={PADDING_SIZE} paddingBottom={PADDING_SIZE} borderTopWidth={1} borderColor={colors.lightBorder}> 
          <ActionButton
            onPress={navigation.goBack}
            full
            >
              {Strings.t_understand}
          </ActionButton>
        </Container>        
		</DetailPage>
	)
}

export default ProductVariantTips;
