import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Type, colors } from '../../styles';
import { KyteIcon } from './';

const CustomerOrderTag = (props) => {
  const { container, customerText, iconStyle } = styles;

  const renderCustomerIcon = () => {
    return (
      <KyteIcon
        size={props.iconSize || 14}
        name={props.icon || 'person'}
        color={props.iconColor || colors.secondaryBg}
        style={iconStyle}
      />
    );
  };
  const renderCustomerText = () => {
    return (
      <Text
        style={[customerText, { color: props.textColor || colors.secondaryBg }, props.textStyle]}
        numberOfLines={1}
      >
        {props.text}
      </Text>
    );
  };

  return (
    <View style={[container, props.style]}>
      {renderCustomerIcon()}
      {renderCustomerText()}
    </View>
  );
};

const styles = {
  container: {
    maxWidth: 70,
    height: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  customerText: [Type.Medium, Type.fontSize(12), { paddingLeft: 4 }],
  iconStyle: {
    position: 'relative',
    ...Platform.select({ ios: { top: -2 } }),
  },
};

export { CustomerOrderTag };
