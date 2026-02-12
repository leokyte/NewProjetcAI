import React, {Component} from 'react';
import {Animated, Dimensions, Text, View} from 'react-native';
import {CurrencyText} from '../../../common';
import {
  colors,
  gridStyles,
  labelContainerDefaults,
  lineStyles,
  gridItemDefaults,
} from '../../../../styles';
import ProductImage from '../../../products/image/ProductImage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const Y_DROP_POSITION = SCREEN_HEIGHT - 120;
const X_DROP_POSITION = SCREEN_WIDTH / 3;

class ItemAnimation extends Component {
  constructor(props) {
    super(props);
    const {itemX, itemY, type, itemHeight} = this.props;

    //const topMeasure = () => {
    //if (type === 'grid') return (0.5 * itemHeight);
    //return (1.5 * itemHeight);
    //};

    const bottomMeasure = () => {
      if (type === 'grid') return 0.8 * itemHeight;
      return 2.3 * itemHeight;
    };

    const yInitPosition = () => {
      const idealMeasure = type === 'grid' ? itemHeight : itemHeight;
      const initPosition = itemY + idealMeasure;
      if (initPosition > Y_DROP_POSITION) return itemY - bottomMeasure();
      return initPosition;
    };

    this.state = {
      isVisible: true,
      animationY: new Animated.Value(yInitPosition()),
      animationX: new Animated.Value(itemX - 5),
      animationScale: new Animated.Value(1),
      animationOpacity: new Animated.Value(1),
    };
  }

  componentDidMount() {
    const {animationY, animationX, animationScale, animationOpacity} =
      this.state;
    const {type} = this.props;

    const calculateDropY = () => {
      if (type === 'grid') return Y_DROP_POSITION;
      return Y_DROP_POSITION + 30;
    };
    const calculateScale = () => {
      if (type === 'grid') return 0.4;
      return 0.6;
    };
    const animationDuration = 350;

    Animated.parallel([
      Animated.timing(animationScale, {
        toValue: calculateScale(),
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(animationY, {
        toValue: calculateDropY(),
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(animationX, {
        toValue: X_DROP_POSITION,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(animationOpacity, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.setState({isVisible: false});
      this.props.removeAnimatedItem();
    });
  }

  animationStyles() {
    const {animationX, animationY, animationScale, animationOpacity} =
      this.state;

    return {
      transform: [
        {translateX: animationX},
        {translateY: animationY},
        {scale: animationScale},
      ],
      opacity: animationOpacity,
    };
  }

  renderListItem() {
    const {product} = this.props;
    const {itemContainer, labelContainer} = lineStyles;
    const removeBorder = {borderBottomWidth: 0};

    return (
      <View pointerEvents="none" style={[itemContainer, removeBorder]}> 
        <View
          style={[
            labelContainer,
            labelContainerDefaults(product.foreground || colors.primaryBg),
          ]}>
          {this.renderImage()}
        </View>
      </View>
    );
  }

  renderImage() {
    const {product, type} = this.props;
    const labelStyle =
      type === 'grid' ? gridStyles.labelStyle : lineStyles.labelStyle;
    const imgStyle =
      type === 'grid' ? gridStyles.flexImage : lineStyles.flexImage;

    if (product.image) {
      return (
        <ProductImage
          product={product}
          style={imgStyle}
          source={{uri: product.image}}
        />
      );
    }
    return (
      <Text allowFontScaling={false} style={labelStyle}>
        {product.label}
      </Text> 
    );
  }

  renderGridItem() {
    const {product} = this.props;
    const {
      itemStyles,
      labelContainer,
      descriptionContainer,
      nameStyle,
      priceStyle,
    } = gridStyles;
    const hasPromotionalPrice = Number.isFinite(product.salePromotionalPrice);

    return (
      <View
        pointerEvents="none"
        style={[
          itemStyles(product.background || colors.secondaryBg),
          gridItemDefaults,
        ]}>
        <View
          style={[
            labelContainer,
            labelContainerDefaults(product.foreground || colors.primaryBg),
          ]}>
          {this.renderImage()}
        </View> 
        <View style={descriptionContainer(hasPromotionalPrice ? 60 : 45)}> 
          <Text
            allowFontScaling={false}
            ellipsizeMode="tail"
            numberOfLines={1}
            style={nameStyle}>
            {product.name}
          </Text>
          <CurrencyText
            style={priceStyle}
            value={product.salePromotionalPrice || product.salePrice}
          />
        </View>
      </View>
    );
  }

  renderAnimation() {
    const {outerContainer} = styles;
    const {type, itemWidth, product} = this.props;

    return (
      <Animated.View
        pointerEvents="none"
        style={[this.animationStyles(), outerContainer(itemWidth + 10)]}>
        {type === 'grid'
          ? this.props?.renderGridItem?.(product) ?? this.renderGridItem()
          : this.props?.renderListItem?.(product) ?? this.renderListItem()}
      </Animated.View>
    );
  }

  render() {
    const {isVisible} = this.state;
    return isVisible ? this.renderAnimation() : null;
  }
}

const styles = {
  outerContainer: (width) => ({
    position: 'absolute',
    width,
  }),
};

export default ItemAnimation;
