import React from 'react';
import { View, TouchableNativeFeedback } from 'react-native';

import { colors } from '../../styles';

export const KyteCard = ({
  onPress,
  style,
  height,
  children,
  bgColor = colors.white,
  alignCenter = false,
  ...props
}) => {
  const contentCard = (
    <View
      style={[
        onPress ? styles.button : styles.card,
        height && { height: height },
        alignCenter && styles.center,
        { backgroundColor: bgColor },
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={style} {...props}>
      {onPress ? (
        <TouchableNativeFeedback onPress={onPress}>{contentCard}</TouchableNativeFeedback>
      ) : (
        contentCard
      )}
    </View>
  );
};

const card = {
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingTop: 20,
  paddingBottom: 24,
};
const ELEVATION = 2;

const styles = {
  card: {
    ...card,
  },
  button: {
    ...card,
    elevation: ELEVATION,
    margin: ELEVATION,
  },
  center: {
    alignItems: 'center',
  },
};
