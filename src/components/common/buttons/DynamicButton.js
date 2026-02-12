import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { colors } from '../../../styles';

const DynamicButton = (props) => (
  <TouchableOpacity onPress={props.onPress}>
    <View style={styles(
        props.width,
        props.height,
        props.padding,
        props.borderWidth,
        props.borderColor,
        props.justifyContent,
        props.alignItems,
        props.flexDirection,
        props.borderRadius,
        props.marginTop,
        props.marginBottom,
        props.backgroundColor,
    )}>
      {props.children}
    </View>
  </TouchableOpacity>
);

export { DynamicButton };

const styles = (
  width = 'auto',
  height = 'auto',
  paddingHorizontal = 10,
  borderWidth = 2,
  borderColor = colors.borderColor,
  justifyContent = 'center',
  alignItems = 'center',
  flexDirection = 'row',
  borderRadius = 4,
  marginTop,
  marginBottom,
  backgroundColor = 'white',
) => ({
  width,
  height,
  paddingHorizontal,
  borderWidth,
  borderColor,
  justifyContent,
  alignItems,
  flexDirection,
  borderRadius,
  marginTop,
  marginBottom,
  backgroundColor,
});
