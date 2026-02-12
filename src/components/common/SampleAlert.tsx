import React from "react";
import { Container, KyteText, Row } from "@kyteapp/kyte-ui-components";
import { colors } from "../../styles";
import { renderBoldText } from "../../util";
import I18n from "../../i18n/i18n";
import { FlatList } from "react-native";

const Strings = {
  t_title: I18n.t("otherPaymentMethods.titleExampleOtherPaymentMethods")
}

interface SampleAlertProps { 
  data: string[];
  subtitle?: string;
}

const SampleAlert = ({ data, subtitle }: SampleAlertProps) => { 
  const PADDING_SIZE = 16;

  return (
    <Container backgroundColor={colors.green08} padding={PADDING_SIZE} borderRadius={8}>
      <KyteText color={colors.primaryDarker} weight={500} size={14} lineHeight={14 * 1.5}>{Strings.t_title}</KyteText>
      {subtitle && (
        <KyteText color={colors.primaryDarker} size={13} lineHeight={13 * 1.5}>{subtitle}</KyteText>
      )}
      <FlatList
        data={data}
        keyExtractor={(item: string) => item}
        renderItem={({ item }: { item: string }) => (
          <Row>
            <KyteText
              size={13}
              color={colors.primaryDarker}
              marginRight={8}
              marginLeft={8}
              lineHeight={13 * 1.5}
            >
              •
            </KyteText>
            <KyteText
              size={13}
              color={colors.primaryDarker}
              lineHeight={13 * 1.5}
            >
              {renderBoldText(item, { size: 13 })}
            </KyteText>
          </Row>
          
        )}
      />
    </Container>
  )
}

export default SampleAlert;
