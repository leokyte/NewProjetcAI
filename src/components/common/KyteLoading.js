import React from 'react';
import { Animated, Easing } from 'react-native';
import { colors } from '../../styles';

class KyteLoading extends React.PureComponent {
  render() {
    const { size, color, duration } = this.props;

    //
    // Animation block
    //

    const spinValue = new Animated.Value(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: duration || 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    //
    // Style block
    //

    const loadingSize = size || 15;
    const borderWidth = loadingSize / 5;

    const style = {
      borderWidth,
      borderColor: '#f3f3f3',
      borderTopWidth: borderWidth,
      borderTopColor: color || colors.actionColor,
      borderRadius: 50,
      width: loadingSize,
      height: loadingSize,
      transform: [{ rotate: spin }],
    };

    return <Animated.View style={style} />;
  }
}

export { KyteLoading };
