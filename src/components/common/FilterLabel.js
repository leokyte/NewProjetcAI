import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { KyteIcon } from './';
import { colors } from '../../styles';

const FilterLabel = (props) => (
  <TouchableOpacity onPress={props.onPress}>
    <View style={[styles.labelStyle, props.active ? styles.labelActive : null]}>
      <Text style={[styles.labelTxt, props.active ? styles.labelTxtActive : null]}>
        {props.children}
      </Text>
      {props.active ? (
        <KyteIcon name={'close-navigation'} color={'white'} size={10} style={{ marginLeft: 10 }} />
      ) : null}
    </View>
  </TouchableOpacity>
);

const styles = {
  labelStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 5,
    borderColor: colors.lightColor,
    borderWidth: 2,
    borderRadius: 25,
  },
  labelActive: {
    borderColor: colors.actionColor,
    backgroundColor: colors.actionColor,
  },
  labelTxt: {
    fontFamily: 'Graphik-Medium',
    color: colors.lightColor,
    fontSize: 11,
    lineHeight: 11,
  },
  labelTxtActive: {
    color: 'white',
  },
};

export { FilterLabel };
