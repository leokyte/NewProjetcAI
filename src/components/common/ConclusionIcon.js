import React from 'react';
import { View } from 'react-native';
import { KyteIcon } from './';
import { colors } from '../../styles';

const ConclusionIcon = (props) => {
  const renderParts = (color, part) => {
    return <KyteIcon style={iconStyle.child} color={color} name={part} size={props.size} />;
  };

  return (
    <View style={iconStyle.base}>
      {props.withoutCircle ? null : renderParts('#eee', `${props.type}-circle`)}
      {renderParts(colors.actionColor, `${props.type}-inner`)}
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

export { ConclusionIcon };
