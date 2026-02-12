import React from 'react';
import { View, TouchableOpacity } from 'react-native';

const KyteButton = (props) => (
    <TouchableOpacity
      onPress={props.disabled ? null : props.onPress}
      activeOpacity={props.activeOpacity || 0.8}
      {...props.testProps}
    >
      <View
        style={[
          buttonStyles(
            props.height,
            props.width,
            props.background,
            props.borderWidth,
            props.borderColor
          ), props.style
        ]}
      >
        {props.children}
      </View>
    </TouchableOpacity>
  );

const buttonStyles = (height, width, backgroundColor, borderWidth, borderColor) => ({
    height,
    width,
    backgroundColor,
    borderWidth,
    borderColor,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  });

export { KyteButton };
