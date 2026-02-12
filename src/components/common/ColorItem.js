import { KyteIcon } from '@kyteapp/kyte-ui-components';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View } from 'react-native-animatable';

const ColorItem = (props) => (
  <TouchableOpacity
    onPress={() => props.onPress(props.itemColor)}
    activeOpacity={0.8}
    style={[itemStyle, { backgroundColor: props.itemColor, height: props.itemHeight }, props.style]}
  >
    {props.isActive && <View style={itemStyle.iconArea}><KyteIcon name='check' size={12} color={props?.iconColor ? props?.iconColor : "#FFF"} /></View>}
  </TouchableOpacity>
);

const itemStyle = {
  width: '33.33%',
  iconArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }

};

export { ColorItem };
