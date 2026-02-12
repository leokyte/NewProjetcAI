import React, { useState } from "react";
import { colors } from "../../../../styles";
import { AccordeonItem } from "../../../statistics/StatisticsDetail/Tables/Accordeon/AccordeonItem";
import { KyteText, Padding, Container } from "@kyteapp/kyte-ui-components";
import { View } from "react-native";
import { renderBoldText } from "../../../../util";

interface AccordionFaqItemProps { 
  title: string;
  description?: string;
  content?: JSX.Element;
}

const AccordionFaqItem = ({ title, description, content }: AccordionFaqItemProps) => {
  const FONT_MEDIUM_SIZE = 16;
  const [parentWidth, setParentWidth] = useState(0);

  return (
    <AccordeonItem
    style={{
      backgroundColor: colors.white,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
    }}
    accordeonHeader={
      <KyteText lineHeight={FONT_MEDIUM_SIZE * 1.5} size={FONT_MEDIUM_SIZE} color={colors} weight={500}>{title}</KyteText>
    }
    accordeonChildren={
      <View
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setParentWidth(width);
        }}
      >
         <Padding top={26}>
          <Container
            backgroundColor={colors.lightBorder}
            position="absolute"
            top={10}
            left={-14}
            height={1}
            width={parentWidth + 28}
          />
          {Boolean(description) && <KyteText
            size={12}
            lineHeight={12 * 1.5}
            color={colors.primaryDarker}
          >
            {renderBoldText(description)}
          </KyteText>}
          {Boolean(content) && content}
        </Padding>
      </View>
    }
  />
  )
}

export default AccordionFaqItem;
