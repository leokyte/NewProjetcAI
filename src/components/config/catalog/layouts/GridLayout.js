import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, Type } from '../../../../styles';
import { KyteIcon } from '../../../common';
import ProductImage from '../../../products/image/ProductImage';

const SCREEN_WIDTH = 400;
const CONTAINER_PADDING_HORIZONTAL = (SCREEN_WIDTH * 0.33) / 2;
const CONTAINER_SIZE = SCREEN_WIDTH - CONTAINER_PADDING_HORIZONTAL * 2;
const HEIGHT_CARD = CONTAINER_SIZE - 150;
const WIDTH_CARD = CONTAINER_SIZE - 170;
const HEIGHT_BLOCK_IMAGE = HEIGHT_CARD * 0.6;

const GridLayout = (props) => {
  const {
    cardContainer,
    cardSize,
    cardImageContainer,
    imageStyle,
    cardInfoContainer,
    cardInfoProductName,
    cardInfoCurrencyStyle,
  } = styles;

  const renderImage = () => {
    if (!props.product.image) {
      return <KyteIcon name="no-picture" color={colors.disabledIcon} size={60} />;
    }
    return <ProductImage style={imageStyle} product={props.product} />;
  };

  const renderCard = () => (
    
      <View style={cardSize}>
        <View style={cardImageContainer}>{renderImage()}</View>
        <View style={cardInfoContainer}>
            <View style={cardInfoProductName} />
            <View style={cardInfoProductName} />
            <Text
              style={[Type.SemiBold, Type.fontSize(14), cardInfoCurrencyStyle(props.colorSelected)]}
            >
              $$$
            </Text>
        </View>
      </View>
  );

  return (
    <View style={styles.gridContainer}>
      <View style={cardContainer}>
        <View>
          {renderCard()}
          {renderCard()}
        </View>
        <View>
          {renderCard()}
          {renderCard()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    padding: 10,
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: colors.borderlight,
    borderWidth: 3,
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  cardSize: {
    height: HEIGHT_CARD,
    width: WIDTH_CARD,
    overflow: 'hidden',
    margin: 5,
    borderRadius: 8,
  },
  cardImageContainer: {
    height: HEIGHT_BLOCK_IMAGE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'transparent',
    backgroundColor: colors.borderlight
  },
  imageStyle: {
    borderRadius: 8,
    width: '100%',
    height: '100%',
  },
  cardInfoContainer: {
    height: 70,
    padding: 6,
  },
  cardInfoProductName: {
    backgroundColor: colors.borderlight,
    height: 4,
    marginTop: 3,
  },
  cardInfoCurrencyStyle: (color) => ({
    color,
    textAlign: 'center',
    marginTop: 3,
  }),
});

export default GridLayout;
