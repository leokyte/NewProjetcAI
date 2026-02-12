import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/';

const CalculatorButton = (props) => {
  const { buttonStyles, fonstStyle } = styles;
  const renderContent = () => {
    if (!props.buttonIcon) {
      return (
        <Text
          allowFontScaling={false}
          style={[
            fonstStyle(props.disablePress ? colors.lighterColor : null),
            props.disablePress ? {} : props.buttonColor,
          ]}
        >
          {props.children}
        </Text>
      );
    }
    return props.children;
  };
  return (
    <TouchableOpacity
      style={[buttonStyles, props.style]}
      onPress={props.disabled ? null : props.onPress}
      activeOpacity={0.8}
      {...props.testProps}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = {
  buttonStyles: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  fonstStyle: (color = colors.primaryColor) => ({
    fontSize: 26,
    fontFamily: 'Graphik-Regular',
    color,
  }),
};

export { CalculatorButton };
