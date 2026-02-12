import React, { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors as colorsUI } from '@kyteapp/kyte-ui-components';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface PixAnimationProps {
    size?: number;
}

const PixAnimation = ({ size = 22 }: PixAnimationProps) => {
    const [animation] = useState(new Animated.Value(0));

    const doAnimation = () => {
        Animated.loop(
            Animated.timing(animation, {
                toValue: 1,
                duration: 6000,
                easing: Easing.linear,
                useNativeDriver: false,
            })
        ).start();
    }

    const topColor = animation.interpolate({
        inputRange: [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1],
        outputRange: [
            colorsUI.green00,
            colorsUI.green07,
            colorsUI.green07,
            colorsUI.green07,
            colorsUI.green00,
            colorsUI.green00,
            colorsUI.green00,
        ],
    });
    
    const middleColor = animation.interpolate({
        inputRange: [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1],
        outputRange: [
            colorsUI.green00,
            colorsUI.green00,
            colorsUI.green07,
            colorsUI.green07,
            colorsUI.green07,
            colorsUI.green00,
            colorsUI.green00,
        ],
    });
    
    const bottomColor = animation.interpolate({
        inputRange: [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1],
        outputRange: [
            colorsUI.green00,
            colorsUI.green00,
            colorsUI.green00,
            colorsUI.green07,
            colorsUI.green07,
            colorsUI.green07,
            colorsUI.green00,
        ],
    });

    useEffect(() => {
        doAnimation();
    }, []);

    return (
        <View>
            <Svg width={size} height={size} viewBox="0 0 48 48">
                {/* Top */}
                <AnimatedPath fill={topColor} d="M11.9,12h-0.68l8.04-8.04c2.62-2.61,6.86-2.61,9.48,0L36.78,12H36.1c-1.6,0-3.11,0.62-4.24,1.76l-6.8,6.77c-0.59,0.59-1.53,0.59-2.12,0l-6.8-6.77C15.01,12.62,13.5,12,11.9,12z"/>
                {/* Bottom */}
                <AnimatedPath fill={bottomColor} d="M36.1,36h0.68l-8.04,8.04c-2.62,2.61-6.86,2.61-9.48,0L11.22,36h0.68c1.6,0,3.11-0.62,4.24-1.76l6.8-6.77c0.59-0.59,1.53-0.59,2.12,0l6.8,6.77C32.99,35.38,34.5,36,36.1,36z"/>
                {/* Middle */}
                <AnimatedPath fill={middleColor} d="M44.04,28.74L38.78,34H36.1c-1.07,0-2.07-0.42-2.83-1.17l-6.8-6.78c-1.36-1.36-3.58-1.36-4.94,0l-6.8,6.78C13.97,33.58,12.97,34,11.9,34H9.22l-5.26-5.26c-2.61-2.62-2.61-6.86,0-9.48L9.22,14h2.68c1.07,0,2.07,0.42,2.83,1.17l6.8,6.78c0.68,0.68,1.58,1.02,2.47,1.02s1.79-0.34,2.47-1.02l6.8-6.78C34.03,14.42,35.03,14,36.1,14h2.68l5.26,5.26C46.65,21.88,46.65,26.12,44.04,28.74z"/>
            </Svg>
        </View>
    );
};

export default PixAnimation;
