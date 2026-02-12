import React from 'react';
import { View, Text } from 'react-native';
import { colors, Type, gridStyles } from '../../../../styles';
import { KyteIcon } from '../../../common';
import ProductImage from '../../../products/image/ProductImage';

const SCREEN_WIDTH = 400;
const CONTAINER_PADDING_HORIZONTAL = (SCREEN_WIDTH * 0.33) / 2;
const CONTAINER_SIZE = SCREEN_WIDTH - CONTAINER_PADDING_HORIZONTAL * 2;
const HEIGHT_CARD = CONTAINER_SIZE - 10;
const WIDTH_CARD = CONTAINER_SIZE - 53;
const HEIGHT_BLOCK_IMAGE = HEIGHT_CARD * 0.6;
const HEIGHT_BLOCK = HEIGHT_CARD * 0.4;
const TOP_CARD = 0;
const LEFT_CARD = 0;

const InstagramLayout = (props) => {
  const {
    cardContainer,
    cardSize,
    cardImageContainer,
    cardInfoContainer,
    cardInfoProductName,
    cardInfoCurrencyStyle,
    cardInfoPriceStyle,
  } = styles;

  const renderImage = () => {
    if (!props.product.image) {
      return <KyteIcon name="no-picture" color={colors.disabledIcon} size={60} />;
    }
    return <ProductImage style={gridStyles.flexImage} product={props.product} />;
  };

  return (
    <View style={cardContainer}>
      <View style={cardSize}>
        <View style={cardImageContainer}>{renderImage()}</View>
        <View style={cardInfoContainer}>
          <View style={cardInfoProductName} />
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={[Type.SemiBold, Type.fontSize(14), cardInfoCurrencyStyle(props.colorSelected)]}
            >
              $$$
            </Text>
            <View style={cardInfoPriceStyle} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = {
  cardContainer: {
    left: LEFT_CARD,
    top: TOP_CARD,
    zIndex: 105,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: colors.borderlight,
    borderWidth: 3,
  },
  cardSize: {
    height: HEIGHT_CARD,
    width: WIDTH_CARD,
  },
  cardImageContainer: {
    height: HEIGHT_BLOCK_IMAGE,
    backgroundColor: colors.borderlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfoContainer: {
    height: HEIGHT_BLOCK,
    padding: 20,
    flexDirection: 'column',
  },
  cardInfoProductName: {
    backgroundColor: colors.borderlight,
    height: 7,
    marginBottom: 5,
  },
  cardInfoCurrencyStyle: (color) => ({
      color,
      flex: 0.5,
      alignContent: 'flex-start',
    }),
  cardInfoPriceStyle: {
    flex: 0.5,
    height: 5,
    marginTop: 10,
    backgroundColor: colors.lightBg,
  },
};

export default InstagramLayout;
