import React from 'react';
import { View, Text, Platform } from 'react-native';
import { colors, Type } from '../../../../styles';
import { KyteIcon } from '../../../common';
import ProductImage from '../../../products/image/ProductImage';

const SCREEN_HEIGHT = 400;
const SCREEN_WIDTH = 400;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;
const HEIGHT_FIXER = Platform.OS === 'ios' || SMALL_SCREENS ? 19.5 : 10;

const CONTAINER_PADDING_HORIZONTAL = (SCREEN_WIDTH * 0.33) / 2;
const CONTAINER_SIZE = SCREEN_WIDTH - CONTAINER_PADDING_HORIZONTAL * 2;
const PADDING_INTERNAL_CARDS = 7;
const HEIGHT_CARD = (CONTAINER_SIZE - (HEIGHT_FIXER + PADDING_INTERNAL_CARDS * 2)) / 3;
const WIDTH_CARD = CONTAINER_SIZE - 53;
const HEIGHT_BLOCK_IMAGE = HEIGHT_CARD;
const HEIGHT_BLOCK = HEIGHT_CARD;
const LEFT_CARD = 0;
const TOP_CARD_POSITION = (index) => HEIGHT_CARD * index + PADDING_INTERNAL_CARDS * index;

const ListLayout = (props) => {
  const {
    mainContainer,
    cardContainer,
    cardSize,
    cardImageContainer,
    cardImageStyle,
    cardInfoContainer,
    cardInfoProductName,
    cardInfoCurrencyStyle,
    cardInfoDescriptionStyle,
  } = styles;

  const renderImage = () => {
    if (!props.product.image) {
      return <KyteIcon name={'no-picture'} color={colors.disabledIcon} size={30} />;
    }
    return <ProductImage style={cardImageStyle} product={props.product} />;
  };

  const renderCard = (top) => {
    return (
      <View style={cardContainer(top)}>
        <View style={cardSize}>
          <View style={cardImageContainer}>{renderImage()}</View>
          <View style={cardInfoContainer}>
            <View style={cardInfoProductName} />
            <View style={cardInfoProductName} />
            <Text
              style={[Type.SemiBold, Type.fontSize(10), cardInfoCurrencyStyle(props.colorSelected)]}
            >
              $$$
            </Text>
            <View style={cardInfoDescriptionStyle} />
            <View style={cardInfoDescriptionStyle} />
            <View style={cardInfoDescriptionStyle} />
          </View>
        </View>
      </View>
    );
  };

  const renderSeparator = () => <View style={{ height: 10 }} />;
  return (
    <View style={mainContainer}>
      {renderCard(0)}
      {renderSeparator()}
      {renderCard(1)}
      {renderSeparator()}
      {renderCard(2)}
    </View>
  );
};

const styles = {
  mainContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: colors.borderlight,
    borderWidth: 3,
  },
  cardContainer: (top) => {
    return {
      // position: 'absolute',
      left: LEFT_CARD,
      // top: TOP_CARD_POSITION(top),
      // zIndex: 105,
    };
  },
  cardSize: {
    height: HEIGHT_CARD,
    width: WIDTH_CARD,
    flexDirection: 'row',
  },
  cardImageContainer: {
    flex: 0.5,
    height: HEIGHT_BLOCK_IMAGE,
    width: WIDTH_CARD / 2,
    backgroundColor: colors.borderlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageStyle: {
    width: WIDTH_CARD / 2 - 15,
    height: HEIGHT_BLOCK_IMAGE,
  },
  cardInfoContainer: {
    flex: 0.5,
    height: HEIGHT_BLOCK,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'column',
  },
  cardInfoProductName: {
    backgroundColor: colors.borderlight,
    height: 3,
    marginBottom: 5,
  },
  cardInfoCurrencyStyle: (color) => {
    return {
      color,
      alignContent: 'flex-start',
      marginVertical: 5,
    };
  },
  cardInfoDescriptionStyle: {
    height: 2,
    marginVertical: 2,
    backgroundColor: colors.lightBg,
  },
};

export default ListLayout;
