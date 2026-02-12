import React from 'react';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icoMoonConfig from '../../../icons.json';
import { defaultTextColor } from '../../styles';

const KyteIcon = (props) => {
  const Icon = createIconSetFromIcoMoon(icoMoonConfig);
  return (
    <Icon
      name={props.name}
      size={props.size || 20}
      color={props.color || defaultTextColor}
      style={props.style}
      onPress={props.onPress}
      {...props.testProps}
    />
  );
};

export { KyteIcon };
