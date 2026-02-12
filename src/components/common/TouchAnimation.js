import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

const TouchAnimation = ({ size, color }) => {
  const animateSize = useRef(new Animated.Value(0.5)).current;
  const animateBorder = useRef(new Animated.Value(size / 2)).current;
  const animationTiming = 300;
  const animationDelay = 900;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.delay(animationDelay),
        Animated.timing(animateSize, {
          toValue: 1.2,
          duration: animationTiming,
          easing: Easing.easeOutQuint,
        }),
        Animated.timing(animateBorder, {
          toValue: 0,
          duration: animationTiming,
          easing: Easing.easeOutQuint,
        }),
      ]),
    ).start();
  }, [animateSize, animateBorder, size]);

  return (
    <Animated.View
      style={{
        ...styles(size, color),
        transform: [{ scale: animateSize }],
        borderWidth: animateBorder,
      }}
    ></Animated.View>
  );
};

export { TouchAnimation };

const styles = (size = 30, color) => ({
  width: size,
  height: size,
  borderRadius: (size / 2),
  borderColor: color,
});
