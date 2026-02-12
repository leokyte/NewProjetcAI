import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { KyteIcon } from ".";
import { Type } from '../../styles';

const Tag = (props) => {
  const renderInfo = () => (
      <Text
        style={[Type.Medium, textDefaulfts(props.color, props.icon ? 10 : 0)]}
        ellipsizeMode='tail'
        numberOfLines={1}
      >
        {props.info}
      </Text>
    );

  const renderIcon = () => <KyteIcon style={props.iconLeft ? { marginRight: 5 } : null} name={props.icon} color={props.color} size={14} />;

  return (
    <TouchableOpacity onPress={props.onPress} activeOpacity={0.8} {...props.testProps}>
      <View style={[tagDefaults(props.background, props.color, props.padding || 5), props.style]}>
        {props.icon && props.iconLeft ? renderIcon() : null}
        {props.info ? renderInfo() : null}
        {props.icon && !props.iconLeft ? renderIcon() : null}
      </View>
    </TouchableOpacity>
  );
};

const borderWidth = 1.5;
const paddingVertical = 1;

const tagDefaults = (backgroundColor, borderColor, padding) => ({
    backgroundColor: backgroundColor || 'transparent',
    borderColor: backgroundColor ? 'transparent' : borderColor,
    borderRadius: 3,
    borderWidth,
    paddingHorizontal: padding,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        paddingVertical: backgroundColor ? paddingVertical + borderWidth : paddingVertical,
        borderWidth,
      }
    })
  });

const textDefaulfts = (color, marginRight) => ({
    color,
    fontSize: 13,
    position: 'relative',
    top: (Platform.OS === 'ios') ? 1 : -1,
    marginRight,
    maxWidth: 85,
    ...Platform.select({
      android: {
        fontSize: 12,
      },
    }),
  });

export { Tag };
