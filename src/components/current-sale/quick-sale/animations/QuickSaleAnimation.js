import React, { Component } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { CurrencyText } from '../../../common';
import { colors } from '../../../../styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const Y_DROP_POSITION = SCREEN_HEIGHT - 240;
const X_DROP_POSITION = 10;

class QuickSaleAnimation extends Component {
  constructor(props) {
    super(props);
    const { itemX, itemY } = this.props;

    this.state = {
      animationY: new Animated.Value(itemY),
      animationX: new Animated.Value(itemX),
      animationScale: new Animated.Value(1),
      animationOpacity: new Animated.Value(1)
    };
  }

  componentDidMount() {
    const { animationY, animationX, animationScale, animationOpacity } = this.state;
    const animationDuration = 350;

    Animated.parallel([
      Animated.timing(animationScale, {
        toValue: 0.2,
        duration: animationDuration,
        useNativeDriver: true
      }),
      Animated.timing(animationY, {
        toValue: Y_DROP_POSITION,
        duration: animationDuration,
        useNativeDriver: true
      }),
      Animated.timing(animationX, {
        toValue: X_DROP_POSITION,
        duration: animationDuration,
        useNativeDriver: true
      }),
      Animated.timing(animationOpacity, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true
      })
    ]).start(() => {
      this.props.removeAnimatedItem();
    });
  }

  animationStyles() {
    const { animationX, animationY, animationScale, animationOpacity } = this.state;

    return {
      transform: [
        { translateX: animationX },
        { translateY: animationY },
        { scale: animationScale },
      ],
      opacity: animationOpacity
    };
  }

  render() {
    const { screenContainer, valueContainer, inputStyle, outerContainer } = styles;
    const { salePrice, width, height } = this.props;    
    return (
      <Animated.View
        pointerEvents='none'
        ref='QuickSaleAnimated'
        style={[this.animationStyles(), outerContainer(width, height)]}
      >
        <View style={screenContainer}>
          <View style={valueContainer}>
            <View style={{ flexDirection: 'row' }}>
              <CurrencyText
                separateCurrency
                currencySize={24}
                style={inputStyle(colors.primaryColor)}
                value={salePrice}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }
}

const textSize = 56;
const styles = {
  outerContainer: (width, height) => ({
    position: 'absolute',
    zIndex: 100,
    width,
    height
  }),
  inputStyle: (color) => ({
      fontSize: textSize,
      lineHeight: textSize,
      fontFamily: 'Graphik-Light',
      color
  }),
  screenContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.lightBg,
      paddingHorizontal: 15,
      borderRadius: 8,
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
};

export default QuickSaleAnimation;
