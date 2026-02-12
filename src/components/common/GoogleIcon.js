import React from 'react';
import { View } from 'react-native';
import { KyteIcon } from './';

const GoogleIcon = (props) => {
  const renderParts = (color, part) => {
    return (
      <KyteIcon style={iconStyle.child} name={`google-${part}`} color={color} size={props.size} />
    );
  };

  return (
    <View style={iconStyle.base}>
      {renderParts('#e33e2b', 'red')}
      {renderParts('#f1b500', 'yellow')}
      {renderParts('#2ba14b', 'green')}
      {renderParts('#3a7cec', 'blue')}
    </View>
  );
};

const iconStyle = {
  base: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  child: {
    position: 'absolute',
  },
};

export { GoogleIcon };
