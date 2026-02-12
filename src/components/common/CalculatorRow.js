import React from 'react';
import { View } from 'react-native';
import { colors } from '../../styles';

// Este é o Component que contém a calculadora inteira

const CalculatorRow = (props) => {
  const { calculatorContainer } = styles;
  return <View style={calculatorContainer}>{props.children}</View>;
};

const styles = {
  calculatorContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.borderColor,
  },
};

export { CalculatorRow };
