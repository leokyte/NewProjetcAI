import React from "react";
import { Body12, Center, Container, KyteIcon, KyteText, Margin, Row } from "@kyteapp/kyte-ui-components";
import { connect } from "react-redux";
import { isColorDefault, useCalcColor } from "../../../../util/util-color";
import { colorsPierChart } from "../../../../styles";
import { logEvent } from "../../../../integrations";
import { KyteButton } from "../../../common";

const LoadContentTemplate = ({ 
    width, 
    height = 11, 
    backgroundColor = colorsPierChart[9], 
    borderRadius = 6 
}) => <Container 
        width={width} 
        height={height} 
        backgroundColor={backgroundColor} 
        borderRadius={borderRadius} 
    />

const MockColor = ({ where, hexColor }) => {
    const selectedPalleteColor = useCalcColor(hexColor);
    const tagStyle = {
        textAlign: 'center', 
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        color: selectedPalleteColor?.dark 
    }
    const textValue = '$$$'
    const tagText = '-10%'

    return(
        <Center>
            <Container
                alignItems='center' 
                backgroundColor='#FFF' 
                style={{zIndex: -1}}
                borderRadius={8}
                width="60%"
                height="100%"
                maxHeight={330}
                padding={16}
            >
                <Container width='100%'>
                    <Row justifyContent='space-between' alignItems="center">
                        <KyteIcon name="search" size={13} />
                        <LoadContentTemplate width='9%' backgroundColor={selectedPalleteColor?.light} />
                        <LoadContentTemplate width='15%' />
                        <LoadContentTemplate width='25%' />
                        <LoadContentTemplate width='15%' />
                        <LoadContentTemplate width='15%' />
                    </Row>
                </Container>

                <Container position='relative' width='100%' height="100%" justifyContent="space-around">
                    <Center justifyContent="center">
                        <Container 
                            backgroundColor={selectedPalleteColor?.primary} 
                            position="absolute"
                            alignItems='center'
                            justifyContent='center'
                            top={10}
                            left={1} 
                            zIndex={20}
                            style={tagStyle}
                            width="20%"
                            height="15%"
                        >
                            <Body12 color={selectedPalleteColor?.tertiary} weight={500}>
                                {tagText}
                            </Body12>
                        </Container>
                        <Container 
                            backgroundColor={selectedPalleteColor?.ultraLight} 
                            alignItems="center" 
                            justifyContent="center"
                            width="100%"
                            height={140}
                            borderRadius={8}
                        >
                            <KyteIcon size={56} name="square-camera" color={selectedPalleteColor?.ultraDark} />
                        </Container>
                    </Center>

                    <Margin bottom={8} />

                    <Container width='100%'>
                        <LoadContentTemplate width={60} height={15} backgroundColor={selectedPalleteColor?.light} />
                        <Margin bottom={8} />
                        <LoadContentTemplate width={148} height={20} />
                        <Margin bottom={8} />
                        <KyteText size={22} color={selectedPalleteColor?.dark}  weight={500}>
                            {textValue}
                        </KyteText>
                    </Container>

                    <Margin bottom={15} />

                    <KyteButton
                        style={{ backgroundColor: selectedPalleteColor?.primary }}
                        activeOpacity={1}
                        height={22}
                        onPress={() => 
                            logEvent(
                                "Catalog Color Preview Click", 
                                { where, color_type: isColorDefault(hexColor) ? "preset" : "custom" }
                            )
                        }
                    >
                        <KyteIcon name="cart" size={14} color="white" />
                        <Margin right={5} />
                        <Body12 color={selectedPalleteColor?.tertiary}>
                            {textValue}
                        </Body12>
                    </KyteButton>
                    <Margin bottom={6} />
                </Container>
            </Container>
        </Center>
    )
}


export default connect(
    (state) => ({
      hexColor: state.catalog.color
    })
  )(MockColor);
