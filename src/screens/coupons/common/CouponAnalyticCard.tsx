import React from "react"
import Container from "@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container"
import { colors } from "../../../styles"
import { CurrencyText, KyteIcon } from "../../../components/common"
import Margin from "@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin"
import KyteText from "@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText"
import I18n from "../../../i18n/i18n"
import Row from "@kyteapp/kyte-ui-components/src/packages/scaffolding/row/Row"
import { ActivityIndicator, TouchableOpacity } from "react-native"

export interface CouponAnalyticCardProps {
  values?: { 
    count: number,
    total: number,
    avg?: number
  },
  isLoading: boolean,
  onRefresh: () => void
}

interface AnalyticDataComponentProps {
  name: string,
  icon: string,
  value: React.ReactNode
}

export const CouponAnalyticCard = ({ values, isLoading, onRefresh }: CouponAnalyticCardProps) => {
  const baseContainerProps = {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const
  }

  const analyticsDataComponent: AnalyticDataComponentProps[] = [
    {
      name: `${I18n.t("customerTabSalesLabel")}:`,
      icon: "check-in",
      value: (
        <KyteText size={12} weight={500} color={colors.primaryColor}>
          {values?.count}
        </KyteText>
      )
    },
    {
      name: `${I18n.t("statisticRevenue")}:`,
      icon: "dollar-sign",
      value: (
        <CurrencyText
          value={values?.total}
          style={{
            color: values && values.total > 0 ? colors.actionColor : colors.primaryColor,
            fontWeight: "500"
          }}
        />
      )
    }
  ]

  const renderErrorCard = () => (
    <Container width="100%" {...baseContainerProps}>
      <KyteText size={14}>{I18n.t("coupons.analyticsError")}</KyteText>
      <Margin top={2} />
      <TouchableOpacity onPress={onRefresh} style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
        <Row alignItems="center">
          <KyteIcon name="refresh" size={20} />
          <Margin right={12} />
          <KyteText size={16} weight={500}>
            {I18n.t("stockConnectivityStatusButtonIfo")}
          </KyteText>
        </Row>
      </TouchableOpacity>
    </Container>
  )

  const renderAnalyticCards = () => (
    <Row alignItems="center" justifyContent="space-between">
      {analyticsDataComponent.map((item, index) => (
        <Container key={index} width="48%" {...baseContainerProps}>
          <KyteIcon name={item.icon} size={20} />
          <Margin top={4} />
          <KyteText size={12}>{item.name}</KyteText>
          <Margin top={4} />
          {isLoading ? <ActivityIndicator size="small" color={colors.actionColor} /> : item.value}
        </Container>
      ))}
    </Row>
  )

  if (!values && !isLoading) {
    return (
      <Container height={96} width="100%">
        {renderErrorCard()}
      </Container>
    )
  }

  return (
    <Container height={96} width="100%">
      {renderAnalyticCards()}
    </Container>
  )
}
