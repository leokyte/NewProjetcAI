import React from 'react';
import { View } from 'react-native';

import { KyteIcon } from '../';
import { colors } from '../../../styles';

export const KyteProLabel = ({ style }) => {
  return (
    <View style={{ ...styles.container, ...style }}>
      <KyteIcon name="pro-label" color={colors.primaryDarker} />
    </View>
  );
};

const styles = {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
};
