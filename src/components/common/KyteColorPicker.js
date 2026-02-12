import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useIsSmallScreen } from '@kyteapp/kyte-ui-components';
import { colors, colorGrid, Type, gridStyles } from '../../styles';
import { KyteIcon } from '../common';
import ProductImage from '../products/image/ProductImage';

const KyteColorPicker = (props) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const isMobile = useIsSmallScreen();
  const sizeMultiplier = isMobile ? 0.1 : 0.3;

  const width = containerWidth.toFixed(2) - containerWidth * sizeMultiplier;
  const height = width;
  const heightCard = height * 0.55;
  const widthCard = width * 0.45;
  const heightBlockImage = height * 0.3;
  const heightBlock = height * 0.2;
  const top = (height - (heightBlock + heightBlockImage)) * 0.5;
  const left = (width - widthCard) * 0.5;

  const setWidth = (event) => {
    const viewWidth = event.nativeEvent.layout.width;
    setContainerWidth(viewWidth);
  };

  const {
    cardContainer,
    cardSize,
    cardStyle,
    cardImageContainer,
    cardInfoContainer,
    cardInfoProductName,
    cardInfoCurrencyStyle,
    cardInfoPriceStyle,
  } = styles;

  const adjustPosition = (marginY, marginX, positionY, positionX) => {
    const object = { y: {}, x: {}, adjustPosition: {} };
    const marginValue = -20;
    const baseCalc = 371.43;
    const difference = width / baseCalc;
    const isSmaller = difference < 1 ? 1.02 : 1;
    const isBigger = difference > 1 ? 0.98 : 1;
    positionY = positionY * difference * isSmaller * isBigger;
    positionX = positionX * difference * isSmaller * isBigger;

    if (marginY === 'top') {
      object.adjustPosition.marginTop = marginValue;
      object.y.top = positionY;
    } else {
      object.adjustPosition.marginBottom = marginValue;
      object.y.bottom = positionY;
    }

    if (marginX === 'left') {
      object.adjustPosition.marginLeft = marginValue;
      object.x.left = positionX;
    } else {
      object.adjustPosition.marginRight = marginValue;
      object.x.right = positionX;
    }

    return object;
  };

  const renderCircleBorder = () => {
    return <View style={styles.circleBorder(width, height)} />;
  };

  const renderCircleBackground = () => {
    return <View style={styles.circleBackground(props.colorSelected, width, height)} />;
  };

  const renderCircles = () => {
    const axes = [
      adjustPosition('bottom', 'left', 60, 67),
      adjustPosition('bottom', 'left', 159.71, 15),
      adjustPosition('top', 'left', 100, 36),
      adjustPosition('top', 'left', 24, 125),
      adjustPosition('top', 'right', 24, 125),
      adjustPosition('top', 'right', 100, 36),
      adjustPosition('bottom', 'right', 159.71, 15),
      adjustPosition('bottom', 'right', 60, 67),
      adjustPosition('bottom', 'left', 13, 185.71),
    ];

    const checkIcon = <KyteIcon name="check" color={colors.drawerIcon} size={14} />;

    return colorGrid.map((item, index) => {
      const isColorSelected = props.colorSelected === item.foreground;
      return (
        <View key={index} style={[axes[index].y, axes[index].x, { position: 'absolute' }]}>
          <TouchableOpacity
            style={[axes[index].adjustPosition, styles.buttonCircleColor(isColorSelected ? 0 : 10)]}
            onPress={() => props.onPressColor(item.foreground)}
          >
            <View
              style={[
                styles.circleColor(isColorSelected ? 40 : 20, item.foreground),
                isColorSelected ? { borderWidth: 3, borderColor: colors.lightBg } : null,
              ]}
            >
              {isColorSelected ? checkIcon : null}
            </View>
          </TouchableOpacity>
        </View>
      );
    });
  };

  const renderImage = () => {
    if (!props.product.image)
      return <KyteIcon name={'no-picture'} color={colors.disabledIcon} size={50} />;
    return <ProductImage style={gridStyles.flexImage} product={props.product} />;
  };

  const renderCard = () => {
    return (
      <View style={[cardContainer(left, top)]}>
        <View style={cardSize(widthCard, heightCard)}>
          <View style={cardStyle}>
            <View style={cardImageContainer(heightBlockImage)}>{renderImage()}</View>
            <View style={cardInfoContainer(heightBlock)}>
              <View style={cardInfoProductName} />
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={[
                    Type.SemiBold,
                    Type.fontSize(14),
                    cardInfoCurrencyStyle(props.colorSelected),
                  ]}
                >
                  $$$
                </Text>
                <View style={cardInfoPriceStyle} />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View onLayout={(event) => setWidth(event)} style={styles.container}>
      <View style={styles.innerContainer}>
        {props.hideCard ? null : renderCard()}
        {renderCircleBackground()}
        {renderCircleBorder()}
        {renderCircles()}
      </View>
    </View>
  );
};
// <LinearGradient
// 	colors={[props.colorSelected, 'white']}
// 	start={{x: 0, y: 0}} end={{x: 0, y: 1}}
// 	locations={[0.65, 0.35]}
// 	style={{ borderRadius: height }}
// 	>
// </LinearGradient>

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  innerContainer: {
    position: 'relative',
  },
  circleColor: (size, color) => {
    return {
      height: size,
      width: size,
      borderRadius: size,
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    };
  },
  buttonCircleColor: (size) => {
    return {
      height: 40,
      width: 40,
      padding: size,
    };
  },
  circleBackground: (borderBottomColor, width, height) => {
    return {
      position: 'absolute',
      left: 5,
      width: width - 10,
      height: height - 10,
      borderRadius: height,
      borderBottomWidth: height - height * 0.4,
      borderBottomColor,
    };
  },
  circleBorder: (width, height) => ({
    height,
    width,
    borderWidth: 26,
    borderColor: colors.lightBg,
    borderRadius: height,
    backgroundColor: 'transparent',
  }),
  cardContainer: (left, top) => ({
    position: 'absolute',
    left,
    top,
    zIndex: 5,
  }),
  cardSize: (widthCard, heightCard) => ({
    height: heightCard,
    width: widthCard,
  }),
  cardStyle: {
    borderWidth: 3,
    borderColor: colors.lightBg,
    borderRadius: 4,
  },
  cardImageContainer: (heightBlockImage) => ({
    height: heightBlockImage,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: colors.borderlight,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  cardImageStyle: (widthCard, heightBlockImage) => ({
    width: widthCard,
    height: heightBlockImage,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  }),
  cardInfoContainer: (heightBlock) => ({
    height: heightBlock,
    paddingHorizontal: 15,
    paddingVertical: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white',
  }),
  cardInfoProductName: {
    backgroundColor: colors.littleDarkGray,
    height: 5,
    marginVertical: 5,
  },
  cardInfoCurrencyStyle: (color) => {
    return {
      color,
      flex: 0.5,
      alignContent: 'flex-start',
    };
  },
  cardInfoPriceStyle: {
    flex: 0.5,
    height: 3,
    marginTop: 10,
    backgroundColor: colors.littleDarkGray,
  },
};

export { KyteColorPicker };
