import React, { useRef, useState } from "react";
import {
  TouchableOpacity,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Caption09, Container, Padding, Body16, Margin } from '@kyteapp/kyte-ui-components';
import FastImage from "react-native-fast-image";
import Body14 from "@kyteapp/kyte-ui-components/src/packages/text/typography/body14/Body14";
import { ActionButton, KyteIcon } from "../../../components/common";
import { colors } from "../../../styles";
import NavigationService from "../../../services/kyte-navigation";
import I18n from "../../../i18n/i18n";

const { width: screenWidth } = Dimensions.get("window");
const isIPad = screenWidth > 600;

export type CarouselItem = {
  image: string;
  title: string;
  paragraph: string;
};

type Props = {
  data: CarouselItem[];
};

export const OnBoardingCarouselCoupons: React.FC<Props> = ({ data }) => {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const containerWidth = isIPad ? 600 : screenWidth;
  const imageSize = isIPad ? 300 : screenWidth;

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(i, data.length - 1));
    setIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * containerWidth, animated: true });
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / containerWidth);
    if (newIndex !== index) setIndex(newIndex);
  };

  const item = data[index];

  return (
    <Container flex={1}>
      <Container width="100%" alignItems="center" position="relative" paddingBottom={20}>
        <ScrollView
					ref={scrollRef}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onMomentumScrollEnd={onMomentumScrollEnd}
					keyboardShouldPersistTaps="handled"
					style={{ width: containerWidth }}
					contentContainerStyle={{
						width: containerWidth * data.length,
						alignItems: "center",
					}}
				>
          {data.map((d, i) => (
            <Container
              key={i}
              width={containerWidth}
              justifyContent="center"
              alignItems="center"
              position="relative"
              zIndex={999}
            >
              {i !== 0 && (
                <TouchableOpacity
                  style={[styles.arrow, { left: 20 }]}
                  onPress={() => goTo(i - 1)}
                >
                  <KyteIcon name="back-navigation" size={16} color={colors.primaryDarker} />
                </TouchableOpacity>
              )}

              <FastImage
                source={{
                  uri: d.image,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={{
                  width: imageSize,
                  height: imageSize,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />

              {i !== data.length - 1 && (
                <TouchableOpacity
                  style={[styles.arrow, { right: 20 }]}
                  onPress={() => goTo(i + 1)}
                >
                  <KyteIcon name="nav-arrow-right" size={16} color={colors.primaryDarker} />
                </TouchableOpacity>
              )}
            </Container>
          ))}
        </ScrollView>

        <Margin top={30} />
				
				<Container 
					flexDirection="row" 
					justifyContent="space-between" 
					alignItems="center" 
					width="100%" 
					padding={8}
				>
					<Container width={20} />
					<Container flexDirection="row" marginVertical={12}>
						{data.map((_, i) => (
							<TouchableOpacity
								key={i}
								onPress={() => goTo(i)}
								style={[
									styles.dot(data),
									i !== index && styles.dotActive(data),
								]}
							/>
						))}
					</Container>
					<Container
						backgroundColor={colors.littleDarkGray}
						borderRadius={24}
					>
						<Padding vertical={4} horizontal={8}>
							<Caption09 color={colors.primaryDarker} textAlign="center">
								{index + 1} / {data.length}
							</Caption09>
						</Padding>
					</Container>
				</Container>

        <Margin top={15} />

        <Padding horizontal={16}>
          <Body16 weight={600} textAlign="center" lineHeight={25} marginBottom={5}>
            {item.title}
          </Body16>
          <Body14 textAlign="center" lineHeight={24}>
            {item.paragraph}
          </Body14>
        </Padding>
      </Container>

      <Container padding={16} backgroundColor={colors.white} position="absolute" bottom={0} width="100%">
        <ActionButton full onPress={() => NavigationService.navigate("CouponsTypeChoice")}>
          {I18n.t("coupons.onBoarding.createNewCoupon")}
        </ActionButton>
      </Container>
    </Container>
  );
};

const styles = {
  arrow: {
    backgroundColor: colors.littleDarkGray,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute" as const,
    zIndex: 20,
  },
  dot: (data: any) => ({
    width: data.length > 8 ? 18 : 24,
    height: 4,
    borderRadius: 0,
    marginHorizontal: 6,
    backgroundColor: colors.actionColor,
  }),
  dotActive: (data: any) => ({
    backgroundColor: "#D9D9D9",
    width: data.length > 8 ? 18 : 24,
    height: 4,
  }),
};
