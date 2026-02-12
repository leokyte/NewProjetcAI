import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { colors } from '../../styles';

const TextButton = (props) => {
  const disabledColor = props.disabled ? colors.lightColor : null;
  return (
    <TouchableOpacity
      onPress={!props.disabled ? props.onPress : null}
      activeOpacity={0.8}
      {...props.testProps}
    >
      <Text
        allowFontScaling={false}
        style={[
          textStyle(
            props.size,
            disabledColor || props.color,
            props.noPadding ? 0 : 10,
            props.weight,
          ),
          props.style,
        ]}
      >
        {props.title || props.children}
      </Text>
    </TouchableOpacity>
  );
};

const textStyle = (fontSize, color, paddingVertical, weight = 'Regular') => {
  return {
    fontSize,
    color,
    paddingVertical,
    fontFamily: `Graphik-${weight}`,
  };
};

export { TextButton };
