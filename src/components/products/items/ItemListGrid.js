import React, {PureComponent} from 'react';
import {View, Text, TouchableWithoutFeedback, Platform} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {
  capitalizeFirstLetter,
  checkStockValueStatus,
  getVirtualCurrentStock,
} from '../../../util';

import {CurrencyText, TouchAnimation, ProductPinStar} from '../../common';
import {
  gridStyles,
  labelContainerDefaults,
  gridItemDefaults,
  animationContainer,
  colors,
} from '../../../styles';

class ItemListGrid extends PureComponent {
  constructor(props) {
    super(props);
    this.itemRef = React.createRef();
    this.itemViewRef = React.createRef();
  }

  state = {
    refresh: false,
  };

  UNSAFE_componentWillReceiveProps() {
    const {refresh} = this.state;
    this.setState({refresh: !refresh});
  }

  itemPress() {
    const {product, noAnimation} = this.props;

    if (!noAnimation) {
      const animatableItem = this.itemRef.current;
      if (animatableItem?.pulse) {
        animatableItem.pulse(320);
      }
      const itemView = this.itemViewRef.current;
      itemView?.measure((x, y, width, height, pageX, pageY) => {
        const itemX = pageX;
        const itemY = pageY - height;
        if (itemX)
          this.props.animateItem(itemX, itemY, height, width, 'grid', product);
      });
    }
    this.props.onPress(product);
  }

  renderImage() {
    const {product, roundedBorders} = this.props;
    // Codesplit require
    const ProductImage = product.image
      ? require('../image/ProductImage').default
      : null;

    if (product.image) {
      if (Platform.OS === 'ios') {
        return (
          <View
            style={{
              height: '100%',
              width: '100%',
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              overflow: 'hidden',
            }}>
            <ProductImage
              product={product}
              style={[
                gridStyles.flexImage,
                roundedBorders
                  ? {borderTopLeftRadius: 4, borderTopRightRadius: 4}
                  : null,
              ]}
            />
          </View>
        );
      }
      return (
        <ProductImage
          product={product}
          style={[
            gridStyles.flexImage,
            {borderTopLeftRadius: 4, borderTopRightRadius: 4},
          ]}
        />
      );
    }
    return (
      <Text allowFontScaling={false} style={gridStyles.labelStyle}>
        {product.label}
      </Text>
    );
  }

  renderStockCircle() {
    const {product} = this.props;
    const stockStatus = checkStockValueStatus(
      getVirtualCurrentStock(product),
      product.stock,
      product
    );
    // Codesplit require
    const {StockCircle} = product?.stockActive ? require('../../common') : null;

    if (stockStatus) {
      return <StockCircle status={stockStatus} coreStyle={'gridItem'} />;
    }
    return;
  }

  renderTouchAnimation() {
    const {onLongPress} = this.props;
    return (
      <TouchableWithoutFeedback
        onPress={() => this.itemPress()}
        onLongPress={onLongPress}>
        <View style={animationContainer}>
          <TouchAnimation size={70} color={colors.actionColor} />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  renderPinStar() {
    const style = {marginRight: 3};
    return (
      <View style={style}>
        <ProductPinStar shadow />
      </View>
    );
  }

  render() {
    const {product, onLongPress, showTouchIndicator} = this.props;
    //const { imageExist } = this.state;
    const {
      itemContainer,
      itemStyles,
      labelContainer,
      descriptionContainer,
      nameStyle,
      priceStyle,
      oldPriceStyle,
    } = gridStyles;
    const itemColor = product.foreground
      ? product.foreground
      : colors.primaryBg;
    const hasPromotionalPrice = Number.isFinite(product.salePromotionalPrice);
    const titleContainerStyle = {flexDirection: 'row'};

    return (
      <View style={itemContainer}>
        {showTouchIndicator ? this.renderTouchAnimation() : null}
        <Animatable.View ref={this.itemRef} style={[this.props.style]}>
          <TouchableWithoutFeedback
            onPress={() => this.itemPress()}
            onLongPress={onLongPress}>
            <View
              ref={this.itemViewRef}
              style={[
                itemStyles(product.background || colors.secondaryBg),
                gridItemDefaults,
              ]}>
              {product?.stockActive ? this.renderStockCircle() : null}
              <View style={[labelContainer, labelContainerDefaults(itemColor)]}>
                {this.renderImage()}
              </View>
              <View style={descriptionContainer(hasPromotionalPrice ? 60 : 45)}>
                <View style={titleContainerStyle}>
                  {product.pin ? this.renderPinStar() : null}
                  <Text
                    ellipsizeMode={'tail'}
                    numberOfLines={1}
                    style={nameStyle}
                    allowFontScaling={false}>
                    {capitalizeFirstLetter(product.name)}
                  </Text>
                </View>
                {hasPromotionalPrice ? (
                  <CurrencyText
                    style={priceStyle}
                    value={product.salePromotionalPrice}
                  />
                ) : null}
                <CurrencyText
                  style={hasPromotionalPrice ? oldPriceStyle : priceStyle}
                  value={product.salePrice}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animatable.View>
      </View>
    );
  }
}

export default ItemListGrid;
