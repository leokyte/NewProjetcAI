import React from 'react';
import { View, Text } from 'react-native';

const CircleBadge = (props) => {
  const { fontSize, textColor, size, backgroundColor, info } = props;
  const { badge, badgeText } = styles;
  const badgeInfo = info ? info.substring(0, 2).toUpperCase() : '';
  return (
    <View style={[badge(size, backgroundColor), props.style]}>
      <Text allowFontScaling={false} style={badgeText(textColor, fontSize)}>
        {badgeInfo}
      </Text>
    </View>
  );
};

const styles = {
  badge: (size, backgroundColor) => ({
    width: size,
    height: size,
    borderRadius: size,
    backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  badgeText: (color, fontSize) => ({
    color,
    fontSize,
    lineHeight: fontSize,
    fontFamily: 'Graphik-Medium',
  })
};

export { CircleBadge };
