import React from 'react';
import { View } from 'react-native';

import { KyteLoading } from './../../../../../common';
import { colors } from './../../../../../../styles';

export const LoadingComponent = () => {
  return (
    <View style={[styles.absolute, styles.content]}>
      <View style={[styles.absolute, styles.bg]} />
      <KyteLoading size={30} />
    </View>
  );
};

const styles = {
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bg: {
    backgroundColor: colors.white,
    opacity: 0.5,
  },
};
