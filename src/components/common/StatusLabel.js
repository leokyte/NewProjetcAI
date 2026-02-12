import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import { colors } from '../../styles';

const StatusLabel = (props) => {
  const labelBg = () => {
    switch (props.type) {
      case 'warning':
        return colors.warning;
      case 'success':
        return colors.actionColor;
      case 'progress':
        return colors.drawerIcon;
      default:
        return colors.darkGrey;
    }
  };

  const labelColor = () => {
    if (props.type !== 'default') return colors.primaryColor;
    return colors.lightGrey;
  };

  return (
    <TouchableHighlight onPress={props.onPress}>
      <View style={[labelStyle(labelBg()), props.style]}>
        <Text style={textStyle(labelColor())}>{props.children.toUpperCase()}</Text>
      </View>
    </TouchableHighlight>
  );
};

const labelStyle = (backgroundColor) => ({
  alignSelf: 'flex-start',
  backgroundColor,
  borderRadius: 2,
  paddingHorizontal: 8,
  height: 18,
  justifyContent: 'center',
});

const textStyle = (color) => ({
  color,
  fontFamily: 'Graphik-Medium',
  fontSize: 8,
});

export { StatusLabel };
