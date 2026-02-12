import React from 'react';
import { View } from 'react-native';
import { colors } from '../../styles';

const CenterContent = (props) => (
  <View
    style={[
      style(
        props.backgroundColor,
        props.pallete,
        props.flexDirection,
        props.justifyContent,
        props.alignItems,
      ),
      props.style,
    ]}
  >
    {props.children}
  </View>
);

const style = (
  backgroundColor = 'transparent',
  pallete,
  flexDirection = 'column',
  justifyContent = 'center',
  alignItems = 'center',
) => ({
  flex: 1,
  backgroundColor: pallete ? colors[pallete] : backgroundColor,
  justifyContent,
  alignItems,
  flexDirection,
});

export { CenterContent };
