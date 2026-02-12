import React from "react"
import { Container, KyteText } from "@kyteapp/kyte-ui-components"
import { colors } from "../../styles"
import I18n from "../../i18n/i18n"

const Strings = {
  t_step: I18n.t('words.s.step'),
  t_from: I18n.t('words.s.of')
}

const StepCounter = ({ currentStep, totalSteps }: {
  currentStep: number,
  totalSteps: number
}) => { 
  return (
    <Container paddingTop={2} paddingBottom={2} paddingLeft={4} paddingRight={4} backgroundColor={colors.lightBg} marginRight={12} borderRadius={4}>
      <KyteText color={colors.secondaryBg} size={12} weight={500} lineHeight={18}>{Strings.t_step} {currentStep} {Strings.t_from} {totalSteps}</KyteText>
    </Container>
  )
}

export default StepCounter
