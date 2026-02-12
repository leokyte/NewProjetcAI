import React from 'react';
import { View, Text } from 'react-native';
import { KyteIcon, ActionButton } from './';
import { colors, scaffolding } from '../../styles';

const ConnectivityStatus = (props) => (
  <View style={scaffolding.outerContainer}>
    <View style={styles.contentContainer}>
      <KyteIcon
        style={styles.iconStyle}
        size={120}
        name={'no-internet'}
        color={colors.primaryColor}
      />
      <Text style={styles.titleStyle}>{props.title}</Text>
      <Text style={styles.infoStyle}>{props.info}</Text>
    </View>
    <View style={scaffolding.bottomContainer}>
      <ActionButton onPress={props.onPress} cancel>
        {props.buttonIfo}
      </ActionButton>
    </View>
  </View>
);

const styles = {
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconStyle: {
    marginBottom: 30,
  },
  titleStyle: {
    fontFamily: 'Graphik-Medium',
    fontSize: 20,
    color: colors.primaryColor,
    marginBottom: 30,
  },
  infoStyle: {
    fontFamily: 'Graphik-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: colors.primaryColor,
  }
};

export { ConnectivityStatus };
