import React, { useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { colors } from '../../../styles';

interface LoadingBarAnimationProps {
    isGeneratingQRCode: boolean
}

const LoadingBarAnimation = ({ isGeneratingQRCode }: LoadingBarAnimationProps) => {
    const animatedWidth = new Animated.Value(10);
    const animatedPosition = new Animated.Value(0);

    const doAnimation = () => {
        const barWidth = 290;
        const minWidth = 40;
        const maxWidth = 100;
        const duration = 1500;

        if (isGeneratingQRCode) {
            Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(animatedWidth, {
                            toValue: maxWidth,
                            duration,
                            easing: Easing.linear,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animatedPosition, {
                            toValue: barWidth - 30,
                            duration,
                            easing: Easing.linear,
                            useNativeDriver: false,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(animatedWidth, {
                            toValue: minWidth,
                            duration,
                            easing: Easing.linear,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animatedPosition, {
                            toValue: 0,
                            duration,
                            easing: Easing.linear,
                            useNativeDriver: false,
                        }),
                    ]),
                ])
            ).start();
        } else {
            animatedWidth.setValue(10);
            animatedPosition.setValue(0);
        }
    }


    useEffect(() => {
        doAnimation();
    }, [isGeneratingQRCode]);

    return (
        <Animated.View
            style={{
                width: animatedWidth,
                left: animatedPosition,
                position: 'absolute',
                bottom: 0,
                height: 4,
                backgroundColor: colors.actionLighter,
                borderRadius: 2,
            }}
        />
    );
};

export default LoadingBarAnimation;